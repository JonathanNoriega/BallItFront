import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppStateService } from '../../state/app-state.service';
import { ActionBarComponent } from '../../components/action-bar/action-bar.component';
import { StreakBadgeComponent } from '../../components/streak-badge/streak-badge.component';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, ActionBarComponent, StreakBadgeComponent],
  template: `
    <div class="page">
      <div class="hero">
        <div class="logo">🏀</div>
        <h1 class="app-name">BallIt</h1>
        <p class="tagline">Analiza tu tiro. Mejora tu juego.</p>
      </div>

      @if (streak > 0) {
        <div class="streak-section">
          <app-streak-badge [streak]="streak" />
          <p class="streak-msg">¡Llevas {{ streak }} {{ streak === 1 ? 'día' : 'días' }} entrenando seguido!</p>
        </div>
      }

      <div class="main-actions">
        <button class="btn-primary btn-big" (click)="goAnalyze()">
          🏀 Analizar mi tiro
        </button>
        <button class="btn-outline btn-big" (click)="goHistory()">
          📋 Mis entrenamientos
        </button>
      </div>

      @if (streak === 0) {
        <div class="empty-state">
          <p class="empty-text">Empieza hoy tu primer análisis y descubre en qué mejorar 💪</p>
        </div>
      }

      <div class="pb-bar"></div>
    </div>
  `,
  styles: [`
    .page { padding: 0 20px 100px; min-height: 100vh; background: #FAFAF7; }
    .hero { text-align: center; padding: 60px 0 32px; }
    .logo { font-size: 64px; line-height: 1; margin-bottom: 8px; }
    .app-name { font-size: 36px; font-weight: 900; color: #1B2B4B; margin: 0 0 8px; }
    .tagline { font-size: 16px; color: #6b7280; margin: 0; }
    .streak-section { text-align: center; margin-bottom: 28px; }
    .streak-msg { font-size: 14px; color: #6b7280; margin: 6px 0 0; }
    .main-actions { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
    .btn-primary {
      background: #FF5A1F; color: white; border: none;
      border-radius: 14px; font-size: 17px; font-weight: 700;
      cursor: pointer; transition: opacity 0.15s;
    }
    .btn-outline {
      background: transparent; color: #FF5A1F;
      border: 2px solid #FF5A1F; border-radius: 14px;
      font-size: 16px; font-weight: 600; cursor: pointer;
    }
    .btn-big { min-height: 56px; width: 100%; padding: 0 20px; }
    .btn-primary:hover { opacity: 0.9; }
    .empty-state { text-align: center; padding: 20px; background: white; border-radius: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .empty-text { font-size: 15px; color: #6b7280; margin: 0; line-height: 1.5; }
    .pb-bar { height: 20px; }
  `]
})
export class InicioComponent implements OnInit {
  streak = 0;

  constructor(private router: Router, private appState: AppStateService) {}

  ngOnInit() {
    this.appState.streak.subscribe(s => this.streak = s);
  }

  goAnalyze() { this.router.navigate(['/configuracion']); }
  goHistory()  { this.router.navigate(['/historial']); }
}
