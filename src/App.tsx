import { useState } from "react";

export default function App() {
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("");

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-md mx-auto bg-white shadow-lg rounded-2xl p-6 space-y-4">
        <h1 className="text-2xl font-bold mb-4">📦 査定フォーム</h1>

        <div>
          <label className="block text-sm font-medium text-gray-700">商品名</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="例：iPhone 13 Pro"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">買取価格（円）</label>
          <input
            type="number"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="例：45000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">状態</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          >
            <option value="">選択してください</option>
            <option value="新品">新品</option>
            <option value="未使用">未使用</option>
            <option value="美品">美品</option>
            <option value="傷・汚れあり">傷・汚れあり</option>
            <option value="ジャンク">ジャンク</option>
          </select>
        </div>

        <button
          onClick={() => alert("送信されました")}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded-xl shadow hover:bg-blue-700"
        >
          査定内容を送信
        </button>
      </div>
    </div>
  );
}
