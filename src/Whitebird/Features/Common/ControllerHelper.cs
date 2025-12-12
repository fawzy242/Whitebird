// File: ControllerHelper.cs
using Microsoft.AspNetCore.Mvc;
using Whitebird.App.Features.Common.Service;

namespace Whitebird.Features.Common
{
    public static class ControllerHelper
    {
        public static IActionResult HandleResult<T>(
            this ControllerBase controller,
            Result<T> result,
            string? actionName = null,
            string? routeIdName = "id",
            object? routeValues = null)
        {
            if (result.IsSuccess)
            {
                if (result.Data == null)
                    return controller.NotFound(result);

                if (!string.IsNullOrEmpty(actionName))
                {
                    if (routeValues == null)
                    {
                        var idProperty = typeof(T).GetProperties()
                            .FirstOrDefault(p => p.Name.EndsWith("Id", StringComparison.OrdinalIgnoreCase));

                        if (idProperty != null && result.Data != null)
                        {
                            var idValue = idProperty.GetValue(result.Data);
                            routeValues = new { id = idValue };
                        }
                    }

                    return controller.CreatedAtAction(actionName, routeValues, result);
                }

                return controller.Ok(result);
            }

            return HandleErrorResult(controller, result);
        }

        public static IActionResult HandleResult<T>(this ControllerBase controller, PaginatedResult<T> result)
        {
            if (result.IsSuccess)
            {
                return controller.Ok(result);
            }

            return HandleErrorResult(controller, result);
        }

        public static IActionResult HandleResult(this ControllerBase controller, Result result)
        {
            if (result.IsSuccess)
            {
                return controller.Ok(result);
            }

            return HandleErrorResult(controller, result);
        }

        private static IActionResult HandleErrorResult(ControllerBase controller, object result)
        {
            var errorsProperty = result.GetType().GetProperty("Errors");
            var messageProperty = result.GetType().GetProperty("Message");

            var errors = errorsProperty?.GetValue(result) as List<string> ?? new List<string>();
            var message = messageProperty?.GetValue(result) as string;

            if (errors.Any(e =>
                e.Contains("not found", StringComparison.OrdinalIgnoreCase) ||
                e.Contains("does not exist", StringComparison.OrdinalIgnoreCase) ||
                e.Contains("no record", StringComparison.OrdinalIgnoreCase)))
            {
                return controller.NotFound(result);
            }

            if (errors.Any(e =>
                e.Contains("already exists", StringComparison.OrdinalIgnoreCase) ||
                e.Contains("duplicate", StringComparison.OrdinalIgnoreCase) ||
                e.Contains("in use", StringComparison.OrdinalIgnoreCase)))
            {
                return controller.Conflict(result);
            }

            return controller.BadRequest(result);
        }

        public static IActionResult? HandleModelState(this ControllerBase controller)
        {
            if (!controller.ModelState.IsValid)
            {
                var errors = controller.ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                var result = Result.Failure(string.Join("; ", errors), "Validation failed");
                return controller.BadRequest(result);
            }

            return null;
        }
    }
}