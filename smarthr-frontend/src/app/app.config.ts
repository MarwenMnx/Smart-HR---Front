import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { jwtInterceptor } from './core/auth/jwt-interceptor';

// NgRx
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

// Departments feature
import { departmentsReducer } from './features/departments/store/departments.reducer';
import { DepartmentsEffects } from './features/departments/store/departments.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),

    // ✅ HTTP + JWT
    provideHttpClient(withInterceptors([jwtInterceptor])),

    // ✅ NgRx
    provideStore({ departments: departmentsReducer }),
    provideEffects([DepartmentsEffects]),
    provideStoreDevtools({ maxAge: 25 }),
  ],
};
