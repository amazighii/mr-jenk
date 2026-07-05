import { HttpErrorResponse } from '@angular/common/http';

import { extractApiErrorMessage } from './http-error';

describe('extractApiErrorMessage', () => {
  it('returns the fallback for non-http errors', () => {
    expect(extractApiErrorMessage(new Error('boom'), 'Could not save.')).toBe('Could not save.');
  });

  it('returns a helpful message for network failures', () => {
    const error = new HttpErrorResponse({ status: 0 });

    expect(extractApiErrorMessage(error)).toBe('Server unreachable. Is the gateway running?');
  });

  it('prefers string response bodies and validation errors', () => {
    const stringBody = new HttpErrorResponse({ error: 'Email already exists.', status: 409 });
    const validationBody = new HttpErrorResponse({
      error: { errors: { email: 'Email is required.', password: 'Password is required.' } },
      status: 400,
    });

    expect(extractApiErrorMessage(stringBody)).toBe('Email already exists.');
    expect(extractApiErrorMessage(validationBody)).toBe('Email is required.');
  });

  it('falls back through message, error, and status suffix', () => {
    expect(extractApiErrorMessage(new HttpErrorResponse({ error: { message: 'Nope.' }, status: 403 }))).toBe(
      'Nope.',
    );
    expect(extractApiErrorMessage(new HttpErrorResponse({ error: { error: 'Not found.' }, status: 404 }))).toBe(
      'Not found.',
    );
    expect(extractApiErrorMessage(new HttpErrorResponse({ error: {}, status: 500 }), 'Try again.')).toBe(
      'Try again. (500)',
    );
  });
});
