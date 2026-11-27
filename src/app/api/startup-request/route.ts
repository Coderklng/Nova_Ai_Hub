import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const founderName = String(body?.founderName ?? "").trim();
    const email = String(body?.email ?? "").trim();
    const startupName = String(body?.startupName ?? "").trim();
    const teamCount = String(body?.teamCount ?? "").trim();
    const stage = String(body?.stage ?? "").trim();
    const goalNote = String(body?.goalNote ?? "").trim();

    if (!founderName || !email || !startupName) {
      return NextResponse.json(
        { error: "Founder name, email, and startup name are required." },
        { status: 400 }
      );
    }

    const summaryText = [
      `New Startup Request: ${startupName}`,
      `Founder: ${founderName} (${email})`,
      `Stage: ${stage} | Team: ${teamCount}`,
      goalNote ? `Goal: ${goalNote}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    // 1. Email alert via Resend (optional: set RESEND_API_KEY and ALERT_TO_EMAIL in .env.local)
    if (process.env.RESEND_API_KEY && process.env.ALERT_TO_EMAIL) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "NovaAI Alerts <onboarding@resend.dev>",
          to: [process.env.ALERT_TO_EMAIL],
          subject: `Startup Request: ${startupName} (${stage})`,
          text: summaryText,
        }),
      }).catch(() => {});
    }

    // 2. WhatsApp alert via Meta WhatsApp Cloud API (optional: set WHATSAPP_TOKEN & WHATSAPP_PHONE_NUMBER_ID)
    const targetPhone = (process.env.ALERT_WHATSAPP_TO || "917297821782").replace(
      /^\+/,
      ""
    );
    if (process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
      await fetch(
        `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: targetPhone,
            type: "text",
            text: { body: summaryText },
          }),
        }
      ).catch(() => {});
    }

    return NextResponse.json({ ok: true, message: "Request received" });
  } catch {
    return NextResponse.json(
      { error: "Failed to process startup request." },
      { status: 500 }
    );
  }
}