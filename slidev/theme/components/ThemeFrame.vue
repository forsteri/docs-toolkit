<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: "default" | "cover" | "section" | "ending" | "statement" | "metric";
  }>(),
  { variant: "default" },
);
</script>

<template>
  <div
    class="slidev-layout forsteri-layout"
    :class="[
      `forsteri-${variant}`,
      {
        'is-dark':
          Boolean($frontmatter.dark) ||
          String($frontmatter.class || '').split(/\s+/).includes('dark'),
      },
    ]"
  >
    <div
      v-if="$frontmatter.kicker || $frontmatter.section"
      class="forsteri-kicker"
    >
      {{ $frontmatter.kicker || $frontmatter.section }}
    </div>
    <main class="forsteri-content">
      <slot />
    </main>
    <div
      v-if="!['cover', 'ending'].includes(variant)"
      class="forsteri-page"
    >
      {{ $page }}
    </div>
    <div
      v-if="$frontmatter.footer && !['cover', 'ending'].includes(variant)"
      class="forsteri-footer"
    >
      {{ $frontmatter.footer }}
    </div>
  </div>
</template>
