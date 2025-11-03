namespace Whitebird.App.Features.Common.Service
{
    public class Result<T>
    {
        public bool Success { get; set; } = true;
        public string Message { get; set; } = "OK";
        public T? Data { get; set; }

        public static Result<T> Ok(T data, string message = "OK")
        {
            return new Result<T> { Success = true, Data = data, Message = message };
        }

        public static Result<T> Fail(string message)
        {
            return new Result<T> { Success = false, Data = default, Message = message };
        }
    }
}
