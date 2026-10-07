import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CompareService } from '../../services/compare.service';
import { HistoryService } from '../../services/history.service';
import { HistoryEntry } from '../../models/history.model';
import { CompareResult } from '../../models/compare.model';
import { ActionBarComponent } from '../../components/action-bar/action-bar.component';
import { getScoreColor } from '../../lib/score';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-comparar',
  standalone: true,
  imports: [CommonModule, FormsModule, ActionBarComponent, BaseChartDirective],
  template: `
    <div class="page">
      <div class="header">
        <button class="back-btn" (click)="router.navigate(['/historial'])">‹</button>
        <h1>Comparar sesiones</h1>
      </div>

      @if (entries.length < 2) {
        <div class="empty-state">
          <p>Necesitas al menos 2 sesiones guardadas para comparar.</p>
          <button class="btn-primary" (click)="router.navigate(['/configuracion'])">Analizar nuevo tiro</button>
        </div>
      } @else {
        <div class="selectors">
          <div class="selector-group">
            <label class="sel-label">Sesión A</label>
            <select class="sel-input" [(ngModel)]="idA">
              @for (e of entries; track e.analysis_id) {
                <option [value]="e.analysis_id">{{ e.created_at | date:'dd MMM':'':'es' }} · {{ e.summary.score }}pts</option>
              }
            </select>
          </div>
          <div class="vs-divider">VS</div>
          <div class="selector-group">
            <label class="sel-label">Sesión B</label>
            <select class="sel-input" [(ngModel)]="idB">
              @for (e of entries; track e.analysis_id) {
                <option [value]="e.analysis_id">{{ e.created_at | date:'dd MMM':'':'es' }} · {{ e.summary.score }}pts</option>
              }
            </select>
          </div>
        </div>

        <button class="compare-btn" (click)="runCompare()" [disabled]="idA === idB || loading">
          {{ loading ? 'Comparando...' : 'Comparar' }}
        </button>

        @if (result) {
          <!-- Veredicto -->
          <div class="verdict-banner" [class.mejora]="result.delta_score > 0" [class.igual]="result.delta_score === 0" [class.retroceso]="result.delta_score < 0">
            @if (result.delta_score > 0) {
              🎉 ¡Mejoraste {{ result.delta_score }} puntos!
            } @else if (result.delta_score === 0) {
              👏 Mismo rendimiento. ¡La consistencia también es un logro!
            } @else {
              💪 Sigue entrenando. Tu próxima sesión puede ser la mejor.
            }
          </div>

          <!-- Tabla comparativa -->
          <div class="compare-table">
            <div class="table-row header-row">
              <span></span>
              <span>Sesión A</span>
              <span>Sesión B</span>
              <span>Delta</span>
            </div>
            <div class="table-row">
              <span class="row-label">Puntaje</span>
              <span [style.color]="getScoreColor(result.summary_a.score)">{{ result.summary_a.score }}</span>
              <span [style.color]="getScoreColor(result.summary_b.score)">{{ result.summary_b.score }}</span>
              <span class="delta" [class.pos]="result.delta_score > 0" [class.neg]="result.delta_score < 0">
                {{ result.delta_score > 0 ? '+' : '' }}{{ result.delta_score }}
              </span>
            </div>
            <div class="table-row">
              <span class="row-label">Apertura codo</span>
              <span>{{ result.summary_a.mean | number:'1.0-1' }}°</span>
              <span>{{ result.summary_b.mean | number:'1.0-1' }}°</span>
              <span class="delta" [class.pos]="result.delta_mean < 0" [class.neg]="result.delta_mean > 0">
                {{ result.delta_mean > 0 ? '+' : '' }}{{ result.delta_mean | number:'1.0-1' }}°
              </span>
            </div>
            <div class="table-row">
              <span class="row-label">Tiros buenos</span>
              <span>{{ result.summary_a.n_bueno }}</span>
              <span>{{ result.summary_b.n_bueno }}</span>
              <span class="delta" [class.pos]="result.summary_a.n_bueno > result.summary_b.n_bueno" [class.neg]="result.summary_a.n_bueno < result.summary_b.n_bueno">
                {{ result.summary_a.n_bueno - result.summary_b.n_bueno > 0 ? '+' : '' }}{{ result.summary_a.n_bueno - result.summary_b.n_bueno }}
              </span>
            </div>
          </div>

          <!-- Gráfica de barras -->
          <h3 class="section-title">Puntaje por tiro</h3>
          <div class="chart-card">
            <canvas baseChart [data]="barData" [options]="barOptions" type="bar"></canvas>
          </div>
        }
      }

      <div class="pb-bar"></div>
    </div>

    <app-action-bar
      primaryLabel="Nueva sesión"
      (primaryClick)="router.navigate(['/configuracion'])">
    </app-action-bar>
  `,
  styles: [`
    .page { padding: 0 20px 100px; background: #FAFAF7; min-height: 100vh; }
    .header { display: flex; align-items: center; gap: 12px; padding: 20px 0 20px; }
    .back-btn { background: none; border: none; font-size: 28px; color: #1B2B4B; cursor: pointer; padding: 0; }
    h1 { font-size: 22px; font-weight: 800; color: #1B2B4B; margin: 0; }
    .empty-state { text-align: center; padding: 40px 20px; }
    .empty-state p { color: #6b7280; margin-bottom: 20px; }
    .btn-primary { background: #FF5A1F; color: white; border: none; border-radius: 12px; min-height: 52px; padding: 0 24px; font-size: 15px; font-weight: 700; cursor: pointer; width: 100%; }
    .selectors { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
    .selector-group { flex: 1; }
    .sel-label { display: block; font-size: 12px; font-weight: 700; color: #6b7280; margin-bottom: 4px; text-transform: uppercase; }
    .sel-input { width: 100%; padding: 10px 12px; border: 2px solid #e5e7eb; border-radius: 10px; font-size: 13px; background: white; }
    .vs-divider { font-size: 13px; font-weight: 900; color: #9ca3af; flex-shrink: 0; margin-top: 18px; }
    .compare-btn { width: 100%; min-height: 52px; background: #1B2B4B; color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; margin-bottom: 20px; }
    .compare-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .verdict-banner { text-align: center; padding: 16px; border-radius: 14px; font-size: 16px; font-weight: 700; margin-bottom: 20px; }
    .verdict-banner.mejora    { background: #dcfce7; color: #15803d; }
    .verdict-banner.igual     { background: #f0f9ff; color: #0369a1; }
    .verdict-banner.retroceso { background: #fff3ed; color: #FF5A1F; }
    .compare-table { background: white; border-radius: 14px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 20px; }
    .table-row { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; gap: 8px; padding: 12px 14px; border-bottom: 1px solid #f3f4f6; font-size: 14px; text-align: center; }
    .table-row:last-child { border-bottom: none; }
    .header-row { background: #f9fafb; font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; }
    .row-label { font-weight: 600; color: #374151; text-align: left; }
    .delta { font-weight: 700; }
    .delta.pos { color: #22C55E; }
    .delta.neg { color: #EF4444; }
    .section-title { font-size: 16px; font-weight: 700; color: #1B2B4B; margin: 0 0 10px; }
    .chart-card { background: white; border-radius: 16px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 16px; }
    .pb-bar { height: 20px; }
  `]
})
export class CompararComponent implements OnInit {
  entries: HistoryEntry[] = [];
  idA = '';
  idB = '';
  loading = false;
  result: CompareResult | null = null;
  getScoreColor = getScoreColor;

