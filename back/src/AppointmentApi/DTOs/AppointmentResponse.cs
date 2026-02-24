namespace AppointmentApi.DTOs;

public class AppointmentResponse
{
    public Guid Id { get; set; }
    public string Plate { get; set; } = string.Empty;
    public DateTime ScheduledAt { get; set; }
}
