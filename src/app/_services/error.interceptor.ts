import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            catchError(error => {
                if (error instanceof HttpErrorResponse) {

                    if (error.status === 401) {
                        return throwError(error.statusText);
                    }

                    const applicationError = error.headers.get('Application-Error');
                    if (applicationError) {
                        console.error(applicationError);
                        return throwError(applicationError);
                    }

                    const serverError = error.error;
                    const errorMessages = serverError.errors;
                    let modelStateErrors = '';

                    if (errorMessages && typeof errorMessages === 'object') {
                        for (const key in errorMessages) {
                            if (errorMessages[key]) {
                                modelStateErrors += errorMessages[key] + '\n';
                            }
                        }
                    }

                    if (!modelStateErrors && typeof serverError === 'object') {
                        return throwError('Server Error');
                    }

                    return throwError(modelStateErrors || serverError);
                }
            })
        );
    }
}

export const ErrorInterceptorProvider = {
    provide: HTTP_INTERCEPTORS,
    useClass: ErrorInterceptor,
    multi: true
};
