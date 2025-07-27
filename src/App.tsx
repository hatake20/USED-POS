import { useState } from "react";

const menuItems = [
  "ダッシュボード",
  "設定",
  "買取",
  "販売",
  "顧客管理",
  "商品管理",
  "在庫設定"
];

export default function App() {
  const [active, setActive] = useState("ダッシュボード");

  return (
    <div style={{ fontFamily: "sans-serif", background: "#f9fafb", minHeight: "100vh", padding: "1rem" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "1.5rem" }}>📊 USED POS システム</h1>

      {/* メニュー */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "2rem" }}>
        {menuItems.map((item) => (
          <button
            key={item}
            onClick={() => setActive(item)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              border: "1px solid #ccc",
              background: active === item ? "#1d4ed8" : "#fff",
              color: active === item ? "#fff" : "#333",
              fontWeight: active === item ? "bold" : "normal",
              cursor: "pointer"
            }}
          >
            {item}
          </button>
        ))}
      </div>

      {/* 表示内容 */}
      {active === "ダッシュボード" && (
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Card title="本日の売上" value="¥0" />
          <Card title="本日の買取" value="¥0" />
          <Card title="総在庫数" value="0" />
          <Card title="在庫不足" value="0" />
          <Card title="査定待ち" value="0" />
        </div>
      )}

      {active !== "ダッシュボード" && (
        <div style={{ fontSize: "16px", color: "#555" }}>
          「{active}」ページの中身はまだ未実装です。
        </div>
      )}
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "1rem",
        minWidth: "150px",
        flex: "1"
      }}
    >
      <p style={{ fontSize: "14px", color: "#6b7280" }}>{title}</p>
      <p style={{ fontSize: "20px", fontWeight: "bold", marginTop: "0.5rem" }}>{value}</p>
    </div>
  );
}
