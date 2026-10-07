import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { AnalyzeService } from '../../services/analyze.service';
import { AppStateService } from '../../state/app-state.service';

interface Step {
  icon: string;
  label: string;
  keyword: string; // palabra que aparece en response.step para activar este paso
}

const STEPS: Step[] = [
  { icon: '📤', label: 'Subiendo video',       keyword: 'Preparando' },
  { icon: '🦴', label: 'Detectando postura',   keyword: 'postura' },
  { icon: '📐', label: 'Midiendo ángulos',      keyword: 'ángulo' },
  { icon: '🤖', label: 'Generando consejos',    keyword: 'consejo' },
  { icon: '✅', label: '¡Listo!',               keyword: 'Listo' },
];

const PHRASES = [
  'Analizando tu forma de tirar...',
  'Detectando los momentos clave de tu tiro...',
  'Calculando la apertura de tu codo...',
  'Revisando tu consistencia entre tiros...',
  'Casi listo, preparando tus resultados...',
];

@Component({
  selector: 'app-procesando',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="top">
        <div class="ball-animation">🏀</div>
        <h1>Analizando tu tiro</h1>
        <p class="phrase">{{ currentPhrase }}</p>
      </div>

      <div class="steps-card">
        @for (step of steps; track step.label; let i = $index) {
          <div class="step" [class.done]="i < currentStep" [class.active]="i === currentStep">
            <div class="step-icon">
              @if (i < currentStep) { ✅ }
              @else { {{ step.icon }} }
            </div>
            <span class="step-label">{{ step.label }}</span>
            @if (i === currentStep) {
              <div class="spinner"></div>
            }
          </div>
        }
      </div>

      <div class="progress-bar-wrapper">
        <div class="progress-bar" [style.width.%]="progressPct"></div>
      </div>
      <p class="progress-label">{{ progressPct }}%</p>

      @if (error) {
        <div class="error-section">
          <p class="error-msg">{{ error }}</p>
          <button class="btn-outline" (click)="useMock()">Ver ejemplo de resultados</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { padding: 40px 24px; background: #FAFAF7; min-height: 100vh; display: flex; flex-direction: column; align-items: center; }
    .top { text-align: center; margin-bottom: 36px; }
    .ball-animation { font-size: 56px; animation: bounce 1s infinite alternate; }
    @keyframes bounce { from{transform:translateY(0)} to{transform:translateY(-12px)} }
    h1 { font-size: 22px; font-weight: 800; color: #1B2B4B; margin: 12px 0 6px; }
    .phrase { font-size: 14px; color: #6b7280; margin: 0; min-height: 20px; }
    .steps-card { width: 100%; background: white; border-radius: 16px; padding: 8px 0; box-shadow: 0 2px 12px rgba(0,0,0,0.08); margin-bottom: 24px; }
    .step { display: flex; align-items: center; gap: 12px; padding: 14px 20px; opacity: 0.4; transition: opacity 0.3s; }
    .step.done, .step.active { opacity: 1; }
    .step-icon { font-size: 20px; width: 28px; text-align: center; }
    .step-label { flex: 1; font-size: 15px; font-weight: 600; color: #374151; }
    .spinner { width: 18px; height: 18px; border: 2.5px solid #e5e7eb; border-top-color: #FF5A1F; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to{transform:rotate(360deg)} }
    .progress-bar-wrapper { width: 100%; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; margin-bottom: 8px; }
    .progress-bar { height: 100%; background: #FF5A1F; border-radius: 4px; transition: width 0.5s; }
    .progress-label { font-size: 13px; color: #9ca3af; }
    .error-section { text-align: center; margin-top: 24px; }
    .error-msg { color: #b91c1c; font-size: 14px; margin-bottom: 12px; }
    .btn-outline { background: transparent; color: #FF5A1F; border: 2px solid #FF5A1F; border-radius: 12px; padding: 12px 24px; font-size: 15px; font-weight: 600; cursor: pointer; }
  `]
})
export class ProcesandoComponent implements OnInit, OnDestroy {
  steps = STEPS;
  currentStep = 0;
  progressPct = 0;
  currentPhrase = PHRASES[0];
  backendStep = '';
  error = '';

  private subs: Subscription[] = [];
  private phraseIdx = 0;
  private analysisId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private analyzeService: AnalyzeService,
    private appState: AppStateService
  ) {}

  ngOnInit() {
    this.analysisId = this.route.snapshot.paramMap.get('id') ?? '';

    // Rotar frases motivadoras cada 12s
    const phraseTimer = interval(12000).subscribe(() => {
      this.phraseIdx = (this.phraseIdx + 1) % PHRASES.length;
      this.currentPhrase = PHRASES[this.phraseIdx];
    });
    this.subs.push(phraseTimer);

    // Polling con progreso real del backend
    const poll = this.analyzeService.pollProgress(this.analysisId)
      .pipe(takeWhile(r => r.status !== 'done' && r.status !== 'error', true))
      .subscribe({
        next: res => {
          this.progressPct = Math.round(res.progress * 100);
          this.backendStep = res.step ?? '';

          // Mapear el step del backend a nuestros pasos visuales
          const stepLower = (res.step ?? '').toLowerCase();
          if (stepLower.includes('preparando') || stepLower.includes('subiendo')) {
            this.currentStep = 0;
          } else if (stepLower.includes('postura') || stepLower.includes('detectando')) {
            this.currentStep = 1;
          } else if (stepLower.includes('ángulo') || stepLower.includes('angulo') || stepLower.includes('midiendo')) {
            this.currentStep = 2;
          } else if (stepLower.includes('consejo') || stepLower.includes('generando')) {
            this.currentStep = 3;
          }

          if (res.status === 'done' && res.result) {
            this.currentStep = STEPS.length - 1;
            this.progressPct = 100;
            this.appState.setCurrentAnalysis(res.result);
            setTimeout(() => this.router.navigate(['/resultados', this.analysisId]), 600);
          }

          if (res.status === 'error') {
            this.error = 'El análisis falló en el servidor. Puedes ver un ejemplo de resultados.';
          }
        },
        error: () => {
          this.error = 'No se pudo conectar con el servidor.';
        }
      });
    this.subs.push(poll);
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  useMock() {
    this.router.navigate(['/resultados', 'mock-analysis-001']);
  }
}
