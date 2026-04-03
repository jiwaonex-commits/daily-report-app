import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "daily-report api is alive",
    hasGasUrl: !!process.env.GAS_WEB_APP_URL,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const gasUrl = process.env.GAS_WEB_APP_URL;

    if (!gasUrl) {
      return NextResponse.json(
        { error: "GAS_WEB_APP_URL が未設定です。" },
        { status: 500 }
      );
    }

    const gasRes = await fetch(gasUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(body),
    });

    const rawText = await gasRes.text();

    let parsed: any;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      return NextResponse.json(
        {
          error: "GASからJSON以外が返っています。",
          raw: rawText.slice(0, 500),
        },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "サーバーエラーが発生しました。" },
      { status: 500 }
    );
  }
}