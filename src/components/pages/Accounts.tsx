import { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Filter,
  Power,
  PowerOff,
  ChevronDown,
  ChevronRight,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '../ui/dialog';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner';
import { Account, Role, Permission } from '../../types/account';
import { initialAccounts } from '../../data/accountData';
import { initialRoles } from '../../data/roleData';
import { RoleFormDialog } from '../role/RoleFormDialog';
import { PermissionCheckboxTree } from '../role/PermissionCheckboxTree';
import { useAuth } from "../../contexts/AuthContext";

export function Accounts() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('system_users:create');
  const canUpdate = hasPermission('system_users:update');
  const canDelete = hasPermission('system_users:delete');

  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('list');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedAccountId, setExpandedAccountId] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [detailTab, setDetailTab] = useState('info');

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    roleId: '',
  });

  // Custom permissions for expanded account
  const [customPermissions, setCustomPermissions] = useState<Permission[]>([]);

  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch =
      account.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || account.roleId === filterRole;
    const matchesStatus = filterStatus === 'all' || account.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleName = (roleId: string) => {
    return roles.find((r) => r.id === roleId)?.name || 'Không xác định';
  };

  const getAccountPermissions = (account: Account): Permission[] => {
    if (account.customPermissions) {
      return account.customPermissions;
    }
    const role = roles.find((r) => r.id === account.roleId);
    return role?.permissions || [];
  };

  const resetForm = () => {
    setFormData({
      username: '',
      fullName: '',
      password: '',
      confirmPassword: '',
      roleId: '',
    });
  };

  const handleRowClick = (accountId: string) => {
    if (expandedAccountId === accountId) {
      setExpandedAccountId(null);
    } else {
      const account = accounts.find((a) => a.id === accountId);
      if (account) {
        setExpandedAccountId(accountId);
        setCustomPermissions(getAccountPermissions(account));
        setDetailTab('info');
      }
    }
  };

  const handleAdd = () => {
    if (
      !formData.username ||
      !formData.fullName ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.roleId
    ) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (accounts.some((a) => a.username === formData.username)) {
      toast.error('Tên đăng nhập đã tồn tại');
      return;
    }

    const newAccount: Account = {
      id: `acc-${Date.now()}`,
      username: formData.username,
      fullName: formData.fullName,
      roleId: formData.roleId,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setAccounts([...accounts, newAccount]);
    toast.success('Đã tạo tài khoản thành công');
    setAddDialogOpen(false);
    resetForm();
  };

  const handleEdit = (account: Account, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAccount(account);
    setFormData({
      username: account.username,
      fullName: account.fullName,
      password: '',
      confirmPassword: '',
      roleId: account.roleId,
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!editingAccount) return;

    if (!formData.fullName || !formData.roleId) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (formData.password || formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        toast.error('Mật khẩu xác nhận không khớp');
        return;
      }
      if (formData.password.length < 6) {
        toast.error('Mật khẩu phải có ít nhất 6 ký tự');
        return;
      }
    }

    const updatedAccounts = accounts.map((account) =>
      account.id === editingAccount.id
        ? {
            ...account,
            fullName: formData.fullName,
            roleId: formData.roleId,
            updatedAt: new Date().toISOString(),
          }
        : account
    );

    setAccounts(updatedAccounts);
    toast.success('Đã cập nhật tài khoản');
    setEditDialogOpen(false);
    setEditingAccount(null);
    resetForm();
  };

  const handleDelete = (account: Account, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Bạn có chắc muốn xóa tài khoản "${account.username}"?`)) {
      setAccounts(accounts.filter((a) => a.id !== account.id));
      toast.success('Đã xóa tài khoản');
      if (expandedAccountId === account.id) {
        setExpandedAccountId(null);
      }
    }
  };

  const handleToggleStatus = (account: Account, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedAccounts = accounts.map((a) =>
      a.id === account.id
        ? {
            ...a,
            status: (a.status === 'active' ? 'inactive' : 'active') as 'active' | 'inactive',
            updatedAt: new Date().toISOString(),
          }
        : a
    );
    setAccounts(updatedAccounts);
    toast.success(
      `Đã ${account.status === 'active' ? 'vô hiệu hóa' : 'kích hoạt'} tài khoản`
    );
  };

  const handleSaveCustomPermissions = () => {
    if (!expandedAccountId) return;

    const updatedAccounts = accounts.map((a) =>
      a.id === expandedAccountId
        ? {
            ...a,
            customPermissions,
            updatedAt: new Date().toISOString(),
          }
        : a
    );

    setAccounts(updatedAccounts);
    toast.success('Đã cập nhật phân quyền');
  };

  const handleUpdateRoleInExpanded = (roleId: string) => {
    if (!expandedAccountId) return;

    const updatedAccounts = accounts.map((a) =>
      a.id === expandedAccountId
        ? {
            ...a,
            roleId,
            updatedAt: new Date().toISOString(),
          }
        : a
    );

    setAccounts(updatedAccounts);
    
    // Update custom permissions to match new role
    const newRole = roles.find((r) => r.id === roleId);
    if (newRole) {
      setCustomPermissions(newRole.permissions);
    }
    
    toast.success('Đã cập nhật vai trò');
  };

  const handleSaveRole = (roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingRole) {
      const updatedRoles = roles.map((r) =>
        r.id === editingRole.id
          ? {
              ...r,
              ...roleData,
              updatedAt: new Date().toISOString(),
            }
          : r
      );
      setRoles(updatedRoles);
      toast.success('Đã cập nhật vai trò');
    } else {
      const newRole: Role = {
        ...roleData,
        id: `role-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setRoles([...roles, newRole]);
      toast.success('Đã tạo vai trò mới');
    }
    setEditingRole(null);
  };

  const clearFilters = () => {
    setFilterRole('all');
    setFilterStatus('all');
    setSearchQuery('');
  };

  const activeFiltersCount = 
    (filterRole !== 'all' ? 1 : 0) + 
    (filterStatus !== 'all' ? 1 : 0);

  const expandedAccount = accounts.find((a) => a.id === expandedAccountId);

  return (
    <div className="p-6 space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-blue-900 text-2xl font-semibold">Quản lý người dùng</h1>
        {canCreate && (
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm tài khoản
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          {/* Search and Filters */}
          <div className="mb-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Tìm kiếm tài khoản..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="relative"
              >
                <Filter className="w-4 h-4 mr-2" />
                Bộ lọc
                {activeFiltersCount > 0 && (
                  <Badge className="ml-2 bg-blue-500 text-white px-1.5 py-0.5 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border">
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-600">Vai trò</Label>
                    <Select value={filterRole} onValueChange={setFilterRole}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả vai trò</SelectItem>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-600">Trạng thái</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value="active">Hoạt động</SelectItem>
                        <SelectItem value="inactive">Vô hiệu hóa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-slate-600 hover:text-slate-900"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Xóa lọc
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Tên đăng nhập</TableHead>
                  <TableHead>Tên người dùng</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.map((account) => (
                  <>
                    <TableRow
                      key={account.id}
                      className="cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => handleRowClick(account.id)}
                    >
                      <TableCell>
                        {expandedAccountId === account.id ? (
                          <ChevronDown className="w-4 h-4 text-slate-600" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{account.username}</TableCell>
                      <TableCell>{account.fullName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {getRoleName(account.roleId)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            account.status === 'active'
                              ? 'bg-slate-900 text-white hover:bg-slate-800'
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          }
                        >
                          {account.status === 'active' ? 'Hoạt động' : 'Vô hiệu hóa'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {canUpdate && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e: React.MouseEvent) => handleEdit(account, e)}
                              className="h-8 w-8 p-0"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          )}
                          {canUpdate && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e: React.MouseEvent) => handleToggleStatus(account, e)}
                              className="h-8 w-8 p-0"
                            >
                              {account.status === 'active' ? (
                                <PowerOff className="w-4 h-4 text-orange-600" />
                              ) : (
                                <Power className="w-4 h-4 text-green-600" />
                              )}
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e: React.MouseEvent) => handleDelete(account, e)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Expanded Detail Row */}
                    {expandedAccountId === account.id && expandedAccount && (
                      <TableRow>
                        <TableCell colSpan={6} className="bg-slate-50 p-0">
                          <div className="p-6">
                            <Tabs value={detailTab} onValueChange={setDetailTab}>
                              <TabsList className="mb-4">
                                <TabsTrigger value="info">Thông tin</TabsTrigger>
                                <TabsTrigger value="permissions">Phân quyền</TabsTrigger>
                              </TabsList>

                              <TabsContent value="info" className="space-y-4 mt-0">
                                <div className="grid grid-cols-2 gap-6">
                                  <div className="space-y-1.5">
                                    <Label className="text-xs text-slate-500">
                                      Tên đăng nhập
                                    </Label>
                                    <p className="text-sm font-medium">
                                      {expandedAccount.username}
                                    </p>
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label className="text-xs text-slate-500">
                                      Tên người dùng
                                    </Label>
                                    <p className="text-sm font-medium">
                                      {expandedAccount.fullName}
                                    </p>
                                  </div>
                                </div>
                              </TabsContent>

                              <TabsContent value="permissions" className="space-y-4 mt-0">
                                <div className="space-y-4">
                                  <div className="flex items-center gap-2 pb-3 border-b">
                                    <Label className="text-sm font-medium flex-1">
                                      Vai trò
                                    </Label>
                                    <Select
                                      value={expandedAccount.roleId}
                                      onValueChange={handleUpdateRoleInExpanded}
                                    >
                                      <SelectTrigger className="w-64">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {roles.map((role) => (
                                          <SelectItem key={role.id} value={role.id}>
                                            {role.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setEditingRole(null);
                                        setRoleDialogOpen(true);
                                      }}
                                    >
                                      <Plus className="w-4 h-4 mr-1" />
                                      Thêm vai trò
                                    </Button>
                                  </div>

                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <Label className="text-sm font-medium">
                                        Quyền tùy chỉnh
                                      </Label>
                                      <Button
                                        size="sm"
                                        onClick={handleSaveCustomPermissions}
                                      >
                                        Lưu phân quyền
                                      </Button>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                      Tùy chỉnh quyền cho tài khoản này (ghi đè quyền của vai trò)
                                    </p>
                                    <PermissionCheckboxTree
                                      selectedPermissions={customPermissions}
                                      onChange={setCustomPermissions}
                                    />
                                  </div>
                                </div>
                              </TabsContent>
                            </Tabs>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredAccounts.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              Không tìm thấy tài khoản nào
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Account Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm tài khoản mới</DialogTitle>
            <DialogDescription>
              Tạo tài khoản mới cho nhân viên
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>
                Tên người dùng <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Nguyễn Văn A"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                Tên đăng nhập <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="nguyenvana"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                Mật khẩu <span className="text-red-500">*</span>
              </Label>
              <Input
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </Label>
              <Input
                type="password"
                placeholder="Nhập lại mật khẩu"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="flex-1">
                  Vai trò <span className="text-red-500">*</span>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingRole(null);
                    setRoleDialogOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Thêm vai trò
                </Button>
              </div>
              <Select
                value={formData.roleId}
                onValueChange={(value: string) =>
                  setFormData({ ...formData, roleId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                      {role.isSystem && ' (Hệ thống)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleAdd}>Tạo tài khoản</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa tài khoản</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tên đăng nhập</Label>
              <Input value={formData.username} disabled />
            </div>

            <div className="space-y-2">
              <Label>
                Tên người dùng <span className="text-red-500">*</span>
              </Label>
              <Input
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Mật khẩu mới (để trống nếu không đổi)</Label>
              <Input
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Xác nhận mật khẩu mới</Label>
              <Input
                type="password"
                placeholder="Nhập lại mật khẩu"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                Vai trò <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.roleId}
                onValueChange={(value: string) =>
                  setFormData({ ...formData, roleId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdate}>Cập nhật</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Form Dialog */}
      <RoleFormDialog
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
        role={editingRole}
        onSave={handleSaveRole}
      />
    </div>
  );
}
