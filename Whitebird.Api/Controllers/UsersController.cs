using Microsoft.AspNetCore.Mvc;
using Whitebird.Helper.Extensions;
using Whitebird.Services.Features.users.Service;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly UserService _userService;

    public UsersController(UserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _userService.GetAllUsers();
        return ControllerHelper.HandleResult(result);
    }
}
