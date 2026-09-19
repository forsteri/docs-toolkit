<script setup lang="ts">
import { accentStyle } from "../utils/palette";

type ComparisonSide = {
  title: string;
  summary?: string;
  items: string[];
};

defineProps<{ left: ComparisonSide; right: ComparisonSide }>();
</script>

<template>
  <div class="smart-art smart-comparison">
    <section
      v-for="(side, index) in [left, right]"
      :key="side.title"
      class="smart-comparison-side"
      :style="accentStyle(index)"
    >
      <h3>{{ side.title }}</h3>
      <p v-if="side.summary">{{ side.summary }}</p>
      <ul>
        <li v-for="item in side.items" :key="item">{{ item }}</li>
      </ul>
    </section>
  </div>
</template>
