### General Style

- Prettier on save with shared .prettierrc.
- ESLint + TS strict: no any, noUnusedVars, etc.
- Import only what you need; keep code focused.

### Avoid Primitive obsession

- Create custom simple wrappers for types like YandexCode, RouteId etc

### TypeScript

- strict mode. Explicit return types on exports.
- Use type for unions/aliases, interface for objects.
- No non-null assertions (!); handle undefined.
- Apply `Result<T, E>` pattern for errors.

### Frontend (React)

- Functional components with hooks.
- React Query for data fetching; Zustand for UI state.
- React Hook Form + Zod for forms.
- Wrap Leaflet logic in custom hooks.
- Prefer Ant Design components over custom CSS.

### Data Validation

- Use Zod at module boundaries (API, forms).
- Trust validated data downstream; avoid revalidation.

### Error Handling

- Functions return `Promise<Result<…>>`, not throw.
- throw/catch only for unrecoverable or global errors.
- Error pattern in UI: `if (!res.success) showError(res.error)`.

### Backend (Express + Prisma)

- Zod DTOs for request/response schemas.
- Prisma models + migrations in Git.
- Wrap external calls in Axios utils.
- Maintain Swagger/OpenAPI docs.
- Use global error handler to format Result.

### Best Practices

- Pure functions, DRY, SRP, YAGNI, KISS.
