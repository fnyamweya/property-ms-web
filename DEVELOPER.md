Here’s a step-by-step guide, using our scaffold, on how to add a new “Books” component that fetches a list of books from an API and displays them:

---

## 1. Add an endpoint constant

Open **`src/constants/endpoints.ts`** and add your new key:

```ts
export const ENDPOINTS = {
  …,
  GET_BOOKS: 'getBooks',
} as const
```

## 2. Define your data shape

Create **`src/types/book.ts`**:

```ts
export interface Book {
  id: string
  title: string
  author: string
  publishedAt: string
}
```

## 3. Wire up the API config

Make sure your **`src/config/api.ts`** maps that key to a path:

```ts
import { ENDPOINTS } from '@/constants/endpoints'

export const apiConfig = {
  baseUrl: import.meta.env.VITE_API_BASE_URL!,
  endpoints: {
    …,
    [ENDPOINTS.GET_BOOKS]: '/books',
  },
  defaultHeaders: { 'Accept': 'application/json' },
  timeoutMs: 10000,
}
```

## 4. Create a Zustand store slice

In **`src/store/books.ts`**:

```ts
import { create } from 'zustand'
import { apiClient } from '@/api'
import { ENDPOINTS } from '@/constants/endpoints'
import type { Book } from '@/types/book'

interface BooksState {
  books: Book[]              
  status: 'idle'|'loading'|'error'
  error?: string
  fetchBooks: () => Promise<void>
}

export const useBooksStore = create<BooksState>((set) => ({
  books: [],
  status: 'idle',
  fetchBooks: async () => {
    set({ status: 'loading', error: undefined })
    try {
      const data = await apiClient.request<Book[]>({
        endpointKey: ENDPOINTS.GET_BOOKS,
        method: 'GET',
      })
      set({ books: data, status: 'idle' })
    } catch (err) {
      set({ status: 'error', error: (err as any).message })
    }
  },
}))
```

## 5. Expose a custom hook

In **`src/hooks/useBooks.ts`**:

```ts
import { useBooksStore } from '@/store/books'

export function useBooks() {
  const { books, status, error, fetchBooks } = useBooksStore()
  return { books, status, error, fetchBooks }
}
```

## 6. Build your React component

Create **`src/components/BooksList/BooksList.tsx`**:

```tsx
import { useEffect } from 'react'
import { useBooks } from '@/hooks/useBooks'
import { Spinner } from '@/components/ui/spinner'   // your existing UI spinner
import { Card } from '@/components/ui/card'

export function BooksList() {
  const { books, status, error, fetchBooks } = useBooks()

  useEffect(() => {
    fetchBooks()
  }, [fetchBooks])

  if (status === 'loading') {
    return <Spinner />
  }
  if (status === 'error') {
    return <div className="text-red-600">Error: {error}</div>
  }

  return (
    <div className="grid gap-4">
      {books.map((b) => (
        <Card key={b.id}>
          <Card.Header>
            <h3 className="text-lg font-bold">{b.title}</h3>
          </Card.Header>
          <Card.Content>
            <p>By: {b.author}</p>
            <p>Published: {new Date(b.publishedAt).toLocaleDateString()}</p>
          </Card.Content>
        </Card>
      ))}
    </div>
  )
}
```

## 7. Hook it into your route

Add a new route file **`src/routes/_authenticated/books.tsx`**:

```ts
import { createFileRoute } from '@tanstack/react-router'
import { BooksList } from '@/components/BooksList/BooksList'

export const Route = createFileRoute('/_authenticated/books/')({
  component: BooksList,
})
```

And update your sidebar navigation in **`src/components/layout/data/sidebar-data.ts`**:

```ts
{
  title: 'Books',
  url: '/books',
  icon: IconBook,  // import your icon
}
```

## 8. Environment & launch

1. Ensure **`.env`** has `VITE_API_BASE_URL` pointing to your backend.
2. Restart dev server:

   ```bash
   pnpm install
   pnpm run dev
   ```
3. Log in, then navigate to **`/books`** to see your new BooksList in action.

---
## Adding a "Create Book" Flow
---

## 1. Endpoint constant

**File:** `src/constants/endpoints.ts`

```ts
export const ENDPOINTS = {
  …,
  GET_BOOKS: 'getBooks',
  CREATE_BOOK: 'createBook',     // ← new
} as const
```

## 2. Request & response types

**File:** `src/types/book.ts`

```ts
export interface Book {
  id: string
  title: string
  author: string
  publishedAt: string
}

export interface CreateBookPayload {
  title: string
  author: string
  publishedAt: string
}

export interface CreateBookResponse {
  message: string
  data: Book
}
```

## 3. API config

**File:** `src/config/api.ts`

```ts
import { ENDPOINTS } from '@/constants/endpoints'

export const apiConfig = {
  baseUrl: import.meta.env.VITE_API_BASE_URL!,
  endpoints: {
    …,
    [ENDPOINTS.CREATE_BOOK]: '/books',
  },
  defaultHeaders: { 'Content-Type': 'application/json' },
  timeoutMs: 10000,
}
```

> *Note:* we use the same `/books` path but distinguish by HTTP method.

## 4. Store slice (Zustand)

**File:** `src/store/books.ts`

```ts
interface BooksState {
  …,
  createStatus: 'idle'|'loading'|'error'
  createError?: string
  createBook: (payload: CreateBookPayload) => Promise<Book>
}

export const useBooksStore = create<BooksState>((set) => ({
  …,
  createStatus: 'idle',
  createBook: async (payload) => {
    set({ createStatus: 'loading', createError: undefined })
    try {
      const res = await apiClient.request<CreateBookResponse>({
        endpointKey: ENDPOINTS.CREATE_BOOK,
        method: 'POST',
        body: payload,
      })
      // optionally insert into list:
      set((s) => ({ books: [res.data, ...s.books], createStatus: 'idle' }))
      return res.data
    } catch (err: any) {
      set({ createStatus: 'error', createError: err.message })
      throw err
    }
  },
}))
```

## 5. Custom hook

**File:** `src/hooks/useCreateBook.ts`

```ts
import { useBooksStore } from '@/store/books'
import type { CreateBookPayload, Book } from '@/types/book'

export function useCreateBook() {
  const { createBook, createStatus, createError } = useBooksStore()
  return { createBook, createStatus, createError }
}
```

## 6. UI component

**Folder & file:** `src/components/CreateBookForm/index.tsx`

```tsx
import { useState } from 'react'
import { useCreateBook } from '@/hooks/useCreateBook'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function CreateBookForm() {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [publishedAt, setPublishedAt] = useState('')
  const { createBook, createStatus, createError } = useCreateBook()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createBook({ title, author, publishedAt })
    // reset or navigate away...
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input 
        label="Title" 
        value={title} 
        onChange={(e) => setTitle(e.target.value)} 
      />
      <Input 
        label="Author" 
        value={author} 
        onChange={(e) => setAuthor(e.target.value)} 
      />
      <Input 
        label="Published At" 
        type="date"
        value={publishedAt} 
        onChange={(e) => setPublishedAt(e.target.value)} 
      />
      {createError && <div className="text-red-600">{createError}</div>}
      <Button type="submit" disabled={createStatus === 'loading'}>
        {createStatus === 'loading' ? 'Creating…' : 'Create Book'}
      </Button>
    </form>
  )
}
```

## 7. Route mounting

**File:** `src/routes/_authenticated/create-book.tsx`

```ts
import { createFileRoute } from '@tanstack/react-router'
import { CreateBookForm } from '@/components/CreateBookForm'

export const Route = createFileRoute('/_authenticated/create-book/')({
  component: CreateBookForm,
})
```

And add to your sidebar:

```ts
// src/components/layout/data/sidebar-data.ts
{
  title: 'Create Book',
  url: '/create-book',
  icon: IconPlus,  // or your chosen icon
}
```

---

### Folder & file naming summary

```
src/
├─ components/
│  └─ CreateBookForm/
│     └─ index.tsx               ← form UI component
├─ hooks/
│  └─ useCreateBook.ts          ← mutation hook
├─ store/
│  └─ books.ts                  ← slice with createBook()
├─ types/
│  └─ book.ts                   ← CreateBookPayload & CreateBookResponse
├─ routes/
│  └─ _authenticated/
│     └─ create-book.tsx        ← mounts at /create-book
└─ constants/
   └─ endpoints.ts              ← CREATE_BOOK
```

---
