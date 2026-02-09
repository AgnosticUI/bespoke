# Cheat Sheet

## Running Locally

Provided `npm i` and `npm run build` done:

```shell
npm start                # shows help
npm start -- init        # runs the init command
npm start -- --version   # shows version
```
__The -- tells npm to pass the remaining args through to the script.__

## Using from another Workspace

In bespoke/cli:
```shell
  npm run build && npm pack
  # Creates bespokeui-cli-1.0.0.tgz

  # In your AgnosticUI workspace:
  npm install /path/to/bespoke/cli/bespokeui-cli-1.0.0.tgz
  # Then run:
  npx bespokeui init
```

## How it works

`npm pack` creates a tarball of only what's in `"files": ["dist"]`, and `npm install <tarball>` installs it locally with the bespokeui `bin` linked. You can then interact with it exactly as if it were published to npm.

## Notes

- **180 SVGs** across 15 niches (12 each), bundled into `dist/assets/layouts/`
- **Puppeteer** is optional — not in CLI deps, marked `external` in esbuild. Only needed for the `combine-previews` screenshot step
- **ora** provides terminal spinners; **prompts** handles interactive framework/directory selection during `bespokeui init`

## Bespoke Site

Just putting here notes for how I'd go about setting this up bespoke.agnosticui.com

# Mental model

* **agnosticui.github.io** = a big **GitHub Pages switchboard**
* **DNS** = the phone book that says *“when someone asks for this name, send them to that switchboard”*
* **Each repo** = a room behind the switchboard
* **The CNAME file** = a name tag on the room door saying *“I answer when THIS domain name is requested”*

GitHub Pages looks at:

> “What domain did the browser ask for?”
> Then:
> “Which repo claims that domain?”

That’s it. No conflicts. No guessing.

---

# What you want (clear goals)

You want **two different websites**, both served by GitHub Pages:

| URL                                                              | Repo                    | Branch                         |
| ---------------------------------------------------------------- | ----------------------- | ------------------------------ |
| [https://www.agnosticui.com](https://www.agnosticui.com)         | `AgnosticUI/agnosticui` | `gh-pages`                     |
| [https://bespoke.agnosticui.com](https://bespoke.agnosticui.com) | `AgnosticUI/bespoke`    | (usually `main` or `gh-pages`) |

Both can point to **agnosticui.github.io** behind the scenes. That’s normal.

---

# Part 1: Make sure the MAIN SITE is correct (already working, but verify)

## Repo

`https://github.com/AgnosticUI/agnosticui`

### Step 1 — Open GitHub Pages settings

1. Go to **Settings → Pages**
2. Confirm:

   * **Source** = `gh-pages` branch
   * **Folder** = `/ (root)`

### Step 2 — Custom domain

In **Custom domain**, it should say **one of these**:

* `www.agnosticui.com`
  **OR**
* `agnosticui.com`

Click **Save** if it’s not already saved.

### Step 3 — CNAME file

In the `gh-pages` branch, you should see a file named:

```
CNAME
```

Its contents should be **exactly one line**:

```
www.agnosticui.com
```

(or `agnosticui.com` if you chose apex)

✅ If this is true, **do not touch it**. Your main site is already “claiming” that domain.

---

# Part 2: Prepare the BESPOKE repo

## Repo

`https://github.com/AgnosticUI/bespoke`

This repo will ONLY answer for:

```
bespoke.agnosticui.com
```

### Step 4 — Choose the branch

Decide which branch serves the site:

* If it’s a static build → usually `gh-pages`
* If it’s simple → `main`

(Doesn’t matter as long as you’re consistent.)

### Step 5 — Enable GitHub Pages

1. Go to **Settings → Pages**
2. Set:

   * **Source** = your chosen branch
   * **Folder** = `/ (root)`

### Step 6 — Set the custom domain

In **Custom domain**, enter:

```
bespoke.agnosticui.com
```

Click **Save**.

GitHub will:

* Create a `CNAME` file automatically **or**
* Ask you to add one

### Step 7 — Verify CNAME file

In the serving branch, confirm there is a file:

```
CNAME
```

with **exactly**:

```
bespoke.agnosticui.com
```

⚠️ This repo must NOT contain:

* `agnosticui.com`
* `www.agnosticui.com`

Only the bespoke subdomain.

---

# Part 3: DNS (this is the only place people get confused)

You control `agnosticui.com`, so this is easy.

Go to your DNS provider (Cloudflare, Namecheap, Route53, etc.).

## Step 8 — Add / verify DNS records

You need **two CNAME records**.

### Record 1 — Main site

```
Type:   CNAME
Name:   www
Value:  agnosticui.github.io
```

### Record 2 — Bespoke

```
Type:   CNAME
Name:   bespoke
Value:  agnosticui.github.io
```

Yes — they BOTH point to the same place.
That’s expected. That’s the “switchboard”.

### Optional (apex domain)

If you want `https://agnosticui.com` (no www):

* Use ALIAS / ANAME → `agnosticui.github.io`
* OR GitHub’s A records (not required if www is fine)

---

# Part 4: What happens when someone visits?

### Visiting [https://www.agnosticui.com](https://www.agnosticui.com)

1. DNS → agnosticui.github.io
2. GitHub Pages checks:

   * “Which repo has `www.agnosticui.com` in its CNAME?”
3. Answer: **agnosticui repo**
4. Site loads ✅

### Visiting [https://bespoke.agnosticui.com](https://bespoke.agnosticui.com)

1. DNS → agnosticui.github.io
2. GitHub Pages checks:

   * “Which repo has `bespoke.agnosticui.com` in its CNAME?”
3. Answer: **bespoke repo**
4. Site loads ✅

No conflicts. Ever.

---

# Final checklist (print this)

✅ Main repo CNAME = `www.agnosticui.com`
✅ Bespoke repo CNAME = `bespoke.agnosticui.com`
✅ DNS has:

* `www → agnosticui.github.io`
* `bespoke → agnosticui.github.io`
  ✅ Each repo claims **only its own domain**
