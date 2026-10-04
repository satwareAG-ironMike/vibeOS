// SOD 2026-10-04 review fix: negative/positive control for the moveToTrash
// home-scope guard (files.ts). Run:
//   XDG_DATA_HOME=/tmp/opencode/vibeOS/test-xdg bun test-moveToTrash.ts
import { filesRouter } from "@/server/api/routers/files";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";

const home = os.homedir();
const trashDir = path.join(
  process.env.XDG_DATA_HOME || path.join(home, ".local", "share"),
  "Trash",
  "files"
);

const f1 = path.join(home, "vibeos-trash-test-1.txt");
const f2 = path.join(home, "vibeos-trash-test-2.txt");

let failures = 0;
function check(name: string, cond: boolean, detail: string) {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}  ${detail}`);
  if (!cond) failures++;
}

await fs.writeFile(f1, "test1");
await fs.writeFile(f2, "test2");
const caller = filesRouter.createCaller({});

// 1. outside home -> rejected, target untouched.
// Sacrificial scratch file (not /etc): if the guard regresses, the test
// moves its own scratch file and still fails the assertion - never real data.
const scratch = "/var/tmp/vibeos-trash-scratch.txt";
await fs.writeFile(scratch, "scratch");
const r1 = await caller.moveToTrash({ path: scratch });
check("rejects outside home", r1.success === false && /home directory/.test(r1.error ?? ""), JSON.stringify(r1));
check("target untouched", (await fs.access(scratch).then(() => true).catch(() => false)), "scratch still exists");
await fs.rm(scratch, { force: true });

// 2. home itself -> rejected
const r2 = await caller.moveToTrash({ path: home });
check("rejects home itself", r2.success === false && /home directory/.test(r2.error ?? ""), JSON.stringify(r2));

// 3. prefix confusion (home without separator) -> rejected
const r3 = await caller.moveToTrash({ path: home + "x" });
check("rejects home+suffix prefix", r3.success === false && /home directory/.test(r3.error ?? ""), JSON.stringify(r3));

// 4. absolute path inside home -> moved
const r4 = await caller.moveToTrash({ path: f1 });
const f1Gone = await fs.access(f1).then(() => false).catch(() => true);
const f1InTrash = await fs.access(path.join(trashDir, "vibeos-trash-test-1.txt")).then(() => true).catch(() => false);
check("moves inside-home file", r4.success === true, JSON.stringify(r4));
check("source gone, in trash", f1Gone && f1InTrash, `gone=${f1Gone} inTrash=${f1InTrash}`);

// 5. tilde path inside home -> expanded and moved
const r5 = await caller.moveToTrash({ path: `~/${path.basename(f2)}` });
const f2Gone = await fs.access(f2).then(() => false).catch(() => true);
check("tilde path moved", r5.success === true && f2Gone, JSON.stringify(r5));

// 6. empty string -> zod min(1) rejects at validation (trpc throws)
let r6threw = false;
try {
  await caller.moveToTrash({ path: "" });
} catch {
  r6threw = true;
}
check("empty string rejected by validation", r6threw, `threw=${r6threw}`);

// cleanup: remove test files from the (temp) trash dir
await fs.rm(path.join(trashDir, "vibeos-trash-test-1.txt"), { force: true });
await fs.rm(path.join(trashDir, "vibeos-trash-test-2.txt"), { force: true });
console.log(failures === 0 ? "ALL PASS" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
