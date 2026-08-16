using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace API.Entities
{
    public class Order
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("customerId")]
        public required string CustomerId { get; set; }

        [BsonElement("customerEmail")]
        public required string CustomerEmail { get; set; }

        [BsonElement("products")]
        public required List<OrderItem> Products { get; set; }

        [BsonElement("totalAmount")]
        public required float TotalAmount { get; set; }

        [BsonElement("deliveryAddress")]
        public required DeliveryAddress DeliveryAddress { get; set; }

        [BsonElement("orderStatus")]
        public required string OrderStatus { get; set; } = "Pending";

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class OrderItem
    {
        [BsonElement("productId")]
        public required string ProductId { get; set; }

        [BsonElement("productName")]
        public required string ProductName { get; set; }

        [BsonElement("price")]
        public required float Price { get; set; }

        [BsonElement("quantity")]
        public required int Quantity { get; set; }
    }

    public class DeliveryAddress
    {
        [BsonElement("fullName")]
        public required string FullName { get; set; }

        [BsonElement("street")]
        public required string Street { get; set; }

        [BsonElement("city")]
        public required string City { get; set; }

        [BsonElement("postalCode")]
        public required string PostalCode { get; set; }

        [BsonElement("country")]
        public required string Country { get; set; }

        [BsonElement("phoneNumber")]
        public required string PhoneNumber { get; set; }

        [BsonElement("additionalInfo")]
        public string? AdditionalInfo { get; set; }
    }
} 