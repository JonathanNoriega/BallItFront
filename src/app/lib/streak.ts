import { HistoryEntry } from '../models/history.model';

/** Calcula la racha de días consecutivos con al menos un análisis */
export function computeStreak(history: HistoryEntry[]): number {
  if (!history.length) return 0;

  // Extraer fechas únicas (solo YYYY-MM-DD) y ordenar descendente
  const days = [...new Set(
    history.map(h => h.created_at.split('T')[0])
  )].sort().reverse();

  if (!days.length) return 0;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = getPrevDay(today);

  // La racha solo aplica si el último entrenamiento fue hoy o ayer
  if (days[0] !== today && days[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    if (days[i] === getPrevDay(days[i - 1])) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function getPrevDay(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().split('T')[0];
}
