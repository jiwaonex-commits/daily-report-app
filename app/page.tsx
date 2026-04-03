"use client";

import { useMemo, useState } from "react";

type ReportItem = {
  industryTag: string;
  workType: string;
  workDetail: string;
  hours: string;
  result: string;
  note: string;
};

const createEmptyItem = (): ReportItem => ({
  industryTag: "",
  workType: "",
  workDetail: "",
  hours: "",
  result: "",
  note: "",
});

export default function Page() {
  const [reportDate, setReportDate] = useState("");
  const [mainAchievement, setMainAchievement] = useState("");
  const [insight, setInsight] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [items, setItems] = useState<ReportItem[]>([createEmptyItem()]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // 合計時間
  const totalHours = useMemo(() => {
    return items.reduce((sum, item) => {
      const num = parseFloat(item.hours || "0");
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
  }, [items]);

  // 明細更新
  const updateItem = (index: number, key: keyof ReportItem, value: string) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      )
    );
  };

  // 明細追加
  const addItem = () => {
    setItems((prev) => [...prev, createEmptyItem()]);
  };

  // 明細削除
  const removeItem = (index: number) => {
    setItems((prev) => {
      if (prev.length === 1) return [createEmptyItem()];
      return prev.filter((_, i) => i !== index);
    });
  };

  // 送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!reportDate) {
      setMessage("日付を入力してください");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/daily-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportDate,
          mainAchievement,
          insight,
          nextAction,
          totalHours,
          items,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "保存失敗");

      setMessage("保存しました");
      setItems([createEmptyItem()]);
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">日報入力</h1>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ヘッダ */}
        <div className="border p-4 rounded space-y-3">
          <input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} className="w-full border p-2" />
          <textarea placeholder="主要成果" value={mainAchievement} onChange={(e) => setMainAchievement(e.target.value)} className="w-full border p-2" />
          <textarea placeholder="気づき" value={insight} onChange={(e) => setInsight(e.target.value)} className="w-full border p-2" />
          <textarea placeholder="次アクション" value={nextAction} onChange={(e) => setNextAction(e.target.value)} className="w-full border p-2" />
          <input value={totalHours} readOnly className="w-full border p-2 bg-gray-100" />
        </div>

        {/* 明細 */}
        <div className="space-y-4">
          <button type="button" onClick={addItem} className="bg-blue-600 text-white px-4 py-2 rounded">
            ＋追加
          </button>

          {items.map((item, index) => (
            <div key={index} className="border p-4 rounded space-y-3 bg-gray-50">

              <button type="button" onClick={() => removeItem(index)} className="text-red-500">
                削除
              </button>

              <input placeholder="業種タグ" value={item.industryTag} onChange={(e) => updateItem(index, "industryTag", e.target.value)} className="w-full border p-2" />

              <input placeholder="業務種別" value={item.workType} onChange={(e) => updateItem(index, "workType", e.target.value)} className="w-full border p-2" />

              <textarea placeholder="業務内容" value={item.workDetail} onChange={(e) => updateItem(index, "workDetail", e.target.value)} className="w-full border p-2" rows={3} />

              <input type="number" placeholder="時間（例：1.5）" value={item.hours} onChange={(e) => updateItem(index, "hours", e.target.value)} className="w-full border p-2" />

              <textarea placeholder="成果" value={item.result} onChange={(e) => updateItem(index, "result", e.target.value)} className="w-full border p-2" rows={3} />

              <textarea placeholder="備考" value={item.note} onChange={(e) => updateItem(index, "note", e.target.value)} className="w-full border p-2" rows={3} />

            </div>
          ))}
        </div>

        <button type="submit" disabled={loading} className="bg-green-600 text-white px-6 py-3 rounded">
          {loading ? "保存中..." : "保存"}
        </button>

        {message && <p>{message}</p>}
      </form>
    </main>
  );
}