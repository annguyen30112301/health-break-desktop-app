# review-code — Pre-merge Code Review

## Purpose

Thực hiện code review toàn diện trước khi merge branch. Tự động đọc git diff, kiểm tra 5 chiều, sinh `REVIEW_REPORT.md` với checklist. **Tất cả issue CRITICAL và HIGH phải được giải quyết trước khi merge.**

---

## Trigger

Chạy khi user gõ `/review-code` hoặc trước bất kỳ lệnh merge nào.

---

## Instructions

Bạn là senior engineer review code cho dự án HealthBreak (Electron + Node.js + Firebase). Thực hiện đúng theo các bước sau — **không bỏ qua bước nào**.

---

### Bước 1 — Xác định phạm vi review

Chạy các lệnh sau để lấy context:

```bash
git branch --show-current          # nhánh hiện tại
git log main..HEAD --oneline       # các commit chưa merge
git diff main...HEAD --name-only   # danh sách file thay đổi
git diff main...HEAD               # toàn bộ diff
```

Nếu đang trên `main`, dùng `HEAD~1` thay cho `main...HEAD`.

Đọc toàn bộ nội dung các file có thay đổi bằng Read tool — **không chỉ đọc diff**, đọc cả file để hiểu context.

---

### Bước 2 — Kiểm tra 5 chiều

Với mỗi chiều, duyệt qua từng file thay đổi và liệt kê mọi vấn đề tìm được.

#### 🔴 Chiều 1: Merge Conflicts
- Tìm conflict markers: `<<<<<<<`, `=======`, `>>>>>>>`
- File có conflict marker → **CRITICAL**, chặn merge ngay

#### 🔒 Chiều 2: Security
- API key, secret, token, password hardcode trong code (không phải trong file đã gitignore)
- `eval()`, `new Function()`, `innerHTML` với input không sanitize
- IPC handlers không validate input từ renderer
- `nodeIntegration: true` + xử lý URL ngoài — kiểm tra `shell.openExternal` có validate URL không
- `contextIsolation: false` — đảm bảo không expose API nguy hiểm
- File path traversal: path join với input user mà không sanitize
- safeStorage token: lưu đúng chỗ, không log ra console
- Firebase rules: không có rule `allow read, write: if true`

#### 🧠 Chiều 3: Logic & Correctness
- Race condition: async/await thiếu, Promise không được await
- Off-by-one errors trong vòng lặp, slice, index
- Null/undefined không được guard (gây crash)
- Event listener bị leak: addEventListener mà không removeEventListener khi component destroy
- IPC handler: gửi đúng channel, nhận đúng key, không nhầm `ipcMain.on` vs `ipcMain.handle`
- Timer: setInterval không được clear → memory leak
- Firebase: `serverTimestamp()` dùng trong object trước khi ghi (không nest trong array)
- localStorage key trùng lặp hoặc sai

#### 🏗️ Chiều 4: Clean Code & Structure
- Hàm quá dài (> 60 dòng) không có lý do chính đáng
- Magic number, magic string không có constant
- Dead code: biến khai báo nhưng không dùng, hàm không được gọi
- Comment sai (comment nói A nhưng code làm B)
- Tên biến / hàm không rõ nghĩa (< 3 ký tự trừ index loop)
- Duplicate logic giữa các hàm (copy-paste > 5 dòng)
- Một file làm quá nhiều việc (vi phạm SRP)
- `require()` trong vòng lặp hoặc trong hàm gọi nhiều lần

#### 📦 Chiều 5: Compatibility & Build
- File mới tạo trong `src/` đã được thêm vào `package.json > build > files` chưa
- Dependency mới trong `dependencies` (production) hay `devDependencies` (chỉ build)?
- `module.exports` / `require` nhất quán (không mix ESM `import` với CJS)
- Locale key mới thêm vào `en.js` nhưng thiếu trong `vi.js` (hoặc ngược lại)
- IPC channel mới: đã khai báo cả `ipcMain.on/handle` lẫn `ipcRenderer.send/invoke`?

