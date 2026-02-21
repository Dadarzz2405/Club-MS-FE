# ManageSpace — Frontend

The React frontend for ManageSpace. A clean, role-aware dashboard UI for managing members, sessions, attendance, meeting notes, duty rosters, and an AI assistant chat widget. Built to pair with the ManageSpace Flask backend.

> This frontend was originally built for a school Islamic organization (Rohis/Darsanian GDA). The organization-specific content is isolated to a small set of files and strings — see [Adapting for Your Organization](#adapting-for-your-organization).

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Adapting for Your Organization](#adapting-for-your-organization)
- [Deployment](#deployment)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS + CSS variables (HSL theming) |
| UI Components | shadcn/ui (Radix primitives) |
| Routing | React Router v6 |
| Data fetching | TanStack Query v5 |
| Rich text editor | React Quill |
| Charts | Recharts |
| Icons | Lucide React |
| Fonts | Plus Jakarta Sans (body) + Space Grotesk (headings) |
| Testing | Vitest + Testing Library |
| Deployment | Vercel (or Netlify — both configs included) |

---

## Features

- **JWT auth** — login, token stored in `localStorage`, auto-refresh via `/api/auth/me`
- **Protected routes** — redirects unauthenticated users to `/login`
- **Force password change** — first-login users are redirected to `/change-password` before accessing the app
- **Role-aware UI** — admin/core-only controls are conditionally rendered based on the user's role
- **Members** — list, search, filter by role, add/batch-add/delete, assign roles, assign PICs, toggle attendance permission
- **Sessions** — create, lock, delete, assign PICs, filter by type
- **Attendance** — mark per session (regular + core), export to `.docx`
- **Attendance history** — per-member view with summary stats
- **Meeting notes (Notulensi)** — rich text editor with autosave, Ctrl+S, unsaved-change warning
- **PICs / Divisions** — create, delete, member badge display
- **Piket (duty roster)** — weekly schedule grid, edit assignments, test email reminder
- **Calendar** — month grid + event list, session and holiday overlays
- **AI chat widget** — floating bubble, sends messages to `/api/chat`, handles navigate actions
- **Profile** — avatar upload, password change
- **Dark mode** — full CSS variable theming, dark variant defined in `src/index.css`

---

## Project Structure

```
├── public/
│   ├── logo.png             # App logo — replace with your own
│   └── robots.txt
├── src/
│   ├── api/                 # API client and per-resource modules
│   │   ├── client.ts        # Fetch wrapper, JWT header injection, error class
│   │   ├── auth.ts
│   │   ├── attendance.ts
│   │   ├── members.ts
│   │   ├── sessions.ts
│   │   ├── notulensi.ts
│   │   ├── pics.ts
│   │   ├── piket.ts
│   │   ├── profile.ts
│   │   └── misc.ts          # Feed, calendar, chat
│   ├── components/
│   │   ├── AppLayout.tsx    # Sidebar + top bar shell
│   │   ├── ChatWidget.tsx   # Floating AI assistant bubble
│   │   ├── ProtectedRoute.tsx
│   │   └── ui/              # shadcn/ui components (auto-generated, don't edit)
│   ├── contexts/
│   │   └── AuthContext.tsx  # Auth state, login/logout, role flags
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── lib/
│   │   └── utils.ts         # cn() helper
│   ├── pages/               # One file per route
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Members.tsx
│   │   ├── Sessions.tsx
│   │   ├── SessionAttendance.tsx
│   │   ├── AttendanceHistory.tsx
│   │   ├── NotulensiList.tsx
│   │   ├── NotulensiEditor.tsx
│   │   ├── Pics.tsx
│   │   ├── Piket.tsx
│   │   ├── PiketLogs.tsx
│   │   ├── CalendarPage.tsx
│   │   ├── Profile.tsx
│   │   ├── ChangePassword.tsx
│   │   └── NotFound.tsx
│   ├── types/
│   │   └── index.ts         # Shared TypeScript interfaces
│   ├── App.tsx              # Route definitions
│   ├── index.css            # Tailwind + CSS variables (theming lives here)
│   └── main.tsx
├── .env                     # Local environment config
├── index.html               # Page title, meta tags, OG tags
├── tailwind.config.ts       # Colors, fonts, animations
├── vercel.json              # SPA rewrite rule for Vercel
└── netlify.toml             # SPA rewrite rule for Netlify
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

Create a `.env` file at the project root:

```env
VITE_API_URL=http://localhost:5000
```

Point this at wherever your ManageSpace backend is running. For production, replace with your deployed backend URL (e.g. `https://your-api.onrender.com`).

### 3. Start the dev server

```bash
npm run dev
```

The app runs on `http://localhost:8080` by default.

### 4. Build for production

```bash
npm run build
```

Output goes to `dist/`.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | ✅ | Base URL of the ManageSpace backend. No trailing slash. |

That's the only env variable. Everything else is configured in code.

---

## Adapting for Your Organization

The codebase has a small set of organization-specific strings spread across a few files. Here's exactly where they all live.

---

### 1. Page title, description, and social meta tags

**`index.html`**

```html
<!-- Line 6: Browser tab title -->
<title>ManageSpace —Rohis</title>
<!-- ↑ Change to your app name, e.g. "ManageSpace — Student Council" -->

<!-- Lines 8–9: SEO meta -->
<meta name="description" content="Rohis Management System - Global Darussalam Academy" />
<meta name="author" content="Global Darussalam Academy" />

<!-- Lines 11–15: Open Graph (link previews on Slack, WhatsApp, etc.) -->
<meta property="og:title" content="Islamic Leadership Organization - GDA" />
<meta property="og:description" content="Rohis Management System - Global Darussalam Academy" />

<!-- ↑ Update all of these to reflect your organization name -->
```

---

### 2. App logo

Replace `public/logo.png` with your own logo. It's used in three places:

- Browser tab favicon (`index.html` line 5)
- Sidebar header (`src/components/AppLayout.tsx`)
- Login page logo (`src/pages/Login.tsx`)

The image is referenced as `/logo.png` in all three — just swap the file and you're done. Recommended size: 128×128px or larger (it's displayed at 36–64px but higher resolution looks sharper on retina screens).

---

### 3. Sidebar organization name and subtitle

**`src/components/AppLayout.tsx`**

```tsx
// The logo section in the sidebar (around line 68–75)
<h1 className="font-display text-xs font-bold ...">Darsanian Rohis</h1>
// ↑ Change to your organization's short name

<p className="text-[10px] ...">Global Darussalam Academy</p>
// ↑ Change to your organization's full name or tagline

// Avatar fallback color and alt text (line 98)
src={`https://ui-avatars.com/api/?name=...&background=1a7a5c&color=fff`}
// ↑ The hex "1a7a5c" is the green avatar background color — change to match your brand
```

---

### 4. Login page branding

**`src/pages/Login.tsx`**

```tsx
// Organization name displayed above the login card (around line 55–58)
<h1 className="...">Darsanian Rohis</h1>
// ↑ Your organization name

<p className="...">Global Darussalam Academy · Management System</p>
// ↑ Your org's full name and system subtitle

// Footer copyright line (last line of the return block)
<p>© {new Date().getFullYear()} Darsanian Rohis. All rights reserved.</p>
// ↑ Update with your organization's name
```

---

### 5. Dashboard greeting and description

**`src/pages/Dashboard.tsx`**

```tsx
// Line ~87: Welcome message
<h1 className="page-title">Assalamu'alaikum, {user?.name} 👋</h1>
// ↑ Change the greeting — "Assalamu'alaikum" is an Islamic greeting.
//   Change to "Welcome" or anything appropriate for your org.

<p className="page-description">Welcome to the Darsanian Rohis dashboard</p>
// ↑ Change to your org name
```

---

### 6. AI chat widget greeting and persona

**`src/components/ChatWidget.tsx`**

```tsx
// Line 22: Initial bot message shown when the chat opens
{ role: "bot", text: "Assalamu'alaikum! I'm here to help with Islamic education and system navigation. Ask me anything!" }
// ↑ Replace with a greeting appropriate for your org/assistant persona

// Line 58: Chat window header label
<span className="font-semibold text-sm">Rohis Assistant</span>
// ↑ Change to e.g. "ManageSpace Assistant" or your org name
```

---

### 7. Member roles in the UI

The app hardcodes four role values in several places: `admin`, `ketua`, `pembina`, `member`. If you rename roles on the backend, update these to match.

**`src/contexts/AuthContext.tsx`**

```tsx
// Line ~58: Which roles count as "core" (affects UI visibility of admin controls)
const isCore = ["admin", "ketua", "pembina"].includes(user?.role || "");
// ↑ Update this list to your leadership roles
```

**`src/pages/Members.tsx`** — role `<Select>` dropdowns (~lines 157, 204, 233)

```tsx
<SelectItem value="member">Member</SelectItem>
<SelectItem value="pembina">Pembina</SelectItem>
<SelectItem value="ketua">Ketua</SelectItem>
<SelectItem value="admin">Admin</SelectItem>
// ↑ Rename or replace these to match your org's role names
```

**`src/pages/SessionAttendance.tsx`**

```tsx
// Line ~154: Which roles are treated as "core team" in attendance
const coreMembers = members.filter(m => ["admin", "ketua", "pembina"].includes(m.role));
// ↑ Update to match your leadership roles
```

**`src/types/index.ts`**

```tsx
// Line 5: The TypeScript union type for roles
role: "admin" | "ketua" | "pembina" | "member";
// ↑ Add or rename values to match your backend roles
```

---

### 8. Session types in the UI

Sessions support three types: `all`, `core`, `event`. The labels shown in the UI are defined in `src/pages/Sessions.tsx`:

```tsx
// Around line ~135: Human-readable labels
const typeLabel = (t: string) => {
  switch (t) {
    case "all":   return "All Members";
    case "core":  return "Core Only";
    case "event": return "Event";
  }
};
// ↑ Change the return strings to whatever labels make sense for your org
```

The `<SelectItem>` options (~lines 170–175 and 220–224) use the same values and labels — update both.

---

### 9. Calendar description

**`src/pages/CalendarPage.tsx`**

```tsx
// Line ~53: Subtitle under "Calendar" heading
<p className="page-description">Sessions and Islamic holidays</p>
// ↑ Change "Islamic holidays" to whatever your calendar shows, or remove it
```

---

### 10. Piket schedule description

**`src/pages/Piket.tsx`**

```tsx
// Line ~78: Subtitle shown on the Piket page
<p className="page-description">Weekly duty roster • Reminders sent at 06:00 WIB</p>
// ↑ Change "06:00 WIB" to your actual reminder time and timezone
```

---

### 11. Color theme

All colors are defined as HSL CSS variables in **`src/index.css`**. You only need to change the `:root` block — the dark mode variant follows the same structure.

The key values to update for rebranding:

```css
:root {
  /* Primary brand color — currently a dark green */
  --primary: 160 84% 28%;
  --primary-foreground: 0 0% 100%;

  /* Accent color — currently amber/gold */
  --accent: 38 92% 50%;

  /* Sidebar background — currently very dark green */
  --sidebar-background: 160 30% 10%;
  --sidebar-primary: 160 84% 45%;
  --sidebar-accent: 160 20% 18%;
}
```

To use a different brand color, pick an HSL hue and update the `160` values throughout the `:root` block. For example, switching to blue (`220`):

```css
--primary: 220 84% 35%;
--sidebar-background: 220 30% 10%;
--sidebar-primary: 220 84% 50%;
```

There's also an avatar fallback color hardcoded as `#1a7a5c` (green) in `AppLayout.tsx` and `Members.tsx` — search for that hex value and replace it with your brand color.

---

### 12. Fonts

The app uses **Plus Jakarta Sans** (body) and **Space Grotesk** (headings), loaded from Google Fonts in `src/index.css` line 1. To change fonts, replace the `@import` URL and update the font family names in:

- `src/index.css` — `font-family` in `body` and `h1–h6` rules
- `tailwind.config.ts` — the `fontFamily.sans` and `fontFamily.display` values

---

## Deployment

### Vercel (recommended)

1. Push to GitHub and import the repo in [vercel.com](https://vercel.com).
2. Set the `VITE_API_URL` environment variable in Vercel project settings.
3. Vercel auto-detects Vite. Build command: `npm run build`, output: `dist`.
4. The `vercel.json` rewrite rule handles client-side routing.

### Netlify

Same steps — `netlify.toml` is already configured with the SPA redirect rule.

### Manual / other hosts

Build with `npm run build`, then serve the `dist/` folder as a static site. Make sure your host is configured to serve `index.html` for all routes (required for React Router to work).

---

## License

MIT © 2026 Dadarzz