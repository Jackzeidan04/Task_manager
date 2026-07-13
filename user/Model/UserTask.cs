using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace user.Model;

public class UserTask
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("userId")]
    public string UserId { get; set; }= string.Empty;

    [BsonElement("title")]
    public string Title { get; set; }=string.Empty;

    [BsonElement("description")]
    public string Description { get; set; }= string.Empty;

    [BsonElement("status")]
    public string Status { get; set; } = "Incomplete"; // Incomplete or Completed

    [BsonElement("priority")]
    public string Priority { get; set; } = "Medium";

    [BsonElement("dueDate")]
    public DateTime? DueDate { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}