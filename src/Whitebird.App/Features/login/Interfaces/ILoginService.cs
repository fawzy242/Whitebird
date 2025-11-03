using Whitebird.App.Features.Common.Service;
using Whitebird.Domain.Features.Login.Entities;

namespace Whitebird.App.Features.Login.Interfaces
{
    public interface ILoginService
    {
        Task<Result<IEnumerable<LoginEntity>>> Quest();
    }
}
