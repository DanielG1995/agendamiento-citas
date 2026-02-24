using AppointmentApi.Models;

namespace AppointmentApi.Repositories;

public interface IAppointmentRepository
{
    Task<List<Appointment>> GetByPlateAsync(string plate);
    Task<bool> IsSlotTakenAsync(DateTime scheduledAt);
    Task<Appointment> AddAsync(Appointment appointment);
}
