using AppointmentApi.DTOs;

namespace AppointmentApi.Services;

public interface IAppointmentService
{
    Task<List<AppointmentResponse>> GetByPlateAsync(string plate);
    Task<ServiceResult<AppointmentResponse>> CreateAsync(CreateAppointmentRequest request);
}
