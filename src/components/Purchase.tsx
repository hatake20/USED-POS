import React, { useState } from 'react';
import { Search, User, Package, Save, CheckCircle } from 'lucide-react';
import { Customer, Purchase, PurchaseItem, Assessment } from '../types';
import { 
  findCustomerByPhone, 
  addCustomer, 
  addPurchase, 
  getAssessments,
  saveAssessments,
  generateBarcode 
} from '../utils/storage';
import { sendSlackNotification, exportToGoogleSheets } from '../utils/notifications';

const PurchasePage: React.FC = () => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerForm, setCustomerForm] = useState({
    phone: '',
    name: '',
    email: '',
    address: '',
  });
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer' | 'check'>('cash');

  const acceptedAssessments = getAssessments().filter(a => a.status === 'accepted');

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
      
      // 該当顧客の承認済み査定を検索
      const customerAssessments = acceptedAssessments.filter(
        a => a.customerId === existingCustomer.id
      );
      
      if (customerAssessments.length > 0) {
        setSelectedAssessment(customerAssessments[0]);
        loadAssessmentItems(customerAssessments[0]);
      }
    } else {
      setCustomer(null);
      setSelectedAssessment(null);
      setPurchaseItems([]);
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

  const loadAssessmentItems = (assessment: Assessment) => {
    const items: PurchaseItem[] = assessment.items.map(item => ({
      id: item.id,
      productId: '', // 新規商品として扱う
      name: item.name,
      category: item.category,
      condition: item.condition,
      purchasePrice: item.estimatedValue, // 査定額を買取価格として使用
      barcode: generateBarcode(),
    }));
    
    setPurchaseItems(items);
  };

  const updatePurchasePrice = (itemId: string, newPrice: number) => {
    setPurchaseItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, purchasePrice: newPrice } : item
      )
    );
  };

  const processPurchase = async () => {
    if (!customer || purchaseItems.length === 0) {
      alert('顧客情報と買取商品が必要です');
      return;
    }

    const totalAmount = purchaseItems.reduce((sum, item) => sum + item.purchasePrice, 0);

    const purchase: Omit<Purchase, 'id' | 'createdAt'> = {
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      assessmentId: selectedAssessment?.id,
      items: purchaseItems,
      totalAmount,
      paymentMethod,
    };

    const newPurchase = addPurchase(purchase);

    // 査定ステータスを完了に更新
    if (selectedAssessment) {
      const assessments = getAssessments();
      const assessmentIndex = assessments.findIndex(a => a.id === selectedAssessment.id);
      if (assessmentIndex !== -1) {
        assessments[assessmentIndex].status = 'completed';
        assessments[assessmentIndex].updatedAt = new Date();
        saveAssessments(assessments);
      }
    }

    // Google Sheetsに自動記録
    await exportToGoogleSheets(newPurchase, 'purchase');
    
    // Slack通知
    await sendSlackNotification(
      `買取完了 - ${customer.name} (${customer.phone}) - 買取額: ¥${totalAmount.toLocaleString()} (${paymentMethod})`,
      'purchase'
    );

    // リセット
    setCustomer(null);
    setCustomerForm({ phone: '', name: '', email: '', address: '' });
    setSelectedAssessment(null);
    setPurchaseItems([]);

    alert(`買取を完了しました！\n買取額: ¥${totalAmount.toLocaleString()}`);
  };

  const totalAmount = purchaseItems.reduce((sum, item) => sum + item.purchasePrice, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">買取</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">承認済み査定の買取手続きを行います</p>
      </div>

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
              顧客: {customer.name} ({customer.phone})
            </p>
            {selectedAssessment && (
              <p className="text-green-600 dark:text-green-400 text-sm mt-1">
                査定ID: {selectedAssessment.id} - 見積額: ¥{selectedAssessment.totalEstimatedValue.toLocaleString()}
              </p>
            )}
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

      {/* Assessment Selection */}
      {customer && acceptedAssessments.filter(a => a.customerId === customer.id).length > 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">査定選択</h3>
          <select
            value={selectedAssessment?.id || ''}
            onChange={(e) => {
              const assessment = acceptedAssessments.find(a => a.id === e.target.value);
              if (assessment) {
                setSelectedAssessment(assessment);
                loadAssessmentItems(assessment);
              }
            }}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">査定を選択してください</option>
            {acceptedAssessments
              .filter(a => a.customerId === customer.id)
              .map(assessment => (
                <option key={assessment.id} value={assessment.id}>
                  {new Date(assessment.createdAt).toLocaleDateString()} - ¥{assessment.totalEstimatedValue.toLocaleString()}
                </option>
              ))}
          </select>
        </div>
      )}

      {/* Purchase Items */}
      {purchaseItems.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Package className="mr-2" size={20} />
            買取商品
          </h3>

          <div className="space-y-4">
            {purchaseItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-900 dark:text-white">状態: {item.condition}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">バーコード: {item.barcode}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      買取価格
                    </label>
                    <input
                      type="number"
                      value={item.purchasePrice}
                      onChange={(e) => updatePurchasePrice(item.id, Number(e.target.value))}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="text-green-500" size={20} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  買取合計: ¥{totalAmount.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  支払方法
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cash">現金</option>
                  <option value="bank_transfer">銀行振込</option>
                  <option value="check">小切手</option>
                </select>
              </div>
            </div>

            <button
              onClick={processPurchase}
              className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center"
            >
              <Save className="mr-2" size={16} />
              買取を完了
            </button>
          </div>
        </div>
      )}

      {/* No Items Message */}
      {customer && purchaseItems.length === 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <p className="text-yellow-700 dark:text-yellow-300">
            この顧客の承認済み査定が見つかりません。先に査定を作成し、承認してください。
          </p>
        </div>
      )}
    </div>
  );
};

export default PurchasePage;