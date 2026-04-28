# Smart `TreeExpandableCell` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `TreeExpandableCell` from `@gravity-ui/table` the recommended way to render tree chevrons. Consumer code uses standard TanStack API + this single component import — no library-specific hooks. The library exports already exist; the change is doc-side in the library and a small consumer migration in arcadia.

**Architecture:** Library is doc-only (rewrite anti-pattern #3 in the migration guide). Consumer (arcadia QuotasTable3) replaces its hand-rolled local `TreeExpandableCell` with the library export, deletes the local component, and trims dead code in `collapsibleStateContext.tsx` that was only used by the local component. Library's component uses BEM block `'styled-table'` — identical to the consumer's local one — so the existing `gt-styled-table__expanding-control` class continues to apply with zero CSS changes.

**Tech Stack:** TypeScript, React 18, `@gravity-ui/table` v0.x (this repo), `@gravity-ui/uikit`. Consumer repo uses yalc to consume the local library build.

---

## Pre-flight context

Spec: [`docs/superpowers/specs/2026-04-27-smart-tree-expandable-cell-design.md`](../specs/2026-04-27-smart-tree-expandable-cell-design.md).

The library already exports `TreeExpandableCell` (verified in `src/index.ts:9`) and `useIsExpanded` (verified in `src/index.ts`). The library's component uses `useIsExpanded(row)` internally, so consumers don't import it. `BaseCell` is **not** modified — the auto-subscribe approach was rejected and reverted.

Consumer setup verified pre-plan:

- Only one importer of the local component: `utils/columns/getProviderAndResourceColumn.tsx:6`.
- Local component lives at `components/TreeExpandableCell/TreeExpandableCell.tsx`. The directory contains no other files (verified with `ls`).
- `QuotasTable3.scss` does **not** target `expanding-control` directly. Other `gt-styled-table__*` classes match between library and local component (same BEM block).
- `collapsibleStateContext.tsx` exports `useRowExpandedState`, `useToggleRowState` (and private helpers `getLocalState`, `toggleState`, `stateRef`) used **only** by the local `TreeExpandableCell`. After deletion of the local component, these exports become dead.
- Already applied (out of scope for this plan): `rowAttributes` lift, `useSetExpandedFromContext` bridge, `useCurrencyVisibilityContext` memoization fix.

## File map

### Library (in `/home/chelentos/table`) — modified

- `docs/MIGRATION-experimentalMemoization.md` — rewrite anti-pattern #3 and the worked example to lead with `TreeExpandableCell` (component) and demote `useIsExpanded` (hook) to a "Building your own analogue" sub-section.

### Library — untouched (verify, don't edit)

- `src/index.ts` — `TreeExpandableCell` already exported (line 9), `useIsExpanded` already exported.
- `src/components/TreeExpandableCell/TreeExpandableCell.tsx` — already correct shape; uses `useIsExpanded(row)` internally.
- `src/components/BaseCell/BaseCell.tsx` — explicitly **not** modified.

### Consumer (in `/home/chelentos/arcadia/data-ui/abcd`) — modified

- `src/ui/units/quotas/pages/QuotasPage/containers/QuotasTable/QuotasTable3/utils/columns/getProviderAndResourceColumn.tsx` — switch import from local component to `@gravity-ui/table`.
- `src/ui/units/quotas/pages/QuotasPage/containers/QuotasTable/QuotasTable3/collapsibleStateContext.tsx` — remove `useRowExpandedState`, `useToggleRowState`, and their private helpers.

### Consumer — deleted

- `src/ui/units/quotas/pages/QuotasPage/containers/QuotasTable/QuotasTable3/components/TreeExpandableCell/` — entire directory (1 file).

---

## Task 1: Rewrite migration doc anti-pattern #3 and worked example

**Files:**

- Modify: `/home/chelentos/table/docs/MIGRATION-experimentalMemoization.md`

The doc currently presents `useIsExpanded(row)` as the required pattern in anti-pattern #3 and the worked example. Rewrite both to lead with `TreeExpandableCell` and demote `useIsExpanded` to an advanced footnote.

- [ ] **Step 1: Read the current doc to confirm exact line ranges**

```bash
grep -n "^### \|^## " /home/chelentos/table/docs/MIGRATION-experimentalMemoization.md
```

Expected output includes lines for `### 1.`, `### 2.`, `### 3. row.getIsExpanded() / row.getIsSelected() in custom cells`, `### 4.`, `## Verification recipe`, `## Worked example: arcadia QuotasTable3`. Use the line numbers to scope the next edits.

- [ ] **Step 2: Replace anti-pattern #3 entirely**

Replace the entire `### 3. row.getIsExpanded() / row.getIsSelected() in custom cells` section (currently 31 lines, ending just before `### 4. Fresh state object in useTable`) with this new content:

````markdown
### 3. Reading row state inside cells

For tree expansion, **use `TreeExpandableCell` from the library**. It encapsulates
the chevron button + the row-state subscription in one component:

```tsx
import {TreeExpandableCell} from '@gravity-ui/table';

const columns: ColumnDef<Item>[] = [
  {
    accessorKey: 'name',
    cell: (info) => (
      <TreeExpandableCell row={info.row}>{info.getValue<string>()}</TreeExpandableCell>
    ),
  },
];
```

Your code uses only TanStack API (`info.row`, `info.getValue`) plus this one
component. No hooks to import.

#### Building your own analogue (advanced)

If `TreeExpandableCell`'s default chevron styling doesn't fit your design and
you need a custom row-state-aware component, import `useIsExpanded(row)`. It
subscribes to the same `RowStateContext` that `TreeExpandableCell` uses
internally — without it, `row.getIsExpanded()` reads live state but the cell
render fn doesn't run after a memo skip, so the displayed value goes stale:

```tsx
import {useIsExpanded} from '@gravity-ui/table';

const MyChevron = ({row}: {row: Row<Item>}) => {
  const expanded = useIsExpanded(row); // memo-safe; stays in sync after toggles
  return <CustomIcon direction={expanded ? 'down' : 'right'} />;
};
```

**Do not** call `row.getIsExpanded()` directly inside a cell render fn under
`experimentalMemoization` — `MemoBaseCell` skips re-rendering on row state
changes, so the displayed value goes stale after a toggle.
````

- [ ] **Step 3: Replace the "Worked example: arcadia QuotasTable3" section**

Replace the entire `## Worked example: arcadia QuotasTable3` section (the last section in the file, currently ending with the "custom CollapsibleStateContext..." paragraph) with this updated worked example:

````markdown
## Worked example: arcadia QuotasTable3

Before:

```tsx
// QuotasTable3.tsx
<Table
  table={table}
  rowAttributes={(row) => getRowAttributes(row.original)} // anti-pattern #1
  experimentalMemoization
/>
```

```tsx
// Local TreeExpandableCell (subscribes to a fanout context, anti-pattern #2)
const expanded = useRowExpandedState(rowId);
const toggleExpanded = useToggleRowState(rowId);
```

After:

```tsx
// QuotasTable3.tsx — rowAttributes lifted to module scope
const rowAttributesHandler = (row: Row<QuotasTable3Row>) => getRowAttributes(row.original);

// ...

<Table table={table} rowAttributes={rowAttributesHandler} experimentalMemoization />;
```

```tsx
// Column def — use the library's TreeExpandableCell directly
import {TreeExpandableCell} from '@gravity-ui/table';

{
  cell: (info) => (
    <TreeExpandableCell row={info.row}>{info.getValue<string>()}</TreeExpandableCell>
  ),
}
```

```tsx
// QuotasTable3.tsx — bridge TanStack's onExpandedChange back into the persisted context
const onExpandedChange = useSetExpandedFromContext();
const table = useTable({
    // ...
    onExpandedChange,
    state: {expanded, ...},
});
```

The custom `CollapsibleStateContext` still owns the persisted expansion map
(used by expand-all / collapse-all buttons elsewhere on the page), but cells
no longer subscribe to it — its value invalidations only re-render the table
container, which has to re-render anyway when expansion changes. The local
`TreeExpandableCell` and the `useRowExpandedState` / `useToggleRowState`
hooks are gone; the library component handles the chevron + subscription.
````

- [ ] **Step 4: Run prettier on the doc**

```bash
cd /home/chelentos/table && npx prettier --write docs/MIGRATION-experimentalMemoization.md
```

Expected: prettier writes back the file with consistent formatting. No errors.

- [ ] **Step 5: Verify the doc reads cleanly end-to-end**

```bash
cat /home/chelentos/table/docs/MIGRATION-experimentalMemoization.md | head -200
```

Expected: anti-pattern #1, #2, the new #3, and #4 are all present in order. The "What memoization can and can't fix" section at the top still references `useIsExpanded` as a fix in its third bullet — change that bullet to:

> - Cells call `row.getIsExpanded()` / `row.getIsSelected()` directly inside a memoized render path. Use `TreeExpandableCell` for tree chevrons, or `useIsExpanded(row)` for custom row-state-aware components — see anti-pattern #3.

Apply this small text edit too.

- [ ] **Step 6: Commit**

```bash
cd /home/chelentos/table && git add docs/MIGRATION-experimentalMemoization.md
git commit -m "$(cat <<'EOF'
docs(migration): TreeExpandableCell is the recommended chevron path

Rewrite anti-pattern #3 and the worked example to lead with the
library's TreeExpandableCell component. useIsExpanded is demoted
to an advanced 'Building your own analogue' sub-section for
consumers who need custom chevron styling. row.getIsExpanded()
inside a memoized cell remains an explicit anti-pattern.
EOF
)"
```

---

## Task 2: Switch arcadia consumer to library's `TreeExpandableCell`

**Files:**

- Modify: `/home/chelentos/arcadia/data-ui/abcd/src/ui/units/quotas/pages/QuotasPage/containers/QuotasTable/QuotasTable3/utils/columns/getProviderAndResourceColumn.tsx`
- Delete: `/home/chelentos/arcadia/data-ui/abcd/src/ui/units/quotas/pages/QuotasPage/containers/QuotasTable/QuotasTable3/components/TreeExpandableCell/`

This task happens in the arcadia repo, not the library repo. All commands assume CWD is the arcadia root.

- [ ] **Step 1: Confirm exactly one importer of the local component**

```bash
cd /home/chelentos/arcadia/data-ui/abcd && grep -rln "components/TreeExpandableCell/TreeExpandableCell" src/ui/units/quotas/pages/QuotasPage/containers/QuotasTable/QuotasTable3/
```

Expected: a single line: `src/ui/units/quotas/pages/QuotasPage/containers/QuotasTable/QuotasTable3/utils/columns/getProviderAndResourceColumn.tsx`. If more files appear, the plan is incomplete — stop and update the plan to include them.

- [ ] **Step 2: Update the import in `getProviderAndResourceColumn.tsx`**

Open `src/ui/units/quotas/pages/QuotasPage/containers/QuotasTable/QuotasTable3/utils/columns/getProviderAndResourceColumn.tsx`. Line 6 currently reads:

```tsx
import {TreeExpandableCell} from '../../components/TreeExpandableCell/TreeExpandableCell';
```

Replace with:

```tsx
import {TreeExpandableCell} from '@gravity-ui/table';
```

The component's prop shape is the same (`{row, children}`), and the JSX usage at lines 22–24 does not change.

- [ ] **Step 3: Delete the local component directory**

```bash
cd /home/chelentos/arcadia/data-ui/abcd && \
  rm -rf src/ui/units/quotas/pages/QuotasPage/containers/QuotasTable/QuotasTable3/components/TreeExpandableCell/
```

If `components/` is now empty, also remove it:

```bash
cd /home/chelentos/arcadia/data-ui/abcd && \
  rmdir src/ui/units/quotas/pages/QuotasPage/containers/QuotasTable/QuotasTable3/components/ 2>/dev/null || true
```

(`rmdir` only removes empty directories; the `|| true` swallows the "not empty" exit code if other files exist.)

- [ ] **Step 4: Verify no stale references remain**

```bash
cd /home/chelentos/arcadia/data-ui/abcd && \
  grep -rn "components/TreeExpandableCell" src/ui/units/quotas/pages/QuotasPage/ || echo "CLEAN"
```

Expected: `CLEAN`. If anything matches, fix the dangling reference.

- [ ] **Step 5: Run typecheck on the arcadia project**

Use whatever the arcadia project's typecheck command is. Common options:

```bash
cd /home/chelentos/arcadia/data-ui/abcd && npm run typecheck
```

or

```bash
cd /home/chelentos/arcadia/data-ui/abcd && npx tsc --noEmit
```

Expected: clean. If failures appear, they should be import errors that the previous steps missed — fix and re-verify.

- [ ] **Step 6: Commit**

```bash
cd /home/chelentos/arcadia/data-ui/abcd && \
  git add src/ui/units/quotas/pages/QuotasPage/containers/QuotasTable/QuotasTable3/utils/columns/getProviderAndResourceColumn.tsx \
          src/ui/units/quotas/pages/QuotasPage/containers/QuotasTable/QuotasTable3/components/

git commit -m "$(cat <<'EOF'
refactor(QuotasTable3): use library's TreeExpandableCell

Drop the local TreeExpandableCell component (40 lines) in favor of
the @gravity-ui/table export. The library's component encapsulates
the useIsExpanded subscription internally, so the column's cell
render fn uses only TanStack API + this single component import.

The library uses the same 'gt-styled-table__expanding-control' BEM
class as the local component, so QuotasTable3.scss needs no changes.
EOF
)"
```

---

## Task 3: Trim dead code in `collapsibleStateContext.tsx`

**Files:**

- Modify: `/home/chelentos/arcadia/data-ui/abcd/src/ui/units/quotas/pages/QuotasPage/containers/QuotasTable/QuotasTable3/collapsibleStateContext.tsx`

After Task 2, `useRowExpandedState`, `useToggleRowState`, `getLocalState`, `toggleState`, and `stateRef` have no consumers anywhere in QuotasTable3 (they were used only by the deleted local `TreeExpandableCell`). Remove them.

- [ ] **Step 1: Confirm no remaining consumers**

```bash
cd /home/chelentos/arcadia/data-ui/abcd && \
  grep -rn "useRowExpandedState\|useToggleRowState" src/ | grep -v "collapsibleStateContext.tsx"
```

Expected: no output. The only remaining references should be the definitions inside `collapsibleStateContext.tsx` itself (which we're about to remove).

- [ ] **Step 2: Read the current file to scope the deletions**

```bash
cd /home/chelentos/arcadia/data-ui/abcd && \
  cat src/ui/units/quotas/pages/QuotasPage/containers/QuotasTable/QuotasTable3/collapsibleStateContext.tsx
```

Identify the lines defining `useRowExpandedState`, `useToggleRowState`, `getLocalState`, `toggleState`, and any `stateRef` declaration.

- [ ] **Step 3: Remove the dead exports and helpers**

In `collapsibleStateContext.tsx`, delete:

- The `useRowExpandedState` export (function + any associated `useSyncExternalStore` / subscribe glue specific to it).
- The `useToggleRowState` export.
- The private `getLocalState` helper if it has no remaining callers after the above two are gone.
- The private `toggleState` helper if same.
- The `stateRef` declaration if it has no remaining callers.

After deletion, the `CollapsibleStateContextShape` type should match this shape (per the spec):

```ts
{
    state: Record<string, boolean>;
    setState: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    expandAll: () => void;
    collapseAll: () => void;
}
```

Surviving exports:

- `state`, `setState`, `expandAll`, `collapseAll` (used by `QuotasTable3.tsx` and `QuotasPageV2.tsx`).
- `useTableExpandedState`, `useGlobalExpandCollapseActions` (wrappers).
- `useSetExpandedFromContext` (the bridge added in C2b).

- [ ] **Step 4: Verify nothing else depends on the removed exports**

```bash
cd /home/chelentos/arcadia/data-ui/abcd && \
  grep -rn "getLocalState\|toggleState\|stateRef" src/ | grep -v "collapsibleStateContext.tsx"
```

Expected: no output (or only matches in unrelated files that happen to use these generic names — eyeball each match).

- [ ] **Step 5: Run typecheck**

```bash
cd /home/chelentos/arcadia/data-ui/abcd && npm run typecheck
```

Expected: clean.

- [ ] **Step 6: Commit**

```bash
cd /home/chelentos/arcadia/data-ui/abcd && \
  git add src/ui/units/quotas/pages/QuotasPage/containers/QuotasTable/QuotasTable3/collapsibleStateContext.tsx

git commit -m "$(cat <<'EOF'
chore(QuotasTable3): trim dead code in collapsibleStateContext

After switching to the library's TreeExpandableCell, the per-row
hooks (useRowExpandedState, useToggleRowState) and their private
helpers have no consumers. Remove them. The context still owns
the persisted expansion map for expand-all / collapse-all and
the onExpandedChange bridge.
EOF
)"
```

---

## Task 4: Final verification (manual)

**Files:** none modified.

The change is mechanical and behavior-preserving. Verify in the running dev build before considering the work done.

- [ ] **Step 1: Build the library and link via yalc**

```bash
cd /home/chelentos/table && npm run build && npx yalc push
```

Expected: build succeeds, `yalc push` reports the package was pushed to subscribers (including arcadia). If yalc isn't already linked, the user will know how to wire it up — out of scope for this plan.

- [ ] **Step 2: Start the arcadia dev server**

Use the arcadia project's dev command (project-specific, e.g. `npm start` or `npm run dev`):

```bash
cd /home/chelentos/arcadia/data-ui/abcd && npm start
```

Wait for the dev server to be ready. Open the QuotasPage in a browser.

- [ ] **Step 3: Smoke test — chevron flips correctly on toggle**

In QuotasTable3, click a provider row's chevron button.

Expected:

- The chevron icon visually rotates (▶ → ▼).
- The provider's children appear below it.
- Clicking again collapses (chevron returns to ▶, children hidden).

If the chevron does not flip, something is wrong with the library link (the cell render fn isn't being called after toggle). Stop and diagnose.

- [ ] **Step 4: Profiler test — only the toggled row's cells re-render**

Open React DevTools → Profiler. Enable "Highlight updates when components render" (gear icon). Click "Record". Toggle one provider row. Stop recording.

Expected commit footprint:

- The toggled row's cells highlight (re-rendered).
- Newly visible children rows highlight (mounted).
- **Other provider rows do NOT highlight** — cross-row isolation preserved.

If unrelated rows highlight, an anti-pattern is still active in the consumer. Diagnose against the migration doc's checklist.

- [ ] **Step 5: Console check — no library warnings**

Open the browser DevTools Console while toggling rows.

Expected: no `[gravity-ui/table] experimentalMemoization is enabled but ...` warnings. If any appear, the named prop is unstable — fix in the consumer.

- [ ] **Step 6: Smoke test — global actions still work**

If `QuotasPageV2` exposes expand-all / collapse-all buttons (per the spec), click each.

Expected: all expandable rows expand, then all collapse. The `useSetExpandedFromContext` bridge syncs both ways.

- [ ] **Step 7: Stop dev server and unlink**

```bash
# Ctrl+C the npm start process
cd /home/chelentos/arcadia/data-ui/abcd && npx yalc remove @gravity-ui/table && npm install
```

(If the user prefers to keep the yalc link until the library publishes, skip the unlink — but the working tree should reflect a published-state `package-lock.json` before merging the arcadia PR.)

---

## Final summary

After all four tasks:

**Library (`/home/chelentos/table`):** one commit on the working branch — the migration doc rewrite. No code changes.

**Consumer (`/home/chelentos/arcadia/data-ui/abcd`):** two commits — switch to library's `TreeExpandableCell` and delete the local component, then trim dead code in `collapsibleStateContext.tsx`. Manual verification confirmed the chevron flips and cross-row isolation holds.

The consumer's tree cells now use only TanStack API (`info.row`, `info.getValue`) plus a single `TreeExpandableCell` component import from the library. `useIsExpanded` is reserved for the rare custom-chevron case and explicitly documented as such.
