export default function App() {
  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "1rem" }}>USED POS ダッシュボード</h1>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <div style={{ padding: "1rem", background: "#f4f4f4", borderRadius: "8px", minWidth: "150px" }}>
          <p style={{ fontSize: "14px", color: "#555" }}>本日の売上</p>
          <p style={{ fontSize: "20px", fontWeight: "bold" }}>¥0</p>
        </div>

        <div style={{ padding: "1rem", background: "#f4f4f4", borderRadius: "8px", minWidth: "150px" }}>
          <p style={{ fontSize: "14px", color: "#555" }}>本日の買取</p>
          <p style={{ fontSize: "20px", fontWeight: "bold" }}>¥0</p>
        </div>

        <div style={{ padding: "1rem", background: "#f4f4f4", borderRadius: "8px", minWidth: "150px" }}>
          <p style={{ fontSize: "14px", color: "#555" }}>総在庫</p>
          <p style={{ fontSize: "20px", fontWeight: "bold" }}>0</p>
        </div>
      </div>
    </div>
  );
}
