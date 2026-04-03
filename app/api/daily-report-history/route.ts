import { NextResponse } from "next/server";

export async function GET() {
  try {
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
      body: JSON.stringify({
        mode: "getDailyReports",
      }),
      cache: "no-store",
    });

    const rawText = await gasRes.text();

    let parsed: any;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      return NextResponse.json(
        {
          error: "GASからJSON以外が返っています。",
          raw: rawText.slice(0, 1000),
        },
        { status: 500 }
      );
    }

    if (!gasRes.ok) {
      return NextResponse.json(
        {
          error: parsed?.error || "Apps Script 側でエラーが発生しました。",
        },
        { status: 500 }
      );
    }

    if (parsed?.success !== true) {
      return NextResponse.json(
        {
          error: parsed?.error || "履歴一覧の取得に失敗しました。",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reports: parsed.reports || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "サーバーエラーが発生しました。" },
      { status: 500 }
    );
  }
}