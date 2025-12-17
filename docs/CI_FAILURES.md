# CI_FAILURES (Fallback)

File này dùng làm **fallback** khi GitHub Actions **không thể tạo GitHub Issue** (thiếu quyền `issues:write`, labels bị chặn, hoặc policy của repo).

- Workflow sẽ cố tạo Issue + comment PR.
- Nếu thất bại, workflow sẽ **append** một entry mới vào file này trong runner workspace và cố tạo PR (action `peter-evans/create-pull-request`).
- Nếu ngay cả tạo PR cũng bị chặn, workflow vẫn upload artifact `ci-fail-logs-*` để giảng viên/nhóm có thể tải log về.

## Entries

(Chưa có entry)
## 2025-12-17T18:29:25.828Z — [CI FAIL] Frontend CI/CD - test - frontend tests failed
- Run URL: https://github.com/floorgangs/ktpm/actions/runs/20313227455
- Commit: 82fb94b300f2087bc71feefd16809867a991d909
- Job: test
- Reason: failed to create issue via API: HttpError: Issues has been disabled in this repository.

```
==== FRONTEND TEST OUTPUT (tail 100 lines) ====

```
