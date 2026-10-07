import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AnalyzeService } from '../../services/analyze.service';
import { AppStateService } from '../../state/app-state.service';
import { AnalysisResult, Shot } from '../../models/analyze.model';
import { HistoryEntry } from '../../models/history.model';
import { SkeletonOverlayComponent } from '../../components/skeleton-overlay/skeleton-overlay.component';
import { ShotSelectorComponent } from '../../components/shot-selector/shot-selector.component';
import { VerdictChipComponent } from '../../components/verdict-chip/verdict-chip.component';
import { AdviceCardComponent } from '../../components/advice-card/advice-card.component';
import { MetricCardComponent } from '../../components/metric-card/metric-card.component';
import { ActionBarComponent } from '../../components/action-bar/action-bar.component';
import { getScoreLabel, getScoreColor, getAnglePhrase, getImprovementTip } from '../../lib/score';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-resultados',
  standalone: true,
  imports: [
    CommonModule, SkeletonOverlayComponent, ShotSelectorComponent,
    VerdictChipComponent, AdviceCardComponent, MetricCardComponent,
    ActionBarComponent, BaseChartDirective
  ],
  template: `
    @if (!result) {
      <div class="loading">
        <div class="spinner-big"></div>
        <p>Cargando resultados...</p>
      </div>
    } @else {
      <div class="page">
        <!-- Header -->
        <div class="page-header">
          <button class="back-btn" (click)="router.navigate(['/'])">‹</button>
          <div>
            <h1>Tus resultados 🏀</h1>
            <p class="date">{{ result.created_at | date:'dd MMM yyyy · HH:mm':'':'es' }}</p>
          </div>
        </div>

        <!-- Video con overlay -->
        <div class="video-section">
          <app-skeleton-overlay
            [analysisResult]="result"
            [selectedShotIndex]="selectedShotIdx">
          </app-skeleton-overlay>
        </div>

        <!-- Shot selector -->
        <app-shot-selector
          [shots]="result.shots"
          [selectedIndex]="selectedShotIdx"
          (shotSelected)="selectShot($event)">
        </app-shot-selector>

        <div class="content">
          <!-- Puntaje -->
          <div class="score-card">
            <div class="score-circle" [style.border-color]="scoreColor">
              <span class="score-num" [style.color]="scoreColor">{{ result.summary.score }}</span>
              <span class="score-max">/100</span>
            </div>
            <div class="score-info">
              <h2 class="score-label">{{ scoreLabel }}</h2>
              <p class="score-phrase">Alineación del codo en {{ result.summary.n }} tiro{{ result.summary.n > 1 ? 's' : '' }}</p>
              <app-verdict-chip [verdict]="overallVerdict" size="md" />
            </div>
          </div>

          <!-- Aciertos -->
          <h3 class="section-title">✅ Lo que hiciste bien</h3>
          @for (card of aciertoCards; track card.title) {
            <app-advice-card
              type="acierto"
              [title]="card.title"
              [advice]="card.advice">
            </app-advice-card>
          }

          <!-- Mejoras -->
          @if (mejoraCards.length > 0) {
            <h3 class="section-title">💪 Puedes mejorar</h3>
            @for (card of mejoraCards; track card.title) {
              <app-advice-card
                type="mejora"
                [title]="card.title"
                [advice]="card.advice"
                [tip]="card.tip">
              </app-advice-card>
            }
          }

          <!-- Métricas -->
          <h3 class="section-title">📊 Tus métricas</h3>
          <div class="metrics-grid">
            <app-metric-card
              title="Apertura del codo"
              [value]="result.summary.mean | number:'1.0-1'"
              unit="°"
              [phrase]="anguloPhrase"
              [verdict]="anguloVerdict">
            </app-metric-card>
            <app-metric-card
              title="Tiros buenos"
              [value]="result.summary.n_bueno + ' de ' + result.summary.n"
              unit=""
              [phrase]="result.summary.n_bueno + ' tiro' + (result.summary.n_bueno !== 1 ? 's' : '') + ' con buena técnica'"
              [verdict]="result.summary.pct_bueno >= 50 ? 'bueno' : result.summary.pct_bueno > 0 ? 'dudoso' : 'malo'">
            </app-metric-card>
            <app-metric-card
              title="Tiros con pausa"
              [value]="result.summary.pct_pausa | number:'1.0-0'"
              unit="%"
              phrase="Pausar antes de tirar mejora la puntería"
              [verdict]="result.summary.pct_pausa >= 50 ? 'bueno' : 'dudoso'">
            </app-metric-card>
          </div>

          <!-- Gráfica -->
          <h3 class="section-title">📈 Progreso de tiros</h3>
          <div class="chart-card">
            <canvas baseChart
              [data]="chartData"
              [options]="chartOptions"
              type="line">
            </canvas>
          </div>
        </div>

        <div class="pb-bar"></div>
      </div>

      <app-action-bar
        primaryLabel="💾 Guardar"
        secondaryLabel="↔ Comparar"
        (primaryClick)="guardar()"
        (secondaryClick)="comparar()">
      </app-action-bar>
    }
  `,
  styles: [`
    .loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; gap: 16px; }
    .spinner-big { width: 40px; height: 40px; border: 3px solid #e5e7eb; border-top-color: #FF5A1F; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to{transform:rotate(360deg)} }
    .page { background: #FAFAF7; min-height: 100vh; padding-bottom: 100px; }
    .page-header { display: flex; align-items: center; gap: 12px; padding: 20px 20px 12px; }
    .back-btn { background: none; border: none; font-size: 28px; color: #1B2B4B; cursor: pointer; padding: 0; flex-shrink: 0; }
    h1 { font-size: 20px; font-weight: 800; color: #1B2B4B; margin: 0; }
    .date { font-size: 12px; color: #9ca3af; margin: 2px 0 0; }
    .video-section { background: #000; }
    .content { padding: 16px 16px 0; }
    .score-card { background: white; border-radius: 16px; padding: 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); display: flex; align-items: center; gap: 20px; margin-bottom: 24px; }
    .score-circle { width: 88px; height: 88px; border-radius: 50%; border: 5px solid; display: flex; align-items: center; justify-content: center; flex-shrink: 0; flex-direction: column; }
    .score-num { font-size: 32px; font-weight: 900; line-height: 1; }
    .score-max { font-size: 12px; color: #9ca3af; }
    .score-label { font-size: 20px; font-weight: 800; color: #1B2B4B; margin: 0 0 4px; }
    .score-phrase { font-size: 13px; color: #6b7280; margin: 0 0 8px; }
    .section-title { font-size: 16px; font-weight: 700; color: #1B2B4B; margin: 24px 0 10px; }
    .metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px; }
    .metrics-grid app-metric-card:last-child { grid-column: 1 / -1; }
    .chart-card { background: white; border-radius: 16px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 16px; }
    .pb-bar { height: 20px; }
  `]
})
export class ResultadosComponent implements OnInit {
  result: AnalysisResult | null = null;
  selectedShotIdx = 0;

