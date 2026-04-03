import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const scriptUrl =
      "https://script.google.com/macros/s/AKfycbxUGL8_hi0E3q83m1h3Ejn6lLAbStOjHZxp0lO8ubLMfHa6NtOxA4ztTM7sFZh6mHQNzw/exec";

    const res = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();

    return NextResponse.json({
      ok: true,
      status: res.status,
      body: text,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, message: "API route error" },
      { status: 500 }
    );
  }
}