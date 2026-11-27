import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const fullName = String(body?.fullName ?? "").trim();
    const workEmail = String(body?.workEmail ?? "").trim();
    const company = String(body?.company ?? "").trim();
    const teamSize = String(body?.teamSize ?? "").trim();
    const useCase = String(body?.useCase ?? "").trim();

    if (!fullName || !workEmail || !company) {
      return NextResponse.json(
        { error: "Full name, work email, and company are required." },
        { status: 400 }
      );
    }

    const resendKey = process.env.RESEND_API_KEY;
    const alertEmail =
      process.env.ALERT_TO_EMAIL || "kkartiksharma999@gmail.com";

    if (!resendKey) {
      return NextResponse.json(
        { error: "RESEND_API_KEY is missing in environment." },
        { status: 500 }
      );
    }

    const emailBody = [
      `New Enterprise Inquiry: ${company}`,
      `Contact: ${fullName} (${workEmail})`,
      `Team Size: ${teamSize || "N/A"}`,
      useCase ? `Requirements:\n${useCase}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: "NovaAI Enterprise <onboarding@resend.dev>",
        to: [alertEmail],
        subject: `Enterprise Inquiry: ${company} (${teamSize || "Team"})`,
        text: emailBody,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text().catch(() => "");
      return NextResponse.json(
        { error: `Resend failed (${resendRes.status}): ${errText}` },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Enterprise inquiry sent via Resend",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to process enterprise inquiry." },
      { status: 500 }
    );
  }
}