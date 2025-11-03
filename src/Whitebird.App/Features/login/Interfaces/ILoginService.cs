using Whitebird.Domain.Features.login.Entities;
using Whitebird.Helper.Extensions;

namespace Whitebird.Services.Features.login.Interfaces
{
    public interface ILoginService
    {
        Task<Result<IEnumerable<Login>>> Quest();
    }
}
