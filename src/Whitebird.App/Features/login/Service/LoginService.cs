using Whitebird.App.Features.Common.Service;
using Whitebird.App.Features.Login.Interfaces;
using Whitebird.Domain.Features.Login.Entities;
using Whitebird.Infra.Features.Login;

namespace Whitebird.App.Features.Login.Service
{
    public class LoginService : ILoginService
    {
        private readonly LoginReps _repo;

        public LoginService(LoginReps repo)
        {
            _repo = repo;
        }

        public async Task<Result<IEnumerable<LoginEntity>>> Quest()
        {
            try
            {
                var users = await _repo.Quest();
                return Result<IEnumerable<LoginEntity>>.Ok(users);
            }
            catch (Exception ex)
            {
                return Result<IEnumerable<LoginEntity>>.Fail(ex.Message);
            }
        }
    }
}
