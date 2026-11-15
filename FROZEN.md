# Frozen Public Site Registry (`FROZEN.md`)

*Policy: Hard Rule 1 — FROZEN PUBLIC SITE*  
*Enforcement: `frozen-files.sha256` and `scripts/check-frozen.sh`*  

---

## 1. Scope & Frozen Guarantee

In strict compliance with **Hard Rule 1**, the public marketing site of TerraTills is **completely frozen**. No engineering task, refactoring, package upgrade, or backend integration is permitted to edit, move, rename, reformat, or delete any of the files listed below.

If any task appears to require touching a frozen file, engineering must **stop and request explicit owner authorization**.

---

## 2. Frozen Files Inventory

The following 8 files comprise the frozen public site and its visual presentation:

| # | File Path | Sha256 Checksum | Purpose / Description |
| :-: | :--- | :--- | :--- |
| **1** | `src/pages/public/LandingPage.jsx` | `7f9860d5b224c9e4a335e45f5b77cc8b04cfed74ec6cf0529111c74fe0057c03` | Public root `/` showcase page. Contains hero with botanical animations, 4-card service slider, scale metrics, operational framework, and CTA banner. |
| **2** | `src/pages/public/AboutPage.jsx` | `01691d05301dfbee6661c4971aefa74b9cf3a974ffb0e8078f02059f5c35189c` | Public `/about` narrative on agricultural deficit and 4 architecture integrity pillars. |
| **3** | `src/pages/public/ServicesPage.jsx` | `ae8092310ecc01e8f29f468a2454d2d0e18f6c2bd4c6d956348c4c14e4be5672` | Public `/services` directory breakdown of 4 verticals with benchmark rates and verification rules. |
| **4** | `src/pages/public/PricingPage.jsx` | `58293a70035180f7730c08a2dd0ad71d08173e51fd471aae82aab2ac1fa1b2c3` | Public `/pricing` breakdown of 0% customer fee, 5% provider commission, and Bach settlement rails. |
| **5** | `src/pages/public/ContactPage.jsx` | `87ab471331688018a098475436450a6e462a29171eac588d017579f3926a2369` | Public `/contact` page with regional field desk hubs and inquiry form. |
| **6** | `src/components/public/LandingNavbar.jsx` | `5dbc4252ef1a5b136c4ca963e9c59c25469432cbf9057d0ee4e7c553e55a657c` | Public navigation header featuring starburst logo, center floating pill nav, and Login / Sign Up buttons. |
| **7** | `src/components/public/LandingFooter.jsx` | `9b6a71dd2090dbda2d6771719ffd33cba84b91d76d41abcc2b46e82cb47fd66d` | Public institutional footer in Deep Teal `#003D37` with regional hubs, links, and compliance badges. |
| **8** | `src/index.css` | `cea0f7889d7ca75c85f17133b6a6efd563df96ed189d844eec636224132ee536` | Core stylesheet defining color hierarchy (`#003D37`, `#FFC900`, `#FFFFFF`, `#E4EFDF`, `#559B45`, `#10271B`), typography tokens, and organic floating keyframe animations. |

---

## 3. Verification Script & CI Integration

The integrity of all frozen files is verified via `scripts/check-frozen.sh` and matched against `frozen-files.sha256`:

```bash
# Verify checksums at any time:
./scripts/check-frozen.sh

# Or using sha256sum directly:
sha256sum -c frozen-files.sha256
```

### Git Hook & CI Guard
`scripts/check-frozen.sh` is executed:
1. In the pre-commit hook before every commit.
2. In the GitHub Actions CI workflow on every pull request and push to `main` and `feat/backend-mvp`.
3. Any alteration or mismatch triggers an immediate process failure with exit code 1.

---

## 4. Architectural Rules for Changes Outside the Public Site

1. **No Shared Component Mutations:** If an authenticated dashboard view or admin view requires altered behavior in a component shared with public pages, engineers must create a separate component (e.g. `src/components/DashboardNavbar.jsx` or `src/admin/components/AdminHeader.jsx`) rather than modifying a frozen component.
2. **Global CSS Isolation:** Any new styles required for the admin console or authenticated features must be declared in dedicated scoped files (e.g. `src/admin/admin.css`) or using inline Tailwind utility classes. `src/index.css` remains immutable.
3. **Unverified Public Statistics:** Any unverified business figures present in the frozen pages are strictly logged in `STATUS.md` and will be updated by the platform owner under separate authority.
