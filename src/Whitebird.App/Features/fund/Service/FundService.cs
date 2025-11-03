using Whitebird.App.Features.Common.Service;
using Whitebird.Domain.Features.Fund.Entities;
using Whitebird.Infra.Features.Fund;

namespace Whitebird.App.Features.Fund.Service
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
