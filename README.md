# 📚 DE & AI Knowledge Base

A comprehensive, structured reference and exercise platform for Data Engineering, Machine Learning, and MLOps — distilled from deep learning sessions and tailored for modern engineering interviews and daily tasks.

## 🚀 Getting Started Locally

First, install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🤝 How to Contribute

We welcome contributions! You can easily add new **Documentation Pages** and **Exercise Banks** to the platform without touching complex UI code. 

We provide **built-in Wizards** with Live Previews to help you compose your pages visually, and then simply export the code. Alternatively, you can use AI to generate the data arrays for you by feeding it the defined TypeScript schemas.

### 1. Adding Exercises

Exercises are interactive code blocks covering topics like Pandas, SQL, Bash, and pure text. 

#### Using the Exercise Wizard
1. Run the app and navigate to **`/wizard/exercise`** (e.g., `http://localhost:3000/wizard/exercise`).
2. Fill out the fields (Tag, Language, Question, Answer).
3. Check the **Live Preview** tab to see how it renders.
4. Click **Export Code** to copy the final TypeScript array to your clipboard.
5. Create a new file in `data/` (e.g., `data/de/my-exercises.ts`) and paste the array. 
6. Import and pass this array to the `<ExerciseBank />` component in your desired page inside `app/`.

#### Generating Exercises using AI
If you want an AI (like ChatGPT or Claude) to generate an exercise bank for you, give it this prompt:

> **AI Prompt Template:**
> "I am building an interactive coding exercise app. Please create an array of exercises covering [INSERT TOPIC HERE, e.g., Advanced SQL Window Functions]. Provide the output as a TypeScript array using the following schema:
>
> ```typescript
> export type Exercise = {
>    id: number;           // Sequential ID
>    tag: string;          // e.g. "Pandas", "SQL", "Airflow"
>    q: string;            // The interview question or task description
>    a: string;            // The exact answer code or explanation
>    lang?: string;        // "python", "sql", "bash", "text", etc. (for syntax highlighting)
> };
> ```
> Ensure the output is valid TypeScript and ready to be imported."


### 2. Adding Documentation Pages

Documentation pages are styled automatically using a structured block system. You just provide the arrays of blocks (text, code, tables, callouts) and the platform renders a beautiful page with syntax highlighting and a Table of Contents.

#### Using the Doc Wizard
1. Run the app and navigate to **`/wizard/doc`** (e.g., `http://localhost:3000/wizard/doc`).
2. Set your page Title, Subtitle, and Accent Color.
3. Add Content Blocks (Headings, Paragraphs, Code, Callouts, Tables, Comparisons, Lists).
4. Organize them via up/down arrows.
5. View the **Live Preview** tab to review formatting.
6. Click **Export Code** to copy the generated data object.
7. Paste this into a new file in `data/de/` or `data/ml/` (e.g., `data/ml/my-topic.ts`).
8. Create a new page route under `app/docs/de/...` or `app/docs/ml/...` that renders the `<DocSection />` component using your new data.
9. Link to your new page from the main index in `app/docs/de/page.tsx` or `app/docs/ml/page.tsx`.

#### Generating Docs using AI
To generate complete documentation pages using AI, provide the AI with your topic and the exact schema. Use the detailed prompt below:

> **AI Prompt Template:**
> "I need to construct a documentation page about [INSERT TOPIC HERE, e.g., Machine Learning Fundamentals]. 
> Please output a precise TypeScript object conforming to the schema below.
> 
> Here is the schema you must follow strictly:
> 
> ```typescript
> export type DocBlock =
>     | { type: "h2"; text: string }  // Used for main section headers (appears in Table of Contents)
>     | { type: "h3"; text: string }  // Used for sub-sections (appears in Table of Contents)
>     | { type: "p"; text: string }   // Standard paragraph text
>     | { type: "callout"; variant: "info" | "warning" | "tip" | "important"; text: string } // Colored information boxes
>     | { type: "code"; lang: string; code: string } // Code block. lang can be 'sql', 'python', 'bash', 'text', etc.
>     | { type: "list"; items: string[] }            // Bulleted lists
>     | { type: "table"; headers: string[]; rows: string[][] } // Data tables (make sure rows have same length as headers)
>     | { type: "comparison"; left: { label: string; items: string[] }; right: { label: string; items: string[] } } // Good vs Bad, Old vs New comparisons
>     | { type: "divider" }; // Horizontal rule
> 
> export type DocPageData = {
>     title: string;
>     subtitle: string;
>     accent: string;       // A hex color string representing the topic theme (e.g., "#3b82f6" for SQL)
>     blocks: DocBlock[];
> };
> ```
> 
> Please generate a full, highly detailed `DocPageData` object that deeply explains the topic. Provide only valid TypeScript code that exports the `data` object."

---

## 🛠 Project Structure

- `app/` - Next.js App Router codebase.
- `app/components/` - Shared UI components (e.g., `DocSection.tsx`, `ExerciseBank.tsx`).
- `app/wizard/` - The visual visual content generation wizards (`/wizard/doc` and `/wizard/exercise`).
- `data/` - Content definitions mapped to TypeScript objects using the schemas.

*Feedback and contributions are welcome!*
