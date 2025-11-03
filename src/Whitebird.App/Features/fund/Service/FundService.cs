using Whitebird.Domain.Features.fund.Entities;
using Whitebird.Helper.Extensions;
using Whitebird.Infra.Features.fund.Reps;

namespace Whitebird.App.Features.fund.Service
{
    public class FundService
    {
        private readonly FundReps _repo;

        public FundService(FundReps repo)
        {
            _repo = repo;
        }

        public async Task<Result<IEnumerable<FundEntity>>> GetShowData()
        {
            try
            {
                var result = await _repo.GetShowData();
                return Result<IEnumerable<FundEntity>>.Ok(result);
            }
            catch (Exception ex)
            {
                return Result<IEnumerable<FundEntity>>.Fail(ex.Message);
            }
        }
    }
}