  aciertoCards: { title: string; advice: string }[] = [];
  mejoraCards:  { title: string; advice: string; tip: string }[] = [];

  chartData: ChartData<'line'> = { labels: [], datasets: [] };
  chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { min: 0, max: 100, ticks: { stepSize: 20 } }
    }
  };

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private analyzeService: AnalyzeService,
    private appState: AppStateService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    // Si ya tenemos el resultado en estado global, usarlo
    this.appState.currentAnalysis.subscribe(r => {
      if (r && r.analysis_id === id) {
        this.setResult(r);
      }
    });
    // Siempre cargar desde servicio (soporta navegación directa)
    this.analyzeService.getResult(id).subscribe(r => this.setResult(r));
  }

  selectShot(idx: number) {
    this.selectedShotIdx = idx;
  }

  get selectedShot(): Shot | null {
    return this.result?.shots[this.selectedShotIdx] ?? null;
  }

  get scoreLabel() { return this.result ? getScoreLabel(this.result.summary.score) : ''; }
  get scoreColor() { return this.result ? getScoreColor(this.result.summary.score) : '#22C55E'; }

  get overallVerdict(): 'bueno' | 'dudoso' | 'malo' {
    const s = this.result?.summary.score ?? 0;
    return s >= 70 ? 'bueno' : s >= 50 ? 'dudoso' : 'malo';
  }

  get anguloPhrase() {
    if (!this.result) return '';
    return getAnglePhrase(this.result.summary.mean, this.result.rule.t);
  }

  get anguloVerdict(): 'bueno' | 'dudoso' | 'malo' {
    if (!this.result) return 'bueno';
    const { mean, score } = this.result.summary;
    return score >= 70 ? 'bueno' : score >= 50 ? 'dudoso' : 'malo';
  }

  private setResult(r: AnalysisResult) {
    this.result = r;
    this.buildCards(r);
    this.buildChart(r);
  }

  private buildCards(r: AnalysisResult) {
    this.aciertoCards = [];
    this.mejoraCards  = [];

    // Aciertos
    if (r.summary.n_bueno > 0) {
      this.aciertoCards.push({
        title: `${r.summary.n_bueno} tiro${r.summary.n_bueno > 1 ? 's' : ''} con buena técnica`,
        advice: `En ${r.summary.n_bueno} de tus ${r.summary.n} tiros tu codo estuvo bien alineado. ¡Eso demuestra que tienes la mecánica!`
      });
    }
    if (r.summary.pct_pausa >= 50) {
      this.aciertoCards.push({
        title: 'Pausas antes de tirar',
        advice: 'Pausar brevemente antes de soltar el balón es una señal de control. Los mejores tiradores lo hacen siempre.'
      });
    }
    if (this.aciertoCards.length === 0) {
      this.aciertoCards.push({
        title: 'Llevas el ritmo',
        advice: 'Ya estás trabajando en tu técnica. Con práctica constante, los resultados llegan.'
      });
    }

    // Mejoras (máx 3)
    const mejoras: typeof this.mejoraCards = [];
    if (r.summary.mean >= r.rule.t - r.rule.band) {
      mejoras.push({
        title: 'Codo más pegado al cuerpo',
        advice: getAnglePhrase(r.summary.mean, r.rule.t),
        tip: getImprovementTip(r.summary.mean, r.rule.t)
      });
    }
    if (r.summary.pct_pausa < 50) {
      mejoras.push({
        title: 'Agrega una pausa antes de tirar',
        advice: 'En más de la mitad de tus tiros no hubo pausa. Detenerte un instante en el punto más alto mejora tu control.',
        tip: 'Practica "set point": sube el balón, detente 1 segundo, y luego suelta. Hazlo lento hasta que sea automático.'
      });
    }
    if (r.summary.n_malo > 0) {
      mejoras.push({
        title: `${r.summary.n_malo} tiro${r.summary.n_malo > 1 ? 's' : ''} por mejorar`,
        advice: `Tuviste ${r.summary.n_malo} tiro${r.summary.n_malo > 1 ? 's' : ''} con el codo muy abierto. Revisa el frame de cada uno para ver exactamente qué pasó.`,
        tip: 'Graba de frente y en cámara lenta. Observa el ángulo del codo justo antes de soltar.'
      });
    }
    this.mejoraCards = mejoras.slice(0, 3);
  }

  private buildChart(r: AnalysisResult) {
    this.chartData = {
      labels: r.shots.map(s => `Tiro ${s.n}`),
      datasets: [{
        data: r.shots.map(s => s.score),
        borderColor: '#FF5A1F',
        backgroundColor: 'rgba(255,90,31,0.1)',
        borderWidth: 2,
        pointBackgroundColor: r.shots.map(s =>
          s.verdict === 'bueno' ? '#22C55E' : s.verdict === 'dudoso' ? '#EAB308' : '#EF4444'
        ),
        pointRadius: 6,
        fill: true,
        tension: 0.3
      }]
    };
  }

  guardar() {
    if (!this.result) return;
    const entry: HistoryEntry = {
      analysis_id: this.result.analysis_id,
      created_at: this.result.created_at,
      config: this.result.config,
      summary: this.result.summary,
      frame_url: this.result.shots[0]?.frame_url ?? null
    };
    this.appState.addToHistory(entry);
    this.router.navigate(['/historial']);
  }

  comparar() {
    this.router.navigate(['/comparar']);
  }
}
