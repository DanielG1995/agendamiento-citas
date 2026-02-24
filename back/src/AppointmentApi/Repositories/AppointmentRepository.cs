using AppointmentApi.Data;
using AppointmentApi.Models;
using Microsoft.EntityFrameworkCore;

namespace AppointmentApi.Repositories;

public class AppointmentRepository : IAppointmentRepository
{
    private readonly AppDbContext _dbContext;

    public AppointmentRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<List<Appointment>> GetByPlateAsync(string plate)
    {
        return _dbContext.Appointments
            .AsNoTracking()
            .Where(a => a.Plate == plate)
            .OrderBy(a => a.ScheduledAt)
            .ToListAsync();
    }

    public Task<bool> IsSlotTakenAsync(DateTime scheduledAt)
    {
        return _dbContext.Appointments.AnyAsync(a => a.ScheduledAt == scheduledAt);
    }

    public async Task<Appointment> AddAsync(Appointment appointment)
    {
        _dbContext.Appointments.Add(appointment);
        await _dbContext.SaveChangesAsync();
        return appointment;
    }
}
