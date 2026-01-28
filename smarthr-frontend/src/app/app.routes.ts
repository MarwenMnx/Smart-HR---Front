import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { authGuard } from './core/auth/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
    canActivate: [
      () => {
        const router = inject(Router);
        const token = localStorage.getItem('smarthr_token');
        return token ? router.parseUrl('/dashboard') : true;
      },
    ],
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
  },

  // Employees
  {
    path: 'employees',
    canActivate: [authGuard],
    loadComponent: () => import('./features/employees/employees').then((m) => m.Employees),
  },
  {
    path: 'employees/new',
    canActivate: [authGuard],
    loadComponent: () => import('./features/employees/employee-create').then((m) => m.EmployeeCreate),
  },
  {
    path: 'employees/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/employees/employee-details').then((m) => m.EmployeeDetails),
  },

  // Attendance
  {
    path: 'attendance',
    canActivate: [authGuard],
    loadComponent: () => import('./features/attendance/attendance').then((m) => m.Attendance),
  },

  // ✅ Payroll
  {
    path: 'payroll',
    canActivate: [authGuard],
    loadComponent: () => import('./features/payroll/payroll').then((m) => m.Payroll),
  },

  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' },
];
