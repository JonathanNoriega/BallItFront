import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-action-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="action-bar">
      @if (secondaryLabel) {
        <button class="btn-secondary" (click)="secondaryClick.emit()" [disabled]="secondaryDisabled">
          {{ secondaryLabel }}
        </button>
      }
      <button
        class="btn-primary"
        [class.full-width]="!secondaryLabel"
        (click)="primaryClick.emit()"
        [disabled]="primaryDisabled">
        {{ primaryLabel }}
      </button>
    </div>
  `,
  styles: [`
    .action-bar {
      position: fixed;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 100%;
      max-width: 430px;
      background: white;
      padding: 12px 16px;
      padding-bottom: max(12px, env(safe-area-inset-bottom));
      box-shadow: 0 -2px 12px rgba(0,0,0,0.10);
      display: flex;
      gap: 10px;
      z-index: 100;
    }
    .btn-primary {
      flex: 2;
      min-height: 52px;
      background: #FF5A1F;
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: opacity 0.15s;
    }
    .btn-primary.full-width { flex: 1; }
    .btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
    .btn-secondary {
      flex: 1;
      min-height: 52px;
      background: transparent;
      color: #FF5A1F;
      border: 2px solid #FF5A1F;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.15s;
    }
    .btn-secondary:disabled { opacity: 0.45; cursor: not-allowed; }
  `]
})
export class ActionBarComponent {
  @Input() primaryLabel   = 'Continuar';
  @Input() secondaryLabel?: string;
  @Input() primaryDisabled   = false;
  @Input() secondaryDisabled = false;

  @Output() primaryClick   = new EventEmitter<void>();
  @Output() secondaryClick = new EventEmitter<void>();
}
