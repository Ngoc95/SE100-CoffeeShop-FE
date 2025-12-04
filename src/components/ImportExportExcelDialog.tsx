import { useState, useRef } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  Download, 
  X, 
  CheckCircle, 
  AlertCircle,
  FileText,
  ArrowDownToLine,
  ArrowUpFromLine,
  RotateCcw
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
import { Badge } from './ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';

interface ImportExportExcelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TransactionType = 'import' | 'export' | 'return';

interface PreviewRow {
  [key: string]: string | number;
  status: 'valid' | 'error' | 'warning';
  errors?: string[];
}

export function ImportExportExcelDialog({ open, onOpenChange }: ImportExportExcelDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview' | 'processing' | 'complete'>('upload');
  const [previewData, setPreviewData] = useState<PreviewRow[]>([]);
  const [progress, setProgress] = useState(0);
  const [importStats, setImportStats] = useState({ success: 0, errors: 0, warnings: 0 });
  const [transactionType, setTransactionType] = useState<TransactionType>('import');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getTypeLabel = () => {
    switch (transactionType) {
      case 'import':
        return 'Phiếu nhập kho';
      case 'export':
        return 'Phiếu xuất kho';
      case 'return':
        return 'Phiếu trả hàng';
    }
  };

  const getTemplateColumns = () => {
    switch (transactionType) {
      case 'import':
        return ['Mã lô hàng', 'Tên hàng hóa', 'Đơn vị', 'Số lượng', 'Giá nhập', 'Hạn sử dụng', 'Nhà cung cấp'];
      case 'export':
        return ['Mã lô hàng', 'Tên hàng hóa', 'Đơn vị', 'Số lượng', 'Lý do xuất'];
      case 'return':
        return ['Mã lô hàng', 'Tên hàng hóa', 'Đơn vị', 'Số lượng', 'Lý do trả', 'Nhà cung cấp'];
    }
  };

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
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    // Check file type
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];
    
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(xlsx|xls|csv)$/)) {
      toast.error('Vui lòng chọn file Excel (.xlsx, .xls) hoặc CSV');
      return;
    }

    // Check file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('File quá lớn. Vui lòng chọn file nhỏ hơn 5MB');
      return;
    }

    setFile(selectedFile);
    // Simulate file processing and preview
    setTimeout(() => {
      processFile(selectedFile);
    }, 500);
  };

  const processFile = (file: File) => {
    // Mock data - In real app, this would parse the Excel file
    const mockData: PreviewRow[] = [
      {
        id: '1',
        batchCode: 'LOT001',
        itemName: 'Cà phê hạt Arabica',
        unit: 'kg',
        quantity: '50',
        unitPrice: '200000',
        supplier: 'Công ty ABC',
        status: 'valid'
      },
      {
        id: '2',
        batchCode: 'LOT002',
        itemName: 'Sữa tươi',
        unit: 'lít',
        quantity: '100',
        unitPrice: '25000',
        supplier: 'Vinamilk',
        status: 'valid'
      },
      {
        id: '3',
        batchCode: 'LOT003',
        itemName: 'Đường trắng',
        unit: 'kg',
        quantity: '', // Missing quantity
        unitPrice: '15000',
        supplier: 'Công ty XYZ',
        status: 'error',
        errors: ['Thiếu số lượng']
      },
      {
        id: '4',
        batchCode: 'LOT004',
        itemName: 'Ly nhựa',
        unit: 'cái',
        quantity: '1000',
        unitPrice: '500',
        supplier: 'Nhà cung cấp DEF',
        status: 'valid'
      },
    ];

    setPreviewData(mockData);
    setStep('preview');
  };

  const handleImport = () => {
    setStep('processing');
    let currentProgress = 0;
    
    const interval = setInterval(() => {
      currentProgress += 10;
      setProgress(currentProgress);
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        const validRows = previewData.filter(row => row.status === 'valid').length;
        const errorRows = previewData.filter(row => row.status === 'error').length;
        const warningRows = previewData.filter(row => row.status === 'warning').length;
        
        setImportStats({
          success: validRows,
          errors: errorRows,
          warnings: warningRows
        });
        setStep('complete');
      }
    }, 200);
  };

  const handleClose = () => {
    setFile(null);
    setStep('upload');
    setPreviewData([]);
    setProgress(0);
    setImportStats({ success: 0, errors: 0, warnings: 0 });
    onOpenChange(false);
  };

  const downloadTemplate = () => {
    // In real app, this would download an actual Excel template
    toast.success('Đang tải file mẫu...');
  };

  const renderUploadStep = () => (
    <div className="space-y-6">
      {/* Transaction Type Selection */}
      <div>
        <Label>Chọn loại phiếu muốn import <span className="text-red-500">*</span></Label>
        <Select value={transactionType} onValueChange={(value) => setTransactionType(value as TransactionType)}>
          <SelectTrigger className="mt-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="import">
              <div className="flex items-center gap-2">
                <ArrowDownToLine className="w-4 h-4 text-emerald-600" />
                Phiếu nhập kho
              </div>
            </SelectItem>
            <SelectItem value="export">
              <div className="flex items-center gap-2">
                <ArrowUpFromLine className="w-4 h-4 text-blue-600" />
                Phiếu xuất kho
              </div>
            </SelectItem>
            <SelectItem value="return">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-orange-600" />
                Phiếu trả hàng
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-slate-500 mt-1.5">
          Template Excel sẽ thay đổi theo loại phiếu bạn chọn
        </p>
      </div>

      {/* Template Download */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm text-slate-900 mb-1">Tải file mẫu Excel</h4>
            <p className="text-xs text-slate-600 mb-3">
              File mẫu đã được thiết lập sẵn các cột dữ liệu phù hợp với loại: <strong>{getTypeLabel()}</strong>
            </p>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={downloadTemplate}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Tải file mẫu
            </Button>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-slate-300 hover:border-slate-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-slate-900 mb-2">
          Kéo thả file Excel vào đây
        </h3>
        <p className="text-sm text-slate-600 mb-4">
          hoặc
        </p>
        <Button 
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
        >
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Chọn file từ máy tính
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".xlsx,.xls,.csv"
          onChange={(e) => {
            const files = e.target.files;
            if (files && files[0]) {
              handleFileSelect(files[0]);
            }
          }}
        />
        <p className="text-xs text-slate-500 mt-4">
          Hỗ trợ: .xlsx, .xls, .csv (Tối đa 5MB)
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-slate-50 rounded-lg p-4">
        <h4 className="text-sm text-slate-900 mb-3">Hướng dẫn:</h4>
        <ul className="text-xs text-slate-600 space-y-2">
          <li className="flex gap-2">
            <span className="text-blue-600">1.</span>
            <span>Tải file mẫu Excel phù hợp với loại phiếu bạn muốn import</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600">2.</span>
            <span>Điền thông tin vào các cột trong file theo mẫu</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600">3.</span>
            <span>Upload file đã điền thông tin và kiểm tra dữ liệu trước khi import</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600">4.</span>
            <span>Xác nhận import để tạo phiếu hàng loạt vào hệ thống</span>
          </li>
        </ul>
      </div>

      {/* Expected Columns */}
      <div>
        <h4 className="text-sm text-slate-900 mb-3">Các cột dữ liệu yêu cầu:</h4>
        <div className="flex flex-wrap gap-2">
          {getTemplateColumns().map((col, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {col}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-4">
      {/* File Info */}
      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-sm text-slate-900">{file?.name}</p>
            <p className="text-xs text-slate-600">
              {previewData.length} hàng dữ liệu
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setFile(null);
            setStep('upload');
            setPreviewData([]);
          }}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span className="text-xs text-slate-600">Hợp lệ</span>
          </div>
          <p className="text-emerald-600">{previewData.filter(row => row.status === 'valid').length}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span className="text-xs text-slate-600">Cảnh báo</span>
          </div>
          <p className="text-amber-600">{previewData.filter(row => row.status === 'warning').length}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <X className="w-4 h-4 text-red-600" />
            <span className="text-xs text-slate-600">Lỗi</span>
          </div>
          <p className="text-red-600">{previewData.filter(row => row.status === 'error').length}</p>
        </div>
      </div>

      {/* Preview Table */}
      <div className="border rounded-lg max-h-96 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">STT</TableHead>
              <TableHead>Mã lô</TableHead>
              <TableHead>Tên hàng</TableHead>
              <TableHead>Đơn vị</TableHead>
              <TableHead>Số lượng</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>NCC</TableHead>
              <TableHead className="w-24">Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {previewData.map((row, idx) => (
              <TableRow key={row.id}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell className="font-mono text-xs">{row.batchCode}</TableCell>
                <TableCell>{row.itemName}</TableCell>
                <TableCell>{row.unit}</TableCell>
                <TableCell>{row.quantity}</TableCell>
                <TableCell>{row.unitPrice}</TableCell>
                <TableCell>{row.supplier}</TableCell>
                <TableCell>
                  {row.status === 'valid' && (
                    <Badge className="bg-emerald-500">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      OK
                    </Badge>
                  )}
                  {row.status === 'warning' && (
                    <Badge className="bg-amber-500">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Cảnh báo
                    </Badge>
                  )}
                  {row.status === 'error' && (
                    <Badge className="bg-red-500">
                      <X className="w-3 h-3 mr-1" />
                      Lỗi
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Error Details */}
      {previewData.some(row => row.errors && row.errors.length > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="text-sm text-red-900 mb-3">Chi tiết lỗi:</h4>
          <ul className="text-xs text-red-700 space-y-2">
            {previewData
              .filter(row => row.errors && row.errors.length > 0)
              .map((row, idx) => (
                <li key={idx}>
                  <strong>Hàng {previewData.indexOf(row) + 1} ({row.batchCode}):</strong>{' '}
                  {row.errors?.join(', ')}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );

  const renderProcessingStep = () => (
    <div className="space-y-6 py-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Upload className="w-8 h-8 text-blue-600 animate-pulse" />
        </div>
        <h3 className="text-slate-900 mb-2">Đang import dữ liệu...</h3>
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
        <h3 className="text-slate-900 mb-2">Import thành công!</h3>
        <p className="text-sm text-slate-600">
          Dữ liệu đã được thêm vào hệ thống
        </p>
      </div>

      {/* Import Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p className="text-2xl text-emerald-600 mb-1">{importStats.success}</p>
          <p className="text-xs text-slate-600">Thành công</p>
        </div>
        <div className="text-center p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-2xl text-amber-600 mb-1">{importStats.warnings}</p>
          <p className="text-xs text-slate-600">Cảnh báo</p>
        </div>
        <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-2xl text-red-600 mb-1">{importStats.errors}</p>
          <p className="text-xs text-slate-600">Lỗi</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-slate-700 text-center">
          {importStats.success > 0 && `${importStats.success} ${getTypeLabel()} đã được tạo trong hệ thống. `}
          {importStats.errors > 0 && `${importStats.errors} hàng bị lỗi đã bỏ qua.`}
        </p>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Excel - {getTypeLabel()}</DialogTitle>
        </DialogHeader>

        {step === 'upload' && renderUploadStep()}
        {step === 'preview' && renderPreviewStep()}
        {step === 'processing' && renderProcessingStep()}
        {step === 'complete' && renderCompleteStep()}

        <DialogFooter>
          {step === 'upload' && (
            <Button variant="outline" onClick={handleClose}>
              Hủy
            </Button>
          )}
          {step === 'preview' && (
            <>
              <Button 
                variant="outline" 
                onClick={() => {
                  setFile(null);
                  setStep('upload');
                  setPreviewData([]);
                }}
              >
                Quay lại
              </Button>
              <Button 
                onClick={handleImport}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={previewData.filter(row => row.status === 'error').length > 0}
              >
                <Upload className="w-4 h-4 mr-2" />
                Import {previewData.filter(row => row.status === 'valid').length} mục
              </Button>
            </>
          )}
          {step === 'complete' && (
            <Button onClick={handleClose} className="bg-blue-600 hover:bg-blue-700">
              Hoàn thành
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
