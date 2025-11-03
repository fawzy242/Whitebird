using Microsoft.AspNetCore.Mvc;
using Whitebird.App.Features.Fund.Service;
using Whitebird.Features.Common;

[ApiController]
[Route("api/[controller]")]
public class FundController : ControllerBase
{
    private readonly FundService _fundService;

    public FundController(FundService fundService)
    {
        _fundService = fundService;
    }

    [HttpGet]
    public async Task<IActionResult> GetShowData()
    {
        var result = await _fundService.GetShowData();
        return ControllerHelper.HandleResult(result);
    }
}
