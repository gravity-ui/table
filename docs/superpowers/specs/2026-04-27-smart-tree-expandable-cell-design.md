# Encapsulate `useIsExpanded` inside library's `TreeExpandableCell`

## Context

The prior spec [`2026-04-27-experimental-memoization-real-world-design.md`](2026-04-27-experimental-memoization-real-world-design.md) prescribed that consumers writing tree cells must call `useIsExpanded(row)` from `@gravity-ui/table` to make their chevron memo-safe under `experimentalMemoization`. While correct, this puts a library-specific hook in every consumer's cell code.

A previously-explored alternative (auto-subscribing `BaseCell` to `RowStateContext` so plain `row.getIsExpanded()` becomes memo-safe) was rejected: it forces _all_ cells of the toggled row to re-render, including cells that don't read row state at all.

This spec adopts a third option that has been hiding in plain sight: the library already exports `TreeExpandableCell`, a smart component that internally calls `useIsExpanded(row)`. Consumers replace their hand-rolled chevron with the library's component. The hook lives behind a component boundary; consumer code uses only TanStack API + this single library import.

## Approach

**Library: no code changes.** `TreeExpandableCell`, `useIsExpanded`, `useRowState`, `RowStateContext` already exist and work correctly. The only library deliverable is a migration-doc rewrite that _leads_ with `TreeExpandableCell` and demotes `useIsExpanded` to "advanced — use this only when you're building a custom analogue of `TreeExpandableCell`."

**Consumer (arcadia QuotasTable3): delete the local `TreeExpandableCell` component** (40 lines) and replace with the library import. The `useIsExpanded` import disappears from consumer code as a side effect.

The other consumer fixes (rowAttributes stabilization, `onExpandedChange` bridge, currency-context fix, dead-code trim) remain as in the prior spec — they address independent anti-patterns and are unchanged by this design choice.

## Library — what stays

- `TreeExpandableCell` exported from `src/index.ts:9` — the recommended chevron component.
- `useIsExpanded(row)` exported — the escape hatch for consumers writing a custom analogue of `TreeExpandableCell` (e.g., a chevron with different styling that the library's component doesn't expose).
- `useRowState()` and `RowStateContext` exported — same escape-hatch tier.
- `MemoBaseRow.areEqual`, `MemoBaseCell.areCellPropsEqual`, `useStableRefWarning`, `experimentalMemoization` — unchanged.

## Library — what changes

### `docs/MIGRATION-experimentalMemoization.md`

Rewrite anti-pattern #3 ("`row.getIsExpanded()` / `row.getIsSelected()` in custom cells"):

- **Lead with the recommended path:** import `TreeExpandableCell` from `@gravity-ui/table` and use it in the cell render fn. Show a code example.
- **Add a sub-section "Building your own analogue":** if a consumer needs custom chevron styling that `TreeExpandableCell` doesn't expose, they can roll their own using `useIsExpanded(row)`. Show the pattern: imports, hook usage, why `row.getIsExpanded()` directly would not work under memo.
- Update the worked example at the bottom (arcadia QuotasTable3) to show `TreeExpandableCell` from the library, not a local component or `useIsExpanded` directly.

No code files change in the library.

## Consumer — what changes (arcadia QuotasTable3)

### Already applied (not in scope for this spec)

- `rowAttributes` lifted to module scope (Phase C1 from prior spec)
- `useSetExpandedFromContext` bridge (Phase C2b from prior spec)
- `useCurrencyVisibilityContext` returns memoized value (C4 prereq fix)

### To apply

#### CC1. Delete local `TreeExpandableCell.tsx` and use the library's

Path: `src/ui/units/quotas/pages/QuotasPage/containers/QuotasTable/QuotasTable3/components/TreeExpandableCell/TreeExpandableCell.tsx`

Action: delete the file (and the enclosing `TreeExpandableCell/` directory if it has no other files).

Update every importer in QuotasTable3 to import from `@gravity-ui/table` instead. Likely call sites: column definitions inside `useColumns.tsx` or related `getXxxColumn` helpers under `utils/columns/`. Search for `TreeExpandableCell` in the QuotasTable3 directory and its descendants:

```bash
grep -rn "TreeExpandableCell" src/ui/units/quotas/pages/QuotasPage/containers/QuotasTable/QuotasTable3/
```

For each importer, replace:

```tsx
import {TreeExpandableCell} from '../../components/TreeExpandableCell/TreeExpandableCell';
// or whatever the local relative path is
```

with:

```tsx
import {TreeExpandableCell} from '@gravity-ui/table';
```

The component's prop shape is the same (`{row, children}`), so call sites do not change.

**Visual diff caveat:** the local component used `<Flex alignItems="center">` while the library's uses `<Flex>` (defaults). Per design decision, the library is canonical. If the visual difference is unacceptable, file a separate ticket for adding props to the library component; do not fork a local copy.

The local component's BEM block was `'styled-table'` (yielding classes like `gt-styled-table__expanding-control`); the library uses its own block (yielding `gt-tree-expandable-cell` or similar — verify in `Table.classname`). Any consumer-side CSS targeting the old class names must either be removed or migrated to the new class names. Audit the `QuotasTable3.scss` file for the old class names and adjust.

#### CC2. Trim `collapsibleStateContext.tsx`

