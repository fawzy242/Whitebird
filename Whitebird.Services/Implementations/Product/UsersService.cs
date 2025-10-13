using Whitebird.Repository.EfCore.Product;
using Whitebird.Models.Entities.Product;
using Whitebird.Helper.Extensions;
using Whitebird.Services.Interfaces;

namespace Whitebird.Services.Implementations.Product
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
