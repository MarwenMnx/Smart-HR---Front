import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, startWith } from 'rxjs';
import { Header } from '../layout/header';
import { EmployeesService, EmployeeResponse } from '../../core/employees/employees.service';

type Vm =
  | { state: 'loading' }
  | { state: 'ok'; items: EmployeeResponse[] }
  | { state: 'error'; message: string };

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, Header],
  template: `
    <app-header />

    <div style="max-width: 900px; margin: 40px auto; padding: 0 16px; font-family: system-ui;">
      <h2>Employees</h2>

      <ng-container *ngIf="vm$ | async as vm">
        <p *ngIf="vm.state === 'loading'">Loading /api/employees…</p>

        <div *ngIf="vm.state === 'error'">
          <p style="color:#ff4d4f">{{ vm.message }}</p>
          <button (click)="reload()">Retry</button>
        </div>

        <div *ngIf="vm.state === 'ok'">
          <p style="opacity:.8">Total: {{ vm.items.length }}</p>

          <table style="width:100%; border-collapse: collapse; margin-top: 12px;">
            <thead>
              <tr>
                <th style="text-align:left; padding:8px; border-bottom:1px solid rgba(0,0,0,0.12);">ID</th>
                <th style="text-align:left; padding:8px; border-bottom:1px solid rgba(0,0,0,0.12);">Name</th>
                <th style="text-align:left; padding:8px; border-bottom:1px solid rgba(0,0,0,0.12);">Email</th>
                <th style="text-align:left; padding:8px; border-bottom:1px solid rgba(0,0,0,0.12);">Department</th>
                <th style="text-align:left; padding:8px; border-bottom:1px solid rgba(0,0,0,0.12);">Role</th>
              </tr>
            </thead>

            <tbody>
              <tr
                *ngFor="let e of vm.items"
                (click)="goToDetails(e.id)"
                style="cursor:pointer"
                onmouseover="this.style.background='rgba(0,0,0,0.04)'"
                onmouseout="this.style.background='transparent'"
              >
                <td style="padding:8px; border-bottom:1px solid rgba(0,0,0,0.08);">{{ e.id }}</td>
                <td style="padding:8px; border-bottom:1px solid rgba(0,0,0,0.08);">
                  {{ e.firstName }} {{ e.lastName }}
                </td>
                <td style="padding:8px; border-bottom:1px solid rgba(0,0,0,0.08);">{{ e.email }}</td>
                <td style="padding:8px; border-bottom:1px solid rgba(0,0,0,0.08);">{{ e.departmentName }}</td>
                <td style="padding:8px; border-bottom:1px solid rgba(0,0,0,0.08);">{{ e.roleName }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </ng-container>
    </div>
  `,
})
export class Employees {
  vm$!: Observable<Vm>;

  constructor(private employees: EmployeesService, private router: Router) {
    this.reload();
  }

  reload(): void {
    this.vm$ = this.employees.list().pipe(
      map((items) => ({ state: 'ok', items } as Vm)),
      startWith({ state: 'loading' } as Vm),
      catchError((e) => of({ state: 'error', message: this.errToMsg(e) } as Vm))
    );
  }

  goToDetails(id: number): void {
    this.router.navigate(['/employees', id]);
  }

  private errToMsg(e: any): string {
    const msg = e?.error?.message || e?.error?.error || e?.message || 'Request failed';
    return typeof msg === 'string' ? msg : JSON.stringify(msg);
  }
}
