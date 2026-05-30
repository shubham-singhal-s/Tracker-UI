# Tracker UI — UX Overhaul & React 19 Optimisation Plan

## Principles

- **Lean & modern**: dark-first, high-contrast, generous whitespace, no visual noise.
- **Card preservation**: the [`DealCard`](src/views/ozbargain-card.tsx) structure (thumbnail, title, pills, footer) stays functionally identical; only spacing, typography, hover states and focus rings are upgraded.
- **Accordion-first**: keep the Radix accordion paradigm but flatten nesting and modernise triggers.
- **React 19 + Compiler**: remove manual memo/callback noise; rely on the compiler. Add `Suspense`, `useTransition`, `useSyncExternalStore`.
- **Zero new runtime deps**: use native CSS View Transitions and Tailwind v4 utilities.

---

## 1. Foundation Clean-up

### 1.1 Remove dead CSS

- Delete boilerplate from [`App.css`](src/App.css) (`.logo`, `@keyframes logo-spin`, `.read-the-docs`).
- Keep only `#root` max-width / margin rules (or move them into `index.css`).

### 1.2 Global style tokens

- Ensure [`index.css`](src/index.css) has `@import "tailwindcss";` and `@theme inline` blocks intact.
- Add `prefers-reduced-motion` guard for custom accordion animations.

---

## 2. State Management Refactor

### 2.1 `useSavedDeals` hook

Replace imperative `localStorage` + custom event boilerplate in:

- [`DealsAccordion`](src/views/accordions/deals-accordion.tsx)
- [`Saver`](src/views/saver.tsx)
- [`deal.tsx`](src/views/deal.tsx)

New hook (`src/hooks/use-saved-deals.ts`):

- Reads `savedDeals` via `useSyncExternalStore` so every consumer updates automatically across tabs.
- Exposes `addDeal(term)`, `removeDeal(term)` using React 19 Actions pattern (optimistic or transition-based).
- Returns `{ deals, addDeal, removeDeal }`.

### 2.2 `hideOld` toggle

- In [`App.tsx`](src/App.tsx), wrap `setHideOld` with `startTransition` so the UI stays responsive while filtering re-renders.

---

## 3. Layout Refactor — Flatten & Modernise Accordions

### 3.1 `App.tsx` structure

```
<div className="min-h-dvh bg-background text-foreground">
  <main className="mx-auto max-w-7xl px-4 py-6">
    <Accordion type="single" collapsible>
      <DayAccordion />
      <EpicAccordion />
      <TopDealsAccordion />
    </Accordion>

    <section className="mt-4">
      <DealsAccordion hideOld={hideOld} />
    </section>
  </main>

  <OptionsBar />   {/* desktop: sticky footer; mobile: bottom sheet */}
</div>
```

### 3.2 Accordion triggers

- Convert each [`AccordionTrigger`](src/components/ui/accordion.tsx) to a **rich header**:
  - Left: icon + bold title.
  - Right: live count pill (e.g. "12 deals", "2 games") + chevron.
- Remove hard-coded `style={{ fontWeight: 600 }}`; use Tailwind `font-semibold`.
- Add `view-transition-name` to each `AccordionItem` for smooth expand/collapse.

### 3.3 Nested accordions

- The old [`DealsAccordion`](src/views/accordions/deals-accordion.tsx) wrapped an inner `Accordion`. Instead, render a flat list of **collapsible deal groups** (still Radix `Accordion` but styled as clean sub-panels) so depth is at most two levels.

---

## 4. Loading & Empty States

Introduce [`Skeleton`](src/components/ui/skeleton.tsx) from ShadCN pattern (simple `animate-pulse` div).

| Section   | Skeleton                      | Empty state                      |
| --------- | ----------------------------- | -------------------------------- |
| MyDay     | 3 weather card placeholders   | "Weather unavailable" with retry |
| TopDeals  | 6 deal card placeholders      | "No frontpage deals"             |
| EpicGames | 2 tall game card placeholders | "No free games this week"        |
| Deals     | Search-term row skeletons     | "No saved deals — add one below" |

Wrap each view in `Suspense` inside its accordion content so only the opened section triggers loading UI.

---

## 5. Card Design System Upgrade

### 5.1 `DealCard`

