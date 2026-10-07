import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type Verdict = 'bueno' | 'dudoso' | 'malo';

@Component({
  selector: 'app-verdict-chip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="chip" [ngClass]="verdict" [style.font-size]="fontSize">
      {{ icon }} {{ label }}
    </span>
  `,
  styles: [`
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 10px;
      border-radius: 20px;
      font-weight: 600;
      white-space: nowrap;
    }
    .chip.bueno  { background: #dcfce7; color: #15803d; }
    .chip.dudoso { background: #fef9c3; color: #a16207; }
    .chip.malo   { background: #fee2e2; color: #b91c1c; }
  `]
})
export class VerdictChipComponent {
  @Input() verdict: Verdict = 'bueno';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  get icon() {
    return this.verdict === 'bueno' ? '🟢' : this.verdict === 'dudoso' ? '🟡' : '🔴';
  }
  get label() {
    return this.verdict === 'bueno' ? 'Bueno' : this.verdict === 'dudoso' ? 'Dudoso' : 'Mejorable';
  }
  get fontSize() {
    return this.size === 'sm' ? '11px' : this.size === 'lg' ? '15px' : '13px';
  }
}
