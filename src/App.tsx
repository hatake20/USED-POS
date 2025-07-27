import { useState } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'assessment'>('home');
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    itemCount: '',
    totalEstimatedValue: '',
    itemDetails: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const payload = {
      action: 'appendData',
      sheetName: '査定データ',
      data: {
        ...formData,
        timestamp: new Date().toLocaleString('ja-JP'),
        status: '査定中',
      },
    };

    try {
      const res = await fetch('あなたのGAS WebApp URL', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('送信完了');
        setFormData({
          customerName: '',
          customerPhone: '',
          itemCount: '',
          totalEstimatedValue: '',
          itemDetails: '',
        });
      } else {
        alert('送信失敗');
      }
    } catch (error) {
      alert('送信エラー: ' + error);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex gap-4 mb-4">
        <button onClick={() => setActiveTab('home')} className={`px-4 py-2 rounded ${activeTab === 'home' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>ホーム</button>
        <button onClick={() => setActiveTab('assessment')} className={`px-4 py-2 rounded ${activeTab === 'assessment' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>査定</button>
      </div>

      {activeTab === 'home' && (
        <div className="text-gray-700">
          <p>メイン画面です。メニューから操作を選んでください。</p>
        </div>
      )}

      {activeTab === 'assessment' && (
        <div className="border p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">査定入力</h2>
          <input className="w-full mb-2 p-2 border rounded" name="customerName" placeholder="顧客名" value={formData.customerName} onChange={handleChange} />
          <input className="w-full mb-2 p-2 border rounded" name="customerPhone" placeholder="電話番号" value={formData.customerPhone} onChange={handleChange} />
          <input className="w-full mb-2 p-2 border rounded" name="itemCount" placeholder="商品数" value={formData.itemCount} onChange={handleChange} />
          <input className="w-full mb-2 p-2 border rounded" name="totalEstimatedValue" placeholder="見積額" value={formData.totalEstimatedValue} onChange={handleChange} />
          <textarea className="w-full mb-2 p-2 border rounded" name="itemDetails" placeholder="商品詳細" value={formData.itemDetails} onChange={handleChange} />
          <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 w-full" onClick={handleSubmit}>送信</button>
        </div>
      )}
    </div>
  );
}

