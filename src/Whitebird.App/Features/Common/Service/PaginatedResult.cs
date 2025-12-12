// File: PaginatedResult.cs
namespace Whitebird.App.Features.Common.Service
{
    public class PaginatedResult<T> : Result<IEnumerable<T>>
    {
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);

        public bool HasPrevious => Page > 1;
        public bool HasNext => Page < TotalPages;

        public static PaginatedResult<T> Success(
            IEnumerable<T> data,
            int totalCount,
            int page,
            int pageSize,
            string? message = null)
        {
            return new PaginatedResult<T>
            {
                IsSuccess = true,
                Data = data,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                Message = message ?? "Operation completed successfully"
            };
        }

        public static new PaginatedResult<T> Failure(string error, string? message = null)
        {
            return new PaginatedResult<T>
            {
                IsSuccess = false,
                Message = message ?? "Operation failed",
                Errors = new List<string> { error }
            };
        }

        public static new PaginatedResult<T> Failure(List<string> errors, string? message = null)
        {
            return new PaginatedResult<T>
            {
                IsSuccess = false,
                Message = message ?? "Operation failed",
                Errors = errors
            };
        }
    }
}