/**
 * Smart Currency Formatter for Charts
 * Automatically detects the appropriate unit (triệu or đồng) based on max value
 * and applies consistent formatting across the entire chart
 */

export interface SmartFormatter {
    format: (value: number) => string;
    formatAxis: (value: number) => string;
    formatTooltip: (value: number) => string;
}

/**
 * Creates a smart formatter that analyzes data and chooses consistent units
 * @param data - Array of data points
 * @param keys - Keys to check for max values
 * @returns Formatter object with format, formatAxis, and formatTooltip methods
 */
export const createSmartFormatter = (data: any[], keys: string[]): SmartFormatter => {
    // Find max value across all keys
    let maxValue = 0;
    data.forEach(item => {
        keys.forEach(key => {
            if (item[key] && item[key] > maxValue) {
                maxValue = item[key];
            }
        });
    });

    const useMillions = maxValue >= 1000000;

    return {
        // For labels on chart (e.g., "1.5tr" or "500.000đ")
        format: (value: number) => {
            if (useMillions) {
                return `${(value / 1000000).toFixed(1)}tr`;
            } else {
                return `${value.toLocaleString('vi-VN')}đ`;
            }
        },

        // For Y-axis ticks (shorter format)
        formatAxis: (value: number) => {
            if (useMillions) {
                return `${(value / 1000000).toFixed(1)}tr`;
            } else {
                return `${(value / 1000).toFixed(0)}k`;
            }
        },

        // For tooltips (full format with separators)
        formatTooltip: (value: number) => {
            return `${value.toLocaleString('vi-VN')}đ`;
        }
    };
};
