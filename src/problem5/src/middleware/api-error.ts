export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static notFound(message: string): ApiError {
    return new ApiError(404, 'NOT_FOUND', message);
  }
}
