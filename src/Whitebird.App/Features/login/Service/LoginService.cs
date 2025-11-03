using Whitebird.Domain.Features.login.Entities;
using Whitebird.Helper.Extensions;
using Whitebird.Infra.Features.login.Reps;
using Whitebird.Services.Features.login.Interfaces;

namespace Whitebird.App.Features.login.Service
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
