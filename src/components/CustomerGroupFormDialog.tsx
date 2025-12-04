import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import svgPaths from '../imports/svg-uemarp4dxh';
import { Button } from './ui/button';

interface Customer {
  id: string;
  code: string;
  name: string;
  phone: string;
  email: string;
}

interface CustomerGroup {
  id: string;
  code: string;
  name: string;
  status: 'active' | 'inactive';
  customers: Customer[];
}

interface CustomerGroupFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: {
    name: string;
    status: 'active' | 'inactive';
    customers: Customer[];
  }) => void;
  editingGroup: CustomerGroup | null;
  availableCustomers: Customer[];
}

export function CustomerGroupFormDialog({ 
  open, 
  onClose, 
  onSubmit, 
  editingGroup,
  availableCustomers 
}: CustomerGroupFormDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    status: 'active' as 'active' | 'inactive',
    customers: [] as Customer[],
  });

  const [showAddCustomerDropdown, setShowAddCustomerDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (editingGroup) {
      setFormData({
        name: editingGroup.name,
        status: editingGroup.status,
        customers: editingGroup.customers,
      });
    } else {
      setFormData({
        name: '',
        status: 'active',
        customers: [],
      });
    }
  }, [editingGroup, open]);

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const handleAddCustomer = (customer: Customer) => {
    if (!formData.customers.find(c => c.id === customer.id)) {
      setFormData({
        ...formData,
        customers: [...formData.customers, customer],
      });
    }
    setSearchQuery('');
    setShowAddCustomerDropdown(false);
  };

  const handleRemoveCustomer = (customerId: string) => {
    setFormData({
      ...formData,
      customers: formData.customers.filter(c => c.id !== customerId),
    });
  };

  const filteredAvailableCustomers = availableCustomers.filter(
    customer => 
      !formData.customers.find(c => c.id === customer.id) &&
      (customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       customer.phone.includes(searchQuery) ||
       customer.code.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white border border-[rgba(0,0,0,0.1)] border-solid rounded-[10px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] w-[600px] relative max-h-[90vh] flex flex-col">
        {/* Title */}
        <div className="pt-6 px-6">
          <p className="font-['Arimo:Regular',sans-serif] font-normal leading-[18px] text-[18px] text-neutral-950">
            {editingGroup ? 'Chỉnh sửa nhóm khách hàng' : 'Thêm nhóm khách hàng mới'}
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
          {/* Tên nhóm */}
          <div className="flex flex-col gap-[3px]">
            <label className="font-['Arimo:Regular',sans-serif] font-normal leading-[14px] text-[14px] text-neutral-950">
              Tên nhóm khách hàng
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="VD: Khách hàng VIP"
              className="bg-white border border-[rgba(0,0,0,0.1)] border-solid rounded-md h-10 px-3 font-['Arimo:Regular',sans-serif] font-normal leading-[14px] text-[14px] text-neutral-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Trạng thái */}
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

          {/* Customer List Section */}
          <div className="flex flex-col gap-[3px]">
            <label className="font-['Arimo:Regular',sans-serif] font-normal leading-[14px] text-[14px] text-neutral-950">
              Danh sách khách hàng ({formData.customers.length})
            </label>
            
            {/* Add Customer Section */}
            <div className="relative">
              {!showAddCustomerDropdown ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start gap-2 h-10"
                  onClick={() => setShowAddCustomerDropdown(true)}
                >
                  <Plus className="w-4 h-4" />
                  Thêm khách hàng vào nhóm
                </Button>
              ) : (
                <div className="border border-[rgba(0,0,0,0.1)] rounded-md">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm khách hàng..."
                    className="w-full h-10 px-3 font-['Arimo:Regular',sans-serif] font-normal leading-[14px] text-[14px] text-neutral-950 focus:outline-none"
                    autoFocus
                  />
                  {filteredAvailableCustomers.length > 0 && (
                    <div className="max-h-40 overflow-y-auto border-t border-[rgba(0,0,0,0.1)]">
                      {filteredAvailableCustomers.slice(0, 5).map((customer) => (
                        <button
                          key={customer.id}
                          type="button"
                          onClick={() => handleAddCustomer(customer)}
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 border-b border-[rgba(0,0,0,0.05)] last:border-0"
                        >
                          <div className="font-['Arimo:Regular',sans-serif] font-normal text-[14px] text-neutral-950">
                            {customer.name}
                          </div>
                          <div className="font-['Arimo:Regular',sans-serif] font-normal text-[12px] text-slate-500">
                            {customer.code} • {customer.phone}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Customer List */}
            {formData.customers.length > 0 && (
              <div className="mt-2 border border-[rgba(0,0,0,0.1)] rounded-md divide-y divide-[rgba(0,0,0,0.05)] max-h-60 overflow-y-auto">
                {formData.customers.map((customer) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between px-3 py-2 hover:bg-slate-50"
                  >
                    <div>
                      <div className="font-['Arimo:Regular',sans-serif] font-normal text-[14px] text-neutral-950">
                        {customer.name}
                      </div>
                      <div className="font-['Arimo:Regular',sans-serif] font-normal text-[12px] text-slate-500">
                        {customer.code} • {customer.phone}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomer(customer.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
            disabled={!formData.name}
            className="font-['Arimo:Regular',sans-serif] font-normal leading-[14px] text-[14px] text-white px-4 h-9 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editingGroup ? 'Cập nhật' : 'Thêm nhóm'}
          </button>
        </div>
      </div>
    </div>
  );
}
