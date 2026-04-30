/**
 * Seed script: populates MongoDB with initial data from existing hardcoded files.
 * Run: npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/seed.ts
 * Or: node --loader ts-node/esm scripts/seed.ts
 *
 * Prerequisites: Create a user first via /api/auth/register or manually in MongoDB.
 * Set SEED_AUTHOR_ID in .env to the ObjectId of the author user.
 */

import mongoose from "mongoose";
import * as fs from "fs";
import * as path from "path";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/de_notes";
const SEED_AUTHOR_ID = process.env.SEED_AUTHOR_ID; // Set this to your author's ObjectId

async function seed() {
  await mongoose.connect(MONGODB_URI);

  const authorId = SEED_AUTHOR_ID
    ? new mongoose.Types.ObjectId(SEED_AUTHOR_ID)
    : (await mongoose.connection.db?.collection("users").findOne())?._id;

  if (!authorId) {
    console.error(
      "No author found. Create a user first via POST /api/auth/register, then set SEED_AUTHOR_ID in .env"
    );
    process.exit(1);
  }

  console.log("Seeding with authorId:", authorId);

  // Import models
  const { DocHub, DocTopic, ExerciseHub, Exercise, CheatsheetHub, CheatsheetSection } = await import(
    "../lib/models"
  );

  // Seed Doc Hubs (DE, ML) and their topics
  const mlSlugs = [
    "intro", "stats-probability", "linear-algebra", "calculus", "preprocessing",
    "linear-regression", "decision-trees", "performance", "imbalance", "knn",
    "naive-bayes", "feature-engineering", "logistic-regression", "bias-variance",
    "svm", "multiclass", "ensemble", "dimensionality", "clustering", "anomaly",
    "pipelines", "neural-networks",
  ];
  const deSlugs = [
    "fundamentals", "sql", "spark", "streaming", "pipelines", "orchestration",
    "modeling", "file-formats", "nosql", "governance", "cloud",
  ];

  const docHubs = [
    { title: "DE Documentation", description: "Data Engineering topics", accent: "#3b82f6", slugs: deSlugs, dir: "de" },
    { title: "ML Documentation", description: "Machine Learning topics", accent: "#a78bfa", slugs: mlSlugs, dir: "ml" },
  ];

  for (const hubDef of docHubs) {
    const hub = await DocHub.create({
      title: hubDef.title,
      description: hubDef.description,
      accent: hubDef.accent,
      authorId,
    });
    for (let i = 0; i < hubDef.slugs.length; i++) {
      try {
        const mod = await import(`../data/${hubDef.dir}/${hubDef.slugs[i]}`);
        const d = mod.data;
        await DocTopic.create({
          hubId: hub._id,
          title: d.title,
          subtitle: d.subtitle || "",
          accent: d.accent || hubDef.accent,
          blocks: d.blocks || [],
          order: i,
          authorId,
        });
      } catch (e) {
        console.warn("Skip topic", hubDef.slugs[i], e);
      }
    }
    console.log("Created doc hub:", hub.title);
  }

  // Seed Exercise Hubs
  const exerciseData = [
    { file: "de_exercises", title: "DE Core", description: "Data Engineering interview questions" },
    { file: "python_exercises", title: "Python", description: "Python exercises" },
    { file: "pandas_exercises", title: "Pandas", description: "Pandas exercises" },
    { file: "spark_exercises", title: "PySpark", description: "PySpark exercises" },
  ];

  for (const ex of exerciseData) {
    try {
      const mod = await import(`../data/${ex.file}`);
      const exercises = mod.exercises || [];
      const tagColors = mod.tagColors || {};
      const hub = await ExerciseHub.create({
        title: ex.title,
        description: ex.description,
        authorId,
      });
      let order = 0;
      for (const e of exercises) {
        await Exercise.create({
          hubId: hub._id,
          tag: e.tag,
          q: e.q,
          a: e.a,
          lang: e.lang || "text",
          order: order++,
          authorId,
        });
      }
      console.log("Created exercise hub:", hub.title);
    } catch (e) {
      console.warn("Skip exercise hub", ex.file, e);
    }
  }

  // Seed Cheatsheet Hubs (Pandas, DE Commands)
  const pandasMod = await import("../data/pandas");
  const pandasSections = pandasMod.sections || [];
  const pandasHub = await CheatsheetHub.create({
    title: "Pandas Cheatsheet",
    description: "Crucial Python Pandas snippets",
    authorId,
  });
  for (let i = 0; i < pandasSections.length; i++) {
    const s = pandasSections[i];
    await CheatsheetSection.create({
      hubId: pandasHub._id,
      label: s.label,
      color: s.color || "#3b82f6",
      snippets: s.snippets || [],
      order: i,
      authorId,
    });
  }
  console.log("Created cheatsheet hub: Pandas Cheatsheet");

  // DE Commands as cheatsheet (one section per category)
  const cmdColors: Record<string, string> = {
    navigation: "#10b981", files: "#f59e0b", compression: "#f97316", text: "#8b5cf6",
    permissions: "#06b6d4", process: "#ef4444", network: "#e07030", data: "#22d3ee", windows: "#fb923c",
  };
  const commandsMod = await import("../data/de_commands");
  const commands = commandsMod.commands || [];
  const categories = commandsMod.categories || [];
  const cmdHub = await CheatsheetHub.create({
    title: "DE Commands",
    description: "Essential terminal commands for Data Engineers",
    authorId,
  });
  let order = 0;
  for (const cat of categories) {
    if (cat.id === "all") continue;
    const cmds = commands.filter((c: { cat: string }) => c.cat === cat.id);
    if (cmds.length === 0) continue;
    const snippets = cmds.map((cmd: { desc: string; cmd: string; os: string }) => ({
      title: `[${cmd.os === "linux" ? "Linux" : "Windows"}] ${cmd.desc}`,
      code: cmd.cmd,
      lang: cmd.os === "linux" ? "bash" : "powershell",
    }));
    await CheatsheetSection.create({
      hubId: cmdHub._id,
      label: cat.label,
      color: cmdColors[cat.id] || "#3b82f6",
      snippets,
      order: order++,
      authorId,
    });
  }
  console.log("Created cheatsheet hub: DE Commands");

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
