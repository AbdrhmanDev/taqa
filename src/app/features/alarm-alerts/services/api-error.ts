import { HttpErrorResponse } from '@angular/common/http';

/** Turns an API error (ProblemDetails / validation errors / plain text) into one readable line. */
export function apiErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (!(err instanceof HttpErrorResponse)) return fallback;

  switch (err.status) {
    case 0:
      return 'Cannot reach the server';
    case 401:
      return 'Your session has expired, please log in again';
    case 403:
      return 'You do not have permission to do this';
    case 404:
      return 'Not found (it may have been deleted)';
    case 409:
      return 'Someone else changed this item. Reload it and try again';
  }

  const body = err.error;
  if (typeof body === 'string' && body.trim()) return body;
  if (body?.errors && typeof body.errors === 'object') {
    const first = Object.values(body.errors as Record<string, string[]>).flat()[0];
    if (first) return first;
  }
  return body?.detail || body?.title || body?.message || fallback;
}
