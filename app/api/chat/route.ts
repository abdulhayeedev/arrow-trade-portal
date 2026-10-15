import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isStaff } from "@/lib/admin";
import { runChat, type ChatTurn } from "@/lib/chat/gemini";

export const maxDuration = 30;

const DAILY_LIMIT = Number(process.env.CHAT_DAILY_LIMIT ?? 30);
const MAX_HISTORY = 12;
const MAX_MESSAGE_CHARS = 1500;

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Please sign in to use the assistant." }, { status: 401 });
  }

  // CHAT_ENABLED: "off" (default), "staff" (pilot) or "all".
  const mode = process.env.CHAT_ENABLED ?? "off";
  const staff = await isStaff(user.id);
  if (!(mode === "all" || (mode === "staff" && staff))) {
    return NextResponse.json({ error: "The assistant isn't available yet." }, { status: 403 });
  }

  let body: { messages?: ChatTurn[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const history: ChatTurn[] = (body.messages ?? [])
    .filter(
      (m) =>
        (m.role === "user" || m.role === "assistant") &&
        typeof m.text === "string" &&
        m.text.trim() !== ""
    )
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role, text: m.text.slice(0, MAX_MESSAGE_CHARS) }));

  while (history.length > 0 && history[0].role !== "user") history.shift();

  const last = history[history.length - 1];
  if (!last || last.role !== "user") {
    return NextResponse.json({ error: "Please type a message." }, { status: 400 });
  }

  // Usage is counted with the server-only admin client so customers can't reset their own count.
  const admin = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: usage } = await admin
    .from("chat_usage")
    .select("count")
    .eq("user_id", user.id)
    .eq("day", today)
    .maybeSingle();

  const used = usage?.count ?? 0;
  if (used >= DAILY_LIMIT) {
    return NextResponse.json(
      { error: "You've reached today's message limit. You can still send your question to an engineer with an RFQ." },
      { status: 429 }
    );
  }

  await admin
    .from("chat_usage")
    .upsert({ user_id: user.id, day: today, count: used + 1 }, { onConflict: "user_id,day" });

  try {
    const { reply, toolsUsed } = await runChat(history, { supabase });

    await admin.from("chat_logs").insert({
      user_id: user.id,
      user_message: last.text,
      assistant_message: reply,
      tools_used: toolsUsed,
    });

    return NextResponse.json({ reply, remaining: Math.max(0, DAILY_LIMIT - used - 1) });
  } catch (err) {
    console.error("chat error", err);
    return NextResponse.json(
      { error: "The assistant had a problem. Please try again in a moment." },
      { status: 500 }
    );
  }
}