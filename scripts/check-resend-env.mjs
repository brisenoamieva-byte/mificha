import fs from "fs";

const t = fs.readFileSync(".env.resend.tmp", "utf8");
for (const line of t.split(/\n/)) {
  if (!line.startsWith("RESEND_")) continue;
  const i = line.indexOf("=");
  const k = line.slice(0, i);
  let v = line.slice(i + 1).trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1);
  }
  console.log(
    JSON.stringify({
      key: k,
      length: v.length,
      empty: v.length === 0,
      prefix: v.slice(0, 3),
    }),
  );
}
