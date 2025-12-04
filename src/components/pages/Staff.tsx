import { useState } from 'react';
import { Plus, Edit, Trash2, Search, Filter, X, ArrowUpDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { toast } from 'sonner@2.0.3';
import { SimpleSearchSelect } from '../SimpleSearchSelect';

interface StaffMember {
  id: string;
  staffCode: string;
  fullName: string;
  phone: string;
  idCard: string;
  gender: 'male' | 'female';
  birthDate: string;
  position: string;
  positionLabel: string;
  joinDate: string;
  salary: number;
  status: 'active' | 'inactive';
  address: {
    city: string;
    ward: string;
    detail: string;
  };
}

type SortField = 'staffCode' | 'fullName' | 'joinDate' | 'position' | null;
type SortOrder = 'asc' | 'desc';

export function Staff() {
  const [searchQuery, setSearchQuery] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [filterPosition, setFilterPosition] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  // Form state for adding new staff
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    idCard: '',
    position: '',
    joinDate: '',
    salary: '',
    city: '',
    ward: '',
    addressDetail: '',
    gender: 'male',
    birthDate: '',
  });

  // Account info state
  const [accountData, setAccountData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: '',
  });

  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([
    {
      id: '1',
      staffCode: 'NV001',
      fullName: 'Nguyễn Văn A',
      phone: '0901234567',
      idCard: '001234567890',
      gender: 'male',
      birthDate: '1990-01-01',
      position: 'manager',
      positionLabel: 'Quản lý',
      joinDate: '2023-01-15',
      salary: 15000000,
      status: 'active',
      address: {
        city: 'TP. Hồ Chí Minh',
        ward: 'Phường Bến Nghé',
        detail: '123 Nguyễn Huệ',
      },
    },
    {
      id: '2',
      staffCode: 'NV002',
      fullName: 'Trần Thị B',
      phone: '0912345678',
      idCard: '001234567891',
      gender: 'female',
      birthDate: '1992-02-02',
      position: 'barista',
      positionLabel: 'Pha chế',
      joinDate: '2023-03-20',
      salary: 8000000,
      status: 'active',
      address: {
        city: 'TP. Hồ Chí Minh',
        ward: 'Phường 1, Quận 3',
        detail: '456 Võ Văn Tần',
      },
    },
    {
      id: '3',
      staffCode: 'NV003',
      fullName: 'Lê Văn C',
      phone: '0923456789',
      idCard: '001234567892',
      gender: 'male',
      birthDate: '1994-03-03',
      position: 'cashier',
      positionLabel: 'Thu ngân',
      joinDate: '2023-05-10',
      salary: 7000000,
      status: 'active',
      address: {
        city: 'TP. Hồ Chí Minh',
        ward: 'Phường 5, Quận 5',
        detail: '789 Trần Hưng Đạo',
      },
    },
    {
      id: '4',
      staffCode: 'NV004',
      fullName: 'Phạm Thị D',
      phone: '0934567890',
      idCard: '001234567893',
      gender: 'female',
      birthDate: '1996-04-04',
      position: 'server',
      positionLabel: 'Phục vụ',
      joinDate: '2023-07-01',
      salary: 6500000,
      status: 'active',
      address: {
        city: 'TP. Hồ Chí Minh',
        ward: 'Phường Tân Phú, Quận 7',
        detail: '321 Nguyễn Văn Linh',
      },
    },
    {
      id: '5',
      staffCode: 'NV005',
      fullName: 'Hoàng Văn E',
      phone: '0945678901',
      idCard: '001234567894',
      gender: 'male',
      birthDate: '1998-05-05',
      position: 'barista',
      positionLabel: 'Pha chế',
      joinDate: '2023-02-14',
      salary: 8000000,
      status: 'inactive',
      address: {
        city: 'Hà Nội',
        ward: 'Phường Cầu Dền, Hai Bà Trưng',
        detail: '555 Bà Triệu',
      },
    },
  ]);

  const positions = [
    { value: 'manager', label: 'Quản lý' },
    { value: 'barista', label: 'Pha chế' },
    { value: 'cashier', label: 'Thu ngân' },
    { value: 'server', label: 'Phục vụ' },
  ];

  const cities = [
    'TP. Hồ Chí Minh',
    'Hà Nội',
    'Đà Nẵng',
    'Cần Thơ',
    'Hải Phòng',
    'Biên Hòa',
    'Nha Trang',
    'Huế',
    'Buôn Ma Thuột',
    'Vũng Tàu',
  ];

  // Danh sách xã/phường theo thành phố (mẫu)
  const wards: Record<string, string[]> = {
    'TP. Hồ Chí Minh': [
      'Phường Bến Nghé, Quận 1',
      'Phường Bến Thành, Quận 1',
      'Phường Nguyễn Thái Bình, Quận 1',
      'Phường 1, Quận 3',
      'Phường 2, Quận 3',
      'Phường 3, Quận 3',
      'Phường 1, Quận 5',
      'Phường 2, Quận 5',
      'Phường 5, Quận 5',
      'Phường Tân Phú, Quận 7',
      'Phường Tân Hưng, Quận 7',
      'Phường 1, Quận 10',
      'Phường 2, Quận 10',
      'Phường 10, Quận 10',
    ],
    'Hà Nội': [
      'Phường Đinh Tiên Hoàng, Hoàn Kiếm',
      'Phường Hàng Bạc, Hoàn Kiếm',
      'Phường Hàng Bồ, Hoàn Kiếm',
      'Phường Cầu Dền, Hai Bà Trưng',
      'Phường Bạch Đằng, Hai Bà Trưng',
      'Phường Nguyễn Du, Hai Bà Trưng',
      'Phường Giảng Võ, Ba Đình',
      'Phường Ngọc Hà, Ba Đình',
      'Phường Đội Cấn, Ba Đình',
    ],
    'Đà Nẵng': [
      'Phường Thanh Bình, Hải Châu',
      'Phường Thuận Phước, Hải Châu',
      'Phường Hòa Thuận Đông, Hải Châu',
      'Phường An Hải Bắc, Sơn Trà',
      'Phường An Hải Tây, Sơn Trà',
      'Phường Thọ Quang, Sơn Trà',
    ],
    'Cần Thơ': [
      'Phường An Hòa, Ninh Kiều',
      'Phường An Nghiệp, Ninh Kiều',
      'Phường An Cư, Ninh Kiều',
      'Phường Phước Thới, Ô Môn',
      'Phường Long Hưng, Ô Môn',
    ],
    'Hải Phòng': [
      'Phường Đông Khê, Ngô Quyền',
      'Phường Máy Chai, Ngô Quyền',
      'Phường Lạch Tray, Ngô Quyền',
    ],
    'Biên Hòa': [
      'Phường Trảng Dài',
      'Phường Tân Mai',
      'Phường Hố Nai',
    ],
    'Nha Trang': [
      'Phường Vĩnh Hòa',
      'Phường Vĩnh Phước',
      'Phường Phước Long',
    ],
    'Huế': [
      'Phường Phú Hội',
      'Phường Phú Nhuận',
      'Phường Vĩnh Ninh',
    ],
    'Buôn Ma Thuột': [
      'Phường Tân Lợi',
      'Phường Tân Hòa',
      'Phường Tân An',
    ],
    'Vũng Tàu': [
      'Phường 1',
      'Phường 2',
      'Phường Thắng Tam',
    ],
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  // Apply filters
  let filteredStaff = staffMembers.filter(staff => {
    const matchesSearch = 
      staff.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.staffCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.phone.includes(searchQuery) ||
      staff.idCard.includes(searchQuery);

    const matchesPosition = filterPosition === 'all' || staff.position === filterPosition;
    const matchesStatus = filterStatus === 'all' || staff.status === filterStatus;

    return matchesSearch && matchesPosition && matchesStatus;
  });

  // Apply sorting
  if (sortField) {
    filteredStaff = [...filteredStaff].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'joinDate') {
        aValue = new Date(a.joinDate).getTime();
        bValue = new Date(b.joinDate).getTime();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const resetForm = () => {
    setFormData({
      fullName: '',
      phone: '',
      idCard: '',
      position: '',
      joinDate: '',
      salary: '',
      city: '',
      ward: '',
      addressDetail: '',
      gender: 'male',
      birthDate: '',
    });
    setAccountData({
      username: '',
      password: '',
      confirmPassword: '',
      role: '',
    });
  };

  const handleSubmit = () => {
    // Validate employee info
    if (!formData.fullName || !formData.phone || !formData.idCard || !formData.position || !formData.joinDate) {
      toast.error('Vui lòng điền đầy đủ thông tin nhân viên bắt buộc');
      return;
    }

    // Validate account info if filled
    if (accountData.username || accountData.password) {
      if (!accountData.username || !accountData.password || !accountData.confirmPassword || !accountData.role) {
        toast.error('Vui lòng điền đầy đủ thông tin tài khoản hoặc bỏ trống toàn bộ');
        return;
      }

      if (accountData.password !== accountData.confirmPassword) {
        toast.error('Mật khẩu xác nhận không khớp');
        return;
      }

      if (accountData.password.length < 6) {
        toast.error('Mật khẩu phải có ít nhất 6 ký tự');
        return;
      }
    }

    const newStaff: StaffMember = {
      id: Date.now().toString(),
      staffCode: `NV${String(staffMembers.length + 1).padStart(3, '0')}`,
      fullName: formData.fullName,
      phone: formData.phone,
      idCard: formData.idCard,
      gender: formData.gender,
      birthDate: formData.birthDate,
      position: formData.position,
      positionLabel: positions.find(p => p.value === formData.position)?.label || '',
      joinDate: formData.joinDate,
      salary: Number(formData.salary) || 0,
      status: 'active',
      address: {
        city: formData.city,
        ward: formData.ward,
        detail: formData.addressDetail,
      },
    };

    setStaffMembers([...staffMembers, newStaff]);
    
    // Show success message with account info if created
    if (accountData.username) {
      toast.success(`Đã thêm nhân viên mới và tạo tài khoản "${accountData.username}" thành công`);
    } else {
      toast.success('Đã thêm nhân viên mới thành công');
    }
    
    setAddDialogOpen(false);
    resetForm();
  };

  const handleEdit = (staff: StaffMember) => {
    setEditingStaff(staff);
    setFormData({
      fullName: staff.fullName,
      phone: staff.phone,
      idCard: staff.idCard,
      position: staff.position,
      joinDate: staff.joinDate,
      salary: staff.salary.toString(),
      city: staff.address.city,
      ward: staff.address.ward,
      addressDetail: staff.address.detail,
      gender: staff.gender,
      birthDate: staff.birthDate,
    });
    // Reset account data when editing
    setAccountData({
      username: '',
      password: '',
      confirmPassword: '',
      role: '',
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!editingStaff) return;
    if (!formData.fullName || !formData.phone || !formData.idCard || !formData.position || !formData.joinDate) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    const updatedStaff = staffMembers.map(staff => 
      staff.id === editingStaff.id
        ? {
            ...staff,
            fullName: formData.fullName,
            phone: formData.phone,
            idCard: formData.idCard,
            gender: formData.gender,
            birthDate: formData.birthDate,
            position: formData.position,
            positionLabel: positions.find(p => p.value === formData.position)?.label || '',
            joinDate: formData.joinDate,
            salary: Number(formData.salary) || 0,
            address: {
              city: formData.city,
              ward: formData.ward,
              detail: formData.addressDetail,
            },
          }
        : staff
    );

    setStaffMembers(updatedStaff);
    toast.success('Đã cập nhật thông tin nhân viên');
    setEditDialogOpen(false);
    setEditingStaff(null);
    resetForm();
  };

  const handleDelete = (staff: StaffMember) => {
    if (confirm(`Bạn có chắc muốn xóa nhân viên ${staff.fullName}?`)) {
      setStaffMembers(staffMembers.filter(s => s.id !== staff.id));
      toast.success('Đã xóa nhân viên');
    }
  };

  return (
    <div className="flex h-full bg-slate-50">
      {/* Left Sidebar - Filters */}
      <div className="w-64 bg-white border-r p-6 overflow-auto">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm text-slate-700 mb-3 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Bộ lọc
            </h3>
            <div className="space-y-4">
              {/* Filter by Position */}
              <div>
                <Label className="text-xs text-slate-600 mb-2 block">Vị trí</Label>
                <Select value={filterPosition} onValueChange={(value) => setFilterPosition(value)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Chọn vị trí" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {positions.map(pos => (
                      <SelectItem key={pos.value} value={pos.value}>
                        {pos.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filter by Status */}
              <div className="pt-4 border-t">
                <Label className="text-xs text-slate-600 mb-2 block">Trạng thái</Label>
                <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="active">Đang làm việc</SelectItem>
                    <SelectItem value="inactive">Nghỉ việc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="pt-4 border-t">
            <h3 className="text-sm text-slate-700 mb-3">Thống kê</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Tổng nhân viên</span>
                <span className="text-slate-900">{staffMembers.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Đang hiển thị</span>
                <span className="text-blue-600">{filteredStaff.length}</span>
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          {(filterPosition !== 'all' || filterStatus !== 'all') && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setFilterPosition('all');
                setFilterStatus('all');
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-blue-900">Quản lý nhân viên</h1>
              <p className="text-sm text-slate-600 mt-1">
                Quản lý thông tin {filteredStaff.length} nhân viên
              </p>
            </div>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm nhân viên
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Thêm nhân viên mới</DialogTitle>
                </DialogHeader>
                
                <Tabs defaultValue="info" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="info">Thông tin nhân viên</TabsTrigger>
                    <TabsTrigger value="account">Thông tin tài khoản</TabsTrigger>
                  </TabsList>

                  <TabsContent value="info" className="mt-6">
                    <div className="space-y-6">
                      {/* Basic Information */}
                      <div>
                        <h3 className="text-sm text-slate-900 mb-3">Thông tin cơ bản</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <Label>Họ và tên <span className="text-red-500">*</span></Label>
                            <Input 
                              placeholder="VD: Nguyễn Văn A" 
                              value={formData.fullName}
                              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                              className="mt-1.5"
                            />
                          </div>
                          <div>
                            <Label>Số điện thoại <span className="text-red-500">*</span></Label>
                            <Input 
                              placeholder="VD: 0901234567" 
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              className="mt-1.5"
                            />
                          </div>
                          <div>
                            <Label>Số CCCD <span className="text-red-500">*</span></Label>
                            <Input 
                              placeholder="VD: 001234567890" 
                              value={formData.idCard}
                              onChange={(e) => setFormData({ ...formData, idCard: e.target.value })}
                              className="mt-1.5"
                            />
                          </div>
                          <div>
                            <Label>Giới tính <span className="text-red-500">*</span></Label>
                            <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                              <SelectTrigger className="mt-1.5">
                                <SelectValue placeholder="Chọn giới tính" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="male">Nam</SelectItem>
                                <SelectItem value="female">Nữ</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Ngày sinh <span className="text-red-500">*</span></Label>
                            <Input 
                              type="date" 
                              value={formData.birthDate}
                              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                              className="mt-1.5"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Work Information */}
                      <div className="border-t pt-4">
                        <h3 className="text-sm text-slate-900 mb-3">Thông tin công việc</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Vị trí <span className="text-red-500">*</span></Label>
                            <Select value={formData.position} onValueChange={(value) => setFormData({ ...formData, position: value })}>
                              <SelectTrigger className="mt-1.5">
                                <SelectValue placeholder="Chọn vị trí" />
                              </SelectTrigger>
                              <SelectContent>
                                {positions.map((pos) => (
                                  <SelectItem key={pos.value} value={pos.value}>
                                    {pos.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Ngày vào làm <span className="text-red-500">*</span></Label>
                            <Input 
                              type="date" 
                              value={formData.joinDate}
                              onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                              className="mt-1.5"
                            />
                          </div>
                          <div className="col-span-2">
                            <Label>Lương cơ bản (VNĐ) <span className="text-red-500">*</span></Label>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              value={formData.salary}
                              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                              className="mt-1.5"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Address Information */}
                      <div className="border-t pt-4">
                        <h3 className="text-sm text-slate-900 mb-3">Địa chỉ</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Thành phố <span className="text-red-500">*</span></Label>
                            <div className="mt-1.5">
                              <SimpleSearchSelect
                                value={formData.city}
                                onValueChange={(value) => setFormData({ ...formData, city: value, ward: '' })}
                                options={cities}
                                placeholder="Chọn thành phố"
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Phường/Xã <span className="text-red-500">*</span></Label>
                            <div className="mt-1.5">
                              <SimpleSearchSelect
                                value={formData.ward}
                                onValueChange={(value) => setFormData({ ...formData, ward: value })}
                                options={formData.city ? wards[formData.city] || [] : []}
                                placeholder="Chọn phường/xã"
                                disabled={!formData.city}
                              />
                            </div>
                          </div>
                          <div className="col-span-2">
                            <Label>Địa chỉ cụ thể <span className="text-red-500">*</span></Label>
                            <Input 
                              placeholder="VD: Số nhà, tên đường..." 
                              value={formData.addressDetail}
                              onChange={(e) => setFormData({ ...formData, addressDetail: e.target.value })}
                              className="mt-1.5"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="text-xs text-slate-600">
                          <span className="text-red-500">*</span> Trường bắt buộc
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="account" className="mt-6">
                    <div className="space-y-6">
                      {/* Account Information */}
                      <div>
                        <h3 className="text-sm text-slate-900 mb-3">Thông tin đăng nhập</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <Label>Tên đăng nhập</Label>
                            <Input 
                              placeholder="VD: nguyenvana" 
                              value={accountData.username}
                              onChange={(e) => setAccountData({ ...accountData, username: e.target.value })}
                              className="mt-1.5"
                            />
                          </div>
                          <div>
                            <Label>Mật khẩu</Label>
                            <Input 
                              type="password" 
                              placeholder="Tối thiểu 6 ký tự" 
                              value={accountData.password}
                              onChange={(e) => setAccountData({ ...accountData, password: e.target.value })}
                              className="mt-1.5"
                            />
                          </div>
                          <div>
                            <Label>Xác nhận mật khẩu</Label>
                            <Input 
                              type="password" 
                              placeholder="Nhập lại mật khẩu" 
                              value={accountData.confirmPassword}
                              onChange={(e) => setAccountData({ ...accountData, confirmPassword: e.target.value })}
                              className="mt-1.5"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Role Information */}
                      <div className="border-t pt-4">
                        <h3 className="text-sm text-slate-900 mb-3">Phân quyền</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Vai trò</Label>
                            <Select value={accountData.role} onValueChange={(value) => setAccountData({ ...accountData, role: value })}>
                              <SelectTrigger className="mt-1.5">
                                <SelectValue placeholder="Chọn vai trò" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="manager">Quản lý - Quản lý cửa hàng</SelectItem>
                                <SelectItem value="barista">Pha chế - Quầy pha chế</SelectItem>
                                <SelectItem value="cashier">Thu ngân - Quầy thanh toán</SelectItem>
                                <SelectItem value="server">Phục vụ - Phục vụ bàn</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <p className="text-xs text-blue-900">
                          <strong>Lưu ý:</strong> Thông tin tài khoản có thể bỏ trống. Nếu điền, vui lòng điền đầy đủ tất cả các trường.
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={handleSubmit}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm nhân viên
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm theo tên, mã nhân viên, SĐT, CCCD..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto p-6">
          <Card className="border-blue-200">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-50">
                    <TableHead 
                      className="w-24 cursor-pointer hover:bg-blue-100"
                      onClick={() => handleSort('staffCode')}
                    >
                      Mã NV{getSortIcon('staffCode')}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-blue-100"
                      onClick={() => handleSort('fullName')}
                    >
                      Tên nhân viên{getSortIcon('fullName')}
                    </TableHead>
                    <TableHead className="w-32">SĐT</TableHead>
                    <TableHead className="w-36">CCCD</TableHead>
                    <TableHead 
                      className="w-32 cursor-pointer hover:bg-blue-100"
                      onClick={() => handleSort('joinDate')}
                    >
                      Ngày vào làm{getSortIcon('joinDate')}
                    </TableHead>
                    <TableHead 
                      className="w-28 cursor-pointer hover:bg-blue-100"
                      onClick={() => handleSort('position')}
                    >
                      Vị trí{getSortIcon('position')}
                    </TableHead>
                    <TableHead className="w-28">Trạng thái</TableHead>
                    <TableHead className="w-24 text-center">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-slate-500 py-8">
                        Không tìm thấy nhân viên nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStaff.map((staff) => (
                      <TableRow key={staff.id} className="hover:bg-blue-50/50">
                        <TableCell className="text-blue-600">{staff.staffCode}</TableCell>
                        <TableCell>{staff.fullName}</TableCell>
                        <TableCell>{staff.phone}</TableCell>
                        <TableCell>{staff.idCard}</TableCell>
                        <TableCell>
                          {new Date(staff.joinDate).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={
                              staff.position === 'manager' ? 'border-purple-300 text-purple-700' :
                              staff.position === 'barista' ? 'border-blue-300 text-blue-700' :
                              staff.position === 'cashier' ? 'border-cyan-300 text-cyan-700' :
                              'border-emerald-300 text-emerald-700'
                            }
                          >
                            {staff.positionLabel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {staff.status === 'active' ? (
                            <Badge className="bg-emerald-500">Đang làm</Badge>
                          ) : (
                            <Badge variant="secondary">Nghỉ việc</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 justify-center">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleEdit(staff)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(staff)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog - Same form as Add but for editing */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin nhân viên</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">Thông tin nhân viên</TabsTrigger>
              <TabsTrigger value="account">Thông tin tài khoản</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-6">
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-sm text-slate-900 mb-3">Thông tin cơ bản</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label>Họ và tên <span className="text-red-500">*</span></Label>
                      <Input 
                        placeholder="VD: Nguyễn Văn A" 
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label>Số điện thoại <span className="text-red-500">*</span></Label>
                      <Input 
                        placeholder="VD: 0901234567" 
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label>Số CCCD <span className="text-red-500">*</span></Label>
                      <Input 
                        placeholder="VD: 001234567890" 
                        value={formData.idCard}
                        onChange={(e) => setFormData({ ...formData, idCard: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label>Giới tính <span className="text-red-500">*</span></Label>
                      <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Chọn giới tính" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Nam</SelectItem>
                          <SelectItem value="female">Nữ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Ngày sinh <span className="text-red-500">*</span></Label>
                      <Input 
                        type="date" 
                        value={formData.birthDate}
                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </div>

                {/* Work Information */}
                <div className="border-t pt-4">
                  <h3 className="text-sm text-slate-900 mb-3">Thông tin công việc</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Vị trí <span className="text-red-500">*</span></Label>
                      <Select value={formData.position} onValueChange={(value) => setFormData({ ...formData, position: value })}>
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Chọn vị trí" />
                        </SelectTrigger>
                        <SelectContent>
                          {positions.map((pos) => (
                            <SelectItem key={pos.value} value={pos.value}>
                              {pos.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Ngày vào làm <span className="text-red-500">*</span></Label>
                      <Input 
                        type="date" 
                        value={formData.joinDate}
                        onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Lương cơ bản (VNĐ) <span className="text-red-500">*</span></Label>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        value={formData.salary}
                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="border-t pt-4">
                  <h3 className="text-sm text-slate-900 mb-3">Địa chỉ</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Thành phố <span className="text-red-500">*</span></Label>
                      <div className="mt-1.5">
                        <SimpleSearchSelect
                          value={formData.city}
                          onValueChange={(value) => setFormData({ ...formData, city: value, ward: '' })}
                          options={cities}
                          placeholder="Chọn thành phố"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Phường/Xã <span className="text-red-500">*</span></Label>
                      <div className="mt-1.5">
                        <SimpleSearchSelect
                          value={formData.ward}
                          onValueChange={(value) => setFormData({ ...formData, ward: value })}
                          options={formData.city ? wards[formData.city] || [] : []}
                          placeholder="Chọn phường/xã"
                          disabled={!formData.city}
                        />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <Label>Địa chỉ cụ thể <span className="text-red-500">*</span></Label>
                      <Input 
                        placeholder="VD: Số nhà, tên đường..." 
                        value={formData.addressDetail}
                        onChange={(e) => setFormData({ ...formData, addressDetail: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-600">
                    <span className="text-red-500">*</span> Trường bắt buộc
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="account" className="mt-6">
              <div className="space-y-6">
                {/* Account Information */}
                <div>
                  <h3 className="text-sm text-slate-900 mb-3">Thông tin đăng nhập</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label>Tên đăng nhập</Label>
                      <Input 
                        placeholder="VD: nguyenvana" 
                        value={accountData.username}
                        onChange={(e) => setAccountData({ ...accountData, username: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label>Mật khẩu mới</Label>
                      <Input 
                        type="password" 
                        placeholder="Tối thiểu 6 ký tự" 
                        value={accountData.password}
                        onChange={(e) => setAccountData({ ...accountData, password: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label>Xác nhận mật khẩu</Label>
                      <Input 
                        type="password" 
                        placeholder="Nhập lại mật khẩu" 
                        value={accountData.confirmPassword}
                        onChange={(e) => setAccountData({ ...accountData, confirmPassword: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </div>

                {/* Role Information */}
                <div className="border-t pt-4">
                  <h3 className="text-sm text-slate-900 mb-3">Phân quyền</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Vai trò</Label>
                      <Select value={accountData.role} onValueChange={(value) => setAccountData({ ...accountData, role: value })}>
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Chọn vai trò" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manager">Quản lý - Quản lý cửa hàng</SelectItem>
                          <SelectItem value="barista">Pha chế - Quầy pha chế</SelectItem>
                          <SelectItem value="cashier">Thu ngân - Quầy thanh toán</SelectItem>
                          <SelectItem value="server">Phục vụ - Phục vụ bàn</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-900">
                    <strong>Lưu ý:</strong> Thông tin tài khoản có thể bỏ trống. Nếu điền, vui lòng điền đầy đủ tất cả các trường. Nếu không đổi mật khẩu, để trống các trường mật khẩu.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleUpdate}
            >
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}