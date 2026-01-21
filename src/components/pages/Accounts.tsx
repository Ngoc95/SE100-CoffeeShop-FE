import { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Lock,
  Shield,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { toast } from 'sonner';
import { Role, Permission } from '../../types/account';
import { initialRoles } from '../../data/roleData';
import roleApi from '../../api/roleApi';
import React from 'react';
import { RoleFormDialog } from '../role/RoleFormDialog';
import { useAuth } from "../../contexts/AuthContext";
import { Badge } from '../ui/badge';
import { PermissionCheckboxTree } from '../role/PermissionCheckboxTree';

export function Accounts() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('system_users:create');
  const canUpdate = hasPermission('system_users:update');
  const canDelete = hasPermission('system_users:delete');

  const [roles, setRoles] = useState<Role[]>([]);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [expandedRoleId, setExpandedRoleId] = useState<number | null>(null);
  const [editingPermissionsRoleId, setEditingPermissionsRoleId] = useState<number | null>(null);
  const [tempPermissions, setTempPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch roles on mount
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await roleApi.getAll();
      const rolesData = res.data.metaData?.roles || [];
      // Ensure rolesData is an array
      setRoles(Array.isArray(rolesData) ? rolesData : []);
    } catch (error) {
       console.error("Error fetching roles:", error);
       toast.error("Không thể tải danh sách vai trò");
    } finally {
      setLoading(false);
    }
  };

  useState(() => {
    fetchRoles();
  }); // Using useState initializer as a mount effect alternative or standard useEffect

  // Actually switch to useEffect for fetching
  React.useEffect(() => {
    fetchRoles();
  }, []);

  const handleAddRole = () => {
    setEditingRole(null);
    setRoleDialogOpen(true);
  };

  const handleEditRole = (role: Role, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingRole(role);
    setRoleDialogOpen(true);
  };

  const handleDeleteRole = async (role: Role, e: React.MouseEvent) => {
    e.stopPropagation();
    if (role.isSystem) {
      toast.error('Không thể xóa vai trò hệ thống');
      return;
    }

    if (confirm(`Bạn có chắc muốn xóa vai trò "${role.name}"?`)) {
      try {
        await roleApi.delete(role.id);
        toast.success('Đã xóa vai trò');
        fetchRoles();
      } catch (error) {
        console.error(error);
        toast.error('Lỗi khi xóa vai trò');
      }
    }
  };

  const handleSaveRole = async (roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingRole) {
        // Update existing role
        await roleApi.update(editingRole.id, {
          name: roleData.name,
          description: roleData.description,
          permissions: roleData.permissions
        });
        toast.success('Đã cập nhật vai trò');
      } else {
        // Create new role
        await roleApi.create({
           name: roleData.name,
           description: roleData.description,
           permissions: roleData.permissions,
           isSystem: false
        });
        toast.success('Đã tạo vai trò mới');
      }
      setRoleDialogOpen(false);
      setEditingRole(null);
      fetchRoles();
    } catch (error) {
      console.error(error);
      toast.error(editingRole ? 'Lỗi khi cập nhật vai trò' : 'Lỗi khi tạo vai trò');
    }
  };

  const toggleExpand = (roleId: number) => {
    if (expandedRoleId === roleId) {
      setExpandedRoleId(null);
      setEditingPermissionsRoleId(null);
    } else {
      setExpandedRoleId(roleId);
      setEditingPermissionsRoleId(null);
    }
  };

  const startEditPermissions = (role: Role) => {
    setEditingPermissionsRoleId(role.id);
    setTempPermissions(role.permissions);
  };

  const cancelEditPermissions = () => {
    setEditingPermissionsRoleId(null);
    setTempPermissions([]);
  };

  const saveEditPermissions = async (role: Role) => {
    try {
      await roleApi.update(role.id, {
        permissions: tempPermissions
      });
      toast.success('Đã cập nhật quyền hạn');
      setEditingPermissionsRoleId(null);
      setTempPermissions([]);
      fetchRoles();
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi cập nhật quyền hạn');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-blue-900 text-2xl font-semibold">Phân quyền & Vai trò</h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý các loại tài khoản và quyền hạn truy cập hệ thống
          </p>
        </div>
        {canCreate && (
          <Button onClick={handleAddRole} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Thêm vai trò mới
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-12"></TableHead>
                <TableHead>Tên vai trò</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead className="text-center">Loại</TableHead>
                <TableHead className="text-center">Số lượng quyền</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <React.Fragment key={role.id}>
                  <TableRow
                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => toggleExpand(role.id)}
                  >
                    <TableCell>
                      {expandedRoleId === role.id ? (
                        <ChevronDown className="w-4 h-4 text-slate-600" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {role.isSystem ? (
                          <ShieldCheck className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Shield className="w-4 h-4 text-slate-500" />
                        )}
                        {role.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 max-w-md truncate">
                      {role.description || 'Chưa có mô tả'}
                    </TableCell>
                    <TableCell className="text-center">
                      {role.isSystem ? (
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                          Hệ thống
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-slate-600">
                          Tùy chỉnh
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="font-mono">
                        {role.permissions.length}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {canUpdate && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600"
                            onClick={(e: React.MouseEvent) => handleEditRole(role, e)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 w-8 p-0 ${role.isSystem
                              ? 'text-slate-300 cursor-not-allowed'
                              : 'text-slate-500 hover:text-red-600'
                              }`}
                            onClick={(e: React.MouseEvent) => !role.isSystem && handleDeleteRole(role, e)}
                            disabled={role.isSystem}
                          >
                            {role.isSystem ? (
                              <Lock className="w-4 h-4" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Expanded Detail Row */}
                  {expandedRoleId === role.id && (
                    <TableRow>
                      <TableCell colSpan={6} className="bg-slate-50 p-0 border-b">
                        <div className="p-6">
                          <div className="mb-4">
                            <h3 className="font-medium text-blue-900 mb-2">Thông tin chi tiết</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="space-y-1">
                                <p className="text-slate-500 text-xs">Tên vai trò</p>
                                <p className="font-medium">{role.name}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-slate-500 text-xs">Loại vai trò</p>
                                <p>{role.isSystem ? 'Mặc định hệ thống' : 'Tùy chỉnh'}</p>
                              </div>
                              <div className="col-span-2 space-y-1">
                                <p className="text-slate-500 text-xs">Mô tả</p>
                                <p className="text-slate-700">{role.description || 'Không có mô tả'}</p>
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-medium text-blue-900">Danh sách quyền hạn</h3>
                              {canUpdate && (
                                <div className="flex gap-2">
                                  <Button size="sm" variant="default" onClick={() => saveEditPermissions(role)} disabled={JSON.stringify(tempPermissions) === JSON.stringify(role.permissions)}>
                                    Lưu thay đổi
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={cancelEditPermissions}>
                                    Hủy
                                  </Button>
                                </div>
                              )}
                            </div>
                            <div className="bg-white rounded-lg border p-4">
                              <PermissionCheckboxTree
                                selectedPermissions={tempPermissions.length && expandedRoleId === role.id ? tempPermissions : role.permissions}
                                onChange={setTempPermissions}
                              />
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <RoleFormDialog
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
        role={editingRole}
        onSave={handleSaveRole}
      />
    </div>
  );
}
