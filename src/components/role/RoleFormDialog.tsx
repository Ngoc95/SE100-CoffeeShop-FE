import { useState, useEffect } from 'react';
import { Role, Permission } from '../../types/account';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { PermissionCheckboxTree } from './PermissionCheckboxTree';
import { toast } from 'sonner';

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: Role | null; // null for create, Role for edit
  onSave: (role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export function RoleFormDialog({
  open,
  onOpenChange,
  role,
  onSave,
}: RoleFormDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);

  const isEdit = !!role;

  useEffect(() => {
    if (role) {
      setName(role.name);
      setDescription(role.description || '');
      setSelectedPermissions(role.permissions);
    } else {
      setName('');
      setDescription('');
      setSelectedPermissions([]);
    }
  }, [role, open]);

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên vai trò');
      return;
    }

    if (selectedPermissions.length === 0) {
      toast.error('Vui lòng chọn ít nhất một quyền');
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      permissions: selectedPermissions,
      isSystem: false, // Custom roles are not system roles
    });

    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Chỉnh sửa vai trò' : 'Thêm vai trò mới'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Cập nhật thông tin và quyền cho vai trò'
              : 'Tạo vai trò mới và phân quyền'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Role Name */}
          <div className="space-y-2">
            <Label htmlFor="role-name">
              Tên vai trò <span className="text-red-500">*</span>
            </Label>
            <Input
              id="role-name"
              placeholder="Ví dụ: Quản lý kho"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={role?.isSystem} // Cannot edit system role name
            />
          </div>

          {/* Role Description */}
          <div className="space-y-2">
            <Label htmlFor="role-description">Mô tả</Label>
            <Textarea
              id="role-description"
              placeholder="Mô tả vai trò và trách nhiệm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Permissions */}
          <div className="space-y-2">
            <Label>
              Phân quyền <span className="text-red-500">*</span>
            </Label>
            <div className="text-sm text-slate-500 mb-2">
              Đã chọn: {selectedPermissions.length} quyền
            </div>
            <PermissionCheckboxTree
              selectedPermissions={selectedPermissions}
              onChange={setSelectedPermissions}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Hủy
          </Button>
          <Button onClick={handleSave}>
            {isEdit ? 'Cập nhật' : 'Tạo vai trò'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
