# 📄 Feature Specification: Before & After Media System

**Feature:** Upload and Display Before & After Media Filtered by Service  
**Version:** 1.0  
**Last Updated:** 2026-04-25  
**Status:** Specification  

---

## 1. Overview

### 1.1 Feature Summary
Enable clinic staff to upload before/after/progress media images for client treatments, and allow clients to view their media filtered by service type (Botox, Laser, etc.).

### 1.2 Core Entities
- **Service**: Cosmetic treatments (Botox, Laser, Mesotherapy, etc.)
- **Media Item**: Before/After/Progress images linked to a booking and service

---

## 2. User Stories

### 2.1 Admin/Staff Stories
| Priority | Story |
| P0 | As a clinic staff member, I want to upload before/after/progress photos for a client's completed booking, so that the client can view their treatment results |
| P0 | As a clinic staff member, I want to filter media by service type, so that I can easily find and manage photos for specific treatments (Botox, Laser, etc.) |
| P1 | As a clinic staff member, I want to delete or edit uploaded media, so that I can manage the media archive |
| P1 | As a clinic staff member, I want to see all media for a client, so that I can review their treatment history |

### 2.2 Client Stories
| Priority | Story |
| P0 | As a client, I want to view my before/after/progress photos filtered by service, so that I can see results for specific treatments |
| P1 | As a client, I want to download my treatment photos, so that I can keep them locally |
| P2 | As a client, I want to see the upload date and staff who uploaded, so that I know when and by whom the photos were taken |

---

## 3. Functional Requirements

### 3.1 Admin Side - Media Management

#### 3.1.1 New Route
- Path: `/admin/-media` (under مدیریت group)
- Label: "مدیا" or "تصاویر قبل و بعد"
- Icon: `Image` from lucide-react

#### 3.1.2 Features
1. **Service Filter Dropdown**
   - Options: All services + each service from SERVICES list
   - Default: "همه خدمات" (All services)

2. **Media Type Filter Tabs**
   - Options: همه, قبل از درمان, بعد از درمان, پیشرفت
   - Same as existing client filter

3. **Upload Modal**
   - Select booking (autocomplete from BOOKINGS)
   - Select service (auto-populated from booking)
   - Select type: قبل / بعد / پیشرفت
   - File upload (image only, max 10MB)
   - Consent checkbox (required)
   - Notes (optional)

4. **Media List Table/Grid**
   - Columns: Thumbnail, Client Name, Service, Type, Date, Uploaded By, Actions
   - Actions: View, Delete
   - Pagination: 20 items per page

### 3.2 Client Side - MediaVault Enhancement

#### 3.2.1 Service Filter
- Add dropdown/tabs to filter by service
- Options: All services + services the client has booked
- Default: "همه"

#### 3.2.2 Existing Features to Preserve
- Type filter tabs (همه, قبل, بعد, پیشرفت)
- Privacy notice
- Stats cards (counts by type)
- Image modal with download
- Consent-locked view

---

## 4. UI/UX Design

### 4.1 Admin - Media Management Page Layout

```
┌─────────────────────────────────────────┐
│ داشبورد  لیست رزروها  تقویم  ...      │ ← Top bar (existing)
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────┐ ┌──────────────────┐  │
│  │ همه خدمات │ │ [+ بارگذاری عکس] │  │
│  └���────────────┘ └──────────────────┘  │
│                                         │
│  [همه] [قبل] [بعد] [پیشرفت]           │ ← Type tabs (existing style)
│                                         │
│  ┌──────┐ ┌──────┐ ┌──────┐           │
│  │ img │ │ img │ │ img │               │ ← Media grid
│  └──────┘ └──────┘ └──────┘           │
│  ┌──────┐ ┌──────┐                      │
│  │ img │ │ img │                      │
│  └──────┘ └──────┘                      │
│                                         │
└─────────────────────────────────────────┘
```

### 4.2 Client - Enhanced MediaVault

```
┌─────────────────────────────────────────┐
│ آرشیو تصاویر                    محرمانه│
├─────────────────────────────────────────┤
│  ┌─────────────┐                        │
│  │ همه ▼      │ ← Service dropdown     │
│  └─────────────┘                        │
│  [همه] [قبل] [بعد] [پیشرفت]           │ ← Type tabs
│                                         │
│  (قبل) ۲    (بعد) ۳    (پیشرفت) ۱   │ ← Stats
│                                         │
│  ┌──────┐ ┌──────┐ ┌──────┐           │
│  │ img │ │ img │ │ img │               │
│  └──────┘ └──────┘ └──────┘           │
└─────────────────────────────────────────┘
```

