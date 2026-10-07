import { FrameData } from '../models/analyze.model';

export interface OverlayConfig {
  arm: 'right' | 'left';
  showSkeleton: boolean;
  showAngles: boolean;
  showTrail: boolean;
  rule?: { t: number; band: number };
}

// Índices según landmark_names del backend:
// 0=left_shoulder, 1=right_shoulder, 2=left_elbow, 3=right_elbow,
// 4=left_wrist,    5=right_wrist,    6=left_hip,   7=right_hip,
// 8=left_knee,     9=right_knee,     10=left_ankle, 11=right_ankle

const SKELETON_CONNECTIONS: [number, number][] = [
  [0, 1],  // hombro izq - hombro der
  [0, 2],  // hombro izq - codo izq
  [2, 4],  // codo izq - muñeca izq
  [1, 3],  // hombro der - codo der
  [3, 5],  // codo der - muñeca der
  [0, 6],  // hombro izq - cadera izq
  [1, 7],  // hombro der - cadera der
  [6, 7],  // cadera izq - cadera der
  [6, 8],  // cadera izq - rodilla izq
  [8, 10], // rodilla izq - tobillo izq
  [7, 9],  // cadera der - rodilla der
  [9, 11], // rodilla der - tobillo der
];

const ARM_RIGHT_INDICES = [1, 3, 5]; // shoulder, elbow, wrist
const ARM_LEFT_INDICES  = [0, 2, 4];

const ARM_RIGHT_CONNECTIONS: [number, number][] = [[1, 3], [3, 5]];
const ARM_LEFT_CONNECTIONS:  [number, number][] = [[0, 2], [2, 4]];

function getVerdictColor(angle: number, rule?: { t: number; band: number }): string {
  if (!rule) return '#22C55E';
  if (angle < rule.t - rule.band) return '#22C55E';  // bueno
  if (angle < rule.t + rule.band) return '#EAB308';  // dudoso
  return '#EF4444';                                   // malo
}

export function drawOverlay(
  ctx: CanvasRenderingContext2D,
  frame: FrameData,
  config: OverlayConfig,
  trail: number[][][] = []
): void {
  if (!frame.ok || !frame.p || frame.p.length < 12) return;

  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  const sx = (p: number[]) => p[0] * w;
  const sy = (p: number[]) => p[1] * h;

  const armIndices     = config.arm === 'right' ? ARM_RIGHT_INDICES     : ARM_LEFT_INDICES;
  const armConnections = config.arm === 'right' ? ARM_RIGHT_CONNECTIONS : ARM_LEFT_CONNECTIONS;
  const isArmConn = (a: number, b: number) =>
    armConnections.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

  // --- Trail (estela del brazo) ---
  if (config.showTrail && trail.length > 1) {
    const wristIdx = config.arm === 'right' ? 5 : 4;
    ctx.lineWidth = 3;
    for (let i = 1; i < trail.length; i++) {
      const alpha = (i / trail.length) * 0.65;
      ctx.strokeStyle = `rgba(255, 90, 31, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(sx(trail[i - 1][wristIdx]), sy(trail[i - 1][wristIdx]));
      ctx.lineTo(sx(trail[i][wristIdx]),     sy(trail[i][wristIdx]));
      ctx.stroke();
    }
  }

  // --- Esqueleto ---
  if (config.showSkeleton) {
    // Conexiones no-brazo en gris
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.75)';
    for (const [a, b] of SKELETON_CONNECTIONS) {
      if (isArmConn(a, b)) continue;
      ctx.beginPath();
      ctx.moveTo(sx(frame.p[a]), sy(frame.p[a]));
      ctx.lineTo(sx(frame.p[b]), sy(frame.p[b]));
      ctx.stroke();
    }

    // Puntos grises (articulaciones no-brazo)
    ctx.fillStyle = 'rgba(200, 200, 200, 0.9)';
    for (let i = 0; i < 12; i++) {
      if (armIndices.includes(i)) continue;
      ctx.beginPath();
      ctx.arc(sx(frame.p[i]), sy(frame.p[i]), 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Conexiones del brazo de tiro en brand-orange
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#FF5A1F';
    for (const [a, b] of armConnections) {
      ctx.beginPath();
      ctx.moveTo(sx(frame.p[a]), sy(frame.p[a]));
      ctx.lineTo(sx(frame.p[b]), sy(frame.p[b]));
      ctx.stroke();
    }

    // Puntos naranja del brazo de tiro
    ctx.fillStyle = '#FF5A1F';
    for (const i of armIndices) {
      ctx.beginPath();
      ctx.arc(sx(frame.p[i]), sy(frame.p[i]), 6, 0, Math.PI * 2);
      ctx.fill();
      // Borde blanco para visibilidad
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  // --- Ángulo en el hombro ---
  if (config.showAngles && frame.angle != null) {
    const shoulderIdx = config.arm === 'right' ? 1 : 0;
    const [shx, shy] = [sx(frame.p[shoulderIdx]), sy(frame.p[shoulderIdx])];
    const angle = frame.angle;
    const color = getVerdictColor(angle, config.rule);
    const radius = Math.max(22, Math.min(36, w * 0.06));

    // Arco de ángulo
    ctx.beginPath();
    ctx.arc(shx, shy, radius, -Math.PI / 2, -Math.PI / 2 + (angle * Math.PI / 180), false);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Fondo de la etiqueta para legibilidad
    const label = `Codo ${Math.round(angle)}°`;
    const fontSize = Math.max(11, Math.min(14, w * 0.032));
    ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
    const textWidth = ctx.measureText(label).width;
    const tx = shx + radius + 6;
    const ty = shy - 6;

    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath();
    ctx.roundRect(tx - 3, ty - fontSize, textWidth + 8, fontSize + 6, 4);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.fillText(label, tx + 1, ty);
  }
}

/** Encuentra el índice del frame más cercano al tiempo t (segundos) */
export function findFrameAtTime(frames: FrameData[], t: number): number {
  if (!frames.length) return 0;
  let best = 0;
  let bestDiff = Math.abs(frames[0].t - t);
  for (let i = 1; i < frames.length; i++) {
    const diff = Math.abs(frames[i].t - t);
    if (diff < bestDiff) { bestDiff = diff; best = i; }
  }
  return best;
}

/** Encuentra el frame por índice i */
export function findFrameByIndex(frames: FrameData[], index: number): FrameData | null {
  return frames.find(f => f.i === index) ?? null;
}
