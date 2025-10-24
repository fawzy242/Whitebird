using Whitebird.Helper.Extensions;
using Whitebird.Models.Features.users.Entities;
using Whitebird.Repository.Features.users.Reps;
using Whitebird.Services.Features.users.Interfaces;

namespace Whitebird.Services.Features.users.Service
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
