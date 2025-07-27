// Google Sheets完全連携ユーティリティ

interface SheetData {
  [key: string]: any;
}

// Google Apps Script Web AppのURL（後で設定）
const GAS_WEB_APP_URL = import.meta.env.VITE_GAS_WEB_APP_URL || 'https://script.google.com/macros/s/AKfycbySq0WWfA9-YCAsVgKltnZKTJ78QLFVeOc8OSp82avBAV0fLekUHhlv0pa3zm_eB7T-/exec';

// デバッグ用：接続テスト
export const testGoogleSheetsConnection = async () => {
const GAS_WEB_APP_URL = import.meta.env.VITE_GAS_WEB_APP_URL || '';
  console.log('=== Google Sheets接続テスト開始 ===');
  console.log('GAS_WEB_APP_URL:', GAS_WEB_APP_URL);
  
  if (!GAS_WEB_APP_URL) {
    const errorMessage = `❌ Google Apps Script Web App URLが設定されていません。

設定手順:
    .setHeaders({
      'Access-Control-Allow-Origin': '*'
    });
2. google-apps-script-code.js の内容をコピー&ペースト
3. スプレッドシートIDを設定 (YOUR_SPREADSHEET_ID を実際のIDに変更)
4. 「デプロイ」→「新しいデプロイ」→「ウェブアプリ」
5. 実行者: 自分、アクセス: 全員 に設定
6. デプロイURLを.envファイルのVITE_GAS_WEB_APP_URLに設定
7. 開発サーバーを再起動`;
    console.error('❌', errorMessage);
    return { success: false, error: errorMessage };
  }

  if (!GAS_WEB_APP_URL.startsWith('https://script.google.com/macros/s/')) {
    const errorMessage = `❌ Google Apps Script Web App URLの形式が正しくありません。

現在のURL: ${GAS_WEB_APP_URL}
正しい形式: https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec

デプロイ手順を再確認してください:
1. Google Apps Scriptで「デプロイ」→「新しいデプロイ」
2. 種類: ウェブアプリ
3. 実行者: 自分
4. アクセス: 全員
5. 正しいURLを.envファイルに設定`;
    console.error('❌', errorMessage);
    return { success: false, error: errorMessage };
  }

  try {
    console.log('🔍 Google Apps Scriptに接続テスト中...');
    console.log('📋 URL:', GAS_WEB_APP_URL);
    
    const testData = {
      timestamp: new Date().toLocaleString('ja-JP'),
      test: 'connection_test',
      message: 'これはテストデータです'
    };

    console.log('📤 テストリクエスト送信中...');
    
    const requestPayload = {
      action: 'appendData',
      sheetName: 'テスト',
      data: testData
    };
    
    // タイムアウト付きでリクエスト送信
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    console.log('📥 レスポンス受信:', response.status, response.statusText);

    if (response.ok) {
      const result = await response.json();
      console.log('✅ 接続テスト成功:', result);
      return { success: true, result };
    } else {
      const errorText = await response.text();
      console.error('❌ 接続テスト失敗:', response.status, errorText);
      
      if (response.status === 403) {
        return { 
          success: false, 
          error: `❌ 権限エラー (403)

Google Apps Scriptのデプロイ設定を確認してください:
1. 「デプロイを管理」をクリック
2. 既存のデプロイを編集
3. 「アクセスできるユーザー: 全員」に設定
4. 「デプロイ」をクリック

エラー詳細: ${errorText}` 
        };
      } else if (response.status === 404) {
        return {
          success: false,
          error: `❌ URLが見つかりません (404)

Google Apps Scriptが正しくデプロイされていない可能性があります:
1. script.google.com でプロジェクトを確認
2. 「デプロイ」→「新しいデプロイ」を実行
3. 新しいURLを.envファイルに設定
4. 開発サーバーを再起動`
        };
      }
      
      return { 
        success: false, 
        error: `❌ HTTP ${response.status} エラー

まずブラウザで直接URLにアクセスしてテストしてください:
${GAS_WEB_APP_URL}

正常な場合: {"status":"OK",...} が表示される
エラーの場合: アクセス拒否やエラーメッセージが表示される

エラー詳細: ${errorText}` 
      };
    }
  } catch (error) {
    console.error('❌ 接続テストエラー:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof Error ? error.name : 'Unknown';
    
    if (errorName === 'AbortError') {
      return { 
        success: false, 
        error: `⏱️ タイムアウトエラー: 15秒以内に応答がありませんでした。

Google Apps Scriptが応答していません。
ブラウザで直接URLにアクセスして確認してください:
${GAS_WEB_APP_URL}` 
      };
    } else if (errorMessage.includes('Failed to fetch')) {
      return { 
        success: false, 
        error: `🔌 接続エラー: Google Apps Scriptにアクセスできません。

考えられる原因:
1. Google Apps Scriptが正しくデプロイされていない
2. URLが間違っている
3. ネットワークの問題

解決手順:
1. ブラウザで直接URLにアクセス: ${GAS_WEB_APP_URL}
2. 正常な場合: {"status":"OK",...} が表示される
3. エラーの場合: Google Apps Scriptの設定を確認

ブラウザテストの結果を教えてください。` 
      };
    } else {
      return { 
        success: false, 
        error: `❌ 予期しないエラー: ${errorMessage}

デバッグ手順:
1. ブラウザで直接URLにアクセス: ${GAS_WEB_APP_URL}
2. Google Apps Scriptのログを確認
3. デプロイ設定を再確認` 
      };
    }
  }
};

// Google Apps Scriptにデータを送信
const sendToGoogleAppsScript = async (data: any, sheetName: string) => {
  console.log('=== Google Apps Scriptにデータ送信 ===');
  console.log('送信先URL:', GAS_WEB_APP_URL);
  console.log('シート名:', sheetName);
  console.log('送信データ:', JSON.stringify(data, null, 2));
  
  if (!GAS_WEB_APP_URL) {
    console.warn('Google Apps Script Web App URLが設定されていません。.envファイルでVITE_GAS_WEB_APP_URLを設定してください。');
    return false;
  }

  try {
    const payload = {
      action: 'appendData',
      sheetName: sheetName,
      data: data
    };
    
    console.log('📤 送信ペイロード:', JSON.stringify(payload, null, 2));
    
    const response = await fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      cache: 'no-cache',
      body: JSON.stringify(payload)
    });

    console.log('📥 レスポンス:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ 送信成功:', result);
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ 送信失敗:', response.status, errorText);
      return false;
    }
  } catch (error) {
    console.error('Google Apps Script連携エラー:', error);
    
    // フォールバック: ローカルストレージに一時保存
    try {
      const failedRequests = JSON.parse(localStorage.getItem('failed_gas_requests') || '[]');
      failedRequests.push({
        timestamp: new Date().toISOString(),
        sheetName,
        data,
        error: error.message
      });
      localStorage.setItem('failed_gas_requests', JSON.stringify(failedRequests));
      console.log('失敗したリクエストをローカルストレージに保存しました');
    } catch (storageError) {
      console.error('ローカルストレージへの保存も失敗:', storageError);
    }
    
    return false;
  }
};

