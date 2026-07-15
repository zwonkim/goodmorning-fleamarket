# Technical Specification

## Stack

-   Next.js (App Router)
-   TypeScript
-   Tailwind CSS
-   shadcn/ui
-   Supabase
-   Vercel

## Folder Structure

app/ components/ common/ ui/ product/ comment/ lib/ hooks/ types/

## Rules

-   Server Components by default
-   Client Components only when necessary
-   Shared UI goes into common/ui
-   Avoid duplicated implementations
-   Prefer reusable components
