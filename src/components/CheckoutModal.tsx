import { useState, useEffect } from "react";
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
import { Banknote, Smartphone, X, Gift, Percent, Tag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getAvailablePromotions } from "../api/promotions";

// Promotion types
interface GiftItem {
  id: number;
  name: string;
  price: number;
}

interface AvailablePromotion {
  id: number;
  code: string;
  name: string;
  description?: string;
  typeId: number; // 1=%, 2=fixed, 3=fixed_price, 4=gift
  typeName: string;
  discountValue?: number;
  canApply: boolean;
  reason?: string;
  discountPreview?: number;
  applicableSubtotal?: number;
  giftCount?: number;
  giftItems?: GiftItem[];
}

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
  orderId?: number; // For fetching promotions
  customerId?: number | null; // For fetching promotions
  bankAccounts: BankAccount[];
  onAddBankAccount: (bank: string, owner: string, account: string) => void;
  onConfirmPayment: (
    paymentMethod: "cash" | "transfer" | "combined",
    paymentDetails: any,
    promotionId?: number,
    selectedGifts?: Array<{itemId: number, quantity: number}>
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
  orderId,
  customerId,
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

  // Promotion state
  const [availablePromotions, setAvailablePromotions] = useState<AvailablePromotion[]>([]);
  const [selectedPromotion, setSelectedPromotion] = useState<AvailablePromotion | null>(null);
  const [selectedGifts, setSelectedGifts] = useState<Array<{itemId: number, quantity: number}>>([]);
  const [loadingPromotions, setLoadingPromotions] = useState(false);

  // Fetch available promotions when modal opens
  useEffect(() => {
    if (open && orderId) {
      setLoadingPromotions(true);
      getAvailablePromotions({ orderId, customerId: customerId || undefined })
        .then((res: any) => {
          const raw = res?.data?.metaData ?? res?.data ?? res;
          const allPromos = Array.isArray(raw) ? raw : (raw?.promotions ?? []);
          // Filter only valid promotions
          const validPromos = Array.isArray(allPromos) 
            ? allPromos.filter((p: any) => p.canApply) 
            : [];
          setAvailablePromotions(validPromos);
        })
        .catch((err) => {
          console.error('Failed to fetch promotions:', err);
          setAvailablePromotions([]);
        })
        .finally(() => setLoadingPromotions(false));
    } else {
      setAvailablePromotions([]);
      setSelectedPromotion(null);
      setSelectedGifts([]);
    }
  }, [open, orderId, customerId]);

  // Calculate discount from solution selection
  const promotionDiscount = selectedPromotion?.discountPreview ?? 0;
  const finalAmount = totalAmount - discountAmount - promotionDiscount;

  // Auto-fill defaults
  useEffect(() => {
    if (open) {
      setReceivedCash(finalAmount);
      setCombinedCashAmount(finalAmount);
      setCombinedTransferAmount(0);
    }
  }, [open, finalAmount]);

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

  // Auto-generate QR Code
  useEffect(() => {
    const generateQR = async () => {
        let amount = 0;
        let bankId = 0;

        if (paymentMethod === 'transfer') {
            amount = finalAmount;
            bankId = selectedTransferBankId;
        } else if (paymentMethod === 'combined') {
            amount = combinedTransferAmount;
            bankId = combinedTransferBankId;
        } else {
            setQrImage(null);
            return;
        }

        if (amount <= 0 || !bankId) {
             setQrImage(null);
             return;
        }

        // Find bank details (using index as ID for now as implementation uses index)
        const bank = bankAccounts[bankId];
        if (!bank) return;
        
        // VietQR Format: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<INFO>&accountName=<NAME>
        // Assuming bank.bank is a valid bin or short name (e.g. MB, TCB, VCB)
        // Encode URI components
        
        // Clean bank name if needed (VietQR expects short name like MB, TCB, VCB, ACB, VPBank, TPBank, etc.)
        // We will trust the input 'bank' for now.
        const bankCode = bank.bank; 
        const accountNo = bank.account;
        const template = 'compact'; 
        
        let url = `https://img.vietqr.io/image/${bankCode}-${accountNo}-${template}.png`;
        const params = new URLSearchParams();
        params.append('amount', amount.toString());
        params.append('addInfo', `${orderCode || 'Thanh toan'} ${tableNumber ? 'Ban ' + tableNumber : ''}`);
        params.append('accountName', bank.owner);
        
        setQrImage(`${url}?${params.toString()}`);
    };

    generateQR();
  }, [paymentMethod, finalAmount, combinedTransferAmount, selectedTransferBankId, combinedTransferBankId, bankAccounts, orderCode, tableNumber]);

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

    const paymentDetails: any = {
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
      paymentDetails.bankAccountId = combinedTransferBankId;
    }

    // Pass promotion data
    const promoId = selectedPromotion?.id;
    const gifts = selectedPromotion?.typeId === 4 ? selectedGifts : undefined;
    
    onConfirmPayment(paymentMethod, paymentDetails, promoId, gifts);
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
        <DialogHeader className="p-4 border-b bg-blue-50 flex-none">
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
            <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
                <X className="w-5 h-5" />
            </Button>
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
              
              {/* Promotion Selection */}
              <div className="py-2">
                <Label className="text-sm font-medium mb-1 block">Khuyến mãi / Voucher</Label>
                <select 
                  className="w-full p-2 border rounded-md text-sm bg-white"
                  value={selectedPromotion?.id || ""}
                  onChange={(e) => {
                    const promoId = parseInt(e.target.value);
                    const promo = availablePromotions.find(p => p.id === promoId) || null;
                    setSelectedPromotion(promo);
                    setSelectedGifts([]);
                  }}
                  disabled={loadingPromotions}
                >
                  <option value="">-- Chọn khuyến mãi --</option>
                  {availablePromotions.map((promo) => (
                     <option key={promo.id} value={promo.id}>
                       {promo.code} - {promo.name} {promo.discountPreview ? `(-${promo.discountPreview.toLocaleString()}₫)` : ''}
                     </option>
                  ))}
                </select>
                {selectedPromotion && (
                    <div className="text-xs text-green-600 mt-1">
                        {selectedPromotion.description}
                    </div>
                )}
              </div>

              {/* Gift Selection UI */}
              {selectedPromotion?.typeId === 4 && selectedPromotion.giftItems && (
                <div className="mb-2 bg-pink-50 border border-pink-200 rounded-md p-2">
                  <div className="text-xs font-semibold text-pink-700 mb-2 flex justify-between items-center">
                    <span>Chọn quà tặng ({selectedGifts.reduce((a, b) => a + b.quantity, 0)}/{selectedPromotion.giftCount})</span>
                    <Gift className="w-3 h-3" />
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedPromotion.giftItems.map((gift: any) => {
                      const selected = selectedGifts.find((g) => g.itemId === gift.id);
                      const qty = selected ? selected.quantity : 0;
                      return (
                        <div
                          key={gift.id}
                          className="flex justify-between items-center bg-white p-2 rounded border border-pink-100"
                        >
                          <div className="text-xs">
                            <div className="font-medium">{gift.name}</div>
                            <div className="text-slate-400 line-through">
                              {gift.price.toLocaleString()}₫
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => {
                                const current =
                                  selectedGifts.find((g) => g.itemId === gift.id)
                                    ?.quantity || 0;
                                if (current > 0) {
                                  const newGifts = selectedGifts
                                    .map((g) =>
                                      g.itemId === gift.id
                                        ? { ...g, quantity: g.quantity - 1 }
                                        : g
                                    )
                                    .filter((g) => g.quantity > 0);
                                  setSelectedGifts(newGifts);
                                }
                              }}
                            >
                              -
                            </Button>
                            <span className="text-xs w-4 text-center">
                              {qty}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => {
                                const total = selectedGifts.reduce(
                                  (a, b) => a + b.quantity,
                                  0
                                );
                                if (
                                  total < (selectedPromotion.giftCount || 0)
                                ) {
                                  const existing = selectedGifts.find(
                                    (g) => g.itemId === gift.id
                                  );
                                  if (existing) {
                                    setSelectedGifts(
                                      selectedGifts.map((g) =>
                                        g.itemId === gift.id
                                          ? { ...g, quantity: g.quantity + 1 }
                                          : g
                                      )
                                    );
                                  } else {
                                    setSelectedGifts([
                                      ...selectedGifts,
                                      { itemId: gift.id, quantity: 1 },
                                    ]);
                                  }
                                } else {
                                  toast.error(
                                    `Tối đa ${selectedPromotion.giftCount} quà`
                                  );
                                }
                              }}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}


              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Giảm giá cũ</span>
                  <span className="font-semibold">
                    -{discountAmount.toLocaleString()}₫
                  </span>
                </div>
              )}
              {promotionDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>KM: {selectedPromotion?.code}</span>
                  <span className="font-semibold">
                    -{promotionDiscount.toLocaleString()}₫
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
                  // Auto-fill if empty
                  if (receivedCash === 0) setReceivedCash(finalAmount);
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
                onClick={() => {
                    setPaymentMethod("combined");
                    // Auto-fill defaults if empty
                    if (combinedCashAmount === 0 && combinedTransferAmount === 0) {
                        setCombinedCashAmount(finalAmount);
                        setCombinedTransferAmount(0);
                    }
                }}
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
                    type="text"
                    placeholder="Nhập số tiền"
                    value={receivedCash ? receivedCash.toLocaleString('vi-VN') : ""}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setReceivedCash(Number(val));
                    }}
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
                    type="text"
                    placeholder="0"
                    value={combinedCashAmount ? combinedCashAmount.toLocaleString('vi-VN') : ""}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setCombinedCashAmount(Number(val));
                    }}
                    className="mt-1 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs">Chuyển khoản</Label>
                  <Input
                    type="text"
                    placeholder="0"
                    value={combinedTransferAmount ? combinedTransferAmount.toLocaleString('vi-VN') : ""}
                    onChange={(e) => {
                       const val = e.target.value.replace(/\D/g, '');
                       setCombinedTransferAmount(Number(val));
                    }}
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
