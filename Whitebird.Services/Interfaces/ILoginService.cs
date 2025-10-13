using Whitebird.Helper.Extensions;
using Whitebird.Models.Entities.Product;

namespace Whitebird.Services.Interfaces
{
    public interface ILoginService
    {
        Task<Result<IEnumerable<Login>>> Quest();
    }
}
