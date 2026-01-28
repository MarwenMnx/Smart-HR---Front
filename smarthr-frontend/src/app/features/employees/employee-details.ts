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

    <main class="page">
      <div class="container">
        <div class="pageHead">
          <div>
            <h1 class="title">Employee Details</h1>
            <p class="subtitle">Profile and employment information</p>
          </div>
        </div>

        <ng-container *ngIf="vm$ | async as vm">
          <!-- Loading -->
          <div class="stateCard" *ngIf="vm.state === 'loading'">
            <div class="spinner" aria-hidden="true"></div>
            <div>
              <div class="stateTitle">Loading employee…</div>
              <div class="stateText">Fetching profile details.</div>
            </div>
          </div>

          <!-- Error -->
          <div class="stateCard stateError" *ngIf="vm.state === 'error'">
            <div class="stateIcon" aria-hidden="true">!</div>
            <div class="stateBody">
              <div class="stateTitle">Unable to load employee.</div>
              <div class="stateText">{{ vm.message }}</div>
            </div>
          </div>

          <!-- OK -->
          <section class="card" *ngIf="vm.state === 'ok'">
            <div class="cardHead">
              <div class="idBlock">
                <div class="avatar" aria-hidden="true">
                  {{ (vm.employee.firstName || '?')[0] | uppercase }}{{ (vm.employee.lastName || '?')[0] | uppercase }}
                </div>

                <div class="who">
                  <div class="name">{{ vm.employee.firstName }} {{ vm.employee.lastName }}</div>
                  <div class="meta">
                    <span class="muted">Employee ID</span>
                    <span class="dot">·</span>
                    <span class="mono">{{ vm.employee.id }}</span>
                  </div>
                </div>
              </div>

              <span class="pill" [class.pill-ok]="vm.employee.active" [class.pill-error]="!vm.employee.active">
                {{ vm.employee.active ? 'Active' : 'Inactive' }}
              </span>
            </div>

            <div class="divider"></div>

            <div class="cardBody">
              <div class="kvGrid">
                <div class="kv">
                  <div class="k">Email</div>
                  <div class="v">{{ vm.employee.email }}</div>
                </div>

                <div class="kv">
                  <div class="k">Phone</div>
                  <div class="v">{{ vm.employee.phone || '-' }}</div>
                </div>

                <div class="kv">
                  <div class="k">Hire date</div>
                  <div class="v">{{ vm.employee.hireDate }}</div>
                </div>

                <div class="kv">
                  <div class="k">Base salary</div>
                  <div class="v strong">{{ vm.employee.baseSalary }}</div>
                </div>

                <div class="kv">
                  <div class="k">Department</div>
                  <div class="v">{{ vm.employee.departmentName }}</div>
                </div>

                <div class="kv">
                  <div class="k">Role</div>
                  <div class="v">{{ vm.employee.roleName }}</div>
                </div>
              </div>
            </div>
          </section>
        </ng-container>
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

    .divider { height: 1px; background: rgba(0,0,0,0.08); }

    .cardBody { padding: 16px; }

    /* Identity */
    .idBlock {
      display:flex;
      align-items:center;
      gap: 12px;
      min-width: 0;
    }

    .avatar {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      display:grid;
      place-items:center;
      font-weight: 900;
      color: #121C4E;
      background: rgba(18, 28, 78, 0.06);
      border: 1px solid rgba(18, 28, 78, 0.12);
      flex: 0 0 auto;
    }

    .who { min-width: 0; }
    .name {
      font-size: 16px;
      font-weight: 900;
      color: #121C4E;
      letter-spacing: -0.1px;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 520px;
    }

    .meta {
      display:flex;
      align-items:center;
      gap: 8px;
      font-size: 12px;
      color: rgba(0,0,0,0.62);
    }

    .dot { opacity: 0.6; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }

    .muted { color: rgba(0,0,0,0.62); }

    /* Pill */
    .pill {
      display:inline-flex;
      align-items:center;
      padding: 6px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 900;
      border: 1px solid rgba(0,0,0,0.12);
      color: #121C4E;
      background: rgba(18, 28, 78, 0.04);
      white-space: nowrap;
    }

    .pill-ok { background: rgba(46, 125, 50, 0.08); border-color: rgba(46, 125, 50, 0.22); }
    .pill-error { background: rgba(211, 47, 47, 0.08); border-color: rgba(211, 47, 47, 0.22); color: #8b1c1c; }

    /* Key-value grid */
    .kvGrid {
      display:grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }

    .kv {
      border: 1px solid rgba(0,0,0,0.08);
      border-radius: 14px;
      padding: 12px;
      background: rgba(18, 28, 78, 0.02);
    }

    .k {
      font-size: 12px;
      color: rgba(0,0,0,0.55);
      margin-bottom: 6px;
    }

    .v {
      font-size: 14px;
      font-weight: 850;
      color: #121C4E;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .v.strong { font-size: 15px; }

    /* States */
    .stateCard {
      background: #fff;
      border: 1px solid rgba(0,0,0,0.08);
      border-radius: 16px;
      box-shadow: 0 8px 22px rgba(0,0,0,0.05);
      padding: 16px;
      display:flex;
      gap: 12px;
      align-items: flex-start;
    }

    .spinner {
      width: 18px;
      height: 18px;
      border-radius: 999px;
      border: 2px solid rgba(0,0,0,0.16);
      border-top-color: rgba(238, 39, 34, 0.8);
      animation: spin 0.9s linear infinite;
      margin-top: 2px;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .stateError {
      border-color: rgba(211, 47, 47, 0.20);
      background: rgba(211, 47, 47, 0.03);
    }

    .stateIcon {
      width: 22px;
      height: 22px;
      border-radius: 7px;
      display:grid;
      place-items:center;
      font-weight: 900;
      color: #d32f2f;
      background: rgba(211, 47, 47, 0.12);
      border: 1px solid rgba(211, 47, 47, 0.18);
      margin-top: 1px;
    }

    .stateBody { display:grid; gap: 6px; }
    .stateTitle { font-weight: 900; color:#121C4E; }
    .stateText { font-size: 13px; color: rgba(0,0,0,0.72); white-space: pre-wrap; }

    @media (max-width: 860px) {
      .kvGrid { grid-template-columns: 1fr; }
      .name { max-width: 260px; }
    }
  `],
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
