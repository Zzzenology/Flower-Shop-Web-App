using Microsoft.AspNetCore.Mvc;
using API.Entities;
using MongoDB.Driver;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using API.Data;

namespace API.Controllers
{
    [Route("/order")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly MongoDbService _mongoDbService;

        public OrderController(MongoDbService mongoDbService)
        {
            _mongoDbService = mongoDbService;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto orderDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;

                if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(userEmail))
                {
                    return Unauthorized("Invalid user");
                }

                // Check stock availability for all products before creating the order
                foreach (var item in orderDto.Products)
                {
                    var productCollection = _mongoDbService.Database.GetCollection<Product>("products");
                    var product = await productCollection.Find(p => p.Id == item.ProductId).FirstOrDefaultAsync();
                    
                    if (product == null)
                    {
                        return BadRequest($"Product with ID {item.ProductId} not found");
                    }
                    
                    if (product.Stock < item.Quantity)
                    {
                        return BadRequest($"Insufficient stock for product {product.Nume}. Available: {product.Stock}, Requested: {item.Quantity}");
                    }
                }

                // If all products have sufficient stock, proceed with stock reduction
                foreach (var item in orderDto.Products)
                {
                    var stockUpdated = await _mongoDbService.DecreaseProductStockAsync(item.ProductId, item.Quantity);
                    if (!stockUpdated)
                    {
                        return BadRequest($"Failed to update stock for product {item.ProductId}");
                    }
                }

                var order = new Order
                {
                    CustomerId = userId,
                    CustomerEmail = userEmail,
                    Products = orderDto.Products,
                    TotalAmount = orderDto.TotalAmount,
                    DeliveryAddress = orderDto.DeliveryAddress,
                    OrderStatus = "Pending"
                };

                await _mongoDbService.CreateOrderAsync(order);

                return Ok(new { orderId = order.Id, message = "Order created successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating order: {ex.Message}");
                return StatusCode(500, "Error creating order");
            }
        }

        [HttpGet("my-orders")]
        [Authorize]
        public async Task<IActionResult> GetMyOrders()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("Invalid user");
                }

                var orders = await _mongoDbService.GetOrdersByCustomerAsync(userId);
                return Ok(orders);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching orders: {ex.Message}");
                return StatusCode(500, "Error fetching orders");
            }
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetOrderById(string id)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var order = await _mongoDbService.GetOrderByIdAsync(id);

                if (order == null)
                {
                    return NotFound("Order not found");
                }

                // Check if the user owns this order or is an admin
                if (order.CustomerId != userId)
                {
                    return Forbid("You can only view your own orders");
                }

                return Ok(order);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching order: {ex.Message}");
                return StatusCode(500, "Error fetching order");
            }
        }

        [HttpGet("all")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetAllOrders()
        {
            try
            {
                var orders = await _mongoDbService.GetAllOrdersAsync();
                return Ok(orders);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching all orders: {ex.Message}");
                return StatusCode(500, "Error fetching orders");
            }
        }
    }

    public class CreateOrderDto
    {
        public required List<OrderItem> Products { get; set; }
        public required float TotalAmount { get; set; }
        public required DeliveryAddress DeliveryAddress { get; set; }
    }
} 