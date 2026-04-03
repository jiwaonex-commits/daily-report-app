import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      reportDate,
      mainAchievement,
      insight,
      nextAction,
      totalHours,
      items,
    } = body;

    if (!reportDate) {
      return NextResponse.json(
        { error: "日付は必須です。" },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "明細は1行以上必要です。" },
        { status: 400 }
      );
    }

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
        mode: "saveDailyReport",
        reportDate,
        mainAchievement,
        insight,
        nextAction,
        totalHours,
        items,
      }),
    });

    const rawText = await gasRes.text();

    let parsed: any = null;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      return NextResponse.json(
        {
          error: "GASからJSON以外が返っています。",
          raw: rawText.substring(0, 1000),
        },
        { status: 500 }
      );
    }

    if (!gasRes.ok) {
      return NextResponse.json(
        {
          error: parsed?.error || "Apps Script 側でエラーが発生しました。",
          raw: rawText.substring(0, 1000),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: parsed,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "サーバーエラーが発生しました。" },
      { status: 500 }
    );
  }
}