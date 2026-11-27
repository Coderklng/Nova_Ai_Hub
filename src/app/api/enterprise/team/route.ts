import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    members: [],
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const action = String(body?.action || "add");
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim();
    const pod = String(body?.pod || "").trim();
    const role = String(body?.role || "Builder").trim();

    if (action === "add" && (!name || !email)) {
      return NextResponse.json(
        { error: "Member name and email are required." },
        { status: 400 }
      );
    }

    if (
      action === "add" &&
      process.env.RESEND_API_KEY &&
      process.env.ALERT_TO_EMAIL
    ) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "NovaAI Alerts <onboarding@resend.dev>",
          to: [process.env.ALERT_TO_EMAIL],
          subject: `Enterprise Team Member Added: ${name} (${role})`,
          text: `Name: ${name}\nEmail: ${email}\nPod: ${pod}\nRole: ${role}`,
        }),
      }).catch(() => {});
    }

    return NextResponse.json({
      ok: true,
      action,
      member: { name, email, pod, role },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to sync team update." },
      { status: 500 }
    );
  }
}