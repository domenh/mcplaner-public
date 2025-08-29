using Microsoft.Data.SqlClient;
using Dapper;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Cryptography;

var builder = WebApplication.CreateBuilder(args);
var cfg = builder.Configuration;

// CORS
builder.Services.AddCors(o => o.AddPolicy("mc", p =>
    p.WithOrigins("http://localhost:3000").AllowAnyHeader().AllowAnyMethod().AllowCredentials()
));

// JWT secret: podpri base64/hex/utf8; če <32 bajtov, raztegni s SHA256
var secret = cfg["Jwt:Secret"] ?? string.Empty;
byte[] keyBytes;
try {
    keyBytes = Convert.FromBase64String(secret);
} catch {
    try { keyBytes = Convert.FromHexString(secret); }
    catch { keyBytes = Encoding.UTF8.GetBytes(secret); }
}
if (keyBytes.Length < 32) { keyBytes = SHA256.HashData(keyBytes); } // najmanj 256-bit

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
  .AddJwtBearer(opts =>
  {
      opts.TokenValidationParameters = new()
      {
          ValidateIssuer = true,
          ValidateAudience = true,
          ValidateIssuerSigningKey = true,
          ValidIssuer = cfg["Jwt:Issuer"],
          ValidAudience = cfg["Jwt:Audience"],
          IssuerSigningKey = new SymmetricSecurityKey(keyBytes)
      };
  });
builder.Services.AddAuthorization();

var app = builder.Build();
app.UseCors("mc");
app.UseAuthentication();
app.UseAuthorization();

// Connection string – dev TLS OFF
var csb = new SqlConnectionStringBuilder(cfg.GetConnectionString("DefaultConnection"))
{
    Encrypt = false,
    TrustServerCertificate = true
};
string cs = csb.ConnectionString;

// Safety bootstrap (tabele + admin/1234)
using (var db = new SqlConnection(cs))
{
    db.Open();
    var ddl = @"
IF OBJECT_ID('dbo.Users','U') IS NULL
BEGIN
  CREATE TABLE dbo.Users(
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(200) NOT NULL,
    Role NVARCHAR(50) NOT NULL
  );
END;
IF OBJECT_ID('dbo.Employees','U') IS NULL
BEGIN
  CREATE TABLE dbo.Employees(
    Id INT PRIMARY KEY,
    Name NVARCHAR(200) NOT NULL,
    GroupName NVARCHAR(200) NOT NULL,
    Contact NVARCHAR(200) NULL,
    Skills NVARCHAR(MAX) NULL,
    Active BIT NOT NULL DEFAULT 1
  );
END;
IF OBJECT_ID('dbo.Groups','U') IS NULL
BEGIN
  CREATE TABLE dbo.Groups(
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(200) NOT NULL,
    Role NVARCHAR(50) NOT NULL
  );
END;
IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE Username='admin')
  INSERT INTO dbo.Users(Username,PasswordHash,Role) VALUES ('admin','1234','Admin');";
    db.Execute(ddl);
}

// HEALTH
app.MapGet("/healthz", () => Results.Ok(new { ok = true, ts = DateTime.UtcNow }));

