/* Funciones puras del pipeline de scroll horizontal.
   Aisladas para poder testearlas sin DOM.

   Modelo mental: hay un "canvas" horizontal de ancho `canvasWidth` montado
   dentro de un viewport de ancho `viewportWidth`. El scroll vertical va
   desde 0 hasta `maxScrollY` y mapea linealmente a `translateX` desde 0
   hasta `-(canvasWidth - viewportWidth)`. */

export function scrollToTranslateX(
  scrollY: number,
  maxScrollY: number,
  canvasWidth: number,
  viewportWidth: number,
): number {
  if (canvasWidth <= viewportWidth) return 0;
  const maxPan = canvasWidth - viewportWidth;
  const clampedY = Math.max(0, Math.min(maxScrollY, scrollY));
  const progress = maxScrollY > 0 ? clampedY / maxScrollY : 0;
  if (progress === 0) return 0;
  return -(progress * maxPan);
}

export function percentToPx(percent: number, totalPx: number): number {
  return (percent / 100) * totalPx;
}

export function bloqueProgressForScroll(
  currentCanvasX: number,
  bloqueStartX: number,
  bloqueWidth: number,
): number {
  if (currentCanvasX <= bloqueStartX) return 0;
  if (currentCanvasX >= bloqueStartX + bloqueWidth) return 1;
  return (currentCanvasX - bloqueStartX) / bloqueWidth;
}
