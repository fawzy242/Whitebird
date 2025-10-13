using Whitebird.Repository.EfCore.Product;
using Whitebird.Models.Entities.Product;
using Whitebird.Helper.Extensions;

namespace Whitebird.Services.Implementations.Product
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
