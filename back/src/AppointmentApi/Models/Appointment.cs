namespace AppointmentApi.Models;

public class Appointment
{
    public Guid Id { get; set; }
    public string Plate { get; set; } = string.Empty;
    public DateTime ScheduledAt { get; set; }
    public DateTime CreatedAt { get; set; }
}
