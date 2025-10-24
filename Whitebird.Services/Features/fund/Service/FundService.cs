using Whitebird.Helper.Extensions;
using Whitebird.Models.Features.fund.Entities;
using Whitebird.Repository.Features.fund.Reps;

namespace Whitebird.Services.Features.fund.Service
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
