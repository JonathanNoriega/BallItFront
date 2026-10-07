import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SessionConfig {
  arm: 'right' | 'left';
  camera: string;
  focus: string;
  goal: string | null;
}

@Injectable({ providedIn: 'root' })
export class SessionConfigService {
  private readonly defaults: SessionConfig = {
    arm: 'right',
    camera: 'frente',
    focus: 'completo',
    goal: null,
  };

  private config$ = new BehaviorSubject<SessionConfig>({ ...this.defaults });

  readonly config = this.config$.asObservable();

  get snapshot(): SessionConfig {
    return this.config$.value;
  }

  update(patch: Partial<SessionConfig>): void {
    this.config$.next({ ...this.config$.value, ...patch });
  }

  reset(): void {
    this.config$.next({ ...this.defaults });
  }
}
