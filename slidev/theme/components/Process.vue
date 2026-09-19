<script setup lang="ts">
import { accentStyle } from "../utils/palette";

type ProcessItem = string | { title: string; detail?: string };

defineProps<{ items: ProcessItem[] }>();
const title = (item: ProcessItem) =>
  typeof item === "string" ? item : item.title;
const detail = (item: ProcessItem) =>
  typeof item === "string" ? undefined : item.detail;
</script>

<template>
  <div class="smart-art smart-process" :class="`count-${items.length}`">
    <div
      v-for="(item, index) in items"
      :key="`${title(item)}-${index}`"
      class="smart-process-step"
      :style="accentStyle(index)"
    >
      <span class="smart-index">{{ String(index + 1).padStart(2, "0") }}</span>
      <strong>{{ title(item) }}</strong>
      <small v-if="detail(item)">{{ detail(item) }}</small>
    </div>
  </div>
</template>
