# 📄 Feature Specification (v2): Before & After Media System + Public Gallery

**Feature:** Private Media Vault + Public Before/After Gallery  
**Version:** 2.0  
**Last Updated:** 2026-04-25  
**Status:** Specification (Extended)

---

## 1. 🎯 Key Change in v2

This version separates the system into two distinct layers:

### 1. Private Media Vault
- Visible only to the specific client
- Linked to bookings
- Contains all treatment media

### 2. Public Gallery
- Visible to all users (even بدون لاگین)
- Only includes media with explicit publication consent
- Fully anonymized

---

## 2. 🧩 Conceptual Architecture


MediaItem
├── Private (default)
└── Public (isPublic = true)
└── Visible in Gallery


---

## 3. 👤 User Stories

### 3.1 Admin / Marketing

| Priority | Story |
|----------|------|
| P0 | Admin can publish selected media publicly for marketing |
| P0 | Only media with explicit public consent can be published |
| P1 | Admin can edit media (crop/blur) before publishing |
| P1 | Admin can manage gallery by service |

---

### 3.2 Visitor (Public User)

| Priority | Story |
|----------|------|
| P0 | Visitor can view before/after results |
| P0 | Visitor can filter by service |
| P1 | Visitor sees only real, verified results |

---

## 4. 🧱 Data Model (v2)

```ts
interface MediaItem {
  id: string;

  bookingId: string;
  patientId: string;

  serviceId: string;
  serviceName: string;

  type: 'BEFORE' | 'AFTER' | 'PROGRESS';

  url: string;
  thumbnailUrl?: string;

  uploadedAt: string;
  uploadedByStaffId: string;

  // Private consent
  consentGiven: boolean;

  // Public consent
  isPublic: boolean;
  publicConsentGiven: boolean;
  publicConsentAt?: string;

  // Privacy protection
  isAnonymized: boolean;

  notes?: string;

  visibleToClient: boolean;
}
5. 🔐 Access Rules
5.1 Private Vault

Client can view only if:

Booking is CONFIRMED
Service performed
consentGiven = true
visibleToClient = true
5.2 Public Gallery

Media is public only if:

isPublic = true
publicConsentGiven = true
isAnonymized = true
No identifiable information is shown
6. 🖥 UI/UX
6.1 Public Gallery Page
Route
/gallery
Layout
┌────────────────────────────────────┐
│ Treatment Results                  │
├────────────────────────────────────┤
│  [All Services ▼]                  │
│  [All] [Before] [After]            │
│                                    │
│  ┌──────┐  ┌──────┐               │
│  │Before│→ │After │               │
│  └──────┘  └──────┘               │
│                                    │
└────────────────────────────────────┘
Features
Service filter
Before/After side-by-side
No patient identity
Optional treatment area label
6.2 Admin Controls
Public Toggle
[✔ Make Public]
Behavior
Requires confirmation modal
Requires anonymization before enabling
7. 🧠 Anonymization System

Required techniques:

Face blur
Crop to treatment area
Remove EXIF metadata
8. 🔌 API Design
8.1 Public Endpoints
Method    Endpoint    Description
GET    /api/public/gallery    List public media
GET    /api/public/gallery/{id}    Get single item
Query Params
serviceId
type
page
8.2 Admin Endpoints
Method    Endpoint
PATCH    /media/{id}/make-public
PATCH    /media/{id}/remove-public
9. ⚖️ Compliance
9.1 Required Consent

Must include explicit permission:

"Use for marketing purposes"
"Display on website and social media"
9.2 Restrictions

Do NOT show:

Name
Contact info
Exact dates

Remove media if:

Consent revoked
User requests deletion
10. ✅ Acceptance Criteria
Admin
 Can mark media as public
 Requires consent
 Requires anonymization
Public User
 Can view gallery بدون لاگین
 Can filter by service
 Can see before/after comparison
11. 🚫 Risks
Privacy violations
Misuse of images
Invalid consent
12. 💡 Enhancements (Optional)
Before/After slider
Treatment area tags
CTA button:
Get Free Consultation
🔚 Summary

v2 introduces:

Clear separation between private and public media
Legal-safe public gallery
Strong marketing capability
