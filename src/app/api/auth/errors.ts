type ErrorLike = {
  message?: string;
  cause?: {
    code?: string;
    hostname?: string;
  };
};

const NETWORK_ERROR_CODES = new Set([
  'ENOTFOUND',
  'ECONNREFUSED',
  'ECONNRESET',
  'ETIMEDOUT',
  'EAI_AGAIN',
]);

export function getAuthErrorResponse(
  error: unknown,
  fallbackMessage: string,
  defaultStatus = 500
) {
  const errorLike = error as ErrorLike;
  const cause = errorLike.cause;

  if (
    errorLike.message === 'fetch failed' ||
    (cause?.code && NETWORK_ERROR_CODES.has(cause.code))
  ) {
    const hostname = cause?.hostname ? ` (${cause.hostname})` : '';

    return {
      message: `Unable to reach Supabase${hostname}. Check your NEXT_PUBLIC_SUPABASE_URL value and network/DNS access, then try again.`,
      status: 503,
    };
  }

  return {
    message: errorLike.message || fallbackMessage,
    status: defaultStatus,
  };
}
