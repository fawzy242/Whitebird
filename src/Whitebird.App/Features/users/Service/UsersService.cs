using Whitebird.App.Features.users.Interfaces;
using Whitebird.Domain.Features.users.Entities;
using Whitebird.Helper.Extensions;
using Whitebird.Infra.Features.users.Reps;

namespace Whitebird.App.Features.users.Service
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
