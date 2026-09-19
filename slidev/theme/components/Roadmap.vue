<script setup lang="ts">
import { accentStyle } from "../utils/palette";

type RoadmapItem = {
  quarter: string;
  title: string;
};
type RoadmapLane = { name: string; items: RoadmapItem[] };

const props = withDefaults(
  defineProps<{
    quarters?: string[];
    lanes: RoadmapLane[];
  }>(),
  { quarters: () => ["Q1", "Q2", "Q3", "Q4"] },
);
const itemsFor = (lane: RoadmapLane, quarter: string) =>
  lane.items.filter((item) => item.quarter === quarter);
</script>

<template>
  <div class="smart-art smart-roadmap">
    <div
      class="smart-roadmap-row smart-roadmap-header"
      :style="{ gridTemplateColumns: `160px repeat(${quarters.length}, minmax(0, 1fr))` }"
    >
      <div />
      <strong v-for="quarter in quarters" :key="quarter">{{ quarter }}</strong>
    </div>
    <div
      v-for="(lane, laneIndex) in lanes"
      :key="lane.name"
      class="smart-roadmap-row"
      :style="{ gridTemplateColumns: `160px repeat(${quarters.length}, minmax(0, 1fr))` }"
    >
      <strong class="smart-roadmap-lane">{{ lane.name }}</strong>
      <div
        v-for="(quarter, quarterIndex) in quarters"
        :key="`${lane.name}-${quarter}`"
        class="smart-roadmap-cell"
      >
        <span
          v-for="item in itemsFor(lane, quarter)"
          :key="item.title"
          class="smart-roadmap-item"
          :style="accentStyle(laneIndex + quarterIndex)"
        >
          {{ item.title }}
        </span>
      </div>
    </div>
  </div>
</template>
