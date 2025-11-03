using Whitebird.Domain.Features.users.Entities;
using Whitebird.Helper.Extensions;

namespace Whitebird.App.Features.users.Interfaces
{
    public interface IUserService
    {
        Task<Result<IEnumerable<UsersEntity>>> GetAllUsers();
    }
}
