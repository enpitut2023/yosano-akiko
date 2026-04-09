---
name: akiko-charizard
description: Course search tool for University of Tsukuba. Data covers academic years 2023–2025.
---


# akiko-charizard CLI

## Output

All output is compact JSON on stdout. Errors go to stderr.

### Default output

```json
{
  "該当授業数": 3,
  "最大超過": false,
  "優先一致数": null,
  "授業": [
    {
      "科目番号": "GB11931",
      "年度": 2025,
      "科目名": "データ構造とアルゴリズム",
      "単位数": "3.0",
      "実施学期": "秋ABC",
      "曜時限": "月1,2",
      "標準履修年次": "2",
      "備考": "...",
      "授業概要": "...",
      "担当教員": "天笠 俊之,長谷部 浩二,藤田 典久"
    }
  ]
}
```

- `最大超過`: true when results were capped by `--max` and more matches exist.
- `優先一致数`: number of courses that matched `--priority`; null when `--priority` is not set.
- The same course may appear multiple times with different `年度` values

## Options

| Flag | Default | Description |
|------|---------|-------------|
| `--id <pattern>` | `""` | Filter by 科目番号 |
| `--id-mode prefix\|contain\|regex` | `prefix` | How to apply `--id` |
| `--name <pattern>` | `""` | Filter by 科目名 |
| `--name-mode contain\|exact` | `contain` | How to apply `--name`; exact with empty string matches all |
| `--year <years>` | `2023,2024,2025` | Comma-separated years to include |
| `--priority <string>` | `""` | Float matching courses to top; sets `優先一致数` |
| `-d` / `--description` | off | Also search 授業概要 when matching `--priority` |
| `--max <n>` | `1000` | Cap result count; sets `最大超過` if exceeded |

## Examples

All courses with ID prefix `GB1193`:
```
akiko-charizard --id GB1193
```

Courses matching the regex `GB1[12]` in 2024 and 2025 only:
```
akiko-charizard --id-mode regex --id "GB1[12]" --year 2024,2025
```

Courses whose name contains `アルゴリズム`, with matching courses sorted first:
```
akiko-charizard --name アルゴリズム --priority アルゴリズム
```

Exact name match:
```
akiko-charizard --name "データ構造とアルゴリズム" --name-mode exact
```