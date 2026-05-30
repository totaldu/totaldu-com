// src/pages/BattleLayout.jsx
import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Zap, Timer, ChevronRight } from 'lucide-react';

export default function BattleLayoutIntegratedSidebar() {
  const items = [
    { to: '', label: '개요', icon: Zap },
    { to: 'type-chart', label: '타입 상성표', icon: Zap },
    { to: 'speed-rank', label: '스피드 순위', icon: Timer },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Centered container: max-w-7xl */}
      <div className="max-w-7xl mx-auto px-4 py-8 flex relative">
        {/* Sidebar: 페이지의 일부로서 왼쪽 여백(gutter)에 들어가도록 margin-left로 밀어넣음 */}
        <aside
          aria-label="Battle sidebar"
          className="hidden lg:block w-64 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 h-[80vh] overflow-auto sticky top-24"
          style={{
            marginLeft: 'calc(-16rem - 1rem)', // 16rem = w-64, 1rem gap
          }}
        >
          <Link to="/battle" className="text-lg font-black text-[#005596] flex items-center gap-2 mb-4">
            <span>Battle</span>
          </Link>

          <nav className="mt-4 flex flex-col gap-2">
            {items.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to || '.'}
                  end={item.to === ''}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-colors
                     ${isActive ? 'bg-[#E6F6F5] text-[#005596]' : 'text-gray-700 hover:bg-gray-50'}`
                  }
                >
                  <Icon size={18} />
                  <span className="flex-1">{item.label}</span>
                  <ChevronRight size={16} className="opacity-40" />
                </NavLink>
              );
            })}
          </nav>
        </aside>

        {/* Main content: 사이드바가 음수여백으로 빠져나간 만큼 왼쪽 마진을 줌 */}
        <main className="flex-1 ml-8">
          {/* 모바일에선 사이드바 대체 토글/내비 */}
          <div className="lg:hidden mb-4">
            <nav className="flex gap-2 overflow-x-auto">
              {items.map(item => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to || '.'}
                    className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border text-sm font-semibold"
                  >
                    <Icon size={16} /> <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  );
}
