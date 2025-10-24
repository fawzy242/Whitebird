using Whitebird.Helper.Extensions;
using Whitebird.Models.Features.login.Entities;

namespace Whitebird.Services.Features.login.Interfaces
{
    public interface ILoginService
    {
        Task<Result<IEnumerable<Login>>> Quest();
    }
}
