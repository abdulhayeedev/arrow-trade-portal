import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isStaff } from "@/lib/admin";
import { chatEnabledFor } from "@/lib/chat/enabled";
import { runChat, type ChatTurn } from "@/lib/chat/gemini";

export const maxDuration = 30;

const DAILY_LIMIT = Number(process.env.CHAT_DAILY_LIMIT ?? 30);
const MAX_HISTORY = 12;
const MAX_MESSAGE_CHARS = 1500;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function titleFrom(message: string): string {
  const clean = message.replace(/\s+/g, " ").trim();
  return clean.length > 60 ? `${clean.slice(0, 57)}...` : clean;
}

async function handle(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Please sign in to use the assistant." }, { status: 401 });
  }

  const staff = await isStaff(user.id);
  if (!chatEnabledFor(true, staff)) {
    return NextResponse.json({ error: "The assistant isn't available yet." }, { status: 403 });
  }

  let body: { conversationId?: string | null; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const message = (typeof body.message === "string" ? body.message : "").trim().slice(0, MAX_MESSAGE_CHARS);
  if (!message) {
    return NextResponse.json({ error: "Please type a message." }, { status: 400 });
  }

  const conversationId =
    typeof body.conversationId === "string" && UUID.test(body.conversationId) ? body.conversationId : null;

  // The conversation's earlier messages come from the database, not from the browser.
  let history: ChatTurn[] = [];
  if (conversationId) {
    const { data: conv } = await supabase
      .from("chat_conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!conv) {
      return NextResponse.json({ error: "That conversation could not be found." }, { status: 404 });
    }

    const { data: rows } = await supabase
      .from("chat_messages")
      .select("role, text")
      .eq("conversation_id", conversationId)
      .order("seq", { ascending: false })
      .limit(MAX_HISTORY);

    history = (rows ?? [])
      .reverse()
      .map((r) => ({ role: r.role as "user" | "assistant", text: r.text as string }));
    while (history.length > 0 && history[0].role !== "user") history.shift();
  }
  history.push({ role: "user", text: message });

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
    const { reply, toolsUsed, searchQuery } = await runChat(history, { supabase });

    // Staff review log (unchanged).
    await admin.from("chat_logs").insert({
      user_id: user.id,
      user_message: message,
      assistant_message: reply,
      tools_used: toolsUsed,
    });

    // Save the exchange to the customer's chat history.
    let savedId: string | null = conversationId;
    let title: string | undefined;
    const updatedAt = new Date().toISOString();

    try {
      if (!savedId) {
        title = titleFrom(message);
        const { data: created, error: createError } = await admin
          .from("chat_conversations")
          .insert({ user_id: user.id, title })
          .select("id")
          .single();
        if (createError || !created) throw createError ?? new Error("Could not create the conversation.");
        savedId = created.id as string;
      }

      const { error: saveError } = await admin.from("chat_messages").insert([
        { conversation_id: savedId, user_id: user.id, role: "user", text: message },
        {
          conversation_id: savedId,
          user_id: user.id,
          role: "assistant",
          text: reply,
          search_query: searchQuery ?? null,
        },
      ]);
      if (saveError) throw saveError;

      await admin.from("chat_conversations").update({ updated_at: updatedAt }).eq("id", savedId);
    } catch (saveErr) {
      // The answer is still shown; it just won't appear in the history.
      console.error("chat history save error", saveErr);
      savedId = conversationId;
    }

    return NextResponse.json({
      reply,
      searchQuery,
      conversationId: savedId,
      title,
      updatedAt,
      remaining: Math.max(0, DAILY_LIMIT - used - 1),
    });
  } catch (err) {
    console.error("chat error", err);

    // Google answers 429 when the project's quota is used up.
    if ((err as { status?: number })?.status === 429) {
      return NextResponse.json(
        {
          error:
            "The assistant has reached its capacity for now. Please try again later, or send your question to an engineer with an RFQ.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "The assistant had a problem. Please try again in a moment." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    return await handle(request);
  } catch (err) {
    console.error("chat route error", err);
    return NextResponse.json(
      { error: "The assistant is unavailable right now. Please try again in a moment." },
      { status: 500 }
    );
  }
}