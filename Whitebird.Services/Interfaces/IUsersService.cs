using Whitebird.Helper.Extensions;
using Whitebird.Models.Entities.Product;

namespace Whitebird.Services.Interfaces
{
    public interface IUserService
    {
        Task<Result<IEnumerable<UsersEntity>>> GetAllUsers();
    }
}
