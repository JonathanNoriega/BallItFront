import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionConfigService } from '../../state/session-config.service';
import { ActionBarComponent } from '../../components/action-bar/action-bar.component';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule, ActionBarComponent],
  template: `
    <div class="page">
      <div class="header">
        <button class="back-btn" (click)="router.navigate(['/'])">‹</button>
        <h1>¿Cómo vas a tirar?</h1>
      </div>

      <section class="section">
        <h2 class="section-title">Mano de tiro</h2>
        <div class="option-row">
          <button class="option-btn" [class.selected]="arm === 'right'" (click)="arm = 'right'">
            🤚 Derecha
          </button>
          <button class="option-btn" [class.selected]="arm === 'left'" (click)="arm = 'left'">
            🤚 Izquierda
          </button>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Posición de cámara</h2>
        <div class="camera-grid">
          <button class="camera-btn" [class.selected]="true">
            <span class="cam-icon">📷</span>
            <span class="cam-label">Frente</span>
          </button>
          <button class="camera-btn disabled" disabled>
            <span class="cam-icon">📷</span>
            <span class="cam-label">Lateral</span>
            <span class="soon-badge">Próximamente</span>
          </button>
          <button class="camera-btn disabled" disabled>
            <span class="cam-icon">📷</span>
            <span class="cam-label">Diagonal</span>
            <span class="soon-badge">Próximamente</span>
          </button>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Enfoque</h2>
        <button class="option-btn selected full-width">🎯 Completo</button>
      </section>

      <section class="section">
        <h2 class="section-title">¿Cuál es tu objetivo? <span class="optional">(opcional)</span></h2>
        <textarea
          class="goal-input"
          [(ngModel)]="goal"
          placeholder="Ej: mejorar mi porcentaje de tiro libre"
          rows="3">
        </textarea>
      </section>

      <div class="pb-bar"></div>
    </div>

    <app-action-bar
      primaryLabel="Continuar"
      (primaryClick)="continuar()">
    </app-action-bar>
  `,
  styles: [`
    .page { padding: 0 20px 100px; background: #FAFAF7; min-height: 100vh; }
    .header { display: flex; align-items: center; gap: 12px; padding: 20px 0 24px; }
    .back-btn { background: none; border: none; font-size: 28px; color: #1B2B4B; cursor: pointer; padding: 0; line-height: 1; }
    h1 { font-size: 22px; font-weight: 800; color: #1B2B4B; margin: 0; }
    .section { margin-bottom: 28px; }
    .section-title { font-size: 15px; font-weight: 700; color: #1B2B4B; margin: 0 0 12px; }
    .optional { font-weight: 400; color: #9ca3af; font-size: 13px; }
    .option-row { display: flex; gap: 10px; }
    .option-btn {
      flex: 1; min-height: 52px; background: white; border: 2px solid #e5e7eb;
      border-radius: 12px; font-size: 15px; font-weight: 600; color: #374151;
      cursor: pointer; transition: all 0.15s;
    }
    .option-btn.selected { border-color: #FF5A1F; background: #fff3ed; color: #FF5A1F; }
    .option-btn.full-width { width: 100%; }
    .camera-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .camera-btn {
      display: flex; flex-direction: column; align-items: center; gap: 4px;
      padding: 14px 8px; background: white; border: 2px solid #e5e7eb;
      border-radius: 12px; cursor: pointer; position: relative; transition: all 0.15s;
    }
    .camera-btn.selected { border-color: #FF5A1F; background: #fff3ed; }
    .camera-btn.disabled { opacity: 0.5; cursor: not-allowed; }
    .cam-icon { font-size: 22px; }
    .cam-label { font-size: 13px; font-weight: 600; color: #1B2B4B; }
    .soon-badge {
      position: absolute; top: -8px; right: -4px;
      background: #e5e7eb; color: #6b7280;
      font-size: 9px; font-weight: 700; padding: 2px 6px;
      border-radius: 8px; white-space: nowrap;
    }
    .goal-input {
      width: 100%; padding: 12px 14px; border: 2px solid #e5e7eb;
      border-radius: 12px; font-size: 14px; font-family: inherit;
      resize: none; background: white; color: #374151;
    }
    .goal-input:focus { outline: none; border-color: #FF5A1F; }
    .pb-bar { height: 20px; }
  `]
})
export class ConfiguracionComponent {
  arm: 'right' | 'left' = 'right';
  goal = '';

  constructor(public router: Router, private configService: SessionConfigService) {
    const snap = configService.snapshot;
    this.arm  = snap.arm;
    this.goal = snap.goal ?? '';
  }

  continuar() {
    this.configService.update({ arm: this.arm, goal: this.goal || null });
    this.router.navigate(['/subir']);
  }
}
