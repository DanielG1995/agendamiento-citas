using System.ComponentModel.DataAnnotations;

namespace AppointmentApi.DTOs;

public class CreateAppointmentRequest
{
    [Required]
    [RegularExpression("^[A-Za-z]{3}-\\d{4}$", ErrorMessage = "Formato de placa inválido (Ej: PDF-1234).")]
    public string Plate { get; set; } = string.Empty;

    [Required]
    public DateTime ScheduledAt { get; set; }
}
