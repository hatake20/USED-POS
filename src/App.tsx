import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="text-2xl font-bold mb-6">📊 USED POS ダッシュボード</header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent>
            <p className="text-sm text-gray-500">本日の売上</p>
            <p className="text-xl font-semibold mt-2">¥0</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p className="text-sm text-gray-500">本日の買取</p>
            <p className="text-xl font-semibold mt-2">¥0</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p className="text-sm text-gray-500">在庫数</p>
            <p className="text-xl font-semibold mt-2">0 個</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 space-x-4">
        <Button>買取管理</Button>
        <Button variant="outline">商品管理</Button>
        <Button variant="ghost">設定</Button>
      </div>
    </div>
  );
}
