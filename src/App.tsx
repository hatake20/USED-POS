import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

function App() {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-xl font-bold mb-4">USED POS システム</h1>
      <div className="flex gap-2 mb-6">
        <Button>ダッシュボード</Button>
        <Button>設定</Button>
        <Button>買取</Button>
        <Button>販売</Button>
        <Button>顧客管理</Button>
        <Button>商品管理</Button>
        <Button>在庫設定</Button>
        <Button onClick={() => setShowForm((prev) => !prev)}>査定</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">本日の売上</p>
            <p className="text-xl font-bold">¥0</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">本日の買取</p>
            <p className="text-xl font-bold">¥0</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">総在庫数</p>
            <p className="text-xl font-bold">0</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">在庫不足</p>
            <p className="text-xl font-bold">0</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">査定待ち</p>
            <p className="text-xl font-bold">0</p>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <div className="mt-8 space-y-4 bg-white p-6 rounded shadow-md max-w-xl">
          <h2 className="text-lg font-semibold">査定フォーム</h2>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="item">商品名</Label>
              <Input id="item" placeholder="例：iPhone 14 Pro" />
            </div>
            <div>
              <Label htmlFor="price">買取希望額</Label>
              <Input id="price" type="number" placeholder="例：50000" />
            </div>
            <div>
              <Label htmlFor="condition">状態</Label>
              <Input id="condition" placeholder="例：目立つ傷なし" />
            </div>
            <Button className="w-full">送信</Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
