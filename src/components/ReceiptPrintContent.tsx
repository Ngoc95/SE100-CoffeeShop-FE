import { useEffect } from "react";

interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  unit?: string;
}

interface ReceiptPrintContentProps {
  items: ReceiptItem[];
  totalAmount: number;
  orderNumber: string;
  customerName: string;
  paymentMethod: string;
  receiptDate: Date;
  waiterName?: string;
  tableNumber?: string;
  storeName?: string;
  branchName?: string;
}

/**
 * Component để render nội dung hóa đơn cho in.
 * Sử dụng CSS @media print để kiểm soát định dạng in.
 * Hỗ trợ in nhiệt 80mm và A4.
 */
export function ReceiptPrintContent({
  items,
  totalAmount,
  orderNumber,
  customerName,
  paymentMethod,
  receiptDate,
  waiterName,
  tableNumber,
  storeName = "COFFEE SHOP XYZ",
  branchName = "Chỉ nhận trung tâm",
}: ReceiptPrintContentProps) {
  const formattedTime = receiptDate.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });

  const formattedDate = receiptDate.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @media print {
        * {
          margin: 0;
          padding: 0;
        }
        body {
          margin: 0;
          padding: 0;
          background: white;
        }
        body > * {
          display: none;
        }
        #receipt-print-container {
          display: block !important;
        }
        #receipt-print-container {
          width: 80mm;
          max-width: 80mm;
          margin: 0;
          padding: 0;
          font-family: monospace;
          font-size: 10pt;
          line-height: 1.3;
          background: white;
          color: black;
        }
        @page {
          size: 80mm auto;
          margin: 0;
        }
      }

      #receipt-print-container {
        font-family: "Courier New", monospace;
        font-size: 11px;
        line-height: 1.4;
        max-width: 320px;
        margin: 0 auto;
        padding: 0;
        background: white;
        color: #000;
      }

      .receipt-top-info {
        text-align: center;
        font-size: 9px;
        margin-bottom: 4px;
        border-bottom: 1px dotted #000;
        padding-bottom: 4px;
      }

      .receipt-store-header {
        text-align: left;
        font-size: 10px;
        margin-bottom: 6px;
      }

      .receipt-store-header strong {
        display: block;
        font-weight: bold;
      }

      .receipt-store-branch {
        display: block;
        font-size: 9px;
        color: blue;
        margin-bottom: 2px;
      }

      .receipt-invoice-title {
        text-align: center;
        font-weight: bold;
        font-size: 11px;
        margin: 6px 0;
      }

      .receipt-invoice-number {
        text-align: center;
        font-size: 10px;
        margin-bottom: 6px;
        border-bottom: 1px dotted #000;
        padding-bottom: 4px;
      }

      .receipt-customer-info {
        font-size: 9px;
        margin-bottom: 4px;
      }

      .receipt-customer-info div {
        margin-bottom: 2px;
      }

      .receipt-customer-label {
        font-weight: bold;
      }

      .receipt-customer-value {
        color: blue;
      }

      .receipt-items-section {
        margin: 6px 0;
        border-bottom: 1px dotted #000;
        padding-bottom: 4px;
      }

      .receipt-item {
        font-size: 9px;
        margin-bottom: 3px;
      }

      .receipt-item-name {
        display: flex;
        justify-content: space-between;
        margin-bottom: 1px;
      }

      .receipt-item-price-qty {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
      }

      .receipt-item-qty-section {
        text-align: center;
        flex: 0 0 auto;
        width: 50px;
      }

      .receipt-item-price-section {
        text-align: right;
        flex: 1;
      }

      .receipt-totals-section {
        font-size: 10px;
        margin: 6px 0;
        padding: 4px 0;
      }

      .receipt-total-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 2px;
      }

      .receipt-total-final {
        display: flex;
        justify-content: space-between;
        font-weight: bold;
        border-top: 1px dashed #000;
        padding-top: 2px;
        margin-top: 2px;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div id="receipt-print-container">
      {/* Time & Branch Info */}
      <div className="receipt-top-info">
        {formattedTime} - {branchName} - Thu ngân
      </div>

      {/* Store Header */}
      <div className="receipt-store-header">
        <strong>Tên cửa hàng</strong>
        <div className="receipt-store-branch">Chỉ nhận: {branchName}</div>
        <div style={{ fontSize: "9px" }}>Điện thoại: 1900 6522</div>
      </div>

      {/* Invoice Title & Number */}
      <div className="receipt-invoice-title">HÓA ĐƠN BÁN HÀNG</div>
      <div className="receipt-invoice-number">{orderNumber}</div>

      {/* Customer Info */}
      <div className="receipt-customer-info">
        <div>
          <span className="receipt-customer-label">Khách hàng:</span>
          <span className="receipt-customer-value"> {customerName}</span>
        </div>
        <div>
          <span className="receipt-customer-label">Địa chỉ:</span>
        </div>
        <div>
          <span className="receipt-customer-label">Thời gian giao hàng:</span>
        </div>
        <div>
          <span className="receipt-customer-label">Điện thoại:</span>
        </div>
      </div>

      {/* Waiter Info */}
      {waiterName && (
        <div style={{ fontSize: "9px", marginBottom: "4px" }}>
          <span className="receipt-customer-label">Người bán:</span>
          <span> {waiterName}</span>
        </div>
      )}

      {/* Items Section */}
      <div className="receipt-items-section">
        {items.map((item) => (
          <div key={item.id} className="receipt-item">
            <div className="receipt-item-name">
              <span>{item.name}</span>
              <span>-</span>
              <span>{item.price.toLocaleString()}₫</span>
            </div>
            <div className="receipt-item-price-qty">
              <span>SL</span>
              <div className="receipt-item-qty-section">
                <strong>{item.quantity}</strong>
              </div>
              <div className="receipt-item-price-section">
                <strong>
                  {(item.price * item.quantity).toLocaleString()}₫
                </strong>
              </div>
            </div>
            {item.notes && (
              <div style={{ fontSize: "8px", color: "#555", marginTop: "1px" }}>
                - {item.notes}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Totals Section */}
      <div className="receipt-totals-section">
        <div className="receipt-total-row">
          <span>Tổng tiền hàng:</span>
          <span style={{ textAlign: "right" }}>
            {totalAmount.toLocaleString()}₫
          </span>
        </div>
        <div className="receipt-total-row">
          <span>Chiết khấu</span>
          <span style={{ textAlign: "right" }}>0₫</span>
        </div>
        <div className="receipt-total-final">
          <span>Tổng cộng</span>
          <span>{totalAmount.toLocaleString()}₫</span>
        </div>
      </div>
    </div>
  );
}
