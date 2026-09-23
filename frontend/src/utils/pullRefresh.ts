export const PULL_REFRESH_THRESHOLD = 72;

export function pullRefreshDistance(deltaX: number, deltaY: number, atTop: boolean): number {
  if (!atTop || deltaY <= 20 || deltaY < Math.abs(deltaX) * 1.25) return 0;
  return Math.min(112, Math.round(deltaY / 4) * 4);
}
