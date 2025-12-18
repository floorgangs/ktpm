# CI_FAILURES (Fallback)

File này dùng làm **fallback** khi GitHub Actions **không thể tạo GitHub Issue** (thiếu quyền `issues:write`, labels bị chặn, hoặc policy của repo).

- Workflow sẽ cố tạo Issue + comment PR.
- Nếu thất bại, workflow sẽ **append** một entry mới vào file này trong runner workspace và cố tạo PR (action `peter-evans/create-pull-request`).
- Nếu ngay cả tạo PR cũng bị chặn, workflow vẫn upload artifact `ci-fail-logs-*` để giảng viên/nhóm có thể tải log về.

## Entries

(Chưa có entry)
## 2025-12-18T15:52:04.114Z — [CI FAIL] Frontend CI/CD - test - frontend tests failed
- Run URL: https://github.com/floorgangs/ktpm/actions/runs/20342794045
- Commit: d47b32202acbb1b652c39b00fcd1f8432e42d964
- Job: test
- Reason: failed to create issue via API: HttpError: Issues has been disabled in this repository.

```
==== FRONTEND TEST OUTPUT (tail 100 lines) ====

```
