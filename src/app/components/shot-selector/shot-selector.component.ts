import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VerdictChipComponent } from '../verdict-chip/verdict-chip.component';
import { Shot } from '../../models/analyze.model';

@Component({
  selector: 'app-shot-selector',
  standalone: true,
  imports: [CommonModule, VerdictChipComponent],
  template: `
    <div class="selector-wrapper">
      <div class="selector-scroll">
        @for (shot of shots; track shot.n; let i = $index) {
          <button
            class="shot-btn"
            [class.selected]="i === selectedIndex"
            (click)="shotSelected.emit(i)">
            <span class="shot-num">Tiro {{ shot.n }}</span>
            <app-verdict-chip [verdict]="shot.verdict" size="sm" />
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .selector-wrapper {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      padding: 8px 16px;
    }
    .selector-scroll {
      display: flex;
      gap: 10px;
      width: max-content;
    }
    .shot-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 10px 14px;
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      cursor: pointer;
      transition: border-color 0.15s, box-shadow 0.15s;
      min-width: 80px;
    }
    .shot-btn.selected {
      border-color: #FF5A1F;
      box-shadow: 0 0 0 3px rgba(255,90,31,0.15);
    }
    .shot-num {
      font-weight: 700;
      font-size: 13px;
      color: #1B2B4B;
    }
  `]
})
export class ShotSelectorComponent {
  @Input() shots: Shot[] = [];
  @Input() selectedIndex = 0;
  @Output() shotSelected = new EventEmitter<number>();
}
