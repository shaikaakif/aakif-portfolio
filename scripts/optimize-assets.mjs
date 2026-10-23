import sharp from "sharp";
import fs from "fs";
import path from "path";

const srcDir = "public";
const outDir = "public/images";

fs.mkdirSync(outDir, { recursive: true });

const jobs = [
  {
    src: path.join(srcDir, "Aakif-full-imge-ai.png"),
    out: path.join(outDir, "portrait-full.png"),
    opts: { width: 900, fit: "inside", quality: 85 },
  },
  {
    src: path.join(srcDir, "Aakif-sitting-photo.jpeg"),
    out: path.join(outDir, "portrait-sitting.jpg"),
    opts: { width: 800, fit: "inside", quality: 80 },
  },
  {
    src: path.join(srcDir, "Warm Developer Workspace at Dusk.png"),
    out: path.join(outDir, "workspace-dusk.jpg"),
    opts: { width: 1600, fit: "inside", quality: 80 },
  },
  {
    src: path.join(srcDir, "Feedy_ Good Food, Brighter Days.png"),
    out: path.join(outDir, "feedy.png"),
    opts: { width: 1000, fit: "inside", quality: 80 },
  },
  {
    src: path.join(srcDir, "MySafe_ Secure Data, Simplified.png"),
    out: path.join(outDir, "mysafe.png"),
    opts: { width: 1000, fit: "inside", quality: 80 },
  },
  {
    src: path.join(srcDir, "PrintU_ Simple Printing, Your Way.png"),
    out: path.join(outDir, "printu.png"),
    opts: { width: 1000, fit: "inside", quality: 80 },
  },
  {
    src: path.join(srcDir, "learnlens-ai.webp"),
    out: path.join(outDir, "learnlens-ai.webp"),
    opts: { width: 1000, fit: "inside", quality: 80 },
  },
  {
    src: path.join(srcDir, "hero-og-cover.webp"),
    out: path.join(outDir, "og-cover.webp"),
    opts: { width: 1200, fit: "inside", quality: 80 },
  },
  {
    src: path.join(srcDir, "Shaik_Aakif_Resume_.pdf"),
    out: path.join(outDir, "resume.pdf"),
    copy: true,
  },
];

(async () => {
  for (const job of jobs) {
    if (job.copy) {
      fs.copyFileSync(job.src, job.out);
      console.log("copied:", job.out);
      continue;
    }
    try {
      await sharp(job.src)
        .resize(job.opts)
        .toFile(job.out);
      console.log("processed:", job.out);
    } catch (err) {
      console.error("failed:", job.src, err.message);
    }
  }
})();
