import { exec } from "child_process";
import fs from "fs";

exec("npx vite build", { maxBuffer: 1024 * 1024 * 10 }, (err, stdout, stderr) => {
   fs.writeFileSync("vite_err.log", stdout + "\n" + (stderr || ""), "utf8");
   console.log("Dumped Vite output to vite_err.log");
});
