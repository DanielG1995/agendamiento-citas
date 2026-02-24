using AppointmentApi.Models;
using Microsoft.EntityFrameworkCore;

namespace AppointmentApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Appointment> Appointments => Set<Appointment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var appointment = modelBuilder.Entity<Appointment>();

        appointment.HasKey(a => a.Id);
        appointment.Property(a => a.Plate)
            .IsRequired()
            .HasMaxLength(8);
        appointment.Property(a => a.ScheduledAt)
            .IsRequired();
        appointment.Property(a => a.CreatedAt)
            .IsRequired();

        appointment.HasIndex(a => a.Plate);
        appointment.HasIndex(a => a.ScheduledAt).IsUnique();
    }
}
