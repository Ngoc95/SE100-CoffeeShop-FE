import { useState, useRef, useEffect } from "react";
import { Search, X, Plus } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";

interface Customer {
  id: string;
  name: string;
  code: string;
  phone?: string;
}

interface CustomerAutocompleteProps {
  customers: Customer[];
  value: string;
  onChange: (value: string, customer?: Customer) => void;
  onAddNew?: (customer: Customer) => void;
  placeholder?: string;
  className?: string;
}

export function CustomerAutocomplete({
  customers,
  value,
  onChange,
  onAddNew,
  placeholder = "Nhập mã khách hàng...",
  className = "",
}: CustomerAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(value);
  const [addCustomerDialogOpen, setAddCustomerDialogOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Form state
  const [customerType, setCustomerType] = useState("personal");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [notes, setNotes] = useState("");

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.code.toUpperCase().includes(searchValue.toUpperCase()) ||
      customer.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (customer: Customer) => {
    setSearchValue(customer.code);
    onChange(customer.code, customer);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearchValue("");
    onChange("");
  };

  const handleAddCustomer = () => {
    if (!code.trim() || !name.trim()) {
      toast.error("Vui lòng nhập mã và tên khách hàng");
      return;
    }

    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      code: code.toUpperCase(),
      name: name,
      phone: phone || undefined,
    };

    if (onAddNew) {
      onAddNew(newCustomer);
    }

    // Reset form and close dialog
    setCode("");
    setName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setCity("");
    setDistrict("");
    setWard("");
    setNotes("");
    setAddCustomerDialogOpen(false);

    toast.success("Đã thêm khách hàng thành công");
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex gap-1">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value.toUpperCase());
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className="h-9 text-xs pl-8 pr-8 bg-white border border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
          />
          {searchValue && (
            <button
              onClick={handleClear}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {onAddNew && (
          <Button
            onClick={() => setAddCustomerDialogOpen(true)}
            size="sm"
            className="h-9 w-9 p-0 bg-blue-600 hover:bg-blue-700"
            title="Thêm khách hàng mới"
          >
            <Plus className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {filteredCustomers.length > 0 ? (
            <div className="py-1">
              {filteredCustomers.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => handleSelect(customer)}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors text-sm border-b border-slate-100 last:border-b-0"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">
                        {customer.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {customer.code}
                      </div>
                    </div>
                    {customer.phone && (
                      <div className="text-xs text-slate-500">
                        {customer.phone}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : searchValue ? (
            <div className="px-3 py-3 text-sm text-slate-500 text-center">
              Không tìm thấy khách hàng
            </div>
          ) : (
            <div className="px-3 py-3 text-sm text-slate-500 text-center">
              Nhập mã hoặc tên khách hàng
            </div>
          )}
        </div>
      )}

      {/* Add Customer Dialog */}
      <Dialog
        open={addCustomerDialogOpen}
        onOpenChange={setAddCustomerDialogOpen}
      >
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogTitle>Thêm khách hàng</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Customer Type */}
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Loại khách
              </Label>
              <RadioGroup value={customerType} onValueChange={setCustomerType}>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="personal" id="personal" />
                    <Label
                      htmlFor="personal"
                      className="font-normal cursor-pointer"
                    >
                      Cá nhân
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="company" id="company" />
                    <Label
                      htmlFor="company"
                      className="font-normal cursor-pointer"
                    >
                      Công ty
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Customer Code */}
            <div>
              <Label htmlFor="code" className="text-sm font-medium mb-2 block">
                Mã khách hàng
              </Label>
              <Input
                id="code"
                placeholder="Mã máy định"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="bg-white border border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2"
              />
            </div>

            {/* Customer Name */}
            <div>
              <Label htmlFor="name" className="text-sm font-medium mb-2 block">
                {customerType === "personal" ? "Tên khách hàng" : "Tên công ty"}
              </Label>
              <Input
                id="name"
                placeholder={
                  customerType === "personal" ? "Họ và tên" : "Tên công ty"
                }
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white border border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2"
              />
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone" className="text-sm font-medium mb-2 block">
                Điện thoại
              </Label>
              <Input
                id="phone"
                placeholder="Vị dụ: 0912345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-white border border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2"
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-sm font-medium mb-2 block">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white border border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2"
              />
            </div>

            {/* Address */}
            <div>
              <Label
                htmlFor="address"
                className="text-sm font-medium mb-2 block"
              >
                Địa chỉ
              </Label>
              <Input
                id="address"
                placeholder="Địa chỉ"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="bg-white border border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2"
              />
            </div>

            {/* City - District - Ward */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label
                  htmlFor="city"
                  className="text-sm font-medium mb-2 block"
                >
                  Tính / Thành phố
                </Label>
                <Input
                  id="city"
                  placeholder="Tính / Thành phố"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="bg-white border border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2"
                />
              </div>
              <div>
                <Label
                  htmlFor="district"
                  className="text-sm font-medium mb-2 block"
                >
                  Quận / Huyện
                </Label>
                <Input
                  id="district"
                  placeholder="Quận / Huyện"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="bg-white border border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2"
                />
              </div>
              <div>
                <Label
                  htmlFor="ward"
                  className="text-sm font-medium mb-2 block"
                >
                  Phường / Xã
                </Label>
                <Input
                  id="ward"
                  placeholder="Phường / Xã"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="bg-white border border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes" className="text-sm font-medium mb-2 block">
                Ghi chú
              </Label>
              <Textarea
                id="notes"
                placeholder="Ghi chú"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-white border border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 text-sm"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setAddCustomerDialogOpen(false)}
            >
              Bỏ qua
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleAddCustomer}
            >
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
