import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import {
  DocHub,
  DocTopic,
  ExerciseHub,
  Exercise,
  CheatsheetHub,
  CheatsheetSection,
  User,
} from "@/lib/models";
import { mlDocs, deDocs, exerciseSets } from "@/data/seed-manifest";

/**
 * GET /api/seed — Populates the DB with initial data from hardcoded files.
 * Run once after creating your first user. Uses the first user as author.
 * Add ?force=true to clear existing seed data and re-seed.
 */
export async function GET(req: Request) {
  try {
    await connectDB();
    const author = await User.findOne();
    if (!author) {
      return NextResponse.json(
        { error: "Create a user first via POST /api/auth/register" },
        { status: 400 }
      );
    }
    const authorId = author._id;

    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "true";

    // Check if already seeded (unless force)
    const existingHubs = await DocHub.countDocuments();
    if (existingHubs > 0 && !force) {
      return NextResponse.json({
        message: "DB already has data. Skip seeding. Add ?force=true to clear and re-seed.",
        docHubs: existingHubs,
      });
    }

    if (force && existingHubs > 0) {
      await DocTopic.deleteMany({});
      await DocHub.deleteMany({});
      await Exercise.deleteMany({});
      await ExerciseHub.deleteMany({});
      await CheatsheetSection.deleteMany({});
      await CheatsheetHub.deleteMany({});
    }

    const stats = { docTopics: 0, exercises: 0, cheatsheetSections: 0 };

    // Seed Doc Hubs
    const docHubDefs = [
      { title: "DE Documentation", description: "Data Engineering topics", accent: "#3b82f6", docs: deDocs },
      { title: "ML Documentation", description: "Machine Learning topics", accent: "#a78bfa", docs: mlDocs },
    ];

    for (const hubDef of docHubDefs) {
      const hub = await DocHub.create({
        title: hubDef.title,
        description: hubDef.description,
        accent: hubDef.accent,
        authorId,
      });
      const slugs = Object.keys(hubDef.docs);
      for (let i = 0; i < slugs.length; i++) {
        const slug = slugs[i];
        const mod = hubDef.docs[slug];
        if (!mod?.data) continue;
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
        stats.docTopics++;
      }
    }

    // Seed Exercise Hubs
    const exerciseDefs = [
      { key: "de_exercises", title: "DE Core", description: "Data Engineering interview questions" },
      { key: "python_exercises", title: "Python", description: "Python exercises" },
      { key: "pandas_exercises", title: "Pandas", description: "Pandas exercises" },
      { key: "spark_exercises", title: "PySpark", description: "PySpark exercises" },
    ];

    for (const ex of exerciseDefs) {
      const mod = exerciseSets[ex.key as keyof typeof exerciseSets];
      const exercises = mod?.exercises || [];
      const hub = await ExerciseHub.create({
        title: ex.title,
        description: ex.description,
        authorId,
      });
      for (let i = 0; i < exercises.length; i++) {
        const e = exercises[i] as { tag: string; q: string; a: string; lang?: string };
        await Exercise.create({
          hubId: hub._id,
          tag: e.tag,
          q: e.q,
          a: e.a,
          lang: e.lang || "text",
          order: i,
          authorId,
        });
        stats.exercises++;
      }
    }

    // Seed Cheatsheets
    const pandasMod = await import("@/data/pandas");
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
      stats.cheatsheetSections++;
    }

    const cmdMod = await import("@/data/de_commands");
    const commands = cmdMod.commands || [];
    const categories = cmdMod.categories || [];
    const cmdColors: Record<string, string> = {
      navigation: "#10b981", files: "#f59e0b", compression: "#f97316", text: "#8b5cf6",
      permissions: "#06b6d4", process: "#ef4444", network: "#e07030", data: "#22d3ee", windows: "#fb923c",
    };
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
      await CheatsheetSection.create({
        hubId: cmdHub._id,
        label: cat.label,
        color: cmdColors[cat.id] || "#3b82f6",
        snippets: cmds.map((cmd: { desc: string; cmd: string; os: string }) => ({
          title: `[${cmd.os === "linux" ? "Linux" : "Windows"}] ${cmd.desc}`,
          code: cmd.cmd,
          lang: cmd.os === "linux" ? "bash" : "powershell",
        })),
        order: order++,
        authorId,
      });
      stats.cheatsheetSections++;
    }

    return NextResponse.json({
      success: true,
      message: "Seed complete!",
      stats: {
        docTopics: stats.docTopics,
        exercises: stats.exercises,
        cheatsheetSections: stats.cheatsheetSections,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Seed failed", details: String(e) }, { status: 500 });
  }
}