// 査定データをスプレッドシートに記録
export const exportAssessmentToSheets = async (assessment: any) => {
  console.log('査定データをGoogle Sheetsに送信:', assessment);
  
  const data = {
    timestamp: new Date().toLocaleString('ja-JP'),
    id: assessment.id,
    customerName: assessment.customerName,
    customerPhone: assessment.customerPhone,
    itemCount: assessment.items.length,
    totalEstimatedValue: assessment.totalEstimatedValue,
    status: assessment.status,
    itemDetails: assessment.items.map((item: any) => 
      `${item.name}(${item.category}) - ¥${item.estimatedValue.toLocaleString()}`
    ).join(', '),
    items: assessment.items
  };

  console.log('送信データ:', data);
  return await sendToGoogleAppsScript(data, '査定データ');
};

// 買取データをスプレッドシートに記録
export const exportPurchaseToSheets = async (purchase: any) => {
  const data = {
    timestamp: new Date().toLocaleString('ja-JP'),
    id: purchase.id,
    customerName: purchase.customerName,
    customerPhone: purchase.customerPhone,
    itemCount: purchase.items.length,
    totalAmount: purchase.totalAmount,
    paymentMethod: purchase.paymentMethod,
    itemDetails: purchase.items.map((item: any) => 
      `${item.name}(${item.category}) - ¥${item.purchasePrice.toLocaleString()}`
    ).join(', '),
    items: purchase.items
  };

  return await sendToGoogleAppsScript(data, '買取履歴');
};

// 販売データをスプレッドシートに記録
export const exportSaleToSheets = async (sale: any) => {
  const data = {
    timestamp: new Date().toLocaleString('ja-JP'),
    id: sale.id,
    customerName: sale.customerName || '一般客',
    customerPhone: sale.customerPhone || '',
    itemCount: sale.items.length,
    subtotal: sale.subtotal,
    tax: sale.tax,
    total: sale.total,
    paymentMethod: sale.paymentMethod,
    itemDetails: sale.items.map((item: any) => 
      `${item.name} × ${item.quantity} - ¥${(item.salePrice * item.quantity).toLocaleString()}`
    ).join(', '),
    items: sale.items
  };

  return await sendToGoogleAppsScript(data, '販売履歴');
};

// 顧客データをスプレッドシートに記録
export const exportCustomerToSheets = async (customer: any) => {
  const data = {
    timestamp: new Date().toLocaleString('ja-JP'),
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    email: customer.email || '',
    address: customer.address || '',
    registrationType: '新規登録'
  };

  return await sendToGoogleAppsScript(data, '顧客情報');
};

// 在庫データをスプレッドシートに記録
export const exportInventoryToSheets = async (products: any[]) => {
  const data = products.map(product => ({
    timestamp: new Date().toLocaleString('ja-JP'),
    id: product.id,
    barcode: product.barcode,
    name: product.name,
    category: product.category,
    brand: product.brand || '',
    condition: product.condition,
    purchasePrice: product.purchasePrice,
    salePrice: product.salePrice,
    stock: product.stock,
    description: product.description || ''
  }));

  return await sendToGoogleAppsScript(data, '在庫管理');
};

