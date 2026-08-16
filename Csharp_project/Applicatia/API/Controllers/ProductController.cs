using Microsoft.AspNetCore.Mvc;
using API.Entities;
using MongoDB.Driver;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using API.Data;

namespace API.Controllers
{
    [Route("/product")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly IMongoCollection<Product> _products;
        private readonly MongoDbService _mongoDbService;

        public ProductsController(IMongoDatabase database, MongoDbService mongoDbService)
        {
            _products = database.GetCollection<Product>("products");
            _mongoDbService = mongoDbService;
        }

        [HttpPost]
        [Authorize(Roles = "vanzator")]
        public async Task<IActionResult> CreateProduct([FromForm] ProductCreateDto productDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // Salvare imagine pe server
            Console.WriteLine(productDto.Poza.ToString());
            var imagePath = await SaveImage(productDto.Poza);

            Console.WriteLine(imagePath);
            var product = new Product
            {
                Nume = productDto.Nume,
                Descriere = productDto.Descriere ?? string.Empty,
                Culoare = productDto.Culoare,
                Categorie = productDto.Categorie,
                Price = productDto.Price,
                PozaURL = imagePath,
                VanzatorId = userId!,
                Stock = productDto.Stock
            };

            await _products.InsertOneAsync(product);

            return Ok(product);
        }

        [HttpGet("my-products")]
        [Authorize(Roles = "vanzator")]
        public async Task<IActionResult> GetMyProducts()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("Invalid user");
            }

            try
            {
                var products = await _mongoDbService.GetProductsBySellerAsync(userId);
                Console.WriteLine($"GetMyProducts: Fetched {products.Count} products for user {userId}");
                if (products.Count > 0)
                {
                    var firstProduct = products[0];
                    Console.WriteLine($"MyProducts - First product: {firstProduct.Nume}");
                    Console.WriteLine($"MyProducts - Description field: '{firstProduct.Descriere}'");
                    Console.WriteLine($"MyProducts - Description is null? {firstProduct.Descriere == null}");
                    Console.WriteLine($"MyProducts - Description is empty? {string.IsNullOrEmpty(firstProduct.Descriere)}");
                }
                return Ok(products);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching products: {ex.Message}");
                return StatusCode(500, "Error fetching products");
            }
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllProducts()
        {
            try
            {
                var products = await _mongoDbService.GetAllProductsAsync();
                Console.WriteLine($"Fetched {products.Count} products from database");
                return Ok(products);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching all products: {ex.Message}");
                return StatusCode(500, "Error fetching products");
            }
        }

        [HttpGet("newest")]
        public async Task<IActionResult> GetNewestProducts([FromQuery] int count = 10)
        {
            try
            {
                var products = await _mongoDbService.GetNewestProductsAsync(count);
                Console.WriteLine($"Fetched {products.Count} newest products from database");
                if (products.Count > 0)
                {
                    Console.WriteLine($"First newest product: {products[0].Nume}, Description: '{products[0].Descriere}'");
                }
                return Ok(products);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching newest products: {ex.Message}");
                return StatusCode(500, "Error fetching products");
            }
        }

        [HttpPatch("{id}/stock")]
        [Authorize(Roles = "vanzator")]
        public async Task<IActionResult> UpdateProductStock(string id, [FromBody] UpdateStockDto stockDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("Invalid user");
            }

            try
            {
                // Verify product ownership
                var filter = Builders<Product>.Filter.Eq(p => p.Id, id);
                var product = await _products.Find(filter).FirstOrDefaultAsync();

                if (product == null)
                {
                    return NotFound("Product not found");
                }

                if (product.VanzatorId != userId)
                {
                    return Forbid("You can only update stock for your own products");
                }

                var success = await _mongoDbService.UpdateProductStockAsync(id, stockDto.Stock);
                
                if (success)
                {
                    return Ok(new { message = "Stock updated successfully", newStock = stockDto.Stock });
                }
                else
                {
                    return BadRequest("Failed to update stock");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating stock: {ex.Message}");
                return StatusCode(500, "Error updating stock");
            }
        }

