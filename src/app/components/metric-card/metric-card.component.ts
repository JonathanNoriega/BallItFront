import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VerdictChipComponent, Verdict } from '../verdict-chip/verdict-chip.component';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [CommonModule, VerdictChipComponent],
  template: `
    <div class="card">
      <p class="card-title">{{ title }}</p>
      <div class="card-value-row">
        <span class="card-value">{{ value }}</span>
        @if (unit) { <span class="card-unit">{{ unit }}</span> }
      </div>
      <p class="card-phrase">{{ phrase }}</p>
      <app-verdict-chip [verdict]="verdict" size="sm" />
    </div>
  `,
  styles: [`
    .card {
      background: white;
      border-radius: 14px;
      padding: 14px 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .card-title { font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 4px; }
    .card-value-row { display: flex; align-items: baseline; gap: 4px; margin-bottom: 4px; }
    .card-value { font-size: 28px; font-weight: 800; color: #1B2B4B; }
    .card-unit  { font-size: 14px; color: #6b7280; font-weight: 500; }
    .card-phrase { font-size: 12px; color: #6b7280; margin: 0 0 8px; line-height: 1.4; }
  `]
})
export class MetricCardComponent {
  @Input() title  = '';
  @Input() value: string | number = '';
  @Input() unit   = '';
  @Input() phrase = '';
  @Input() verdict: Verdict = 'bueno';
}
