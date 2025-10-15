# What's in the Box

A lightweight, full‑stack inventory app for organizing and locating stored items using QR codes.

**Tech Stack**: Python, FastAPI, React, Firebase (Auth, Firestore, Storage), QR code generation/scanning

---

## 1) Overview

* **Problem**: Boxes and bins get lost in closets/garages; spreadsheets go stale; searching is slow.
* **Solution**: A mobile-friendly web app where each box has a unique **QR code**. Scan to view contents instantly; add/edit items with photos; search across all boxes.
* **Audience**: Home storage, small shops, backrooms, or anyone who wants fast lookup.

**Demo Flow**

1. Sign in (Firebase Auth).
2. Create a **Box** → app generates a QR code.
3. Add **Items** (name, description, qty, optional photo, category).
4. Print/affix QR label to the box.
5. Later, scan the QR → deep link opens that box’s details instantly.

---

## 2) Architecture

```
React (Vite/Create React App)
  ↓ REST (JSON)
FastAPI (Python)
  ↳ Firebase Admin SDK → Firestore (data)
  ↳ Firebase Storage (images)
  ↳ QR code lib (e.g., qrcode / segno)
```

* **Frontend**: React, client-side routing, mobile-first UI.
* **Backend**: FastAPI for clean, typed endpoints (Pydantic models) + service layer.
* **Data**: Firestore (document DB) for low-latency reads, real-time listeners.
* **Images**: Firebase Storage buckets; signed URLs.
* **Auth**: Firebase Auth (Email/Password or OAuth). Back end verifies ID tokens.

---

## 3) Data Model (Firestore)

**Collections**

* `boxes/{boxId}`

  * `name`: string
  * `ownerUid`: string
  * `createdAt`: timestamp
  * `updatedAt`: timestamp
  * `qrCodeUrl`: string (optional if generated server-side)
  * `tags`: array<string>
* `boxes/{boxId}/items/{itemId}`

  * `name`: string
  * `description`: string
  * `quantity`: number
  * `imageUrl`: string (optional)
  * `category`: string
  * `updatedAt`: timestamp

**Indexes**

* Composite index on `ownerUid + tags` (search by user + tag)
* Optional: text search via prefix fields or lightweight client search

---

## 4) REST API (FastAPI)

| Method | Path                                | Body                                        | Purpose                                      |
| ------ | ----------------------------------- | ------------------------------------------- | -------------------------------------------- |
| POST   | `/api/boxes`                        | `{ name, tags }`                            | Create a box; returns `boxId` + QR image URL |
| GET    | `/api/boxes`                        | —                                           | List user’s boxes                            |
| GET    | `/api/boxes/{boxId}`                | —                                           | Get box details + items                      |
| PATCH  | `/api/boxes/{boxId}`                | partial                                     | Update box (name, tags)                      |
| DELETE | `/api/boxes/{boxId}`                | —                                           | Delete box & items                           |
| POST   | `/api/boxes/{boxId}/items`          | `{ name, description, quantity, category }` | Add item                                     |
| PATCH  | `/api/boxes/{boxId}/items/{itemId}` | partial                                     | Update item                                  |
| DELETE | `/api/boxes/{boxId}/items/{itemId}` | —                                           | Remove item                                  |
| POST   | `/api/upload`                       | multipart                                   | Upload image → Storage, returns URL          |
| GET    | `/api/scan/{boxId}`                 | —                                           | Deep‑link target from QR (no body)           |

**Auth**: Frontend sends Firebase ID token in `Authorization: Bearer <token>`; FastAPI verifies via Firebase Admin.

---

## 5) QR Code Flow

* **Create**: When a box is created, back end generates a QR image encoding a deep link like: `https://app.example.com/box/{boxId}`.
* **Print**: Client downloads/prints the QR and labels the physical box.
* **Scan**: Mobile camera → OS opens link → app loads that box’s data; if not signed in, app prompts to log in and then redirects.

**Libraries**: `qrcode` (Python) or `segno` for generation; on the client, use `react-qr-code` for previews.

---

## 6) Security & Access Control

* Verify Firebase ID tokens server-side on every request.
* Rules: users can only access `boxes` where `ownerUid == auth.uid`.
* Validate input with Pydantic; sanitize filenames; limit image size/type.
* Generate short‑lived signed URLs for image access.

---

## 7) Deployment

* **Frontend**: GitHub Pages / Netlify / Vercel.
* **Backend**: Fly.io / Railway / Render (FastAPI + Uvicorn/Gunicorn).
* **Secrets**: ENV variables for Firebase service account.
* **Storage**: Firebase project tied to back end via service account.

---

## 8) Testing & Quality

* **Backend**: pytest + httpx TestClient; unit tests for services; contract tests for endpoints.
* **Frontend**: React Testing Library for critical flows (add item, search).
* **Smoke**: E2E sanity: create box → add item → scan QR → retrieve box.

---

## 9) Metrics

* Time to locate a box: target < 10 seconds after scan.
* Data entry time: reduce by ~40% vs manual spreadsheet.
* Uptime/latency: p95 endpoint < 300ms (list/get).

---

## 10) Trade‑offs & Rationale

* **Firestore vs SQL**: Firestore chosen for simplicity + real-time; SQL would help with complex queries and joins.
* **FastAPI**: typed models, fast dev velocity; alternative was Django (heavier, built‑ins).
* **Client search**: simple prefix filtering vs full‑text; can add Algolia/Meilisearch later.

---

## 11) Roadmap / Future Work

* Sharing: grant read access to family/teammates by email.
* Bulk import/export CSV.
* Offline mode with local cache and background sync.
* Barcode support alongside QR.
* Item-level QR codes (optional).

---

## 12) Setup (Local Dev)

1. **Frontend**

   * `npm i` then `npm run dev`
   * Configure Firebase client keys in `.env` (public keys only)
2. **Backend**

   * `pip install -r requirements.txt`
   * Set `GOOGLE_APPLICATION_CREDENTIALS` to Firebase service account JSON
   * `uvicorn app.main:app --reload`

---

## 13) FAQ (Interview‑Ready)

* **Why FastAPI?** Quick to build, Pydantic validation, async IO for Storage calls.
* **Why Firestore?** Real‑time updates, simple doc model, easy auth rules.
* **How do you prevent unauthorized access?** Verify ID tokens on the server; Firestore rules enforce owner checks.
* **What if the QR link leaks?** Server still verifies ownership; unauthenticated users cannot read data.
* **How do you handle images?** Upload to Storage → store URL; validate MIME/size; serve via signed URL.
* **How do you search?** Client-side filtering by name/category/tags; can add server endpoints or external search later.

---

## 14) License

MIT (or your preference).
