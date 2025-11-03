using Microsoft.AspNetCore.Mvc;
using Whitebird.App.Features.users.Service;
using Whitebird.Helper.Extensions;

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
