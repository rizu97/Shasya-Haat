import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Package, Store, BarChart3, MoreHorizontal } from 'lucide-react';

const NAV_ITEMS = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/inventory', icon: Package, label: 'Stock' },
    { path: '/trade', icon: Store, label: 'Trade', highlight: true },
    { path: '/reports', icon: BarChart3, label: 'Reports' },
    { path: '/more', icon: MoreHorizontal, label: 'More' },
];

export const BottomNav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Hide navbar on full-screen views
    const hiddenPaths = ['/add', '/scanner'];
    if (hiddenPaths.some(p => location.pathname.startsWith(p))) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-[env(safe-area-inset-bottom)]">
            <div className="px-4 pb-4 pt-2 flex justify-center">
                <nav className="glass pl-1.5 pr-1.5 py-1.5 flex justify-between items-center rounded-[1.75rem] pointer-events-auto max-w-[22rem] w-full mx-auto">
                    {NAV_ITEMS.map((item) => {
                        const isActive = location.pathname === item.path;
                        const isHighlight = item.highlight;

                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`
                                    relative flex flex-col items-center justify-center
                                    w-[3.25rem] h-[3.25rem] rounded-2xl
                                    transition-all duration-300 ease-out
                                    ${isActive && isHighlight
                                        ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/30 scale-110 -translate-y-1'
                                        : isActive
                                            ? 'text-[var(--accent)] bg-[var(--accent-light)]'
                                            : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--card-hover)]'
                                    }
                                `}
                            >
                                <item.icon
                                    size={19}
                                    strokeWidth={isActive ? 2.5 : 1.8}
                                    className="transition-all duration-200"
                                />
                                <span className={`
                                    text-[8px] font-bold mt-0.5 leading-none tracking-wide
                                    ${isActive && isHighlight ? 'text-white/90' : ''}
                                `}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
};
