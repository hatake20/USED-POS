import React, { useState } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'assess' | 'sales' | 'stock' | 'profit'>('home');
  const [assessments, setAssessments] = useState([]);
  const [sales, setSales] = useState([]);
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('');
  const [salesProduct, setSalesProduct] = useState('');
  const [salesPrice, setSalesPrice] = useState('');
  const [salesChannel, setSalesChannel] = useState('');

  const handleAssessSubmit = () => {
    const newItem = { productName, price, condition };
    setAssessments([...assessments, newItem]);
    setProductName('');
    setPrice('');
    setCondition('');
  };

  const handleSalesSubmit = () => {
    const newItem = { salesProduct, salesPrice, salesChannel };
    setSales([...sales, newItem]);
    setSalesProduct('');
    setSalesPrice('');
    setSalesChannel('');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <p className="p-4">ホーム画面（今後追加予定）</p>;
      case 'assess':
        return (
          <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold mb-4">査定フォーム</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
              onClick={handleAssessSubmit}
            >
              追加
            </button>
            <ul className="mt-4 space-y-2">
              {assessments.map((item, i) => (
                <li key={i} className="bg-white border p-2 rounded shadow">
                  {item.productName} - ¥{item.price} - {item.condition}
                </li>
              ))}
            </ul>
          </div>
        );
      case 'sales':
        return (
          <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold mb-4">販売フォーム</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
              onClick={handleSalesSubmit}
            >
              追加
            </button>
            <ul className="mt-4 space-y-2">
              {sales.map((item, i) => (
                <li key={i} className="bg-white border p-2 rounded shadow">
                  {item.salesProduct} - ¥{item.salesPrice} - {item.salesChannel}
                </li>
              ))}
            </ul>
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
    <div className="min-h-screen bg-gradient-to-r from-gray-100 to-gray-200 font-sans">
      <nav className="flex space-x-4 bg-white shadow px-6 py-4 border-b">
        <button onClick={() => setActiveTab('home')} className="hover:text-blue-600">ホーム</button>
        <button onClick={() => setActiveTab('assess')} className="hover:text-blue-600">査定</button>
        <button onClick={() => setActiveTab('sales')} className="hover:text-blue-600">販売</button>
        <button onClick={() => setActiveTab('stock')} className="hover:text-blue-600">在庫</button>
        <button onClick={() => setActiveTab('profit')} className="hover:text-blue-600">損益</button>
      </nav>
      <main className="p-4">
        {renderContent()}
      </main>
    </div>
  );
}
