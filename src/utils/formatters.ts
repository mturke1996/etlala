import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.locale('ar');

export const formatCurrency = (amount: number): string => {
  const rounded = Math.round(amount);
  return new Intl.NumberFormat('ar-LY', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rounded) + ' د.ل';
};

export const formatDate = (date: string | Date, format: string = 'DD/MM/YYYY'): string => {
  return dayjs(date).format(format);
};

export const formatDateTime = (date: string | Date): string => {
  return dayjs(date).format('DD/MM/YYYY - hh:mm A');
};

export const formatRelativeDate = (date: string | Date): string => {
  return dayjs(date).fromNow();
};

export const formatPhoneNumber = (phone: string): string => {
  // Libyan phone format: 09X-XXXXXXX
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }
  return phone;
};

export const getStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    draft: 'مسودة',
    sent: 'مرسلة',
    paid: 'مدفوعة',
    partially_paid: 'مدفوعة جزئياً',
    overdue: 'متأخرة',
    cancelled: 'ملغاة',
    unpaid: 'غير مدفوع',
    company: 'شركة',
    individual: 'فرد',
  };
  return statusMap[status] || status;
};

export const expenseCategories: Record<string, string> = {
  materials: 'مواد',
  labor: 'عمالة',
  transport: 'نقل ومواصلات',
  equipment: 'معدات',
  subcontractors: 'مقاولين باطن',
  hospitality: 'ضيافة',
  rent: 'إيجار',
  maintenance: 'صيانة',
  marketing: 'تسويق',
  utilities: 'فواتير (كهرباء/نت)',
  government_fees: 'رسوم حكومية',
  office_supplies: 'قرطاسية ومكتبية',
  other: 'أخرى',
};

export const getExpenseCategoryLabel = (category: string): string => {
  return expenseCategories[category] || category;
};
