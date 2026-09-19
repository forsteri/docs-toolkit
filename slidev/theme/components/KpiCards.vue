<script setup lang="ts">
import { accentStyle } from "../utils/palette";

type Kpi = {
  label: string;
  value: string;
  delta?: string;
  note?: string;
};

defineProps<{ items: Kpi[] }>();
</script>

<template>
  <div class="smart-art smart-kpis" :class="`count-${items.length}`">
    <div
      v-for="(item, index) in items"
      :key="`${item.label}-${index}`"
      class="smart-kpi"
      :style="accentStyle(index)"
    >
      <span class="smart-kpi-label">{{ item.label }}</span>
      <strong class="smart-kpi-value">{{ item.value }}</strong>
      <span v-if="item.delta" class="smart-kpi-delta">{{ item.delta }}</span>
      <small v-if="item.note">{{ item.note }}</small>
    </div>
  </div>
</template>
