import React, { useState } from 'react';
import { Plus, Search, User, Phone, Mail, MapPin, Trash2, Save, Eye, CheckCircle, XCircle } from 'lucide-react';
import { Customer, Assessment, AssessmentItem } from '../types';
import { findCustomerByPhone, addCustomer, addAssessment, getAssessments, saveAssessments } from '../utils/storage';
import { sendSlackNotification, exportToGoogleSheets } from '../utils/notifications';

const AssessmentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerForm, setCustomerForm] = useState({
    phone: '',
    name: '',
    email: '',
    address: '',
  });
  const [assessmentItems, setAssessmentItems] = useState<AssessmentItem[]>([]);
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    brand: '',
    model: '',
    condition: 'good' as const,
    estimatedValue: 0,
    notes: '',
  });

  const assessments = getAssessments();
  const pendingAssessments = assessments.filter(a => a.status === 'pending');

  const searchCustomer = () => {
    if (!customerForm.phone) return;
    
    const existingCustomer = findCustomerByPhone(customerForm.phone);
    if (existingCustomer) {
      setCustomer(existingCustomer);
      setCustomerForm({
        phone: existingCustomer.phone,
        name: existingCustomer.name,
        email: existingCustomer.email || '',
        address: existingCustomer.address || '',
      });
    } else {
      setCustomer(null);
    }
  };

  const createCustomer = () => {
    if (!customerForm.phone || !customerForm.name) return;
    
    const newCustomer = addCustomer({
      phone: customerForm.phone,
      name: customerForm.name,
      email: customerForm.email,
      address: customerForm.address,
    });
    
    setCustomer(newCustomer);
  };

  const addAssessmentItem = () => {
    if (!newItem.name || !newItem.category || newItem.estimatedValue <= 0) return;
    
    const item: AssessmentItem = {
      id: Date.now().toString(),
      ...newItem,
    };
    
    setAssessmentItems([...assessmentItems, item]);
    setNewItem({
      name: '',
      category: '',
      brand: '',
      model: '',
      condition: 'good',
      estimatedValue: 0,
      notes: '',
    });
  };

  const removeAssessmentItem = (id: string) => {
    setAssessmentItems(assessmentItems.filter(item => item.id !== id));
  };

  const saveAssessment = async () => {
    if (!customer || assessmentItems.length === 0) return;
    
    const totalEstimatedValue = assessmentItems.reduce((sum, item) => sum + item.estimatedValue, 0);
    
    const assessment = addAssessment({
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      items: assessmentItems,
      totalEstimatedValue,
      status: 'pending',
    });
    
    // Google Sheetsに自動記録
    await exportToGoogleSheets(assessment, 'assessment');
    
    // Slack通知
    await sendSlackNotification(
      `新規査定受付 - ${customer.name} (${customer.phone}) - 見積額: ¥${totalEstimatedValue.toLocaleString()}`,
      'assessment'
    );
    
    // リセット
    setAssessmentItems([]);
    setCustomer(null);
    setCustomerForm({ phone: '', name: '', email: '', address: '' });
    
    alert('査定を保存しました！');
  };

  const updateAssessmentStatus = async (assessmentId: string, status: 'accepted' | 'declined' | 'completed') => {
    const assessments = getAssessments();
    const assessmentIndex = assessments.findIndex(a => a.id === assessmentId);
    
    if (assessmentIndex !== -1) {
      assessments[assessmentIndex].status = status;
      assessments[assessmentIndex].updatedAt = new Date();
      saveAssessments(assessments);
      
      // Google Sheetsに状況更新を記録
      await exportToGoogleSheets({
        ...assessments[assessmentIndex],
        statusUpdate: `査定状況を${status}に更新`
      }, 'assessment');
      
      // Slack通知
      await sendSlackNotification(
        `査定状況更新 - ${assessments[assessmentIndex].customerName}: ${status}`,
        'assessment'
      );
      
      alert(`査定状況を${status}に更新しました`);
    }
  };

  const conditionOptions = [
    { value: 'excellent', label: '非常に良い' },
    { value: 'good', label: '良い' },
    { value: 'fair', label: '普通' },
    { value: 'poor', label: '悪い' },
  ];

  const categoryOptions = [
    'エレクトロニクス', 'ファッション', 'アクセサリー', 'スポーツ用品',
    '楽器', '書籍', 'ゲーム', 'その他'
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">査定管理</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">商品の査定作成と査定状況を管理します</p>
        
        {/* Tab Navigation */}
        <div className="mt-4 border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('create')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'create'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              新規査定作成
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'list'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              査定一覧 ({pendingAssessments.length})
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'create' ? (
        <>
          {/* Customer Search */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <User className="mr-2" size={20} />
              顧客情報
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  電話番号 *
                </label>
                <div className="flex">
                  <input
                    type="tel"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({...customerForm, phone: e.target.value})}
                    className="flex-1 rounded-l-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="080-1234-5678"
                  />
                  <button
                    onClick={searchCustomer}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-r-lg transition-colors"
                  >
                    <Search size={16} />
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  氏名 *
                </label>
                <input
                  type="text"
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({...customerForm, name: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="山田太郎"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm({...customerForm, email: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="example@email.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  住所
                </label>
                <input
                  type="text"
                  value={customerForm.address}
                  onChange={(e) => setCustomerForm({...customerForm, address: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="東京都渋谷区..."
                />
              </div>
            </div>
            {customer ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                <p className="text-green-700 dark:text-green-300 font-medium">
                  既存顧客: {customer.name} ({customer.phone})
                </p>
              </div>
            ) : customerForm.phone && customerForm.name ? (
              <div className="flex justify-end">
                <button
                  onClick={createCustomer}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  新規顧客として登録
                </button>
              </div>
            ) : null}
          </div>

          {/* Assessment Items */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Plus className="mr-2" size={20} />
              査定商品
            </h3>

            {/* Add New Item Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  商品名 *
                </label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="iPhone 14"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  カテゴリ *
                </label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">選択してください</option>
                  {categoryOptions.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ブランド
                </label>
                <input
                  type="text"
                  value={newItem.brand}
                  onChange={(e) => setNewItem({...newItem, brand: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Apple"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  状態
                </label>
                <select
                  value={newItem.condition}
                  onChange={(e) => setNewItem({...newItem, condition: e.target.value as any})}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {conditionOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  見積額 *
                </label>
                <input
                  type="number"
                  value={newItem.estimatedValue}
                  onChange={(e) => setNewItem({...newItem, estimatedValue: Number(e.target.value)})}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="50000"
                />
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={addAssessmentItem}
                  className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  追加
                </button>
              </div>
            </div>

            {/* Items List */}
            {assessmentItems.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-white">査定商品一覧</h4>
                {assessmentItems.map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.category}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white">{item.brand}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {conditionOptions.find(opt => opt.value === item.condition)?.label}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          ¥{item.estimatedValue.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => removeAssessmentItem(item.id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      合計見積額: ¥{assessmentItems.reduce((sum, item) => sum + item.estimatedValue, 0).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={saveAssessment}
                    disabled={!customer}
                    className="px-6 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center"
                  >
                    <Save className="mr-2" size={16} />
                    査定を保存
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Assessment List */
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Eye className="mr-2" size={20} />
            査定一覧
          </h3>

          {assessments.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">査定データがありません</p>
          ) : (
            <div className="space-y-4">
              {assessments.map((assessment) => (
                <div key={assessment.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {assessment.customerName} ({assessment.customerPhone})
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(assessment.createdAt).toLocaleDateString()} {new Date(assessment.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        assessment.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                        assessment.status === 'accepted' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                        assessment.status === 'declined' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                      }`}>
                        {assessment.status === 'pending' ? '査定中' :
                         assessment.status === 'accepted' ? '承認済み' :
                         assessment.status === 'declined' ? '却下' : '完了'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">商品数: {assessment.items.length}点</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        見積額: ¥{assessment.totalEstimatedValue.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p>商品詳細:</p>
                      <ul className="list-disc list-inside">
                        {assessment.items.slice(0, 3).map((item, index) => (
                          <li key={index}>{item.name} - ¥{item.estimatedValue.toLocaleString()}</li>
                        ))}
                        {assessment.items.length > 3 && (
                          <li>他 {assessment.items.length - 3} 点...</li>
                        )}
                      </ul>
                    </div>
                  </div>
                  
                  {assessment.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateAssessmentStatus(assessment.id, 'accepted')}
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-colors flex items-center"
                      >
                        <CheckCircle size={14} className="mr-1" />
                        承認
                      </button>
                      <button
                        onClick={() => updateAssessmentStatus(assessment.id, 'declined')}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors flex items-center"
                      >
                        <XCircle size={14} className="mr-1" />
                        却下
                      </button>
                    </div>
                  )}
                  
                  {assessment.status === 'accepted' && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mt-3">
                      <p className="text-blue-700 dark:text-blue-300 text-sm font-medium">
                        💡 次のステップ: 「買取」ページで実際の買取手続きを行ってください
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AssessmentPage;