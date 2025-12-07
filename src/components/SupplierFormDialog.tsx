import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';

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
  status: 'active' | 'inactive';
}

interface SupplierFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: Omit<Supplier, 'id' | 'code'>) => void;
  editingSupplier: Supplier | null;
}

export function SupplierFormDialog({ 
  open, 
  onClose, 
  onSubmit, 
  editingSupplier 
}: SupplierFormDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    contact: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    if (editingSupplier) {
      setFormData({
        name: editingSupplier.name,
        category: editingSupplier.category,
        contact: editingSupplier.contact,
        phone: editingSupplier.phone,
        email: editingSupplier.email,
        address: editingSupplier.address,
        city: editingSupplier.city,
        status: editingSupplier.status,
      });
    } else {
      setFormData({
        name: '',
        category: '',
        contact: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        status: 'active',
      });
    }
  }, [editingSupplier, open]);

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[700px] max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {editingSupplier ? 'Chỉnh sửa nhà cung cấp' : 'Thêm nhà cung cấp mới'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Row 1: Tên NCC & Danh mục */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>
                Tên nhà cung cấp <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Trung Nguyên"
                className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
              />
            </div>

            <div>
              <Label>Danh mục</Label>
              <Input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="VD: Cà phê, Trà, Sữa..."
                className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
              />
            </div>
          </div>

          {/* Row 2: Người liên hệ & Số điện thoại */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Người liên hệ</Label>
              <Input
                type="text"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                placeholder="Nhập tên người liên hệ"
                className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
              />
            </div>

            <div>
              <Label>
                Số điện thoại <span className="text-red-500">*</span>
              </Label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0901234567"
                className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
              />
            </div>
          </div>

          {/* Row 3: Email & Thành phố */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
              />
            </div>

            <div>
              <Label>Tỉnh / Thành phố</Label>
              <Select
                value={formData.city}
                onValueChange={(value) => setFormData({ ...formData, city: value })}
              >
                <SelectTrigger className="mt-1.5 bg-white border-slate-300 shadow-none">
                  <SelectValue placeholder="Chọn thành phố" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hồ Chí Minh">Hồ Chí Minh</SelectItem>
                  <SelectItem value="Hà Nội">Hà Nội</SelectItem>
                  <SelectItem value="Đà Nẵng">Đà Nẵng</SelectItem>
                  <SelectItem value="Cần Thơ">Cần Thơ</SelectItem>
                  <SelectItem value="Hải Phòng">Hải Phòng</SelectItem>
                  <SelectItem value="Nha Trang">Nha Trang</SelectItem>
                  <SelectItem value="Huế">Huế</SelectItem>
                  <SelectItem value="Vũng Tàu">Vũng Tàu</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 4: Địa chỉ */}
          <div>
            <Label>Địa chỉ</Label>
            <Textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Số nhà, tên đường, phường/xã..."
              rows={2}
              className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2 resize-none"
            />
          </div>

          {/* Row 5: Trạng thái */}
          <div>
            <Label>Trạng thái</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' })}
            >
              <SelectTrigger className="mt-1.5 bg-white border-slate-300 shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="inactive">Không hoạt động</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.name || !formData.phone}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {editingSupplier ? 'Cập nhật' : 'Thêm nhà cung cấp'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}