# Руководство по миграции с Table (@gravity-ui/uikit) на Table (@gravity-ui/table)

## Содержание

1. [Введение](#введение)
2. [Когда стоит мигрировать](#когда-стоит-мигрировать)
3. [Установка и настройка](#установка-и-настройка)
4. [Базовая миграция](#базовая-миграция)
5. [Миграция свойств](#миграция-свойств)
6. [Миграция HOC](#миграция-hoc)
7. [Новые возможности](#новые-возможности)
8. [Практические примеры](#практические-примеры)

---

## Введение

`@gravity-ui/table` — это современное решение для работы со сложными табличными данными, построенное на базе мощной библиотеки **TanStack Table v8** (ранее React Table).

### Ключевые преимущества новой таблицы

**🚀 Производительность:**

- Виртуализация строк для работы с десятками тысяч записей
- Оптимизированный рендеринг только видимых элементов
- Минимальные перерисовки благодаря умному мемоизированию

**🎯 Расширенный функционал:**

- Вложенные строки (Tree Table) с неограниченной вложенностью
- Группировка данных по нескольким колонкам
- Закрепление колонок слева и справа (Pinning)
- Изменение размера колонок (Resizing)
- Переупорядочивание колонок drag-and-drop
- Расширяемые строки (Expanding rows)
- Мультиколоночная сортировка
- Продвинутые фильтры с множественными условиями

**💪 Гибкость:**

- Полный контроль над состоянием таблицы
- Headless-архитектура для кастомизации
- TypeScript из коробки с полным типизированием
- Композиция функциональности через плагины

---

## Когда стоит мигрировать

### ✅ Мигрируйте, если вам нужно:

- **Большие объемы данных** (>1000 строк) — виртуализация обеспечит плавную прокрутку
- **Иерархические данные** — встроенная поддержка древовидных структур
- **Сложная сортировка и фильтрация** — мультиколоночная сортировка, кастомные фильтры
- **Интерактивность** — изменение размеров, переупорядочивание, закрепление колонок
- **Группировка данных** — визуальная группировка по полям
- **Расширяемые строки** — дополнительный контент внутри строк
- **Серверная пагинация/сортировка** — полный контроль над состоянием
- **Кастомизация** — уникальный дизайн и поведение

### ⚠️ Оставайтесь на старой таблице, если:

- Простое отображение данных без интерактивности
- Малое количество строк (<100)
- Нет требований к производительности
- Не нужен расширенный функционал
- Ограниченные ресурсы на рефакторинг

---

## Установка и настройка

### Установка пакета

```bash
npm install @gravity-ui/table
# или
yarn add @gravity-ui/table
# или
pnpm add @gravity-ui/table
```

### Импорты

```typescript jsx
// Старый подход
import {Table} from '@gravity-ui/uikit';

// Новый подход
import {Table} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table/tanstack';
```

---

## Базовая миграция

### Простейший пример

#### ❌ Было (@gravity-ui/uikit)

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
      getRowId={(item) => item.id}
    />
  );
}
```

#### ✅ Стало (@gravity-ui/table)

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

### Ключевые различия

| Аспект                  | @gravity-ui/uikit     | @gravity-ui/table              |
| ----------------------- | --------------------- | ------------------------------ |
| **Определение колонок** | `{id, name}`          | `ColumnDef<T>` с типизацией    |
| **Заголовок**           | `name`                | `header`                       |
| **Доступ к данным**     | По `id` автоматически | `accessorKey` или `accessorFn` |
| **Типизация**           | Частичная             | Полная через generics          |
| **API**                 | Кастомный             | TanStack Table                 |

---

## Миграция свойств

### Таблица соответствия props

| @gravity-ui/uikit | @gravity-ui/table | Комментарий                        |
| ----------------- | ----------------- | ---------------------------------- |
| `data`            | `data`            | ✅ Идентично                       |
| `columns`         | `columns`         | ⚠️ Другая структура (см. ниже)     |
| `getRowId`        | `getRowId`        | ✅ Та же сигнатура                 |
| `verticalAlign`   | -                 | ⚠️ Настраивается через CSS         |
| `wordWrap`        | -                 | ⚠️ Настраивается через CSS колонок |
| `className`       | `className`       | ✅ Идентично                       |
| `edgePadding`     | -                 | ⚠️ Настраивается через CSS         |
| `onRowClick`      | `onRowClick`      | ⚠️ Другая сигнатура                |

### Детальная миграция свойств

#### 1. `columns` — Определение колонок

##### ❌ Было

```typescript jsx
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
```

##### ✅ Стало

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
      align: 'left', // Используется в кастомных ячейках
    },
  },
  {
    id: 'age',
    header: 'Age',
    accessorKey: 'age',
    size: 100,
  },
];
```

**Маппинг свойств колонки:**

| Старое свойство | Новое свойство  | Описание               |
| --------------- | --------------- | ---------------------- |
| `name`          | `header`        | Заголовок колонки      |
| `template`      | `cell`          | Рендер функция ячейки  |
| `width`         | `size`          | Размер колонки (px)    |
| -               | `minSize`       | Минимальный размер     |
| -               | `maxSize`       | Максимальный размер    |
| `align`         | -               | Стилизуется вручную    |
| `sortable`      | `enableSorting` | Возможность сортировки |
| `primary`       | -               | Стилизуется вручную    |

#### 2. `verticalAlign` — Вертикальное выравнивание

##### ❌ Было

```typescript jsx
import {Table} from '@gravity-ui/uikit';

function MyTable() {
  return (
    <Table
      verticalAlign="top"
      data={data}
      columns={columns}
      getRowId={(item) => item.id}
    />
  );
}
```

##### ✅ Стало

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';

// Вариант 1: Через className
function MyTable() {
    const table = useTable({
        data,
        columns,
    });

    return (
        <Table table={table} className="my-table" />
    );
}
```

```scss
// В SCSS
.my-table {
  td {
    vertical-align: top;
  }
}
```

```typescript jsx
import React from 'react';
import type {ColumnDef} from '@gravity-ui/table/tanstack';

// Вариант 2: Через глобальные стили колонок
const columns: ColumnDef<User>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    cell: (info) => (
      <div style={{display: 'flex', alignItems: 'flex-start'}}>
        {info.getValue()}
      </div>
    ),
  },
];
```

#### 3. `wordWrap` — Перенос текста

##### ❌ Было

```typescript jsx
import {Table} from '@gravity-ui/uikit';

function MyTable() {
  return (
    <Table
      wordWrap="break-word"
      data={data}
      columns={columns}
      getRowId={(item) => item.id}
    />
  );
}
```

##### ✅ Стало

```typescript jsx
import type {ColumnDef} from '@gravity-ui/table/tanstack';

const columns: ColumnDef<User>[] = [
  {
    id: 'description',
    header: 'Description',
    accessorKey: 'description',
    cell: (info) => (
      <div style={{
        wordWrap: 'break-word',
        whiteSpace: 'normal',
        maxWidth: '300px',
      }}>
        {info.getValue()}
      </div>
    ),
  },
];
```

```typescript jsx
import type {ColumnDef} from '@gravity-ui/table/tanstack';

// Или через CSS класс
const columns: ColumnDef<User>[] = [
  {
    id: 'description',
    header: 'Description',
    accessorKey: 'description',
    meta: {
      className: 'wrapped-cell',
    },
  },
];
```

```scss
// SCSS
.wrapped-cell {
  word-wrap: break-word;
  white-space: normal;
}
```

#### 4. `onRowClick` — Клик по строке

##### ❌ Было

```typescript jsx
import {Table} from '@gravity-ui/uikit';

function MyTable() {
  return (
    <Table
      data={data}
      columns={columns}
      getRowId={(item) => item.id}
      onRowClick={(item, index, event) => {
        console.log('Clicked:', item);
      }}
    />
  );
}
```

##### ✅ Стало

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';

function MyTable() {
    const table = useTable({
        data,
        columns,
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

#### 5. `edgePadding` — Отступы по краям

##### ❌ Было

```typescript jsx
import {Table} from '@gravity-ui/uikit';

function MyTable() {
  return (
    <Table
      edgePadding={true}
      data={data}
      columns={columns}
      getRowId={(item) => item.id}
    />
  );
}
```

##### ✅ Стало

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';

function MyTable() {
    const table = useTable({
        data,
        columns,
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
    padding-left: 20px;
  }

  td:last-child,
  th:last-child {
    padding-right: 20px;
  }
}
```

---

## Миграция HOC

В старой таблице функциональность расширялась через Higher-Order Components (HOC). В новой таблице используется более современный подход: **встроенные возможности TanStack Table + хуки + композиция**.

### 1. `withTableSorting` — Сортировка

#### ❌ Было

```typescript jsx
import React from 'react';
import {Table, withTableSorting} from '@gravity-ui/uikit';

const TableWithSorting = withTableSorting(Table);

function MyTable() {
  const [sortState, setSortState] = React.useState([
    {column: 'name', order: 'asc'}
  ]);

  return (
    <TableWithSorting
      data={data}
      columns={columns}
      defaultSortState={sortState}
      onSortStateChange={setSortState}
    />
  );
}
```

#### ✅ Стало

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';
import type {ColumnDef, SortingState} from '@gravity-ui/table/tanstack';

function MyTable() {
  const [sorting, setSorting] = React.useState<SortingState>([
    {id: 'name', desc: false}
  ]);

  const columns: ColumnDef<User>[] = [
    {
      id: 'name',
      header: 'Name',
      accessorKey: 'name',
      enableSorting: true, // Включить сортировку
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
      enableSorting: false, // Отключить сортировку
    },
  ];

  const table = useTable({
    data,
    columns,
    enableSorting: true, // Глобальное включение сортировки
    manualSorting: false, // false = клиентская, true = серверная
    state: {
      sorting,
    },
    onSortingChange: setSorting,
  });

  return (
    <Table table={table} />
  );
}
```

**🎉 Новые возможности сортировки:**

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';
import type {ColumnDef, SortingState} from '@gravity-ui/table/tanstack';

// Мультиколоночная сортировка
function AdvancedSorting() {
  const [sorting, setSorting] = React.useState<SortingState>([
    {id: 'department', desc: false},
    {id: 'name', desc: false},
  ]);

  const table = useTable({
    data,
    columns,
    enableSorting: true,
    enableMultiSort: true, // Мультисортировка через Shift+Click
    maxMultiSortColCount: 3, // Максимум 3 колонки
    state: {sorting},
    onSortingChange: setSorting,
  });

  return (
    <Table table={table} />
  );
}

// Кастомная функция сортировки
const columns: ColumnDef<User>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    sortingFn: (rowA, rowB) => {
      // Кастомная логика сортировки
      const a = rowA.original.name.toLowerCase();
      const b = rowB.original.name.toLowerCase();
      return a.localeCompare(b);
    },
  },
];

// Серверная сортировка
function ServerSideSorting() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [data, setData] = React.useState<User[]>([]);

  React.useEffect(() => {
    // Запрос на сервер с параметрами сортировки
    fetchData({
      sortBy: sorting[0]?.id,
      sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
    }).then(setData);
  }, [sorting]);

  const table = useTable({
    data,
    columns,
    enableSorting: true,
    manualSorting: true, // Серверная сортировка
    state: {sorting},
    onSortingChange: setSorting,
  });

  return (
    <Table table={table} />
  );
}
```

---

### 2. `withTableSelection` — Выбор строк

#### ❌ Было

```typescript jsx
import React from 'react';
import {Table, withTableSelection} from '@gravity-ui/uikit';

const TableWithSelection = withTableSelection(Table);

function MyTable() {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  return (
    <TableWithSelection
      data={data}
      columns={columns}
      selectedIds={selectedIds}
      onSelectionChange={setSelectedIds}
    />
  );
}
```

#### ✅ Стало

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';
import type {ColumnDef, RowSelectionState} from '@gravity-ui/table/tanstack';

function MyTable() {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const columns: ColumnDef<User>[] = [
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
    },
    // ... другие колонки
  ];

  // Получить выбранные строки
  const selectedRows = React.useMemo(() => {
    return Object.keys(rowSelection)
      .filter(key => rowSelection[key])
      .map(id => data.find(row => row.id === id));
  }, [rowSelection, data]);

  const table = useTable({
    data,
    columns,
    enableRowSelection: true, // Глобальное включение
    // enableRowSelection: (row) => row.original.selectable, // Условное включение
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

**🎉 Новые возможности выбора:**

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';
import type {ColumnDef, RowSelectionState} from '@gravity-ui/table/tanstack';

// Условный выбор строк
function ConditionalSelection() {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const table = useTable({
    data,
    columns,
    enableRowSelection: (row) => {
      // Можно выбрать только активных пользователей
      return row.original.status === 'active';
    },
    state: {rowSelection},
    onRowSelectionChange: setRowSelection,
  });

  return <Table table={table} />;
}

// Одиночный выбор (radio-режим)
function SingleSelection() {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const columns: ColumnDef<User>[] = [
    {
      id: 'select',
      cell: ({row}) => (
        <input
          type="radio"
          name="row-selection"
          checked={row.getIsSelected()}
          onChange={() => {
            // Сбросить все и выбрать текущую
            setRowSelection({[row.id]: true});
          }}
        />
      ),
    },
    // ... остальные колонки
  ];

  const table = useTable({
    data,
    columns,
    enableRowSelection: true,
    enableMultiRowSelection: false, // Одиночный выбор
    state: {rowSelection},
    onRowSelectionChange: setRowSelection,
  });

  return (
    <Table table={table} />
  );
}

// Выбор с группировкой (выбрать всю группу)
function GroupSelection() {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const table = useTable({
    data,
    columns,
    enableRowSelection: true,
    enableSubRowSelection: true, // Выбор вложенных строк
    state: {rowSelection},
    onRowSelectionChange: setRowSelection,
  });

  return (
    <Table table={table} />
  );
}
```

---

### 3. `withTableActions` — Действия со строками

#### ❌ Было

```typescript jsx
import React from 'react';
import {Table, withTableActions} from '@gravity-ui/uikit';

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

#### ✅ Стало

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';
import {Button, DropdownMenu} from '@gravity-ui/uikit';
import type {ColumnDef} from '@gravity-ui/table/tanstack';

function MyTable() {
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
          >
            <Button view="flat" size="s">
              Actions
            </Button>
          </DropdownMenu>
        );
      },
      size: 100,
      enableSorting: false,
    },
  ];

  const handleEdit = (user: User) => {
    console.log('Edit', user);
  };

  const handleDelete = (user: User) => {
    console.log('Delete', user);
  };

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

### 4. `withTableSettings` — Настройка колонок

#### ❌ Было

```typescript jsx
import React from 'react';
import {Table, withTableSettings} from '@gravity-ui/uikit';

const TableWithSettings = withTableSettings(Table);

function MyTable() {
  const [settings, setSettings] = React.useState({
    visibleColumns: ['name', 'email'],
    columnOrder: ['name', 'email', 'phone'],
  });

  return (
    <TableWithSettings
      data={data}
      columns={columns}
      settings={settings}
      onSettingsChange={setSettings}
    />
  );
}
```

#### ✅ Стало

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';
import type {ColumnDef, VisibilityState, ColumnOrderState} from '@gravity-ui/table/tanstack';

function MyTable() {
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    phone: false, // Скрыта по умолчанию
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
      enableHiding: true, // Можно скрыть
    },
  ];

  const table = useTable({
    data,
    columns,
    enableHiding: true, // Включить возможность скрытия
    state: {
      columnVisibility,
      columnOrder,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
  });

  return (
    <>
      {/* Панель настроек */}
      <div>
        <h4>Show/Hide Columns:</h4>
        {columns.map((column) => (
          <label key={column.id}>
            <input
              type="checkbox"
              checked={columnVisibility[column.id!] !== false}
              onChange={(e) => {
                setColumnVisibility(prev => ({
                  ...prev,
                  [column.id!]: e.target.checked,
                }));
              }}
            />
            {column.header as string}
          </label>
        ))}
      </div>

      <Table table={table} />
    </>
  );
}
```

**🎉 Расширенные настройки колонок:**

```typescript jsx
// Полная панель управления колонками
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';
import {Button, Popover, Checkbox, Flex, Icon} from '@gravity-ui/uikit';
import {Gear} from '@gravity-ui/icons';
import type {ColumnDef, VisibilityState, ColumnOrderState} from '@gravity-ui/table/tanstack';

function TableWithFullSettings() {
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>([]);
  const [columnSizing, setColumnSizing] = React.useState({});

  const table = useTable({
    data,
    columns,
    enableHiding: true,
    enableColumnResizing: true, // Изменение размеров
    columnResizeMode: 'onChange',
    state: {
      columnVisibility,
      columnOrder,
      columnSizing,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onColumnSizingChange: setColumnSizing,
  });

  return (
    <div>
      <Flex justifyContent="space-between" gap={2}>
        <h2>Users Table</h2>

        {/* Кнопка настроек */}
        <Popover
          content={
            <ColumnSettingsPanel
              columns={columns}
              columnVisibility={columnVisibility}
              onVisibilityChange={setColumnVisibility}
              columnOrder={columnOrder}
              onOrderChange={setColumnOrder}
            />
          }
        >
          <Button view="outlined" size="m">
            <Icon data={Gear} /> Settings
          </Button>
        </Popover>
      </Flex>

      <Table table={table} />
    </div>
  );
}

// Компонент панели настроек с Drag & Drop
import {DndContext, closestCenter} from '@dnd-kit/core';
import {SortableContext, verticalListSortingStrategy, useSortable} from '@dnd-kit/sortable';

type ColumnSettingsPanelProps = {
  columns: ColumnDef<User>[];
  columnVisibility: VisibilityState;
  onVisibilityChange: (visibility: VisibilityState) => void;
  columnOrder: ColumnOrderState;
  onOrderChange: (order: ColumnOrderState) => void;
}

function ColumnSettingsPanel({
  columns,
  columnVisibility,
  onVisibilityChange,
  columnOrder,
  onOrderChange,
}: ColumnSettingsPanelProps) {
  const handleDragEnd = (event: any) => {
    const {active, over} = event;
    if (active.id !== over.id) {
      const oldIndex = columnOrder.indexOf(active.id);
      const newIndex = columnOrder.indexOf(over.id);
      const newOrder = [...columnOrder];
      newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, active.id);
      onOrderChange(newOrder);
    }
  };

  return (
    <div style={{padding: '16px', minWidth: '250px'}}>
      <h4>Column Settings</h4>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={columnOrder} strategy={verticalListSortingStrategy}>
          {columnOrder.map((columnId) => {
            const column = columns.find(c => c.id === columnId);
            if (!column) return null;

            return (
              <SortableColumnItem
                key={columnId}
                id={columnId}
                label={column.header as string}
                visible={columnVisibility[columnId] !== false}
                onVisibilityChange={(visible) => {
                  onVisibilityChange({
                    ...columnVisibility,
                    [columnId]: visible,
                  });
                }}
              />
            );
          })}
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableColumnItem({id, label, visible, onVisibilityChange}: any) {
  const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id});

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Checkbox
        checked={visible}
        onChange={(e) => onVisibilityChange(e.target.checked)}
      >
        {label}
      </Checkbox>
    </div>
  );
}
```

---

### 5. `withTableCopy` — Копирование данных

#### ❌ Было

```typescript jsx
import React from 'react';
import {Table, withTableCopy} from '@gravity-ui/uikit';

const TableWithCopy = withTableCopy(Table);

function MyTable() {
  return (
    <TableWithCopy
      data={data}
      columns={columns}
      getRowId={(item) => item.id}
      allowCopy={true}
    />
  );
}
```

#### ✅ Стало

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';
import {Button, Toaster, Flex, Icon} from '@gravity-ui/uikit';
import {Copy} from '@gravity-ui/icons';
import type {ColumnDef} from '@gravity-ui/table/tanstack';

const toaster = new Toaster();

function MyTable() {
  // Функция копирования в буфер обмена
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

  // Копирование всей таблицы
  const handleCopyAllData = () => {
    const csv = data
      .map(row => `${row.name}\t${row.email}`)
      .join('\n');
    copyToClipboard(csv);
  };

  const table = useTable({
    data,
    columns,
  });

  return (
    <>
      <Button onClick={handleCopyAllData}>
        Copy All Data
      </Button>

      <Table table={table} />
    </>
  );
}
```

---

## Новые возможности

### 1. 🌳 Древовидная таблица (Tree Table)

**Одна из самых мощных фич новой таблицы!**

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table/tanstack';

type FileSystemItem = {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  subRows?: FileSystemItem[]; // Вложенные элементы
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

function TreeTable() {
  const [expanded, setExpanded] = React.useState({});

  const columns: ColumnDef<FileSystemItem>[] = [
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

  const table = useTable({
    data,
    columns,
    enableExpanding: true, // Включить раскрытие строк
    getSubRows: (row) => row.subRows, // Получить вложенные строки
    state: {
      expanded,
    },
    onExpandedChange: setExpanded,
    // Раскрыть все по умолчанию
    initialState: {
      expanded: true,
    },
  });

  return (
    <Table table={table} />
  );
}
```

### 2. 📌 Закрепление колонок (Column Pinning)

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';
import {Button} from '@gravity-ui/uikit';
import type {ColumnDef, ColumnPinningState} from '@gravity-ui/table/tanstack';

function PinnedColumnsTable() {
  const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>({
    left: ['select', 'name'], // Закрепить слева
    right: ['actions'], // Закрепить справа
  });

  const columns: ColumnDef<User>[] = [
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

  const table = useTable({
    data,
    columns,
    enableColumnPinning: true, // Включить закрепление
    state: {
      columnPinning,
    },
    onColumnPinningChange: setColumnPinning,
  });

  return (
    <Table table={table} />
  );
}
```

### 3. 📏 Изменение размера колонок (Column Resizing)

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table/tanstack';

function ResizableTable() {
  const [columnSizing, setColumnSizing] = React.useState({});

  const table = useTable({
    data,
    columns,
    enableColumnResizing: true, // Включить изменение размера
    columnResizeMode: 'onChange', // 'onChange' | 'onEnd'
    state: {
      columnSizing,
    },
    onColumnSizingChange: setColumnSizing,
  });

  return (
    <Table table={table} />
  );
}
```

### 4. 🎭 Виртуализация (Virtualization)

**Отображение 100,000+ строк без лагов!**

```typescript jsx
import React from 'react';
import {Table, useTable, useRowVirtualizer} from '@gravity-ui/table';

function VirtualizedTable() {
  // Огромный датасет
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
    columns,
    getRowId: (row) => row.id,
  });

  const containerRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useRowVirtualizer({
    count: table.getRowModel().rows.length,
    estimateSize: () => 50, // Оценка высоты строки
    overscan: 10, // Количество строк за пределами видимой области
    getScrollElement: () => containerRef.current,
  });

  return (
    <div ref={containerRef} style={{height: '500px', overflow: 'auto'}}>
      <Table table={table} rowVirtualizer={rowVirtualizer} />
    </div>
  );
}
```

### 4.1. 🪟 Виртуализация окна (Window Virtualization)

**Используйте, если нужно использовать окно как элемент прокрутки**

```typescript jsx
import React from 'react';
import {Table, useTable, useWindowRowVirtualizer} from '@gravity-ui/table';

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
    columns,
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

### 4.2. 🔄 Переупорядочивание строк (Row Reordering)

**Drag-and-drop для изменения порядка строк**

```typescript jsx
import React from 'react';
import {Table, useTable, ReorderingProvider, dragHandleColumn} from '@gravity-ui/table';
import type {ReorderingProviderProps, ColumnDef} from '@gravity-ui/table';

function ReorderableTable() {
  const [data, setData] = React.useState<User[]>([
    {id: '1', name: 'John', email: 'john@example.com'},
    {id: '2', name: 'Jane', email: 'jane@example.com'},
    {id: '3', name: 'Bob', email: 'bob@example.com'},
  ]);

  const columns: ColumnDef<User>[] = [
    dragHandleColumn as ColumnDef<User>, // Колонка с ручкой для перетаскивания
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

  const table = useTable({
    columns,
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

### 4.3. 🔄 Переупорядочивание с виртуализацией

**Переупорядочивание для больших таблиц с виртуализацией**

```typescript jsx
import React from 'react';
import {Table, useTable, useWindowRowVirtualizer, ReorderingProvider, dragHandleColumn, getVirtualRowRangeExtractor} from '@gravity-ui/table';
import type {ReorderingProviderProps, ColumnDef} from '@gravity-ui/table';

function ReorderableVirtualizedTable() {
  const tableRef = React.useRef<HTMLTableElement>(null);
  const [data, setData] = React.useState(() =>
    Array.from({length: 1000}, (_, i) => ({
      id: `${i}`,
      name: `User ${i}`,
      email: `user${i}@example.com`,
    }))
  );

  const columns: ColumnDef<User>[] = [
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

  const table = useTable({
    columns,
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

### 5. 🔄 Группировка (Grouping)

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';
import type {ColumnDef, GroupingState} from '@gravity-ui/table/tanstack';

function GroupedTable() {
  const [grouping, setGrouping] = React.useState<GroupingState>(['department']);

  const columns: ColumnDef<User>[] = [
    {
      id: 'department',
      header: 'Department',
      accessorKey: 'department',
      enableGrouping: true, // Разрешить группировку
    },
    {
      id: 'name',
      header: 'Name',
      accessorKey: 'name',
      cell: ({row, getValue}) => {
        if (row.getIsGrouped()) {
          // Рендер заголовка группы
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
      aggregationFn: 'count', // Функция агрегации
      cell: ({row, getValue}) => {
        if (row.getIsGrouped()) {
          return null;
        }
        return getValue();
      },
    },
  ];

  const table = useTable({
    data,
    columns,
    enableGrouping: true,
    state: {
      grouping,
    },
    onGroupingChange: setGrouping,
  });

  return (
    <Table table={table} />
  );
}
```

### 6. 🔍 Глобальный поиск и фильтры

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';
import type {ColumnDef, ColumnFiltersState} from '@gravity-ui/table/tanstack';

function FilterableTable() {
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const table = useTable({
    data,
    columns,
    enableGlobalFilter: true, // Глобальный поиск
    enableColumnFilters: true, // Фильтры по колонкам
    state: {
      globalFilter,
      columnFilters,
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
  });

  return (
    <>
      {/* Глобальный поиск */}
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

// Фильтры в заголовках колонок
const columns: ColumnDef<User>[] = [
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
    filterFn: 'includesString', // Встроенная функция фильтрации
  },
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
    filterFn: (row, columnId, filterValue) => {
      // Кастомная функция фильтрации
      return row.getValue(columnId) === filterValue;
    },
  },
];
```

### 7. 📄 Расширяемые строки (Expanding Rows)

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table/tanstack';

function ExpandableRowsTable() {
  const [expanded, setExpanded] = React.useState({});

  const columns: ColumnDef<User>[] = [
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
    // ... остальные колонки
  ];

  const table = useTable({
    data,
    columns,
    enableExpanding: true,
    getRowCanExpand: () => true, // Все строки могут раскрываться
    state: {
      expanded,
    },
    onExpandedChange: setExpanded,
  });

  return (
    <Table
      table={table}
      getIsCustomRow={(row) => row.getIsExpanded() && !row.getIsGrouped()}
      renderCustomRowContent={({row, Cell}) => (
        <Cell colSpan={columns.length} style={{padding: '16px', backgroundColor: '#f5f5f5'}}>
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

### 8. 📌 Липкий заголовок (Sticky Header)

**Заголовок таблицы остается видимым при прокрутке**

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';

function StickyHeaderTable() {
  const table = useTable({
    data,
    columns,
  });

  return (
    <div style={{height: '400px', overflow: 'auto'}}>
      <Table table={table} stickyHeader />
    </div>
  );
}
```

### 9. 📏 Размер таблицы (Table Size)

**Различные размеры таблицы для разных контекстов**

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';

function SizedTable() {
  const table = useTable({
    data,
    columns,
  });

  return (
    <>
      {/* Маленький размер */}
      <Table table={table} size="s" />

      {/* Средний размер (по умолчанию) */}
      <Table table={table} size="m" />
    </>
  );
}
```

### 10. 🔗 Ссылки в строках (Row Links)

**Использование ссылок в строках таблицы**

```typescript jsx
import React from 'react';
import {Table, useTable, ExperimentalRowLink} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table/tanstack';

function TableWithRowLinks() {
  const columns: ColumnDef<User>[] = [
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

  const table = useTable({
    data,
    columns,
  });

  return <Table table={table} />;
}
```

### 11. 📭 Пустой контент (Empty Content)

**Отображение контента, когда таблица пуста**

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';

function TableWithEmptyContent() {
  const table = useTable({
    data: [], // Пустые данные
    columns,
  });

  return (
    <Table
      table={table}
      emptyContent={<div>Нет данных для отображения</div>}
    />
  );
}
```

### 12. 📋 Группы заголовков (Header Groups)

**Вложенные заголовки колонок**

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table/tanstack';

function TableWithHeaderGroups() {
  const columns: ColumnDef<User>[] = [
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

  const table = useTable({
    data,
    columns,
  });

  return <Table table={table} />;
}
```

### 12.1. 📋 Таблица без заголовка (Table Without Header)

**Отображение таблицы без заголовка**

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';

function TableWithoutHeader() {
  const table = useTable({
    data,
    columns,
  });

  return (
    <Table
      table={table}
      withHeader={false}
    />
  );
}
```

### 13. 🌳 Виртуализированное дерево (Virtualized Tree)

**Древовидная таблица с виртуализацией для больших объемов данных**

```typescript jsx
import React from 'react';
import {Table, useTable, useRowVirtualizer} from '@gravity-ui/table';
import type {ColumnDef, ExpandedState} from '@gravity-ui/table/tanstack';

function VirtualizedTreeTable() {
  const [expanded, setExpanded] = React.useState<ExpandedState>({});

  const table = useTable({
    data,
    columns,
    getSubRows: (row) => row.subRows,
    enableExpanding: true,
    state: {
      expanded,
    },
    onExpandedChange: setExpanded,
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

### 13.1. 📊 Footer таблицы (Table Footer)

**Добавление футера в таблицу с кастомным контентом**

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';

function TableWithFooter() {
  const table = useTable({
    data,
    columns,
  });

  return (
    <Table
      table={table}
      withFooter={true}
      renderCustomFooterContent={({footerGroups, cellClassName, rowClassName}) => (
        <tr className={rowClassName}>
          <td colSpan={columns.length} className={cellClassName}>
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

#### 13.1.1. Липкий Footer

**Footer остается видимым при прокрутке**

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';

function TableWithStickyFooter() {
  const table = useTable({
    data,
    columns,
  });

  return (
    <div style={{height: '400px', overflow: 'auto'}}>
      <Table
        table={table}
        withFooter={true}
        stickyFooter={true}
        renderCustomFooterContent={({cellClassName, rowClassName}) => (
          <tr className={rowClassName}>
            <td colSpan={columns.length} className={cellClassName}>
              Footer content
            </td>
          </tr>
        )}
      />
    </div>
  );
}
```

### 14. 📐 Автоматический размер колонок (Column Auto Sizing)

**Автоматический расчет ширины колонок на основе содержимого**

```typescript jsx
import React from 'react';
import {Table, useTable, experimentalUseColumnsAutoSize} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table/tanstack';

function AutoSizedTable() {
  const columns: ColumnDef<User>[] = React.useMemo(
    () => [
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
    ],
    []
  );

  // Вычисление ширины колонок
  const {setTableInstance, columnsWithAutoSizes, isMeasuring} = experimentalUseColumnsAutoSize({
    columns,
    options: {
      minWidth: 80,
      maxWidth: 300,
      sampleSize: 100, // Количество строк для выборки
      padding: 16, // Отступ для ячеек
      headerPadding: 24, // Отступ для заголовков
      measureHeaderText: true, // Учитывать текст заголовков
      respectExistingWidths: true, // Сохранять предопределенные ширины
      respectResizedWidths: true, // Сохранять измененные пользователем ширины
    },
  });

  // Создание экземпляра таблицы
  const table = useTable({
    data,
    columns: columnsWithAutoSizes,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
  });

  // Обновление ссылки на экземпляр таблицы
  React.useEffect(() => {
    setTableInstance(table);
  }, [table, setTableInstance]);

  // Показываем загрузчик во время измерения
  if (isMeasuring) {
    return <div>Calculating column widths...</div>;
  }

  return <Table table={table} />;
}
```

#### 14.1. С предопределенными ширинами

**Хук уважает колонки с заданными размерами**

```typescript jsx
import React from 'react';
import {Table, useTable, experimentalUseColumnsAutoSize} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table/tanstack';

function AutoSizedTableWithPredefinedWidths() {
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      // Автоматический размер
    },
    {
      accessorKey: 'age',
      header: 'Age',
      size: 100, // Фиксированная ширина - будет сохранена
    },
    {
      accessorKey: 'email',
      header: 'Email',
      // Автоматический размер
    },
  ];

  const {setTableInstance, columnsWithAutoSizes, isMeasuring} = experimentalUseColumnsAutoSize({
    columns,
    options: {
      respectExistingWidths: true, // Сохранять предопределенные ширины
    },
  });

  const table = useTable({
    data,
    columns: columnsWithAutoSizes,
    enableColumnResizing: true,
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

#### 14.2. С кастомными ограничениями ширины

**Настройка минимальной и максимальной ширины**

```typescript jsx
import React from 'react';
import {Table, useTable, experimentalUseColumnsAutoSize} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table/tanstack';

function AutoSizedTableWithCustomLimits() {
  const {setTableInstance, columnsWithAutoSizes, isMeasuring} = experimentalUseColumnsAutoSize({
    columns,
    options: {
      minWidth: 100, // Минимальная ширина 100px
      maxWidth: 250, // Максимальная ширина 250px
      padding: 24, // Больше отступов
    },
  });

  const table = useTable({
    data,
    columns: columnsWithAutoSizes,
    enableColumnResizing: true,
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

#### 14.3. Оптимизация для больших датасетов

**Использование меньшей выборки для улучшения производительности**

```typescript jsx
import React from 'react';
import {Table, useTable, experimentalUseColumnsAutoSize} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table/tanstack';

function AutoSizedTableOptimized() {
  const {setTableInstance, columnsWithAutoSizes, isMeasuring} = experimentalUseColumnsAutoSize({
    columns,
    options: {
      sampleSize: 20, // Измеряем только первые 20 строк вместо всех
      minWidth: 80,
      maxWidth: 300,
    },
  });

  const table = useTable({
    data: largeDataset, // Огромный датасет
    columns: columnsWithAutoSizes,
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

#### 14.4. С кастомным рендерером для измерения

**Когда нужны провайдеры контекста в ячейках**

```typescript jsx
import React from 'react';
import {Table, useTable, experimentalUseColumnsAutoSize, experimentalRenderElementForMeasure as defaultRenderElementForMeasure} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table/tanstack';
import {Provider} from 'react-redux';

function AutoSizedTableWithProvider() {
  // Кастомный рендерер с провайдером
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
    columns,
    experimentalRenderElementForMeasure,
    options: {
      minWidth: 80,
      maxWidth: 300,
    },
  });

  const table = useTable({
    data,
    columns: columnsWithAutoSizes,
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

### 15. 🎨 Кастомные стили строк и ячеек

```typescript jsx
import React from 'react';
import {Table, useTable} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table/tanstack';

const columns: ColumnDef<User>[] = [
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

// Условные стили строк
function StyledTable() {
  const table = useTable({
    data,
    columns,
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

// Или через CSS
// .highlighted-row {
//   background-color: #fff3cd;
//   font-weight: bold;
// }
```

---

## Практические примеры

### Пример 1: Сложная таблица с множественным функционалом

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
  // Состояние таблицы
  const [data, setData] = React.useState<Employee[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Загрузка данных
  React.useEffect(() => {
    fetchEmployees().then(setData);
  }, []);

  // Определение колонок
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

  // Обработчики действий
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
    // Экспорт CSV
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
    // Сортировка
    enableSorting: true,
    enableMultiSort: true,
    onSortingChange: setSorting,
    // Выбор строк
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    // Фильтрация
    enableColumnFilters: true,
    onColumnFiltersChange: setColumnFilters,
    // Видимость колонок
    enableHiding: true,
    onColumnVisibilityChange: setColumnVisibility,
    // Изменение размеров
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    // Пагинация
    onPaginationChange: setPagination,
    pageCount: Math.ceil(data.length / pagination.pageSize),
    // ID строк
    getRowId: (row) => row.id,
    // Table state
    state: {sorting, rowSelection, columnFilters, columnVisibility, pagination},
  });

  return (
    <div>
      {/* Панель инструментов */}
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
            // Глобальный поиск
            setColumnFilters([{id: 'name', value}]);
          }}
        />
      </Flex>

      {/* Таблица */}
      <Table table={table} />

      {/* Пагинация */}
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

### Пример 2: Древовидная таблица с файловой системой

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

// Вспомогательные функции
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

### Пример 3: Таблица с виртуализацией и бесконечной прокруткой

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

## Чек-лист миграции

### Подготовка

- [ ] Проанализировать текущее использование таблицы
- [ ] Выявить используемые HOC и свойства
- [ ] Оценить сложность миграции
- [ ] Установить `@gravity-ui/table`

### Базовая миграция

- [ ] Заменить импорт с `@gravity-ui/uikit` на `@gravity-ui/table`
- [ ] Обновить структуру колонок (`name` → `header`, `template` → `cell`)
- [ ] Добавить типизацию `ColumnDef<YourType>[]`
- [ ] Протестировать базовое отображение

### Миграция функционала

- [ ] Мигрировать сортировку (`withTableSorting` → `enableSorting`)
- [ ] Мигрировать выбор строк (`withTableSelection` → `enableRowSelection`)
- [ ] Мигрировать действия (`withTableActions` → колонка с кнопками)
- [ ] Мигрировать настройки колонок (`withTableSettings` → `enableHiding`)
- [ ] Мигрировать копирование (`withTableCopy` → кастомная реализация)

### Улучшения

- [ ] Добавить виртуализацию для больших данных
- [ ] Реализовать закрепление колонок, если нужно
- [ ] Добавить изменение размеров колонок
- [ ] Настроить фильтрацию
- [ ] Добавить группировку, если нужно

### Тестирование

- [ ] Проверить все интерактивные элементы
- [ ] Протестировать с реальными данными
- [ ] Проверить производительность
- [ ] Убедиться в корректности типов TypeScript
- [ ] Провести код-ревью

---

## Заключение

Миграция на `@gravity-ui/table` — это инвестиция в будущее вашего приложения. Вы получаете:

- ⚡ **Производительность**: виртуализация, оптимизированный рендеринг
- 🎯 **Функциональность**: древовидные структуры, группировка, закрепление колонок
- 💪 **Гибкость**: полный контроль над состоянием, headless-архитектура
- 🔧 **Поддержка**: TanStack Table — индустриальный стандарт с огромным комьюнити
- 📘 **Типизация**: полная поддержка TypeScript из коробки

Да, миграция требует усилий, но для сложных таблиц результат оправдывает затраты. Начните с простых случаев, постепенно наращивайте функциональность, и вы увидите, как новая таблица открывает возможности, которые были недоступны раньше.

**Удачной миграции! 🚀**
