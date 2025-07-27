import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import AssessmentPage from './components/Assessment';
import PurchasePage from './components/Purchase';
import SalePage from './components/Sale';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'assessment':
        return <AssessmentPage />;
      case 'purchase':
        return <PurchasePage />;
      case 'sale':
        return <SalePage />;
      case 'customers':
        return <div className="text-center py-12 text-gray-500">顧客管理ページ - 準備中</div>;
      case 'products':
        return <div className="text-center py-12 text-gray-500">商品管理ページ - 準備中</div>;
      case 'settings':
        return <div className="text-center py-12 text-gray-500">設定ページ - 準備中</div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderCurrentPage()}
    </Layout>
  );
};

export default App;