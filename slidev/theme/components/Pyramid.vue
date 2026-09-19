<script setup lang="ts">
import { accentStyle } from "../utils/palette";

type PyramidLevel = string | { title: string; detail?: string };

const props = defineProps<{ levels: PyramidLevel[] }>();
const title = (level: PyramidLevel) =>
  typeof level === "string" ? level : level.title;
const detail = (level: PyramidLevel) =>
  typeof level === "string" ? undefined : level.detail;
const levelStyle = (index: number) => ({
  ...accentStyle(index),
  width: `${52 + index * (48 / Math.max(props.levels.length - 1, 1))}%`,
});
</script>

<template>
  <div class="smart-art smart-pyramid">
    <div
      v-for="(level, index) in levels"
      :key="`${title(level)}-${index}`"
      class="smart-pyramid-level"
      :style="levelStyle(index)"
    >
      <strong>{{ title(level) }}</strong>
      <small v-if="detail(level)">{{ detail(level) }}</small>
    </div>
  </div>
</template>
