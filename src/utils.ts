
export const generateId = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    // Fallback for older browsers / non-secure contexts
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

export const formatNumber = (num: number, lang: 'en' | 'bn'): string => {
    if (lang === 'en') return num.toString();
    return new Intl.NumberFormat('bn-IN', { useGrouping: false }).format(num);
};

export const formatUnit = (unit: string, lang: 'en' | 'bn'): string => {
    if (lang === 'en') {
        if (unit === 'pcs') return 'Pcs';
        return unit;
    }
    
    // Bengali mappings
    const mappings: Record<string, string> = {
        'kg': 'কেজি',
        'g': 'গ্রাম',
        'pcs': 'টি',
        'l': 'লিটার',
        'ml': 'মিলি',
        'packet': 'প্যাকেট',
        'loose': 'খোলা'
    };
    
    return mappings[unit.toLowerCase()] || unit;
};
