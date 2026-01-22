export type TimePreset =
    | 'today'
    | 'yesterday'
    | 'this-week'
    | 'last-week'
    | 'last-7-days'
    | 'this-month'
    | 'last-month'
    | 'last-30-days'
    | 'this-quarter'
    | 'last-quarter'
    | 'this-year'
    | 'last-year';

export interface DateRange {
    from: Date;
    to: Date;
}

/**
 * Convert time preset to actual date range
 * @param preset - The time preset to convert
 * @returns Object with from and to dates
 */
export function convertPresetToDateRange(preset: TimePreset): DateRange {
    const now = new Date();
    let from: Date;
    let to: Date = new Date(now);

    switch (preset) {
        case 'today':
            from = new Date(now);
            to = new Date(now);
            break;
        case 'yesterday':
            from = new Date(now.setDate(now.getDate() - 1));
            to = new Date(from);
            break;
        case 'this-week':
            from = new Date(now.setDate(now.getDate() - now.getDay()));
            to = new Date();
            break;
        case 'last-week':
            from = new Date(now.setDate(now.getDate() - now.getDay() - 7));
            to = new Date(now.setDate(now.getDate() + 6));
            break;
        case 'last-7-days':
            from = new Date(now.setDate(now.getDate() - 6));
            to = new Date();
            break;
        case 'this-month':
            from = new Date(now.getFullYear(), now.getMonth(), 1);
            to = new Date();
            break;
        case 'last-month':
            from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            to = new Date(now.getFullYear(), now.getMonth(), 0);
            break;
        case 'last-30-days':
            from = new Date(now.setDate(now.getDate() - 29));
            to = new Date();
            break;
        case 'this-quarter':
            const currentQuarter = Math.floor(now.getMonth() / 3);
            from = new Date(now.getFullYear(), currentQuarter * 3, 1);
            to = new Date();
            break;
        case 'last-quarter':
            const lastQuarter = Math.floor(now.getMonth() / 3) - 1;
            from = new Date(now.getFullYear(), lastQuarter * 3, 1);
            to = new Date(now.getFullYear(), lastQuarter * 3 + 3, 0);
            break;
        case 'this-year':
            from = new Date(now.getFullYear(), 0, 1);
            to = new Date();
            break;
        case 'last-year':
            from = new Date(now.getFullYear() - 1, 0, 1);
            to = new Date(now.getFullYear() - 1, 11, 31);
            break;
        default:
            from = new Date(now.getFullYear(), now.getMonth(), 1);
            to = new Date();
    }

    return { from, to };
}
