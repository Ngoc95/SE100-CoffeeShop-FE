import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Banknote, Smartphone, X } from "lucide-react";
import { toast } from "sonner";

interface CheckoutItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  basePrice: number;
}

interface BankAccount {
  bank: string;
  owner: string;
  account: string;
}

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  items: CheckoutItem[];
  totalAmount: number;
  discountAmount: number;
  tableNumber?: number;
  tableArea?: string;
  isTakeaway?: boolean;
  orderCode?: string;
  bankAccounts: BankAccount[];
  onAddBankAccount: (bank: string, owner: string, account: string) => void;
  onConfirmPayment: (
    paymentMethod: "cash" | "transfer" | "combined",
    paymentDetails: any
  ) => void;
}

export function CheckoutModal({
  open,
  onClose,
  items,
  totalAmount,
  discountAmount,
  tableNumber,
  tableArea,
  isTakeaway,
  orderCode,
  bankAccounts,
  onAddBankAccount,
  onConfirmPayment,
}: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "transfer" | "combined" | null
  >(null);

  // Cash payment
  const [receivedCash, setReceivedCash] = useState<number>(0);

  // Transfer payment
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [selectedTransferBankId, setSelectedTransferBankId] =
    useState<number>(0);

  // Combined payment
  const [combinedCashAmount, setCombinedCashAmount] = useState<number>(0);
  const [combinedTransferAmount, setCombinedTransferAmount] =
    useState<number>(0);
  const [combinedTransferBankId, setCombinedTransferBankId] =
    useState<number>(0);

  // New account dialog
  const [newAccountOpen, setNewAccountOpen] = useState(false);
  const [newBankName, setNewBankName] = useState("");
  const [newOwnerName, setNewOwnerName] = useState("");
  const [newAccountNumber, setNewAccountNumber] = useState("");

  const finalAmount = totalAmount - discountAmount;

  const calculateCustomerPaid = (): number => {
    if (paymentMethod === "cash") return receivedCash;
    if (paymentMethod === "combined")
      return combinedCashAmount + combinedTransferAmount;
    return 0;
  };

  const calculateChange = (): number => {
    const paid = calculateCustomerPaid();
    return Math.max(0, paid - finalAmount);
  };

  const canConfirm = (): boolean => {
    if (!paymentMethod) return false;
    if (paymentMethod === "cash" && receivedCash < finalAmount) return false;
    if (
      paymentMethod === "combined" &&
      combinedCashAmount + combinedTransferAmount <
        finalAmount
    )
      return false;
    return true;
  };

  const handleConfirm = () => {
    if (!canConfirm()) return;

    const paymentDetails = {
      method: paymentMethod,
      amount: finalAmount,
      customerPaid: calculateCustomerPaid(),
      change: calculateChange(),
    };

    if (paymentMethod === "cash") {
      paymentDetails.receivedCash = receivedCash;
    } else if (paymentMethod === "transfer") {
      paymentDetails.qrImage = qrImage;
      paymentDetails.bankAccountId = selectedTransferBankId;
    } else if (paymentMethod === "combined") {
      paymentDetails.cashAmount = combinedCashAmount;
      paymentDetails.transferAmount = combinedTransferAmount;
      paymentDetails.transferBankId = combinedTransferBankId;
    }

    onConfirmPayment(paymentMethod, paymentDetails);
    toast.success("Thanh toán thành công!");
    onClose();
  };

  const formatDate = (date: Date = new Date()) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="w-screen h-screen !max-w-none overflow-hidden flex flex-col p-0"
        style={{ width: "80vw", height: "95vh", maxWidth: "none" }}
        aria-describedby={undefined}
      >
        {/* Header */}
        <DialogHeader className="p-4 border-b bg-blue-50">
          <div className="flex items-center justify-between w-full">
            <div>
              <DialogTitle>
                {isTakeaway
                  ? "Mang đi"
                  : `Bàn ${tableNumber}${
                      tableArea ? ` - ${tableArea}` : ""
                    }`}{" "}
              </DialogTitle>
              <p className="text-xs text-slate-500 mt-1">{formatDate()}</p>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex gap-0">
          {/* Left Column - Order Items */}
          <div className="flex-1 border-r overflow-y-auto p-4 space-y-2">
            <h3 className="text-sm font-semibold mb-3">Chi tiết giao dịch</h3>
            <div className="space-y-2 text-sm">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-start gap-2 pb-2 border-b"
                >
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-slate-500">
                      SL: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {item.price.toLocaleString()}₫
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-4 pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tổng tiền hàng</span>
                <span className="font-semibold">
                  {totalAmount.toLocaleString()}₫
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Giảm giá</span>
                  <span className="font-semibold">
                    -{discountAmount.toLocaleString()}₫
                  </span>
                </div>
              )}
              <div className="bg-slate-100 p-3 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Khách thanh toán</span>
                  <span className="font-semibold text-blue-900">
                    {calculateCustomerPaid().toLocaleString()}₫
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tiền thừa trả khách</span>
                  <span className="font-semibold text-green-600">
                    {calculateChange().toLocaleString()}₫
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Payment Methods */}
          <div className="w-96 border-l overflow-y-auto p-4">
            <h3 className="text-sm font-semibold mb-3">
              Phương thức thanh toán
            </h3>

            {/* Payment Method Selection */}
            <div className="space-y-2 mb-4">
              <Button
                variant={paymentMethod === "cash" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => {
                  setPaymentMethod("cash");
                  setReceivedCash(0);
                }}
              >
                <Banknote className="w-4 h-4 mr-2" />
                Tiền mặt
              </Button>
              <Button
                variant={paymentMethod === "transfer" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setPaymentMethod("transfer")}
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Chuyển khoản
              </Button>
              <Button
                variant={paymentMethod === "combined" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setPaymentMethod("combined")}
              >
                <div className="w-4 h-4 mr-2 flex items-center justify-center text-sm">
                  +
                </div>
                Kết hợp
              </Button>
            </div>

            {/* Cash Payment */}
            {paymentMethod === "cash" && (
              <div className="space-y-3 bg-amber-50 p-3 rounded-lg border border-amber-200 mb-4">
                <div>
                  <Label className="text-sm">Khách thanh toán</Label>
                  <Input
                    type="number"
                    placeholder="Nhập số tiền"
                    value={receivedCash || ""}
                    onChange={(e) =>
                      setReceivedCash(Number(e.target.value) || 0)
                    }
                    className="mt-1 text-lg font-semibold"
                  />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Cần thanh toán:</span>
                    <span className="font-medium">
                      {finalAmount.toLocaleString()}₫
                    </span>
                  </div>
                  <div
                    className={`flex justify-between font-medium ${
                      receivedCash >= finalAmount
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    <span>Tiền thừa:</span>
                    <span>{calculateChange().toLocaleString()}₫</span>
                  </div>
                  {receivedCash < finalAmount && (
                    <p className="text-red-600 text-xs">
                      ⚠️ Còn thiếu:{" "}
                      {(finalAmount - receivedCash).toLocaleString()}₫
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Card Payment removed */}

            {/* Transfer Payment */}
            {paymentMethod === "transfer" && (
              <div className="space-y-3 bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
                <div>
                  <Label className="text-sm">Mã QR</Label>
                  <div className="mt-1 border-2 border-dashed border-blue-300 rounded-lg p-3 text-center min-h-[100px] flex items-center justify-center">
                    {qrImage ? (
                      <div className="text-center">
                        <img
                          src={qrImage}
                          alt="QR"
                          className="w-20 h-20 mx-auto mb-2 rounded"
                        />
                        <button
                          onClick={() =>
                            document.getElementById("qr-input")?.click()
                          }
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Thay đổi
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="qr-input"
                        className="text-center cursor-pointer"
                      >
                        <p className="text-2xl mb-1">📸</p>
                        <p className="text-xs text-slate-600">
                          Click để tải lên
                        </p>
                      </label>
                    )}
                    <input
                      id="qr-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setQrImage(event.target?.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm">Tài khoản nhận tiền</Label>
                  <select
                    value={selectedTransferBankId}
                    onChange={(e) =>
                      setSelectedTransferBankId(parseInt(e.target.value))
                    }
                    className="w-full p-2 border border-blue-300 rounded-lg bg-white text-sm mt-1"
                  >
                    {bankAccounts.map((acc, idx) => (
                      <option key={idx} value={idx}>
                        {acc.bank} - {acc.owner}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Combined Payment */}
            {paymentMethod === "combined" && (
              <div className="space-y-3 bg-green-50 p-3 rounded-lg border border-green-300 mb-4">
                <div className="text-xs font-medium text-slate-700 mb-2">
                  Nhập số tiền cho từng phương thức
                </div>

                <div>
                  <Label className="text-xs">Tiền mặt</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={combinedCashAmount || ""}
                    onChange={(e) =>
                      setCombinedCashAmount(Number(e.target.value) || 0)
                    }
                    className="mt-1 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs">Chuyển khoản</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={combinedTransferAmount || ""}
                    onChange={(e) =>
                      setCombinedTransferAmount(Number(e.target.value) || 0)
                    }
                    className="mt-1 text-sm mb-2"
                  />
                  <select
                    value={combinedTransferBankId}
                    onChange={(e) =>
                      setCombinedTransferBankId(parseInt(e.target.value))
                    }
                    className="w-full p-2 border border-green-300 rounded-lg bg-white text-sm"
                  >
                    {bankAccounts.map((acc, idx) => (
                      <option key={idx} value={idx}>
                        {acc.bank} - {acc.owner}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-white p-2 rounded border border-green-300 text-sm space-y-1 mt-2">
                  <div className="flex justify-between">
                    <span>Tổng:</span>
                    <span
                      className={`font-semibold ${
                        combinedCashAmount + combinedTransferAmount >=
                        finalAmount
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {(
                        combinedCashAmount + combinedTransferAmount
                      ).toLocaleString()}
                      ₫
                    </span>
                  </div>
                  {combinedCashAmount + combinedTransferAmount <
                    finalAmount && (
                    <p className="text-red-600 text-xs">
                      Còn thiếu:{" "}
                      {(
                        finalAmount -
                        (combinedCashAmount + combinedTransferAmount)
                      ).toLocaleString()}
                      ₫
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Payment Summary */}
            {/* {paymentMethod && (
              <div className="bg-slate-100 p-3 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Khách thanh toán</span>
                  <span className="font-semibold text-blue-900">
                    {calculateCustomerPaid().toLocaleString()}₫
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tiền thừa trả khách</span>
                  <span className="font-semibold text-green-600">
                    {calculateChange().toLocaleString()}₫
                  </span>
                </div>
              </div>
            )} */}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 border-t bg-slate-50">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 min-w-[150px]"
            disabled={!canConfirm()}
            onClick={handleConfirm}
          >
            Thanh toán
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
