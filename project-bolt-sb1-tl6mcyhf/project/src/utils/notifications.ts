import { 
  exportAssessmentToSheets, 
  exportPurchaseToSheets,
  exportSaleToSheets,
  exportCustomerToSheets 
} from './googleSheets';

// Slack notification utility (準備段階)
export const sendSlackNotification = async (message: string, type: 'assessment' | 'purchase' | 'sale') => {
  const SLACK_WEBHOOK_URL = import.meta.env.VITE_SLACK_WEBHOOK_URL;
  
  if (!SLACK_WEBHOOK_URL) {
    console.log(`[SLACK通知] Webhook URLが設定されていません - ${type}: ${message}`);
    return;
  }
  
  try {
    console.log('Slack通知を送信中...', { type, message });
    
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: `[POS] ${message}`,
        channel: '#pos-notifications',
        username: 'POS System',
      }),
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        console.warn('Slack Webhook URLが無効です。正しいWebhook URLを設定してください。');
        return; // 404エラーの場合は例外を投げずに終了
      }
      
      const errorText = await response.text();
      console.warn(`Slack通知に失敗しましたが、処理を継続します: ${response.status} - ${errorText}`);
      return; // その他のエラーも例外を投げずに終了
    }
    
    console.log('Slack通知を送信しました');
  } catch (error) {
    console.warn('Slack通知エラー（処理は継続）:', error.message);
    
    // Slack通知が失敗してもアプリケーションの動作は継続
    // ローカルログに記録
    const failedNotifications = JSON.parse(localStorage.getItem('failed_slack_notifications') || '[]');
    failedNotifications.push({
      timestamp: new Date().toISOString(),
      type,
      message,
      error: error.message || 'Unknown error'
    });
    localStorage.setItem('failed_slack_notifications', JSON.stringify(failedNotifications));
  }
};

// Google Sheets export utility (準備段階)
export const exportToGoogleSheets = async (data: any, type: 'assessment' | 'purchase' | 'sale' | 'customer') => {
  try {
    switch (type) {
      case 'assessment':
        return await exportAssessmentToSheets(data);
      case 'purchase':
        return await exportPurchaseToSheets(data);
      case 'sale':
        return await exportSaleToSheets(data);
      case 'customer':
        return await exportCustomerToSheets(data);
      default:
        console.warn('未対応のデータタイプ:', type);
        return false;
    }
  } catch (error) {
    console.error('Google Sheets連携エラー:', error);
    return false;
  }
};

// Print label utility (準備段階)
export const printLabel = async (barcode: string, productName: string) => {
  // TODO: Brother QL-820プリンター連携
  console.log(`[ラベル印刷] バーコード: ${barcode}, 商品名: ${productName}`);
  
  // 実装例：
  // 1. Brother P-touch Editor APIまたはNode.js integration
  // 2. バーコード画像生成
  // 3. プリンター送信
};