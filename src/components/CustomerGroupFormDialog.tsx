import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export interface EditCustomerGroup {
  id: number;
  name: string;
  description: string,
  priority: number,
  minSpend: number,
  minOrders: number,
  windowMonths: number
}

interface CustomerGroupEditFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: EditCustomerGroup) => void;
  editingGroup: EditCustomerGroup;
}

export function CustomerGroupFormDialog(props: CustomerGroupEditFormDialogProps) {
  const [formData, setFormData] = useState<EditCustomerGroup>({
    id: 0,
    name: '',
    description: '',
    priority: 0,
    minSpend: 0,
    minOrders: 0,
    windowMonths: 0
  });

  useEffect(() => {
    setFormData({
      id: props.editingGroup.id,
      name: props.editingGroup.name,
      description: props.editingGroup.description,
      priority: props.editingGroup.priority,
      minSpend: props.editingGroup.minSpend,
      minOrders: props.editingGroup.minOrders,
      windowMonths: props.editingGroup.windowMonths
    }

    )
  }, [props.editingGroup, props.open]);

  const handleSubmit = () => {
    props.onSubmit(formData);
  };
  return (
    <Dialog open={props.open} onOpenChange={props.onClose}>
      <DialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Chỉnh sửa nhóm khách hàng
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

          {/* Mô tả */}
          <div>
            <Label>Mô tả</Label>
            <Input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="VD: Mô tả ngắn gọn về nhóm khách hàng"
              className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
            />
          </div>

          {/* Độ ưu tiên */}
          <div>
            <Label>Độ ưu tiên</Label>
            <Input
              type="text"
              value={formData.priority}
              onChange={(e) => { if (!Number.isNaN(Number(e.target.value))) setFormData({ ...formData, priority: Number(e.target.value) }) }}
              placeholder="VD: 0"
              className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
            />
          </div>

          {/* Chi tiêu tối thiểu */}
          <div>
            <Label>Chi tiêu tối thiểu</Label>
            <Input
              type="text"
              value={formData.minSpend}
              onChange={(e) => { if (!Number.isNaN(Number(e.target.value))) setFormData({ ...formData, minSpend: Number(e.target.value) }) }}
              placeholder="VD: 0"
              className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
            />
          </div>

          {/* Số đơn tối thiểu */}
          <div>
            <Label>Số đơn tối thiểu</Label>
            <Input
              type="text"
              value={formData.minOrders}
              onChange={(e) => { if (!Number.isNaN(Number(e.target.value))) setFormData({ ...formData, minOrders: Number(e.target.value) }) }}
              placeholder="VD: 0"
              className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
            />
          </div>

          {/* Tháng xét hạng */}
          <div>
            <Label>Số tháng xét hạng</Label>
            <Input
              type="text"
              value={formData.windowMonths}
              onChange={(e) => { if (!Number.isNaN(Number(e.target.value))) setFormData({ ...formData, windowMonths: Number(e.target.value) }) }}
              placeholder="VD: 0"
              className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
            />
          </div>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={props.onClose}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.name}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Cập nhật
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
