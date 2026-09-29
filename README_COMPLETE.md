# ONDJO — Complete Property Market Prototype

Complete integrated prototype containing:

- Homepage
- Functional search + filters
- Property detail page
- Expandable responsive sidebar
- Clean original header **without the search bar**
- Login screen
- 4-step registration flow
- Client / Proprietor profile selection
- Mobile-first auth screens
- Accessibility focus states and reduced-motion support
- No additional dependencies

## Routes

- `#/`
- `#/pesquisar`
- `#/imovel/:id`
- `#/login`
- `#/cadastro`

## Registration flow

1. Profile: Client or Proprietor
2. Personal data + intent
3. Account credentials
4. Confirmation

## Run

```bash
npm install
npm run dev
```

Validation:

```bash
npm run typecheck
npm run build
```

Authentication is currently UI/prototype only. Connect forms to a real backend before production. Never store passwords in localStorage.
