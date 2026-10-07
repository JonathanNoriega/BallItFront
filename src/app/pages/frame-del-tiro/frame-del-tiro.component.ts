import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AnalyzeService } from '../../services/analyze.service';
import { AnalysisResult, Shot } from '../../models/analyze.model';
import { VerdictChipComponent } from '../../components/verdict-chip/verdict-chip.component';
import { drawOverlay } from '../../lib/overlay';
import { getAnglePhrase, getScoreColor } from '../../lib/score';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-frame-del-tiro',
  standalone: true,
  imports: [CommonModule, VerdictChipComponent],
  template: `
    @if (!result) {
      <div class="loading"><div class="spinner"></div></div>
    } @else {
      <div class="page">
        <div class="header">
          <button class="back-btn" (click)="goBack()">‹</button>
          <h1>Tiro {{ shot?.n }}</h1>
          @if (shot) { <app-verdict-chip [verdict]="shot.verdict" size="md" /> }
        </div>

        <!-- Frame congelado con canvas -->
        <div class="frame-wrapper">
          <img #imgEl [src]="frameImgSrc" (load)="onImageLoad()" class="frame-img" alt="Frame del tiro" />
          <canvas #canvasEl style="position:absolute;top:0;left:0;pointer-events:none;"></canvas>
        </div>

        @if (shot) {
          <div class="content">
            <!-- Score -->
            <div class="score-row">
              <span class="score-num" [style.color]="scoreColor">{{ shot.score }}</span>
              <span class="score-label">/100</span>
            </div>

            <!-- Frase natural -->
            <div class="phrase-card">
              <p>{{ phrase }}</p>
            </div>

            <!-- Datos del tiro -->
            <div class="data-grid">
              <div class="data-item">
                <span class="data-label">Apertura del codo</span>
                <span class="data-value">{{ shot.value | number:'1.0-1' }}°</span>
              </div>
              <div class="data-item">
                <span class="data-label">Pausa</span>
                <span class="data-value">{{ shot.has_pause ? '✅ Sí' : '❌ No' }}</span>
              </div>
              @if (shot.has_pause) {
                <div class="data-item">
                  <span class="data-label">Duración pausa</span>
                  <span class="data-value">{{ shot.pause_s | number:'1.2-2' }}s</span>
                </div>
              }
            </div>
          </div>
        }

        <!-- Navegación entre tiros -->
        <div class="nav-row">
          <button class="nav-btn" [disabled]="shotIdx <= 0" (click)="prevShot()">‹ Anterior</button>
          <span class="nav-label">{{ shotIdx + 1 }} / {{ result.shots.length }}</span>
          <button class="nav-btn" [disabled]="shotIdx >= result.shots.length - 1" (click)="nextShot()">Siguiente ›</button>
        </div>

        <div class="pb-bar"></div>
      </div>
    }
  `,
  styles: [`
    .loading { display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    .spinner { width: 36px; height: 36px; border: 3px solid #e5e7eb; border-top-color: #FF5A1F; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to{transform:rotate(360deg)} }
    .page { background: #FAFAF7; min-height: 100vh; padding-bottom: 80px; }
    .header { display: flex; align-items: center; gap: 12px; padding: 20px 20px 12px; }
    .back-btn { background: none; border: none; font-size: 28px; color: #1B2B4B; cursor: pointer; padding: 0; }
    h1 { flex: 1; font-size: 22px; font-weight: 800; color: #1B2B4B; margin: 0; }
    .frame-wrapper { position: relative; background: #000; }
    .frame-img { width: 100%; display: block; }
    .content { padding: 16px 20px 0; }
    .score-row { display: flex; align-items: baseline; gap: 4px; margin-bottom: 12px; }
    .score-num { font-size: 48px; font-weight: 900; line-height: 1; }
    .score-label { font-size: 18px; color: #9ca3af; }
    .phrase-card { background: white; border-radius: 14px; padding: 14px 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 16px; }
    .phrase-card p { margin: 0; font-size: 15px; color: #374151; line-height: 1.6; }
    .data-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
    .data-item { background: white; border-radius: 12px; padding: 12px 14px; box-shadow: 0 2px 6px rgba(0,0,0,0.05); }
    .data-label { display: block; font-size: 11px; color: #9ca3af; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 4px; }
    .data-value { font-size: 18px; font-weight: 800; color: #1B2B4B; }
    .nav-row { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; }
    .nav-btn { background: white; border: 2px solid #e5e7eb; border-radius: 10px; padding: 10px 16px; font-size: 14px; font-weight: 600; color: #374151; cursor: pointer; }
    .nav-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .nav-label { font-size: 14px; color: #6b7280; font-weight: 600; }
    .pb-bar { height: 20px; }
  `]
})
export class FrameDelTiroComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('imgEl')    imgRef!: ElementRef<HTMLImageElement>;
  @ViewChild('canvasEl') canvasRef!: ElementRef<HTMLCanvasElement>;

  result: AnalysisResult | null = null;
  shotIdx = 0;

  private readonly placeholderImg = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="854" height="480" style="background:%23111"><text x="50%25" y="50%25" fill="%23555" font-size="20" text-anchor="middle" dominant-baseline="middle">Sin imagen disponible</text></svg>';
  frameImgSrc = this.placeholderImg;
  private currentObjectUrl: string | null = null;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private analyzeService: AnalyzeService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.shotIdx = parseInt(this.route.snapshot.paramMap.get('shotIdx') ?? '0', 10);
    this.analyzeService.getResult(id).subscribe(r => {
      this.result = r;
      this.resolveFrameImg();
    });
  }

  ngAfterViewInit() {}

  get shot(): Shot | null {
    return this.result?.shots[this.shotIdx] ?? null;
  }

  /** Descarga la imagen del frame como blob (header X-User-Id) y setea el object URL */
  private resolveFrameImg() {
    if (this.currentObjectUrl) {
      URL.revokeObjectURL(this.currentObjectUrl);
      this.currentObjectUrl = null;
    }
    const url = this.shot?.frame_url;
    if (!url) { this.frameImgSrc = this.placeholderImg; return; }
    this.analyzeService.mediaUrl(url).subscribe(resolved => {
      if (!resolved) { this.frameImgSrc = this.placeholderImg; return; }
      if (resolved.startsWith('blob:')) this.currentObjectUrl = resolved;
      this.frameImgSrc = resolved;
    });
  }

  get phrase(): string {
    if (!this.result || !this.shot) return '';
    return getAnglePhrase(this.shot.value, this.result.rule.t);
  }

  get scoreColor(): string {
    return this.shot ? getScoreColor(this.shot.score) : '#22C55E';
  }

  onImageLoad() {
    this.drawPeakFrame();
  }

  private drawPeakFrame() {
    if (!this.result || !this.shot) return;
    const img    = this.imgRef?.nativeElement;
    const canvas = this.canvasRef?.nativeElement;
    if (!img || !canvas) return;

    canvas.width  = img.clientWidth  || img.naturalWidth;
    canvas.height = img.clientHeight || img.naturalHeight;
    canvas.style.width  = canvas.width  + 'px';
    canvas.style.height = canvas.height + 'px';

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const peakIdx = this.shot.frames.peak;
    const frame = this.result.frames.find(f => f.i === peakIdx);
    if (!frame) return;

    drawOverlay(ctx, frame, {
      arm: this.result.config.arm,
      showSkeleton: true,
      showAngles: true,
      showTrail: false,
      rule: { t: this.result.rule.t, band: this.result.rule.band }
    });
  }

  prevShot() {
    if (this.shotIdx > 0) { this.shotIdx--; this.resolveFrameImg(); this.redraw(); }
  }

  nextShot() {
    if (this.result && this.shotIdx < this.result.shots.length - 1) { this.shotIdx++; this.resolveFrameImg(); this.redraw(); }
  }

  private redraw() {
    setTimeout(() => this.drawPeakFrame(), 50);
  }

  goBack() {
    if (this.result) this.router.navigate(['/resultados', this.result.analysis_id]);
    else this.router.navigate(['/']);
  }

  ngOnDestroy() {
    if (this.currentObjectUrl) {
      URL.revokeObjectURL(this.currentObjectUrl);
      this.currentObjectUrl = null;
    }
  }
}
