import React, { useState } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'assess' | 'sales' | 'stock' | 'profit'>('home');
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('');
  const [salesProduct, setSalesProduct] = useState('');
  const [salesPrice, setSalesPrice] = useState('');
  const [salesChannel, setSalesChannel] = useState('');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <p className="p-4">ホーム画面（今後追加予定）</p>;
      case 'assess':
        return (
          <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold mb-4">査定フォーム</h2>
            <div>
              <label className="block mb-1">商品名</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="例: iPhone 12"
              />
            </div>
            <div>
              <label className="block mb-1">買取価格</label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="例: 25000"
              />
            </div>
            <div>
              <label className="block mb-1">状態</label>
              <select
                className="w-full p-2 border rounded"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              >
                <option value="">選択してください</option>
                <option value="新品">新品</option>
                <option value="未使用に近い">未使用に近い</option>
                <option value="良い">良い</option>
                <option value="可">可</option>
              </select>
            </div>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() => alert(`送信完了\n商品名: ${productName}\n買取価格: ${price}\n状態: ${condition}`)}
            >
              送信
            </button>
          </div>
        );
      case 'sales':
        return (
          <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold mb-4">販売フォーム</h2>
            <div>
              <label className="block mb-1">商品名</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={salesProduct}
                onChange={(e) => setSalesProduct(e.target.value)}
                placeholder="例: Switch Lite"
              />
            </div>
            <div>
              <label className="block mb-1">売値</label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={salesPrice}
                onChange={(e) => setSalesPrice(e.target.value)}
                placeholder="例: 19800"
              />
            </div>
            <div>
              <label className="block mb-1">販売先</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={salesChannel}
                onChange={(e) => setSalesChannel(e.target.value)}
                placeholder="例: メルカリ"
              />
            </div>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded"
              onClick={() => alert(`送信完了\n商品名: ${salesProduct}\n売値: ${salesPrice}\n販売先: ${salesChannel}`)}
            >
              送信
            </button>
          </div>
        );
      case 'stock':
        return (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">在庫一覧</h2>
            <p>※ スプレッドシートと連携予定。現在は仮表示。</p>
            <ul className="list-disc ml-6">
              <li>iPhone 12 - 5台 - ¥125,000</li>
              <li>Switch Lite - 3台 - ¥59,400</li>
            </ul>
            <p className="mt-4 font-semibold">トータル在庫資産：¥184,400</p>
          </div>
        );
      case 'profit':
        return (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">損益確認</h2>
            <p>※ 月別・日別・年別・指定日時別（カテゴリ・販路別）での表示は今後追加予定です。</p>
            <p>ここに売上カレンダーやグラフを実装予定です。</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="flex space-x-4 bg-white shadow px-6 py-4">
        <button onClick={() => setActiveTab('home')} className="hover:underline">ホーム</button>
        <button onClick={() => setActiveTab('assess')} className="hover:underline">査定</button>
        <button onClick={() => setActiveTab('sales')} className="hover:underline">販売</button>
        <button onClick={() => setActiveTab('stock')} className="hover:underline">在庫</button>
        <button onClick={() => setActiveTab('profit')} className="hover:underline">損益</button>
      </nav>
      <main className="p-4">
        {renderContent()}
      </main>
    </div>
  );
}
