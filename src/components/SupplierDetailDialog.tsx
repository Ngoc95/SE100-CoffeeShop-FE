import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface Supplier {
  id: string;
  code: string;
  name: string;
  category: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  debt: number;
  status: "active" | "inactive";
}

interface Import {
  id: string;
  date: string;
  amount: number;
}

interface SupplierDetailDialogProps {
  open: boolean;
  onClose: () => void;
  supplier: Supplier | null;
}

const mockImports: Import[] = [
  { id: "PN001", date: "2023-10-26", amount: 5000000 },
  { id: "PN002", date: "2023-11-12", amount: 7500000 },
  { id: "PN003", date: "2023-12-05", amount: 3200000 },
];

export function SupplierDetailDialog({
  open,
  onClose,
  supplier,
}: SupplierDetailDialogProps) {
  if (!supplier) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chi tiết nhà cung cấp: {supplier.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="text-sm">
            <span className="font-semibold">Mã NCC:</span> {supplier.code}
          </div>
          <div className="text-sm">
            <span className="font-semibold">Tên:</span> {supplier.name}
          </div>
          <div className="text-sm">
            <span className="font-semibold">Danh mục:</span> {supplier.category}
          </div>
          <div className="text-sm">
            <span className="font-semibold">Người liên hệ:</span> {supplier.contact}
          </div>
          <div className="text-sm">
            <span className="font-semibold">Điện thoại:</span> {supplier.phone}
          </div>
          <div className="text-sm">
            <span className="font-semibold">Email:</span> {supplier.email}
          </div>
          <div className="text-sm col-span-2">
            <span className="font-semibold">Địa chỉ:</span> {supplier.address}, {supplier.city}
          </div>
          <div className="text-sm">
            <span className="font-semibold">Công nợ:</span>{" "}
            <span className="text-red-600">{formatCurrency(supplier.debt)}</span>
          </div>
          <div className="text-sm">
            <span className="font-semibold">Trạng thái:</span>{" "}
            <Badge
              variant={supplier.status === "active" ? "default" : "secondary"}
              className={
                supplier.status === "active"
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }
            >
              {supplier.status === "active" ? "Hoạt động" : "Không hoạt động"}
            </Badge>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-md mb-2">Lịch sử nhập hàng</h3>
          <div className="border rounded-md">
            <div className="grid grid-cols-3 p-2 font-semibold bg-gray-100">
              <div>Mã nhập</div>
              <div>Ngày</div>
              <div className="text-right">Số tiền</div>
            </div>
            {mockImports.map((imp) => (
              <div key={imp.id} className="grid grid-cols-3 p-2 border-t">
                <div>{imp.id}</div>
                <div>{imp.date}</div>
                <div className="text-right">{formatCurrency(imp.amount)}</div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
