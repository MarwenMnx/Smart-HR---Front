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

    <main class="page">
      <div class="container">
        <div class="pageHead">
          <div>
            <h1 class="title">Create Employee</h1>
            <p class="subtitle">Add a new employee record</p>
          </div>

          <div class="headRight">
            <span class="pill pill-loading" *ngIf="loadingRef">Loading reference data…</span>
            <span class="pill pill-error" *ngIf="refError">Reference data error</span>
          </div>
        </div>

        <div class="alert alert-error" *ngIf="refError">
          <span class="alertIcon" aria-hidden="true">!</span>
          <div class="alertText">{{ refError }}</div>
        </div>

        <form class="card" [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="cardHead">
            <div class="cardTitleWrap">
              <div class="cardIcon" aria-hidden="true">👤</div>
              <div>
                <h2 class="cardTitle">Employee details</h2>
                <p class="cardSub">Required fields are marked by validation</p>
              </div>
            </div>
          </div>

          <div class="divider"></div>

          <div class="cardBody">
            <div class="grid">
              <div class="field">
                <label>First name</label>
                <input formControlName="firstName" placeholder="e.g. Sarah" />
              </div>

              <div class="field">
                <label>Last name</label>
                <input formControlName="lastName" placeholder="e.g. Smith" />
              </div>

              <div class="field">
                <label>Email</label>
                <input formControlName="email" type="email" placeholder="email@company.com" />
              </div>

              <div class="field">
                <label>Phone</label>
                <input formControlName="phone" placeholder="+216 ..." />
              </div>

              <div class="field">
                <label>Hire date</label>
                <input formControlName="hireDate" type="date" />
              </div>

              <div class="field">
                <label>Base salary</label>
                <input formControlName="baseSalary" type="number" step="0.01" />
              </div>

              <div class="field">
                <label>Department</label>
                <select formControlName="departmentId">
                  <option [ngValue]="null">-- choose department --</option>
                  <option *ngFor="let d of departments" [value]="d.id">
                    {{ d.name }}
                  </option>
                </select>
              </div>

              <div class="field">
                <label>Role</label>
                <select formControlName="roleId">
                  <option [ngValue]="null">-- choose role --</option>
                  <option *ngFor="let r of roles" [value]="r.id">
                    {{ r.name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="footer">
              <button class="btn btn-primary" type="submit" [disabled]="form.invalid || loading || loadingRef">
                {{ loading ? 'Creating…' : 'Create employee' }}
              </button>

              <div class="result">
                <span class="msg msg-error" *ngIf="error">{{ error }}</span>
                <span class="msg msg-ok" *ngIf="success">Created ✅</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  `,
  styles: [`
    :host { display:block; }

    .page {
      background: #f6f7fb;
      padding: 28px 16px 48px;
      min-height: calc(100vh - 64px);
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
    }

    .container { max-width: 980px; margin: 0 auto; }

    .pageHead {
      display:flex;
      align-items:flex-start;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 14px;
    }

    .title {
      margin: 0;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.2px;
      color: #121C4E;
    }

    .subtitle {
      margin: 6px 0 0;
      font-size: 14px;
      color: rgba(0,0,0,0.65);
    }

    .headRight { display:flex; gap: 8px; align-items:center; flex-wrap: wrap; }

    /* Pills */
    .pill {
      display:inline-flex;
      align-items:center;
      padding: 6px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 850;
      border: 1px solid rgba(0,0,0,0.12);
      color: #121C4E;
      background: rgba(18, 28, 78, 0.04);
      white-space: nowrap;
    }
    .pill-loading { background: rgba(0,0,0,0.04); }
    .pill-error { background: rgba(211, 47, 47, 0.08); border-color: rgba(211, 47, 47, 0.22); color: #8b1c1c; }

    /* Alerts */
    .alert {
      border-radius: 16px;
      padding: 12px 14px;
      border: 1px solid rgba(0,0,0,0.10);
      background: #fff;
      display:flex;
      gap: 10px;
      align-items:flex-start;
      margin-bottom: 12px;
    }

    .alertIcon {
      width: 22px;
      height: 22px;
      border-radius: 7px;
      display:grid;
      place-items:center;
      font-weight: 900;
      margin-top: 1px;
    }

    .alertText { font-size: 13px; color: rgba(0,0,0,0.78); white-space: pre-wrap; }

    .alert-error {
      background: rgba(211, 47, 47, 0.06);
      border-color: rgba(211, 47, 47, 0.18);
    }
    .alert-error .alertIcon {
      color: #d32f2f;
      background: rgba(211, 47, 47, 0.14);
      border: 1px solid rgba(211, 47, 47, 0.18);
    }

    /* Card */
    .card {
      background: #fff;
      border: 1px solid rgba(0,0,0,0.08);
      border-radius: 16px;
      box-shadow: 0 8px 22px rgba(0,0,0,0.05);
      overflow: hidden;
    }

    .cardHead {
      padding: 16px;
      display:flex;
      align-items:flex-start;
      justify-content: space-between;
      gap: 12px;
    }

    .cardTitleWrap {
      display:flex;
      align-items:flex-start;
      gap: 10px;
    }

    .cardIcon {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      display:grid;
      place-items:center;
      background: rgba(18, 28, 78, 0.05);
      border: 1px solid rgba(18, 28, 78, 0.10);
      font-size: 16px;
    }

    .cardTitle {
      margin: 0;
      font-size: 16px;
      font-weight: 900;
      color: #121C4E;
    }

    .cardSub {
      margin: 4px 0 0;
      font-size: 12px;
      color: rgba(0,0,0,0.62);
    }

    .divider { height: 1px; background: rgba(0,0,0,0.08); }

    .cardBody { padding: 16px; }

    /* Form grid */
    .grid {
      display:grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .field {
      display:grid;
      gap: 7px;
    }

    label {
      font-size: 13px;
      font-weight: 800;
      color: rgba(0,0,0,0.72);
    }

    input, select {
      padding: 11px 12px;
      border-radius: 12px;
      border: 1px solid rgba(18, 28, 78, 0.18);
      outline: none;
      background: #fff;
      font-size: 14px;
      transition: box-shadow 0.2s ease, border-color 0.2s ease;
    }

    input:focus, select:focus {
      border-color: rgba(238, 39, 34, 0.55);
      box-shadow: 0 0 0 4px rgba(238, 39, 34, 0.12);
    }

    select {
      appearance: none;
      background-image:
        linear-gradient(45deg, transparent 50%, rgba(0,0,0,0.55) 50%),
        linear-gradient(135deg, rgba(0,0,0,0.55) 50%, transparent 50%);
      background-position:
        calc(100% - 18px) calc(50% - 2px),
        calc(100% - 13px) calc(50% - 2px);
      background-size: 5px 5px, 5px 5px;
      background-repeat: no-repeat;
      padding-right: 36px;
    }

    /* Footer actions */
    .footer {
      margin-top: 14px;
      display:flex;
      align-items:center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .result { display:flex; align-items:center; gap: 10px; }

    .msg {
      font-size: 13px;
      font-weight: 700;
    }
    .msg-error { color: #d32f2f; white-space: pre-wrap; }
    .msg-ok { color: #2e7d32; }

    /* Buttons */
    .btn {
      border: 1px solid transparent;
      border-radius: 12px;
      padding: 11px 14px;
      font-weight: 900;
      cursor: pointer;
      user-select: none;
      line-height: 1;
      font-size: 14px;
      transition: transform 0.02s ease, box-shadow 0.2s ease, opacity 0.2s ease;
    }
    .btn:active { transform: translateY(1px); }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; transform:none; }

    .btn-primary {
      background: #EE2722;
      color: #fff;
      box-shadow: 0 10px 18px rgba(238, 39, 34, 0.18);
    }
    .btn-primary:hover:not(:disabled) { box-shadow: 0 14px 24px rgba(238, 39, 34, 0.22); }

    @media (max-width: 700px) {
      .grid { grid-template-columns: 1fr; }
      .pageHead { flex-direction: column; align-items: stretch; }
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
