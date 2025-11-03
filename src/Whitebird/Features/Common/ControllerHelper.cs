using Microsoft.AspNetCore.Mvc;
using Whitebird.App.Features.Common.Service;

namespace Whitebird.Features.Common
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
