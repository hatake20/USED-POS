import { useState } from "react"
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Label } from "./components/ui/label"
import { Card, CardContent } from "./components/ui/card"

function App() {
  const [showAssessmentForm, setShowAssessmentForm] = useState(false)

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">ユーズドPOS</h1>
        <nav className="mt-2 flex gap-2">
          <Button onClick={() => setShowAssessmentForm(true)}>査定</Button>
          <Button onClick={() => setShowAssessmentForm(false)}>閉じる</Button>
        </nav>
      </header>

      {showAssessmentForm && (
        <Card className="max-w-2xl mx-auto mt-4 p-4">
          <CardContent className="space-y-4">
            <h2 className="text-xl font-semibold">査定フォーム</h2>
            <div className="space-y-2">
              <Label htmlFor="name">顧客名</Label>
              <Input id="name" placeholder="山田太郎" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tel">電話番号</Label>
              <Input id="tel" placeholder="080-xxxx-xxxx" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="items">商品詳細</Label>
              <Input id="items" placeholder="iPhone 13, Switch Lite など" />
            </div>
            <Button className="w-full">送信</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default App
