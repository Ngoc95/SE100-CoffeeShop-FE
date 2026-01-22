import { useState, useRef } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  Download, 
  X, 
  CheckCircle, 
  AlertCircle
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
import { toast } from 'sonner';
import { excelService, ImportExportModule } from '../services/excelService';

interface ImportExcelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module: ImportExportModule;
  title: string;
  onSuccess?: () => void;
}

export function ImportExcelDialog({ open, onOpenChange, module, title, onSuccess }: ImportExcelDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [step, setStep] = useState<'upload' | 'processing' | 'complete'>('upload');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [templateType, setTemplateType] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) handleFileSelect(files[0]);
  };

  const handleFileSelect = (selectedFile: File) => {
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];
    
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(xlsx|xls|csv)$/)) {
      toast.error('Vui lòng chọn file Excel (.xlsx, .xls) hoặc CSV');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File quá lớn. Vui lòng chọn file nhỏ hơn 10MB');
      return;
    }

    setFile(selectedFile);
  };

  const handleImport = async () => {
    if (!file) return;
    
    setStep('processing');
    setProgress(30); // Fake progress to start

    try {
      const res = await excelService.importData(module, file);
      setProgress(100);
      setResult(res.metaData || res); // Adapt to response structure
      setStep('complete');
      toast.success('Import hoàn tất');
      if (onSuccess) onSuccess();
    } catch (error) {
       console.error(error);
       toast.error('Import thất bại');
       setStep('upload'); // Go back to upload
    }
  };

  const handleClose = () => {
    setFile(null);
    setStep('upload');
    setResult(null);
    setProgress(0);
    setTemplateType('');
    onOpenChange(false);
  };

  const downloadTemplate = async () => {
      try {
          await excelService.downloadTemplate(module, templateType ? { type: templateType } : undefined);
          toast.success('Đang tải file mẫu...');
      } catch (err) {
          toast.error('Lỗi khi tải template');
      }
  };

  const renderUploadStep = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FileSpreadsheet className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm text-slate-900 mb-1">Tải file mẫu Excel</h4>
            <p className="text-xs text-slate-600 mb-3">
              Vui lòng sử dụng file mẫu để đảm bảo dữ liệu nhập vào chính xác.
            </p>
            {module === 'inventory' && (
                <div className="mb-3">
                     <select 
                        className="text-sm border-slate-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white px-3 py-1.5"
                        onChange={(e) => setTemplateType(e.target.value)}
                        defaultValue=""
                     >
                         <option value="">-- Chọn loại hàng hóa --</option>
                         <option value="inventory_ready">Hàng bán sẵn (Ready-made)</option>
                         <option value="inventory_composite">Hàng cấu thành (Composite)</option>
                         <option value="inventory_ingredient">Nguyên liệu (Ingredient)</option>
                     </select>
                </div>
            )}
            <Button size="sm" variant="outline" onClick={downloadTemplate} className="gap-2">
              <Download className="w-4 h-4" /> Tải file mẫu
            </Button>
          </div>
        </div>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-slate-900 mb-2">Kéo thả file Excel vào đây</h3>
        <p className="text-sm text-slate-600 mb-4">hoặc</p>
        <Button onClick={() => fileInputRef.current?.click()} variant="outline">
          <FileSpreadsheet className="w-4 h-4 mr-2" /> Chọn file từ máy tính
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".xlsx,.xls,.csv"
          onChange={(e) => {
            if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
          }}
        />
        {file && <div className="mt-4 text-sm text-blue-600 font-medium">Đã chọn: {file.name}</div>}
      </div>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="space-y-6 py-8">
      <div className="text-center">
        <h3 className="text-slate-900 mb-2">Đang xử lý dữ liệu...</h3>
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="space-y-6 py-8">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
        <h3 className="text-slate-900 mb-2">Import hoàn tất!</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
         <div className="bg-emerald-50 p-4 rounded-lg text-center border border-emerald-200">
             <div className="text-2xl font-bold text-emerald-600">{result?.successCount || 0}</div>
             <div className="text-xs text-emerald-800">Thành công</div>
         </div>
         <div className="bg-red-50 p-4 rounded-lg text-center border border-red-200">
             <div className="text-2xl font-bold text-red-600">{result?.errorCount || 0}</div>
             <div className="text-xs text-red-800">Lỗi</div>
         </div>
      </div>

      {result?.errors && result.errors.length > 0 && (
          <div className="bg-slate-50 p-4 rounded-lg max-h-60 overflow-y-auto border">
              <h4 className="text-sm font-medium mb-2 text-red-600">Chi tiết lỗi:</h4>
              <ul className="text-xs space-y-1 text-slate-700">
                  {result.errors.map((err: any, idx: number) => (
                      <li key={idx}>Hàng {err.row}: {err.error}</li>
                  ))}
              </ul>
          </div>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {step === 'upload' && renderUploadStep()}
        {step === 'processing' && renderProcessingStep()}
        {step === 'complete' && renderCompleteStep()}
        <DialogFooter>
          {step === 'upload' && (
             <>
                <Button variant="outline" onClick={handleClose}>Hủy</Button>
                <Button onClick={handleImport} disabled={!file} className="bg-blue-600 hover:bg-blue-700">
                    Import
                </Button>
             </>
          )}
          {step === 'complete' && (
             <Button onClick={handleClose}>Đóng</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}