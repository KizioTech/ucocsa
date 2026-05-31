# UCOCSA Website — Change Specification

## Overview

Three categories of changes: a new **Academic Year / Closure Status** system for the admin dashboard, a **Hymn verse/chorus formatting** fix, and several smaller quality-of-life improvements noticed during the review.

---

## 1. Academic Year / School Status System

### Problem

The website behaves as if UCOCSA is always active. When school is closed (semester break, holiday, end of year), services stop, but the site shows upcoming services, countdown timers, and program listings as if everything is running. Admins need a simple way to flag "we are closed" so the site reflects that honestly.

### Changes Required

#### 1.1 Admin Dashboard — Status Toggle Card

Add a prominent **"School Status"** card at the very top of `/admin` (before the stats grid). It should show:

- A large toggle switch: **Open** (green) / **Closed** (amber/red)
- A date field: **"Next semester opens"** (used in the public countdown and banner)
- An optional text field: **"Closure message"** (shown to visitors on the public site)
- A save button

The card should be visually distinct — use a warning-style border (`border: 2px solid var(--color-border-warning)`) when closed, and a success-style border when open.

**Where to store this:** Add a new `site_settings` table in Supabase with a single row:

```sql
CREATE TABLE public.site_settings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_open       BOOLEAN NOT NULL DEFAULT true,
  opens_at      DATE,
  closure_msg   TEXT,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Only admins can read/write. A single row, upserted on save.

#### 1.2 Admin Dashboard — Visual Indicator

When `is_open = false`, show a red alert banner at the top of the admin dashboard:

```
⚠ School is currently closed. Site is showing closure mode to visitors.
  Next opening: [date]. Edit in Site Status.
```

When `is_open = true`, show a small green badge next to the dashboard title: **● Active**.

#### 1.3 Public Site — Closure Banner

When `is_open = false`:

- Replace the announcement banner on the homepage with a **closure banner** in amber:
  ```
  🎓 UCOCSA is on semester break. We resume [date]. See you then!
  [custom closure_msg if set]
  ```
- Hide or replace the **CountdownTimer** (which counts to next service) with a countdown to `opens_at` instead, labelled "Semester Resumes".
- Optionally grey out or hide the **Programs / Service** section of the Events page with a notice: "Service programs will be published when the new semester begins."

#### 1.4 Navbar / Hero — Subtle Status Indicator

Consider a small pill in the navbar (desktop only, near the Hymns button):

- 🟢 `In Session` when open
- 🔴 `Break` when closed

This gives visitors an immediate understanding of the church's current activity.

---

## 2. Hymn Verse/Chorus Formatting Fix

### Problem

When a hymn is added (via admin `AdminHymns` or the member `Suggest` dialog in `/hymns`), the chorus separator convention (`\n \n` — a blank line with a single space) is not explained clearly and is not enforced. The result is that submitted hymns show all content as one long verse block with no visual chorus distinction.

The `renderVerse` function in `Hymns.tsx` correctly splits on `\n \n` to render a chorus, and the `PresentationOverlay` correctly detects a global chorus — but the input forms give no hint that this pattern exists, and new submissions come in as raw line breaks with no chorus separation.

### Changes Required

#### 2.1 `AdminHymns.tsx` — Verse Textarea: Inline Help + Visual Preview

Replace the plain `<textarea>` for each verse with a smarter editor that:

1. **Shows a helper tip** beneath each textarea:
   ```
   Tip: Separate the chorus from verse lyrics with a blank line.
   The chorus will be highlighted automatically.
   ```

2. **Adds a "Insert Chorus Break" button** per verse that inserts `\n \n` at the cursor position (matching the `insertAtCursor` pattern in `MarkdownEditor.tsx`).

3. **Shows a live mini-preview** below the textarea (toggled by a small "Preview" link) so the admin can see how the verse/chorus split will look before saving.

#### 2.2 Suggest Hymn Dialog (`Hymns.tsx`) — Improved Instructions

The `suggestForm.verses` textarea currently says:

> *"Lyrics — separate each verse with a blank line"*

Change to:

> *"Lyrics — separate each verse with a blank line. Within a verse, separate the chorus with a blank line too (the chorus will be styled differently)."*

Add a collapsible example beneath:

```
Example:
Verse lyrics here
Second line of verse