After CC1, no consumers of `useRowExpandedState`, `useToggleRowState`, `getLocalState`, `toggleState`, or `stateRef` remain in QuotasTable3 (verified via grep — they were used only by the local `TreeExpandableCell`). Remove them.

Keep:

- `state`, `setState`, `expandAll`, `collapseAll` — used by `QuotasTable3.tsx` and `QuotasPageV2.tsx`.
- `useTableExpandedState`, `useGlobalExpandCollapseActions` — wrappers.
- `useSetExpandedFromContext` — added in C2b prior fix; the bridge.

Final `CollapsibleStateContextShape`:

```ts
{
    state: Record<string, boolean>;
    setState: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    expandAll: () => void;
    collapseAll: () => void;
}
```

## Critical files

### Library — touched

- `docs/MIGRATION-experimentalMemoization.md` — rewrite anti-pattern #3 + worked example.

### Library — untouched (deliberately)

- `src/components/BaseCell/BaseCell.tsx` — no change. Auto-subscribe approach explicitly rejected.
- `src/components/BaseRow/RowStateContext.ts` — `useIsExpanded` and `useRowState` stay exported.
- `src/components/TreeExpandableCell/TreeExpandableCell.tsx` — already correct.
- `src/index.ts` — `TreeExpandableCell` and `useIsExpanded` already exported (lines 9 and 57 respectively).

### Consumer (arcadia) — touched

- `src/ui/units/quotas/pages/QuotasPage/containers/QuotasTable/QuotasTable3/components/TreeExpandableCell/TreeExpandableCell.tsx` — delete.
- Any column-definition file that imports the local `TreeExpandableCell` (find via grep) — switch to library import.
- `src/ui/units/quotas/pages/QuotasPage/containers/QuotasTable/QuotasTable3/QuotasTable3.scss` — remove or migrate CSS targeting the old `gt-styled-table__expanding-control` class.
- `src/ui/units/quotas/pages/QuotasPage/containers/QuotasTable/QuotasTable3/collapsibleStateContext.tsx` — trim unused exports.

## Tests

### Library

No new code → no new tests. The migration-doc change is text-only.

### Consumer

No new tests. The change is mechanical; behavior is verified manually:

1. Open QuotasTable3 in dev build with React DevTools Profiler.
2. Toggle a provider's expansion. Expected commit footprint: toggled row + newly visible children.
3. Console: zero `[gravity-ui/table] experimentalMemoization is enabled but ...` warnings.
4. Smoke: expand-all / collapse-all on `QuotasPageV2` work.
5. Smoke: chevron icon flips correctly on the toggled row.
6. Smoke: visual styling of the chevron is acceptable (per the canonical-library decision).

## Verification

### Library

1. `npm run typecheck` — clean (no code changes, but run anyway).
2. `npm test` — all existing tests pass.
3. `npx prettier --check docs/MIGRATION-experimentalMemoization.md` — clean format after the rewrite.

### Consumer

As listed under "Tests → Consumer" above.

## Rollout

1. **Library PR** — single commit: migration-doc rewrite. No code changes.
2. **Arcadia PR** — Phase CC1 + CC2 (delete local component, switch imports, trim dead code, audit CSS).

## Risks

- **CSS class-name change breaks chevron styling.** The local component used `'styled-table'` BEM block; the library uses its own. Mitigation: explicit audit of `QuotasTable3.scss` during CC1, with visual smoke test in step 5 above.
- **`<Flex alignItems="center">` vs `<Flex>` causes vertical-alignment regression.** Decision recorded: library is canonical. If a regression appears, file a follow-up to add `alignItems` (or a `flexProps` pass-through) to the library component. Do not fork a local copy.
- **`useIsExpanded` discoverability.** Consumers building a custom analogue may not find the hook. Mitigation: the migration doc's "Building your own analogue" section is explicit, with a code example and a link from anti-pattern #3.

## Out of scope

- Auto-subscribing `BaseCell` to `RowStateContext`. Explicitly rejected — over-renders cells that don't read row state.
- Per-column `rowStateDeps` declaration. Explicitly rejected — adds API surface for marginal gain.
- Adding `alignItems` / Flex pass-through props to library `TreeExpandableCell`. Out of scope unless a real consumer hits the wall.
- Other consumer tables (`ConfiscationResultsTable`, `FreeQuotaPage` tree). Same patterns likely apply; separate work.
- `BaseDraggableRow.memo` — already wired and not in QuotasTable3's render path.

## Comparison with the rejected auto-subscribe spec

| Concern                       | Rejected (auto-subscribe)         | This spec (smart component)                                                                           |
| ----------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Library code change           | 1 line (`useContext` in BaseCell) | None                                                                                                  |
| Re-render footprint on toggle | All cells of toggled row          | Only cells that subscribe via `useIsExpanded` (today: just the chevron cell via `TreeExpandableCell`) |
| Consumer hook import          | None                              | None (uses `TreeExpandableCell` component instead)                                                    |
| Custom row-state UI           | Plain `row.getIsExpanded()` works | Use `useIsExpanded(row)`                                                                              |
| API surface added             | None                              | None                                                                                                  |
| Migration friction            | Same                              | Same — both demand consumer change                                                                    |

The smart-component approach achieves the same consumer ergonomics (zero hook imports in chevron cells) without the over-render cost.