        [HttpPost("set-default-stock")]
        [Authorize(Roles = "vanzator")]
        public async Task<IActionResult> SetDefaultStock([FromBody] SetDefaultStockDto defaultStockDto)
        {
            try
            {
                var success = await _mongoDbService.SetDefaultStockForExistingProductsAsync(defaultStockDto.DefaultStock);
                return Ok(new { message = $"Default stock set to {defaultStockDto.DefaultStock} for existing products" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error setting default stock: {ex.Message}");
                return StatusCode(500, "Error setting default stock");
            }
        }

        [HttpPost("set-default-description")]
        [Authorize(Roles = "vanzator")]
        public async Task<IActionResult> SetDefaultDescription([FromBody] SetDefaultDescriptionDto defaultDescriptionDto)
        {
            try
            {
                var success = await _mongoDbService.SetDefaultDescriptionForExistingProductsAsync(defaultDescriptionDto.DefaultDescription);
                return Ok(new { message = $"Default description set for existing products without descriptions" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error setting default description: {ex.Message}");
                return StatusCode(500, "Error setting default description");
            }
        }

        [HttpPost("force-set-descriptions")]
        public async Task<IActionResult> ForceSetDescriptions()
        {
            try
            {
                var success = await _mongoDbService.SetDefaultDescriptionForExistingProductsAsync("Beautiful flowers, arranged with care by our florists. Perfect for any special occasion.");
                return Ok(new { message = "Default descriptions set for all products without descriptions" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error setting default description: {ex.Message}");
                return StatusCode(500, "Error setting default description");
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "vanzator")]
        public async Task<IActionResult> DeleteProduct(string id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("Invalid user");
            }

            try
            {
                // First, get the product to verify ownership
                var filter = Builders<Product>.Filter.Eq(p => p.Id, id);
                var product = await _products.Find(filter).FirstOrDefaultAsync();

                if (product == null)
                {
                    return NotFound("Product not found");
                }

                // Check if the user owns this product
                if (product.VanzatorId != userId)
                {
                    return Forbid("You can only delete your own products");
                }

                // Delete the product
                var deleteResult = await _products.DeleteOneAsync(filter);

                if (deleteResult.DeletedCount == 0)
                {
                    return NotFound("Product not found");
                }

                // Optionally delete the image file from server
                if (!string.IsNullOrEmpty(product.PozaURL))
                {
                    var imagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", product.PozaURL.TrimStart('/'));
                    if (System.IO.File.Exists(imagePath))
                    {
                        System.IO.File.Delete(imagePath);
                    }
                }

                return Ok(new { message = "Product deleted successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting product: {ex.Message}");
                return StatusCode(500, "Error deleting product");
            }
        }

        [HttpPost("test-set-description/{id}")]
        [Authorize(Roles = "vanzator")]
        public async Task<IActionResult> TestSetDescription(string id, [FromBody] string description)
        {
            try
            {
                var filter = Builders<Product>.Filter.Eq(p => p.Id, id);
                var update = Builders<Product>.Update.Set(p => p.Descriere, description);
                
                var result = await _products.UpdateOneAsync(filter, update);
                
                if (result.ModifiedCount > 0)
                {
                    return Ok(new { message = $"Description set to: {description}" });
                }
                else
                {
                    return NotFound("Product not found");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error setting description: {ex.Message}");
                return StatusCode(500, "Error setting description");
            }
        }

        private async Task<string> SaveImage(IFormFile imageFile)
        {
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = Guid.NewGuid().ToString() + "_" + imageFile.FileName;
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await imageFile.CopyToAsync(fileStream);
            }

            return $"/uploads/{uniqueFileName}";
        }
    }

    public class ProductCreateDto
    {
        public required string Nume { get; set; }
        public required string Culoare { get; set; }
        public required List<string> Categorie { get; set; }

        public required float Price { get; set; }
        public required IFormFile Poza { get; set; }
        public int Stock { get; set; } = 100;
        public string Descriere { get; set; }
    }

    public class UpdateStockDto
    {
        public int Stock { get; set; }
    }

    public class SetDefaultStockDto
    {
        public int DefaultStock { get; set; }
    }

    public class SetDefaultDescriptionDto
    {
        public required string DefaultDescription { get; set; }
    }
}