using AppointmentApi.DTOs;
using AppointmentApi.Models;
using AppointmentApi.Repositories;

namespace AppointmentApi.Services;

public class AppointmentService : IAppointmentService
{
    private static readonly TimeSpan OpeningTime = new(8, 0, 0);
    private static readonly TimeSpan ClosingTime = new(14, 0, 0);

    private readonly IAppointmentRepository _repository;

    public AppointmentService(IAppointmentRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<AppointmentResponse>> GetByPlateAsync(string plate)
    {
        var normalizedPlate = NormalizePlate(plate);
        var appointments = await _repository.GetByPlateAsync(normalizedPlate);
        return appointments.Select(MapToResponse).ToList();
    }

    public async Task<ServiceResult<AppointmentResponse>> CreateAsync(CreateAppointmentRequest request)
    {
        var normalizedPlate = NormalizePlate(request.Plate);
        var scheduledAt = request.ScheduledAt;

        var validationError = ValidateSchedule(scheduledAt);
        if (validationError is not null)
        {
            return ServiceResult<AppointmentResponse>.Fail(validationError);
        }

        var slotTaken = await _repository.IsSlotTakenAsync(scheduledAt);
        if (slotTaken)
        {
            return ServiceResult<AppointmentResponse>.Fail("El horario seleccionado ya está ocupado.");
        }

        var appointment = new Appointment
        {
            Id = Guid.NewGuid(),
            Plate = normalizedPlate,
            ScheduledAt = scheduledAt,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(appointment);

        return ServiceResult<AppointmentResponse>.Ok(MapToResponse(appointment));
    }

    private static string NormalizePlate(string plate)
    {
        return plate.Trim().ToUpperInvariant();
    }

    private static string? ValidateSchedule(DateTime scheduledAt)
    {
        var dayOfWeek = scheduledAt.DayOfWeek;
        if (dayOfWeek == DayOfWeek.Saturday || dayOfWeek == DayOfWeek.Sunday)
        {
            return "Las citas solo se pueden agendar de lunes a viernes.";
        }

        var time = scheduledAt.TimeOfDay;
        if (time < OpeningTime || time >= ClosingTime)
        {
            return "Las citas solo se pueden agendar entre 08:00 y 14:00.";
        }

        if (scheduledAt.Second != 0 || scheduledAt.Millisecond != 0)
        {
            return "El horario debe estar en intervalos de 30 minutos.";
        }

        if (scheduledAt.Minute != 0 && scheduledAt.Minute != 30)
        {
            return "El horario debe estar en intervalos de 30 minutos.";
        }

        return null;
    }

    private static AppointmentResponse MapToResponse(Appointment appointment)
    {
        return new AppointmentResponse
        {
            Id = appointment.Id,
            Plate = appointment.Plate,
            ScheduledAt = appointment.ScheduledAt
        };
    }
}
