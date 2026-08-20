using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SuperMarketAPI.Data;
using SuperMarketAPI.Services;

var builder = WebApplication.CreateBuilder(args);

// ── Load Environment Variables from .env file if exists ─────────────────────
var envFilePath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
if (File.Exists(envFilePath))
{
    foreach (var line in File.ReadAllLines(envFilePath))
    {
        if (string.IsNullOrWhiteSpace(line) || line.StartsWith("#")) continue;
        var parts = line.Split('=', 2);
        if (parts.Length == 2)
        {
            Environment.SetEnvironmentVariable(parts[0].Trim(), parts[1].Trim());
        }
    }
}
builder.Configuration.AddEnvironmentVariables();

// ── Database ─────────────────────────────────────────────────────────────────
var useSqliteEnv = Environment.GetEnvironmentVariable("USE_SQLITE");
bool useSqlite = string.Equals(useSqliteEnv, "true", StringComparison.OrdinalIgnoreCase);

var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
var defaultConnStr = builder.Configuration.GetConnectionString("DefaultConnection");

if (!useSqlite && !string.IsNullOrWhiteSpace(databaseUrl))
{
    var pgConnStr = ConvertPostgresUrlToConnectionString(databaseUrl);
    Console.WriteLine("--> Using Neon PostgreSQL Database.");
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseNpgsql(pgConnStr));
}
else if (!string.IsNullOrWhiteSpace(defaultConnStr) && (defaultConnStr.StartsWith("Host=") || defaultConnStr.StartsWith("Server=") || defaultConnStr.StartsWith("postgres")))
{
    var pgConnStr = ConvertPostgresUrlToConnectionString(defaultConnStr);
    Console.WriteLine("--> Using PostgreSQL Database.");
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseNpgsql(pgConnStr));
}
else
{
    Console.WriteLine("--> Using SQLite Database.");
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseSqlite(defaultConnStr ?? "Data Source=supermarket.db"));
}

// ── Services ──────────────────────────────────────────────────────────────────
builder.Services.AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo(Path.Combine(Path.GetTempPath(), "DataProtection-Keys")));

builder.Services.AddSingleton<JwtService>();
builder.Services.AddSingleton<RazorpayService>();
builder.Services.AddSingleton<EmailService>();
builder.Services.AddSingleton<PdfInvoiceService>();

var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrWhiteSpace(jwtKey)) jwtKey = builder.Configuration["JWT_KEY"];
if (string.IsNullOrWhiteSpace(jwtKey)) jwtKey = Environment.GetEnvironmentVariable("JWT_KEY");
if (string.IsNullOrWhiteSpace(jwtKey))
{
    throw new InvalidOperationException("JWT_KEY is missing from configuration or environment. Please configure JWT_KEY in environment variables or appsettings.json.");
}
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateIssuer           = true,
            ValidIssuer              = builder.Configuration["Jwt:Issuer"],
            ValidateAudience         = true,
            ValidAudience            = builder.Configuration["Jwt:Audience"],
            ValidateLifetime         = true,
            ClockSkew                = TimeSpan.Zero,
        };
    });
builder.Services.AddAuthorization();

// ── CORS ──────────────────────────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

// ── Controllers + Swagger ─────────────────────────────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(o => o.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title       = "Super Market App",
        Version     = "v1",
        Description = "SuperMarket App REST API — Products, Orders, Payments, Cart, Wishlist"
    });

    // Add JWT auth to Swagger UI
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name         = "Authorization",
        Type         = SecuritySchemeType.Http,
        Scheme       = "bearer",
        BearerFormat = "JWT",
        In           = ParameterLocation.Header,
        Description  = "Enter your JWT token (from /api/auth/verify-otp)",
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// ── Migrate + Seed ────────────────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated(); // Ensure DB tables + indexes match models
    DataSeeder.Seed(db);         // Seed products, categories, coupons, demo user
}

// ── Middleware pipeline ───────────────────────────────────────────────────────
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "SuperMarket API v1");
    c.RoutePrefix = "swagger";
    c.DocumentTitle = "SuperMarket API";
});

app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Health check endpoint
app.MapGet("/", () => new
{
    app    = "Super Market App API",
    status = "running",
    docs   = "/swagger",
    time   = DateTime.UtcNow
});

app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));

var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrWhiteSpace(port))
{
    Console.WriteLine($"--> Binding to custom PORT: {port}");
    app.Urls.Add($"http://0.0.0.0:{port}");
}

app.Run();

static string ConvertPostgresUrlToConnectionString(string rawUrl)
{
    if (string.IsNullOrWhiteSpace(rawUrl)) return rawUrl;
    if (!rawUrl.StartsWith("postgres://") && !rawUrl.StartsWith("postgresql://")) return rawUrl;

    try
    {
        var uri = new Uri(rawUrl);
        var userInfo = uri.UserInfo.Split(':');
        var username = userInfo.Length > 0 ? Uri.UnescapeDataString(userInfo[0]) : "";
        var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
        var host = uri.Host;
        var port = uri.Port > 0 ? uri.Port : 5432;
        var database = uri.AbsolutePath.TrimStart('/');

        // Build Npgsql connection string
        var builder = new StringBuilder();
        builder.Append($"Host={host};Port={port};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true;");
        return builder.ToString();
    }
    catch
    {
        return rawUrl;
    }
}
