# Sistema de Gestion de Citas - Backend (API REST)

API RESTful en C# para gestionar citas de mantenimiento vehicular. Incluye validaciones de negocio, capas separadas y base de datos In-Memory.

## Requisitos
- .NET SDK 8.x

## Como ejecutar
```bash
cd /Users/danielgallardo/Desktop/personal/entrevista/back

dotnet restore src/AppointmentApi/AppointmentApi.csproj

dotnet run --project src/AppointmentApi/AppointmentApi.csproj
```

La API expone Swagger en entorno Development: `https://localhost:{puerto}/swagger`.

## Endpoints
- `GET /api/appointments?plate=PDF-1234`
- `POST /api/appointments`

### POST /api/appointments
```json
{
  "plate": "PDF-1234",
  "scheduledAt": "2026-03-02T08:30:00"
}
```

### Respuesta
```json
{
  "id": "9b1b1d2a-1e1b-4a2a-9a4a-4d2e3f7b0f22",
  "plate": "PDF-1234",
  "scheduledAt": "2026-03-02T08:30:00"
}
```

## Reglas de negocio
- Citas solo de lunes a viernes.
- Horario permitido entre 08:00 y 14:00 (el ultimo slot permitido es 13:30).
- Intervalos de 30 minutos.
- No se permite agendar si el horario ya esta ocupado.
- Placa valida: `AAA-1234`.

## Notas
- La base de datos es In-Memory (no requiere migraciones).
- El horario se interpreta en hora local del servidor.
- Los errores de validacion devuelven `400 Bad Request` con mensaje descriptivo.
- Los errores inesperados devuelven `500` con `ProblemDetails`.
