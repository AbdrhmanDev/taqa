import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'Unexpected error occurred';

      switch (error.status) {
        case 400:
          message = error.error?.message || 'Bad Request';
          break;
        case 401:
          message = 'Unauthorized';
          break;
        case 403:
          message = 'Forbidden';
          break;
        case 404:
          message = 'Not Found';
          break;
        case 500:
          message = 'Server error';
          break;
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
