import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Printer, RefreshCw, X } from "lucide-react";
import { ReceiptPrintContent } from "./ReceiptPrintContent";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

interface PrintReceiptModalProps {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  totalAmount: number;
  orderNumber?: string;
  customerName?: string;
  paymentMethod?: string;
  tableNumber?: string;
  waiterName?: string;
}

/**
 * Modal để xem trước và in hóa đơn.
 * Sử dụng window.print() để gọi hộp thoại in hệ thống.
 * Người dùng có thể:
 * 1. Xem trước hóa đơn
 * 2. Nhấn "In" để mở hộp thoại in hệ điều hành
 * 3. Nhấn "In lại" để in lại cùng một hóa đơn
 * 4. Nhấn "Đóng" để đóng modal mà không ảnh hưởng đơn hàng
 */
export function PrintReceiptModal({
  open,
  onClose,
  items,
  totalAmount,
  orderNumber = "ORD-001",
  customerName = "Khách hàng",
  paymentMethod = "Tiền mặt",
  tableNumber,
  waiterName,
}: PrintReceiptModalProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    // window.print() không block, nên dùng timeout để ensure content is rendered
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="w-5 h-5" />
            Xem trước & In hóa đơn
          </DialogTitle>
        </DialogHeader>

        {/* Receipt Preview */}
        <div className="flex-1 overflow-y-auto bg-white p-6 rounded-lg border border-slate-200">
          <ReceiptPrintContent
            items={items}
            totalAmount={totalAmount}
            orderNumber={orderNumber}
            customerName={customerName}
            paymentMethod={paymentMethod}
            receiptDate={new Date()}
            tableNumber={tableNumber}
            waiterName={waiterName}
          />
        </div>

        {/* Footer with buttons */}
        <DialogFooter className="grid grid-cols-3 gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="col-span-1">
            <X className="w-4 h-4 mr-1" />
            Đóng
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            disabled={isPrinting}
            className="col-span-1"
          >
            <RefreshCw
              className={`w-4 h-4 mr-1 ${isPrinting ? "animate-spin" : ""}`}
            />
            In lại
          </Button>
          <Button
            className="col-span-1 bg-blue-600 hover:bg-blue-700"
            onClick={handlePrint}
            disabled={isPrinting}
          >
            <Printer className="w-4 h-4 mr-1" />
            In
          </Button>
        </DialogFooter>

        {/* Hidden print area */}
        <div className="hidden">
          <div id="print-area">
            <ReceiptPrintContent
              items={items}
              totalAmount={totalAmount}
              orderNumber={orderNumber}
              customerName={customerName}
              paymentMethod={paymentMethod}
              receiptDate={new Date()}
              tableNumber={tableNumber}
              waiterName={waiterName}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
