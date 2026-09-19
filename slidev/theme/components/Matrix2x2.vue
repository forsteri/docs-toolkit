<script setup lang="ts">
import { accentStyle } from "../utils/palette";

type MatrixQuadrant = string | { title: string; detail?: string };

withDefaults(
  defineProps<{
    quadrants: MatrixQuadrant[];
    xLabel?: string;
    yLabel?: string;
  }>(),
  { xLabel: "横軸", yLabel: "縦軸" },
);
const title = (item: MatrixQuadrant) =>
  typeof item === "string" ? item : item.title;
const detail = (item: MatrixQuadrant) =>
  typeof item === "string" ? undefined : item.detail;
</script>

<template>
  <div class="smart-art smart-matrix">
    <div class="smart-matrix-y">{{ yLabel }}</div>
    <div class="smart-matrix-grid">
      <div
        v-for="(item, index) in quadrants.slice(0, 4)"
        :key="`${title(item)}-${index}`"
        class="smart-matrix-cell"
        :style="accentStyle(index)"
      >
        <strong>{{ title(item) }}</strong>
        <small v-if="detail(item)">{{ detail(item) }}</small>
      </div>
    </div>
    <div class="smart-matrix-x">{{ xLabel }}</div>
  </div>
</template>
