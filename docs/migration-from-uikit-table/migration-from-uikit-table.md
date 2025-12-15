# Migration Guide: From Table (@gravity-ui/uikit) to Table (@gravity-ui/table)

## Table of Contents

1. [Introduction](#introduction)
2. [When to Migrate](#when-to-migrate)
3. [Installation and Setup](#installation-and-setup)
4. [Basic Migration](#basic-migration)
   - [Simplest Example](#simplest-example)
5. [Props Migration](#props-migration)
   - [1. `columns` — Column Definition](#1-columns--column-definition)
   - [2. `verticalAlign` — Vertical Alignment](#2-verticalalign--vertical-alignment)
   - [3. `wordWrap` — Text Wrapping](#3-wordwrap--text-wrapping)
   - [4. `onRowClick` — Row Click](#4-onrowclick--row-click)
   - [5. `edgePadding` — Edge Padding](#5-edgepadding--edge-padding)
   - [6. `getRowDescriptor` — Row Descriptor with Additional Properties](#6-getrowdescriptor--row-descriptor-with-additional-properties)
6. [HOC Migration](#hoc-migration)
   - [1. `withTableSorting` — Sorting](#1-withtablesorting--sorting)
   - [2. `withTableSelection` — Row Selection](#2-withtableselection--row-selection)
   - [3. `withTableActions` — Row Actions](#3-withtableactions--row-actions)

- [4. `withTableSettings` — Column Settings](#4-withtablesettings--column-settings)
- [4.1. `TableColumnSetup` — Column Setup Component](#41-tablecolumnsetup--column-setup-component)
- [5. `withTableCopy` — Data Copying](#5-withtablecopy--data-copying)

7. [New Features](#new-features)
   - [1. 🌳 Tree Table](#1--tree-table)
   - [2. 📌 Column Pinning](#2--column-pinning)
   - [3. 📏 Column Resizing](#3--column-resizing)
   - [4. 🎭 Virtualization](#4--virtualization)
   - [4.1. 🪟 Window Virtualization](#41--window-virtualization)
   - [4.2. 🔄 Row Reordering](#42--row-reordering)
   - [4.3. 🔄 Reordering with Virtualization](#43--reordering-with-virtualization)
   - [5. 🔄 Grouping](#5--grouping)
   - [6. 🔍 Global Search and Filters](#6--global-search-and-filters)
   - [7. 📄 Expandable Rows](#7--expandable-rows)
   - [8. 📌 Sticky Header](#8--sticky-header)
   - [9. 📏 Table Size](#9--table-size)
   - [10. 🔗 Row Links](#10--row-links)
   - [11. 📭 Empty Content](#11--empty-content)
   - [12. 📋 Header Groups](#12--header-groups)
   - [12.1. 📋 Table Without Header](#121--table-without-header)
   - [13. 🌳 Virtualized Tree](#13--virtualized-tree)
   - [13.1. 📊 Table Footer](#131--table-footer)
   - [13.1.1. Sticky Footer](#1311-sticky-footer)
   - [14. 📐 Column Auto Sizing](#14--column-auto-sizing)
   - [14.1. With Predefined Widths](#141-with-predefined-widths)
   - [14.2. With Custom Width Limits](#142-with-custom-width-limits)
   - [14.3. Optimization for Large Datasets](#143-optimization-for-large-datasets)
   - [14.4. With Custom Renderer for Measurement](#144-with-custom-renderer-for-measurement)
   - [15. 🎨 Custom Row and Cell Styles](#15--custom-row-and-cell-styles)
8. [Practical Examples](#practical-examples)
   - [Example 1: Complex Table with Multiple Features](#example-1-complex-table-with-multiple-features)
   - [Example 2: Tree Table with File System](#example-2-tree-table-with-file-system)
   - [Example 3: Table with Virtualization and Infinite Scroll](#example-3-table-with-virtualization-and-infinite-scroll)
9. [Migration Checklist](#migration-checklist)
10. [Known Issues and Compatibility](#known-issues-and-compatibility)
    - [React 19 + React Compiler Compatibility](#react-19--react-compiler-compatibility)
11. [Conclusion](#conclusion)

---

## Introduction

`@gravity-ui/table` is a modern solution for working with complex tabular data, built on top of the powerful **TanStack Table v8** library (formerly React Table).

> **Note:** All examples in this guide use `@gravity-ui/uikit` version **7.0.0**. All properties and APIs shown in the "Before" examples are verified for this version. If you encounter any issues, please refer to the [official uikit documentation](https://gravity-ui.com/components/uikit/table).

### Key Advantages of the New Table

**🚀 Performance:**

- Row virtualization for handling tens of thousands of records
- Optimized rendering of only visible elements
- Minimal re-renders thanks to intelligent memoization

**🎯 Extended Functionality:**

- Nested rows (Tree Table) with unlimited nesting depth
- Data grouping by multiple columns
- Column pinning (left and right)
- Column resizing
- Drag-and-drop column reordering
- Expandable rows
- Multi-column sorting
- Advanced filters with multiple conditions

**💪 Flexibility:**

- Full control over table state
- Headless architecture for customization
- TypeScript out of the box with complete typing
- Functionality composition through plugins

---

## When to Migrate

### ✅ Migrate if you need:

- **Large data volumes** (>1000 rows) — virtualization ensures smooth scrolling
- **Hierarchical data** — built-in support for tree structures
- **Complex sorting and filtering** — multi-column sorting, custom filters
- **Interactivity** — resizing, reordering, pinning columns
- **Data grouping** — visual grouping by fields
- **Expandable rows** — additional content within rows
- **Server-side pagination/sorting** — full control over state
- **Customization** — unique design and behavior

### ⚠️ Stay with the old table if:

- Simple data display without interactivity
- Small number of rows (<100)
- No performance requirements
- Extended functionality not needed
- Limited resources for refactoring

---

## Installation and Setup

### Package Installation

```bash
npm install @gravity-ui/table
# or
yarn add @gravity-ui/table
# or
pnpm add @gravity-ui/table
```

### Imports

```typescript jsx
// Old approach
import {Table} from '@gravity-ui/uikit';

// New approach
import {Table} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table/tanstack';
```

---

## Basic Migration

### Simplest Example

#### ❌ Before (@gravity-ui/uikit)

```typescript jsx
import {Table} from '@gravity-ui/uikit';

type User = {
  id: string;
  name: string;
  email: string;
}

const columns = [
  {id: 'name', name: 'Name'},
  {id: 'email', name: 'Email'},
];

const data: User[] = [
  {id: '1', name: 'John Doe', email: 'john@example.com'},
  {id: '2', name: 'Jane Smith', email: 'jane@example.com'},
];

function MyTable() {
  return (
    <Table
      columns={columns}
      data={data}
      getRowDescriptor={(item) => ({id: item.id})}
    />
  );
}
```

#### ✅ After (@gravity-ui/table)

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table/tanstack';

type User = {
  id: string;
  name: string;
  email: string;
}

const columns: ColumnDef<User>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
  },
];

const data: User[] = [
  {id: '1', name: 'John Doe', email: 'john@example.com'},
  {id: '2', name: 'Jane Smith', email: 'jane@example.com'},
];

function MyTable() {
  const table = useTable({
    data,
    columns,
    getRowId: (row) => row.id,
  });

  return (
    <Table table={table} />
  );
}
```

### Key Differences

| Aspect                | @gravity-ui/uikit     | @gravity-ui/table             |
| --------------------- | --------------------- | ----------------------------- |
| **Column Definition** | `{id, name}`          | `ColumnDef<T>` with typing    |
| **Header**            | `name`                | `header`                      |
| **Data Access**       | By `id` automatically | `accessorKey` or `accessorFn` |
| **Typing**            | Partial               | Full through generics         |
| **API**               | Custom                | TanStack Table                |

---

## Props Migration

### Props Mapping Table

| @gravity-ui/uikit  | @gravity-ui/table           | Comment                            |
| ------------------ | --------------------------- | ---------------------------------- |
| `data`             | `data`                      | ✅ Identical                       |
| `columns`          | `columns`                   | ⚠️ Different structure (see below) |
| `getRowDescriptor` | `getRowId` + `rowClassName` | ⚠️ Different signature (see below) |
| `verticalAlign`    | -                           | ⚠️ Configured via CSS              |
| `wordWrap`         | -                           | ⚠️ Configured via column CSS       |
| `className`        | `className`                 | ✅ Identical                       |
| `edgePadding`      | -                           | ⚠️ Configured via CSS              |
| `onRowClick`       | `onRowClick`                | ⚠️ Different signature             |

### Detailed Props Migration

#### 1. `columns` — Column Definition

##### ❌ Before

```typescript jsx
import React from 'react';
import {Table} from '@gravity-ui/uikit';

type User = {
  id: string;
  name: string;
  age: number;
}

const columns = [
  {
    id: 'name',
    name: 'User Name',
    template: (item) => <strong>{item.name}</strong>,
    width: 200,
    align: 'left',
  },
  {
    id: 'age',
    name: 'Age',
    width: 100,
  },
];

const data: User[] = [
  {id: '1', name: 'John Doe', age: 30},
  {id: '2', name: 'Jane Smith', age: 25},
];

function MyTable() {
  return (
    <Table
      data={data}
      columns={columns}
      getRowDescriptor={(item) => ({id: item.id})}
    />
  );
}
```

##### ✅ After

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table/tanstack';

type User = {
    id: string;
    name: string;
    email: string;
}

const columns: ColumnDef<User>[] = [
  {
    id: 'name',
    header: 'User Name',
    accessorKey: 'name',
    cell: (info) => <strong>{info.getValue()}</strong>,
    size: 200,
    minSize: 100,
    maxSize: 400,
    meta: {
      align: 'left', // Used in custom cells
    },
  },
  {
    id: 'age',
    header: 'Age',
    accessorKey: 'age',
    size: 100,
  },
];

const data: User[] = [
  {id: '1', name: 'John Doe', age: 30},
  {id: '2', name: 'Jane Smith', age: 25},
];

function MyTable() {
  const table = useTable({
    data,
    columns,
    getRowId: (row) => row.id,
  });

  return <Table table={table} />;
}
```

**Column Property Mapping:**

| Old Property | New Property    | Description          |
| ------------ | --------------- | -------------------- |
| `name`       | `header`        | Column header        |
| `template`   | `cell`          | Cell render function |
| `width`      | `size`          | Column size (px)     |
| -            | `minSize`       | Minimum size         |
| -            | `maxSize`       | Maximum size         |
| `align`      | -               | Styled manually      |
| `sortable`   | `enableSorting` | Sortability          |
| `primary`    | -               | Styled manually      |

#### 2. `verticalAlign` — Vertical Alignment

##### ❌ Before

```typescript jsx
import React from 'react';
import {Table} from '@gravity-ui/uikit';

type User = {
  id: string;
  name: string;
  email: string;
}

const columns = [
  {id: 'name', name: 'Name'},
  {id: 'email', name: 'Email'},
];

const data: User[] = [
  {id: '1', name: 'John Doe', email: 'john@example.com'},
  {id: '2', name: 'Jane Smith', email: 'jane@example.com'},
];

function MyTable() {
  return (
    <Table
      verticalAlign="top"
      data={data}
      columns={columns}
      getRowDescriptor={(item) => ({id: item.id})}
    />
  );
}
```

##### ✅ After

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table/tanstack';

type User = {
  id: string;
  name: string;
  email: string;
}

const columns: ColumnDef<User>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
  },
];

const data: User[] = [
  {id: '1', name: 'John Doe', email: 'john@example.com'},
  {id: '2', name: 'Jane Smith', email: 'jane@example.com'},
];

function MyTable() {
    const table = useTable({
        data,
        columns,
        getRowId: (row) => row.id,
    });

    return (
        <Table table={table} cellClassName="my-table-cell" />
    );
}
```

```scss
// In SCSS
.my-table-cell {
  vertical-align: top;
}
```

#### 3. `wordWrap` — Text Wrapping

##### ❌ Before

```typescript jsx
import React from 'react';
import {Table} from '@gravity-ui/uikit';

type Article = {
  id: string;
  title: string;
  description: string;
}

const columns = [
  {id: 'title', name: 'Title', width: 200},
  {id: 'description', name: 'Description', width: 300},
];

const data: Article[] = [
  {
    id: '1',
    title: 'SupercalifragilisticexpialidociousArticleTitle',
    description: 'Thisisaverylongwordthatneedstobewrappedproperlyinthecell',
  },
  {
    id: '2',
    title: 'AntidisestablishmentarianismTitleExample',
    description: 'Anothersuperlongwordwithoutspacestodemonstratewordwrapping',
  },
];

function MyTable() {
  return (
    <Table
      wordWrap={true}
      data={data}
      columns={columns}
      getRowDescriptor={(item) => ({id: item.id})}
    />
  );
}
```

##### ✅ After

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table/tanstack';

type Article = {
  id: string;
  title: string;
  description: string;
}

// Or via CSS class
const columns: ColumnDef<Article>[] = [
  {
    id: 'title',
    header: 'Title',
    accessorKey: 'title',
    maxSize: 200,
  },
  {
    id: 'description',
    header: 'Description',
    accessorKey: 'description',
    maxSize: 300,
  },
];

const data: Article[] = [
  {
    id: '1',
    title: 'SupercalifragilisticexpialidociousArticleTitle',
    description: 'Thisisaverylongwordthatneedstobewrappedproperlyinthecell',
  },
  {
    id: '2',
    title: 'AntidisestablishmentarianismTitleExample',
    description: 'Anothersuperlongwordwithoutspacestodemonstratewordwrapping',
  },
];

function MyTable() {
  const table = useTable({
    data,
    columns,
    getRowId: (row) => row.id,
  });

  return <Table table={table} cellClassName="my-table-cell" />;
}
```

```scss
// SCSS
.my-table-cell {
  word-wrap: break-word;
  white-space: normal;
}
```

#### 4. `onRowClick` — Row Click

##### ❌ Before

```typescript jsx
import React from 'react';
import {Table} from '@gravity-ui/uikit';

type User = {
  id: string;
  name: string;
  email: string;
}

const columns = [
  {id: 'name', name: 'Name'},
  {id: 'email', name: 'Email'},
];

const data: User[] = [
  {id: '1', name: 'John Doe', email: 'john@example.com'},
  {id: '2', name: 'Jane Smith', email: 'jane@example.com'},
];

function MyTable() {
  return (
    <Table
      data={data}
      columns={columns}
      getRowDescriptor={(item) => ({id: item.id})}
      onRowClick={(item, index, event) => {
        console.log('Clicked:', item);
      }}
    />
  );
}
```

##### ✅ After

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table/tanstack';

type User = {
  id: string;
  name: string;
  email: string;
}

const columns: ColumnDef<User>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
  },
];

const data: User[] = [
  {id: '1', name: 'John Doe', email: 'john@example.com'},
  {id: '2', name: 'Jane Smith', email: 'jane@example.com'},
];

function MyTable() {
    const table = useTable({
        data,
        columns,
        getRowId: (row) => row.id,
    });

    return (
        <Table
            table={table}
            onRowClick={(row, event) => {
                console.log('Clicked:', row.original);
            }}
        />
    );
}
```

#### 5. `edgePadding` — Edge Padding

##### ❌ Before

```typescript jsx
import React from 'react';
import {Table} from '@gravity-ui/uikit';

type User = {
  id: string;
  name: string;
  email: string;
}

const columns = [
  {id: 'name', name: 'Name'},
  {id: 'email', name: 'Email'},
];

const data: User[] = [
  {id: '1', name: 'John Doe', email: 'john@example.com'},
  {id: '2', name: 'Jane Smith', email: 'jane@example.com'},
];

function MyTable() {
  return (
    <Table
      edgePadding={true}
      data={data}
      columns={columns}
      getRowDescriptor={(item) => ({id: item.id})}
    />
  );
}
```

##### ✅ After

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table/tanstack';

type User = {
  id: string;
  name: string;
  email: string;
}

const columns: ColumnDef<User>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
  },
];

const data: User[] = [
  {id: '1', name: 'John Doe', email: 'john@example.com'},
  {id: '2', name: 'Jane Smith', email: 'jane@example.com'},
];

function MyTable() {
    const table = useTable({
        data,
        columns,
        getRowId: (row) => row.id,
    });

    return (
        <Table table={table} className="table-with-padding" />
    );
}
```

```scss
// SCSS
.table-with-padding {
  td:first-child,
  th:first-child {
    padding-inline-start: var(--g-spacing-3);
  }

  td:last-child,
  th:last-child {
    padding-inline-end: var(--g-spacing-3);
  }
}
```

#### 6. `getRowDescriptor` — Row Descriptor with Additional Properties

In `@gravity-ui/uikit`, `getRowDescriptor` returns an object that can contain not only `id`, but also additional properties like `className` for styling individual rows.

##### ❌ Before

```typescript jsx
import React from 'react';
import {Table} from '@gravity-ui/uikit';

type User = {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
}

const columns = [
  {id: 'name', name: 'Name'},
  {id: 'email', name: 'Email'},
];

const data: User[] = [
  {id: '1', name: 'John Doe', email: 'john@example.com', status: 'active'},
  {id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'inactive'},
];

function MyTable() {
  return (
    <Table
      columns={columns}
      data={data}
      getRowDescriptor={(item) => ({
        id: item.id,
        className: item.status === 'inactive' ? 'row-inactive' : undefined,
      })}
    />
  );
}
```

##### ✅ After

In `@gravity-ui/table`, use the `rowClassName` prop on the `Table` component. It accepts either a string or a function that receives the row and returns a className.

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';
import type {ColumnDef, Row} from '@gravity-ui/table/tanstack';

type User = {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
}

const columns: ColumnDef<User>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
  },
];

const data: User[] = [
  {id: '1', name: 'John Doe', email: 'john@example.com', status: 'active'},
  {id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'inactive'},
];

function MyTable() {
  const table = useTable({
    data,
    columns,
    getRowId: (row) => row.id,
  });

  return (
    <Table
      table={table}
      rowClassName={(row: Row<User>) =>
        row.original.status === 'inactive' ? 'row-inactive' : undefined
      }
    />
  );
}
```

**Key differences:**

- `getRowDescriptor` returns an object with `id` and optional properties like `className`
- `rowClassName` is a prop on `Table` component, not part of the row descriptor
- `rowClassName` receives the TanStack `Row` object, so you access data via `row.original`
- `rowClassName` can be a string (applied to all rows) or a function `(row: Row<TData>) => string | undefined`

---

## HOC Migration

In the old table, functionality was extended through Higher-Order Components (HOCs). The new table uses a more modern approach: **built-in TanStack Table capabilities + hooks + composition**.

### 1. `withTableSorting` — Sorting

#### ❌ Before

```typescript jsx
import React from 'react';
import {Table, withTableSorting} from '@gravity-ui/uikit';
import type {WithTableSortingProps} from '@gravity-ui/uikit';

type User = {
    id: string;
    name: string;
    email: string;
    status?: string;
};

const columns = [
    {id: 'name', name: 'Name', meta: {sort: true}},
    {id: 'email', name: 'Email', meta: {sort: true}},
    {id: 'status', name: 'Status', meta: {sort: false}},
];

const data: User[] = [
    {id: '1', name: 'John Doe', email: 'john@example.com', status: 'active'},
    {id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'inactive'},
];

const TableWithSorting = withTableSorting(Table);

function MyTable() {
  const [sortState, setSortState] = React.useState<WithTableSortingProps['sortState']>([
    {column: 'name', order: 'asc'}
  ]);

  return (
    <TableWithSorting
      data={data}
      columns={columns}
      sortState={sortState}
      onSortStateChange={setSortState}
      disableDataSorting={false}
    />
  );
}
```

#### ✅ After

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';
import type {ColumnDef, SortingState} from '@gravity-ui/table/tanstack';

type User = {
  id: string;
  name: string;
  email: string;
  status?: string;
}

const data: User[] = [
  {id: '1', name: 'John Doe', email: 'john@example.com', status: 'active'},
  {id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'inactive'},
];

const sortingColumns: ColumnDef<User>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    enableSorting: true, // Enable sorting
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
    enableSorting: true,
  },
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
    enableSorting: false, // Disable sorting
  },
];

function MyTable() {
  const [sorting, setSorting] = React.useState<SortingState>([
    {id: 'name', desc: false}
  ]);

  const table = useTable({
    data,
    columns: sortingColumns,
    enableSorting: true, // Global sorting enable
    manualSorting: false, // false = client-side, true = server-side
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getRowId: (row) => row.id,
  });

  return (
    <Table table={table} />
  );
}
```

**🎉 New Sorting Capabilities:**

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';
import type {ColumnDef, SortingState} from '@gravity-ui/table/tanstack';

type Employee = {
  id: string;
  name: string;
  department: string;
  email: string;
}

const employeeColumns: ColumnDef<Employee>[] = [
  {
    id: 'department',
    header: 'Department',
    accessorKey: 'department',
    enableSorting: true,
  },
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    enableSorting: true,
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
    enableSorting: true,
  },
];

const employeeData: Employee[] = [
  {id: '1', name: 'John Doe', department: 'Engineering', email: 'john@example.com'},
  {id: '2', name: 'Jane Smith', department: 'Marketing', email: 'jane@example.com'},
  {id: '3', name: 'Bob Johnson', department: 'Engineering', email: 'bob@example.com'},
];

// Multi-column sorting
function AdvancedSorting() {
  const [sorting, setSorting] = React.useState<SortingState>([
    {id: 'department', desc: false},
    {id: 'name', desc: false},
  ]);

  const table = useTable({
    data: employeeData,
    columns: employeeColumns,
    enableSorting: true,
    enableMultiSort: true, // Multi-sort via Shift+Click
    maxMultiSortColCount: 3, // Maximum 3 columns
    state: {sorting},
    onSortingChange: setSorting,
    getRowId: (row) => row.id,
  });

  return (
    <Table table={table} />
  );
}

// Custom sorting function
type User = {
  id: string;
  name: string;
  email: string;
}

const customSortColumns: ColumnDef<User>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    sortingFn: (rowA, rowB) => {
      // Custom sorting logic
      const a = rowA.original.name.toLowerCase();
      const b = rowB.original.name.toLowerCase();
      return a.localeCompare(b);
    },
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
  },
];

const customSortData: User[] = [
  {id: '1', name: 'John Doe', email: 'john@example.com'},
  {id: '2', name: 'Jane Smith', email: 'jane@example.com'},
];

function CustomSorting() {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useTable({
    data: customSortData,
    columns: customSortColumns,
    enableSorting: true,
    state: {sorting},
    onSortingChange: setSorting,
    getRowId: (row) => row.id,
  });

  return <Table table={table} />;
}

// Server-side sorting
const serverSortColumns: ColumnDef<User>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    enableSorting: true,
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
    enableSorting: true,
  },
];

function ServerSideSorting() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [data, setData] = React.useState<User[]>([]);

  React.useEffect(() => {
    // Server request with sorting parameters
    const fetchData = async (params: {sortBy?: string; sortOrder?: string}) => {
      const response = await fetch(`/api/users?sortBy=${params.sortBy}&sortOrder=${params.sortOrder}`);
      return response.json();
    };

    fetchData({
      sortBy: sorting[0]?.id,
      sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
    }).then(setData);
  }, [sorting]);

  const table = useTable({
    data,
    columns: serverSortColumns,
    enableSorting: true,
    manualSorting: true, // Server-side sorting
    state: {sorting},
    onSortingChange: setSorting,
    getRowId: (row) => row.id,
  });

  return (
    <Table table={table} />
  );
}
```

---

### 2. `withTableSelection` — Row Selection

#### ❌ Before

```typescript jsx
import React from 'react';
import {Table, withTableSelection} from '@gravity-ui/uikit';

type User = {
  id: string;
  name: string;
  email: string;
}

const columns = [
  {id: 'name', name: 'Name'},
  {id: 'email', name: 'Email'},
];

const data: User[] = [
  {id: '1', name: 'John Doe', email: 'john@example.com'},
  {id: '2', name: 'Jane Smith', email: 'jane@example.com'},
];

const TableWithSelection = withTableSelection(Table);

function MyTable() {
    const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

    return (
        <>
            <div>Selected: {selectedIds.length}</div>
            <TableWithSelection
                data={data}
                columns={columns}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
            />
        </>
    );
}
```

#### ✅ After

```typescript jsx
import React from 'react';
import {Table, selectionColumn, useTable} from '@gravity-ui/table';
import type {ColumnDef, RowSelectionState} from '@gravity-ui/table/tanstack';

type User = {
  id: string;
  name: string;
  email: string;
  status?: string;
}

const data: User[] = [
  {id: '1', name: 'John Doe', email: 'john@example.com'},
  {id: '2', name: 'Jane Smith', email: 'jane@example.com'},
];

const selectionColumns: ColumnDef<User>[] = [
    selectionColumn as ColumnDef<User>,
    {
        id: 'name',
        header: 'Name',
        accessorKey: 'name',
    },
    {
        id: 'email',
        header: 'Email',
        accessorKey: 'email',
    },
];

function MyTable() {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const table = useTable({
    data,
    columns: selectionColumns,
    enableMultiRowSelection: true, // Global enable
    enableRowSelection: true, // Global enable
    // enableRowSelection: (row) => row.original.selectable, // Conditional enable
    state: {
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row.id,
  });

  return (
    <>
      <div>
        Selected: {Object.keys(rowSelection).filter(key => rowSelection[key]).length}
      </div>
      <Table table={table} />
    </>
  );
}
```

**🎉 New Selection Capabilities:**

```typescript jsx
import React from 'react';
import {Table, selectionColumn, useTable} from '@gravity-ui/table';
import type {ColumnDef, RowSelectionState, ExpandedState} from '@gravity-ui/table/tanstack';

type User = {
  id: string;
  name: string;
  email: string;
  status?: 'active' | 'inactive';
}

const selectionData: User[] = [
  {id: '1', name: 'John Doe', email: 'john@example.com', status: 'active'},
  {id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'inactive'},
  {id: '3', name: 'Bob Johnson', email: 'bob@example.com', status: 'active'},
];

const conditionalSelectionColumns: ColumnDef<User>[] = [
  selectionColumn as ColumnDef<User>,
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
  },
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
  },
];

// Conditional row selection
function ConditionalSelection() {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const table = useTable({
    data: selectionData,
    columns: conditionalSelectionColumns,
    enableRowSelection: (row) => {
      // Can only select active users
      return row.original.status === 'active';
    },
    state: {rowSelection},
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row.id,
  });

  return <Table table={table} />;
}

const getSingleSelectionColumns = (
  setRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>
): ColumnDef<User>[] => [
  {
    id: 'select',
    header: 'Select',
    cell: ({row}) => (
      <input
        type="radio"
        name="row-selection"
        checked={row.getIsSelected()}
        onChange={() => {
          // Reset all and select current
          setRowSelection({[row.id]: true});
        }}
      />
    ),
    size: 50,
    enableSorting: false,
    enableResizing: false,
  },
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
  },
];

// Single selection (radio mode)
function SingleSelection() {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const table = useTable({
    data: selectionData,
    columns: getSingleSelectionColumns(setRowSelection),
    enableRowSelection: true,
    enableMultiRowSelection: false, // Single selection
    state: {rowSelection},
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row.id,
  });

  return (
    <Table table={table} />
  );
}

type GroupedUser = {
  id: string;
  name: string;
  email: string;
  subRows?: GroupedUser[];
}

const groupSelectionData: GroupedUser[] = [
  {
    id: 'group-1',
    name: 'Engineering',
    email: 'engineering@example.com',
    subRows: [
      {id: '1', name: 'John Doe', email: 'john@example.com'},
      {id: '2', name: 'Jane Smith', email: 'jane@example.com'},
    ],
  },
  {
    id: 'group-2',
    name: 'Marketing',
    email: 'marketing@example.com',
    subRows: [
      {id: '3', name: 'Bob Johnson', email: 'bob@example.com'},
      {id: '4', name: 'Alice Brown', email: 'alice@example.com'},
    ],
  },
];

const groupSelectionColumns: ColumnDef<GroupedUser>[] = [
  selectionColumn as ColumnDef<GroupedUser>,
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
  },
];

// Selection with grouping (select entire group)
function GroupSelection() {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({
    'group-1': true,
    'group-2': true,
  });

  const table = useTable({
    data: groupSelectionData,
    columns: groupSelectionColumns,
    enableMultiRowSelection: true,
    enableRowSelection: true,
    enableSubRowSelection: true, // Sub-row selection
    enableExpanding: true,
    getSubRows: (row) => row.subRows,
    state: {
      rowSelection,
      expanded,
    },
    onRowSelectionChange: setRowSelection,
    onExpandedChange: setExpanded,
    getRowId: (row) => row.id,
  });

  return (
    <Table table={table} />
  );
}
```

---

### 3. `withTableActions` — Row Actions

#### ❌ Before

```typescript jsx
import React from 'react';
import {Table, withTableActions} from '@gravity-ui/uikit';

type User = {
  id: string;
  name: string;
  email: string;
}

const columns = [
  {id: 'name', name: 'Name'},
  {id: 'email', name: 'Email'},
];

const data: User[] = [
  {id: '1', name: 'John Doe', email: 'john@example.com'},
  {id: '2', name: 'Jane Smith', email: 'jane@example.com'},
];

const TableWithActions = withTableActions(Table);

function MyTable() {
  const getRowActions = (item: User) => [
    {
      text: 'Edit',
      handler: () => console.log('Edit', item),
    },
    {
      text: 'Delete',
      handler: () => console.log('Delete', item),
      theme: 'danger',
    },
  ];

  return (
    <TableWithActions
      data={data}
      columns={columns}
      getRowActions={getRowActions}
    />
  );
}
```

#### ✅ After

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';
import {DropdownMenu} from '@gravity-ui/uikit';
import type {ColumnDef} from '@gravity-ui/table/tanstack';

type User = {
  id: string;
  name: string;
  email: string;
}

const data: User[] = [
  {id: '1', name: 'John Doe', email: 'john@example.com'},
  {id: '2', name: 'Jane Smith', email: 'jane@example.com'},
];

const getActionsColumns = (
  handleEdit: (user: User) => void,
  handleDelete: (user: User) => void
): ColumnDef<User>[] => [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({row}) => {
      const user = row.original;

      return (
        <DropdownMenu
          items={[
            {
              text: 'Edit',
              action: () => handleEdit(user),
            },
            {
              text: 'Delete',
              action: () => handleDelete(user),
              theme: 'danger',
            },
          ]}
        />
      );
    },
    size: 100,
    enableSorting: false,
  },
];

function MyTable() {
    const handleEdit = (user: User) => {
        console.log('Edit', user);
    };

    const handleDelete = (user: User) => {
        console.log('Delete', user);
    };

  const columns = getActionsColumns(handleEdit, handleDelete);

  const table = useTable({
    data,
    columns,
  });

  return (
    <Table table={table} />
  );
}
```

---

### 4. `withTableSettings` — Column Settings

#### ❌ Before

```typescript jsx
import React from 'react';
import {Table, withTableSettings} from '@gravity-ui/uikit';
import type {WithTableSettingsProps} from '@gravity-ui/uikit';

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
}

const columns = [
  {id: 'name', name: 'Name'},
  {id: 'email', name: 'Email'},
  {id: 'phone', name: 'Phone'},
];

const data: User[] = [
  {id: '1', name: 'John Doe', email: 'john@example.com', phone: '+1234567890'},
  {id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '+0987654321'},
];

const TableWithSettings = withTableSettings(Table);

function MyTable() {
  const [settings, setSettings] = React.useState<WithTableSettingsProps['settings']>([
    {id: 'name', isSelected: true},
    {id: 'email', isSelected: true},
    {id: 'phone', isSelected: false},
  ]);

  return (
    <TableWithSettings
      data={data}
      columns={columns}
      settings={settings}
      updateSettings={setSettings}
    />
  );
}
```

#### ✅ After

```typescript jsx
import React from 'react';
import {Table, useTable, getSettingsColumn} from '@gravity-ui/table';
import type {ColumnDef, VisibilityState, ColumnOrderState} from '@gravity-ui/table/tanstack';

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
}

const data: User[] = [
  {id: '1', name: 'John Doe', email: 'john@example.com', phone: '+1234567890'},
  {id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '+0987654321'},
];

const settingsColumns: ColumnDef<User>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
  },
  {
    id: 'phone',
    header: 'Phone',
    accessorKey: 'phone',
    enableHiding: true, // Can be hidden
  },
  // Add settings column using helper function
  getSettingsColumn<User>(),
];

function MyTable() {
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    phone: false, // Hidden by default
  });

  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>([
    'name',
    'email',
    'phone',
  ]);

  const table = useTable({
    data,
    columns: settingsColumns,
    enableHiding: true,
    state: {
      columnVisibility,
      columnOrder,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    getRowId: (row) => row.id,
  });

  return <Table table={table} />;
}
```

---

### 4.1. `TableColumnSetup` — Column Setup Component

#### ❌ Before

```typescript jsx
import React from 'react';
import {Table, TableColumnSetup} from '@gravity-ui/uikit';

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
}

const columns = [
  {id: 'name', name: 'Name'},
  {id: 'email', name: 'Email'},
  {id: 'phone', name: 'Phone'},
];

const data: User[] = [
  {id: '1', name: 'John Doe', email: 'john@example.com', phone: '+1234567890'},
  {id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '+0987654321'},
];

function MyTable() {
  const [items, setItems] = React.useState([
    {id: 'name', title: 'Name', selected: true},
    {id: 'email', title: 'Email', selected: true},
    {id: 'phone', title: 'Phone', selected: false},
  ]);

  // Filter columns based on items
  const visibleColumns = columns.filter(col =>
    items.find(item => item.id === col.id && item.selected)
  );

  return (
    <>
      <TableColumnSetup
        items={items}
        onUpdate={(newItems) => {
          setItems(newItems);
        }}
      />
      <Table
        data={data}
        columns={visibleColumns}
        getRowDescriptor={(item) => ({id: item.id})}
      />
    </>
  );
}
```

#### ✅ After

```typescript jsx
import React from 'react';
import {Table, useTable, TableSettings} from '@gravity-ui/table';
import type {ColumnDef, VisibilityState, ColumnOrderState} from '@gravity-ui/table/tanstack';

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
}

const data: User[] = [
  {id: '1', name: 'John Doe', email: 'john@example.com', phone: '+1234567890'},
  {id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '+0987654321'},
];

function MyTable() {
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    phone: false,
  });
  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>([
    'name',
    'email',
    'phone',
  ]);

  const columns: ColumnDef<User>[] = [
    {
      id: 'name',
      header: 'Name',
      accessorKey: 'name',
    },
    {
      id: 'email',
      header: 'Email',
      accessorKey: 'email',
    },
    {
      id: 'phone',
      header: 'Phone',
      accessorKey: 'phone',
      enableHiding: true,
    },
  ];

  const table = useTable({
    data,
    columns,
    enableHiding: true,
    state: {
      columnVisibility,
      columnOrder,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
  });

  const handleSettingsApply = ({
    visibilityState,
    columnOrder,
  }: {
    visibilityState: VisibilityState;
    columnOrder: string[];
  }) => {
    setColumnVisibility(visibilityState);
    setColumnOrder(columnOrder);
    // Optionally save to localStorage or send to server
  };

  return (
    <>
      <div style={{display: 'flex', justifyContent: 'flex-start', marginBottom: '16px'}}>
        <TableSettings
          table={table}
          sortable={true}
          filterable={true}
          enableSearch={true}
          searchPlaceholder="Search columns..."
          onSettingsApply={handleSettingsApply}
        />
      </div>
      <Table table={table} />
    </>
  );
}
```

**🎉 Key Features of TableSettings:**

- **Drag & Drop Reordering**: Change column order by dragging
- **Visibility Toggle**: Show/hide columns with checkboxes
- **Search**: Find columns quickly with search
- **Nested Columns Support**: Works with header groups
- **Apply/Cancel**: Preview changes before applying

---

### 5. `withTableCopy` — Data Copying

#### ❌ Before

```typescript jsx
import React from 'react';
import {Table, withTableCopy} from '@gravity-ui/uikit';

type User = {
  id: string;
  name: string;
  email: string;
}

const columns = [
  {id: 'name', name: 'Name'},
  {id: 'email', name: 'Email', meta: {copy: true}},
];

const data: User[] = [
  {id: '1', name: 'John Doe', email: 'john@example.com'},
  {id: '2', name: 'Jane Smith', email: 'jane@example.com'},
];

const TableWithCopy = withTableCopy(Table);

function MyTable() {
  return (
    <TableWithCopy
      data={data}
      columns={columns}
      getRowDescriptor={(item) => ({id: item.id})}
    />
  );
}
```

#### ✅ After

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';
import {Button, Toaster, Flex, Icon} from '@gravity-ui/uikit';
import {Copy} from '@gravity-ui/icons';
import type {ColumnDef} from '@gravity-ui/table/tanstack';

type User = {
  id: string;
  name: string;
  email: string;
}

const data: User[] = [
  {id: '1', name: 'John Doe', email: 'john@example.com'},
  {id: '2', name: 'Jane Smith', email: 'jane@example.com'},
];

const toaster = new Toaster();

const getCopyColumns = (
  copyToClipboard: (text: string) => Promise<void>
): ColumnDef<User>[] => [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
    cell: ({getValue}) => {
      const email = getValue<string>();
      return (
        <Flex gap={2} alignItems="center">
          <span>{email}</span>
          <Button
            view="flat"
            size="xs"
            onClick={() => copyToClipboard(email)}
          >
            <Icon data={Copy} size={14} />
            </Button>
          </Flex>
        );
      },
    },
  ];

function MyTable() {
  // Copy to clipboard function
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toaster.add({
        name: 'copy-success',
        title: 'Copied!',
        theme: 'success',
      });
    } catch (error) {
      toaster.add({
        name: 'copy-error',
        title: 'Failed to copy',
        theme: 'danger',
      });
    }
  };

  const columns = getCopyColumns(copyToClipboard);

  const table = useTable({
    data,
    columns,
    getRowId: (row) => row.id,
  });

  return <Table table={table} />;
}
```

---

## New Features

### 1. 🌳 Tree Table

**One of the most powerful features of the new table!**

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table/tanstack';

type FileSystemItem = {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  subRows?: FileSystemItem[]; // Nested items
}

const data: FileSystemItem[] = [
  {
    id: '1',
    name: 'Documents',
    type: 'folder',
    subRows: [
      {
        id: '1-1',
        name: 'Work',
        type: 'folder',
        subRows: [
          {id: '1-1-1', name: 'Report.pdf', type: 'file', size: 1024},
          {id: '1-1-2', name: 'Presentation.pptx', type: 'file', size: 2048},
        ],
      },
      {id: '1-2', name: 'Personal', type: 'folder', subRows: []},
    ],
  },
  {
    id: '2',
    name: 'Downloads',
    type: 'folder',
    subRows: [
      {id: '2-1', name: 'Image.png', type: 'file', size: 512},
    ],
  },
];

const treeColumns: ColumnDef<FileSystemItem>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    cell: ({row, getValue}) => (
      <div
        style={{
          paddingLeft: `${row.depth * 20}px`,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {row.getCanExpand() ? (
          <button
            onClick={row.getToggleExpandedHandler()}
            style={{cursor: 'pointer'}}
          >
            {row.getIsExpanded() ? '📂' : '📁'}
          </button>
        ) : (
          <span>📄</span>
        )}
        {getValue()}
      </div>
    ),
  },
  {
    id: 'type',
    header: 'Type',
    accessorKey: 'type',
  },
  {
    id: 'size',
    header: 'Size',
    accessorKey: 'size',
    cell: ({getValue}) => {
      const size = getValue<number>();
      return size ? `${size} KB` : '-';
    },
  },
];

function TreeTable() {
  const [expanded, setExpanded] = React.useState({});

  const table = useTable({
    data,
    columns: treeColumns,
    getRowId: (row) => row.id,
    enableExpanding: true, // Enable row expansion
    getSubRows: (row) => row.subRows, // Get nested rows
    state: {
      expanded,
    },
    onExpandedChange: setExpanded,
    // Expand all by default
    initialState: {
      expanded: true,
    },
  });

  return (
    <Table table={table} />
  );
}
```

### 2. 📌 Column Pinning

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';
import {Button} from '@gravity-ui/uikit';
import type {ColumnDef, ColumnPinningState} from '@gravity-ui/table/tanstack';

type User = {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
}

const data: User[] = [
  {id: '1', name: 'John Doe', email: 'john@example.com', department: 'Engineering', position: 'Developer'},
  {id: '2', name: 'Jane Smith', email: 'jane@example.com', department: 'Marketing', position: 'Manager'},
  {id: '3', name: 'Bob Johnson', email: 'bob@example.com', department: 'Sales', position: 'Representative'},
];

const pinnedColumns: ColumnDef<User>[] = [
    {
      id: 'select',
      header: '☑',
      cell: ({row}) => <input type="checkbox" />,
      size: 50,
    },
    {
      id: 'name',
      header: 'Name',
      accessorKey: 'name',
      size: 200,
    },
    {
      id: 'email',
      header: 'Email',
      accessorKey: 'email',
      size: 250,
    },
    {
      id: 'department',
      header: 'Department',
      accessorKey: 'department',
      size: 150,
    },
    {
      id: 'position',
      header: 'Position',
      accessorKey: 'position',
      size: 150,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: () => <Button>Edit</Button>,
      size: 100,
    },
  ];

function PinnedColumnsTable() {
  const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>({
    left: ['select', 'name'], // Pin to left
    right: ['actions'], // Pin to right
  });

  const table = useTable({
    data,
    columns: pinnedColumns,
    enableColumnPinning: true, // Enable pinning
    state: {
      columnPinning,
    },
    onColumnPinningChange: setColumnPinning,
    getRowId: (row) => row.id,
  });

  return (
    <Table table={table} />
  );
}
```

### 3. 📏 Column Resizing

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table/tanstack';

type User = {
  id: string;
  name: string;
  email: string;
  department: string;
}

const data: User[] = [
  {id: '1', name: 'John Doe', email: 'john@example.com', department: 'Engineering'},
  {id: '2', name: 'Jane Smith', email: 'jane@example.com', department: 'Marketing'},
  {id: '3', name: 'Bob Johnson', email: 'bob@example.com', department: 'Sales'},
];

const resizableColumns: ColumnDef<User>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    size: 200,
    minSize: 100,
    maxSize: 400,
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
    size: 250,
    minSize: 150,
    maxSize: 500,
  },
  {
    id: 'department',
    header: 'Department',
    accessorKey: 'department',
    size: 150,
    minSize: 100,
    maxSize: 300,
  },
];

function ResizableTable() {
  const [columnSizing, setColumnSizing] = React.useState({});

  const table = useTable({
    data,
    columns: resizableColumns,
    enableColumnResizing: true, // Enable resizing
    columnResizeMode: 'onChange', // 'onChange' | 'onEnd'
    state: {
      columnSizing,
    },
    onColumnSizingChange: setColumnSizing,
    getRowId: (row) => row.id,
  });

  return (
    <Table table={table} />
  );
}
```

### 4. 🎭 Virtualization

**Display 100,000+ rows without lags!**

```typescript jsx
import React from 'react';
import {Table, useTable, useRowVirtualizer} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table/tanstack';

type User = {
  id: string;
  name: string;
  email: string;
}

const virtualizedColumns: ColumnDef<User>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
  },
];

function VirtualizedTable() {
  // Huge dataset
  const data = React.useMemo(
    () => Array.from({length: 100000}, (_, i) => ({
      id: `${i}`,
      name: `User ${i}`,
      email: `user${i}@example.com`,
    })),
    []
  );

  const table = useTable({
    data,
    columns: virtualizedColumns,
    getRowId: (row) => row.id,
  });

  const containerRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useRowVirtualizer({
    count: table.getRowModel().rows.length,
    estimateSize: () => 50, // Row height estimate
    overscan: 10, // Number of rows outside visible area
    getScrollElement: () => containerRef.current,
  });

  return (
    <div ref={containerRef} style={{height: '500px', overflow: 'auto'}}>
      <Table table={table} rowVirtualizer={rowVirtualizer} />
    </div>
  );
}
```

### 4.1. 🪟 Window Virtualization

**Use when you need to use the window as a scroll element**

```typescript jsx
import React from 'react';
import {Table, useTable, useWindowRowVirtualizer} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table/tanstack';

type User = {
  id: string;
  name: string;
  email: string;
}

const windowVirtualizedColumns: ColumnDef<User>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
  },
];

function WindowVirtualizedTable() {
  const data = React.useMemo(
    () => Array.from({length: 10000}, (_, i) => ({
      id: `${i}`,
      name: `User ${i}`,
      email: `user${i}@example.com`,
    })),
    []
  );

  const table = useTable({
    data,
    columns: windowVirtualizedColumns,
    getRowId: (row) => row.id,
  });

  const bodyRef = React.useRef<HTMLTableSectionElement>(null);

  const rowVirtualizer = useWindowRowVirtualizer({
    count: table.getRowModel().rows.length,
    estimateSize: () => 40,
    overscan: 5,
    scrollMargin: bodyRef.current?.offsetTop ?? 0,
  });

  return (
    <Table
      table={table}
      rowVirtualizer={rowVirtualizer}
      stickyHeader
      bodyRef={bodyRef}
    />
  );
}
```

### 4.2. 🔄 Row Reordering

**Drag-and-drop to change row order**

```typescript jsx
import React from 'react';
import {Table, useTable, ReorderingProvider, dragHandleColumn} from '@gravity-ui/table';
import type {ReorderingProviderProps} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table/tanstack';

type User = {
  id: string;
  name: string;
  email: string;
}

const initialData: User[] = [
  {id: '1', name: 'John', email: 'john@example.com'},
  {id: '2', name: 'Jane', email: 'jane@example.com'},
  {id: '3', name: 'Bob', email: 'bob@example.com'},
];

const reorderableColumns: ColumnDef<User>[] = [
  dragHandleColumn as ColumnDef<User>, // Column with drag handle
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
  },
];

function ReorderableTable() {
  const [data, setData] = React.useState<User[]>(initialData);

  const table = useTable({
    columns: reorderableColumns,
    data,
    getRowId: (row) => row.id,
  });

  const handleReorder = React.useCallback<
    NonNullable<ReorderingProviderProps<User>['onReorder']>
  >(({draggedItemKey, baseItemKey}) => {
    setData((prevData) => {
      const dataClone = [...prevData];
      const index = dataClone.findIndex((item) => item.id === draggedItemKey);

      if (index >= 0) {
        const dragged = dataClone.splice(index, 1)[0];
        const insertIndex = dataClone.findIndex((item) => item.id === baseItemKey);

        if (insertIndex >= 0) {
          dataClone.splice(insertIndex + 1, 0, dragged);
        } else {
          dataClone.unshift(dragged);
        }
      }

      return dataClone;
    });
  }, []);

  return (
    <ReorderingProvider table={table} onReorder={handleReorder}>
      <Table table={table} />
    </ReorderingProvider>
  );
}
```

### 4.3. 🔄 Reordering with Virtualization

**Reordering for large tables with virtualization**

```typescript jsx
import React from 'react';
import {Table, useTable, useWindowRowVirtualizer, ReorderingProvider, dragHandleColumn, getVirtualRowRangeExtractor} from '@gravity-ui/table';
import type {ReorderingProviderProps} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table/tanstack';

type User = {
  id: string;
  name: string;
  email: string;
}

const reorderableVirtualizedColumns: ColumnDef<User>[] = [
  dragHandleColumn as ColumnDef<User>,
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
  },
];

function ReorderableVirtualizedTable() {
  const tableRef = React.useRef<HTMLTableElement>(null);
  const [data, setData] = React.useState<User[]>(() =>
    Array.from({length: 1000}, (_, i) => ({
      id: `${i}`,
      name: `User ${i}`,
      email: `user${i}@example.com`,
    }))
  );

  const table = useTable({
    columns: reorderableVirtualizedColumns,
    data,
    getRowId: (row) => row.id,
  });

  const bodyRef = React.useRef<HTMLTableSectionElement>(null);

  const rowVirtualizer = useWindowRowVirtualizer({
    count: table.getRowModel().rows.length,
    estimateSize: () => 20,
    overscan: 5,
    rangeExtractor: getVirtualRowRangeExtractor(tableRef.current),
    scrollMargin: bodyRef.current?.offsetTop ?? 0,
  });

  const handleReorder = React.useCallback<
    NonNullable<ReorderingProviderProps<User>['onReorder']>
  >(({draggedItemKey, baseItemKey}) => {
    setData((prevData) => {
      const dataClone = [...prevData];
      const index = dataClone.findIndex((item) => item.id === draggedItemKey);

      if (index >= 0) {
        const dragged = dataClone.splice(index, 1)[0];
        const insertIndex = dataClone.findIndex((item) => item.id === baseItemKey);

        if (insertIndex >= 0) {
          dataClone.splice(insertIndex + 1, 0, dragged);
        } else {
          dataClone.unshift(dragged);
        }
      }

      return dataClone;
    });
  }, []);

  return (
    <ReorderingProvider table={table} onReorder={handleReorder}>
      <Table
        ref={tableRef}
        table={table}
        rowVirtualizer={rowVirtualizer}
        stickyHeader
        bodyRef={bodyRef}
      />
    </ReorderingProvider>
  );
}
```

### 5. 🔄 Grouping

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';
import type {ColumnDef, GroupingState} from '@gravity-ui/table/tanstack';

type User = {
  id: string;
  name: string;
  department: string;
  position: string;
}

const data: User[] = [
  {id: '1', name: 'John Doe', department: 'Engineering', position: 'Developer'},
  {id: '2', name: 'Jane Smith', department: 'Engineering', position: 'Senior Developer'},
  {id: '3', name: 'Bob Johnson', department: 'Marketing', position: 'Manager'},
  {id: '4', name: 'Alice Brown', department: 'Marketing', position: 'Specialist'},
  {id: '5', name: 'Charlie Wilson', department: 'Sales', position: 'Representative'},
];

const groupedColumns: ColumnDef<User>[] = [
    {
      id: 'department',
      header: 'Department',
      accessorKey: 'department',
      enableGrouping: true, // Allow grouping
    },
    {
      id: 'name',
      header: 'Name',
      accessorKey: 'name',
      cell: ({row, getValue}) => {
        if (row.getIsGrouped()) {
          // Render group header
          return (
            <div>
              <strong>{getValue()}</strong>
              <span> ({row.subRows.length})</span>
            </div>
          );
        }
        return getValue();
      },
    },
    {
      id: 'position',
      header: 'Position',
      accessorKey: 'position',
      aggregationFn: 'count', // Aggregation function
      cell: ({row, getValue}) => {
        if (row.getIsGrouped()) {
          return null;
        }
        return getValue();
      },
    },
  ];

function GroupedTable() {
  const [grouping, setGrouping] = React.useState<GroupingState>(['department']);

  const table = useTable({
    data,
    columns: groupedColumns,
    enableGrouping: true,
    state: {
      grouping,
    },
    onGroupingChange: setGrouping,
    getRowId: (row) => row.id,
  });

  return (
    <Table table={table} />
  );
}
```

### 6. 🔍 Global Search and Filters

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';
import type {ColumnDef, ColumnFiltersState} from '@gravity-ui/table/tanstack';

type User = {
  id: string;
  name: string;
  status: string;
  email: string;
}

const data: User[] = [
  {id: '1', name: 'John Doe', status: 'active', email: 'john@example.com'},
  {id: '2', name: 'Jane Smith', status: 'inactive', email: 'jane@example.com'},
  {id: '3', name: 'Bob Johnson', status: 'active', email: 'bob@example.com'},
  {id: '4', name: 'Alice Brown', status: 'pending', email: 'alice@example.com'},
];

// Filters in column headers
const filterableColumns: ColumnDef<User>[] = [
  {
    id: 'name',
    header: ({column}) => (
      <div>
        <span>Name</span>
        <input
          type="text"
          value={(column.getFilterValue() as string) || ''}
          onChange={(e) => column.setFilterValue(e.target.value)}
          placeholder="Filter..."
        />
      </div>
    ),
    accessorKey: 'name',
    filterFn: 'includesString', // Built-in filter function
  },
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
    filterFn: (row, columnId, filterValue) => {
      // Custom filter function
      return row.getValue(columnId) === filterValue;
    },
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
  },
];

function FilterableTable() {
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const table = useTable({
    data,
    columns: filterableColumns,
    enableGlobalFilter: true, // Global search
    enableColumnFilters: true, // Column filters
    state: {
      globalFilter,
      columnFilters,
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getRowId: (row) => row.id,
  });

  return (
    <>
      {/* Global search */}
      <input
        type="text"
        placeholder="Search all columns..."
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
      />

      <Table table={table} />
    </>
  );
}
```

### 7. 📄 Expandable Rows

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table/tanstack';

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
}

const data: User[] = [
  {id: '1', name: 'John Doe', email: 'john@example.com', phone: '+1234567890', department: 'Engineering'},
  {id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '+0987654321', department: 'Marketing'},
  {id: '3', name: 'Bob Johnson', email: 'bob@example.com', phone: '+1122334455', department: 'Sales'},
];

const expandableColumns: ColumnDef<User>[] = [
  {
    id: 'expander',
    header: '',
    cell: ({row}) => (
      row.getCanExpand() ? (
        <button onClick={row.getToggleExpandedHandler()}>
          {row.getIsExpanded() ? '▼' : '▶'}
        </button>
      ) : null
    ),
    size: 50,
  },
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
  },
  {
    id: 'department',
    header: 'Department',
    accessorKey: 'department',
  },
];

function ExpandableRowsTable() {
  const [expanded, setExpanded] = React.useState({});

  const table = useTable({
    data,
    columns: expandableColumns,
    enableExpanding: true,
    getRowCanExpand: () => true, // All rows can expand
    state: {
      expanded,
    },
    onExpandedChange: setExpanded,
    getRowId: (row) => row.id,
  });

  return (
    <Table
      table={table}
      getIsCustomRow={(row) => row.getIsExpanded() && !row.getIsGrouped()}
      renderCustomRowContent={({row, Cell}) => (
        <Cell colSpan={expandableColumns.length} style={{padding: '16px', backgroundColor: '#f5f5f5'}}>
          <h4>Details for {row.original.name}</h4>
          <p>Email: {row.original.email}</p>
          <p>Phone: {row.original.phone}</p>
          <p>Additional info goes here...</p>
        </Cell>
      )}
    />
  );
}
```

### 8. 📌 Sticky Header

**Table header remains visible when scrolling**

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table/tanstack';

type User = {
  id: string;
  name: string;
  email: string;
  department: string;
}

const data: User[] = [
  {id: '1', name: 'John Doe', email: 'john@example.com', department: 'Engineering'},
  {id: '2', name: 'Jane Smith', email: 'jane@example.com', department: 'Marketing'},
  {id: '3', name: 'Bob Johnson', email: 'bob@example.com', department: 'Sales'},
  {id: '4', name: 'Alice Brown', email: 'alice@example.com', department: 'Engineering'},
  {id: '5', name: 'Charlie Wilson', email: 'charlie@example.com', department: 'Marketing'},
];

const stickyHeaderColumns: ColumnDef<User>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
  },
  {
    id: 'department',
    header: 'Department',
    accessorKey: 'department',
  },
];

function StickyHeaderTable() {
  const table = useTable({
    data,
    columns: stickyHeaderColumns,
    getRowId: (row) => row.id,
  });

  return (
    <div style={{height: '400px', overflow: 'auto'}}>
      <Table table={table} stickyHeader />
    </div>
  );
}
```

### 9. 📏 Table Size

**Different table sizes for different contexts**

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table/tanstack';

type User = {
  id: string;
  name: string;
  email: string;
  department: string;
}

const data: User[] = [
  {id: '1', name: 'John Doe', email: 'john@example.com', department: 'Engineering'},
  {id: '2', name: 'Jane Smith', email: 'jane@example.com', department: 'Marketing'},
  {id: '3', name: 'Bob Johnson', email: 'bob@example.com', department: 'Sales'},
];

const sizedColumns: ColumnDef<User>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
  },
  {
    id: 'department',
    header: 'Department',
    accessorKey: 'department',
  },
];

function SizedTable() {
  const table = useTable({
    data,
    columns: sizedColumns,
    getRowId: (row) => row.id,
  });

  return (
    <>
      {/* Small size */}
      <Table table={table} size="s" />

      {/* Medium size (default) */}
      <Table table={table} size="m" />
    </>
  );
}
```

### 10. 🔗 Row Links

**Using links in table rows**

```typescript jsx
import React from 'react';
import {Table, useTable, ExperimentalRowLink} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table/tanstack';

type User = {
  id: string;
  name: string;
  email: string;
}

const data: User[] = [
  {id: '1', name: 'John Doe', email: 'john@example.com'},
  {id: '2', name: 'Jane Smith', email: 'jane@example.com'},
  {id: '3', name: 'Bob Johnson', email: 'bob@example.com'},
];

const rowLinkColumns: ColumnDef<User>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorFn: (item) => (
      <ExperimentalRowLink href={`/users/${item.id}`}>
        {item.name}
      </ExperimentalRowLink>
    ),
    cell: (info) => info.getValue(),
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
  },
];

function TableWithRowLinks() {
  const table = useTable({
    data,
    columns: rowLinkColumns,
    getRowId: (row) => row.id,
  });

  return <Table table={table} />;
}
```

### 11. 📭 Empty Content

**Display content when the table is empty**

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table/tanstack';

type User = {
  id: string;
  name: string;
  email: string;
}

const emptyColumns: ColumnDef<User>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
  },
];

function TableWithEmptyContent() {
  const table = useTable({
    data: [], // Empty data
    columns: emptyColumns,
    getRowId: (row) => row.id,
  });

  return (
    <Table
      table={table}
      emptyContent={<div>No data to display</div>}
    />
  );
}
```

### 12. 📋 Header Groups

**Nested column headers**

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table/tanstack';

type User = {
  id: string;
  name: string;
  email: string;
}

const data: User[] = [
  {id: '1', name: 'John Doe', email: 'john@example.com'},
  {id: '2', name: 'Jane Smith', email: 'jane@example.com'},
  {id: '3', name: 'Bob Johnson', email: 'bob@example.com'},
];

const headerGroupColumns: ColumnDef<User>[] = [
  {
    id: 'id',
    header: 'ID',
    accessorKey: 'id',
  },
  {
    id: 'personal-info',
    header: 'Personal Information',
    columns: [
      {
        id: 'name',
        header: 'Name',
        accessorKey: 'name',
      },
      {
        id: 'email',
        header: 'Email',
        accessorKey: 'email',
      },
    ],
  },
  {
    id: 'actions',
    header: 'Actions',
    columns: [
      {
        id: 'edit',
        header: 'Edit',
        accessorKey: 'id',
      },
      {
        id: 'delete',
        header: 'Delete',
        accessorKey: 'id',
      },
    ],
  },
];

function TableWithHeaderGroups() {
  const table = useTable({
    data,
    columns: headerGroupColumns,
    getRowId: (row) => row.id,
  });

  return <Table table={table} />;
}
```

### 12.1. 📋 Table Without Header

**Display table without header**

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table/tanstack';

type User = {
  id: string;
  name: string;
  email: string;
}

const data: User[] = [
  {id: '1', name: 'John Doe', email: 'john@example.com'},
  {id: '2', name: 'Jane Smith', email: 'jane@example.com'},
  {id: '3', name: 'Bob Johnson', email: 'bob@example.com'},
];

const noHeaderColumns: ColumnDef<User>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
  },
];

function TableWithoutHeader() {
  const table = useTable({
    data,
    columns: noHeaderColumns,
    getRowId: (row) => row.id,
  });

  return (
    <Table
      table={table}
      withHeader={false}
    />
  );
}
```

### 13. 🌳 Virtualized Tree

**Tree table with virtualization for large data volumes**

```typescript jsx
import React from 'react';
import {Table, useTable, useRowVirtualizer} from '@gravity-ui/table';
import type {ColumnDef, ExpandedState} from '@gravity-ui/table/tanstack';

type FileSystemItem = {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  subRows?: FileSystemItem[];
}

const data: FileSystemItem[] = [
  {
    id: '1',
    name: 'Documents',
    type: 'folder',
    subRows: [
      {
        id: '1-1',
        name: 'Work',
        type: 'folder',
        subRows: [
          {id: '1-1-1', name: 'Report.pdf', type: 'file', size: 1024},
          {id: '1-1-2', name: 'Presentation.pptx', type: 'file', size: 2048},
        ],
      },
      {id: '1-2', name: 'Personal', type: 'folder', subRows: []},
    ],
  },
  {
    id: '2',
    name: 'Downloads',
    type: 'folder',
    subRows: [
      {id: '2-1', name: 'Image.png', type: 'file', size: 512},
    ],
  },
];

const virtualizedTreeColumns: ColumnDef<FileSystemItem>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    cell: ({row, getValue}) => (
      <div
        style={{
          paddingLeft: `${row.depth * 20}px`,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {row.getCanExpand() ? (
          <button
            onClick={row.getToggleExpandedHandler()}
            style={{cursor: 'pointer'}}
          >
            {row.getIsExpanded() ? '📂' : '📁'}
          </button>
        ) : (
          <span>📄</span>
        )}
        {getValue()}
      </div>
    ),
  },
  {
    id: 'type',
    header: 'Type',
    accessorKey: 'type',
  },
  {
    id: 'size',
    header: 'Size',
    accessorKey: 'size',
    cell: ({getValue}) => {
      const size = getValue<number>();
      return size ? `${size} KB` : '-';
    },
  },
];

function VirtualizedTreeTable() {
  const [expanded, setExpanded] = React.useState<ExpandedState>({});

  const table = useTable({
    data,
    columns: virtualizedTreeColumns,
    getSubRows: (row) => row.subRows,
    enableExpanding: true,
    state: {
      expanded,
    },
    onExpandedChange: setExpanded,
    getRowId: (row) => row.id,
  });

  const containerRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useRowVirtualizer({
    count: table.getRowModel().rows.length,
    estimateSize: () => 40,
    overscan: 1,
    getScrollElement: () => containerRef.current,
  });

  return (
    <div ref={containerRef} style={{height: '90vh', overflow: 'auto'}}>
      <Table
        table={table}
        rowVirtualizer={rowVirtualizer}
        headerCellAttributes={(header) => {
          if (header.column.id === 'name') {
            return {style: {paddingInlineStart: 36}};
          }
          return {};
        }}
      />
    </div>
  );
}
```

### 13.1. 📊 Table Footer

**Add footer to table with custom content**

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table/tanstack';

type Item = {
  id: string;
  name: string;
  amount: number;
}

const data: Item[] = [
  {id: '1', name: 'Item 1', amount: 100},
  {id: '2', name: 'Item 2', amount: 200},
  {id: '3', name: 'Item 3', amount: 150},
];

const footerColumns: ColumnDef<Item>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
  },
  {
    id: 'amount',
    header: 'Amount',
    accessorKey: 'amount',
  },
];

function TableWithFooter() {
  const table = useTable({
    data,
    columns: footerColumns,
    getRowId: (row) => row.id,
  });

  return (
    <Table
      table={table}
      withFooter={true}
      renderCustomFooterContent={({footerGroups, cellClassName, rowClassName}) => (
        <tr className={rowClassName}>
          <td colSpan={footerColumns.length} className={cellClassName}>
            <div style={{display: 'flex', justifyContent: 'space-between', padding: '8px'}}>
              <span>Total: {data.length} items</span>
              <span>Sum: {data.reduce((sum, item) => sum + (item.amount || 0), 0)}</span>
            </div>
          </td>
        </tr>
      )}
      customFooterRowCount={1}
    />
  );
}
```

#### 13.1.1. Sticky Footer

**Footer remains visible when scrolling**

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table/tanstack';

type User = {
  id: string;
  name: string;
  email: string;
}

const data: User[] = [
  {id: '1', name: 'John Doe', email: 'john@example.com'},
  {id: '2', name: 'Jane Smith', email: 'jane@example.com'},
  {id: '3', name: 'Bob Johnson', email: 'bob@example.com'},
];

const stickyFooterColumns: ColumnDef<User>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
  },
];

function TableWithStickyFooter() {
  const table = useTable({
    data,
    columns: stickyFooterColumns,
    getRowId: (row) => row.id,
  });

  return (
    <div style={{height: '400px', overflow: 'auto'}}>
      <Table
        table={table}
        withFooter={true}
        stickyFooter={true}
        renderCustomFooterContent={({cellClassName, rowClassName}) => (
          <tr className={rowClassName}>
            <td colSpan={stickyFooterColumns.length} className={cellClassName}>
              Footer content
            </td>
          </tr>
        )}
      />
    </div>
  );
}
```

### 14. 📐 Column Auto Sizing

**Automatic column width calculation based on content**

```typescript jsx
import React from 'react';
import {Table, useTable, experimentalUseColumnsAutoSize} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table/tanstack';

type User = {
  id: string;
  name: string;
  email: string;
  status: string;
}

const data: User[] = [
  {id: '1', name: 'John Doe', email: 'john@example.com', status: 'active'},
  {id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'inactive'},
  {id: '3', name: 'Bob Johnson', email: 'bob@example.com', status: 'active'},
];

const autoSizeColumns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    id: 'status',
    accessorFn: (row) => row.status,
    header: 'Status',
    cell: (info) => (
      <div className={`status-badge status-${info.getValue()}`}>
        {info.getValue()}
      </div>
    ),
  },
];

function AutoSizedTable() {

  // Calculate column widths
  const {setTableInstance, columnsWithAutoSizes, isMeasuring} = experimentalUseColumnsAutoSize({
    columns: autoSizeColumns,
    options: {
      minWidth: 80,
      maxWidth: 300,
      sampleSize: 100, // Number of rows to sample
      padding: 16, // Padding for cells
      headerPadding: 24, // Padding for headers
      measureHeaderText: true, // Include header text in calculation
      respectExistingWidths: true, // Preserve predefined widths
      respectResizedWidths: true, // Preserve user-resized widths
    },
  });

  // Create table instance
  const table = useTable({
    data,
    columns: columnsWithAutoSizes,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
  });

  // Update table instance reference
  React.useEffect(() => {
    setTableInstance(table);
  }, [table, setTableInstance]);

  // Show loader while measuring
  if (isMeasuring) {
    return <div>Calculating column widths...</div>;
  }

  return <Table table={table} />;
}
```

#### 14.1. With Predefined Widths

**The hook respects columns with predefined sizes**

```typescript jsx
import React from 'react';
import {Table, useTable, experimentalUseColumnsAutoSize} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table/tanstack';

type User = {
  id: string;
  name: string;
  age: number;
  email: string;
}

const data: User[] = [
  {id: '1', name: 'John Doe', age: 30, email: 'john@example.com'},
  {id: '2', name: 'Jane Smith', age: 25, email: 'jane@example.com'},
  {id: '3', name: 'Bob Johnson', age: 35, email: 'bob@example.com'},
];

const predefinedWidthColumns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    // Auto size
  },
  {
    accessorKey: 'age',
    header: 'Age',
    size: 100, // Fixed width - will be preserved
  },
  {
    accessorKey: 'email',
    header: 'Email',
    // Auto size
  },
];

function AutoSizedTableWithPredefinedWidths() {
  const {setTableInstance, columnsWithAutoSizes, isMeasuring} = experimentalUseColumnsAutoSize({
    columns: predefinedWidthColumns,
    options: {
      respectExistingWidths: true, // Preserve predefined widths
    },
  });

  const table = useTable({
    data,
    columns: columnsWithAutoSizes,
    enableColumnResizing: true,
    getRowId: (row) => row.id,
  });

  React.useEffect(() => {
    setTableInstance(table);
  }, [table, setTableInstance]);

  if (isMeasuring) {
    return <div>Calculating...</div>;
  }

  return <Table table={table} />;
}
```

#### 14.2. With Custom Width Limits

**Configure minimum and maximum width**

```typescript jsx
import React from 'react';
import {Table, useTable, experimentalUseColumnsAutoSize} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table/tanstack';

type User = {
  id: string;
  name: string;
  email: string;
}

const data: User[] = [
  {id: '1', name: 'John Doe', email: 'john@example.com'},
  {id: '2', name: 'Jane Smith', email: 'jane@example.com'},
  {id: '3', name: 'Bob Johnson', email: 'bob@example.com'},
];

const customLimitsColumns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
];

function AutoSizedTableWithCustomLimits() {
  const {setTableInstance, columnsWithAutoSizes, isMeasuring} = experimentalUseColumnsAutoSize({
    columns: customLimitsColumns,
    options: {
      minWidth: 100, // Minimum width 100px
      maxWidth: 250, // Maximum width 250px
      padding: 24, // More padding
    },
  });

  const table = useTable({
    data,
    columns: columnsWithAutoSizes,
    enableColumnResizing: true,
    getRowId: (row) => row.id,
  });

  React.useEffect(() => {
    setTableInstance(table);
  }, [table, setTableInstance]);

  if (isMeasuring) {
    return <div>Calculating...</div>;
  }

  return <Table table={table} />;
}
```

#### 14.3. Optimization for Large Datasets

**Use smaller sample size to improve performance**

```typescript jsx
import React from 'react';
import {Table, useTable, experimentalUseColumnsAutoSize} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table/tanstack';

type User = {
  id: string;
  name: string;
  email: string;
}

// Generate large dataset
const largeDataset: User[] = Array.from({length: 10000}, (_, i) => ({
  id: String(i + 1),
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
}));

const optimizedColumns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
];

function AutoSizedTableOptimized() {
  const {setTableInstance, columnsWithAutoSizes, isMeasuring} = experimentalUseColumnsAutoSize({
    columns: optimizedColumns,
    options: {
      sampleSize: 20, // Measure only first 20 rows instead of all
      minWidth: 80,
      maxWidth: 300,
    },
  });

  const table = useTable({
    data: largeDataset,
    columns: columnsWithAutoSizes,
    getRowId: (row) => row.id,
  });

  React.useEffect(() => {
    setTableInstance(table);
  }, [table, setTableInstance]);

  if (isMeasuring) {
    return <div>Calculating column widths...</div>;
  }

  return <Table table={table} />;
}
```

#### 14.4. With Custom Renderer for Measurement

**When context providers are needed in cells**

```typescript jsx
import React from 'react';
import {Table, useTable, experimentalUseColumnsAutoSize, experimentalRenderElementForMeasure as defaultRenderElementForMeasure} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table/tanstack';
import {Provider} from 'react-redux';

type User = {
  id: string;
  name: string;
  email: string;
}

const data: User[] = [
  {id: '1', name: 'John Doe', email: 'john@example.com'},
  {id: '2', name: 'Jane Smith', email: 'jane@example.com'},
  {id: '3', name: 'Bob Johnson', email: 'bob@example.com'},
];

const customRendererColumns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
];

function AutoSizedTableWithProvider() {
  // Custom renderer with provider
  const experimentalRenderElementForMeasure = React.useCallback(
    (element?: React.ReactNode) => {
      return (
        <Provider store={store}>
          {defaultRenderElementForMeasure(element)}
        </Provider>
      );
    },
    []
  );

  const {setTableInstance, columnsWithAutoSizes, isMeasuring} = experimentalUseColumnsAutoSize({
    columns: customRendererColumns,
    experimentalRenderElementForMeasure,
    options: {
      minWidth: 80,
      maxWidth: 300,
    },
  });

  const table = useTable({
    data,
    columns: columnsWithAutoSizes,
    getRowId: (row) => row.id,
  });

  React.useEffect(() => {
    setTableInstance(table);
  }, [table, setTableInstance]);

  if (isMeasuring) {
    return <div>Calculating...</div>;
  }

  return <Table table={table} />;
}
```

### 15. 🎨 Custom Row and Cell Styles

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table/tanstack';

type User = {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  isVIP: boolean;
}

const data: User[] = [
  {id: '1', name: 'John Doe', status: 'active', isVIP: true},
  {id: '2', name: 'Jane Smith', status: 'inactive', isVIP: false},
  {id: '3', name: 'Bob Johnson', status: 'pending', isVIP: true},
];

const columns: ColumnDef<User>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
  },
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
    cell: ({getValue}) => {
      const status = getValue<string>();
      const colorMap = {
        active: 'green',
        inactive: 'gray',
        pending: 'orange',
      };

      return (
        <span
          style={{
            color: colorMap[status],
            fontWeight: 'bold',
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: `${colorMap[status]}22`,
          }}
        >
          {status.toUpperCase()}
        </span>
      );
    },
  },
];

// Conditional row styles
function StyledTable() {
  const table = useTable({
    data,
    columns,
    getRowId: (row) => row.id,
  });

  return (
    <Table
      table={table}
      rowClassName={(row) => {
        const isHighlighted = row.original.isVIP;
        return isHighlighted ? 'highlighted-row' : '';
      }}
    />
  );
}

// Or via CSS
// .highlighted-row {
//   background-color: #fff3cd;
//   font-weight: bold;
// }
```

---

## Practical Examples

### Example 1: Complex Table with Multiple Features

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';
import {Button, Flex, TextInput, Select} from '@gravity-ui/uikit';
import type {
  ColumnDef,
  SortingState,
  RowSelectionState,
  ColumnFiltersState,
  VisibilityState,
  PaginationState,
} from '@gravity-ui/table/tanstack';

type Employee = {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  salary: number;
  startDate: string;
  status: 'active' | 'inactive' | 'pending';
}

function AdvancedEmployeeTable() {
  // Table state
  const [data, setData] = React.useState<Employee[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Load data
  React.useEffect(() => {
    const fetchEmployees = async (): Promise<Employee[]> => {
      const response = await fetch('/api/employees');
      return response.json();
    };
    fetchEmployees().then(setData);
  }, []);

  // Define columns
  const columns: ColumnDef<Employee>[] = [
    {
      id: 'select',
      header: ({table}) => (
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          indeterminate={table.getIsSomeRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      ),
      cell: ({row}) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
      size: 50,
      enableSorting: false,
      enableResizing: false,
    },
    {
      id: 'name',
      header: 'Name',
      accessorKey: 'name',
      size: 200,
      enableSorting: true,
      enableResizing: true,
      cell: ({getValue}) => <strong>{getValue()}</strong>,
    },
    {
      id: 'email',
      header: 'Email',
      accessorKey: 'email',
      size: 250,
      enableSorting: true,
    },
    {
      id: 'department',
      header: ({column}) => (
        <div>
          <div>Department</div>
          <Select
            value={column.getFilterValue() as string}
            onUpdate={(value) => column.setFilterValue(value[0])}
            options={[
              {value: 'all', content: 'All'},
              {value: 'Engineering', content: 'Engineering'},
              {value: 'Sales', content: 'Sales'},
              {value: 'Marketing', content: 'Marketing'},
            ]}
          />
        </div>
      ),
      accessorKey: 'department',
      size: 150,
      enableColumnFilter: true,
    },
    {
      id: 'position',
      header: 'Position',
      accessorKey: 'position',
      size: 200,
    },
    {
      id: 'salary',
      header: 'Salary',
      accessorKey: 'salary',
      size: 120,
      cell: ({getValue}) => `$${getValue<number>().toLocaleString()}`,
      enableSorting: true,
    },
    {
      id: 'startDate',
      header: 'Start Date',
      accessorKey: 'startDate',
      size: 120,
      cell: ({getValue}) => new Date(getValue<string>()).toLocaleDateString(),
      enableSorting: true,
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      size: 100,
      cell: ({getValue}) => {
        const status = getValue<string>();
        const colors = {
          active: 'green',
          inactive: 'gray',
          pending: 'orange',
        };
        return (
          <span style={{color: colors[status]}}>
            {status.toUpperCase()}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({row}) => (
        <Flex gap={2}>
          <Button size="s" onClick={() => handleEdit(row.original)}>
            Edit
          </Button>
          <Button size="s" view="outlined-danger" onClick={() => handleDelete(row.original)}>
            Delete
          </Button>
        </Flex>
      ),
      size: 150,
      enableSorting: false,
    },
  ];

  // Action handlers
  const handleEdit = (employee: Employee) => {
    console.log('Edit:', employee);
  };

  const handleDelete = (employee: Employee) => {
    console.log('Delete:', employee);
  };

  const handleBulkDelete = () => {
    const selectedIds = Object.keys(rowSelection).filter(key => rowSelection[key]);
    console.log('Bulk delete:', selectedIds);
  };

  const handleExport = () => {
    const csv = data
      .map(emp => `${emp.name},${emp.email},${emp.department},${emp.position}`)
      .join('\n');
    // Export CSV
    const blob = new Blob([csv], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employees.csv';
    a.click();
  };

  const table = useTable({
    data,
    columns,
    // Sorting
    enableSorting: true,
    enableMultiSort: true,
    onSortingChange: setSorting,
    // Row selection
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    // Filtering
    enableColumnFilters: true,
    onColumnFiltersChange: setColumnFilters,
    // Column visibility
    enableHiding: true,
    onColumnVisibilityChange: setColumnVisibility,
    // Resizing
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    // Pagination
    onPaginationChange: setPagination,
    pageCount: Math.ceil(data.length / pagination.pageSize),
    // Row IDs
    getRowId: (row) => row.id,
    // Table state
    state: {sorting, rowSelection, columnFilters, columnVisibility, pagination},
  });

  return (
    <div>
      {/* Toolbar */}
      <Flex justifyContent="space-between" gap={2} style={{marginBottom: '16px'}}>
        <Flex gap={2}>
          <Button
            onClick={handleBulkDelete}
            disabled={Object.keys(rowSelection).length === 0}
          >
            Delete Selected ({Object.keys(rowSelection).filter(k => rowSelection[k]).length})
          </Button>
          <Button onClick={handleExport}>
            Export CSV
          </Button>
        </Flex>

        <TextInput
          placeholder="Search..."
          onUpdate={(value) => {
            // Global search
            setColumnFilters([{id: 'name', value}]);
          }}
        />
      </Flex>

      {/* Table */}
      <Table table={table} />

      {/* Pagination */}
      <Flex justifyContent="space-between" alignItems="center" style={{marginTop: '16px'}}>
        <div>
          Showing {pagination.pageIndex * pagination.pageSize + 1} to{' '}
          {Math.min((pagination.pageIndex + 1) * pagination.pageSize, data.length)} of{' '}
          {data.length} entries
        </div>
        <Flex gap={2}>
          <Button
            onClick={() => setPagination(prev => ({...prev, pageIndex: 0}))}
            disabled={pagination.pageIndex === 0}
          >
            First
          </Button>
          <Button
            onClick={() => setPagination(prev => ({...prev, pageIndex: prev.pageIndex - 1}))}
            disabled={pagination.pageIndex === 0}
          >
            Previous
          </Button>
          <Button
            onClick={() => setPagination(prev => ({...prev, pageIndex: prev.pageIndex + 1}))}
            disabled={pagination.pageIndex >= Math.ceil(data.length / pagination.pageSize) - 1}
          >
            Next
          </Button>
          <Button
            onClick={() =>
              setPagination(prev => ({
                ...prev,
                pageIndex: Math.ceil(data.length / pagination.pageSize) - 1,
              }))
            }
            disabled={pagination.pageIndex >= Math.ceil(data.length / pagination.pageSize) - 1}
          >
            Last
          </Button>
        </Flex>
      </Flex>
    </div>
  );
}
```

### Example 2: Tree Table with File System

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';
import {Button, Flex} from '@gravity-ui/uikit';
import type {ColumnDef} from '@gravity-ui/table/tanstack';

type FileNode = {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  modified: string;
  owner: string;
  subRows?: FileNode[];
}

function FileSystemTable() {
  const [expanded, setExpanded] = React.useState({});

  const columns: ColumnDef<FileNode>[] = [
    {
      id: 'name',
      header: 'Name',
      accessorKey: 'name',
      cell: ({row, getValue}) => {
        const icon = row.original.type === 'folder'
          ? (row.getIsExpanded() ? '📂' : '📁')
          : '📄';

        return (
          <div
            style={{
              paddingLeft: `${row.depth * 24}px`,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {row.getCanExpand() && (
              <button
                onClick={row.getToggleExpandedHandler()}
                style={{
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                }}
              >
                {row.getIsExpanded() ? '▼' : '▶'}
              </button>
            )}
            <span>{icon}</span>
            <span>{getValue()}</span>
          </div>
        );
      },
      size: 400,
    },
    {
      id: 'size',
      header: 'Size',
      accessorKey: 'size',
      cell: ({getValue, row}) => {
        if (row.original.type === 'folder') {
          const totalSize = calculateFolderSize(row.original);
          return totalSize ? `${formatBytes(totalSize)}` : '-';
        }
        return getValue() ? formatBytes(getValue<number>()) : '-';
      },
      size: 100,
    },
    {
      id: 'modified',
      header: 'Modified',
      accessorKey: 'modified',
      cell: ({getValue}) => new Date(getValue<string>()).toLocaleString(),
      size: 180,
    },
    {
      id: 'owner',
      header: 'Owner',
      accessorKey: 'owner',
      size: 150,
    },
    {
      id: 'actions',
      header: '',
      cell: ({row}) => (
        <Flex gap={1}>
          <Button size="s" view="flat">Download</Button>
          <Button size="s" view="flat">Share</Button>
          <Button size="s" view="flat-danger">Delete</Button>
        </Flex>
      ),
      size: 200,
    },
  ];

  const table = useTable({
    data: fileSystemData,
    columns,
    enableExpanding: true,
    getSubRows: (row) => row.subRows,
    state: {expanded},
    onExpandedChange: setExpanded,
    getRowId: (row) => row.id,
  });

  return (
    <Table table={table} />
  );
}

// Helper functions
function calculateFolderSize(folder: FileNode): number {
  let total = 0;
  if (folder.subRows) {
    for (const item of folder.subRows) {
      if (item.type === 'file' && item.size) {
        total += item.size;
      } else if (item.type === 'folder') {
        total += calculateFolderSize(item);
      }
    }
  }
  return total;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
```

### Example 3: Table with Virtualization and Infinite Scroll

```typescript jsx
import React from 'react';
import {Table, useTable, useRowVirtualizer} from '@gravity-ui/table';
import {useInfiniteQuery} from '@tanstack/react-query';

function InfiniteScrollTable() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['users'],
    queryFn: async ({pageParam = 0}) => {
      const response = await fetch(`/api/users?page=${pageParam}&limit=50`);
      return response.json();
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasMore ? pages.length : undefined;
    },
  });

  const flatData = React.useMemo(
    () => data?.pages.flatMap(page => page.data) ?? [],
    [data]
  );

  const table = useTable({
    data: flatData,
    columns,
    getRowId: (row) => row.id,
  });

  const containerRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useRowVirtualizer({
    count: table.getRowModel().rows.length,
    estimateSize: () => 50,
    overscan: 5,
    getScrollElement: () => containerRef.current,
  });

  const fetchMoreOnBottomReached = React.useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement) {
        const {scrollHeight, scrollTop, clientHeight} = containerRefElement;
        if (
          scrollHeight - scrollTop - clientHeight < 300 &&
          !isFetchingNextPage &&
          hasNextPage
        ) {
          fetchNextPage();
        }
      }
    },
    [fetchNextPage, isFetchingNextPage, hasNextPage]
  );

  return (
    <div
      ref={containerRef}
      onScroll={(e) => fetchMoreOnBottomReached(e.target as HTMLDivElement)}
      style={{height: '600px', overflow: 'auto'}}
    >
      <Table table={table} rowVirtualizer={rowVirtualizer} />
      {isFetchingNextPage && <div>Loading more...</div>}
    </div>
  );
}
```

---

## Migration Checklist

### Preparation

- [ ] Analyze current table usage
- [ ] Identify used HOCs and props
- [ ] Assess migration complexity
- [ ] Install `@gravity-ui/table`

### Basic Migration

- [ ] Replace import from `@gravity-ui/uikit` to `@gravity-ui/table`
- [ ] Update column structure (`name` → `header`, `template` → `cell`)
- [ ] Add typing `ColumnDef<YourType>[]`
- [ ] Test basic display

### Functionality Migration

- [ ] Migrate sorting (`withTableSorting` → `enableSorting`)
- [ ] Migrate row selection (`withTableSelection` → `enableRowSelection`)
- [ ] Migrate actions (`withTableActions` → column with buttons)
- [ ] Migrate column settings (`withTableSettings` → `enableHiding`)
- [ ] Migrate copying (`withTableCopy` → custom implementation)

### Improvements

- [ ] Add virtualization for large data
- [ ] Implement column pinning if needed
- [ ] Add column resizing
- [ ] Configure filtering
- [ ] Add grouping if needed

### Testing

- [ ] Check all interactive elements
- [ ] Test with real data
- [ ] Verify performance
- [ ] Ensure TypeScript types are correct
- [ ] Conduct code review

---

## Known Issues and Compatibility

### React 19 + React Compiler Compatibility

**⚠️ Known Issue:** There is a known compatibility issue with React 19 and React Compiler when using `@gravity-ui/table` (which is built on top of TanStack Table). The table may not re-render when data changes. See [TanStack Table issue #5567](https://github.com/TanStack/table/issues/5567) for details.

**Workaround:**

If you're using React 19 with React Compiler and experiencing issues with table re-rendering, you can use the `'use no memo'` directive in your component code:

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table/tanstack';

function MyTable() {
  'use no memo'; // Disable React Compiler memoization for this component

  const [data, setData] = React.useState<User[]>([]);

  const table = useTable({
    data,
    columns,
  });

  return <Table table={table} />;
}
```

**Alternative Solution:**

You can also explicitly memoize the table instance or data to ensure proper re-renders:

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table/tanstack';

function MyTable() {
  const [data, setData] = React.useState<User[]>([]);

  // Explicitly memoize data to ensure re-renders
  const memoizedData = React.useMemo(() => data, [data]);

  const table = useTable({
    data: memoizedData,
    columns,
  });

  return <Table table={table} />;
}
```

**Note:** This issue is in the underlying TanStack Table library and will need to be fixed there. The workarounds above should help until a fix is available.

---

## Conclusion

Migrating to `@gravity-ui/table` is an investment in your application's future. You get:

- ⚡ **Performance**: virtualization, optimized rendering
- 🎯 **Functionality**: tree structures, grouping, column pinning
- 💪 **Flexibility**: full control over state, headless architecture
- 🔧 **Support**: TanStack Table — industry standard with huge community
- 📘 **Typing**: full TypeScript support out of the box

Yes, migration requires effort, but for complex tables, the results justify the investment. Start with simple cases, gradually add functionality, and you'll see how the new table opens up possibilities that were previously unavailable.

**Happy migrating! 🚀**
