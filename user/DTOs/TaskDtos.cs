namespace user.DTOs;

public class CreateTaskDto
{
    public string Title { get; set; }
    public string Description { get; set; }
    public string Status { get; set; } = "Incomplete";
    public string Priority { get; set; } = "Medium";
    public DateTime? DueDate { get; set; }
}

public class UpdateTaskDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty; // Pending, In Progress, Completed
    public string Priority { get; set; } = string.Empty; // Low, Medium, High
    public DateTime? DueDate { get; set; }
}

public class TaskResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } =string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public DateTime? DueDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}