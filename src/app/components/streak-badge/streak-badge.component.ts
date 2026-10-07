import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-streak-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (streak > 0) {
      <span class="badge">🔥 {{ streak }} {{ streak === 1 ? 'día' : 'días' }}</span>
    }
  `,
  styles: [`
    .badge {
      display: inline-block;
      background: #fff3ed;
      color: #FF5A1F;
      border: 1.5px solid #FF5A1F;
      border-radius: 20px;
      padding: 4px 14px;
      font-weight: 700;
      font-size: 14px;
    }
  `]
})
export class StreakBadgeComponent {
  @Input() streak = 0;
}
