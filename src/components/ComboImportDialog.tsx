import React, { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Upload, Download, CheckCircle2, AlertCircle, FileText, FileSpreadsheet, X, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { createCombo, updateCombo } from "../api/combo";
import { getInventoryItems } from "../api/inventoryItem";

interface ComboImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted?: () => void;
}

interface PreviewRow {
  idx: number;
  id?: string | number;
  name: string;
  description?: string;
  comboPrice: number;
  originalPrice?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  groups?: any[]; // normalized groups
  status: "valid" | "warning" | "error";
  message?: string;
}

// CSV helpers
const parseCSV = async (file: File): Promise<Array<Record<string, string>>> => {
  const text = await file.text();
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  const rows: Array<Record<string, string>> = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => (row[h] = (cols[idx] ?? "").trim()));
    rows.push(row);
  }
  return rows;
};

// Template columns for combos
const TEMPLATE_COLUMNS: string[] = [
  "Mã combo (tùy chọn)",
  "Tên combo",
  "Giá combo",
  "Giá gốc (tùy chọn)",
  "Mô tả",
  "Trạng thái (active/inactive)",
  "Ngày bắt đầu (yyyy-MM-dd)",
  "Ngày kết thúc (yyyy-MM-dd)",
  "Nhóm (JSON)",
];

