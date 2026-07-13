using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using user.Data;
using user.DTOs;
using user.Model;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly MongoDbContext _context;

    public TasksController(MongoDbContext context)
    {
        _context = context;
    }

    private string GetCurrentUserId()
    {
        return User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    }

    // GET /api/tasks
    [HttpGet]
    public async Task<IActionResult> GetTasks([FromQuery] string status = "")
    {
        try
        {
            var userId = GetCurrentUserId();
            var filter = Builders<UserTask>.Filter.Eq(t => t.UserId, userId);

            if (!string.IsNullOrWhiteSpace(status))
            {
                filter = Builders<UserTask>.Filter.And(
                    filter,
                    Builders<UserTask>.Filter.Eq(t => t.Status, status)
                );
            }

            var tasks = await _context.Tasks
                .Find(filter)
                .SortByDescending(t => t.CreatedAt)
                .ToListAsync();

            var response = tasks.Select(t => new TaskResponseDto
            {
                Id = t.Id,
                UserId = t.UserId,
                Title = t.Title,
                Description = t.Description,
                Status = t.Status,
                Priority = t.Priority,
                DueDate = t.DueDate,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt
            }).ToList();

            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest($"Error: {ex.Message}");
        }
    }

    // POST /api/tasks
    [HttpPost]
    public async Task<IActionResult> CreateTask([FromBody] CreateTaskDto dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.Title))
                return BadRequest("Title is required.");

            var userId = GetCurrentUserId();

            var task = new UserTask
            {
                UserId = userId,
                Title = dto.Title,
                Description = dto.Description,
                Status = dto.Status,
                Priority = dto.Priority,
                DueDate = dto.DueDate
            };

            await _context.Tasks.InsertOneAsync(task);

            return Ok(new TaskResponseDto
            {
                Id = task.Id,
                UserId = task.UserId,
                Title = task.Title,
                Description = task.Description,
                Status = task.Status,
                Priority = task.Priority,
                DueDate = task.DueDate,
                CreatedAt = task.CreatedAt,
                UpdatedAt = task.UpdatedAt
            });
        }
        catch (Exception ex)
        {
            return BadRequest($"Error: {ex.Message}");
        }
    }

    // PUT /api/tasks/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTask(string id, [FromBody] UpdateTaskDto dto)
    {
        try
        {
            if (!ObjectId.TryParse(id, out _))
                return BadRequest("Invalid task ID format.");

            var userId = GetCurrentUserId();

            var task = await _context.Tasks
                .Find(Builders<UserTask>.Filter.Eq(t => t.Id, id))
                .FirstOrDefaultAsync();

            if (task == null)
                return NotFound("Task not found.");

            if (task.UserId != userId)
                return Forbid("You can only update your own tasks.");

            var update = Builders<UserTask>.Update
                .Set(t => t.Title, dto.Title)
                .Set(t => t.Description, dto.Description)
                .Set(t => t.Status, dto.Status)
                .Set(t => t.Priority, dto.Priority)
                .Set(t => t.DueDate, dto.DueDate)
                .Set(t => t.UpdatedAt, DateTime.UtcNow);

            await _context.Tasks.UpdateOneAsync(
                Builders<UserTask>.Filter.Eq(t => t.Id, id),
                update
            );

            return Ok("Task updated successfully");
        }
        catch (Exception ex)
        {
            return BadRequest($"Error: {ex.Message}");
        }
    }

    // DELETE /api/tasks/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(string id)
    {
        try
        {
            if (!ObjectId.TryParse(id, out _))
                return BadRequest("Invalid task ID format.");

            var userId = GetCurrentUserId();

            var task = await _context.Tasks
                .Find(Builders<UserTask>.Filter.Eq(t => t.Id, id))
                .FirstOrDefaultAsync();

            if (task == null)
                return NotFound("Task not found.");

            if (task.UserId != userId)
                return Forbid("You can only delete your own tasks.");

            await _context.Tasks.DeleteOneAsync(
                Builders<UserTask>.Filter.Eq(t => t.Id, id)
            );

            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest($"Error: {ex.Message}");
        }
    }
}