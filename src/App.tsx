import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    product: "",
    condition: "",
    price: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await fetch("あなたのGAS WebApp URL", {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      alert("送信しました");
      setFormData({
        name: "",
        phone: "",
        product: "",
        condition: "",
        price: "",
      });
    } catch (err) {
      alert("送信に失敗しました");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">USED POS システム</h1>
        <Button
          variant={activeTab === "dashboard" ? "default" : "outline"}
          onClick={() => setActiveTab("dashboard")}
        >
          ダッシュボード
        </Button>
        <Button
          variant={activeTab === "assessment" ? "default" : "outline"}
          onClick={() => setActiveTab("assessment")}
        >
          査定
        </Button>
      </div>

      {activeTab === "dashboard" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm">本日の売上</p><p className="text-xl font-bold">¥0</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm">本日の買取</p><p className="text-xl font-bold">¥0</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm">総在庫数</p><p className="text-xl font-bold">0</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm">在庫不足</p><p className="text-xl font-bold">0</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm">査定待ち</p><p className="text-xl font-bold">0</p></CardContent></Card>
        </div>
      )}

      {activeTab === "assessment" && (
        <div className="grid gap-4 max-w-md">
          <h2 className="text-xl font-bold">査定フォーム</h2>
          <div>
            <Label>名前</Label>
            <Input name="name" value={formData.name} onChange={handleChange} />
          </div>
          <div>
            <Label>電話番号</Label>
            <Input name="phone" value={formData.phone} onChange={handleChange} />
          </div>
          <div>
            <Label>商品名</Label>
            <Input name="product" value={formData.product} onChange={handleChange} />
          </div>
          <div>
            <Label>状態</Label>
            <Input name="condition" value={formData.condition} onChange={handleChange} />
          </div>
          <div>
            <Label>査定額</Label>
            <Input name="price" value={formData.price} onChange={handleChange} />
          </div>
          <Button onClick={handleSubmit}>送信</Button>
        </div>
      )}
    </div>
  );
}
