
# ManageSpace Frontend — Documentation

**Author:** Haidar Ali Fawwaz Nasirodin  
**Organization:** Global Darussalam Academy  
**Built for:** Rohis GDA (adaptable for any organization)  
**License:** MIT © 2026 Dadarzz  

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Architecture Overview](#architecture-overview)
4. [Project Structure](#project-structure)
5. [Pages & Routes](#pages--routes)
6. [Key Components](#key-components)
7. [Authentication Flow](#authentication-flow)
8. [Role-Aware UI](#role-aware-ui)
9. [AI Chat Widget](#ai-chat-widget)
10. [Theming & Styling](#theming--styling)
11. [Environment Variables](#environment-variables)
12. [Getting Started](#getting-started)
13. [Deployment](#deployment)
14. [Adapting for Your Organization](#adapting-for-your-organization)

---

## Project Overview

This is the React frontend for ManageSpace. It provides a clean, role-aware dashboard UI for managing members, sessions, attendance, meeting notes, duty rosters, and an AI assistant. It was originally scaffolded using Lovable AI and then extensively customized, extended, and refactored manually.

The frontend communicates exclusively with the ManageSpace Flask backend via a REST API and is designed to be deployed as a static site on Vercel or Netlify.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS + CSS variables (HSL theming) |
| UI Components | shadcn/ui (Radix primitives) |
| Routing | React Router v6 |
| Data Fetching | TanStack Query v5 |
| Rich Text Editor | React Quill |
| Charts | Recharts |
| Icons | Lucide React |
| Fonts | Plus Jakarta Sans (body) + Space Grotesk (headings) |
| Testing | Vitest + Testing Library |
| Deployment | Vercel / Netlify |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      React App                          │
│                                                         │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐  │
│  │ AuthContext │   │React Router │   │TanStack     │  │
│  │(JWT, roles) │   │(Protected   │   │Query        │  │
│  │             │   │ Routes)     │   │(API cache)  │  │
│  └─────────────┘   └─────────────┘   └──────┬──────┘  │
│                                             │          │
│  ┌──────────────────────────────────────────▼──────┐  │
│  │                   API Layer                     │  │
│  │  client.ts → fetch wrapper + JWT header inject  │  │
│  │  auth.ts / members.ts / sessions.ts / ...       │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────┘
                               │ REST API
                    ┌──────────▼──────────┐
                    │  Flask Backend      │
                    └─────────────────────┘
```

All API calls go through `src/api/client.ts`, which handles JWT header injection and error normalization. Individual modules (`members.ts`, `sessions.ts`, etc.) export typed functions used by pages and components via TanStack Query hooks.

---

## Project Structure

```
src/
├── api/
│   ├── client.ts          # Fetch wrapper, JWT injection, error class
│   ├── auth.ts
│   ├── attendance.ts
│   ├── members.ts
│   ├── sessions.ts
│   ├── notulensi.ts
│   ├── pics.ts
│   ├── piket.ts
│   ├── profile.ts
│   └── misc.ts            # Feed, calendar, chat
├── components/
│   ├── AppLayout.tsx      # Sidebar + top bar shell
│   ├── ChatWidget.tsx     # Floating AI assistant bubble
│   ├── ProtectedRoute.tsx
│   └── ui/                # shadcn/ui components
├── contexts/
│   └── AuthContext.tsx    # Auth state, login/logout, role flags
├── hooks/
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── lib/
│   └── utils.ts           # cn() helper
├── pages/                 # One file per route
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Members.tsx
│   ├── Sessions.tsx
│   ├── SessionAttendance.tsx
│   ├── AttendanceHistory.tsx
│   ├── NotulensiList.tsx
│   ├── NotulensiEditor.tsx
│   ├── Pics.tsx
│   ├── Piket.tsx
│   ├── PiketLogs.tsx
│   ├── CalendarPage.tsx
│   ├── Profile.tsx
│   ├── ChangePassword.tsx
│   └── NotFound.tsx
├── types/
│   └── index.ts           # Shared TypeScript interfaces
├── App.tsx                # Route definitions
├── index.css              # Tailwind + CSS variables
└── main.tsx
```

---

## Pages & Routes

| Route | Page | Access |
|---|---|---|
| `/login` | Login.tsx | Public |
| `/change-password` | ChangePassword.tsx | Authenticated (force change) |
| `/` | Dashboard.tsx | Authenticated |
| `/member-list` | Members.tsx | Authenticated |
| `/sessions` | Sessions.tsx | Authenticated |
| `/sessions/:id/attendance` | SessionAttendance.tsx | Authenticated |
| `/attendance` | AttendanceHistory.tsx | Authenticated |
| `/notulensi` | NotulensiList.tsx | Authenticated |
| `/notulensi/:id` | NotulensiEditor.tsx | Authenticated |
| `/pics` | Pics.tsx | Core only |
| `/piket` | Piket.tsx | Authenticated |
| `/piket/logs` | PiketLogs.tsx | Authenticated |
| `/calendar` | CalendarPage.tsx | Authenticated |
| `/profile` | Profile.tsx | Authenticated |

All routes except `/login` are wrapped in `<ProtectedRoute>`, which redirects unauthenticated users to `/login`. Users with `force_password_change: true` are redirected to `/change-password` before accessing any other page.

---

## Key Components

### AppLayout.tsx
The main shell component containing the sidebar navigation and top bar. Renders the organization name, logo, user avatar, and nav links. Role-aware — admin/core-only nav items are conditionally shown based on `AuthContext`.

### ProtectedRoute.tsx
A wrapper component that checks authentication status from `AuthContext`. Redirects to `/login` if unauthenticated, or to `/change-password` if the user needs to reset their password.

### ChatWidget.tsx
A floating AI assistant bubble fixed to the bottom-right corner of the screen. Opens a chat window that sends messages to `/api/chat` and handles `navigate` actions returned by the backend — automatically redirecting the user to the relevant page when the AI instructs it.

---

## Authentication Flow

```
User visits app
      │
      ▼
ProtectedRoute checks AuthContext
      │
      ├── Not authenticated → redirect to /login
      │
      └── Authenticated
            │
            ├── force_password_change: true → redirect to /change-password
            │
            └── Normal → render page
```

On login, the JWT is stored in `localStorage` and attached to all subsequent API requests via the fetch wrapper in `client.ts`. On app load, `/api/auth/me` is called to validate the token and restore session state.

---

## Role-Aware UI

Roles are defined as: `admin`, `ketua`, `pembina`, `member`.

`AuthContext` exposes two derived boolean flags used throughout the UI:

```typescript
const isCore = ["admin", "ketua", "pembina"].includes(user?.role);
const isAdmin = user?.role === "admin";
```

These flags control:
- Visibility of add/delete/edit buttons on Members, Sessions, Pics pages
- Access to the Pics (Divisions) management page
- Ability to lock sessions
- Display of admin-only controls in the attendance view

---

## AI Chat Widget

The chat widget sends the full conversation history to `/api/chat` on each message to maintain context across turns. The backend response may include an optional `navigate` field:

```typescript
// Example API response
{
  reply: "Here's how to mark attendance...",
  navigate: "/sessions"  // optional
}
```

When a `navigate` value is present, the widget uses React Router's `useNavigate` hook to redirect the user automatically after displaying the reply.

---

## Theming & Styling

All colors are defined as **HSL CSS variables** in `src/index.css`. The dark mode variant is also defined there using the `.dark` class selector.

Key variables:

```css
:root {
  --primary: 160 84% 28%;          /* Dark green brand color */
  --primary-foreground: 0 0% 100%;
  --accent: 38 92% 50%;            /* Amber/gold accent */
  --sidebar-background: 160 30% 10%;
  --sidebar-primary: 160 84% 45%;
  --sidebar-accent: 160 20% 18%;
}
```

Fonts are loaded from Google Fonts:
- **Plus Jakarta Sans** — body text
- **Space Grotesk** — headings (`font-display` class)

Both are configured in `tailwind.config.ts` under `fontFamily.sans` and `fontFamily.display`.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | ✅ | Base URL of the ManageSpace backend. No trailing slash. |

Example `.env`:

```env
VITE_API_URL=http://localhost:5000
```

For production:

```env
VITE_API_URL=https://your-api.onrender.com
```

---

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd managespace-frontend
npm install
```

### 2. Configure environment

```env
VITE_API_URL=http://localhost:5000
```

### 3. Start dev server

```bash
npm run dev
# Runs on http://localhost:8080
```

### 4. Build for production

```bash
npm run build
# Output: dist/
```

---

## Deployment

### Vercel (recommended)
1. Push to GitHub and import the repo on vercel.com
2. Set `VITE_API_URL` in Vercel project settings
3. Vercel auto-detects Vite — build command: `npm run build`, output: `dist`
4. `vercel.json` handles SPA client-side routing rewrites

### Netlify
Same process — `netlify.toml` is pre-configured with the SPA redirect rule.

---

## Adapting for Your Organization

| File | What to change |
|---|---|
| `index.html` | Page title, meta description, OG tags |
| `public/logo.png` | Replace with your organization logo |
| `src/components/AppLayout.tsx` | Org name, subtitle, avatar color |
| `src/pages/Login.tsx` | Org name, subtitle, footer copyright |
| `src/pages/Dashboard.tsx` | Greeting text, org name |
| `src/components/ChatWidget.tsx` | Bot greeting message, widget header label |
| `src/contexts/AuthContext.tsx` | Core role definitions |
| `src/pages/Members.tsx` | Role dropdown values and labels |
| `src/pages/SessionAttendance.tsx` | Core member role filter |
| `src/pages/Sessions.tsx` | Session type labels |
| `src/pages/CalendarPage.tsx` | Calendar subtitle |
| `src/pages/Piket.tsx` | Reminder time and timezone label |
| `src/index.css` | Brand colors (HSL variables) |
| `tailwind.config.ts` | Font families |
