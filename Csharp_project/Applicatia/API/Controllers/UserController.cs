using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using API.Data;
using API.Entities;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Security.Claims; // Added
using System.Threading.Tasks; // Added
using System.IdentityModel.Tokens.Jwt;

namespace API.Controllers
{
    [ApiController]
    [Route("/register")]
    public class UserController : ControllerBase
    {
        private readonly MongoDbService _mongoDbService;

        public UserController(MongoDbService mongoDbService)
        {
            _mongoDbService = mongoDbService;
        }

        public User DecodeTokenToUser(string token)
        {
            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(token);

            return new User
            {
                Id = jwtToken.Claims.First(c => c.Type == ClaimTypes.NameIdentifier).Value,
                Email = jwtToken.Claims.First(c => c.Type == ClaimTypes.Email).Value,
                UserName = jwtToken.Claims.First(c => c.Type == ClaimTypes.Name).Value,
                Role = jwtToken.Claims.First(c => c.Type == ClaimTypes.Role).Value,
                CreatedAt = DateTime.Parse(jwtToken.Claims.First(c => c.Type == "createdAt").Value)
            };
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            if (!ObjectId.TryParse(id, out var objectId))
                return BadRequest("Invalid ID format.");

            var collection = _mongoDbService.Database.GetCollection<User>("users");
            var filter = Builders<User>.Filter.Eq(u => u.Id, id);
            var result = await collection.DeleteOneAsync(filter);

            return result.DeletedCount > 0 ? NoContent() : NotFound();
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(string id)
        {
            if (!ObjectId.TryParse(id, out var objectId))
                return BadRequest("Invalid ID format.");

            var users = await _mongoDbService.GetAllUsersAsync();
            var user = users.FirstOrDefault(u => u.Id == id);

            return user == null ? NotFound() : Ok(user);
        }

        [HttpGet("/register/profile")]
        [Authorize]
        public IActionResult GetUserProfile()
        {
            var user = new User
            {
                Id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty,
                UserName = User.FindFirst(ClaimTypes.Name)?.Value ?? string.Empty,
                Email = User.FindFirst(ClaimTypes.Email)?.Value ?? string.Empty,
                Role = User.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty,
                Password = string.Empty, // Required, but set to empty
                CreatedAt = DateTime.TryParse(User.FindFirst("createdAt")?.Value, out var createdAt)
                            ? createdAt
                            : DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            return Ok(new
            {
                user.Id,
                user.Email,
                user.UserName,
                user.Role,
                user.CreatedAt
            });
        }

        [HttpDelete("/register/profile")]
        [Authorize]
        public async Task<IActionResult> DeleteProfile()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("Invalid user");
                }

                // Delete user's products if they are a seller
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                if (userRole == "vanzator")
                {
                    await _mongoDbService.DeleteProductsBySellerAsync(userId);
                }

                // Delete user's orders
                await _mongoDbService.DeleteOrdersByCustomerAsync(userId);

                // Delete the user
                var userDeleted = await _mongoDbService.DeleteUserAsync(userId);

                if (userDeleted)
                {
                    return Ok(new { message = "Profile deleted successfully" });
                }
                else
                {
                    return NotFound("User not found");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting profile: {ex.Message}");
                return StatusCode(500, "Error deleting profile");
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] User user)
        {
            if (user == null)
                return BadRequest("User cannot be null.");

            var existingUser = await _mongoDbService.Database
                .GetCollection<User>("users")
                .Find(Builders<User>.Filter.Or(
                    Builders<User>.Filter.Eq(u => u.UserName, user.UserName),
                    Builders<User>.Filter.Eq(u => u.Email, user.Email)
                ))
                .FirstOrDefaultAsync();

            if (existingUser != null)
                return Conflict("User already exists");

            user.CreatedAt = DateTime.UtcNow;
            user.UpdatedAt = DateTime.UtcNow;

            await _mongoDbService.CreateUserAsync(user);
            return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, user);
        }
    }
}