---

### Bước 3 — Phân loại severity

| Severity | Định nghĩa | Bắt buộc fix trước merge? |
|----------|-----------|--------------------------|
| **CRITICAL** | Conflict marker, secret lộ, crash chắc chắn xảy ra | ✅ Bắt buộc |
| **HIGH** | Logic sai, security hole, data loss, memory leak | ✅ Bắt buộc |
| **MEDIUM** | Code smell nghiêm trọng, thiếu error handling quan trọng | ⚠️ Khuyến nghị fix |
| **LOW** | Style, naming, refactor nhỏ | ℹ️ Tùy chọn |

---

### Bước 4 — Sinh REVIEW_REPORT.md

Tạo file `REVIEW_REPORT.md` tại root của project với format sau:

```markdown
# Code Review Report

**Branch:** <tên branch>
**Base:** main
**Reviewed at:** <timestamp>
**Commits:** <số commit>
**Files changed:** <số file>

---

## Verdict

<!-- Điền một trong: BLOCKED / APPROVED WITH NOTES / APPROVED -->
> ⛔ BLOCKED — X critical/high issue(s) phải giải quyết trước khi merge.

---

## Issues

### 🔴 CRITICAL

- [ ] **[conflict]** `src/firebase.js:42` — Conflict marker `<<<<<<< HEAD` còn trong file
  > Giải quyết conflict và remove marker.

### 🔥 HIGH

- [ ] **[security]** `main.js:87` — `shell.openExternal(url)` không validate URL scheme, có thể bị khai thác qua IPC
  > Thêm: `if (!url.startsWith('https://')) return`

### ⚠️ MEDIUM

- [ ] **[logic]** `index.html:450` — Event listener `popup-closed` không được remove khi window đóng → potential leak
  > Lưu reference và gọi `ipcRenderer.removeListener` trong cleanup.

### ℹ️ LOW

- [ ] **[style]** `src/auth.js:12` — Biến `p` không rõ nghĩa, đổi thành `pkceParams`

---

## Positives

- ...

---

## Files Reviewed

| File | Lines changed | Status |
|------|--------------|--------|
| `main.js` | +45 / -3 | ✅ reviewed |

---

## Resolution Log

_Điền vào đây khi fix từng issue:_

| Issue | Fixed in commit | Note |
|-------|----------------|------|
| [conflict] src/firebase.js:42 | — | — |
```

**Quy tắc checkbox:**
- `[ ]` = chưa giải quyết → merge bị chặn (nếu CRITICAL/HIGH)
- `[x]` = đã giải quyết

---

### Bước 5 — Verdict

- Nếu có bất kỳ CRITICAL hoặc HIGH nào `[ ]`: Verdict = **BLOCKED**, nói rõ cần fix gì
- Nếu chỉ còn MEDIUM/LOW: Verdict = **APPROVED WITH NOTES**
- Nếu không có issue nào: Verdict = **APPROVED**

In ra summary cuối cùng:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REVIEW VERDICT: BLOCKED / APPROVED WITH NOTES / APPROVED
Critical: X | High: X | Medium: X | Low: X
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ REVIEW_REPORT.md đã được tạo.
→ Sau khi fix, update checkbox [x] và chạy lại /review-code để confirm.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Notes

- `REVIEW_REPORT.md` bị gitignore — không commit vào repo
- Hook `pre-merge-check.js` đọc file này trước mọi lệnh merge
- Sau khi fix issue, đánh `[x]` trong report và chạy lại `/review-code` để cập nhật verdict
- Nếu project là `main` branch → review so với `HEAD~1`

---

## Metadata

| Field | Value |
|---|---|
| Version | 1.0.0 |
| Project | HealthBreak |
| Stack | Electron, Node.js, Firebase, Jest |