// DEBUG
app.MapGet("/debug/config", () => Results.Ok(new { keyBytes = keyBytes.Length }));
app.MapGet("/debug/db", async () =>
{
    using var db = new SqlConnection(cs);
    var info = await db.QueryFirstAsync<(string ServerName, string DbName, string LoginName)>(
        "SELECT @@SERVERNAME AS ServerName, DB_NAME() AS DbName, SUSER_SNAME() AS LoginName");
    var usersCount = await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM dbo.Users");
    return Results.Ok(new { info.ServerName, info.DbName, info.LoginName, usersCount });
});
app.MapGet("/debug/users", async () =>
{
    using var db = new SqlConnection(cs);
    var rows = await db.QueryAsync<UserDto>("SELECT Id, Username, Role FROM dbo.Users ORDER BY Id OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY");
    return Results.Ok(rows);
});
app.MapPost("/debug/seed-admin", async (bool? overwrite) =>
{
    using var db = new SqlConnection(cs);
    if (overwrite == true)
    {
        var n = await db.ExecuteAsync(@"
IF EXISTS (SELECT 1 FROM dbo.Users WHERE Username='admin')
  UPDATE dbo.Users SET PasswordHash='1234', Role='Admin' WHERE Username='admin'
ELSE
  INSERT INTO dbo.Users(Username,PasswordHash,Role) VALUES('admin','1234','Admin')");
        return Results.Ok(new { seeded = (n>0 ? "updated" : "inserted") });
    }
    else
    {
        var n = await db.ExecuteAsync(@"
IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE Username='admin')
  INSERT INTO dbo.Users(Username,PasswordHash,Role) VALUES('admin','1234','Admin')");
        return Results.Ok(new { seeded = (n>0 ? "inserted" : "exists") });
    }
});

// AUTH
app.MapPost("/auth/login", async (LoginRequest req) =>
{
    using var db = new SqlConnection(cs);
    var user = await db.QueryFirstOrDefaultAsync<UserDto>(
        "SELECT Id, Username, Role FROM dbo.Users WHERE Username=@u AND PasswordHash=@p",
        new { u = req.Username, p = req.Password }
    );
    if (user is null) return Results.Unauthorized();

    var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
    var desc = new SecurityTokenDescriptor {
        Subject = new System.Security.Claims.ClaimsIdentity(new[] {
            new System.Security.Claims.Claim("sub", user.Username),
            new System.Security.Claims.Claim("role", user.Role)
        }),
        Expires = DateTime.UtcNow.AddMinutes(cfg.GetValue<int>("Jwt:ExpiresMinutes")),
        Issuer = cfg["Jwt:Issuer"],
        Audience = cfg["Jwt:Audience"],
        SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(keyBytes), SecurityAlgorithms.HmacSha256Signature)
    };
    var token = handler.CreateToken(desc);
    return Results.Ok(new TokenResponse(handler.WriteToken(token), user.Role, user.Username));
});

// EMPLOYEES
app.MapGet("/employees", async () =>
{
    using var db = new SqlConnection(cs);
    var rows = await db.QueryAsync<EmployeeDto>("SELECT Id,Name,GroupName,Contact,Skills,Active FROM Employees ORDER BY Name");
    return Results.Ok(rows);
}).RequireAuthorization();
app.MapPost("/employees", async (EmployeeDto e) =>
{
    using var db = new SqlConnection(cs);
    var sql = @"
IF NOT EXISTS(SELECT 1 FROM Employees WHERE Id=@Id)
  INSERT INTO Employees(Id,Name,GroupName,Contact,Skills,Active)
  VALUES(@Id,@Name,@GroupName,@Contact,@Skills,@Active)
ELSE
  UPDATE Employees SET Name=@Name,GroupName=@GroupName,Contact=@Contact,Skills=@Skills,Active=@Active WHERE Id=@Id;

IF NOT EXISTS(SELECT 1 FROM Users WHERE Username=@u)
  INSERT INTO Users(Username,PasswordHash,Role) VALUES(@u,'1234','Crew');";
    await db.ExecuteAsync(sql, new { e.Id, e.Name, e.GroupName, e.Contact, e.Skills, e.Active, u = e.Id.ToString() });
    return Results.Ok();
}).RequireAuthorization();
app.MapDelete("/employees/{id:int}", async (int id) =>
{
    using var db = new SqlConnection(cs);
    await db.ExecuteAsync("DELETE FROM Employees WHERE Id=@id", new { id });
    return Results.Ok();
}).RequireAuthorization();

// GROUPS
app.MapGet("/hierarchy", async () =>
{
    using var db = new SqlConnection(cs);
    var groups = await db.QueryAsync<GroupDto>("SELECT Id,Name,Role FROM Groups ORDER BY Name");
    return Results.Ok(groups);
}).RequireAuthorization();

app.Run("http://localhost:5000");
