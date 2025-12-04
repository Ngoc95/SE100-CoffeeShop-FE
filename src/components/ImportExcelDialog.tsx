import { useState, useRef } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  Download, 
  X, 
  CheckCircle, 
  AlertCircle,
  FileText,
  ShoppingBag,
  Layers,
  Box
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
import { toast } from 'sonner@2.0.3';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface ImportExcelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PreviewRow {
  [key: string]: string | number;
  status: 'valid' | 'error' | 'warning';
  errors?: string[];
}

export function ImportExcelDialog({ open, onOpenChange }: ImportExcelDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview' | 'processing' | 'complete'>('upload');
  const [previewData, setPreviewData] = useState<PreviewRow[]>([]);
  const [progress, setProgress] = useState(0);
  const [importStats, setImportStats] = useState({ success: 0, errors: 0, warnings: 0 });
  const [type, setType] = useState<'ready-made' | 'composite' | 'ingredient'>('ingredient');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getTypeLabel = () => {
    switch (type) {
      case 'ready-made':
        return 'Hàng hóa bán sẵn';
      case 'composite':
        return 'Hàng hóa cấu thành';
      case 'ingredient':
        return 'Nguyên liệu';
    }
  };

  const getTemplateColumns = () => {
    switch (type) {
      case 'ready-made':
        return ['Mã hàng', 'Tên hàng hóa', 'Danh mục', 'Đơn vị', 'Tồn kho tối thiểu', 'Tồn kho tối đa'];
      case 'composite':
        return ['Mã hàng', 'Tên hàng hóa', 'Danh mục', 'Đơn vị', 'Nguyên liệu (Mã:Số lượng)'];
      case 'ingredient':
        return ['Mã nguyên liệu', 'Tên nguyên liệu', 'Danh mục', 'Đơn vị', 'Tồn kho tối thiểu', 'Tồn kho tối đa'];
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
        code: 'RM001',
        name: 'Coca Cola',
        category: 'Đồ uống đóng chai',
        unit: 'chai',
        minStock: '20',
        maxStock: '100',
        status: 'valid'
      },
      {
        id: '2',
        code: 'RM002',
        name: 'Pepsi',
        category: 'Đồ uống đóng chai',
        unit: 'chai',
        minStock: '15',
        maxStock: '80',
        status: 'valid'
      },
      {
        id: '3',
        code: 'RM003',
        name: 'Bánh Croissant',
        category: '', // Missing category
        unit: 'cái',
        minStock: '10',
        maxStock: '50',
        status: 'error',
        errors: ['Thiếu danh mục']
      },
      {
        id: '4',
        code: 'RM004',
        name: 'Nước khoáng',
        category: 'Đồ uống đóng chai',
        unit: 'chai',
        minStock: '30',
        maxStock: '200',
        status: 'valid'
      },
      {
        id: '5',
        code: 'RM005',
        name: 'Bánh mì',
        category: 'Bánh ngọt',
        unit: 'cái',
        minStock: '50', // Min > Max
        maxStock: '20',
        status: 'warning',
        errors: ['Tồn kho tối thiểu lớn hơn tồn kho tối đa']
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
      {/* Item Type Selection */}
      <div>
        <Label>Chọn loại mặt hàng muốn import <span className="text-red-500">*</span></Label>
        <Select value={type} onValueChange={(value) => setType(value as 'ready-made' | 'composite' | 'ingredient')}>
          <SelectTrigger className="mt-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ingredient">
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-green-600" />
                Nguyên liệu
              </div>
            </SelectItem>
            <SelectItem value="ready-made">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-blue-600" />
                Hàng hóa bán sẵn
              </div>
            </SelectItem>
            <SelectItem value="composite">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                Hàng hóa cấu thành
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-slate-500 mt-1.5">
          Template Excel sẽ thay đổi theo loại mặt hàng bạn chọn
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
            <span>Tải file mẫu Excel phù hợp với loại hàng hóa bạn muốn import</span>
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
            <span>Xác nhận import để thêm hàng loạt vào hệ thống</span>
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
              <TableHead>Mã hàng</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Đơn vị</TableHead>
              <TableHead>Min</TableHead>
              <TableHead>Max</TableHead>
              <TableHead className="w-24">Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {previewData.map((row, idx) => (
              <TableRow key={row.id}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell className="font-mono text-xs">{row.code}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.category}</TableCell>
                <TableCell>{row.unit}</TableCell>
                <TableCell>{row.minStock}</TableCell>
                <TableCell>{row.maxStock}</TableCell>
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
                  <strong>Hàng {previewData.indexOf(row) + 1} ({row.code}):</strong>{' '}
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
          {importStats.success > 0 && `${importStats.success} ${getTypeLabel()} đã được thêm vào kho. `}
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