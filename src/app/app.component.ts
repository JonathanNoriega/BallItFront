import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PhoneFrameComponent } from './components/phone-frame/phone-frame.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PhoneFrameComponent],
  template: `
    <app-phone-frame>
      <router-outlet />
    </app-phone-frame>
  `
})
export class AppComponent {}
