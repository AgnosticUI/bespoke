import { Button } from "@/components/ui/button";

function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-3xl font-bold">Bespoke Token Verification</h1>
      <p className="text-muted-foreground max-w-md text-center">
        Medical patient-portal design system. Fira Code headings, Fira Sans body.
      </p>

      <div className="flex flex-wrap gap-3">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>

      <div className="rounded-lg border bg-card p-6 text-card-foreground max-w-sm">
        <h2 className="text-xl font-semibold mb-2">Card Surface</h2>
        <p className="text-sm">This card uses <code className="bg-muted px-1 rounded">bg-card</code> and <code className="bg-muted px-1 rounded">text-card-foreground</code> tokens.</p>
      </div>

      <div className="flex gap-3">
        <span className="inline-block rounded bg-accent px-3 py-1 text-accent-foreground text-sm font-medium">Accent</span>
        <span className="inline-block rounded bg-muted px-3 py-1 text-muted-foreground text-sm font-medium">Muted</span>
      </div>
    </div>
  );
}

export default App;
