import { renameSync, writeFileSync } from "fs";
import { basename, dirname, join } from "path";

/** Atomic write via temp file + rename in the same directory. */
export function atomicWriteFile(filePath: string, content: string): void {
  const dir = dirname(filePath);
  const tmp = join(
    dir,
    `.${basename(filePath)}.${process.pid}.${Date.now()}.tmp`,
  );
  writeFileSync(tmp, content, "utf-8");
  renameSync(tmp, filePath);
}
