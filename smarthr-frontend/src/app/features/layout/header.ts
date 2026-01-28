import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Observable, catchError, of, startWith } from 'rxjs';
import { AuthService, MeResponse } from '../../core/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="bar">
      <div class="inner">
        <div class="left">
          <a class="brand" routerLink="/dashboard" aria-label="SmartHR home">
            <span class="mark" aria-hidden="true"></span>
            <span class="brandText">SmartHR</span>
          </a>

          <nav class="nav" *ngIf="isLoggedIn" aria-label="Primary">
            <a
              routerLink="/dashboard"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: true }"
            >
              Dashboard
            </a>
            <a
              routerLink="/employees"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: true }"
            >
              Employees
            </a>
            <a routerLink="/employees/new" routerLinkActive="active">
              New Employee
            </a>
            <a routerLink="/attendance" routerLinkActive="active">
              Attendance
            </a>
            <a routerLink="/payroll" routerLinkActive="active">
              Payroll
            </a>
          </nav>
        </div>

        <div class="right" *ngIf="isLoggedIn">
          <ng-container *ngIf="me$ | async as me">
            <span class="userPill" *ngIf="me">
              <span class="avatar" aria-hidden="true">
                {{ (me.email || '?')[0] | uppercase }}
              </span>
              <span class="userText">
                <span class="email">{{ me.email }}</span>
                <span class="dot">·</span>
                <span class="role">{{ me.role }}</span>
              </span>
            </span>

            <span class="userSkeleton" *ngIf="!me">
              <span class="skDot"></span>
              <span>Loading…</span>
            </span>
          </ng-container>

          <button class="btnLogout" (click)="logout()">
            Logout
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    :host { display:block; }

    .bar {
      position: sticky;
      top: 0;
      z-index: 50;
      background: rgba(255,255,255,0.86);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(0,0,0,0.08);
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
    }

    .inner {
      max-width: 1100px;
      margin: 0 auto;
      padding: 10px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }

    .left {
      display: flex;
      align-items: center;
      gap: 14px;
      min-width: 0;
    }

    /* Brand */
    .brand {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: inherit;
      padding: 6px 8px;
      border-radius: 12px;
    }

    .brand:focus-visible {
      outline: none;
      box-shadow: 0 0 0 4px rgba(238, 39, 34, 0.14);
    }

    .mark {
      width: 28px;
      height: 28px;
      border-radius: 10px;
      background: linear-gradient(135deg, #EE2722, rgba(238, 39, 34, 0.75));
      box-shadow: 0 10px 18px rgba(238, 39, 34, 0.18);
    }

    .brandText {
      font-weight: 900;
      letter-spacing: -0.2px;
      color: #121C4E;
      font-size: 15px;
      white-space: nowrap;
    }

    /* Nav */
    .nav {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
      padding-left: 6px;
      border-left: 1px solid rgba(0,0,0,0.08);
    }

    .nav a {
      text-decoration: none;
      font-size: 13px;
      font-weight: 750;
      color: rgba(0,0,0,0.75);
      padding: 7px 10px;
      border-radius: 12px;
      border: 1px solid transparent;
      background: transparent;
      transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
      white-space: nowrap;
    }

    .nav a:hover {
      background: rgba(18, 28, 78, 0.04);
      color: rgba(0,0,0,0.85);
    }

    .nav a.active {
      background: rgba(238, 39, 34, 0.08);
      border-color: rgba(238, 39, 34, 0.22);
      color: #121C4E;
    }

    .right {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }

    /* User pill */
    .userPill {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 6px 10px;
      border-radius: 999px;
      border: 1px solid rgba(0,0,0,0.10);
      background: rgba(18, 28, 78, 0.02);
      max-width: 420px;
      min-width: 0;
    }

    .avatar {
      width: 26px;
      height: 26px;
      border-radius: 10px;
      display: grid;
      place-items: center;
      font-weight: 900;
      font-size: 12px;
      color: #121C4E;
      background: rgba(18, 28, 78, 0.06);
      border: 1px solid rgba(18, 28, 78, 0.12);
      flex: 0 0 auto;
    }

    .userText {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: rgba(0,0,0,0.72);
      min-width: 0;
    }

    .email {
      font-weight: 800;
      color: #121C4E;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 240px;
    }

    .dot { opacity: 0.6; }

    .role {
      font-weight: 800;
      color: rgba(0,0,0,0.65);
      white-space: nowrap;
    }

    /* Loading state */
    .userSkeleton {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      border-radius: 999px;
      border: 1px solid rgba(0,0,0,0.10);
      background: rgba(0,0,0,0.02);
      font-size: 13px;
      color: rgba(0,0,0,0.65);
    }

    .skDot {
      width: 10px;
      height: 10px;
      border-radius: 999px;
      background: rgba(238, 39, 34, 0.35);
      animation: pulse 1.1s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.35; }
      50% { opacity: 1; }
    }

    /* Logout button */
    .btnLogout {
      padding: 8px 12px;
      border-radius: 12px;
      border: 1px solid rgba(238, 39, 34, 0.35);
      background: transparent;
      color: #EE2722;
      font-weight: 900;
      font-size: 13px;
      cursor: pointer;
      transition: background 0.2s ease, box-shadow 0.2s ease;
      white-space: nowrap;
    }

    .btnLogout:hover {
      background: rgba(238, 39, 34, 0.08);
      box-shadow: 0 10px 18px rgba(238, 39, 34, 0.12);
    }

    .btnLogout:active { transform: translateY(1px); }

    /* Mobile friendliness */
    @media (max-width: 860px) {
      .nav { display: none; } /* keep header clean on small screens */
      .email { max-width: 160px; }
    }
  `],
})
export class Header {
  isLoggedIn = false;
  me$: Observable<MeResponse | null> = of(null);

  constructor(private auth: AuthService, private router: Router) {
    this.isLoggedIn = this.auth.isLoggedIn();

    this.me$ = this.isLoggedIn
      ? this.auth.me().pipe(
          startWith(null),
          catchError(() => of(null))
        )
      : of(null);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
