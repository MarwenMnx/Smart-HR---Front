import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Observable, catchError, map, of, startWith, switchMap } from 'rxjs';
import { Header } from '../layout/header';
import { EmployeesService, EmployeeResponse } from '../../core/employees/employees.service';

type Vm =
  | { state: 'loading' }
  | { state: 'ok'; employee: EmployeeResponse }
  | { state: 'error'; message: string };

@Component({
  selector: 'app-employee-details',
  standalone: true,
  imports: [CommonModule, Header],
  template: `
    <app-header />

    <div style="max-width: 900px; margin: 40px auto; padding: 0 16px; font-family: system-ui;">
      <h2>Employee Details</h2>

      <ng-container *ngIf="vm$ | async as vm">
        <p *ngIf="vm.state === 'loading'">Loading employee…</p>

        <div *ngIf="vm.state === 'error'">
          <p style="color:#ff4d4f">{{ vm.message }}</p>
        </div>

        <div *ngIf="vm.state === 'ok'">
          <p><strong>{{ vm.employee.firstName }} {{ vm.employee.lastName }}</strong></p>

          <ul>
            <li><b>ID:</b> {{ vm.employee.id }}</li>
            <li><b>Email:</b> {{ vm.employee.email }}</li>
            <li><b>Phone:</b> {{ vm.employee.phone || '-' }}</li>
            <li><b>Hire date:</b> {{ vm.employee.hireDate }}</li>
            <li><b>Base salary:</b> {{ vm.employee.baseSalary }}</li>
            <li><b>Department:</b> {{ vm.employee.departmentName }}</li>
            <li><b>Role:</b> {{ vm.employee.roleName }}</li>
            <li><b>Active:</b> {{ vm.employee.active }}</li>
          </ul>
        </div>
      </ng-container>
    </div>
  `,
})
export class EmployeeDetails {
  vm$: Observable<Vm>;

  constructor(route: ActivatedRoute, employees: EmployeesService) {
    this.vm$ = route.paramMap.pipe(
      map((p) => Number(p.get('id'))),
      switchMap((id) =>
        // we don't have a backend endpoint yet, so we reuse list() and pick by id
        employees.list().pipe(
          map((items) => items.find((x) => x.id === id)),
          map((emp) => {
            if (!emp) throw new Error('Employee not found');
            return { state: 'ok', employee: emp } as Vm;
          }),
          startWith({ state: 'loading' } as Vm),
          catchError((e) => of({ state: 'error', message: this.errToMsg(e) } as Vm))
        )
      )
    );
  }

  private errToMsg(e: any): string {
    const msg = e?.error?.message || e?.message || 'Request failed';
    return typeof msg === 'string' ? msg : JSON.stringify(msg);
  }
}