export function ComboImportDialog({ open, onOpenChange, onCompleted }: ComboImportDialogProps) {
  const [step, setStep] = useState<"upload" | "preview" | "processing" | "complete">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [importStats, setImportStats] = useState({ total: 0, success: 0, failed: 0 });
  const [inventoryItems, setInventoryItems] = useState<Array<{ id: number; name: string }>>([]);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      // reset internal state when closing
      setStep("upload");
      setFile(null);
      setPreviewRows([]);
      setImportStats({ total: 0, success: 0, failed: 0 });
    }
  }, [open]);

  useEffect(() => {
    // load inventory items to validate group item references
    (async () => {
      try {
        const res = await (getInventoryItems as any)({ excludeIngredients: true, limit: 500 });
        const data = (res as any)?.data?.metaData ?? (res as any)?.data ?? res;
        const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
        setInventoryItems(
          (items as any[]).map((it: any) => ({ id: Number(it.id), name: String(it.name) }))
        );
      } catch (_) {
        setInventoryItems([]);
      }
    })();
  }, []);

  const downloadTemplate = () => {
    const sampleGroups = [
      {
        name: "Chọn 1 ly",
        isRequired: true,
        minChoices: 1,
        maxChoices: 1,
        items: [
          { itemId: 1, extraPrice: 0 },
          { itemId: 2, extraPrice: 5000 },
        ],
      },
      {
        name: "Chọn 1 bánh",
        isRequired: true,
        minChoices: 1,
        maxChoices: 1,
        items: [{ itemId: 9, extraPrice: 0 }],
      },
    ];
    const rows = [
      [
        "",
        "Combo Sáng",
        "60000",
        "75000",
        "1 cà phê + 1 bánh",
        "active",
        "2025-01-01",
        "",
        JSON.stringify(sampleGroups),
      ],
    ];
    const csvContent = [TEMPLATE_COLUMNS.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template-combos.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Đã tải mẫu nhập Combo");
  };

  const handleFileSelect = async (f: File | null) => {
    if (!f) return;
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (!ext || !["csv"].includes(ext)) {
      toast.error("Chỉ hỗ trợ tệp CSV cho nhập Combo");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Tệp quá lớn (giới hạn 5MB)");
      return;
    }
    setFile(f);
    await processFile(f);
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

  const processFile = async (f: File) => {
    try {
      const rawRows = await parseCSV(f);
      if (rawRows.length === 0) {
        toast.error("Không đọc được dữ liệu từ tệp");
        return;
      }
      const normalized: PreviewRow[] = rawRows.map((row, idx) => {
        const idStr = row[TEMPLATE_COLUMNS[0]];
        const name = row[TEMPLATE_COLUMNS[1]];
        const comboPriceStr = row[TEMPLATE_COLUMNS[2]];
        const originalPriceStr = row[TEMPLATE_COLUMNS[3]];
        const description = row[TEMPLATE_COLUMNS[4]];
        const statusStr = row[TEMPLATE_COLUMNS[5]];
        const startDate = row[TEMPLATE_COLUMNS[6]];
        const endDate = row[TEMPLATE_COLUMNS[7]];
        const groupsJSON = row[TEMPLATE_COLUMNS[8]];

        // validations
        const errors: string[] = [];
        const warnings: string[] = [];
        const comboPrice = Number(comboPriceStr);
        const originalPrice = originalPriceStr ? Number(originalPriceStr) : undefined;
        if (!name || !name.trim()) errors.push("Thiếu tên combo");
        if (!Number.isFinite(comboPrice) || comboPrice <= 0) errors.push("Giá combo không hợp lệ");
        if (originalPriceStr && (!Number.isFinite(originalPrice!) || (originalPrice as number) <= 0)) warnings.push("Giá gốc không hợp lệ, sẽ bỏ qua");
        let isActive: boolean | undefined = undefined;
        if (statusStr) {
          const s = statusStr.toLowerCase();
          if (s === "active" || s === "đang áp dụng") isActive = true;
          else if (s === "inactive" || s === "tạm ngưng") isActive = false;
          else warnings.push("Trạng thái không hợp lệ, mặc định là hoạt động");
        }
        let groups: any[] | undefined = undefined;
        if (groupsJSON) {
          try {
            const parsed = JSON.parse(groupsJSON);
            if (!Array.isArray(parsed) || parsed.length === 0) {
              errors.push("Nhóm (JSON) không hợp lệ hoặc rỗng");
            } else {
              // validate group structure
              parsed.forEach((g: any, gIdx: number) => {
                if (!g.name || !String(g.name).trim()) errors.push(`Nhóm #${gIdx + 1} thiếu tên`);
                const items: any[] = Array.isArray(g.items) ? g.items : [];
                if (items.length === 0) errors.push(`Nhóm ${g.name || gIdx + 1} thiếu món`);
                const minC = Number(g.minChoices ?? (g.isRequired ? 1 : 0));
                const maxC = Number(g.maxChoices ?? items.length);
                if (!Number.isFinite(minC) || !Number.isFinite(maxC) || minC < 0 || maxC < 1 || minC > maxC) {
                  errors.push(`Thiết lập chọn của nhóm ${g.name || gIdx + 1} không hợp lệ`);
                }
                // validate items exist in inventory
                items.forEach((it, iIdx) => {
                  const itemId = Number(it.itemId);
                  if (!Number.isFinite(itemId)) errors.push(`Món #${iIdx + 1} của nhóm ${g.name || gIdx + 1} thiếu itemId hợp lệ`);
                  else if (!inventoryItems.some((inv) => inv.id === itemId)) {
                    warnings.push(`Món itemId=${itemId} không tồn tại trong kho (sẽ vẫn nhập)`);
                  }
                });
              });
              groups = parsed;
            }
          } catch (e) {
            errors.push("Không thể phân tích Nhóm (JSON)");
          }
        } else {
          errors.push("Thiếu Nhóm (JSON)");
        }

        const status: PreviewRow["status"] = errors.length > 0 ? "error" : warnings.length > 0 ? "warning" : "valid";
        const message = errors.length > 0 ? errors.join("; ") : warnings.join("; ");
        return {
          idx: idx + 1,
          id: idStr ? (Number(idStr) || idStr) : undefined,
          name,
          description,
          comboPrice,
          originalPrice,
          isActive,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          groups,
          status,
          message,
        };
      });

      setPreviewRows(normalized);
      setStep("preview");
    } catch (e: any) {
      toast.error("Không thể xử lý tệp", { description: e?.message });
    }
  };

  const anyErrors = useMemo(() => previewRows.some((r) => r.status === "error"), [previewRows]);
  const validCount = useMemo(() => previewRows.filter((r) => r.status !== "error").length, [previewRows]);

  const handleImport = async () => {
    if (previewRows.length === 0) return;
    setStep("processing");
    setImportStats({ total: previewRows.length, success: 0, failed: 0 });
    setProgress(0);

    let success = 0;
    let failed = 0;

    for (const row of previewRows) {
      if (row.status === "error") {
        failed++;
        setImportStats({ total: previewRows.length, success, failed });
        setProgress(Math.round(((success + failed) / Math.max(1, previewRows.length)) * 100));
        continue;
      }
      const payload: any = {
        name: row.name.trim(),
        description: row.description?.trim() || undefined,
        comboPrice: Number(row.comboPrice) || 0,
        originalPrice: row.originalPrice && row.originalPrice > 0 ? Number(row.originalPrice) : undefined,
        startDate: row.startDate || undefined,
        endDate: row.endDate || undefined,
        groups: (row.groups || []).map((g) => ({
          name: String(g.name).trim(),
          isRequired: Boolean(g.isRequired),
          minChoices: Number(g.minChoices ?? (g.isRequired ? 1 : 0)),
          maxChoices: Number(g.maxChoices ?? (Array.isArray(g.items) ? g.items.length : 1)),
          items: (Array.isArray(g.items) ? g.items : []).map((it: any) => ({
            itemId: Number(it.itemId),
            extraPrice: Number(it.extraPrice) || 0,
          })),
        })),
      };
      try {
        if (row.id != null) {
          await updateCombo(row.id, payload);
        } else {
          await createCombo(payload);
        }
        success++;
        setImportStats({ total: previewRows.length, success, failed });
      } catch (e: any) {
        failed++;
        setImportStats({ total: previewRows.length, success, failed });
      }
      // small delay for UI feedback
      await new Promise((r) => setTimeout(r, 150));
      setProgress(Math.round(((success + failed) / Math.max(1, previewRows.length)) * 100));
    }

    setStep("complete");
    toast.success(`Nhập xong: ${success} thành công, ${failed} thất bại`);
    if (onCompleted) onCompleted();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Import Combo</DialogTitle>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-6">
            {/* Template Download */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm text-slate-900 mb-1">Tải file mẫu CSV</h4>
                  <p className="text-xs text-slate-600 mb-3">
                    File mẫu đã được thiết lập sẵn các cột dữ liệu Combo
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
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${dragActive
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
                Kéo thả file CSV vào đây
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
                accept=".csv"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files[0]) {
                    handleFileSelect(files[0]);
                  }
                }}
              />
              <p className="text-xs text-slate-500 mt-4">
                Hỗ trợ: .csv (Tối đa 5MB)
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="text-sm text-slate-900 mb-3">Hướng dẫn:</h4>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex gap-2">
                  <span className="text-blue-600">1.</span>
                  <span>Tải file mẫu CSV nhập Combo</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600">2.</span>
                  <span>Điền thông tin Combo và Nhóm (JSON) theo mẫu</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600">3.</span>
                  <span>Upload file và kiểm tra dữ liệu</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600">4.</span>
                  <span>Xác nhận để import Combo</span>
                </li>
              </ul>
            </div>

            {/* Expected Columns */}
            <div>
              <h4 className="text-sm text-slate-900 mb-3">Các cột dữ liệu yêu cầu:</h4>
              <div className="flex flex-wrap gap-2">
                {TEMPLATE_COLUMNS.map((col, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {col}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-4">
            {/* File Info */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-slate-900">{file?.name}</p>
                  <p className="text-xs text-slate-600">
                    {previewRows.length} hàng dữ liệu
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setFile(null);
                  setStep('upload');
                  setPreviewRows([]);
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
                <p className="text-emerald-600">{previewRows.filter(row => row.status === 'valid').length}</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span className="text-xs text-slate-600">Cảnh báo</span>
                </div>
                <p className="text-amber-600">{previewRows.filter(row => row.status === 'warning').length}</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <X className="w-4 h-4 text-red-600" />
                  <span className="text-xs text-slate-600">Lỗi</span>
                </div>
                <p className="text-red-600">{previewRows.filter(row => row.status === 'error').length}</p>
              </div>
            </div>

            {/* Preview Table */}
            <div className="border rounded-lg max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">STT</TableHead>
                    <TableHead>Tên combo</TableHead>
                    <TableHead>Giá combo</TableHead>
                    <TableHead>Giá gốc</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Nhóm</TableHead>
                    <TableHead className="w-24">Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewRows.map((r) => (
                    <TableRow key={r.idx}>
                      <TableCell>{r.idx}</TableCell>
                      <TableCell>{r.name}</TableCell>
                      <TableCell>{r.comboPrice.toLocaleString("vi-VN")}₫</TableCell>
                      <TableCell>{(r.originalPrice ?? 0).toLocaleString("vi-VN")}₫</TableCell>
                      <TableCell>
                        {r.isActive == null ? (
                          <Badge variant="outline" className="text-xs">Mặc định</Badge>
                        ) : r.isActive ? (
                          <Badge className="bg-emerald-500 text-white text-xs">Hoạt động</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs bg-slate-100 border-slate-300 text-slate-700">Tạm ngưng</Badge>
                        )}
                      </TableCell>
                      <TableCell>{Array.isArray(r.groups) ? `${r.groups.length} nhóm` : '-'}</TableCell>
                      <TableCell>
                        {r.status === 'valid' && (
                          <Badge className="bg-emerald-500">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            OK
                          </Badge>
                        )}
                        {r.status === 'warning' && (
                          <Badge className="bg-amber-500">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Cảnh báo
                          </Badge>
                        )}
                        {r.status === 'error' && (
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
            {previewRows.some(row => row.message && row.status === 'error') && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="text-sm text-red-900 mb-3">Chi tiết lỗi:</h4>
                <ul className="text-xs text-red-700 space-y-2">
                  {previewRows.filter(r => r.status === 'error').map((row, idx) => (
                    <li key={idx}>
                      <strong>Hàng {row.idx}:</strong>{' '}
                      {row.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setFile(null);
                  setStep('upload');
                  setPreviewRows([]);
                }}
              >
                Quay lại
              </Button>
              <Button
                onClick={handleImport}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={previewRows.filter(row => row.status === 'error').length > 0 || validCount === 0}
              >
                <Upload className="w-4 h-4 mr-2" />
                Import {previewRows.filter(row => row.status !== 'error').length} mục
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "processing" && (
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
        )}

        {step === "complete" && (
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
                <p className="text-2xl text-amber-600 mb-1">{previewRows.filter(r => r.status === 'warning').length}</p>
                <p className="text-xs text-slate-600">Cảnh báo</p>
              </div>
              <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-2xl text-red-600 mb-1">{importStats.failed}</p>
                <p className="text-xs text-slate-600">Lỗi</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-slate-700 text-center">
                {importStats.success > 0 && `${importStats.success} combo được thêm/cập nhật. `}
                {importStats.failed > 0 && `${importStats.failed} hàng bị lỗi đã bỏ qua.`}
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Hoàn thành</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
