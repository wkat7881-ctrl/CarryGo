# CarryGo — Agent Instructions

CarryGo is a peer-to-peer luggage carry app connecting international travelers with people who need items shipped between cities.

## Project structure

```
/
├── app/              — React + Vite frontend (main codebase)
│   ├── src/
│   │   ├── pages/        — one file per route
│   │   ├── components/   — ui/, layout/, features/
│   │   ├── contexts/     — React context providers
│   │   └── utils/        — shared utilities
│   └── .agents/skills/   — Matt Pocock engineering skills
├── prototype/        — original HTML prototype (reference only, do not modify)
└── docs/
    ├── agents/       — agent configuration files
    └── adr/          — architecture decision records
```

## Agent skills

### Issue tracker

Issues live in GitHub Issues on **wkat7881-ctrl/CarryGo**. Use `gh issue` commands. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repo. Read `CONTEXT.md` at the root and `docs/adr/` before working in any feature area. See `docs/agents/domain.md`.

## Key constraints

- **Functionality is frozen** — do not change routes, components, data flow, or business logic without explicit instruction.
- **Language rules** — all user-facing UI text in Simplified Chinese; all source code (variables, functions, files, comments) in English.
- **Brand** — primary color purple `#6D5EF5`; white background; black CTA buttons (`#0D0D0D`).
- **Prototype is the source of truth** — all pages must match `prototype/*.html` in terms of screens and user flows.
