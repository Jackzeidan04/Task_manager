using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using user.Data;
using user.DTOs;
using user.Model;
using user.Services;
using BCrypt.Net;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly MongoDbContext _context;
    private readonly IJwtService _jwtService;

    public UsersController(MongoDbContext context, IJwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }

    // GET /api/users - Get all users
    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetUsers([FromQuery] string search = "", [FromQuery] string role = "")
    {
        try
        {
            var filter = Builders<User>.Filter.Empty;

            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchPattern = new BsonRegularExpression(search, "i");
                filter = Builders<User>.Filter.Or(
                    Builders<User>.Filter.Regex(u => u.Username, searchPattern),
                    Builders<User>.Filter.Regex(u => u.Email, searchPattern)
                );
            }

            if (!string.IsNullOrWhiteSpace(role))
            {
                filter = Builders<User>.Filter.And(
                    filter,
                    Builders<User>.Filter.Eq(u => u.Role, role)
                );
            }

            var users = await _context.Users.Find(filter).ToListAsync();

            var response = users.Select(u => new UserResponseDto
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
                Role = u.Role
            }).ToList();

            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest($"Error: {ex.Message}");
        }
    }


    [HttpGet("roles")]
    [Authorize]
    public async Task<IActionResult> GetRoles()
    {
        try
        {
            var pipeline = new[]
            {
                new BsonDocument("$group", new BsonDocument("_id", "$role"))
            };

            var roles = await _context.Users.Aggregate<BsonDocument>(pipeline)
                .ToListAsync();

            var roleList = roles.Where(r => r["_id"] != BsonNull.Value)
                .Select(r => r["_id"].AsString)
                .ToList();

            return Ok(roleList);
        }
        catch (Exception ex)
        {
            return BadRequest($"Error: {ex.Message}");
        }
    }


    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterUserDto dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.Username) ||
                string.IsNullOrWhiteSpace(dto.Email) ||
                string.IsNullOrWhiteSpace(dto.Password))
            {
                return BadRequest("Username, email, and password are required.");
            }

            var existingUser = await _context.Users
                .Find(Builders<User>.Filter.Eq(u => u.Email, dto.Email))
                .FirstOrDefaultAsync();

            if (existingUser != null)
                return BadRequest("A user with this email already exists.");

            var user = new User
            {
                Username = dto.Username,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = dto.Role ?? "User"
            };

            await _context.Users.InsertOneAsync(user);

            var token = _jwtService.GenerateToken(user.Id, user.Username, user.Email, user.Role);

            return Ok(new LoginResponseDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role,
                Token = token
            });
        }
        catch (Exception ex)
        {
            return BadRequest($"Error: {ex.Message}");
        }
    }


    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
                return BadRequest("Email and password are required.");

            var user = await _context.Users
                .Find(Builders<User>.Filter.Eq(u => u.Email, dto.Email))
                .FirstOrDefaultAsync();

            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return Unauthorized("Invalid email or password.");

            var token = _jwtService.GenerateToken(user.Id, user.Username, user.Email, user.Role);

            return Ok(new LoginResponseDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role,
                Token = token
            });
        }
        catch (Exception ex)
        {
            return BadRequest($"Error: {ex.Message}");
        }
    }


    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserDto dto)
    {
        try
        {
            if (!ObjectId.TryParse(id, out var objectId))
                return BadRequest("Invalid user ID format.");

            var user = await _context.Users
                .Find(Builders<User>.Filter.Eq(u => u.Id, id))
                .FirstOrDefaultAsync();

            if (user == null)
                return NotFound($"User with id {id} not found.");

            var currentUserRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

            if (dto.Role != user.Role && currentUserRole != "Admin")
                return Forbid("Only admins can change user roles.");

            if (string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrWhiteSpace(dto.Email))
                return BadRequest("Username and email are required.");

            var emailTaken = await _context.Users
                .Find(Builders<User>.Filter.And(
                    Builders<User>.Filter.Eq(u => u.Email, dto.Email),
                    Builders<User>.Filter.Ne(u => u.Id, id)
                ))
                .AnyAsync();

            if (emailTaken)
                return BadRequest("Another user already uses this email.");

            var update = Builders<User>.Update
                .Set(u => u.Username, dto.Username)
                .Set(u => u.Email, dto.Email)
                .Set(u => u.Role, dto.Role ?? user.Role);

            await _context.Users.UpdateOneAsync(
                Builders<User>.Filter.Eq(u => u.Id, id),
                update
            );

            return Ok(new UserResponseDto
            {
                Id = user.Id,
                Username = dto.Username,
                Email = dto.Email,
                Role = dto.Role ?? user.Role
            });
        }
        catch (Exception ex)
        {
            return BadRequest($"Error: {ex.Message}");
        }
    }

    // DELETE /api/users/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        try
        {
            if (!ObjectId.TryParse(id, out var objectId))
                return BadRequest("Invalid user ID format.");

            var user = await _context.Users
                .Find(Builders<User>.Filter.Eq(u => u.Id, id))
                .FirstOrDefaultAsync();

            if (user == null)
                return NotFound($"User with id {id} not found.");

            await _context.Users.DeleteOneAsync(
                Builders<User>.Filter.Eq(u => u.Id, id)
            );

            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest($"Error: {ex.Message}");
        }
    }
}