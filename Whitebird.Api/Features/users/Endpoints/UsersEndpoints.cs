
using Whitebird.Services.Features.users.Interfaces;

namespace Whitebird.Api.Features.users.Endpoints
{
    public static class UserEndpoints
    {
        public static void MapUserEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/v1/users").WithTags("Users");

            app.MapGet("/", async (IUserService service) =>
            {
                var users = await service.GetAllAsync();
                return Results.Ok(users);
            });

            group.MapGet("/{id:int}", async (int id, IUserService service) =>
            {
                var user = await service.GetByIdAsync(id);
                return user is null ? Results.NotFound() : Results.Ok(user);
            });

            group.MapPost("/", async (UserRequest req, IUserService service) =>
            {
                var created = await service.CreateAsync(req);
                return Results.Created($"/api/v1/users/{created.Id}", created);
            });

            group.MapPut("/{id:int}", async (int id, UserRequest req, IUserService service) =>
            {
                var updated = await service.UpdateAsync(id, req);
                return updated ? Results.NoContent() : Results.NotFound();
            });

            group.MapDelete("/{id:int}", async (int id, IUserService service) =>
            {
                var deleted = await service.DeleteAsync(id);
                return deleted ? Results.NoContent() : Results.NotFound();
            });
        }
    }
}
