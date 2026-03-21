import { exec } from "child_process";
import fs from "fs";

exec("npx eslint .", { maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
   fs.writeFileSync("lint_err.log", stdout + "\n" + (stderr || ""), "utf8");
});
