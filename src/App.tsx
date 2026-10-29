import React, { useState, useEffect } from 'react';
import { WeighStationPage } from './pages/WeighStationPage';
import { ProcessPage } from './pages/ProcessPage';
import { ProductPage } from './pages/ProductPage';
import { OverviewPage } from './pages/OverviewPage';
import { Header } from './components/layout/Header';

export const App: React.FC = () => {
  const getTabFromHash = () => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'weighStation') return 'weighStation';
    if (hash === 'process') return 'process';
    if (hash === 'products') return 'products';
    if (hash === 'overview') return 'overview';
    if (hash === 'hr') return 'hr';
    if (hash === 'reports') return 'reports';
    return 'overview';
  };

  const [currentTab, setCurrentTab] = useState<string>(getTabFromHash);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentTab(getTabFromHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (tab: string) => {
    setCurrentTab(tab);
    window.location.hash = tab;
  };

  if (currentTab === 'overview') {
    return <OverviewPage onNavigate={handleNavigate} />;
  }

  if (currentTab === 'process') {
    return <ProcessPage onNavigate={handleNavigate} />;
  }

  if (currentTab === 'products') {
    return <ProductPage onNavigate={handleNavigate} />;
  }

  if (currentTab === 'weighStation') {
    return <WeighStationPage onNavigate={handleNavigate} />;
  }

  // Placeholder for other tabs (Tổng quan, Nhân sự, Báo cáo)
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Header activeTab={currentTab} onTabChange={handleNavigate} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-red-50 text-[#DE4444] rounded-2xl flex items-center justify-center mb-4">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="3" y1="9" x2="21" y2="9"/>
            <line x1="9" y1="21" x2="9" y2="9"/>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">
          Mô-đun đang phát triển
        </h2>
        <p className="text-sm text-slate-500 max-w-md mb-6">
          Chức năng <span className="font-semibold text-slate-700">
            {currentTab === 'hr' && 'Nhân sự'}
            {currentTab === 'reports' && 'Báo cáo'}
          </span> đang được hoàn thiện. Bạn có thể chuyển sang Tổng quan, Trạm cân, Quy trình hoặc Sản phẩm.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => handleNavigate('overview')}
            className="px-4 py-2 bg-[#DE4444] text-white text-sm font-medium rounded-lg hover:bg-[#C93333] transition-colors cursor-pointer"
          >
            Về Tổng Quan
          </button>
          <button
            onClick={() => handleNavigate('weighStation')}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Về Trạm Cân
          </button>
        </div>
      </main>
    </div>
  );
};

export default App;
