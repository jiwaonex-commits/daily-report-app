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

const INDUSTRY_TAG_OPTIONS = [
  "",
  "ガス",
  "住宅",
  "眼鏡",
  "直売所",
  "食肉",
  "ランドリー",
  "太陽光",
  "総務",
  "その他",
];

const WORK_TYPE_OPTIONS = [
  "",
  "営業",
  "事務",
  "会議",
  "移動",
  "現場",
  "接客",
  "経営",
  "採用",
  "広報",
  "その他",
];

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

  const totalHours = useMemo(() => {
    return items.reduce((sum, item) => {
      const num = parseFloat(item.hours || "0");
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
  }, [items]);

  const updateItem = (
    index: number,
    key: keyof ReportItem,
    value: string
  ) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      )
    );
  };

  const addItem = () => {
    setItems((prev) => [...prev, createEmptyItem()]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => {
      if (prev.length === 1) {
        return [createEmptyItem()];
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!reportDate) {
      setMessage("日付を入力してください");
      return;
    }

    const validItems = items.filter((item) => {
      return (
        item.industryTag ||
        item.workType ||
        item.workDetail ||
        item.hours ||
        item.result ||
        item.note
      );
    });

    if (validItems.length === 0) {
      setMessage("明細を1行以上入力してください");
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
          items: validItems,
        }),
      });

      const text = await res.text();
      let data: any = {};

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("APIからJSON以外が返っています");
      }

      if (!res.ok) {
        throw new Error(data?.error || "保存失敗");
      }

      setMessage("保存しました");
      setReportDate("");
      setMainAchievement("");
      setInsight("");
      setNextAction("");
      setItems([createEmptyItem()]);
    } catch (err: any) {
      setMessage(err.message || "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">日報入力</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border p-4 rounded space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">日付</label>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">主要成果</label>
            <textarea
              value={mainAchievement}
              onChange={(e) => setMainAchievement(e.target.value)}
              className="w-full border p-2 rounded"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">気づき</label>
            <textarea
              value={insight}
              onChange={(e) => setInsight(e.target.value)}
              className="w-full border p-2 rounded"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">次アクション</label>
            <textarea
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              className="w-full border p-2 rounded"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              合計時間（自動計算）
            </label>
            <input
              value={totalHours}
              readOnly
              className="w-full border p-2 rounded bg-gray-100"
            />
          </div>
        </div>

        <div className="space-y-4">
          <button
            type="button"
            onClick={addItem}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            ＋追加
          </button>

          {items.map((item, index) => (
            <div key={index} className="border p-4 rounded space-y-3 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="font-semibold">明細 {index + 1}</div>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-red-600"
                >
                  削除
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">業種タグ</label>
                <select
                  value={item.industryTag}
                  onChange={(e) =>
                    updateItem(index, "industryTag", e.target.value)
                  }
                  className="w-full border p-2 rounded bg-white"
                >
                  {INDUSTRY_TAG_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option === "" ? "選択してください" : option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">業務種別</label>
                <select
                  value={item.workType}
                  onChange={(e) =>
                    updateItem(index, "workType", e.target.value)
                  }
                  className="w-full border p-2 rounded bg-white"
                >
                  {WORK_TYPE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option === "" ? "選択してください" : option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">業務内容</label>
                <textarea
                  value={item.workDetail}
                  onChange={(e) =>
                    updateItem(index, "workDetail", e.target.value)
                  }
                  className="w-full border p-2 rounded"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">時間</label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  placeholder="例：1.5"
                  value={item.hours}
                  onChange={(e) => updateItem(index, "hours", e.target.value)}
                  className="w-full border p-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">成果</label>
                <textarea
                  value={item.result}
                  onChange={(e) => updateItem(index, "result", e.target.value)}
                  className="w-full border p-2 rounded"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">備考</label>
                <textarea
                  value={item.note}
                  onChange={(e) => updateItem(index, "note", e.target.value)}
                  className="w-full border p-2 rounded"
                  rows={3}
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-6 py-3 rounded disabled:opacity-50"
        >
          {loading ? "保存中..." : "保存"}
        </button>

        {message && <p>{message}</p>}
      </form>
    </main>
  );
}