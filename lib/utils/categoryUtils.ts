// Fonction pour formater le nom de la catégorie
export const formatCategoryName = (category: string): string => {
  const categoryMap: Record<string, string> = {
    'dev': 'Développement',
    'design': 'Design',
    'marketing': 'Marketing',
    'seo': 'SEO',
    'redaction': 'Rédaction',
  };
  
  return categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1);
};

// Fonction pour obtenir l'icône de catégorie
export const getCategoryIcon = (category: string): string => {
  const iconMap: Record<string, string> = {
    'dev': '💻',
    'design': '🎨',
    'marketing': '📈',
    'seo': '🔍',
    'redaction': '✍️',
  };
  
  return iconMap[category] || '🌟';
};
