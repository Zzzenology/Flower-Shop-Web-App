// API/Entities/Product.cs
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Text.Json.Serialization;

namespace API.Entities
{
    public class Product
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("nume")]
        public required string Nume { get; set; }

        [BsonElement("descriere")]
        [JsonPropertyName("descriere")]
        public string Descriere { get; set; } = string.Empty;

        [BsonElement("culoare")]
        public required string Culoare { get; set; }

        [BsonElement("categorie")]
        public required List<string> Categorie { get; set; }

        [BsonElement("poza")]
        public required string PozaURL { get; set; }

        [BsonElement("vanzatorId")]
        public required string VanzatorId { get; set; }

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("pret")]
        public required float Price { get; set; }

        [BsonElement("stock")]
        public int Stock { get; set; } = 1;
    }
}