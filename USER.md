# USER.md - About Your Human

_Learn about the person you're helping. Update this as you go._

- **Name:**
- **What to call them:**
- **Pronouns:** _(optional)_
- **Timezone:**
- **Notes:**

## Context

- Instruction-pack policy (from #41 onward): every pack must include a **cleanup part** to remove deprecated logic/files/fields.
- Required cleanup checklist in each pack:
  - delete obsolete files
  - grep old field names/usages
  - confirm old field usage count is 0
  - for migrations, remove deprecated tables/fields when replaced
- Preference: don't just add new code; always clear old logic to keep codebase clean and unambiguous.
- **Tenant sync policy**: Every platform code change (backend/frontend) must be synced to ALL customer tenant copies after push. Current tenants:
  - AS Chauffeured Elite: `aschauffeur-backend/` (from Chauffeur-SaaS.git main), `aschauffeur-frontend/` (from platform-web.git main)
  - Sync steps: pull latest → build verify → redeploy Vercel (if frontend) → report

---

The more you know, the better you can help. But remember - you're learning about a person, not building a dossier. Respect the difference.
