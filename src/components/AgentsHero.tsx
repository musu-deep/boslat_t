import { ArrowUpRight, Compass, CalendarHeart } from 'lucide-react';
import type { ViewKey } from './Sidebar';
import './agents-hero.css';

interface AgentsHeroProps {
  onNavigate: (view: ViewKey) => void;
  hasFridayDraft: boolean;
}

export function AgentsHero({ onNavigate, hasFridayDraft }: AgentsHeroProps) {
  return (
    <section className="agents-hero" aria-labelledby="agents-hero-title">
      <img className="agents-hero-image" src={`${import.meta.env.BASE_URL}images/alboslah-hero.jpg`} alt="الدكتور علي العتيبي مع خريطة وبوصلة من الهوية الرسمية للبوصلة" fetchPriority="high" width="1600" height="1080" />
      <div className="agents-hero-shade" aria-hidden="true" />
      <div className="agents-hero-edge" aria-hidden="true" />
      <div className="agents-hero-content">
        <div className="agents-hero-glass">
          <div className="agents-hero-eyebrow"><Compass size={20} /><span>البوصلة</span><span className="agents-hero-divider" /><span>منصة الوكلاء</span></div>
          <p className="agents-hero-motto">إضاءات استراتيجية نحو التغيير</p>
          <h2 id="agents-hero-title">منصة وكلاء<br /><span>البوصلة</span></h2>
          <div className="agents-hero-rule" />
          <p className="agents-hero-name">المستشار د. علي العتيبي</p>
          <p className="agents-hero-role">مستشار وخبير في الفكر الاستراتيجي</p>
          <div className="agents-hero-actions">
            <button className="agents-hero-primary" onClick={() => onNavigate('agents')}>استعراض الوكلاء <ArrowUpRight size={18} /></button>
            <button className="agents-hero-secondary" onClick={() => onNavigate('content')}>إدارة المحتوى <ArrowUpRight size={17} /></button>
          </div>
          {hasFridayDraft && <button className="agents-hero-friday" onClick={() => onNavigate('friday')}><CalendarHeart size={16} /><span>بوست الجمعة — مراجعة المسودة</span><ArrowUpRight size={15} /></button>}
        </div>
      </div>
      <div className="agents-hero-caption" aria-hidden="true">الثبات · البساطة · العمق · بعد الأثر</div>
    </section>
  );
}
