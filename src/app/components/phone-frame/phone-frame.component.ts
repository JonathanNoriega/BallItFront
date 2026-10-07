import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-phone-frame',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="phone-frame">
      <ng-content />
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; min-height: 100vh; background: #d4d4d4; }
    .phone-frame {
      max-width: 430px;
      min-height: 100vh;
      margin: 0 auto;
      background: #FAFAF7;
      position: relative;
      overflow-x: hidden;
      box-shadow: 0 0 40px rgba(0,0,0,0.18);
    }
  `]
})
export class PhoneFrameComponent {}
