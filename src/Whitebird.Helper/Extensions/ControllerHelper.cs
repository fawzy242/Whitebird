using Microsoft.AspNetCore.Mvc;

namespace Whitebird.Helper.Extensions
{
    public static class ControllerHelper
    {
        public static IActionResult HandleResult<T>(Result<T> result)
        {
            if (result.Success)
                return new OkObjectResult(result);
            else
                return new BadRequestObjectResult(result);
        }
    }
}