  barData: ChartData<'bar'> = { labels: [], datasets: [] };
  barOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: { y: { min: 0, max: 100 } }
  };

  constructor(
    public router: Router,
    private compareService: CompareService,
    private historyService: HistoryService
  ) {}

  ngOnInit() {
    this.historyService.getHistory().subscribe(data => {
      this.entries = data;
      if (data.length >= 2) {
        this.idA = data[0].analysis_id;
        this.idB = data[1].analysis_id;
      }
    });
  }

  runCompare() {
    if (!this.idA || !this.idB || this.idA === this.idB) return;
    this.loading = true;
    this.compareService.compare(this.idA, this.idB).subscribe(r => {
      this.result = r;
      this.loading = false;
      this.buildBarChart(r);
    });
  }

  private buildBarChart(r: CompareResult) {
    const maxLen = Math.max(r.shots_a.length, r.shots_b.length);
    const labels = Array.from({ length: maxLen }, (_, i) => `Tiro ${i + 1}`);
    this.barData = {
      labels,
      datasets: [
        {
          label: 'Sesión A',
          data: r.shots_a.map((s: any) => s.score),
          backgroundColor: 'rgba(255,90,31,0.7)',
          borderColor: '#FF5A1F',
          borderWidth: 1,
          borderRadius: 6
        },
        {
          label: 'Sesión B',
          data: r.shots_b.map((s: any) => s.score),
          backgroundColor: 'rgba(27,43,75,0.6)',
          borderColor: '#1B2B4B',
          borderWidth: 1,
          borderRadius: 6
        }
      ]
    };
  }
}
