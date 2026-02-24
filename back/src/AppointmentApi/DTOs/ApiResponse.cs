namespace AppointmentApi.DTOs;

public class ApiResponse<T>
{
    public bool Transaction { get; set; }
    public T? Data { get; set; }
    public string? Error { get; set; }

    public static ApiResponse<T> Success(T data) => new()
    {
        Transaction = true,
        Data = data
    };

    public static ApiResponse<T> Fail(string error) => new()
    {
        Transaction = false,
        Error = error
    };
}
