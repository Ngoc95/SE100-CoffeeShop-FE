import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { cities } from './pages/Customers';
import { getSupplierCategories } from '../api/supplier';

import { toast } from 'sonner';

export interface EditSupplier {
  id: number;
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  category: string;
  status: 'active' | 'inactive';
}

interface SupplierEditFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: EditSupplier) => void;
  editingSupplier: EditSupplier;
  title?: string;
}

export function SupplierEditFormDialog(props: SupplierEditFormDialogProps) {
  const [supplierCategories, setSupplierCategories] = useState([])

  const [formData, setFormData] = useState<EditSupplier>({
    id: 0,
    code: "",
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    category: "",
    status: 'active'
  });

  const fetchSupplierCategories = async () => {
    const res = await getSupplierCategories()
    const { categories } = res.data.metaData
    if (categories) {
      setSupplierCategories(categories)
    }
  }

  useEffect(() => {
    setFormData({
      id: props.editingSupplier.id,
      code: props.editingSupplier.code,
      name: props.editingSupplier.name,
      contactPerson: props.editingSupplier.contactPerson,
      phone: props.editingSupplier.phone,
      email: props.editingSupplier.email,
      address: props.editingSupplier.address,
      city: props.editingSupplier.city,
      category: props.editingSupplier.category,
      status: props.editingSupplier.status
    });

    fetchSupplierCategories()
  }, [props.editingSupplier, props.open]);

  const handleSubmit = () => {
    if (!formData.name.trim()) return toast.error("Tên nhà cung cấp là bắt buộc");
    if (!formData.category.trim()) return toast.error("Danh mục là bắt buộc");
    if (!formData.contactPerson.trim()) return toast.error("Người liên hệ là bắt buộc");
    if (!formData.phone.trim()) return toast.error("Số điện thoại là bắt buộc");
    
    // Clean up optional fields
    const cleanedData = { ...formData };
    if (!cleanedData.email.trim()) (cleanedData as any).email = undefined;
    if (!cleanedData.address.trim()) (cleanedData as any).address = undefined;
    if (!cleanedData.city || cleanedData.city === 'all') (cleanedData as any).city = undefined;

    props.onSubmit(cleanedData);
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onClose}>
      <DialogContent className="max-w-[700px] max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {props.title || "Chỉnh sửa nhà cung cấp"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {props.editingSupplier.id !== 0 && (
          <div>
            <Label>
              Mã nhà cung cấp
            </Label>
            <Input
              type="text"
              value={formData.code}
              disabled={true}
              placeholder="VD: Trung Nguyên"
              className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
            />
          </div>
          )}
          {/*Tên NCC & Danh mục */}
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
              <Label>Danh mục <span className="text-red-500">*</span></Label>
              <Input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Nhập danh mục"
                className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
              />
            </div>
          </div>

          {/* Row 2: Người liên hệ & Số điện thoại */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Người liên hệ <span className="text-red-500">*</span></Label>
              <Input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
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
                onValueChange={(value: string) => setFormData({ ...formData, city: value })}
              >
                <SelectTrigger className="mt-1.5 bg-white border-slate-300 shadow-none">
                  <SelectValue placeholder="Chọn thành phố" />
                </SelectTrigger>
                <SelectContent>
                  {
                    cities.map((city, index) => (
                      <SelectItem key={index} value={city}>
                        {city}
                      </SelectItem>
                    ))
                  }
                  {/* <SelectItem value="Hồ Chí Minh">Hồ Chí Minh</SelectItem>
                  <SelectItem value="Hà Nội">Hà Nội</SelectItem>
                  <SelectItem value="Đà Nẵng">Đà Nẵng</SelectItem>
                  <SelectItem value="Cần Thơ">Cần Thơ</SelectItem>
                  <SelectItem value="Hải Phòng">Hải Phòng</SelectItem>
                  <SelectItem value="Nha Trang">Nha Trang</SelectItem>
                  <SelectItem value="Huế">Huế</SelectItem>
                  <SelectItem value="Vũng Tàu">Vũng Tàu</SelectItem> */}
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

          {/* Status */}
          <div>
            <Label>Trạng thái</Label>
            <Select
              value={(formData.status == 'active') ? "Hoạt động" : "Không hoạt động"}
              onValueChange={(value: string) => setFormData({ ...formData, status: (value === "Hoạt động" ? 'active' : 'inactive') })}
            >
              <SelectTrigger className="mt-1.5 bg-white border-slate-300 shadow-none">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Hoạt động">Hoạt động</SelectItem>
                <SelectItem value="Không hoạt động">Không hoạt động</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={props.onClose}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            // disabled={!formData.name || !formData.phone}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {props.editingSupplier.id === 0 ? "Thêm" : "Cập nhật"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}