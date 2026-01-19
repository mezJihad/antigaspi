using Antigaspi.Application;
using Antigaspi.Application.Repositories;
using Antigaspi.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder => builder
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader());
});

// Layer Injection
builder.Services.AddApplication();

// Infrastructure Injection (MongoDB)
// Infrastructure Injection
builder.Services.AddInfrastructure(builder.Configuration);

// Infrastructure Injection (Fake for now) - COMMENTED OUT
// builder.Services.AddSingleton<ISellerRepository, InMemorySellerRepository>();
// builder.Services.AddSingleton<IOfferRepository, InMemoryOfferRepository>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

// Redirect root to Swagger UI
app.MapGet("/", () => Results.Redirect("/swagger"));

// Seed Database
using (var scope = app.Services.CreateScope())
{
    await Antigaspi.Infrastructure.Persistence.AntigaspiSeeder.SeedAsync(scope.ServiceProvider);
}

app.Run();
