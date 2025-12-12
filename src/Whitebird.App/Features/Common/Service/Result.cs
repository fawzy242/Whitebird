namespace Whitebird.App.Features.Common.Service
{
    public class Result<T>
    {
        public bool IsSuccess { get; set; }
        public string? Message { get; set; }
        public T? Data { get; set; }
        public List<string> Errors { get; set; } = new();

        public static Result<T> Success(T data, string? message = null)
        {
            return new Result<T>
            {
                IsSuccess = true,
                Data = data,
                Message = message ?? "Operation completed successfully"
            };
        }

        public static Result<T> Failure(string error, string? message = null)
        {
            return new Result<T>
            {
                IsSuccess = false,
                Message = message ?? "Operation failed",
                Errors = new List<string> { error }
            };
        }

        public static Result<T> Failure(List<string> errors, string? message = null)
        {
            return new Result<T>
            {
                IsSuccess = false,
                Message = message ?? "Operation failed",
                Errors = errors
            };
        }
    }

    // Non-generic version for operations without return data
    public class Result
    {
        public bool IsSuccess { get; set; }
        public string? Message { get; set; }
        public List<string> Errors { get; set; } = new();

        public static Result Success(string? message = null)
        {
            return new Result
            {
                IsSuccess = true,
                Message = message ?? "Operation completed successfully"
            };
        }

        public static Result Failure(string error, string? message = null)
        {
            return new Result
            {
                IsSuccess = false,
                Message = message ?? "Operation failed",
                Errors = new List<string> { error }
            };
        }
    }
}