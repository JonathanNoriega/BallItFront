import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-advice-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" [class.acierto]="type === 'acierto'" [class.mejora]="type === 'mejora'">
      <div class="card-header">
        <span class="card-icon">{{ type === 'acierto' ? '✅' : '💪' }}</span>
        <span class="card-title">{{ title }}</span>
      </div>
      <p class="card-advice">{{ advice }}</p>
      @if (tip) {
        <button class="tip-toggle" (click)="tipOpen = !tipOpen">
          💡 {{ tipOpen ? 'Ocultar consejo' : 'Intenta esto' }}
          <span class="chevron" [class.open]="tipOpen">›</span>
        </button>
        @if (tipOpen) {
          <div class="tip-content">{{ tip }}</div>
        }
      }
    </div>
  `,
  styles: [`
    .card {
      background: white;
      border-radius: 14px;
      padding: 14px 16px;
      margin-bottom: 10px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      border-left: 4px solid #e5e7eb;
    }
    .card.acierto { border-left-color: #22C55E; }
    .card.mejora  { border-left-color: #FF5A1F; }
    .card-header { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 6px; }
    .card-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
    .card-title { font-weight: 700; font-size: 14px; color: #1B2B4B; }
    .card-advice { font-size: 14px; color: #374151; line-height: 1.5; margin: 0; }
    .tip-toggle {
      display: flex; align-items: center; gap: 6px;
      margin-top: 10px; background: none; border: none;
      color: #FF5A1F; font-size: 13px; font-weight: 600;
      cursor: pointer; padding: 0;
    }
    .chevron { display: inline-block; transition: transform 0.2s; font-size: 16px; }
    .chevron.open { transform: rotate(90deg); }
    .tip-content {
      margin-top: 8px; padding: 10px 12px;
      background: #fff3ed; border-radius: 8px;
      font-size: 13px; color: #374151; line-height: 1.5;
    }
  `]
})
export class AdviceCardComponent {
  @Input() type: 'acierto' | 'mejora' = 'mejora';
  @Input() title = '';
  @Input() advice = '';
  @Input() tip?: string;
  tipOpen = false;
}
