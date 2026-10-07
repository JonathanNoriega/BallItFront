---
inclusion: always
---

# Product — BallIt

## Qué es

App de escritorio (Electron + Angular), con interfaz que conserva el look de app móvil (contenedor tipo teléfono dentro de la ventana), para BallIt: analiza con IA la técnica de tiro de un jugador amateur de básquetbol que entrena solo, a partir de un video grabado o subido.

Esta app es, para esta entrega, el pitch en sí mismo — reemplaza una presentación de slides, así que debe sentirse como un producto real funcionando, con integración real al backend, no como un mockup estático.

## Para quién

Jugador aficionado (18-25 años) que entrena solo, sin acceso constante a un entrenador, y que:
- No sabe exactamente qué está haciendo mal ("54 grados no me dice nada").
- Quiere ver feedback sobre su propio video, no un tutorial genérico.
- Se graba solo, sin ayuda.
- Pierde motivación sin ver progreso.
- Espera valor en menos de 5 minutos, sin tener que crear cuenta.

## Objetivo del MVP

1. Configurar qué se va a analizar (mano de tiro, ángulo de cámara).
2. Subir o grabar un video.
3. Ver el análisis sobre su propio video: esqueleto, ángulos con grados escritos encima, momento del tiro y veredicto.
4. Guardar historial y comparar contra un análisis anterior.

## Dentro de esta versión

- Grabar desde el navegador y subir video.
- Overlay de esqueleto + ángulos sobre el video del usuario.
- Consejos tipo "puedes mejorar esto, intenta esto" generados con IA (Groq) a partir de mediciones reales — la IA solo redacta, nunca inventa números.
- Puntaje único "Alineación del codo" (0-100).
- Rachas de días entrenando (única gamificación).
- Historial y comparación antes/después.

## Fuera de esta versión

- Ejercicios sugeridos, plan Pro/pagos, módulo de entrenadores.
- Análisis en tiempo real (es sobre video grabado, no en vivo).
- Otras "jugadas" (dribling, bandeja) — solo tiro.
- Cámara lateral/diagonal (solo frente está validada por el back).
- Chat de seguimiento con la IA (solo consejos al final).

## Principio rector

El jugador nunca debe sentirse regañado ni abrumado. Siempre al menos un acierto antes que las correcciones. Máximo 3 correcciones, en lenguaje simple, nunca solo el número ("tu codo se separa 41° del torso; lo ideal es menos de 22°", no "abducción 41°").

## Flujo de pantallas (orden de prioridad para construir)

| # | Pantalla | Prioridad |
|---|---|---|
| P1 | Inicio — racha, botón "Analizar mi tiro", acceso a "Mis entrenamientos" | Alta |
| P2 | Configuración — mano, cámara (solo Frente habilitada), enfoque, objetivo | Alta |
| P3 | Subir / Grabar — diálogo nativo Electron para subir; validación básica | Alta |
| P4 | Recortar fragmento — timeline con manijas (puede simplificarse) | Media |
| P5 | Procesando — progreso real (polling) o estimado razonable | Alta |
| P6 | **Resultados ⭐ MÁS IMPORTANTE** — overlay canvas, selector de tiro, tarjetas, puntaje, métricas, gráfica | Crítica |
| P7 | Frame del tiro — peak_frame congelado, esqueleto, arco, frase, navegación | Alta |
| P8 | Guardado + Historial | Media |
| P9 | Comparar antes/después — dos videos, tabla comparativa, veredicto, gráfica barras | Media |

## Dataset de ejemplo para el pitch

3-4 tiros bien armados en `src/app/mocks/fixtures/`:
- Al menos 1 bueno 🟢
- Al menos 1 dudoso 🟡
- Al menos 1 malo 🔴
- Con progreso guardado para que "Comparar" tenga sentido

## Fallback de demo

Si la llamada real al back falla o tarda demasiado, la app cae a los datos de ejemplo automáticamente. Modo real es el default.
