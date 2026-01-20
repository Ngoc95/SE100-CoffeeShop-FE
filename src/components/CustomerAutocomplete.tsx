import { useState, useRef, useEffect, useCallback } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "sonner";
import { getCustomers, createCustomer } from "../api/customer";

interface Customer {
  id: number
  code: string
  name: string
  phone?: string
  gender?: string
  city?: string
  groupName?: string
  totalOrders?: number
  totalSpent?: number
  isActive?: boolean
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
  customers: initialCustomers,
  value,
  onChange,
  onAddNew,
  placeholder = "Nhập mã khách hàng...",
  className = "",
}: CustomerAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(value);
  const [addCustomerDialogOpen, setAddCustomerDialogOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Simplified form state (only name, phone, gender as per API)
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<string>("male");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use initial customers for dropdown when no search
  const displayCustomers = searchValue && searchValue.trim() ? searchResults : initialCustomers;

  // Debounced API search
  const searchCustomersAPI = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await getCustomers({ search: query });
      // API returns { metaData: { customers: [...] } }
      const data = response?.data?.metaData?.customers ?? response?.data?.metaData ?? response?.data ?? [];
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error searching customers:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Sync internal state with prop value
  useEffect(() => {
    setSearchValue(value);
  }, [value]);

  // Handle search input change with debounce
  const handleSearchChange = (newValue: string) => {
    setSearchValue(newValue);
    setIsOpen(true);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer (300ms)
    debounceTimerRef.current = setTimeout(() => {
      searchCustomersAPI(newValue);
    }, 300);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

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
    setSearchResults([]);
    onChange("");
  };

  const handleAddCustomer = async () => {
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên khách hàng");
      return;
    }
    if (!phone.trim()) {
      toast.error("Vui lòng nhập số điện thoại");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createCustomer({
        name: name.trim(),
        phone: phone.trim(),
        gender: gender,
      });

      const newCustomer = response?.data?.metaData ?? response?.data;
      
      if (newCustomer && onAddNew) {
        onAddNew(newCustomer);
      }

      // Reset form and close dialog
      setName("");
      setPhone("");
      setGender("male");
      setAddCustomerDialogOpen(false);

      toast.success("Đã thêm khách hàng thành công");
    } catch (error: any) {
      toast.error("Thêm khách hàng thất bại", {
        description: error?.response?.data?.message || error?.message,
      });
    } finally {
      setIsSubmitting(false);
    }
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
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="h-10 text-sm pl-9 pr-4 bg-white border-slate-200 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md"
          />
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
          {isSearching ? (
            <div className="px-3 py-3 text-sm text-slate-500 text-center">
              Đang tìm kiếm...
            </div>
          ) : displayCustomers.length > 0 ? (
            <div className="py-1">
              {displayCustomers.map((customer) => (
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

      {/* Add Customer Dialog - Simplified */}
      <Dialog
        open={addCustomerDialogOpen}
        onOpenChange={setAddCustomerDialogOpen}
      >
        <DialogContent
          className="max-w-md"
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogTitle>Thêm khách hàng</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Customer Name */}
            <div>
              <Label htmlFor="name" className="text-sm font-medium mb-2 block">
                Tên khách hàng <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Họ và tên"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white border border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2"
              />
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone" className="text-sm font-medium mb-2 block">
                Điện thoại <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                placeholder="Ví dụ: 0912345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-white border border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2"
              />
            </div>

            {/* Gender */}
            <div>
              <Label htmlFor="gender" className="text-sm font-medium mb-2 block">
                Giới tính
              </Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="bg-white border border-slate-300">
                  <SelectValue placeholder="Chọn giới tính" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Nam</SelectItem>
                  <SelectItem value="female">Nữ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setAddCustomerDialogOpen(false)}
              disabled={isSubmitting}
            >
              Bỏ qua
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleAddCustomer}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
