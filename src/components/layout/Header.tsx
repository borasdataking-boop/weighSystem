import React from 'react';

interface HeaderProps {
  activeTab?: string;
  onTabChange?: (tabKey: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab = 'weighStation',
  onTabChange
}) => {
  const navItems = [
    { key: 'overview', label: 'Tổng quan' },
    { key: 'weighStation', label: 'Trạm cân' },
    { key: 'process', label: 'Quy trình' },
    { key: 'products', label: 'Sản phẩm' },
    { key: 'hr', label: 'Nhân sự' },
    { key: 'reports', label: 'Báo cáo' }
  ];

  return (
    <header className="h-16 flex items-stretch bg-[#DE4444] shadow-sm sticky top-0 z-50">
      {/* Khối Logo thương hiệu (Nền trắng theo chuẩn screenshot) */}
      <a
        href="#"
        className="w-60 bg-white flex flex-col items-center justify-center px-4 border-r border-black/5 shrink-0"
        title="Phan Bach Management System"
      >
        <div className="w-[170px] h-7 overflow-hidden relative flex items-center justify-center">
          <img
            src="/logo.png"
            alt="Phan Bach"
            className="absolute max-w-none w-[220px] -left-10 -top-[95px]"
          />
        </div>
        <span className="text-[11px] font-medium text-slate-500 tracking-wide mt-0.5">
          Management System
        </span>
      </a>

      {/* Thanh Menu điều hướng màu đỏ */}
      <nav className="flex-1 flex items-center px-2 sm:px-5 gap-1 sm:gap-1.5 overflow-x-auto min-w-0">
        {navItems.map(item => {
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onTabChange?.(item.key)}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-md transition-colors whitespace-nowrap cursor-pointer select-none font-medium shrink-0 ${
                isActive
                  ? 'bg-white/22 text-white font-semibold'
                  : 'text-white/90 hover:bg-white/12 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Khối Thông tin Người dùng bên phải */}
      <div className="flex items-center px-3 sm:px-5 shrink-0 gap-2 sm:gap-3">
        <div className="hidden sm:block w-px h-7 bg-white/25 mr-1" />
        <div className="hidden md:flex flex-col items-end leading-tight">
          <span className="text-sm font-semibold text-white">Nguyễn Minh Anh</span>
          <span className="text-xs text-white/80">Quản trị viên</span>
        </div>
        <img
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
          alt="Avatar"
          className="w-9 h-9 rounded-full object-cover border-2 border-white/45 bg-slate-100"
          onError={(e) => {
            // Fallback SVG icon nếu offline
            e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2364748B'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
          }}
        />
        <button
          className="w-8 h-8 flex items-center justify-center bg-white/18 hover:bg-white/28 rounded-md text-white transition-colors"
          title="Tùy chọn tài khoản"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>
    </header>
  );
};
