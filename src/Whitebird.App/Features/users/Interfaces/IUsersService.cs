using Whitebird.App.Features.Common.Service;
using Whitebird.Domain.Features.Users.Entities;

namespace Whitebird.App.Features.Users.Interfaces
{
    public interface IUserService
    {
        Task<Result<IEnumerable<UsersEntity>>> GetAllUsers();
    }
}
