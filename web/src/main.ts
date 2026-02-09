import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="flex flex-col items-center gap-8 p-8">
    <h1 class="text-3xl font-bold">Bespoke Token Verification</h1>
    <p class="text-base-content/70 max-w-md text-center">
      Medical patient-portal design system. DaisyUI + Tailwind 4.
    </p>

    <div class="flex flex-wrap gap-3">
      <button class="btn btn-primary">Primary</button>
      <button class="btn btn-secondary">Secondary</button>
      <button class="btn btn-accent">Accent</button>
      <button class="btn btn-neutral">Neutral</button>
    </div>

    <div class="flex flex-wrap gap-3">
      <button class="btn btn-info">Info</button>
      <button class="btn btn-success">Success</button>
      <button class="btn btn-warning">Warning</button>
      <button class="btn btn-error">Error</button>
    </div>

    <div class="card bg-base-200 shadow-md max-w-sm">
      <div class="card-body">
        <h2 class="card-title">Card Surface</h2>
        <p>This card uses base-200 surface. The heading font should be Fira Code.</p>
      </div>
    </div>

    <div class="flex gap-3">
      <span class="badge badge-primary">Primary</span>
      <span class="badge badge-secondary">Secondary</span>
      <span class="badge badge-accent">Accent</span>
    </div>
  </div>
`
