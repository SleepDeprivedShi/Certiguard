# CertiGuard Frontend Plan

## Overview
Frontend for CertiGuard AI Auditor - Phase 7 Dashboard & Human Review UI

## Tech Stack
- React 18 + TypeScript
- Tailwind CSS
- Vite
- React Router
- Axios

## File Structure
```
certiguard-frontend/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── types/
│   │   └── api.ts
│   ├── hooks/
│   │   └── useApi.ts
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── ReviewQueue.tsx
│   │   ├── SideBySide.tsx
│   │   └── ReportViewer.tsx
│   ├── components/
│   │   ├── Sidebar.tsx
│   │   ├── BidderCard.tsx
│   │   ├── CriterionResult.tsx
│   │   ├── OverrideModal.tsx
│   │   ├── YellowFlagBadge.tsx
│   │   └── BBoxOverlay.tsx
│   └── constants/
│       └── config.ts
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.ts
```

## API Endpoints
| Method | Endpoint | For |
|--------|----------|-----|
| GET | /review/queue?tender_id= | Review queue |
| GET | /review/criterion/{id} | Criterion detail |
| POST | /override/apply | Officer override |
| GET | /report/generate | Report preview |
| GET | /report/download/{format} | Export |

## Pages
1. Dashboard - Overview stats, tender list
2. ReviewQueue - NEEDS_REVIEW bidders with filters
3. SideBySide - AI reasoning | source PDF
4. ReportViewer - Final report preview + export