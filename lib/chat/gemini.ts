import { GoogleGenAI } from "@google/genai";
import type { Content, Part } from "@google/genai";
import { toolDeclarations, runTool, type ToolContext } from "@/lib/chat/tools";
import { SYSTEM_PROMPT } from "@/lib/chat/prompt";

export type ChatTurn = { role: "user" | "assistant"; text: string };

const MAX_STEPS = 5;

export async function runChat(
  history: ChatTurn[],
  ctx: ToolContext
): Promise<{ reply: string; toolsUsed: string[]; searchQuery?: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL;
  if (!apiKey || !model) {
    throw new Error("The assistant is not configured (GEMINI_API_KEY and GEMINI_MODEL are required).");
  }

  const ai = new GoogleGenAI({ apiKey });

  const contents: Content[] = history.map((turn) => ({
    role: turn.role === "user" ? "user" : "model",
    parts: [{ text: turn.text }],
  }));

  const toolsUsed: string[] = [];
  let searchQuery: string | undefined;

  for (let step = 0; step < MAX_STEPS; step++) {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.2,
        maxOutputTokens: 1024,
        tools: [
          {
            functionDeclarations: toolDeclarations.map((t) => ({
              name: t.name,
              description: t.description,
              parametersJsonSchema: t.parameters,
            })),
          },
        ],
      },
    });

    const calls = response.functionCalls ?? [];
    const modelContent = response.candidates?.[0]?.content;

    if (calls.length === 0 || !modelContent) {
      const text = (response.text ?? "").trim();
      return {
        reply:
          text ||
          "Sorry, I couldn't put an answer together. Please try again, or send it to an Arrow engineer with an RFQ.",
        toolsUsed,
        searchQuery,
      };
    }

    // Keep the model's turn exactly as returned: it can carry signatures the API needs back.
    contents.push(modelContent);

    const responseParts: Part[] = [];
    for (const call of calls) {
      toolsUsed.push(call.name ?? "unknown");
      if (call.name === "search_products") {
        const q = String((call.args as Record<string, unknown> | undefined)?.query ?? "").trim();
        if (q) searchQuery = q;
      }
      const result = await runTool(call.name ?? "", (call.args ?? {}) as Record<string, unknown>, ctx);
      responseParts.push({
        functionResponse: { id: call.id, name: call.name, response: { output: result } },
      });
    }
    contents.push({ role: "user", parts: responseParts });
  }

  return {
    reply:
      "That needs more than I can safely work out here. Please send it to an Arrow engineer with an RFQ and they'll pick it up.",
    toolsUsed,
  };
}