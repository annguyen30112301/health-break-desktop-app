# HealthBreak — Roadmap & Progress

> Cập nhật tự động sau mỗi commit. Xem chi tiết từng tính năng trong `tests/TEST-PLAN.md` và PRD tương ứng.

**Last updated:** 2026-04-03
**Overall progress:** 11 / 27 tasks (41%)

---

## Legend
- `[x]` Hoàn thành (merged vào main + issue closed)
- `[~]` Code viết xong, đang review / chờ merge
- `[ ]` Chưa làm

---

## Sprint 1 — Dashboard thống kê (PRD 1)
> Mở dashboard trong trình duyệt, dữ liệu local 30 ngày, biểu đồ SVG, localized.

**Progress:** 11 / 11 tasks ✅

### Week 1 — Data layer & IPC
- [x] `stats-schema` — Mở rộng stats schema: thêm `skips` per key + `healthbreak-history` lưu 30 ngày
- [x] `stats-migration` — Migration logic tương thích dữ liệu cũ (không break localStorage hiện có)
- [x] `ipc-dashboard` — IPC handler `open-dashboard` trong `main.js` → `shell.openExternal`
- [x] `ui-stats-btn` — Nút / icon "Thống kê" trong cửa sổ chính mở dashboard

### Week 2 — Dashboard UI & Charts
- [x] `dashboard-template` — HTML template self-contained với data JSON embedded
- [x] `chart-water` — Biểu đồ cột: water intake (ml/ngày), tooltip số lần confirm
- [x] `chart-eyes` — Biểu đồ cột: eye rest (phút/ngày = confirms × interval)
- [x] `chart-move` — Biểu đồ cột: vận động (số lần + phút/ngày)
- [x] `chart-skiprate` — Section skip rate riêng từng loại (water / move / eyes), hiển thị `—` nếu chưa có data
- [x] `chart-toggle` — Toggle 7 ngày / 30 ngày, re-render < 500ms
- [x] `dashboard-i18n` — Localization EN/VI toàn bộ text trong HTML template

> **Ghi chú:** Sprint 1 = 11 tasks tổng (4 data layer + 7 chart/UI)

---

## Sprint 2 — Google SSO & Firebase (PRD 2)
> Login Google optional, Online/Offline mode, sync settings lên Firestore.

**Progress:** 0 / 8 tasks (PR #30 đang mở, chưa merge, chưa test thật)

### Week 3 — Firebase foundation & Auth
- [~] `firebase-setup` — Tạo Firebase project, bật Auth (Google provider), Firestore rules draft
- [~] `oauth-flow` — Electron OAuth: `app.setAsDefaultProtocolClient('healthbreak')`, bắt `open-url`, IPC token to renderer
- [~] `auth-ui` — UI: nút "Đăng nhập với Google", badge Offline / Online mode trong cửa sổ chính

### Week 4 — Sync & Migration
- [~] `token-storage` — Lưu token bằng `safeStorage.encryptString` trong `userData`, không dùng localStorage
- [~] `mode-switch` — Online/Offline mode switch: sau login, renderer đọc/ghi Firestore, không dùng localStorage cho data
- [~] `settings-sync` — Sync settings lên `users/{uid}/settings` khi thay đổi (local-first, retry khi offline)
- [~] `settings-restore` — Load settings từ Firestore khi login trên máy mới
- [~] `migration-dialog` — Dialog khi login lần đầu có local data: "Đồng bộ" hoặc "Bắt đầu mới"

---

## Sprint 3 — Community & Admin (PRD 2 cont.)
> Stats sync, feedback, quản lý tài khoản, analytics cho admin.

**Progress:** 0 / 8 tasks

### Week 5 — Data sync & Feedback
- [ ] `stats-sync` — Ghi `users/{uid}/history/{date}` lên Firestore sau mỗi confirm/skip
- [ ] `analytics-agg` — Daily aggregates: `FieldValue.increment` cho `analytics/daily/{date}` (dau, confirms, skips)
- [ ] `feedback-ui` — In-app feedback form (Online mode only): input 1–500 ký tự, nút Gửi
- [ ] `feedback-firestore` — Ghi feedback lên `feedback/{autoId}`: uid, text, appVersion, lang, platform, createdAt

### Week 6 — Account management & Polish
- [ ] `account-ui` — Account settings: avatar, email, ngày tạo, nút "Xóa tài khoản"
- [ ] `account-delete` — Xóa toàn bộ Firestore docs + Firebase Auth account, chuyển về Offline mode
- [ ] `privacy-notice` — Privacy notice trong onboarding khi chọn Online mode
- [ ] `online-polish` — UX polish: avatar header, mode indicator, toast sync status

---

## Completed ✅
_Task được đưa vào đây chỉ khi: code merged vào main + issue closed._

| Task | Mô tả | Commit | Ngày |
|------|--------|--------|------|
| `stats-schema` | Mở rộng stats schema: thêm `skips` per key + `healthbreak-history` lưu 30 ngày | 8510745 | 2026-04-03 |
| `stats-migration` | Migration logic tương thích dữ liệu cũ | 8510745 | 2026-04-03 |
| `ipc-dashboard` | IPC handler `open-dashboard` trong `main.js` → `shell.openExternal` | 8510745 | 2026-04-03 |
| `ui-stats-btn` | Nút "Thống kê" trong cửa sổ chính mở dashboard | 8510745 | 2026-04-03 |
| `dashboard-template` | HTML template self-contained với data JSON embedded | 8510745 | 2026-04-03 |
| `chart-water` | Biểu đồ cột: water intake (ml/ngày) | 8510745 | 2026-04-03 |
| `chart-eyes` | Biểu đồ cột: eye rest (phút/ngày) | 8510745 | 2026-04-03 |
| `chart-move` | Biểu đồ cột: vận động (số lần + phút/ngày) | 8510745 | 2026-04-03 |
| `chart-skiprate` | Section skip rate riêng từng loại | 8510745 | 2026-04-03 |
| `chart-toggle` | Toggle 7 ngày / 30 ngày | 8510745 | 2026-04-03 |
| `dashboard-i18n` | Localization EN/VI toàn bộ text | 8510745 | 2026-04-03 |
