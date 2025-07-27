// 🚀 Google Apps Script完全版コード（コピペ用）
// このコード全体をGoogle Apps Scriptに貼り付けてください

// ✅ スプレッドシートID設定
const SPREADSHEET_ID = '1gpu_mXGlBS4kPy3shm6Cb5Pdf4-2eCIJrYYjFPBLpHI';

// ✅ GETリクエスト対応（ブラウザテスト用）
function doGet(e) {
  const response = {
    status: 'OK',
    message: 'Google Apps Script Web App is running',
    timestamp: new Date().toLocaleString('ja-JP'),
    method: 'GET',
    spreadsheetId: SPREADSHEET_ID
  };

  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

// ✅ POSTリクエスト対応（データ送信用）
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const { action, sheetName, data: rowData } = data;

    if (action === 'appendData') {
      return appendToSheet(sheetName, rowData);
    }

    // テスト用レスポンス
    const response = {
      status: 'OK',
      message: 'POST request received',
      timestamp: new Date().toLocaleString('ja-JP'),
      received: data
    };

    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    const errorResponse = {
      success: false,
      error: error.toString(),
      timestamp: new Date().toLocaleString('ja-JP')
    };

    return ContentService
      .createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ✅ CORS対応（プリフライトリクエスト）
function doOptions(e) {
  return HtmlService.createHtmlOutput('')
    .appendHeader('Access-Control-Allow-Origin', '*')
    .appendHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .appendHeader('Access-Control-Allow-Headers', 'Content-Type')
    .appendHeader('Access-Control-Max-Age', '3600');
}

// ✅ スプレッドシートにデータ追加
function appendToSheet(sheetName, data) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    let sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName);
      addHeaders(sheet, sheetName);
    }

    const row = formatDataForSheet(data, sheetName);
    sheet.appendRow(row);

    const response = {
      success: true,
      sheetName: sheetName,
      timestamp: new Date().toLocaleString('ja-JP'),
      rowData: row
    };

    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    const errorResponse = {
      success: false,
      error: error.toString(),
      sheetName: sheetName
    };

    return ContentService
      .createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ✅ ヘッダー行追加
function addHeaders(sheet, sheetName) {
  let headers = [];

  switch (sheetName) {
    case 'テスト':
      headers = ['日時', 'テスト', 'メッセージ'];
      break;
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
    default:
      headers = ['データ'];
  }

  if (headers.length > 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
}

// ✅ データ整形
function formatDataForSheet(data, sheetName) {
  switch (sheetName) {
    case 'テスト':
      return [
        data.timestamp || new Date().toLocaleString('ja-JP'),
        data.test || 'connection_test',
        data.message || 'テストデータ'
      ];
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
      return [JSON.stringify(data)];
  }
}