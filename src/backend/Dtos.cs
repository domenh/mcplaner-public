public record LoginRequest(string Username, string Password);
public record TokenResponse(string Token, string Role, string Username);
public record UserDto(int Id, string Username, string Role);
public record EmployeeDto(int Id, string Name, string GroupName, string? Contact, string? Skills, bool Active);
public record GroupDto(int Id, string Name, string Role);
