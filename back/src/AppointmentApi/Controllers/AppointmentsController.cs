using AppointmentApi.DTOs;
using AppointmentApi.Services;
using Microsoft.AspNetCore.Mvc;
using System.Text.RegularExpressions;

namespace AppointmentApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AppointmentsController : ControllerBase
{
    private static readonly Regex PlateRegex = new("^[A-Za-z]{3}-\\d{4}$", RegexOptions.Compiled);

    private readonly IAppointmentService _service;

    public AppointmentsController(IAppointmentService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<AppointmentResponse>>>> GetByPlate([FromQuery] string plate)
    {
        if (string.IsNullOrWhiteSpace(plate))
        {
            return BadRequest(ApiResponse<List<AppointmentResponse>>.Fail("La placa es obligatoria."));
        }

        if (!PlateRegex.IsMatch(plate))
        {
            return BadRequest(ApiResponse<List<AppointmentResponse>>.Fail("Formato de placa inválido (Ej: PDF-1234)."));
        }

        var appointments = await _service.GetByPlateAsync(plate);
        return Ok(ApiResponse<List<AppointmentResponse>>.Success(appointments));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<AppointmentResponse>>> Create([FromBody] CreateAppointmentRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse<AppointmentResponse>.Fail(GetModelErrorMessage()));
        }

        var result = await _service.CreateAsync(request);
        if (!result.Success)
        {
            return BadRequest(ApiResponse<AppointmentResponse>.Fail(result.Error ?? "Solicitud inválida."));
        }

        return CreatedAtAction(nameof(GetByPlate), new { plate = result.Value!.Plate }, ApiResponse<AppointmentResponse>.Success(result.Value));
    }

    private string GetModelErrorMessage()
    {
        var firstError = ModelState.Values
            .SelectMany(v => v.Errors)
            .Select(e => e.ErrorMessage)
            .FirstOrDefault();

        return string.IsNullOrWhiteSpace(firstError)
            ? "Solicitud inválida."
            : firstError;
    }
}
