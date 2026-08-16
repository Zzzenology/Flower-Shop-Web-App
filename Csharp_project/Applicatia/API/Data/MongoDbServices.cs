using API.Entities;
using MongoDB.Driver;
using MongoDB.Bson;

namespace API.Data
{
    public class MongoDbService
    {
        private readonly IMongoDatabase _database;

        public MongoDbService(IConfiguration configuration)
        {
            var connectionString = configuration["ConnectionStrings:DbConnection"];
            var mongoUrl = new MongoUrl(connectionString);
            var mongoClient = new MongoClient(mongoUrl);
            _database = mongoClient.GetDatabase(mongoUrl.DatabaseName);
            Database = _database;
        }

        private IMongoCollection<User> UserCollection => _database.GetCollection<User>("users");

        public async Task<User> GetUserById(string id)
        {
            var collection = Database.GetCollection<User>("users");
            return await collection.Find(u => u.Id == id).FirstOrDefaultAsync();
        }
        public async Task CreateUserAsync(User user)
        {
            await Database.GetCollection<User>("users").InsertOneAsync(user);
        }



        public async Task<List<User>> GetAllUsersAsync()
        {
            return await UserCollection.Find(_ => true).ToListAsync();
        }




        private IMongoCollection<Product> ProductCollection => _database.GetCollection<Product>("products");

        public async Task CreateProductAsync(Product product)
        {
            await ProductCollection.InsertOneAsync(product);
        }

        public async Task<List<Product>> GetAllProductsAsync()
        {
            return await ProductCollection.Find(_ => true).ToListAsync();
        }

        public async Task<List<Product>> GetNewestProductsAsync(int count = 10)
        {
            return await ProductCollection
                .Find(_ => true)
                .SortByDescending(p => p.CreatedAt)
                .Limit(count)
                .ToListAsync();
        }

        public async Task<List<Product>> GetProductsBySellerAsync(string sellerId)
        {
            return await ProductCollection
                .Find(p => p.VanzatorId == sellerId)
                .ToListAsync();
        }

        public async Task<bool> UpdateProductStockAsync(string productId, int newStock)
        {
            var filter = Builders<Product>.Filter.Eq(p => p.Id, productId);
            var update = Builders<Product>.Update.Set(p => p.Stock, newStock);
            
            var result = await ProductCollection.UpdateOneAsync(filter, update);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> DecreaseProductStockAsync(string productId, int quantity = 1)
        {
            var filter = Builders<Product>.Filter.And(
                Builders<Product>.Filter.Eq(p => p.Id, productId),
                Builders<Product>.Filter.Gte(p => p.Stock, quantity)
            );
            var update = Builders<Product>.Update.Inc(p => p.Stock, -quantity);
            
            var result = await ProductCollection.UpdateOneAsync(filter, update);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> SetDefaultStockForExistingProductsAsync(int defaultStock = 100)
        {
            var filter = Builders<Product>.Filter.Or(
                Builders<Product>.Filter.Exists("stock", false),
                Builders<Product>.Filter.Eq("stock", BsonNull.Value)
            );
            var update = Builders<Product>.Update.Set(p => p.Stock, defaultStock);
            
            var result = await ProductCollection.UpdateManyAsync(filter, update);
            return result.ModifiedCount >= 0;
        }

        public async Task<bool> SetDefaultDescriptionForExistingProductsAsync(string defaultDescription = "Produs frumos și de calitate, perfect pentru orice ocazie.")
        {
            var filter = Builders<Product>.Filter.Or(
                Builders<Product>.Filter.Exists("descriere", false),
                Builders<Product>.Filter.Eq("descriere", BsonNull.Value),
                Builders<Product>.Filter.Eq("descriere", "")
            );
            var update = Builders<Product>.Update.Set(p => p.Descriere, defaultDescription);
            
            var result = await ProductCollection.UpdateManyAsync(filter, update);
            return result.ModifiedCount >= 0;
        }

        // Order operations
        private IMongoCollection<Order> OrderCollection => _database.GetCollection<Order>("orders");

        public async Task CreateOrderAsync(Order order)
        {
            await OrderCollection.InsertOneAsync(order);
        }

        public async Task<List<Order>> GetOrdersByCustomerAsync(string customerId)
        {
            return await OrderCollection
                .Find(o => o.CustomerId == customerId)
                .SortByDescending(o => o.CreatedAt)
                .ToListAsync();
        }

        public async Task<Order> GetOrderByIdAsync(string orderId)
        {
            return await OrderCollection.Find(o => o.Id == orderId).FirstOrDefaultAsync();
        }

        public async Task<List<Order>> GetAllOrdersAsync()
        {
            return await OrderCollection
                .Find(_ => true)
                .SortByDescending(o => o.CreatedAt)
                .ToListAsync();
        }

        // Delete user and their associated data
        public async Task<bool> DeleteUserAsync(string userId)
        {
            return await UserCollection
                .DeleteOneAsync(u => u.Id == userId)
                .ContinueWith(task => task.Result.DeletedCount > 0);
        }

        public async Task<bool> DeleteProductsBySellerAsync(string sellerId)
        {
            var result = await ProductCollection
                .DeleteManyAsync(p => p.VanzatorId == sellerId);
            return result.DeletedCount >= 0; // Returns true even if no products were deleted
        }

        public async Task<bool> DeleteOrdersByCustomerAsync(string customerId)
        {
            var result = await OrderCollection
                .DeleteManyAsync(o => o.CustomerId == customerId);
            return result.DeletedCount >= 0; // Returns true even if no orders were deleted
        }

        public IMongoDatabase Database { get; }
    }
}