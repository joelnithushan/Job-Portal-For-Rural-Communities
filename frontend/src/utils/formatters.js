export const formatSalary = (min, max, t) => {
    if (!min && !max) return t ? t('salary_not_disclosed') : 'Salary not disclosed';
    if (!max) return `LKR ${min.toLocaleString()}+`;
    return `LKR ${min.toLocaleString()} – ${max.toLocaleString()}`;
};

export const formatDate = (dateString, i18n) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const locale = i18n?.status ? i18n.language : (typeof i18n === 'string' ? i18n : 'en-GB');
    const localeMap = { 'en': 'en-GB', 'ta': 'ta-LK', 'si': 'si-LK' };
    
    return date.toLocaleDateString(localeMap[locale] || 'en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

export const timeAgo = (dateString, t) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 10) return t ? t('just_now') : 'Just now';

    let interval = seconds / 31536000;
    if (interval > 1) return t ? t('years_ago', { count: Math.floor(interval) }) : Math.floor(interval) + ' years ago';

    interval = seconds / 2592000;
    if (interval > 1) return t ? t('months_ago', { count: Math.floor(interval) }) : Math.floor(interval) + ' months ago';

    interval = seconds / 86400;
    if (interval > 1) return t ? t('days_ago', { count: Math.floor(interval) }) : Math.floor(interval) + ' days ago';

    interval = seconds / 3600;
    if (interval > 1) return t ? t('hours_ago', { count: Math.floor(interval) }) : Math.floor(interval) + ' hours ago';

    interval = seconds / 60;
    if (interval > 1) return t ? t('minutes_ago', { count: Math.floor(interval) }) : Math.floor(interval) + ' minutes ago';

    return t ? t('seconds_ago', { count: Math.floor(seconds) }) : Math.floor(seconds) + ' seconds ago';
};

export const formatDistance = (meters) => {
    if (!meters) return '';
    if (meters < 1000) return `${Math.round(meters)}m away`;
    return `${(meters / 1000).toFixed(1)}km away`;
};

export const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};
