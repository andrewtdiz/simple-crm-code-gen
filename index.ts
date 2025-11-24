import { b } from "./baml_client";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { $ } from "bun";

async function main() {
    const totalStartTime = performance.now();
    const query = process.argv.slice(2).join(" ");

    if (!query) {
        console.error("Usage: bun run index.ts <your command>");
        console.error('Example: bun run index.ts "Set user id 2 status to prospect"');
        process.exit(1);
    }

    console.log(`📝 Query: ${query}`);

    const codeTemplate = readFileSync(join(import.meta.dir, "code.ts"), "utf-8");

    console.log("🤖 Calling BAML CodeTask...");
    const startTime = performance.now();

    const rawResponse = await b.CodeTask(query);

    const bamlDuration = performance.now() - startTime;

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
console.log(sheet);
process.exit(result ? 0 : 1);
`;

    console.log("🚀 Executing generated code...");
    console.log("---");
    const execStartTime = performance.now();

    try {
        await $`bun -e ${executableScript}`;
        const execDuration = performance.now() - execStartTime;
        const totalDuration = performance.now() - totalStartTime;
        console.log("---");
        console.log(`✅ Command executed successfully in ${execDuration.toFixed(2)}ms`);
        console.log(`⏱️  BAML call took ${bamlDuration.toFixed(2)}ms`);
        console.log(`⏱️  Total time: ${totalDuration.toFixed(2)}ms`);
    } catch (error) {
        const execDuration = performance.now() - execStartTime;
        const totalDuration = performance.now() - totalStartTime;
        console.log("---");
        console.error(`❌ Command failed after ${execDuration.toFixed(2)}ms (total: ${totalDuration.toFixed(2)}ms):`, error);
        process.exit(1);
    }
}

main().catch(console.error);

