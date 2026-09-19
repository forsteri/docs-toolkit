<script setup lang="ts">
import { accentStyle } from "../utils/palette";

type CycleItem = string | { title: string; detail?: string };

const props = withDefaults(
  defineProps<{ items: CycleItem[]; center?: string }>(),
  { center: "継続改善" },
);
const title = (item: CycleItem) =>
  typeof item === "string" ? item : item.title;
const detail = (item: CycleItem) =>
  typeof item === "string" ? undefined : item.detail;
const itemStyle = (index: number) => ({
  ...accentStyle(index),
  "--cycle-angle": `${index * (360 / props.items.length) - 90}deg`,
});
</script>

<template>
  <div class="smart-art smart-cycle">
    <div class="smart-cycle-ring" aria-hidden="true" />
    <div class="smart-cycle-center">{{ center }}</div>
    <div
      v-for="(item, index) in items"
      :key="`${title(item)}-${index}`"
      class="smart-cycle-item"
      :style="itemStyle(index)"
    >
      <strong>{{ title(item) }}</strong>
      <small v-if="detail(item)">{{ detail(item) }}</small>
    </div>
  </div>
</template>
