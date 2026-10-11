import { Compass, LayoutDashboard, Users, FileText, CalendarHeart, Lightbulb, Share2, BarChart3, Sparkles } from 'lucide-react';

export type ViewKey = 'dashboard' | 'agents' | 'content' | 'friday' | 'topics' | 'social' | 'analytics';

interface SidebarProps {
  current: ViewKey;
  onNavigate: (view: ViewKey) => void;
}

const navItems: { key: ViewKey; label: string; icon: typeof Compass }[] = [
  { key: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { key: 'agents', label: 'الوكلاء', icon: Users },
  { key: 'content', label: 'المحتوى', icon: FileText },
  { key: 'friday', label: 'غروب الجمعة', icon: CalendarHeart },
  { key: 'topics', label: 'ابتكار المواضيع', icon: Lightbulb },
  { key: 'social', label: 'السوشال ميديا', icon: Share2 },
  { key: 'analytics', label: 'التحليلات', icon: BarChart3 },
];

export function Sidebar({ current, onNavigate }: SidebarProps) {
  return (
    <aside className="w-64 bg-navy-900 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-navy-800/60">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-900/30">
              <Compass className="w-7 h-7 text-navy-900" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gold-400 rounded-full border-2 border-navy-900 animate-pulse-soft" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-display">البوصلة</h1>
            <p className="text-xs text-gold-300/80">إضاءات استراتيجية نحو التغيير</p>
          </div>
        </div>
      </div>

      {/* Dr. Name */}
      <div className="px-6 py-4 border-b border-navy-800/60">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-gold-400" />
          <p className="text-sm font-medium text-gold-200">د. علي العتيبي</p>
        </div>
        <p className="text-xs text-navy-400 mt-1">مستشار وخبير في الفكر الاستراتيجي</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = current === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gold-500/15 text-gold-300 shadow-sm'
                  : 'text-navy-300 hover:bg-navy-800/50 hover:text-navy-100'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-gold-400' : 'text-navy-400'}`} />
              <span>{item.label}</span>
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-gold-400 mr-auto" />}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-navy-800/60">
        <div className="flex items-center gap-2 text-xs text-navy-400">
          <div className="w-2 h-2 rounded-full bg-gold-400 animate-pulse-soft" />
          <span>النظام يعمل بشكل طبيعي</span>
        </div>
        <p className="text-[10px] text-navy-500 mt-2 leading-relaxed">
          البوصلة: الثبات والبساطة والعمق وبعد الأثر
        </p>
      </div>
    </aside>
  );
}
