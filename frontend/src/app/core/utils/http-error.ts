import { HttpErrorResponse } from '@angular/common/http';

export function extractApiErrorMessage(error: unknown, fallback = 'Request failed.'): string {
  if (!(error instanceof HttpErrorResponse)) return fallback;

  if (error.status === 0) return 'Server unreachable. Is the gateway running?';

  const body = error.error as any;

  if (typeof body === 'string' && body.trim()) return body;

  if (body?.errors && typeof body.errors === 'object') {
    const firstError = Object.values(body.errors).find((value) => typeof value === 'string');
    if (typeof firstError === 'string' && firstError.trim()) return firstError;
  }

  if (typeof body?.message === 'string' && body.message.trim()) return body.message;
  if (typeof body?.error === 'string' && body.error.trim()) return body.error;

  return error.status ? `${fallback} (${error.status})` : fallback;
}
