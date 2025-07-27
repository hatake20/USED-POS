import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  AlertTriangle, 
  Clock,
  DollarSign,
  Users,
  ShoppingCart,
  Search
} from 'lucide-react';
import { getSales, getPurchases, getProducts, getAssessments } from '../utils/storage';
import { checkGoogleSheetsConnection, exportDailyReportToSheets, testGoogleSheetsConnection } from '../utils/googleSheets';
import { DashboardStats } from '../types';

const Dashboard: React.FC = () => {
  const calculateStats = (): DashboardStats => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sales = getSales();
    const purchases = getPurchases();
    const products = getProducts();
    const assessments = getAssessments();
    
    const todaySales = sales
      .filter(sale => new Date(sale.createdAt) >= today)
      .reduce((sum, sale) => sum + sale.total, 0);
    
    const todayPurchases = purchases
      .filter(purchase => new Date(purchase.createdAt) >= today)
      .reduce((sum, purchase) => sum + purchase.totalAmount, 0);
    
    const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
    const lowStockItems = products.filter(product => product.stock <= 2).length;
    const pendingAssessments = assessments.filter(assessment => assessment.status === 'pending').length;
    
    return {
      todaySales,
      todayPurchases,
      totalStock,
      lowStockItems,
      pendingAssessments,
    };
  };

  const stats = calculateStats();

  // Google Sheets接続状況を確認
  const [connectionStatus, setConnectionStatus] = React.useState<{
    connected: boolean;
    message: string;
  } | null>(null);

  React.useEffect(() => {
    checkGoogleSheetsConnection().then(setConnectionStatus);
  }, []);

  // 日次レポートを送信
  const sendDailyReport = async () => {
    const reportData = {
      totalSales: stats.todaySales,
      totalPurchases: stats.todayPurchases,
      transactionCount: getSales().length + getPurchases().length,
      newCustomers: 0, // 今日の新規顧客数（実装可能）
      lowStockItems: stats.lowStockItems,
      pendingAssessments: stats.pendingAssessments
    };

    const success = await exportDailyReportToSheets(reportData);
    if (success) {
      alert('日次レポートをスプレッドシートに送信しました');
    } else {
      alert('レポート送信に失敗しました');
    }
  };

  // 接続テスト
  const runConnectionTest = async () => {
    console.log('🧪 接続テストを開始します...');
    
    // URL設定チェック
    const gasUrl = import.meta.env.VITE_GAS_WEB_APP_URL;
    if (!gasUrl) {
      alert('❌ Google Apps Script Web App URLが設定されていません。\n\n.envファイルでVITE_GAS_WEB_APP_URLを設定してください。\n\n設定方法:\n1. script.google.com でプロジェクトを作成\n2. google-apps-script-code.js をコピー&ペースト\n3. デプロイしてURLを取得\n4. .envファイルに設定');
      return;
    }
    
    const result = await testGoogleSheetsConnection();
    if (result.success) {
      alert('✅ Google Sheets接続テスト成功！スプレッドシートを確認してください。');
    } else {
      alert(`❌ 接続テスト失敗\n\n${result.error}\n\n設定方法:\n1. script.google.com でプロジェクトを作成\n2. google-apps-script-code.js の内容をコピー&ペースト\n3. 「デプロイ」→「新しいデプロイ」→「ウェブアプリ」\n4. 実行者: 自分、アクセス: 全員\n5. デプロイURLを.envファイルに設定`);
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    change?: string;
    changeType?: 'positive' | 'negative';
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, change, changeType, icon, color }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {change && (
            <div className={`flex items-center mt-2 ${
              changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}>
              {changeType === 'positive' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span className="text-sm font-medium ml-1">{change}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const RecentActivity: React.FC = () => {
    const recentSales = getSales().slice(-5).reverse();
    const recentPurchases = getPurchases().slice(-5).reverse();
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">最近のアクティビティ</h3>
          <div className="space-y-4">
            {recentSales.slice(0, 3).map((sale) => (
              <div key={sale.id} className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <ShoppingCart size={16} className="text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    販売: ¥{sale.total.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(sale.createdAt).toLocaleDateString()} {new Date(sale.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {recentPurchases.slice(0, 2).map((purchase) => (
              <div key={purchase.id} className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <TrendingUp size={16} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    買取: ¥{purchase.totalAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(purchase.createdAt).toLocaleDateString()} {new Date(purchase.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">ダッシュボード</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">本日の売上・在庫状況を確認できます</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="本日の売上"
          value={`¥${stats.todaySales.toLocaleString()}`}
          change="+12%"
          changeType="positive"
          icon={<DollarSign size={24} className="text-white" />}
          color="bg-green-500"
        />
        <StatCard
          title="本日の買取"
          value={`¥${stats.todayPurchases.toLocaleString()}`}
          change="+8%"
          changeType="positive"
          icon={<TrendingUp size={24} className="text-white" />}
          color="bg-blue-500"
        />
        <StatCard
          title="総在庫数"
          value={stats.totalStock}
          icon={<Package size={24} className="text-white" />}
          color="bg-purple-500"
        />
        <StatCard
          title="在庫不足"
          value={stats.lowStockItems}
          icon={<AlertTriangle size={24} className="text-white" />}
          color="bg-orange-500"
        />
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="査定待ち"
          value={stats.pendingAssessments}
          icon={<Clock size={24} className="text-white" />}
          color="bg-yellow-500"
        />
        <StatCard
          title="総顧客数"
          value={getSales().length + getPurchases().length}
          icon={<Users size={24} className="text-white" />}
          color="bg-indigo-500"
        />
        <StatCard
          title="商品カテゴリ"
          value={new Set(getProducts().map(p => p.category)).size}
          icon={<Package size={24} className="text-white" />}
          color="bg-pink-500"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        
        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">クイックアクション</h3>
            
            {/* Google Sheets接続状況 */}
            {connectionStatus && (
              <div className={`mb-4 p-3 rounded-lg ${
                connectionStatus.connected 
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
              }`}>
                <p className="text-sm font-medium">
                  📊 {connectionStatus.message}
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-left">
                <Search size={20} className="text-blue-600 dark:text-blue-400 mb-2" />
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">新規査定</p>
              </button>
              <button className="p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors text-left">
                <ShoppingCart size={20} className="text-green-600 dark:text-green-400 mb-2" />
                <p className="text-sm font-medium text-green-700 dark:text-green-300">商品販売</p>
              </button>
              <button className="p-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors text-left">
                <Package size={20} className="text-purple-600 dark:text-purple-400 mb-2" />
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">在庫確認</p>
              </button>
              <button 
                onClick={runConnectionTest}
                className="p-4 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg transition-colors text-left"
              >
                <Package size={20} className="text-orange-600 dark:text-orange-400 mb-2" />
                <p className="text-sm font-medium text-orange-700 dark:text-orange-300">接続テスト</p>
              </button>
            </div>
            
            <div className="mt-4">
              <button 
                onClick={sendDailyReport}
                className="w-full p-3 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg transition-colors text-left"
              >
                <div className="flex items-center">
                  <Users size={20} className="text-indigo-600 dark:text-indigo-400 mr-3" />
                  <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">日次レポート送信</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;