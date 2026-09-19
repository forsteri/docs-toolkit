// スマートアートの系列色。--forsteri-series-1..8 を順に循環させる単一パレット。
// 系列色はすべて黒文字（--forsteri-ink）が載る明度で揃えているため、前景色は固定。
const seriesColors = [
  "var(--forsteri-series-1)",
  "var(--forsteri-series-2)",
  "var(--forsteri-series-3)",
  "var(--forsteri-series-4)",
  "var(--forsteri-series-5)",
  "var(--forsteri-series-6)",
  "var(--forsteri-series-7)",
  "var(--forsteri-series-8)",
] as const;

export function paletteColor(index: number) {
  return seriesColors[index % seriesColors.length];
}

export function accentStyle(index: number) {
  return {
    "--smart-color": paletteColor(index),
    "--smart-foreground": "var(--forsteri-ink)",
  };
}
