import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ActionBarComponent } from '../../components/action-bar/action-bar.component';

@Component({
  selector: 'app-recortar-fragmento',
  standalone: true,
  imports: [CommonModule, FormsModule, ActionBarComponent],
  template: `
    <div class="page">
      <div class="header">
        <button class="back-btn" (click)="router.navigate(['/subir'])">‹</button>
        <h1>Recortar fragmento</h1>
      </div>

      <div class="info-card">
        <p>Selecciona el fragmento del video que contiene tu tiro. Por defecto se analiza el video completo.</p>
      </div>

      <div class="timeline-card">
        <div class="time-labels">
          <span>{{ formatTime(startS) }}</span>
          <span>{{ formatTime(endS) }}</span>
        </div>
        <div class="slider-wrapper">
          <input type="range" class="range-input start"
            [(ngModel)]="startS" [min]="0" [max]="maxS" [step]="0.1"
            (input)="clampStart()" />
          <input type="range" class="range-input end"
            [(ngModel)]="endS" [min]="0" [max]="maxS" [step]="0.1"
            (input)="clampEnd()" />
          <div class="range-track">
            <div class="range-fill"
              [style.left.%]="(startS/maxS)*100"
              [style.width.%]="((endS-startS)/maxS)*100">
            </div>
          </div>
        </div>
        <p class="duration-label">Duración seleccionada: {{ formatTime(endS - startS) }}</p>
      </div>

      <div class="reset-row">
        <button class="btn-ghost" (click)="reset()">Usar video completo</button>
      </div>

      <div class="pb-bar"></div>
    </div>

    <app-action-bar
      primaryLabel="Listo"
      (primaryClick)="listo()">
    </app-action-bar>
  `,
  styles: [`
    .page { padding: 0 20px 100px; background: #FAFAF7; min-height: 100vh; }
    .header { display: flex; align-items: center; gap: 12px; padding: 20px 0 20px; }
    .back-btn { background: none; border: none; font-size: 28px; color: #1B2B4B; cursor: pointer; padding: 0; }
    h1 { font-size: 22px; font-weight: 800; color: #1B2B4B; margin: 0; }
    .info-card { background: #fff3ed; border-radius: 12px; padding: 14px 16px; margin-bottom: 20px; font-size: 14px; color: #92400e; }
    .info-card p { margin: 0; }
    .timeline-card { background: white; border-radius: 16px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 16px; }
    .time-labels { display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; color: #FF5A1F; margin-bottom: 12px; }
    .slider-wrapper { position: relative; height: 40px; margin-bottom: 12px; }
    .range-track { position: absolute; top: 50%; left: 0; right: 0; height: 6px; background: #e5e7eb; border-radius: 3px; transform: translateY(-50%); pointer-events: none; }
    .range-fill { position: absolute; height: 100%; background: #FF5A1F; border-radius: 3px; }
    .range-input { position: absolute; width: 100%; appearance: none; -webkit-appearance: none; background: transparent; height: 40px; top: 0; left: 0; pointer-events: none; }
    .range-input::-webkit-slider-thumb { -webkit-appearance: none; width: 24px; height: 24px; border-radius: 50%; background: #FF5A1F; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.2); cursor: pointer; pointer-events: all; }
    .duration-label { font-size: 13px; color: #6b7280; margin: 0; text-align: center; }
    .reset-row { text-align: center; }
    .btn-ghost { background: none; border: none; color: #6b7280; font-size: 14px; cursor: pointer; text-decoration: underline; }
    .pb-bar { height: 20px; }
  `]
})
export class RecortarFragmentoComponent {
  startS = 0;
  endS   = 60;
  maxS   = 60;

  constructor(public router: Router) {}

  clampStart() { if (this.startS >= this.endS - 1) this.startS = this.endS - 1; }
  clampEnd()   { if (this.endS <= this.startS + 1) this.endS = this.startS + 1; }
  reset()      { this.startS = 0; this.endS = this.maxS; }
  formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }
  listo() { this.router.navigate(['/subir']); }
}
