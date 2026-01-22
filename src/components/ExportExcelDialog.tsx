import { useState } from 'react';
import {
    Download,
    FileSpreadsheet,
    X,
    CheckCircle,
    FileText
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from './ui/dialog';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { toast } from 'sonner@2.0.3';

interface ColumnDef<T> {
    header: string;
    accessor: (row: T) => string | number | null | undefined;
}

interface ExportExcelDialogProps<T> {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: T[];
    columns: ColumnDef<T>[];
    fileName: string;
    title?: string;
    description?: string;
}

export function ExportExcelDialog<T>({
    open,
    onOpenChange,
    data,
    columns,
    fileName: defaultFileName,
    title = "Xuất dữ liệu",
    description
}: ExportExcelDialogProps<T>) {
    const [fileName, setFileName] = useState(defaultFileName);
    const [step, setStep] = useState<'config' | 'processing' | 'complete'>('config');
    const [progress, setProgress] = useState(0);

    const handleExport = () => {
        if (!fileName.trim()) {
            toast.error('Vui lòng nhập tên file');
            return;
        }

        setStep('processing');
        let currentProgress = 0;

        // Simulate processing
        const interval = setInterval(() => {
            currentProgress += 10;
            setProgress(currentProgress);

            if (currentProgress >= 100) {
                clearInterval(interval);

                try {
                    // Generate CSV content
                    const headers = columns.map(c => c.header).join(',');
                    const rows = data.map(row => {
                        return columns.map(c => {
                            const value = c.accessor(row);
                            // Escape quotes and wrap in quotes
                            const stringValue = String(value === null || value === undefined ? '' : value);
                            return `"${stringValue.replace(/"/g, '""')}"`;
                        }).join(',');
                    }).join('\n');

                    const csvContent = `\ufeff${headers}\n${rows}`; // Add BOM for Excel UTF-8 support

                    // Create download link
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.setAttribute('href', url);
                    link.setAttribute('download', `${fileName.endsWith('.csv') ? fileName : fileName + '.csv'}`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    setStep('complete');
                } catch (error) {
                    console.error('Export error:', error);
                    toast.error('Có lỗi xảy ra khi xuất file');
                    setStep('config');
                }
            }
        }, 150);
    };

    const handleClose = () => {
        setStep('config');
        setProgress(0);
        onOpenChange(false);
    };

    const renderConfigStep = () => (
        <div className="space-y-6">
            {description && (
                <p className="text-sm text-slate-600">
                    {description}
                </p>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="text-sm text-slate-900 mb-1">Thông tin xuất file</h4>
                        <div className="text-xs text-slate-600 space-y-1">
                            <p>• Số lượng bản ghi: <strong>{data.length}</strong></p>
                            <p>• Số lượng cột: <strong>{columns.length}</strong></p>
                            <p>• Định dạng: <strong>CSV (Excel compatible)</strong></p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="filename">Tên file</Label>
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Input
                            id="filename"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            placeholder="Nhập tên file..."
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                            .csv
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderProcessingStep = () => (
        <div className="space-y-6 py-8">
            <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Download className="w-8 h-8 text-blue-600 animate-bounce" />
                </div>
                <h3 className="text-slate-900 mb-2">Đang xuất file...</h3>
                <p className="text-sm text-slate-600">
                    Vui lòng đợi trong giây lát
                </p>
            </div>
            <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-slate-600 text-center">{progress}%</p>
            </div>
        </div>
    );

    const renderCompleteStep = () => (
        <div className="space-y-6 py-8">
            <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-slate-900 mb-2">Xuất file thành công!</h3>
                <p className="text-sm text-slate-600">
                    File đã được tải xuống máy tính của bạn
                </p>
            </div>
        </div>
    );

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-xs w-[350px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                {step === 'config' && renderConfigStep()}
                {step === 'processing' && renderProcessingStep()}
                {step === 'complete' && renderCompleteStep()}

                <DialogFooter>
                    {step === 'config' && (
                        <>
                            <Button variant="outline" onClick={handleClose}>
                                Hủy
                            </Button>
                            <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700">
                                <Download className="w-4 h-4 mr-2" />
                                Xuất file
                            </Button>
                        </>
                    )}
                    {step === 'complete' && (
                        <Button onClick={handleClose} className="bg-blue-600 hover:bg-blue-700">
                            Đóng
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
