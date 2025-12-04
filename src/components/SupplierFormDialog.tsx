import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import svgPaths from '../imports/svg-uemarp4dxh';

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
    debt: 0,
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
        debt: editingSupplier.debt,
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
        debt: 0,
        status: 'active',
      });
    }
  }, [editingSupplier, open]);

  const handleSubmit = () => {
    onSubmit(formData);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white border border-[rgba(0,0,0,0.1)] border-solid rounded-[10px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] w-[700px] relative max-h-[90vh] flex flex-col">
        {/* Title */}
        <div className="pt-6 px-6">
          <p className="font-['Arimo:Regular',sans-serif] font-normal leading-[18px] text-[18px] text-neutral-950">
            {editingSupplier ? 'Chỉnh sửa nhà cung cấp' : 'Thêm nhà cung cấp mới'}
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
        <div className="px-6 pt-[34px] pb-6 flex flex-col gap-4 overflow-y-auto flex-1">
          {/* Row 1: Tên NCC & Danh mục */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-[3px]">
              <label className="font-['Arimo:Regular',sans-serif] font-normal leading-[14px] text-[14px] text-neutral-950">
                Tên nhà cung cấp *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Trung Nguyên"
                className="bg-white border border-[rgba(0,0,0,0.1)] border-solid rounded-md h-10 px-3 font-['Arimo:Regular',sans-serif] font-normal leading-[14px] text-[14px] text-neutral-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-[3px]">
              <label className="font-['Arimo:Regular',sans-serif] font-normal leading-[14px] text-[14px] text-neutral-950">
                Danh mục
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="VD: Cà phê, Trà, Sữa..."
                className="bg-white border border-[rgba(0,0,0,0.1)] border-solid rounded-md h-10 px-3 font-['Arimo:Regular',sans-serif] font-normal leading-[14px] text-[14px] text-neutral-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Row 2: Người liên hệ & Số điện thoại */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-[3px]">
              <label className="font-['Arimo:Regular',sans-serif] font-normal leading-[14px] text-[14px] text-neutral-950">
                Người liên hệ
              </label>
              <input
                type="text"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                placeholder="Nhập tên người liên hệ"
                className="bg-white border border-[rgba(0,0,0,0.1)] border-solid rounded-md h-10 px-3 font-['Arimo:Regular',sans-serif] font-normal leading-[14px] text-[14px] text-neutral-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-[3px]">
              <label className="font-['Arimo:Regular',sans-serif] font-normal leading-[14px] text-[14px] text-neutral-950">
                Số điện thoại *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0901234567"
                className="bg-white border border-[rgba(0,0,0,0.1)] border-solid rounded-md h-10 px-3 font-['Arimo:Regular',sans-serif] font-normal leading-[14px] text-[14px] text-neutral-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Row 3: Email & Thành phố */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-[3px]">
              <label className="font-['Arimo:Regular',sans-serif] font-normal leading-[14px] text-[14px] text-neutral-950">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                className="bg-white border border-[rgba(0,0,0,0.1)] border-solid rounded-md h-10 px-3 font-['Arimo:Regular',sans-serif] font-normal leading-[14px] text-[14px] text-neutral-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-[3px]">
              <label className="font-['Arimo:Regular',sans-serif] font-normal leading-[14px] text-[14px] text-neutral-950">
                Tỉnh / Thành phố
              </label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="bg-white border border-[rgba(0,0,0,0.1)] border-solid rounded-md h-10 px-3 font-['Arimo:Regular',sans-serif] font-normal leading-[14px] text-[14px] text-neutral-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn thành phố</option>
                <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
                <option value="Cần Thơ">Cần Thơ</option>
                <option value="Hải Phòng">Hải Phòng</option>
                <option value="Nha Trang">Nha Trang</option>
                <option value="Huế">Huế</option>
                <option value="Vũng Tàu">Vũng Tàu</option>
              </select>
            </div>
          </div>

          {/* Row 4: Địa chỉ */}
          <div className="flex flex-col gap-[3px]">
            <label className="font-['Arimo:Regular',sans-serif] font-normal leading-[14px] text-[14px] text-neutral-950">
              Địa chỉ
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Số nhà, tên đường, phường/xã..."
              rows={2}
              className="bg-white border border-[rgba(0,0,0,0.1)] border-solid rounded-md px-3 py-2 font-['Arimo:Regular',sans-serif] font-normal leading-[14px] text-[14px] text-neutral-950 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Row 5: Công nợ & Trạng thái */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-[3px]">
              <label className="font-['Arimo:Regular',sans-serif] font-normal leading-[14px] text-[14px] text-neutral-950">
                Công nợ (VNĐ)
              </label>
              <input
                type="number"
                value={formData.debt}
                onChange={(e) => setFormData({ ...formData, debt: Number(e.target.value) })}
                placeholder="0"
                min="0"
                className="bg-white border border-[rgba(0,0,0,0.1)] border-solid rounded-md h-10 px-3 font-['Arimo:Regular',sans-serif] font-normal leading-[14px] text-[14px] text-neutral-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-[3px]">
              <label className="font-['Arimo:Regular',sans-serif] font-normal leading-[14px] text-[14px] text-neutral-950">
                Trạng thái
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="bg-white border border-[rgba(0,0,0,0.1)] border-solid rounded-md h-10 px-3 font-['Arimo:Regular',sans-serif] font-normal leading-[14px] text-[14px] text-neutral-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pt-0 pb-6 flex justify-end gap-[9px] border-t border-[rgba(0,0,0,0.05)] pt-4">
          <button
            onClick={onClose}
            className="font-['Arimo:Regular',sans-serif] font-normal leading-[14px] text-[14px] text-neutral-950 px-4 h-9 bg-white border border-[rgba(0,0,0,0.1)] border-solid rounded-md hover:bg-slate-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={!formData.name || !formData.phone}
            className="font-['Arimo:Regular',sans-serif] font-normal leading-[14px] text-[14px] text-white px-4 h-9 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editingSupplier ? 'Cập nhật' : 'Thêm nhà cung cấp'}
          </button>
        </div>
      </div>
    </div>
  );
}
