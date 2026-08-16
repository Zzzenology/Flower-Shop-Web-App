using Microsoft.AspNetCore.Mvc;
using API.Data;
using API.Entities;
using MongoDB.Driver;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace API.Controllers
{

    [ApiController]
    [Route("/login")]
    public class LoginController : ControllerBase
    {
        private readonly MongoDbService _mongoDbService;
        public readonly IConfiguration _configuration;

        public LoginController(MongoDbService mongoDbService, IConfiguration configuration)
        {
            _mongoDbService = mongoDbService;
            _configuration = configuration;
        }


        // [HttpGet]
        // public async Task<IActionResult> GetAllUsers()
        // {
        //     var users = await _mongoDbService.GetAllUsersAsync();
        //     return Ok(users);
        // }


        // [HttpGet("{id}")]
        // public async Task<IActionResult> GetUserById(string id)
        // {
        //     if (!ObjectId.TryParse(id, out var objectId))
        //         return BadRequest("Invalid ID format.");

        //     var users = await _mongoDbService.GetAllUsersAsync();
        //     var user = users.FirstOrDefault(u => u.Id == id);

        //     return user == null ? NotFound() : Ok(user);
        // }

        // [HttpPut("{id}")]
        // public async Task<IActionResult> UpdateUser(string id, [FromBody] User updatedUser)
        // {
        //     if (!ObjectId.TryParse(id, out var objectId))
        //         return BadRequest("Invalid ID format.");

        //     var users = await _mongoDbService.GetAllUsersAsync();
        //     var existingUser = users.FirstOrDefault(u => u.Id == id);
        //     if (existingUser == null)
        //         return NotFound();

        //     existingUser.UserName = updatedUser.UserName;
        //     existingUser.Password = updatedUser.Password;
        //     existingUser.Email = updatedUser.Email;
        //     existingUser.Role = updatedUser.Role;
        //     existingUser.UpdatedAt = DateTime.UtcNow;

        //     var collection = _mongoDbService.Database.GetCollection<User>("Users");
        //     var filter = Builders<User>.Filter.Eq(u => u.Id, id);
        //     await collection.ReplaceOneAsync(filter, existingUser);

        //     return NoContent();
        // }


        // [HttpDelete("{id}")]
        // public async Task<IActionResult> DeleteUser(string id)
        // {
        //     if (!ObjectId.TryParse(id, out var objectId))
        //         return BadRequest("Invalid ID format.");

        //     var collection = _mongoDbService.Database.GetCollection<User>("users");
        //     var filter = Builders<User>.Filter.Eq(u => u.Id, id);
        //     var result = await collection.DeleteOneAsync(filter);

        //     return result.DeletedCount > 0 ? NoContent() : NotFound();
        // }


        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings").Get<JwtSettings>();
#pragma warning disable CS8602 // Dereference of a possibly null reference.
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SecretKey));
#pragma warning restore CS8602 // Dereference of a possibly null reference.

            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
        new Claim(JwtRegisteredClaimNames.Sub, user.Id),
        new Claim(JwtRegisteredClaimNames.Email, user.Email),
        new Claim(ClaimTypes.Role, user.Role),
    };

            var token = new JwtSecurityToken(
                issuer: jwtSettings.Issuer,
                audience: jwtSettings.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(jwtSettings.ExpiryMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }


        [HttpPost]
        public async Task<IActionResult> Login([FromBody] LoginRequest loginRequest)
        {
            var collection = _mongoDbService.Database.GetCollection<User>("users");
            var user = await collection.Find(u => u.Email == loginRequest.Email && u.Password == loginRequest.Password).FirstOrDefaultAsync();

            if (user == null)
            {
                return Unauthorized("Invalid email or password.");
            }

            var token = GenerateJwtToken(user);
            return Ok(new { token });
        }

    }
}
