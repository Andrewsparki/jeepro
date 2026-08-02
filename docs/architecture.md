# Architecture

## Feature-Sliced Design
JEE Pro uses a modified Feature-Sliced Design pattern.
Instead of sorting files by type (e.g., all components together, all hooks together), we group files by feature/domain.

### Structure
```
features/
├── auth/
│   ├── components/
│   ├── contexts/
│   ├── hooks/
│   └── services/
├── dashboard/
├── profile/
└── study/
```

### Global Folders
- `components/ui/`: shadcn/ui components
- `components/layout/`: App shells, Sidebars, Navbars
- `components/shared/`: Generic components (Logo, Empty States)
- `lib/`: Utils, Supabase clients
- `constants/`: Global configs and data
- `types/`: Global TS definitions
