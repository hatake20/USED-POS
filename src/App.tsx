import { useState } from "react"

function App() {
  const [showForm, setShowForm] = useState(false)

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>USED POS システム</h1>

      <div style={{ marginTop: "20px" }}>
        <button onClick={() => setShowForm(true)} style={buttonStyle}>査定</button>
        <button onClick={() => setShowForm(false)} style={{ ...buttonStyle, marginLeft: "10px" }}>閉じる</button>
      </div>

      {showForm && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: "20px", marginBottom: "10px" }}>査定フォーム</h2>
          <div style={{ marginBottom: "10px" }}>
            <label>顧客名</label><br />
            <input type="text" placeholder="山田太郎" style={inputStyle} />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>電話番号</label><br />
            <input type="tel" placeholder="080-xxxx-xxxx" style={inputStyle} />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>商品情報</label><br />
            <input type="text" placeholder="iPhone 13 など" style={inputStyle} />
          </div>
          <button style={submitStyle}>送信</button>
        </div>
      )}
    </div>
  )
}

const buttonStyle = {
  background: "#2563eb",
  color: "white",
  padding: "8px 16px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
}

const submitStyle = {
  ...buttonStyle,
  width: "100%",
  marginTop: "10px"
}

const inputStyle = {
  width: "100%",
  padding: "8px",
  borderRadius: "4px",
  border: "1px solid #ccc",
  marginTop: "4px"
}

const cardStyle = {
  marginTop: "20px",
  padding: "20px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  background: "#fff",
  maxWidth: "400px"
}

export default App
