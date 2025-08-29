using System.Data.SqlClient;
using Dapper;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
var cfg = builder.Configuration;

builder.Services.AddCors(o => o.AddPolicy(""mc"", p =>
    p.WithOrigins(""http://localhost:3000"").AllowAnyHeader().AllowAnyMethod().AllowCredentials()
));

var secret = cfg[""Jwt:Secret""]!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
  .AddJwtBearer(opts => {
      opts.TokenValidationParameters = new() {
          ValidateIssuer = true,
          ValidateAudience = true,
          ValidateIssuerSigningKey = true,
          ValidIssuer = cfg[""Jwt:Issuer""],
          ValidAudience = cfg[""Jwt:Audience""],
          IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret))
      };
  });

builder.Services.AddAuthorization();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
app.UseSwagger();
app.UseSwaggerUI();
app.UseCors(""mc"");
app.UseAuthentication();
app.UseAuthorization();

string cs = cfg.GetConnectionString(""DefaultConnection"")!;

// MODELI
record LoginRequest(string Username, string Password);
record TokenResponse(string Token, string Role, string Username);
record UserDto(int Id, string Username, string Role);
record EmployeeDto(int Id, string Name, string GroupName, string? Contact, string? Skills, bool Active);
record GroupDto(int Id, string Name, string Role);

// AUTH
app.MapPost(""/auth/login"", async (LoginRequest req) => {
    using var db = new SqlConnection(cs);
    var user = await db.QueryFirstOrDefaultAsync<UserDto>(
        ""SELECT Id, Username, Role FROM Users WHERE Username=@u AND PasswordHash=@p"",
        new { u = req.Username, p = req.Password }
    );
    if (user is null) return Results.Unauthorized();

    var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
    var key = Encoding.UTF8.GetBytes(secret);
    var desc = new SecurityTokenDescriptor {
        Subject = new System.Security.Claims.ClaimsIdentity(new[] {
            new System.Security.Claims.Claim(""sub"", user.Username),
            new System.Security.Claims.Claim(""role"", user.Role)
        }),
        Expires = DateTime.UtcNow.AddMinutes(cfg.GetValue<int>(""Jwt:ExpiresMinutes"")),
        Issuer = cfg[""Jwt:Issuer""],
        Audience = cfg[""Jwt:Audience""],
        SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
    };
    var token = handler.CreateToken(desc);
    return Results.Ok(new TokenResponse(handler.WriteToken(token), user.Role, user.Username));
});

// EMPLOYEES
app.MapGet(""/employees"", async () => {
    using var db = new SqlConnection(cs);
    var rows = await db.QueryAsync<EmployeeDto>(""SELECT * FROM Employees ORDER BY Name"");
    return Results.Ok(rows);
}).RequireAuthorization();

app.MapPost(""/employees"", async (EmployeeDto e) => {
    using var db = new SqlConnection(cs);
    var sql = ""IF NOT EXISTS(SELECT 1 FROM Employees WHERE Id=@Id) INSERT INTO Employees(Id,Name,GroupName,Contact,Skills,Active) VALUES(@Id,@Name,@GroupName,@Contact,@Skills,@Active) ELSE UPDATE Employees SET Name=@Name,GroupName=@GroupName,Contact=@Contact,Skills=@Skills,Active=@Active WHERE Id=@Id"";
    await db.ExecuteAsync(sql, e);
    await db.ExecuteAsync(""IF NOT EXISTS(SELECT 1 FROM Users WHERE Username=@u) INSERT INTO Users(Username,PasswordHash,Role) VALUES(@u,'1234','Crew')"", new { u = e.Id.ToString() });
    return Results.Ok();
}).RequireAuthorization();

app.MapDelete(""/employees/{id:int}"", async (int id) => {
    using var db = new SqlConnection(cs);
    await db.ExecuteAsync(""DELETE FROM Employees WHERE Id=@id"", new { id });
    return Results.Ok();
}).RequireAuthorization();

// HIERARCHY
app.MapGet(""/hierarchy"", async () => {
    using var db = new SqlConnection(cs);
    var groups = await db.QueryAsync<GroupDto>(""SELECT Id,Name,Role FROM Groups ORDER BY Name"");
    return Results.Ok(groups);
}).RequireAuthorization();

app.Run(""http://localhost:5000"");
