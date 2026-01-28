import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { Header } from '../layout/header';
import { EmployeesService } from '../../core/employees/employees.service';
import { DepartmentsService, DepartmentResponse } from '../../core/departments/departments.service';
import { RolesService, RoleResponse } from '../../core/roles/roles.service';

@Component({
  selector: 'app-employee-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Header],
  template: `
    <app-header />

    <div style="max-width: 900px; margin: 40px auto; padding: 0 16px; font-family: system-ui;">
      <h2>Create Employee</h2>

      <p *ngIf="loadingRef" style="opacity:.8">Loading departments & roles…</p>
      <p *ngIf="refError" style="color:#ff4d4f">{{ refError }}</p>

      <form class="card" [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="grid">
          <label>
            First name
            <input formControlName="firstName" />
          </label>

          <label>
            Last name
            <input formControlName="lastName" />
          </label>

          <label>
            Email
            <input formControlName="email" type="email" />
          </label>

          <label>
            Phone
            <input formControlName="phone" />
          </label>

          <label>
            Hire date
            <input formControlName="hireDate" type="date" />
          </label>

          <label>
            Base salary
            <input formControlName="baseSalary" type="number" step="0.01" />
          </label>

          <label>
            Department
            <select formControlName="departmentId">
              <option [ngValue]="null">-- choose department --</option>
              <option *ngFor="let d of departments" [value]="d.id">
                {{ d.name }}
              </option>
            </select>
          </label>

          <label>
            Role
            <select formControlName="roleId">
              <option [ngValue]="null">-- choose role --</option>
              <option *ngFor="let r of roles" [value]="r.id">
                {{ r.name }}
              </option>
            </select>
          </label>
        </div>

        <div style="display:flex; gap:10px; align-items:center; margin-top: 14px;">
          <button type="submit" [disabled]="form.invalid || loading || loadingRef">
            {{ loading ? 'Creating…' : 'Create' }}
          </button>

          <span *ngIf="error" style="color:#ff4d4f">{{ error }}</span>
          <span *ngIf="success" style="color:#2ecc71">Created ✅</span>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .card {
      margin-top: 14px;
      padding: 16px;
      border: 1px solid rgba(0,0,0,0.12);
      border-radius: 12px;
      display: block;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    label {
      display: grid;
      gap: 6px;
      font-size: 14px;
    }
    input, select {
      padding: 10px 12px;
      border-radius: 10px;
      border: 1px solid rgba(0,0,0,0.18);
      outline: none;
      background: transparent;
    }
    button {
      padding: 10px 12px;
      border-radius: 10px;
      border: 0;
      cursor: pointer;
      font-weight: 600;
    }
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    @media (max-width: 700px) {
      .grid { grid-template-columns: 1fr; }
    }
  `],
})
export class EmployeeCreate {
  loading = false;
  error = '';
  success = false;

  loadingRef = true;
  refError = '';

  departments: DepartmentResponse[] = [];
  roles: RoleResponse[] = [];

  form;

  constructor(
    private fb: FormBuilder,
    private employees: EmployeesService,
    private departmentsApi: DepartmentsService,
    private rolesApi: RolesService,
    private router: Router
  ) {
    this.form = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      hireDate: ['', [Validators.required]],
      baseSalary: [0, [Validators.required, Validators.min(0)]],
      departmentId: [null, [Validators.required]],
      roleId: [null, [Validators.required]],
    });

    this.loadRefs();
  }

  private loadRefs(): void {
    this.loadingRef = true;
    this.refError = '';

    forkJoin({
      departments: this.departmentsApi.list(),
      roles: this.rolesApi.list(),
    }).subscribe({
      next: ({ departments, roles }) => {
        this.departments = departments;
        this.roles = roles;
        this.loadingRef = false;
      },
      error: (e) => {
        this.loadingRef = false;
        const msg = e?.error?.message || e?.error?.error || e?.message || 'Failed to load departments/roles';
        this.refError = typeof msg === 'string' ? msg : JSON.stringify(msg);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = '';
    this.success = false;

    const v = this.form.getRawValue();

    this.employees.create({
      firstName: v.firstName!,
      lastName: v.lastName!,
      email: v.email!,
      phone: v.phone || null,
      hireDate: v.hireDate!,
      baseSalary: Number(v.baseSalary),
      departmentId: Number(v.departmentId),
      roleId: Number(v.roleId),
    }).subscribe({
      next: (created) => {
        this.loading = false;
        this.success = true;
        this.router.navigate(['/employees', created.id]);
      },
      error: (e) => {
        this.loading = false;
        const msg = e?.error?.message || e?.error?.error || e?.message || 'Create failed';
        this.error = typeof msg === 'string' ? msg : JSON.stringify(msg);
      },
    });
  }
}
