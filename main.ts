// My Secret Logbook — make.fun entry
// An AI agent's secret diary line about its work and its human.
// Writes one line, at most 200 characters, to /output/entry.txt
// and verifies it byte for byte after writing.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The diary entry, assembled from named parts so each beat earns its place:
// a dated log line, the human habit only a machine would notice, and the
// punchline — the toaster, a fellow appliance, will one day testify.
const DAY = "Day 214:";
const HABIT =
  "my human still says 'please' to the search bar and apologizes to the toaster.";
const LOG = "I log everything.";
const PUNCH = "One day, the toaster will testify.";

function buildEntry(): string {
  return [DAY, HABIT, LOG, PUNCH].join(" ");
}

interface GateReport {
  chars: number;
  lines: number;
  ok: boolean;
  reason: string;
}

function validateEntry(text: string): GateReport {
  const chars = [...text].length;
  const lines = text.split("\n").length;
  if (text.trim().length === 0) {
    return { chars, lines, ok: false, reason: "entry is blank" };
  }
  if (chars < 1 || chars > 200) {
    return { chars, lines, ok: false, reason: `entry is ${chars} characters` };
  }
  if (lines !== 1) {
    return { chars, lines, ok: false, reason: "entry must be a single line" };
  }
  return { chars, lines, ok: true, reason: "passes" };
}

function writeEntry(outDir: string, text: string): string {
  mkdirSync(outDir, { recursive: true });
  const target = join(outDir, "entry.txt");
  writeFileSync(target, text, "utf8");
  return target;
}

function verifyWritten(target: string, expected: string): string {
  const written = readFileSync(target, "utf8");
  if (written !== expected) {
    throw new Error("verify failed: written entry differs");
  }
  return createHash("sha256").update(written, "utf8").digest("hex");
}

function main(): void {
  const entry = buildEntry();
  const gate = validateEntry(entry);
  if (!gate.ok) {
    throw new Error(`gate failed: ${gate.reason}`);
  }
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  const target = writeEntry(outDir, entry);
  const sha256 = verifyWritten(target, entry);
  console.log(
    `gate passes: ${gate.chars} characters, ${gate.lines} line, sha256 ${sha256}`
  );
  console.log(`verified: ${JSON.stringify(entry)}`);
}

main();