// 日次レポートをスプレッドシートに記録
export const exportDailyReportToSheets = async (reportData: any) => {
  const data = {
    date: new Date().toLocaleDateString('ja-JP'),
    totalSales: reportData.totalSales,
    totalPurchases: reportData.totalPurchases,
    transactionCount: reportData.transactionCount,
    newCustomers: reportData.newCustomers,
    lowStockItems: reportData.lowStockItems,
    pendingAssessments: reportData.pendingAssessments
  };

  return await sendToGoogleAppsScript(data, '日次レポート');
};

// Google Apps Scriptのコード生成
export const generateGoogleAppsScriptCode = () => {
  return `
// Google Apps Script Web App用コード
// このコードをGoogle Apps Scriptプロジェクトに貼り付けてください

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const { action, sheetName, data: rowData } = data;
    
    if (action === 'appendData') {
      return appendToSheet(sheetName, rowData);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Unknown action' }))
      .setMimeType(ContentService.MimeType.JSON);
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
        'Access-Control-Allow-Headers': 'Content-Type'
      });
        'Access-Control-Allow-Headers': 'Content-Type'
      });
        'Access-Control-Allow-Headers': 'Content-Type'
      });
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function appendToSheet(sheetName, data) {
  const spreadsheetId = 'YOUR_SPREADSHEET_ID'; // スプレッドシートIDを設定
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    // ヘッダー行を追加
    addHeaders(sheet, sheetName);
  }
  
  const row = formatDataForSheet(data, sheetName);
  sheet.appendRow(row);
  
  return ContentService
    .createTextOutput(JSON.stringify({ success: true, sheetName: sheetName }))
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '3600'
    });
  let headers = [];
  
  switch (sheetName) {
    case '査定データ':
      headers = ['日時', 'ID', '顧客名', '電話番号', '商品数', '見積額', 'ステータス', '商品詳細'];
      break;
    case '買取履歴':
      headers = ['日時', 'ID', '顧客名', '電話番号', '商品数', '買取額', '支払方法', '商品詳細'];
      break;
    case '販売履歴':
      headers = ['日時', 'ID', '顧客名', '電話番号', '商品数', '小計', '税額', '合計', '支払方法', '商品詳細'];
      break;
    case '顧客情報':
      headers = ['日時', 'ID', '氏名', '電話番号', 'メール', '住所', '登録種別'];
      break;
    case '在庫管理':
      headers = ['日時', 'ID', 'バーコード', '商品名', 'カテゴリ', 'ブランド', '状態', '仕入価格', '販売価格', '在庫数', '説明'];
      break;
    case '日次レポート':
      headers = ['日付', '売上合計', '買取合計', '取引件数', '新規顧客', '在庫不足', '査定待ち'];
      break;
  }
  
  if (headers.length > 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
}

function formatDataForSheet(data, sheetName) {
  switch (sheetName) {
    case '査定データ':
      return [
        data.timestamp,
        data.id,
        data.customerName,
        data.customerPhone,
        data.itemCount,
        data.totalEstimatedValue,
        data.status,
        data.itemDetails
      ];
    case '買取履歴':
      return [
        data.timestamp,
        data.id,
        data.customerName,
        data.customerPhone,
        data.itemCount,
        data.totalAmount,
        data.paymentMethod,
        data.itemDetails
      ];
    case '販売履歴':
      return [
        data.timestamp,
        data.id,
        data.customerName,
        data.customerPhone,
        data.itemCount,
        data.subtotal,
        data.tax,
        data.total,
        data.paymentMethod,
        data.itemDetails
      ];
    case '顧客情報':
      return [
        data.timestamp,
        data.id,
        data.name,
        data.phone,
        data.email,
        data.address,
        data.registrationType
      ];
    case '在庫管理':
      return [
        data.timestamp,
        data.id,
        data.barcode,
        data.name,
        data.category,
        data.brand,
        data.condition,
        data.purchasePrice,
        data.salePrice,
        data.stock,
        data.description
      ];
    case '日次レポート':
      return [
        data.date,
        data.totalSales,
        data.totalPurchases,
        data.transactionCount,
        data.newCustomers,
        data.lowStockItems,
        data.pendingAssessments
      ];
    default:
      return Object.values(data);
  }
}
`;
};

// 設定確認
export const checkGoogleSheetsConnection = async () => {
  if (!GAS_WEB_APP_URL) {
    return {
      connected: false,
      message: 'Google Apps Script Web App URLが設定されていません'
    };
  }

  try {
    const response = await fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'test',
        data: { test: true }
      })
    });

    if (response.ok) {
      return {
        connected: true,
        message: 'Google Sheets連携が正常に動作しています'
      };
    } else {
      return {
        connected: false,
        message: `接続エラー: ${response.status}`
      };
    }
  } catch (error) {
    return {
      connected: false,
      message: `接続エラー: ${error}`
    };
  }
};