---

## 5. Data Model

### 5.1 MediaItem Schema (Extension)

```typescript
interface MediaItem {
  id: string;
  bookingId: string;
  patientId: string;
  patientName: string;
  serviceId: string;
  serviceName: string;
  type: 'BEFORE' | 'AFTER' | 'PROGRESS';
  url: string;
  thumbnailUrl?: string;
  uploadedAt: string;
  uploadedAtPersian: string;
  uploadedByStaffId: string;
  uploadedByStaffName: string;
  consentGiven: boolean;
  consentSignatureId?: string;
  notes?: string;
  visibleToClient: boolean;
}
```

### 5.2 API Endpoints (Expected)

| Method | Endpoint | Description |
| GET | `/api/tenants/{tenantId}/media` | List media with filters |
| GET | `/api/tenants/{tenantId}/media/{id}` | Get single media item |
| POST | `/api/tenants/{tenantId}/media` | Upload new media |
| DELETE | `/api/tenants/{tenantId}/media/{id}` | Delete media (soft) |
| GET | `/api/tenants/{tenantId}/clients/{clientId}/media` | Client's media |

### 5.3 Query Parameters
- `serviceId`: Filter by service
- `type`: Filter by media type (BEFORE/AFTER/PROGRESS)
- `patientId`: Filter by patient (admin only)
- `page`, `limit`: Pagination

---

## 6. Backend Requirements (Reference)

Based on PRD.md Section 9 (Media Vault):

### 6.1 Access Rules
- Client can only view if ALL true:
  - Appointment is CONFIRMED
  - Service was actually performed
  - `visible_to_client = true`
  - Consent was obtained and valid

### 6.2 Compliance Fields
- `uploaded_by`: staff_id
- `uploaded_at`: UTC timestamp
- `consent_obtained`: boolean
- `consent_signature_id`: reference
- `consent_revoked_at`: nullable
- `retention_days`: 2555 (default)

### 6.3 Deletion Rules
- Client request: Requires staff approval
- Automatic: Soft delete after retention_days
- GDPR-style: Only after 180 days with no active bookings

---

## 7. Integration Points

### 7.1 Existing Dependencies
- `SERVICES` from mockData.ts
- `BOOKINGS` with status check (must be CONFIRMED)
- `STAFF` for upload attribution
- `MediaVault.tsx` client component
- `ClientLayout.tsx` navigation

### 7.2 New Dependencies
- `AdminLayout.tsx`: Add NAV_ITEMS entry
- `routes.tsx`: Add `/admin/media` route
- New page: `pages/admin/MediaManagement.tsx`
- API service hooks (if using React Query)

---

## 8. Acceptance Criteria

### 8.1 Admin Criteria
- [ ] Menu item appears in sidebar under "مدیریت" group
- [ ] Service dropdown filters the media list
- [ ] Type tabs filter correctly
- [ ] Upload modal opens with booking selection
- [ ] Can upload image and see it in list
- [ ] Can delete media (soft delete)

### 8.2 Client Criteria
- [ ] Service filter dropdown appears in MediaVault
- [ ] Filtering by service shows correct items
- [ ] Type filter still works
- [ ] Consent check prevents access when not granted
- [ ] Stats update based on filtered results

---

## 9. File Changes Summary

### 9.1 New Files
| File | Description |
| docs/feature/before&after-media-system.md | This document |
| src/app/pages/admin/MediaManagement.tsx | Admin media management page |

### 9.2 Modified Files
| File | Changes |
| src/app/layouts/AdminLayout.tsx | Add nav item to NAV_ITEMS |
| src/app/routes.tsx | Add /admin/media route |
| src/app/pages/client/MediaVault.tsx | Add service filter |
| src/app/data/mockData.ts | Add MediaItem type, sample data |

---

## 10. Out of Scope (v1.0)

- Bulk upload
- Video media support
- Staff assignment to specific services
- Client request for deletion (UI)
- Analytics dashboard for media
- Auto-generated comparison slider (before/after)

---

## 11. Notes

- Follow existing RTL design patterns
- Use Persian labels from PRD
- Reuse TYPE_COLORS and FILTER_LABELS from MediaVault
- Consider lazy loading for media grid
- Implement proper error handling for upload failures