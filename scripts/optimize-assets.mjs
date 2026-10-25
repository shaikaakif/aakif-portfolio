import sharp from "sharp";
import fs from "fs";
import path from "path";

const srcDir = "public";
const outDir = "public/images";

fs.mkdirSync(outDir, { recursive: true });

const jobs = [
  {
    src: path.join(srcDir, "Aakif-sitting-photo.jpeg"),
    out: path.join(outDir, "portrait-sitting.webp"),
    opts: { width: 800, fit: "inside" },
    format: "webp",
    quality: 80,
  },
  {
    src: path.join(srcDir, "Warm Developer Workspace at Dusk.png"),
    out: path.join(outDir, "workspace-dusk.webp"),
    opts: { width: 1600, fit: "inside" },
    format: "webp",
    quality: 80,
  },
  {
    src: path.join(srcDir, "Feedy_ Good Food, Brighter Days.png"),
    out: path.join(outDir, "feedy.webp"),
    opts: { width: 1000, fit: "inside" },
    format: "webp",
    quality: 80,
  },
  {
    src: path.join(srcDir, "MySafe_ Secure Data, Simplified.png"),
    out: path.join(outDir, "mysafe.webp"),
    opts: { width: 1000, fit: "inside" },
    format: "webp",
    quality: 80,
  },
  {
    src: path.join(srcDir, "PrintU_ Simple Printing, Your Way.png"),
    out: path.join(outDir, "printu.webp"),
    opts: { width: 1000, fit: "inside" },
    format: "webp",
    quality: 80,
  },
  {
    src: path.join(srcDir, "Engineering Useful Products.png"),
    out: path.join(outDir, "hero-og-cover.webp"),
    opts: { width: 1200, fit: "inside" },
    format: "webp",
    quality: 80,
  },
  {
    src: path.join(srcDir, "learnlens.jpg"),
    out: path.join(outDir, "learnlens.webp"),
    opts: { width: 1000, fit: "inside" },
    format: "webp",
    quality: 80,
  },
  {
    src: path.join(srcDir, "my-photo.png"),
    out: path.join(outDir, "my-photo.webp"),
    opts: { width: 800, fit: "inside" },
    format: "webp",
    quality: 85,
  },
  {
    src: path.join(srcDir, "Shaik_Aakif_Resume_.pdf"),
    out: path.join(outDir, "resume.pdf"),
    copy: true,
  },
];

async function processJob(job) {
  if (job.copy) {
    fs.copyFileSync(job.src, job.out);
    console.log("copied:", job.out);
    return;
  }
  try {
    let pipeline = sharp(job.src).resize(job.opts);
    if (job.format === "webp") {
      pipeline = pipeline.webp({ quality: job.quality });
    } else if (job.format === "avif") {
      pipeline = pipeline.avif({ quality: job.quality });
    }
    await pipeline.toFile(job.out);
    const stats = fs.statSync(job.out);
    console.log(`processed: ${job.out} (${(stats.size / 1024).toFixed(1)} KB)`);
  } catch (err) {
    console.error("failed:", job.src, err.message);
  }
}

(async () => {
  for (const job of jobs) {
    await processJob(job);
  }
})();
