export function formatDate(date: string | null): string {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | null): string {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString('ar-SA', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(date: string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `منذ ${days} يوم`;
  if (hours > 0) return `منذ ${hours} ساعة`;
  if (minutes > 0) return `منذ ${minutes} دقيقة`;
  return 'الآن';
}

export const statusLabels: Record<string, string> = {
  idle: 'في الانتظار',
  working: 'يعمل الآن',
  paused: 'متوقف',
  error: 'خطأ',
  pending: 'قيد الانتظار',
  in_progress: 'قيد التنفيذ',
  completed: 'مكتمل',
  cancelled: 'ملغي',
  draft: 'مسودة',
  review: 'قيد المراجعة',
  scheduled: 'مجدول',
  published: 'منشور',
  archived: 'مؤرشف',
  idea: 'فكرة',
  approved: 'معتمد',
};

export const statusColors: Record<string, string> = {
  idle: 'bg-navy-50 text-navy-500',
  working: 'bg-gold-50 text-gold-700 border border-gold-200',
  paused: 'bg-navy-50 text-navy-400',
  error: 'bg-red-50 text-red-600',
  pending: 'bg-navy-50 text-navy-500',
  in_progress: 'bg-gold-50 text-gold-700 border border-gold-200',
  completed: 'bg-navy-100 text-navy-700',
  cancelled: 'bg-red-50 text-red-600',
  draft: 'bg-navy-50 text-navy-500',
  review: 'bg-gold-50 text-gold-700 border border-gold-200',
  scheduled: 'bg-navy-100 text-navy-700',
  published: 'bg-navy-700 text-white',
  archived: 'bg-navy-50 text-navy-400',
  idea: 'bg-gold-50 text-gold-700 border border-gold-200',
  approved: 'bg-navy-700 text-white',
};

export const priorityLabels: Record<string, string> = {
  low: 'منخفضة',
  medium: 'متوسطة',
  high: 'عالية',
  urgent: 'عاجلة',
};

export const priorityColors: Record<string, string> = {
  low: 'bg-navy-50 text-navy-500',
  medium: 'bg-navy-100 text-navy-600',
  high: 'bg-gold-50 text-gold-700 border border-gold-200',
  urgent: 'bg-gold-100 text-gold-800 border border-gold-300',
};

export const platformLabels: Record<string, string> = {
  twitter: 'تويتر',
  instagram: 'إنستغرام',
  facebook: 'فيسبوك',
  whatsapp: 'واتساب',
  telegram: 'تيليغرام',
  youtube: 'يوتيوب',
  tiktok: 'تيك توك',
  linkedin: 'لينكدإن',
};

export const platformColors: Record<string, string> = {
  twitter: 'bg-navy-50 text-navy-600',
  instagram: 'bg-navy-50 text-navy-600',
  facebook: 'bg-navy-50 text-navy-600',
  whatsapp: 'bg-navy-50 text-navy-600',
  telegram: 'bg-navy-50 text-navy-600',
  youtube: 'bg-navy-50 text-navy-600',
  tiktok: 'bg-navy-50 text-navy-600',
  linkedin: 'bg-navy-50 text-navy-600',
};

export const categoryLabels: Record<string, string> = {
  'تأملات': 'تأملات',
  'نصائح': 'نصائح',
  'أخلاق': 'أخلاق',
  'تربية': 'تربية',
  'اجتماعي': 'اجتماعي',
  'استراتيجي': 'استراتيجي',
  'قيادة': 'قيادة',
  'general': 'عام',
};
