import React, { useState } from 'react';
import { Search, Scan, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { Product, Sale, SaleItem } from '../types';
import { getProducts, findProductByBarcode, addSale } from '../utils/storage';
import { sendSlackNotification, exportToGoogleSheets } from '../utils/notifications';

const SalePage: React.FC = () => {
  const [cartItems, setCartItems] = useState<SaleItem[]>([]);
  const [barcode, setBarcode] = useState('');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'electronic'>('cash');
  const [searchQuery, setSearchQuery] = useState('');

  const products = getProducts().filter(p => p.stock > 0);
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.barcode.includes(searchQuery)
  );

  const addToCart = (product: Product, quantity: number = 1) => {
    const existingItem = cartItems.find(item => item.productId === product.id);
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity <= product.stock) {
        setCartItems(cartItems.map(item =>
          item.productId === product.id
            ? { ...item, quantity: newQuantity }
            : item
        ));
      } else {
        alert('在庫が不足しています');
      }
    } else {
      if (quantity <= product.stock) {
        const newItem: SaleItem = {
          id: Date.now().toString(),
          productId: product.id,
          barcode: product.barcode,
          name: product.name,
          category: product.category,
          salePrice: product.salePrice,
          quantity,
        };
        setCartItems([...cartItems, newItem]);
      } else {
        alert('在庫が不足しています');
      }
    }
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    const item = cartItems.find(item => item.id === itemId);
    if (!item) return;

    const product = products.find(p => p.id === item.productId);
    if (!product || newQuantity > product.stock) {
      alert('在庫が不足しています');
      return;
    }

    setCartItems(cartItems.map(item =>
      item.id === itemId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const scanBarcode = () => {
    if (!barcode) return;

    const product = findProductByBarcode(barcode);
    if (product && product.stock > 0) {
      addToCart(product);
      setBarcode('');
    } else {
      alert('商品が見つからないか、在庫がありません');
    }
  };

  const calculateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.salePrice * item.quantity), 0);
    const tax = Math.floor(subtotal * 0.1);
    const total = subtotal + tax;
    
    return { subtotal, tax, total };
  };

  const processSale = async () => {
    if (cartItems.length === 0) {
      alert('カートに商品がありません');
      return;
    }

    const { subtotal, tax, total } = calculateTotals();

    const sale: Omit<Sale, 'id' | 'createdAt'> = {
      customerId: customerInfo.phone ? undefined : undefined,
      customerName: customerInfo.name || undefined,
      customerPhone: customerInfo.phone || undefined,
      items: cartItems,
      subtotal,
      tax,
      total,
      paymentMethod,
    };

    const newSale = addSale(sale);

    // Google Sheetsに自動記録
    await exportToGoogleSheets(newSale, 'sale');
    
    // Slack通知
    await sendSlackNotification(
      `売上登録 - 合計: ¥${total.toLocaleString()} (${paymentMethod}) - 商品数: ${cartItems.length}`,
      'sale'
    );

    // リセット
    setCartItems([]);
    setCustomerInfo({ name: '', phone: '' });
    setBarcode('');
    setSearchQuery('');

    alert(`売上を登録しました！\n合計: ¥${total.toLocaleString()}`);
  };

  const { subtotal, tax, total } = calculateTotals();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Product Search & Cart */}
      <div className="lg:col-span-2 space-y-6">
        {/* Barcode Scanner */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Scan className="mr-2" size={20} />
            バーコードスキャン
          </h3>
          <div className="flex gap-4">
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && scanBarcode()}
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="バーコードを入力またはスキャン"
            />
            <button
              onClick={scanBarcode}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              追加
            </button>
          </div>
        </div>

        {/* Product Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Search className="mr-2" size={20} />
            商品検索
          </h3>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            placeholder="商品名、カテゴリ、バーコードで検索"
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                onClick={() => addToCart(product)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">{product.name}</h4>
                  <span className="text-sm text-gray-500 dark:text-gray-400">在庫: {product.stock}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{product.category}</p>
                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  ¥{product.salePrice.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cart & Checkout */}
      <div className="space-y-6">
        {/* Cart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <ShoppingCart className="mr-2" size={20} />
            カート ({cartItems.length})
          </h3>

          {cartItems.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">カートは空です</p>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{item.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">¥{item.salePrice.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded text-sm">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Customer Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">顧客情報（任意）</h3>
          <div className="space-y-4">
            <input
              type="text"
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="氏名"
            />
            <input
              type="tel"
              value={customerInfo.phone}
              onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="電話番号"
            />
          </div>
        </div>

        {/* Checkout */}
        {cartItems.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">お会計</h3>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">小計</span>
                <span className="text-gray-900 dark:text-white">¥{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">消費税 (10%)</span>
                <span className="text-gray-900 dark:text-white">¥{tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t border-gray-200 dark:border-gray-600 pt-3">
                <span className="text-gray-900 dark:text-white">合計</span>
                <span className="text-gray-900 dark:text-white">¥{total.toLocaleString()}</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                支払方法
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="cash">現金</option>
                <option value="card">クレジットカード</option>
                <option value="electronic">電子マネー</option>
              </select>
            </div>

            <button
              onClick={processSale}
              className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
            >
              売上登録
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalePage;