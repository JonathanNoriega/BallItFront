---
inclusion: manual
name: data-contract
description: Contrato de datos del backend BallIt (JuandiSolo/BallItMVP). Traer con #data-contract antes de tocar lógica de análisis, resultados o consejos de IA.
---

# Contrato de datos — BallIt Backend

> Fuente: `JuandiSolo/BallItMVP` — `example_result.json` + README de la API.
> Validado contra el backend real en octubre 2026.

## Headers requeridos en TODAS las peticiones

```
X-User-Id: <UUID v4>   # UUID anónimo generado por instalación, persistido en electron-store
```

## Endpoints

### POST /analyze
Inicia el análisis de un video.

**Form fields:**
| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `video` | file | ✅ | Archivo de video (mp4, mov, m4v, avi, mkv, máx 200 MiB) |
| `arm` | string | ✅ | `"right"` o `"left"` |
| `camera` | string | ✅ | `"frente"` (única validada) |
| `focus` | string | ✅ | `"completo"` |
| `trim_start_s` | float | ❌ | Dejar vacío para analizar todo el video |
| `trim_end_s` | float | ❌ | Dejar vacío para analizar todo el video |

**Respuesta 202:**
```json
{ "analysis_id": "<uuid>" }
```

---

### GET /analyze/{analysis_id}
Polling de estado/resultado. Consultar hasta `status: "done"`.

**Respuesta cuando está listo (`status: "done"`):**
```json
{
  "analysis_id": "00000000-0000-4000-8000-000000000001",
  "created_at": "2026-10-06T00:00:00-05:00",
  "config": {
    "arm": "right",
    "camera": "frente",
    "focus": "completo",
    "goal": null
  },
  "video": {
    "url": "/files/{user_id}/{analysis_id}/video.mov",
    "width": 854,
    "height": 480,
    "fps": 27.87,
    "n_frames": 51,
    "duration_s": 1.83,
    "available": true
  },
  "quality": {
    "detection_rate": 100.0,
    "note": null,
    "warnings": []
  },
  "rule": {
    "feature": "abduction_prep_mean",
    "direction": "<",
    "t": 26.3,
    "band": 4.08,
    "good_mean": 16.06,
    "good_sd": 4.28,
    "bad_mean": 44.60,
    "bad_sd": 10.73,
    "angle_name": "right_shoulder_angle",
    "unit": "grados"
  },
  "shots": [
    {
      "n": 1,
      "value": 15.46,
      "score": 93,
      "verdict": "bueno",
      "has_pause": true,
      "pause_s": 0.215,
      "frames": {
        "start": 11,
        "set": 20,
        "release": 26,
        "prep": 17,
        "peak": 24
      },
      "times_s": {
        "set": 0.718,
        "release": 0.933
      },
      "frame_url": "/files/{user_id}/{analysis_id}/shot1.jpg",
      "clip_url": null
    }
  ],
  "summary": {
    "n": 1,
    "mean": 15.46,
    "score": 93,
    "sd": null,
    "n_bueno": 1,
    "n_dudoso": 0,
    "n_malo": 0,
    "pct_bueno": 100.0,
    "pct_pausa": 100.0
  },
  "landmark_names": [
    "left_shoulder", "right_shoulder",
    "left_elbow",    "right_elbow",
    "left_wrist",    "right_wrist",
    "left_hip",      "right_hip",
    "left_knee",     "right_knee",
    "left_ankle",    "right_ankle"
  ],
  "frames": [
    {
      "i": 0,
      "t": 0.0,
      "ok": true,
      "p": [
        [0.519, 0.448],  // left_shoulder
        [0.479, 0.446],  // right_shoulder
        [0.520, 0.497],  // left_elbow
        [0.472, 0.494],  // right_elbow
        [0.511, 0.527],  // left_wrist
        [0.474, 0.509],  // right_wrist
        [0.510, 0.548],  // left_hip
        [0.487, 0.548],  // right_hip
        [0.520, 0.614],  // left_knee
        [0.488, 0.622],  // right_knee
        [0.528, 0.673],  // left_ankle
        [0.485, 0.681]   // right_ankle
      ],
      "angle": 22.3
    }
    // ... un objeto por frame del video
  ]
}
```

**Notas críticas sobre `frames`:**
- `p` es un array de 12 pares `[x, y]`, normalizados 0–1, en el mismo orden que `landmark_names`
- `angle` es el `{arm}_shoulder_angle` del frame (ángulo cadera–hombro–codo, "abducción")
- `ok: false` significa que MediaPipe no detectó el cuerpo en ese frame — saltarlo en el overlay
- `clip_url` puede llegar `null` aunque el análisis esté `done` (la recodificación sigue en background); hacer polling adicional o reintentar

---

### GET /history
Historial de sesiones del usuario.

**Respuesta:**
```json
[
  {
    "analysis_id": "...",
    "created_at": "...",
    "config": { "arm": "right", "camera": "frente", "focus": "completo" },
    "summary": {
      "n": 3,
      "mean": 24.5,
      "score": 78,
      "n_bueno": 2,
      "n_dudoso": 1,
      "n_malo": 0
    },
    "frame_url": "/files/..."
  }
]
```

---

### GET /history/{analysis_id}
Detalle completo de una sesión del historial. Misma forma que GET /analyze/{id} con status done.

---

### POST /compare
Comparación entre dos análisis.

**Body JSON:**
```json
{ "id_a": "<uuid>", "id_b": "<uuid>" }
```

**Respuesta:**
```json
{
  "id_a": "...",
  "id_b": "...",
  "delta_score": 15,
  "delta_mean": -8.7,
  "verdict": "mejora",
  "shots_a": [...],
  "shots_b": [...],
  "summary_a": { ... },
  "summary_b": { ... }
}
```

---

## Mapeo de ángulo → UI

El backend mide **`{arm}_shoulder_angle`** = ángulo cadera–hombro–codo ("abducción del hombro").

| Backend | UI (mostrar al usuario) |
|---|---|
| `right_shoulder_angle` / `left_shoulder_angle` | "Apertura del codo" |
| `value` por tiro | Valor promedio en fase de preparación |
| `angle` por frame | Ángulo instantáneo (para overlay) |
| `score` (0-100) | "Alineación del codo" |

**Umbrales del semáforo** (basados en `rule.t` y `rule.band`):
- 🟢 Bueno: `value < rule.t - rule.band` (aprox < 22°)
- 🟡 Dudoso: `value` dentro de `± rule.band` del umbral
- 🔴 Malo: `value > rule.t + rule.band` (aprox > 30°)

O simplemente usar el campo `verdict` que ya viene calculado por el backend: `"bueno"`, `"dudoso"`, `"malo"`.

---

## Frases en lenguaje natural por veredicto

El `advice` generado por Groq viene en el objeto del shot o del summary (confirmar estructura exacta al integrar). Si no hay Groq, el front puede generar frases locales:

- **bueno:** "Tu codo está bien alineado ({value}°). ¡Sigue así!"
- **dudoso:** "Tu codo se abre un poco ({value}°); lo ideal es menos de {rule.t}°."
- **malo:** "Tu codo se separa {value}° del torso; lo ideal es menos de {rule.t}°. Intenta mantenerlo más pegado."
