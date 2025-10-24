using Whitebird.Helper.Extensions;
using Whitebird.Models.Features.users.Entities;

namespace Whitebird.Services.Features.users.Interfaces
{
    public interface IUserService
    {
        Task<Result<IEnumerable<UsersEntity>>> GetAllUsers();
    }
}
