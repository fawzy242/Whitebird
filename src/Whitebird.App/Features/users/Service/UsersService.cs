using Whitebird.App.Features.Common.Service;
using Whitebird.App.Features.Users.Interfaces;
using Whitebird.Domain.Features.Users.Entities;
using Whitebird.Infra.Features.Users;

namespace Whitebird.App.Features.Users.Service
{
    public class UserService : IUserService
    {
        private readonly UsersReps _repo;

        public UserService(UsersReps repo)
        {
            _repo = repo;
        }

        public async Task<Result<IEnumerable<UsersEntity>>> GetAllUsers()
        {
            try
            {
                var users = await _repo.GetAllUsers();
                return Result<IEnumerable<UsersEntity>>.Ok(users);
            }
            catch (Exception ex)
            {
                return Result<IEnumerable<UsersEntity>>.Fail(ex.Message);
            }
        }
    }
}
