import { useState, useEffect } from 'react';
import svgPaths from '../imports/svg-uemarp4dxh';

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white border border-[rgba(0,0,0,0.1)] border-solid rounded-[10px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] w-[508.391px] relative">
        {/* Title */}
        <div className="pt-6 px-6">
          <p className="font-['Arimo:Regular',sans-serif] font-normal leading-[18px] text-[18px] text-neutral-950">
            {editingCustomer ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}
          </p>
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 opacity-70 hover:opacity-100 w-4 h-4 flex items-center justify-center"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 12 12">
            <path d={svgPaths.p31ac93c0} stroke="#0A0A0A" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
            <path d={svgPaths.p1c3aed40} stroke="#0A0A0A" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </button>

        {/* Form Fields */}
        <div className="px-6 pt-[34px] pb-6 flex flex-col gap-4">
          {/* Tên khách hàng */}
          <div className="flex flex-col gap-[3px]">
            <label className="font-['Arimo:Regular',sans-serif] font-normal leading-[14px] text-[14px] text-neutral-950">
              Tên khách hàng
            </label>
            <input
              type="text"
              placeholder="VD: Nguyễn Văn A..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-[#f3f3f5] border border-[rgba(0,0,0,0)] rounded-[8px] h-[36px] px-3 py-1 font-['Arimo:Regular',sans-serif] text-[14px] text-neutral-950 placeholder:text-[#717182] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Giới tính */}
          <div className="flex flex-col gap-[3px]">
            <label className="font-['Arimo:Regular',sans-serif] font-normal leading-[14px] text-[14px] text-neutral-950">
              Giới tính
            </label>
            <div className="relative">
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="bg-[#f3f3f5] border border-[rgba(0,0,0,0)] rounded-[8px] h-[36px] px-3 w-full font-['Arimo:Regular',sans-serif] text-[14px] text-neutral-950 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                <svg className="w-[10px] h-[6px]" fill="none" viewBox="0 0 10 6">
                  <path d={svgPaths.p1112dfa0} stroke="#717182" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                </svg>
              </div>
            </div>
          </div>

          {/* Ngày sinh */}
          <div className="flex flex-col gap-[3px]">
            <label className="font-['Arimo:Regular',sans-serif] font-normal leading-[14px] text-[14px] text-neutral-950">
              Ngày sinh
            </label>
            <input
              type="text"
              placeholder="VD: 15/01/1990..."
              value={formData.birthday}
              onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
              className="bg-[#f3f3f5] border border-[rgba(0,0,0,0)] rounded-[8px] h-[36px] px-3 py-1 font-['Arimo:Regular',sans-serif] text-[14px] text-neutral-950 placeholder:text-[#717182] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Số điện thoại */}
          <div className="flex flex-col gap-[3px]">
            <label className="font-['Arimo:Regular',sans-serif] font-normal leading-[14px] text-[14px] text-neutral-950">
              Số điện thoại
            </label>
            <input
              type="tel"
              placeholder="VD: 0901234567..."
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="bg-[#f3f3f5] border border-[rgba(0,0,0,0)] rounded-[8px] h-[36px] px-3 py-1 font-['Arimo:Regular',sans-serif] text-[14px] text-neutral-950 placeholder:text-[#717182] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tỉnh / Thành phố */}
          <div className="flex flex-col gap-[3px]">
            <label className="font-['Arimo:Regular',sans-serif] font-normal leading-[14px] text-[14px] text-neutral-950">
              Tỉnh / Thành phố
            </label>
            <div className="relative">
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="bg-[#f3f3f5] border border-[rgba(0,0,0,0)] rounded-[8px] h-[36px] px-3 w-full font-['Arimo:Regular',sans-serif] text-[14px] text-neutral-950 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn tỉnh/thành phố</option>
                <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
                <option value="Cần Thơ">Cần Thơ</option>
                <option value="Hải Phòng">Hải Phòng</option>
                <option value="Nha Trang">Nha Trang</option>
                <option value="Huế">Huế</option>
                <option value="Vũng Tàu">Vũng Tàu</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                <svg className="w-[10px] h-[6px]" fill="none" viewBox="0 0 10 6">
                  <path d={svgPaths.p1112dfa0} stroke="#717182" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                </svg>
              </div>
            </div>
          </div>

          {/* Địa chỉ */}
          <div className="flex flex-col gap-[3px]">
            <label className="font-['Arimo:Regular',sans-serif] font-normal leading-[14px] text-[14px] text-neutral-950">
              Địa chỉ
            </label>
            <input
              type="text"
              placeholder="VD: 123 Đường ABC, Quận 1..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="bg-[#f3f3f5] border border-[rgba(0,0,0,0)] rounded-[8px] h-[36px] px-3 py-1 font-['Arimo:Regular',sans-serif] text-[14px] text-neutral-950 placeholder:text-[#717182] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="px-6 pb-6 flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="bg-white border border-[rgba(0,0,0,0.1)] h-[36px] px-4 rounded-[8px] font-['Arimo:Regular',sans-serif] text-[14px] text-neutral-950 hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="bg-[#155dfc] h-[36px] px-4 rounded-[8px] font-['Arimo:Regular',sans-serif] text-[14px] text-white hover:bg-[#0d4fd8] transition-colors"
          >
            {editingCustomer ? 'Cập nhật khách hàng' : 'Thêm khách hàng'}
          </button>
        </div>
      </div>
    </div>
  );
}
