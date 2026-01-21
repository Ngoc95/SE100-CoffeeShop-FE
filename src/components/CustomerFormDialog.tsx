import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from './ui/select';
import { Button } from './ui/button';
import { activeStatus, cities, genders } from './pages/Customers';

export interface EditCustomer {
  id: number,
  code: string,
  name: string,
  phone: string,
  city: string,
  gender: string,
  birthday: string,
  address: string,
  isActive: boolean
}

export interface AddCustomer {
  name: string,
  phone: string,
  city: string,
  gender: string,
  birthday: string,
  address: string,
  isActive: boolean
}

interface CustomerEditFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (customer: EditCustomer) => void;
  editingCustomer: EditCustomer;
}

interface CustomerAddFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (customer: AddCustomer) => void;
}

export function CustomerEditFormDialog(props: CustomerEditFormDialogProps) {
  const [formData, setFormData] = useState<EditCustomer>({
    id: 0,
    code: '',
    name: '',
    phone: '',
    city: '',
    gender: '',
    birthday: '',
    address: '',
    isActive: true
  });

  useEffect(() => {
    setFormData({
      id: props.editingCustomer.id,
      code: props.editingCustomer.code,
      name: props.editingCustomer.name,
      phone: props.editingCustomer.phone,
      city: props.editingCustomer.city,
      gender: props.editingCustomer.gender,
      birthday: props.editingCustomer.birthday,
      address: props.editingCustomer.address,
      isActive: props.editingCustomer.isActive
    })
  }, [props.editingCustomer, props.open]);

  const handleSubmit = () => {
    props.onSubmit(formData);
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onClose}>
      <DialogContent className="max-w-[600px]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Chỉnh sửa khách hàng
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mã khách hàng */}
          <div>
            <Label>Mã khách hàng</Label>
            <Input
              type="text"
              disabled={true}
              placeholder="KH001"
              value={formData.code}
              className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
            />
          </div>

          {/* Tên khách hàng */}
          <div>
            <Label>Tên khách hàng <Label className="text-red-600">*</Label></Label>
            <Input
              type="text"
              placeholder="VD: Nguyễn Văn A"
              value={formData.name}
              onChange={(e) => { setFormData({ ...formData, name: e.target.value }) }}
              className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
            />
          </div>

          {/* Giới tính */}
          <div>
            <Label>Giới tính</Label>
            <Select
              value={formData.gender}
              onValueChange={(value: string) => setFormData({ ...formData, gender: value })}
            >
              <SelectTrigger className="mt-1.5 bg-white border-slate-300 shadow-none">
                <SelectValue placeholder="Chọn giới tính" />
              </SelectTrigger>
              <SelectContent>
                {
                  genders.map((gender, index) => (
                    <SelectItem key={index} value={gender}>
                      {gender}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>

          {/* Ngày sinh */}
          <div>
            <Label>Ngày sinh</Label>
            <input
              type="date"
              placeholder="VD: 15/01/1990"
              value={formData.birthday ? formData.birthday : "2026-01-16"}
              onChange={(e) => { setFormData({ ...formData, birthday: e.target.value }) }}
              className="mt-1.5 bg-white border-2 w-full rounded-sm p-1 border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
            />
          </div>

          {/* Số điện thoại */}
          <div>
            <Label>Số điện thoại <Label className="text-red-600">*</Label></Label>
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
              onValueChange={(value: string) => setFormData({ ...formData, city: value })}
            >
              <SelectTrigger className="mt-1.5 bg-white border-slate-300 shadow-none">
                <SelectValue placeholder="Chọn tỉnh/thành phố" />
              </SelectTrigger>
              <SelectContent>
                {
                  cities.map((city, index) => (
                    <SelectItem key={index} value={city}>
                      {city}
                    </SelectItem>
                  ))
                }
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

          {/* Status */}
          <div>
            <Label>Trạng thái</Label>
            <Select
              value={(formData.isActive) ? "Hoạt động" : "Không hoạt động"}
              onValueChange={(value: string) => setFormData({ ...formData, isActive: (value === "Hoạt động" ? true : false) })}
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
            className="bg-blue-600 hover:bg-blue-700"
          >
            Cập nhật khách hàng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CustomerAddFormDialog(props: CustomerAddFormDialogProps) {
  const [formData, setFormData] = useState<AddCustomer>({
    name: "",
    phone: "",
    city: "",
    gender: "male",
    birthday: "",
    address: "",
    isActive: true
  });

  useEffect(() => {
    setFormData({
      name: "",
      phone: "",
      city: "",
      gender: "male",
      birthday: "",
      address: "",
      isActive: true
    })
  }, [props.open]);

  const handleSubmit = () => {
    props.onSubmit(formData);
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onClose}>
      <DialogContent className="max-w-[600px]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Thêm khách hàng
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tên khách hàng */}
          <div>
            <Label>Tên khách hàng <Label className="text-red-600">*</Label></Label>
            <Input
              type="text"
              placeholder="VD: Nguyễn Văn A"
              value={formData.name}
              onChange={(e) => { setFormData({ ...formData, name: e.target.value }) }}
              className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
            />
          </div>

          {/* Giới tính */}
          <div>
            <Label>Giới tính</Label>
            <Select
              value={formData.gender}
              onValueChange={(value: string) => setFormData({ ...formData, gender: value })}
            >
              <SelectTrigger className="mt-1.5 bg-white border-slate-300 shadow-none">
                <SelectValue placeholder="Chọn giới tính" />
              </SelectTrigger>
              <SelectContent>
                {
                  genders.map((gender, index) => (
                    <SelectItem key={index} value={gender}>
                      {gender}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>

          {/* Ngày sinh */}
          <div>
            <Label>Ngày sinh</Label>
            <input
              type="date"
              placeholder="VD: 15/01/1990"
              value={formData.birthday ? formData.birthday : "2026-01-16"}
              onChange={(e) => { setFormData({ ...formData, birthday: e.target.value }) }}
              className="mt-1.5 bg-white border-2 w-full rounded-sm p-1 border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
            />
          </div>

          {/* Số điện thoại */}
          <div>
            <Label>Số điện thoại <Label className="text-red-600">*</Label></Label>
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
              onValueChange={(value: string) => setFormData({ ...formData, city: value })}
            >
              <SelectTrigger className="mt-1.5 bg-white border-slate-300 shadow-none">
                <SelectValue placeholder="Chọn tỉnh/thành phố" />
              </SelectTrigger>
              <SelectContent>
                {
                  cities.map((city, index) => (
                    <SelectItem key={index} value={city}>
                      {city}
                    </SelectItem>
                  ))
                }
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

          {/* Status */}
          {/* <div>
            <Label>Trạng thái</Label>
            <Select
              value={(formData.isActive) ? "Hoạt động" : "Không hoạt động"}
              onValueChange={(value: string) => setFormData({ ...formData, isActive: (value === "Hoạt động" ? true : false) })}
            >
              <SelectTrigger className="mt-1.5 bg-white border-slate-300 shadow-none">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Hoạt động">Hoạt động</SelectItem>
                <SelectItem value="Không hoạt động">Không hoạt động</SelectItem>
              </SelectContent>
            </Select>
          </div> */}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={props.onClose}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Thêm khách hàng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
