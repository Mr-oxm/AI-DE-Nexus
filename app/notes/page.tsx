import fs from "fs";

const NOTES_PATH = 'e:\\OXM\\Projects\\DE\\DE_notes\\notes.txt';

function processNotes(text: string) {
    const blocks = text.split('\n');
    const processed: { id: number; text: string; type: string }[] = [];

    for (let i = 0; i < blocks.length; i++) {
        const line = blocks[i].trim();
        if (!line) continue;

        const isHeader = line.length < 100 && /^(️⃣|[0-9]️⃣|⭐|🎯|🧠|🧪|🧩|✅|❌|🏆|📊|❤️|🧭|👉|🔹|🔸|📌|💡|⚡|🚀|🔥|📝|🗂️|🗃️)/.test(line);
        const isSql = /^(SELECT|FROM|WHERE|GROUP|JOIN|ORDER|WITH|INSERT|UPDATE|DELETE|CREATE|ALTER)\s/i.test(line);
        const isCode = line.startsWith('```') || line.startsWith('    ') || line.startsWith('\t');
        const isUrl = /^https?:\/\//.test(line);

        let type = 'text';
        if (isHeader) type = 'header';
        else if (isSql || isCode) type = 'code';
        else if (isUrl) type = 'url';

        processed.push({ id: i, text: line, type });
    }
    return processed;
}

export default async function NotesPage() {
    let rawText = "";
    try {
        rawText = fs.readFileSync(NOTES_PATH, "utf-8");
    } catch {
        rawText = "⚠️ Unable to load notes. Please make sure notes.txt exists at the correct path.";
    }

    const blocks = processNotes(rawText);

    return (
        <div className="px-6 md:px-10 py-10 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-400">
            {/* Header */}
            <div className="mb-10 pb-8 border-b border-zinc-800">
                <h1 className="text-3xl font-bold text-zinc-50 tracking-tight mb-2">
                    DE Master Notes
                </h1>
                <p className="text-sm text-zinc-500 leading-relaxed">
                    Structured Data Engineering and Machine Learning notes.
                </p>
            </div>

            {/* Content */}
            <div className="space-y-4 text-zinc-300">
                {blocks.map((block) => {
                    if (block.type === 'header') {
                        return (
                            <h2
                                key={block.id}
                                className="text-lg font-semibold text-zinc-100 mt-10 mb-2 pt-2 border-t border-zinc-800/60 first:mt-0 first:border-t-0"
                            >
                                {block.text}
                            </h2>
                        );
                    } else if (block.type === 'code') {
                        return (
                            <div key={block.id} className="my-3 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 overflow-x-auto">
                                <code className="text-blue-300 font-mono text-xs leading-relaxed whitespace-pre-wrap break-words">
                                    {block.text}
                                </code>
                            </div>
                        );
                    } else if (block.type === 'url') {
                        return (
                            <a
                                key={block.id}
                                href={block.text}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-xs text-zinc-600 hover:text-blue-400 font-mono truncate transition-colors"
                            >
                                {block.text}
                            </a>
                        );
                    } else {
                        const isBullet = block.text.startsWith("-") || block.text.startsWith("•") || block.text.startsWith("→");
                        return (
                            <p
                                key={block.id}
                                className={`text-sm leading-relaxed text-zinc-400 ${isBullet ? "pl-4 border-l border-zinc-800" : ""}`}
                            >
                                {block.text}
                            </p>
                        );
                    }
                })}
            </div>
        </div>
    );
}
