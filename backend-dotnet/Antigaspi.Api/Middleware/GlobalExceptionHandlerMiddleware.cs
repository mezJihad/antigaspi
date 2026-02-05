using System.Net;
using System.Text.Json;
using Serilog;

namespace Antigaspi.Api.Middleware;

public class GlobalExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;

    public GlobalExceptionHandlerMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

        var errorId = Guid.NewGuid();
        
        // Log the exception with Serilog, including the ErrorId for tracing
        Log.Error(exception, "An unhandled exception has occurred. ErrorId: {ErrorId}", errorId);

        var response = new
        {
            StatusCode = context.Response.StatusCode,
            Message = "Internal Server Error. Please contact support with the ErrorId.",
            ErrorId = errorId
        };

        var json = JsonSerializer.Serialize(response);
        return context.Response.WriteAsync(json);
    }
}
