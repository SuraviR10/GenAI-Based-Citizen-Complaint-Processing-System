# CivicConnect AI — Database Setup Guide

This folder contains the complete PostgreSQL database schema and optional reference seed data for **CivicConnect AI**.

---

## 1. Fast Setup in Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) and select your project.
2. Open the **SQL Editor** from the left navigation.
3. Open [`schema.sql`](./schema.sql), copy all content, paste it into the Supabase SQL editor, and click **RUN**.
4. *(Optional)* Open [`seed.sql`](./seed.sql), copy the content, paste it into the SQL editor, and click **RUN** to populate reference civic issues and timeline records.

---

## 2. Supabase Storage Setup

The `schema.sql` script automatically creates and configures the `evidence-files` bucket with public read access and authenticated upload permissions.

To verify in Supabase Studio:
1. Open **Storage** in the left menu.
2. Verify that the **`evidence-files`** bucket is present and marked as **Public**.

---

## 3. Database Architecture Overview

| Table | Purpose | Citizen RLS Permissions |
| :--- | :--- | :--- |
| `profiles` | User profiles with language, area, role | Read all profiles, Update own profile |
| `civic_issues` | Consolidated public community problems | Read all, Create new via complaint flow |
| `complaints` | Citizen-submitted individual complaints | Read own / linked, Create own, Update if pending |
| `issue_support` | Citizen upvotes / backing (`UNIQUE(issue_id, citizen_id)`) | Read all, Insert own, Delete own |
| `evidence` | Uploaded photos & media metadata | Read all, Insert own, Delete own |
| `issue_updates` | Official status progression & timeline | Read all |
| `assignments` | Field worker allocations | Read all |
| `responses` | Corporation official + AI-simplified responses | Read all |
| `notifications` | Personal alerts & issue progress notifications | Read own, Update read status |

---

## 4. Auth & User Trigger

When a citizen signs up via Supabase Auth:
- The PostgreSQL trigger `handle_new_user()` automatically creates a row in `public.profiles` with the citizen's `full_name`, `role` (default: `'citizen'`), `preferred_language`, and `area`.
