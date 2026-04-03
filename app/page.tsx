"use client";

import React, { useEffect, useState } from "react";
import { toPng } from "html-to-image";

const PROJECTS = ["住宅", "ガス", "眼鏡", "フード", "会社", "外部", "個人"];
const CATEGORIES = ["営業", "追客", "集客", "事務", "会議", "移動", "学習", "その他"];

type ReportItem = {
  project: string;
  category: string;
  task: string;
  hours: string;
  outcomeText: string;
  note: string;
};

type ReportData = {
  date: string;
  majorOutcome: string;
  insight: string;
  nextAction: string;
  totalHours: string;
  items: ReportItem[];
};

export default function Home() {
  const today = new Date().toISOString().slice(0, 10);

  const [report, setReport] = useState<ReportData>({
    date: today,
    majorOutcome: "",
    insight: "",
    nextAction: "",
    totalHours: "",
    items: [
      {
        project: "住宅",
        category: "営業",
        task: "",
        hours: "",
        outcomeText: "",
        note: "",
      },
    ],
  });

  const [logs, setLogs] = useState<ReportData[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("daily-report-logs");
    if (saved) setLogs(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("daily-report-logs", JSON.stringify(logs));
  }, [logs]);

  const item = report.items[0];

  const handleSave = () => {
    if (!item.task.trim()) {
      alert("業務内容を書いて");
      return;
    }

    setLogs([report, ...logs]);
    alert("保存しました");
  };

  const handleSend = async () => {
    if (!item.task.trim()) {
      alert("業務内容を書いて");
      return;
    }

    try {
      const res = await fetch("/api/send-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          report,
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
    <div style={{ padding: 30, maxWidth: 900, margin: "0 auto" }}>
      <h1>日報アプリ</h1>

      <div style={{ display: "grid", gap: 12, marginBottom: 20 }}>
        <label>
          日付
          <br />
          <input
            type="date"
            value={report.date}
            onChange={(e) => setReport({ ...report, date: e.target.value })}
            style={{ width: "100%", padding: 8 }}
          />
        </label>

        <label>
          主要成果
          <br />
          <input
            value={report.majorOutcome}
            onChange={(e) => setReport({ ...report, majorOutcome: e.target.value })}
            style={{ width: "100%", padding: 8 }}
          />
        </label>

        <label>
          気づき
          <br />
          <input
            value={report.insight}
            onChange={(e) => setReport({ ...report, insight: e.target.value })}
            style={{ width: "100%", padding: 8 }}
          />
        </label>

        <label>
          次アクション
          <br />
          <input
            value={report.nextAction}
            onChange={(e) => setReport({ ...report, nextAction: e.target.value })}
            style={{ width: "100%", padding: 8 }}
          />
        </label>

        <label>
          合計時間
          <br />
          <input
            value={report.totalHours}
            onChange={(e) => setReport({ ...report, totalHours: e.target.value })}
            placeholder="例: 8"
            style={{ width: "100%", padding: 8 }}
          />
        </label>

        <hr />

        <label>
          業種タグ
          <br />
          <select
            value={item.project}
            onChange={(e) =>
              setReport({
                ...report,
                items: [{ ...item, project: e.target.value }],
              })
            }
            style={{ width: "100%", padding: 8 }}
          >
            {PROJECTS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>

        <label>
          業務種別
          <br />
          <select
            value={item.category}
            onChange={(e) =>
              setReport({
                ...report,
                items: [{ ...item, category: e.target.value }],
              })
            }
            style={{ width: "100%", padding: 8 }}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label>
          業務内容
          <br />
          <input
            value={item.task}
            onChange={(e) =>
              setReport({
                ...report,
                items: [{ ...item, task: e.target.value }],
              })
            }
            style={{ width: "100%", padding: 8 }}
          />
        </label>

        <label>
          時間
          <br />
          <input
            value={item.hours}
            onChange={(e) =>
              setReport({
                ...report,
                items: [{ ...item, hours: e.target.value }],
              })
            }
            placeholder="例: 2"
            style={{ width: "100%", padding: 8 }}
          />
        </label>

        <label>
          成果
          <br />
          <input
            value={item.outcomeText}
            onChange={(e) =>
              setReport({
                ...report,
                items: [{ ...item, outcomeText: e.target.value }],
              })
            }
            style={{ width: "100%", padding: 8 }}
          />
        </label>

        <label>
          備考
          <br />
          <textarea
            value={item.note}
            onChange={(e) =>
              setReport({
                ...report,
                items: [{ ...item, note: e.target.value }],
              })
            }
            style={{ width: "100%", height: 80, padding: 8 }}
          />
        </label>
      </div>

      <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
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
        <h2>入力内容プレビュー</h2>
        <p>日付: {report.date}</p>
        <p>主要成果: {report.majorOutcome}</p>
        <p>気づき: {report.insight}</p>
        <p>次アクション: {report.nextAction}</p>
        <p>合計時間: {report.totalHours}</p>
        <hr />
        <p>業種: {item.project}</p>
        <p>業務種別: {item.category}</p>
        <p>業務内容: {item.task}</p>
        <p>時間: {item.hours}</p>
        <p>成果: {item.outcomeText}</p>
        <p>備考: {item.note}</p>
      </div>
    </div>
  );
}