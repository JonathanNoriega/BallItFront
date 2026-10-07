export type Verdict = 'bueno' | 'dudoso' | 'malo';

export function getScoreLabel(score: number): string {
  if (score >= 85) return 'Excelente';
  if (score >= 70) return 'Bien';
  if (score >= 50) return 'Regular';
  return 'A mejorar';
}

export function getScoreColor(score: number): string {
  if (score >= 70) return '#22C55E';
  if (score >= 50) return '#EAB308';
  return '#EF4444';
}

export function getVerdictColor(verdict: Verdict): string {
  if (verdict === 'bueno')  return '#22C55E';
  if (verdict === 'dudoso') return '#EAB308';
  return '#EF4444';
}

export function getVerdictIcon(verdict: Verdict): string {
  if (verdict === 'bueno')  return '🟢';
  if (verdict === 'dudoso') return '🟡';
  return '🔴';
}

export function getVerdictLabel(verdict: Verdict): string {
  if (verdict === 'bueno')  return 'Bueno';
  if (verdict === 'dudoso') return 'Dudoso';
  return 'Mejorable';
}

/** Genera frase natural para el ángulo medido */
export function getAnglePhrase(value: number, ruleT: number): string {
  if (value < ruleT - 4) {
    return `Tu codo está bien alineado (${Math.round(value)}°). ¡Sigue así, eso es técnica de calidad!`;
  }
  if (value < ruleT + 4) {
    return `Tu codo se abre un poco (${Math.round(value)}°). Lo ideal es menos de ${Math.round(ruleT)}°. Pequeño ajuste y lo tienes.`;
  }
  return `Tu codo se separa ${Math.round(value)}° del torso; lo ideal es menos de ${Math.round(ruleT)}°. Mantenerlo más pegado mejora tu puntería.`;
}

/** Genera consejo de mejora basado en el ángulo */
export function getImprovementTip(value: number, ruleT: number): string {
  if (value < ruleT + 4) {
    return 'Antes de tirar, verifica que tu codo apunte directo al aro. Practica el movimiento lento frente a un espejo.';
  }
  return 'Coloca una cinta adhesiva en el codo como recordatorio visual. Entrena 10 tiros lentos por día enfocándote solo en mantener el codo cerca del cuerpo.';
}
