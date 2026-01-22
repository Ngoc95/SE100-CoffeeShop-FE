import React, { createContext, useContext, useState, useCallback } from 'react';

interface ReportContextType {
    setExportHandler: (handler: () => Promise<void>) => void;
    triggerExport: () => Promise<void>;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export const ReportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [exportHandler, setHandler] = useState<(() => Promise<void>) | null>(null);

    const setExportHandler = useCallback((handler: () => Promise<void>) => {
        setHandler(() => handler);
    }, []);

    const triggerExport = useCallback(async () => {
        if (exportHandler) {
            await exportHandler();
        } else {
            console.warn('No export handler registered for current report');
        }
    }, [exportHandler]);

    return (
        <ReportContext.Provider value={{ setExportHandler, triggerExport }}>
            {children}
        </ReportContext.Provider>
    );
};

export const useReport = () => {
    const context = useContext(ReportContext);
    if (context === undefined) {
        throw new Error('useReport must be used within a ReportProvider');
    }
    return context;
};
