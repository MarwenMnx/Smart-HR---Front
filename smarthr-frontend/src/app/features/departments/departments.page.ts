import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { inject } from '@angular/core';
import { Header } from '../layout/header';
import { DepartmentsActions } from './store/departments.actions';
import {
  selectDepartmentsCreating,
  selectDepartmentsError,
  selectDepartmentsItems,
  selectDepartmentsLoading,
  selectDeletingIds,
} from './store/departments.selectors';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Header],
  template: `
    <app-header />

    <main class="page">
      <div class="container">
        <div class="pageHead">
          <div>
            <h1 class="title">Departments</h1>
            <p class="subtitle">Manage company departments</p>
          </div>

          <button class="btn btn-ghost" (click)="reload()">Reload</button>
        </div>

        <div class="card">
          <div class="cardHead">
            <div>
              <h2 class="cardTitle">Add department</h2>
              <p class="cardSub">Create a new department</p>
            </div>
          </div>

          <div class="divider"></div>

          <div class="cardBody">
            <form class="formRow" [formGroup]="form" (ngSubmit)="create()">
              <div class="field">
                <label>Name</label>
                <input formControlName="name" placeholder="e.g. Engineering" />
              </div>

              <button class="btn btn-primary" type="submit" [disabled]="form.invalid || (creating$ | async)">
                {{ (creating$ | async) ? 'Creating…' : 'Create' }}
              </button>
            </form>

            <div class="inlineAlert inlineAlertError" *ngIf="(error$ | async) as err" [style.display]="err ? 'flex' : 'none'">
              <span class="inlineIcon" aria-hidden="true">!</span>
              <span class="inlineText">{{ err }}</span>
            </div>
          </div>
        </div>

        <section class="card cardSpacing">
          <div class="cardHead">
            <div>
              <h2 class="cardTitle">Directory</h2>
              <p class="cardSub">All departments</p>
            </div>

            <span class="pill" *ngIf="(items$ | async) as items">Total: {{ items.length }}</span>
          </div>

          <div class="divider"></div>

          <div class="cardBody">
            <div class="state" *ngIf="(loading$ | async)">
              <div class="spinner" aria-hidden="true"></div>
              <div>Loading…</div>
            </div>

            <ng-container *ngIf="(items$ | async) as items">
              <div class="empty" *ngIf="!items.length && !(loading$ | async)">
                No departments yet.
              </div>

              <div class="list">
                <div class="row" *ngFor="let d of items">
                  <div class="left">
                    <div class="avatar" aria-hidden="true">{{ (d.name || '?')[0] | uppercase }}</div>
                    <div>
                      <div class="name">{{ d.name }}</div>
                      <div class="meta">ID: <span class="mono">{{ d.id }}</span></div>
                    </div>
                  </div>

                  <button
                    class="btn btn-danger"
                    (click)="delete(d.id); $event.stopPropagation()"
                    [disabled]="(deletingIds$ | async)?.[d.id]"
                    title="Delete department"
                  >
                    {{ (deletingIds$ | async)?.[d.id] ? 'Deleting…' : 'Delete' }}
                  </button>
                </div>
              </div>
            </ng-container>
          </div>
        </section>
      </div>
    </main>
  `,
  styles: [`
    .page { background:#f6f7fb; padding:28px 16px 48px; min-height:calc(100vh - 64px); font-family:system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; }
    .container { max-width:980px; margin:0 auto; }
    .pageHead { display:flex; justify-content:space-between; gap:12px; margin-bottom:14px; align-items:flex-start; }
    .title { margin:0; font-size:26px; font-weight:800; color:#121C4E; }
    .subtitle { margin:6px 0 0; color:rgba(0,0,0,.65); }

    .card { background:#fff; border:1px solid rgba(0,0,0,.08); border-radius:16px; box-shadow:0 8px 22px rgba(0,0,0,.05); overflow:hidden; }
    .cardSpacing { margin-top:14px; }
    .cardHead { padding:16px; display:flex; justify-content:space-between; align-items:flex-start; gap:12px; }
    .cardTitle { margin:0; font-size:16px; font-weight:900; color:#121C4E; }
    .cardSub { margin:4px 0 0; font-size:12px; color:rgba(0,0,0,.62); }
    .divider { height:1px; background:rgba(0,0,0,.08); }
    .cardBody { padding:16px; }

    .formRow { display:flex; gap:12px; align-items:end; flex-wrap:wrap; }
    .field { display:grid; gap:7px; }
    label { font-size:13px; font-weight:800; color:rgba(0,0,0,.72); }
    input { padding:11px 12px; border-radius:12px; border:1px solid rgba(18,28,78,.18); outline:none; background:#fff; min-width:260px; }
    input:focus { border-color: rgba(238, 39, 34, 0.55); box-shadow: 0 0 0 4px rgba(238, 39, 34, 0.12); }

    .btn { border-radius:12px; padding:11px 14px; font-weight:900; cursor:pointer; border:1px solid transparent; }
    .btn-primary { background:#EE2722; color:#fff; box-shadow:0 10px 18px rgba(238,39,34,.18); }
    .btn-ghost { background:transparent; border-color:rgba(18,28,78,.20); color:#121C4E; }
    .btn-danger { background:rgba(211,47,47,.08); border-color:rgba(211,47,47,.22); color:#8b1c1c; }

    .pill { display:inline-flex; padding:6px 10px; border-radius:999px; font-size:12px; font-weight:900; border:1px solid rgba(0,0,0,.12); background:rgba(18,28,78,.04); color:#121C4E; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }

    .inlineAlert { margin-top:12px; gap:10px; align-items:flex-start; border-radius:14px; padding:10px 12px; border:1px solid rgba(0,0,0,.10); }
    .inlineAlertError { background: rgba(211,47,47,.06); border-color: rgba(211,47,47,.18); }
    .inlineIcon { width:20px; height:20px; border-radius:6px; display:grid; place-items:center; font-weight:900; color:#d32f2f; background:rgba(211,47,47,.14); border:1px solid rgba(211,47,47,.18); }
    .inlineText { font-size:13px; color:rgba(0,0,0,.78); white-space:pre-wrap; }

    .state { display:flex; gap:10px; align-items:center; color:rgba(0,0,0,.7); }
    .spinner { width:18px; height:18px; border-radius:999px; border:2px solid rgba(0,0,0,.16); border-top-color:rgba(238,39,34,.8); animation: spin .9s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .list { display:grid; gap:10px; }
    .row { display:flex; justify-content:space-between; align-items:center; gap:12px; padding:12px; border:1px solid rgba(0,0,0,.08); border-radius:14px; background:rgba(18,28,78,.02); }
    .left { display:flex; gap:10px; align-items:center; min-width:0; }
    .avatar { width:34px; height:34px; border-radius:12px; display:grid; place-items:center; font-weight:900; color:#121C4E; background:rgba(18,28,78,.06); border:1px solid rgba(18,28,78,.12); flex:0 0 auto; }
    .name { font-weight:900; color:#121C4E; }
    .meta { font-size:12px; color:rgba(0,0,0,.62); }
    .empty { color:rgba(0,0,0,.65); font-size:13px; }

    @media (max-width: 720px) { input { min-width: 200px; } .pageHead { flex-direction: column; align-items: stretch; } }
  `],
})
export class DepartmentsPage {
  private store = inject(Store);
  private fb = inject(FormBuilder);

  items$ = this.store.select(selectDepartmentsItems);
  loading$ = this.store.select(selectDepartmentsLoading);
  error$ = this.store.select(selectDepartmentsError);
  creating$ = this.store.select(selectDepartmentsCreating);
  deletingIds$ = this.store.select(selectDeletingIds);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
  });

  constructor() {
    this.reload();
  }

  reload(): void {
    this.store.dispatch(DepartmentsActions.load());
  }

  create(): void {
    if (this.form.invalid) return;

    const name = String(this.form.getRawValue().name || '').trim();
    if (!name) return;

    this.store.dispatch(DepartmentsActions.create({ name }));
    this.form.reset({ name: '' });
  }

  delete(id: number): void {
    this.store.dispatch(DepartmentsActions.delete({ id }));
  }
}

