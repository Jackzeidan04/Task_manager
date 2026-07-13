using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace user.Services;

public interface IJwtService
{
    string GenerateToken(string userId, string username, string email, string role);
}

public class JwtService : IJwtService
{
    private readonly IConfiguration _configuration;

    public JwtService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateToken(string userId, string username, string email, string role)
    {
        var jwtSecret = _configuration["Jwt:Secret"];
        if (string.IsNullOrEmpty(jwtSecret))
            throw new InvalidOperationException("JWT Secret is not configured");

        var jwtIssuer = _configuration["Jwt:Issuer"] ?? "YourApp";
        var jwtAudience = _configuration["Jwt:Audience"] ?? "YourAppUsers";
        var jwtExpirationMinutes = int.Parse(_configuration["Jwt:ExpirationMinutes"] ?? "60");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId ?? ""),
            new Claim(ClaimTypes.Name, username ?? ""),
            new Claim(ClaimTypes.Email, email ?? ""),
            new Claim(ClaimTypes.Role, role ?? "User")
        };

        var token = new JwtSecurityToken(
            issuer: jwtIssuer,
            audience: jwtAudience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(jwtExpirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}