import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { exit } from "node:process";
import { parse as parseCsv, ParseResult } from "papaparse";

function lint(csv: string): boolean {
  csv = csv.replaceAll("\r\n", "\n");
  csv = csv.trim();

  let parseResult: ParseResult<unknown>;
  try {
    parseResult = parseCsv(csv, { header: true });
  } catch {
    return false;
  }
  if (parseResult.errors.length > 0) {
    return false;
  }

  for (const row of parseResult.data) {
    if (typeof row !== "object" || row === null) {
      return false;
    }
    const trimmed = Object.fromEntries(
      Object.entries(row).map(([k, v]) => [k.trim(), v]),
    );
    if (
      !(
        "学籍番号" in trimmed &&
        typeof trimmed["学籍番号"] === "string" &&
        trimmed["学籍番号"] === "" &&
        "学生氏名" in trimmed &&
        typeof trimmed["学生氏名"] === "string" &&
        trimmed["学生氏名"] === ""
      )
    ) {
      return false;
    }
  }

  return true;
}

function getEntriesRecursive(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      files.push(...getEntriesRecursive(path.join(dir, entry.name)));
    } else {
      files.push(path.join(dir, entry.name));
    }
  }
  return files;
}

function main(): void {
  let ok = true;
  for (const filename of getEntriesRecursive("grade-csvs")) {
    process.stdout.write(`Linting ${filename} ... `);
    const lintOk = lint(readFileSync(filename, { encoding: "utf8" }));
    if (lintOk) {
      console.log("ok");
    } else {
      console.log("failed");
      ok = false;
    }
  }
  if (!ok) {
    exit(1);
  }
}

main();
