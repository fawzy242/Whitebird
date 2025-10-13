using Whitebird.Repository.EfCore.Product;
using Whitebird.Models.Entities.Product;
using Whitebird.Helper.Extensions;
using Whitebird.Services.Interfaces;

namespace Whitebird.Services.Implementations.Product
{
    public class LoginService : ILoginService
    {
        private readonly LoginReps _repo;

        public LoginService(LoginReps repo)
        {
            _repo = repo;
        }

        public async Task<Result<IEnumerable<Login>>> Quest()
        {
            try
            {
                var users = await _repo.Quest();
                return Result<IEnumerable<Login>>.Ok(users);
            }
            catch (Exception ex)
            {
                return Result<IEnumerable<Login>>.Fail(ex.Message);
            }
        }
    }
}
