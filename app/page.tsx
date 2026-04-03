"use client";

import React, { useEffect, useState } from "react";
import { toPng } from "html-to-image";

export default function Home() {
  const [text, setText] = useState("");
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("logs");
    if (saved) setLogs(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("logs", JSON.stringify(logs));
  }, [logs]);

  const handleSave = () => {
    if (!text.trim()) {
      alert("内容を書いて");
      return;
    }
    setLogs([text, ...logs]);
    setText("");
  };

const handleSend = async () => {
  if (!text.trim()) {
    alert("内容を書いて");
    return;
  }

  try {
    const res = await fetch("/api/send-report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        report: {
          date: new Date().toISOString().slice(0, 10),
          majorOutcome: text,
          insight: "",
          nextAction: "",
          totalHours: 1,
          items: [],
        },
      }),
    });

    const result = await res.json();
    console.log(result);
    alert(JSON.stringify(result));
  } catch (error) {
    console.error(error);
    alert("送信エラーが出た");
  }
};

  const handleImage = async () => {
    const node = document.getElementById("capture");
    if (!node) return;

    const dataUrl = await toPng(node);
    const link = document.createElement("a");
    link.download = "report.png";
    link.href = dataUrl;
    link.click();
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>日報アプリ</h1>

      <textarea
        placeholder="今日の内容"
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ width: "100%", height: 100 }}
      />

      <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
        <button onClick={handleSave}>保存</button>
        <button onClick={handleSend}>Sheets送信</button>
        <button onClick={handleImage}>画像保存</button>
      </div>

      <div
        id="capture"
        style={{
          marginTop: 30,
          padding: 20,
          border: "1px solid #ccc",
          borderRadius: 8,
        }}
      >
        <h2>履歴</h2>
        {logs.length === 0 ? <div>まだ保存なし</div> : null}
        {logs.map((l, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}