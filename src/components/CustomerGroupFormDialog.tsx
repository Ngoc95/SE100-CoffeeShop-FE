import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {editingGroup ? 'Chỉnh sửa nhóm khách hàng' : 'Thêm nhóm khách hàng mới'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tên nhóm */}
          <div>
            <Label>Tên nhóm khách hàng</Label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="VD: Khách hàng VIP"
              className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
            />
          </div>

          {/* Trạng thái */}
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

          {/* Customer List Section */}
          <div>
            <Label>Danh sách khách hàng ({formData.customers.length})</Label>
            
            {/* Add Customer Section */}
            <div className="relative mt-1.5">
              {!showAddCustomerDropdown ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start gap-2 h-10 bg-white border-slate-300"
                  onClick={() => setShowAddCustomerDropdown(true)}
                >
                  <Plus className="w-4 h-4" />
                  Thêm khách hàng vào nhóm
                </Button>
              ) : (
                <div className="border border-slate-300 rounded-md">
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm khách hàng..."
                    className="h-10 bg-white border-0 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2 rounded-b-none"
                    autoFocus
                  />
                  {filteredAvailableCustomers.length > 0 && (
                    <div className="max-h-40 overflow-y-auto border-t border-slate-300">
                      {filteredAvailableCustomers.slice(0, 5).map((customer) => (
                        <button
                          key={customer.id}
                          type="button"
                          onClick={() => handleAddCustomer(customer)}
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 border-b border-slate-200 last:border-0 text-sm"
                        >
                          <div className="text-slate-900 font-medium">
                            {customer.name}
                          </div>
                          <div className="text-xs text-slate-500">
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
              <div className="mt-2 border border-slate-300 rounded-md divide-y divide-slate-200 max-h-60 overflow-y-auto">
                {formData.customers.map((customer) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between px-3 py-2 hover:bg-slate-50"
                  >
                    <div>
                      <div className="text-sm text-slate-900 font-medium">
                        {customer.name}
                      </div>
                      <div className="text-xs text-slate-500">
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

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.name}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {editingGroup ? 'Cập nhật' : 'Thêm nhóm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
