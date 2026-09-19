<script setup lang="ts">
import { accentStyle } from "../utils/palette";

type FunnelStage = string | { title: string; value?: string };

const props = defineProps<{ stages: FunnelStage[] }>();
const title = (stage: FunnelStage) =>
  typeof stage === "string" ? stage : stage.title;
const value = (stage: FunnelStage) =>
  typeof stage === "string" ? undefined : stage.value;
const stageStyle = (index: number) => ({
  ...accentStyle(index),
  width: `${Math.max(46, 100 - index * (52 / Math.max(props.stages.length - 1, 1)))}%`,
});
</script>

<template>
  <div class="smart-art smart-funnel">
    <div
      v-for="(stage, index) in stages"
      :key="`${title(stage)}-${index}`"
      class="smart-funnel-stage"
      :style="stageStyle(index)"
    >
      <strong>{{ title(stage) }}</strong>
      <span v-if="value(stage)">{{ value(stage) }}</span>
    </div>
  </div>
</template>
