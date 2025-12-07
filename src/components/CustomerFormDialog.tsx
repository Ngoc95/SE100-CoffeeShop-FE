import { useState, useEffect } from 'react';
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
import { Button } from './ui/button';

interface Customer {
  id: string;
  code: string;
  name: string;
  gender: string;
  birthday: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  group: string;
  orders: number;
  totalSpent: number;
  status: 'active' | 'inactive';
}

interface CustomerFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: {
    name: string;
    gender: string;
    birthday: string;
    phone: string;
    city: string;
    address: string;
  }) => void;
  editingCustomer: Customer | null;
}

export function CustomerFormDialog({ open, onClose, onSubmit, editingCustomer }: CustomerFormDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    birthday: '',
    phone: '',
    city: '',
    address: '',
  });

  useEffect(() => {
    if (editingCustomer) {
      setFormData({
        name: editingCustomer.name,
        gender: editingCustomer.gender,
        birthday: editingCustomer.birthday,
        phone: editingCustomer.phone,
        city: editingCustomer.city,
        address: editingCustomer.address,
      });
    } else {
      setFormData({
        name: '',
        gender: '',
        birthday: '',
        phone: '',
        city: '',
        address: '',
      });
    }
  }, [editingCustomer, open]);

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[600px]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {editingCustomer ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tên khách hàng */}
          <div>
            <Label>Tên khách hàng</Label>
            <Input
              type="text"
              placeholder="VD: Nguyễn Văn A"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
            />
          </div>

          {/* Giới tính */}
          <div>
            <Label>Giới tính</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => setFormData({ ...formData, gender: value })}
            >
              <SelectTrigger className="mt-1.5 bg-white border-slate-300 shadow-none">
                <SelectValue placeholder="Chọn giới tính" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Nam">Nam</SelectItem>
                <SelectItem value="Nữ">Nữ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Ngày sinh */}
          <div>
            <Label>Ngày sinh</Label>
            <Input
              type="text"
              placeholder="VD: 15/01/1990"
              value={formData.birthday}
              onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
              className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
            />
          </div>

          {/* Số điện thoại */}
          <div>
            <Label>Số điện thoại</Label>
            <Input
              type="tel"
              placeholder="VD: 0901234567"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
            />
          </div>

          {/* Tỉnh / Thành phố */}
          <div>
            <Label>Tỉnh / Thành phố</Label>
            <Select
              value={formData.city}
              onValueChange={(value) => setFormData({ ...formData, city: value })}
            >
              <SelectTrigger className="mt-1.5 bg-white border-slate-300 shadow-none">
                <SelectValue placeholder="Chọn tỉnh/thành phố" />
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

          {/* Địa chỉ */}
          <div>
            <Label>Địa chỉ</Label>
            <Input
              type="text"
              placeholder="VD: 123 Đường ABC, Quận 1"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {editingCustomer ? 'Cập nhật khách hàng' : 'Thêm khách hàng'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
