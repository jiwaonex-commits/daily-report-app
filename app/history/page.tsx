"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Report = {
  reportId: string;
  reportDate: string;
  mainAchievement: string;
  insight: string;
  nextAction: string;
  totalHours: number | string;
  createdAt: string;
};

export default function HistoryPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setMessage("");

        const res = await fetch("/api/daily-report-history", {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "履歴一覧の取得に失敗しました。");
        }

        setReports(data.reports || []);
      } catch (error: any) {
        setMessage(error.message || "エラーが発生しました。");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">日報履歴一覧</h1>
        <Link
          href="/"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          日報入力へ戻る
        </Link>
      </div>

      {loading && <p>読み込み中...</p>}

      {!loading && message && (
        <p className="text-red-600">{message}</p>
      )}

      {!loading && !message && reports.length === 0 && (
        <p>まだ日報はありません。</p>
      )}

      {!loading && !message && reports.length > 0 && (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.reportId}
              className="border rounded-lg p-4 bg-white shadow-sm space-y-3"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <p className="text-sm text-gray-500">日付</p>
                  <p className="font-semibold">{report.reportDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">合計時間</p>
                  <p className="font-semibold">{report.totalHours}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">作成日時</p>
                  <p className="font-semibold">{report.createdAt}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">主要成果</p>
                <p className="whitespace-pre-wrap">
                  {report.mainAchievement || "（未入力）"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">気づき</p>
                <p className="whitespace-pre-wrap">
                  {report.insight || "（未入力）"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">次アクション</p>
                <p className="whitespace-pre-wrap">
                  {report.nextAction || "（未入力）"}
                </p>
              </div>

              <div className="text-xs text-gray-400 break-all">
                reportId: {report.reportId}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}