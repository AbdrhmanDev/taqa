import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'Unexpected error occurred';

      if (error.error) {
        if (typeof error.error === 'string') {
          try {
            const parsed = JSON.parse(error.error);
            message = parsed.message || error.error;
          } catch {
            message = error.error;
          }
        } else if (typeof error.error === 'object') {
          message = error.error.message || message;
        }
      }

      messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: message,
      });

      return throwError(() => error);
    }),
  );
};