Chorus line one   ← blank line above = treated as chorus
Chorus line two
```

#### 2.3 `AdminHymns.tsx` — Pending Hymns Review: Chorus-Aware Preview

In the expandable row in the hymn table (`expandedId === hymn.id`), the current preview renders raw `whitespace-pre-line` text with no chorus distinction. Update it to use the same `renderVerse` function from the main hymn viewer so the admin sees exactly what will be published.

#### 2.4 Form Validation: Warn on Missing Separator

When the admin or member saves a hymn that has more than 8 lines in a verse but no `\n \n` separator, show a non-blocking warning toast:

```
Heads up: verse 1 has no chorus break. Is that correct?
Add a blank line to separate verse from chorus.
```

This catches common mistakes without blocking submission.

---

## 3. Other Quality-of-Life Improvements

### 3.1 `CountdownTimer.tsx` — Timezone Assumption

The timer calculates "next Sunday 8 AM" and "next Wednesday 6 PM" in local device time. For users in different timezones (diaspora, visitors), this is inaccurate. Fix by storing the timezone in `site_settings` (e.g. `"Africa/Blantyre"`) and using `Intl.DateTimeFormat` to compute the correct local church time regardless of the visitor's device timezone.

### 3.2 `AdminPrograms.tsx` — Unique Constraint Error

The `service_programs` table has `UNIQUE (service_type, service_date)`. If an admin tries to create a second program for the same date/type, Supabase returns a cryptic `duplicate key` error. Catch this specifically and show:

```
A program for [Sunday/MidWeek] on [date] already exists. 
Edit the existing one instead.
```

### 3.3 `SharePoster.tsx` — `url` Prop Missing Type Guard

When `url` is `null`, the share text contains the string `"null"`. Add a nullish coalescing guard:

```ts
const shareUrl = url ?? window.location.href;
```

This is already partially done but inconsistently applied. Audit all uses of `url` in the component.

### 3.4 `Hymns.tsx` — Missing `page_views` tracking

Every other page tracks page views via the `Layout` component. The Hymns page uses a custom layout (no `<Layout>` wrapper) so it never records visits. Add a `useEffect` that inserts a row into `page_views` with path `/hymns` on mount. This gives the admin dashboard accurate analytics for hymn page traffic.

### 3.5 `AdminDashboard.tsx` — Cleanup Tool is Destructive Without Feedback

The "Cleanup" button deletes past events and programs permanently. Currently the button just says "Cleaning…" with no indication of what was deleted or how many rows. After cleanup, show a toast with the count:

```
Cleanup complete: 3 events and 2 programs removed.
```

Requires using `.select()` before delete or reading the `count` from the delete response.

### 3.6 `NotificationBell.tsx` — `localStorage` Access on iOS/Private Mode

The component wraps `localStorage` calls in try/catch, which is good. But the warning silently fails — if `localStorage` is unavailable, `hasUnread` is never set and the bell never shows a dot even for fresh announcements. Add a fallback: if localStorage throws, treat every announcement as unread (conservative default).

### 3.7 `Messages.tsx` — `queryClient` Referenced But Not Imported

In the realtime subscription `useEffect`, the code references `queryClient.invalidateQueries(...)` inside the channel callback — but `queryClient` is not imported from `useQueryClient()` in that component. This would cause a runtime error when a new message arrives via realtime. Add:

```ts
const queryClient = useQueryClient();
```

at the top of the component (it's missing despite the import being partially set up).

---

## Summary Table

| # | Area | Type | Priority |
|---|------|------|----------|
| 1.1–1.4 | School open/closed status system | New feature | High |
| 2.1 | Admin hymn editor — chorus break button + preview | Enhancement | High |
| 2.2 | Suggest dialog — better chorus instructions | Enhancement | High |
| 2.3 | Admin hymn preview — chorus-aware rendering | Enhancement | Medium |
| 2.4 | Chorus break validation warning | Enhancement | Medium |
| 3.1 | CountdownTimer timezone fix | Bug | Medium |
| 3.2 | AdminPrograms duplicate key error message | Bug | Medium |
| 3.3 | SharePoster null URL guard | Bug | Low |
| 3.4 | Hymns page analytics tracking | Enhancement | Low |
| 3.5 | Cleanup tool feedback with row count | Enhancement | Low |
| 3.6 | NotificationBell localStorage fallback | Bug | Low |
| 3.7 | Messages.tsx missing queryClient | Bug | High |