- **Spacing**: replace arbitrary `p-3`, `px-5`, `pb-3` with design-token spacing: `gap-3`, `p-4`, `px-4`, `pb-4`.
- **Container queries**: wrap grid in `@container` and use `@min-[320px]:grid-cols-2` etc. so cards adapt inside accordion content, not just viewport.
- **Micro-interactions**:
  - `hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200` on card.
  - `group` on card image for subtle `group-hover:scale-105` zoom (with `overflow-hidden`).
- **Focus rings**: ensure `focus-visible:ring-2 focus-visible:ring-ring` on the clickable wrapper (render as `<a>` or `<button>` instead of `onClick` on `<div>` for a11y).
- **Pills**: convert to a `Badge`-like sub-component with consistent `h-6` height and `gap-1.5`.

### 5.2 Weather cards (`MyDay`)

- Unify background blur overlay approach with tokens (`bg-black/40 backdrop-blur-sm`).
- Replace magic-number `minHeight: 320` with Tailwind `min-h-80`.
- Add `animate-in fade-in duration-500` when data arrives.

### 5.3 Epic game cards

- Same hover treatment as deal cards.
- Ensure text has `text-shadow` or `bg-gradient-to-t` overlay for readability instead of ad-hoc opacity layers.

---

## 6. React 19 / Compiler Optimisations

### 6.1 Compiler hygiene

- Remove any `useMemo` / `useCallback` that the compiler can auto-memoise (e.g. sorted arrays inside render).
- Keep `useMemo` only for genuinely expensive computations (if any).
- Add `"use no memo"` only if a component breaks with compiler (unlikely).

### 6.2 `Suspense` + `use`

- Convert API wrappers to return promises and leverage `use()` inside components where feasible, wrapped in `Suspense`.
- For now, keep `useQuery` but wrap each section:
  ```tsx
  <Suspense fallback={<SkeletonGrid />}>
    <TopDeals />
  </Suspense>
  ```

### 6.3 Transitions

- `hideOld` toggle → `startTransition`.
- Adding/removing saved deals → wrapped in transition so the accordion doesn’t stutter.

---

## 7. View Transitions & Motion

- **Accordion items**: add `style={{ viewTransitionName: 'section-day' }}` etc. and call `document.startViewTransition(() => setOpenItem(...))` when supported.
- **Fallback**: rely on Radix’s `animate-accordion-down` / `animate-accordion-up` CSS animations.
- **Reduced motion**:
  ```css
  @media (prefers-reduced-motion: reduce) {
    ::view-transition-group(*),
    ::view-transition-old(*),
    ::view-transition-new(*) {
      animation: none;
    }
  }
  ```

---

## 8. Responsive & Mobile UX

- **Touch targets**: all interactive elements min `h-11` (44 px).
- **Grid gaps**: `gap-3` on mobile, `gap-4` on `sm`, `gap-6` on `lg`.
- **Bottom sheet for Options** (`Settings` + `Saver` + `hideOld` toggle):
  - Mobile: slide-up panel triggered by a floating action button or footer bar.
  - Desktop: compact sticky footer inside `<aside>` or bottom toolbar.

---

## 9. Build / Network Optimisations

- [`index.html`](index.html):
  - Add `<link rel="preconnect" href="https://randoms.shubham21197.workers.dev">`.
  - Add `<link rel="dns-prefetch" href="https://api.open-meteo.com">`.
- [`vite.config.ts`](vite.config.ts):
  - Verify `manualChunks` still makes sense after refactor (keep `crypto` split since `jsencrypt` is large).
  - Ensure `target: "es2022"` and `drop: ["console","debugger"]` in production.

---

## 10. Accessibility

- All accordion triggers are `<button>` (Radix handles this).
- Add `aria-expanded`, `aria-controls` where custom wrappers exist.
- Ensure colour contrast ≥ 4.5:1 on pill text.
- Focus-visible rings on cards, inputs, and toggles.

---

## Execution Order

1. Clean-up CSS + foundation tokens.
2. Extract `useSavedDeals` hook; refactor `Saver`, `deal.tsx`, `DealsAccordion`.
3. Add `Skeleton` component and wrap async views in `Suspense`.
4. Refactor `App.tsx` layout and modernise accordion triggers.
5. Upgrade `DealCard`, weather cards, epic cards with new tokens + interactions.
6. Apply `startTransition`, remove redundant memoisation.
7. Wire up CSS View Transitions + reduced-motion guards.
8. Responsive pass (mobile bottom sheet, touch targets).
9. Build / network hints + final smoke test.
