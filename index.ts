import { b } from "./baml_client";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { $ } from "bun";

async function main() {
    const query = process.argv.slice(2).join(" ");

    if (!query) {
        console.error("Usage: bun run index.ts <your command>");
        console.error('Example: bun run index.ts "Set user id 2 status to prospect"');
        process.exit(1);
    }

    console.log(`📝 Query: ${query}`);

    const codeTemplate = readFileSync(join(import.meta.dir, "code.ts"), "utf-8");

    console.log("🤖 Calling BAML CodeTask...");

    const rawResponse = await b.CodeTask(query);

    const codeBlockMatch = rawResponse.match(/```(?:ts|typescript)?\n([\s\S]*?)```/);
    let generatedCode = codeBlockMatch?.[1]?.trim() ?? rawResponse.trim();

    const fullFunctionMatch = generatedCode.match(/function\s+executeCommand\s*\([^)]*\)\s*:\s*boolean\s*\{([\s\S]*)\}/);
    const generatedFunctionBody = fullFunctionMatch?.[1]?.trim() ?? generatedCode;

    console.log("✅ Generated code:");
    console.log(generatedFunctionBody);
    console.log("");

    const completeCode = codeTemplate.replace(
        /function executeCommand\(\): boolean \{[\s\S]*?\}/,
        `function executeCommand(): boolean {\n  ${generatedFunctionBody}\n}`
    );

    const codeWithoutImport = completeCode.replace(
        /import\s+\{[^}]+\}\s+from\s+["']\.\/sheets["'];?\s*/,
        ""
    );

    const sheetsCode = readFileSync(join(import.meta.dir, "sheets.ts"), "utf-8");

    const executableScript = `
${sheetsCode}

${codeWithoutImport}

// Execute the command
const result = executeCommand();
console.log("Result:", result);
process.exit(result ? 0 : 1);
`;

    console.log("🚀 Executing generated code...");
    console.log("---");

    try {
        await $`bun -e ${executableScript}`;
        console.log("---");
        console.log("✅ Command executed successfully");
    } catch (error) {
        console.log("---");
        console.error("❌ Command failed:", error);
        process.exit(1);
    }
}

main().catch(console.error);

