export const FORUM_CATEGORIES = [
  { value: '', label: 'Tất cả' },
  { value: 'NONG_NGHIEP', label: 'Nông nghiệp' },
  { value: 'CHAN_NUOI', label: 'Chăn nuôi' },
  { value: 'THI_TRUONG', label: 'Thị trường' },
  { value: 'KY_THUAT', label: 'Kỹ thuật' },
  { value: 'KINH_NGHIEM', label: 'Kinh nghiệm' },
  { value: 'KHAC', label: 'Khác' },
];

// Older posts may still carry these; the edit form keeps them selectable.
export const FORUM_LEGACY_CATEGORIES = [
  { value: 'TRONG_TROT', label: 'Trồng trọt' },
  { value: 'HOI_DAP', label: 'Hỏi đáp' },
  { value: 'KINH_DOANH', label: 'Kinh doanh nông nghiệp' },
];

export const FORUM_TOPICS = FORUM_CATEGORIES.filter(c => c.value);

export const forumCategoryLabel = (value?: string) =>
  [...FORUM_CATEGORIES, ...FORUM_LEGACY_CATEGORIES].find(c => c.value === value)?.label || value || '';
