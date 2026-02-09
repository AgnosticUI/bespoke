<script setup lang="ts">
import VueButton from './components/ag/Button/vue/VueButton.vue';
</script>

<template>
  <div class="container">
    <h1>Bespoke Token Verification</h1>
    <p class="subtitle">
      Medical patient-portal design system. AgnosticUI + Vue 3.
    </p>

    <div class="button-row">
      <VueButton variant="primary">Primary</VueButton>
      <VueButton variant="secondary">Secondary</VueButton>
      <VueButton>Default</VueButton>
    </div>

    <div class="button-row">
      <VueButton variant="primary" bordered>Bordered</VueButton>
      <VueButton variant="primary" ghost>Ghost</VueButton>
      <VueButton variant="primary" link>Link</VueButton>
    </div>

    <div class="card">
      <h2>Card Surface</h2>
      <p>This card uses the overridden AgnosticUI background tokens. Body font should be Fira Sans.</p>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  min-height: 100vh;
  justify-content: center;
}

h1 {
  font-family: 'Fira Code', monospace;
  font-size: 1.875rem;
  font-weight: 700;
}

.subtitle {
  max-width: 28rem;
  text-align: center;
  opacity: 0.7;
}

.button-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
}

.card {
  background: var(--ag-background-secondary);
  border: 1px solid var(--ag-border);
  border-radius: var(--ag-radius-md);
  padding: 1.5rem;
  max-width: 24rem;
}

.card h2 {
  font-family: 'Fira Code', monospace;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
}

.card p {
  font-size: 0.875rem;
  margin: 0;
}
</style>
