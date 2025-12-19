import { useState } from "react";
import * as React from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Filter,
  X,
  ArrowUpDown,
  Info,
  Power,
  PowerOff,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "../ui/dialog";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Switch } from "../ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverAnchor,
} from "../ui/popover";
import { useAuth } from "../../contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { toast } from "sonner";
import { SimpleSearchSelect } from "../SimpleSearchSelect";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { StaffMember, staffMembers as initialStaffMembers } from "../../data/staffData";
import { initialAccounts } from "../../data/accountData";
import { initialRoles } from "../../data/roleData";

type SortField = "staffCode" | "fullName" | "joinDate" | "position" | null;
type SortOrder = "asc" | "desc" | "none";

const PasswordInput = ({
  value,
  onChange,
  placeholder = "********",
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2 pr-10"
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-500 hover:text-slate-700"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

export interface StaffProps {
  staffList?: StaffMember[];
  setStaffList?: (staff: StaffMember[]) => void;
}

export function Staff({
  staffList: propsStaffList,
  setStaffList: setPropsStaffList
}: StaffProps = {}) {
  const { canCreate, canUpdate, canDelete } = useAuth();
  const [activeTab, setActiveTab] = useState("staff-list");
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDetailDialogOpen, setViewDetailDialogOpen] = useState(false);
  const [filterPosition, setFilterPosition] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [viewingStaff, setViewingStaff] = useState<StaffMember | null>(null);
  const [detailTab, setDetailTab] = useState("info");

  // State for coefficient input popover
  const [coeffPopover, setCoeffPopover] = useState<{
    open: boolean;
    type: "shift" | "overtime";
    shiftId?: string;
    field: string;
    value: string;
  } | null>(null);

  // Form state for adding new staff
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    idCard: "",
    position: "",
    joinDate: "",
    salary: "",
    city: "",
    ward: "",
    addressDetail: "",
    gender: "male",
    birthDate: "",
  });

  // Account info state
  // Account info state
  // const [accountData, setAccountData] = useState({ ... }); // Removed as we only link existing accounts
  const [selectedAccountId, setSelectedAccountId] = useState("");

  // Salary settings state
  const [salarySettings, setSalarySettings] = useState({
    salaryType: "shift", // 'shift' or 'fixed'
    salaryAmount: "",
    advancedSetup: false,
    overtimeEnabled: false,
    shifts: [
      {
        id: "default",
        name: "Mặc định",
        salaryPerShift: "0",
        saturdayCoeff: "100%",
        sundayCoeff: "100%",
        dayOffCoeff: "100%",
        holidayCoeff: "100%",
      },
    ],
    overtimeCoeffs: {
      weekday: "50%",
      saturday: "100%",
      sunday: "100%",
      dayOff: "100%",
      holiday: "100%",
    },
  });

  const [accountForm, setAccountForm] = useState({ username: "", password: "" });

  const [localStaffMembers, setLocalStaffMembers] = useState<StaffMember[]>(initialStaffMembers);
  const staffMembers = propsStaffList || localStaffMembers;
  const setStaffMembers = setPropsStaffList || setLocalStaffMembers;

  const positions = [
    { value: "manager", label: "Quản lý" },
    { value: "barista", label: "Pha chế" },
    { value: "cashier", label: "Thu ngân" },
    { value: "server", label: "Phục vụ" },
  ];

  // Danh sách ca làm việc
  const shiftTypes = [
    { value: "Ca sáng", label: "Ca sáng" },
    { value: "Ca chiều", label: "Ca chiều" },
    { value: "Ca tối", label: "Ca tối" },
    { value: "Ca đêm", label: "Ca đêm" },
  ];

  const cities = [
    "TP. Hồ Chí Minh",
    "Hà Nội",
    "Đà Nẵng",
    "Cần Thơ",
    "Hải Phòng",
    "Biên Hòa",
    "Nha Trang",
    "Huế",
    "Buôn Ma Thuột",
    "Vũng Tàu",
  ];

  // Danh sách xã/phường theo thành phố (mẫu)
  const wards: Record<string, string[]> = {
    "TP. Hồ Chí Minh": [
      "Phường Bến Nghé, Quận 1",
      "Phường Bến Thành, Quận 1",
      "Phường Nguyễn Thái Bình, Quận 1",
      "Phường 1, Quận 3",
      "Phường 2, Quận 3",
      "Phường 3, Quận 3",
      "Phường 1, Quận 5",
      "Phường 2, Quận 5",
      "Phường 5, Quận 5",
      "Phường Tân Phú, Quận 7",
      "Phường Tân Hưng, Quận 7",
      "Phường 1, Quận 10",
      "Phường 2, Quận 10",
      "Phường 10, Quận 10",
    ],
    "Hà Nội": [
      "Phường Đinh Tiên Hoàng, Hoàn Kiếm",
      "Phường Hàng Bạc, Hoàn Kiếm",
      "Phường Hàng Bồ, Hoàn Kiếm",
      "Phường Cầu Dền, Hai Bà Trưng",
      "Phường Bạch Đằng, Hai Bà Trưng",
      "Phường Nguyễn Du, Hai Bà Trưng",
      "Phường Giảng Võ, Ba Đình",
      "Phường Ngọc Hà, Ba Đình",
      "Phường Đội Cấn, Ba Đình",
    ],
    "Đà Nẵng": [
      "Phường Thanh Bình, Hải Châu",
      "Phường Thuận Phước, Hải Châu",
      "Phường Hòa Thuận Đông, Hải Châu",
      "Phường An Hải Bắc, Sơn Trà",
      "Phường An Hải Tây, Sơn Trà",
      "Phường Thọ Quang, Sơn Trà",
    ],
    "Cần Thơ": [
      "Phường An Hòa, Ninh Kiều",
      "Phường An Nghiệp, Ninh Kiều",
      "Phường An Cư, Ninh Kiều",
      "Phường Phước Thới, Ô Môn",
      "Phường Long Hưng, Ô Môn",
    ],
    "Hải Phòng": [
      "Phường Đông Khê, Ngô Quyền",
      "Phường Máy Chai, Ngô Quyền",
      "Phường Lạch Tray, Ngô Quyền",
    ],
    "Biên Hòa": ["Phường Trảng Dài", "Phường Tân Mai", "Phường Hố Nai"],
    "Nha Trang": ["Phường Vĩnh Hòa", "Phường Vĩnh Phước", "Phường Phước Long"],
    Huế: ["Phường Phú Hội", "Phường Phú Nhuận", "Phường Vĩnh Ninh"],
    "Buôn Ma Thuột": ["Phường Tân Lợi", "Phường Tân Hòa", "Phường Tân An"],
    "Vũng Tàu": ["Phường 1", "Phường 2", "Phường Thắng Tam"],
  };

  // Format number with VNĐ comma separator
  const formatVNCurrency = (value: string | number): string => {
    const numValue =
      typeof value === "string" ? value.replace(/,/g, "") : value.toString();
    if (!numValue || numValue === "0") return "";
    return numValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Parse formatted currency to number
  const parseVNCurrency = (value: string): string => {
    return value.replace(/,/g, "");
  };

  // Helper component for coefficient input with popover
  const CoefficientInput = React.memo(
    ({
      value,
      onChange,
      placeholder = "100%",
    }: {
      value: string;
      onChange: (value: string) => void;
      placeholder?: string;
    }) => {
      const [open, setOpen] = useState(false);
      const isPercent = value.includes("%");
      const [type, setType] = useState<"percent" | "currency">(
        isPercent ? "percent" : "currency"
      );
      const [tempValue, setTempValue] = useState(
        isPercent ? value.replace("%", "") : value
      );

      // Update tempValue when value changes
      React.useEffect(() => {
        const isPct = value.includes("%");
        setType(isPct ? "percent" : "currency");
        setTempValue(isPct ? value.replace("%", "") : value);
      }, [value]);

      return (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="w-full text-left"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const isPct = value.includes("%");
                setType(isPct ? "percent" : "currency");
                setTempValue(isPct ? value.replace("%", "") : value);
                setOpen(true);
              }}
            >
              <Input
                type="text"
                value={
                  value.includes("%") ? value : formatVNCurrency(value)
                }
                readOnly
                placeholder={placeholder}
                className="h-8 cursor-pointer pointer-events-none bg-white border-slate-300 shadow-none"
              />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-56 p-2"
            align="start"
            side="bottom"
            sideOffset={4}
            onOpenAutoFocus={(e) => {
              e.preventDefault();
            }}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Input
                  type="text"
                  value={
                    type === "currency"
                      ? formatVNCurrency(tempValue)
                      : tempValue
                  }
                  onChange={(e) => {
                    const rawVal =
                      type === "currency"
                        ? parseVNCurrency(e.target.value)
                        : e.target.value;

                    if (
                      rawVal === "" ||
                      /^\d+$/.test(rawVal) ||
                      (type === "percent" && /^\d+\.\d+$/.test(rawVal))
                    ) {
                      setTempValue(rawVal);
                    }
                  }}
                  placeholder={type === "percent" ? "100" : "0"}
                  className="flex-1 h-8 text-sm bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onChange(
                        type === "percent" && tempValue
                          ? `${tempValue}%`
                          : tempValue
                      );
                      setOpen(false);
                    } else if (e.key === "Escape") {
                      setOpen(false);
                    }
                  }}
                />
                <Button
                  variant={type === "percent" ? "default" : "outline"}
                  size="sm"
                  className={`h-8 px-2 min-w-[3rem] ${type === "percent"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "text-slate-600"
                    }`}
                  onClick={() => setType("percent")}
                >
                  %
                </Button>
                <Button
                  variant={type === "currency" ? "default" : "outline"}
                  size="sm"
                  className={`h-8 px-2 min-w-[3rem] ${type === "currency"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "text-slate-600"
                    }`}
                  onClick={() => setType("currency")}
                >
                  VNĐ
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-7 text-xs"
                  onClick={() => setOpen(false)}
                >
                  Bỏ qua
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1 h-7 text-xs bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    onChange(
                      type === "percent" && tempValue
                        ? `${tempValue}%`
                        : tempValue
                    );
                    setOpen(false);
                  }}
                >
                  Xong
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      );
    }
  );

  // Apply filters
  let filteredStaff = staffMembers.filter((staff) => {
    const matchesSearch =
      staff.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.staffCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.phone.includes(searchQuery) ||
      staff.idCard.includes(searchQuery);

    const matchesPosition =
      filterPosition === "all" || staff.position === filterPosition;
    const matchesStatus =
      filterStatus === "all" || staff.status === filterStatus;

    return matchesSearch && matchesPosition && matchesStatus;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> none -> asc
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else if (sortOrder === "desc") {
        setSortOrder("none");
        setSortField(null);
      } else {
        setSortField(field);
        setSortOrder("asc");
      }
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field || sortOrder === "none") {
      return null;
    }
    if (sortOrder === "asc") {
      return <ArrowUp className="w-4 h-4 ml-1 inline text-blue-600" />;
    }
    return <ArrowDown className="w-4 h-4 ml-1 inline text-blue-600" />;
  };

  // Apply sorting
  if (sortField && sortOrder !== "none") {
    filteredStaff = [...filteredStaff].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === "joinDate") {
        aValue = new Date(a.joinDate).getTime();
        bValue = new Date(b.joinDate).getTime();
      } else if (sortField === "position") {
        aValue = a.positionLabel;
        bValue = b.positionLabel;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        const comparison = aValue.localeCompare(bValue, "vi");
        return sortOrder === "asc" ? comparison : -comparison;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }

  const resetForm = () => {
    setFormData({
      fullName: "",
      phone: "",
      idCard: "",
      position: "",
      joinDate: "",
      salary: "",
      city: "",
      ward: "",
      addressDetail: "",
      gender: "male",
      birthDate: "",
    });
    setSelectedAccountId("");
    setSalarySettings({
      salaryType: "shift",
      salaryAmount: "",
      advancedSetup: false,
      overtimeEnabled: false,
      shifts: [
        {
          id: "default",
          name: "Mặc định",
          salaryPerShift: "0",
          saturdayCoeff: "100%",
          sundayCoeff: "100%",
          dayOffCoeff: "100%",
          holidayCoeff: "100%",
        },
      ],
      overtimeCoeffs: {
        weekday: "50%",
        saturday: "100%",
        sunday: "100%",
        dayOff: "100%",
        holiday: "100%",
      },
    });
  };

  const handleSubmit = () => {
    // Validate employee info
    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.idCard ||
      !formData.position ||
      !formData.joinDate ||
      !formData.birthDate ||
      !formData.gender ||
      !formData.city ||
      !formData.ward ||
      !formData.addressDetail
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin nhân viên bắt buộc");
      return;
    }

    // Validate salary settings
    if (!salarySettings.salaryAmount) {
      toast.error("Vui lòng nhập mức lương");
      return;
    }

    // Validate account info
    if (!selectedAccountId) {
      toast.error("Vui lòng chọn tài khoản để liên kết");
      return;
    }

    // Calculate salary from settings
    let calculatedSalary = 0;
    const salaryAmountNum =
      Number(parseVNCurrency(salarySettings.salaryAmount)) || 0;
    if (salarySettings.salaryType === "fixed") {
      calculatedSalary = salaryAmountNum;
    } else {
      // For shift-based, use the default shift salary or the main salary amount
      const defaultShift = salarySettings.shifts.find(
        (s) => s.id === "default"
      );
      const shiftSalary = defaultShift
        ? Number(parseVNCurrency(defaultShift.salaryPerShift)) || 0
        : 0;
      calculatedSalary = shiftSalary || salaryAmountNum;
    }

    const newStaff: StaffMember = {
      id: Date.now().toString(),
      staffCode: `NV${String(staffMembers.length + 1).padStart(3, "0")}`,
      fullName: formData.fullName,
      phone: formData.phone,
      idCard: formData.idCard,
      gender: formData.gender as "male" | "female",
      birthDate: formData.birthDate,
      position: formData.position,
      positionLabel:
        positions.find((p) => p.value === formData.position)?.label || "",
      joinDate: formData.joinDate,
      salary: calculatedSalary,
      status: "active",
      address: {
        city: formData.city,
        ward: formData.ward,
        detail: formData.addressDetail,
      },
      salarySettings: {
        ...salarySettings,
        salaryType: salarySettings.salaryType as "shift" | "fixed",
      },
      accountId: selectedAccountId,
      account: { username: initialAccounts.find(a => a.id === selectedAccountId)?.username || "" },
    };

    setStaffMembers([...staffMembers, newStaff]);

    // Show success message with account info if created
    setStaffMembers([...staffMembers, newStaff]);

    const linkAcc = initialAccounts.find(a => a.id === selectedAccountId);
    toast.success(
      `Đã thêm nhân viên mới và liên kết tài khoản "${linkAcc?.username || ''}" thành công`
    );

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
    // Load salary settings if available, otherwise use defaults
    if (staff.salarySettings) {
      setSalarySettings(staff.salarySettings);
    } else {
      // Set default salary settings based on current salary
      setSalarySettings({
        salaryType: "shift",
        salaryAmount: formatVNCurrency(staff.salary),
        advancedSetup: false,
        overtimeEnabled: false,
        shifts: [
          {
            id: "default",
            name: "Mặc định",
            salaryPerShift: formatVNCurrency(staff.salary),
            saturdayCoeff: "100%",
            sundayCoeff: "100%",
            dayOffCoeff: "100%",
            holidayCoeff: "100%",
          },
        ],
        overtimeCoeffs: {
          weekday: "50%",
          saturday: "100%",
          sunday: "100%",
          dayOff: "100%",
          holiday: "100%",
        },
      });
    }
    // Reset account data when editing
    // Reset account data when editing
    if (staff.accountId) {
      setSelectedAccountId(staff.accountId);
      const acc = initialAccounts.find(a => a.id === staff.accountId);
      setAccountForm({
        username: acc?.username || "",
        password: ""
      });
    } else {
      setSelectedAccountId("");
      setAccountForm({ username: "", password: "" });
    }
    setEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!editingStaff) return;
    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.idCard ||
      !formData.position ||
      !formData.joinDate
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    // Account validation if needed
    if (!selectedAccountId) {
      // Optional: or make it mandatory? Assuming mandatory based on context "chỗ này là chọn tài khoản..."
      toast.error("Vui lòng chọn tài khoản liên kết");
      return;
    }

    const updatedStaff = staffMembers.map((staff) => {
      if (staff.id === editingStaff.id) {
        // Construct new account object if not linking
        const linkedAccount = initialAccounts.find(a => a.id === selectedAccountId);

        return {
          ...staff,
          fullName: formData.fullName,
          phone: formData.phone,
          idCard: formData.idCard,
          gender: formData.gender as "male" | "female",
          birthDate: formData.birthDate,
          position: formData.position,
          positionLabel:
            positions.find((p) => p.value === formData.position)?.label || "",
          joinDate: formData.joinDate,
          salary: Number(formData.salary) || 0,
          address: {
            city: formData.city,
            ward: formData.ward,
            detail: formData.addressDetail,
          },
          salarySettings: {
            ...salarySettings,
            salaryType: salarySettings.salaryType as 'shift' | 'fixed',
          },
          accountId: selectedAccountId,
          account: linkedAccount ? { username: accountForm.username || linkedAccount.username } : undefined,
        };
      }
      return staff;
    });

    setStaffMembers(updatedStaff);
    toast.success("Đã cập nhật thông tin nhân viên");
    setEditDialogOpen(false);
    setEditingStaff(null);
    resetForm();
  };

  const handleDelete = (staff: StaffMember) => {
    if (confirm(`Bạn có chắc muốn xóa nhân viên ${staff.fullName}?`)) {
      setStaffMembers(staffMembers.filter((s) => s.id !== staff.id));
      toast.success("Đã xóa nhân viên");
    }
  };

  const handleToggleStatus = (id: string) => {
    setStaffMembers(
      staffMembers.map((staff) =>
        staff.id === id
          ? {
            ...staff,
            status: staff.status === "active" ? "inactive" : "active",
          }
          : staff
      )
    );
    toast.success(
      staffMembers.find((s) => s.id === id)?.status === "active"
        ? "Đã vô hiệu hóa nhân viên"
        : "Đã kích hoạt nhân viên"
    );
  };

  return (
    <div className="flex h-full bg-slate-50">
      {/* Left Sidebar - Filters Removed */}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b p-6 pb-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-blue-900 text-2xl font-semibold">Quản lý nhân viên</h1>
              <p className="text-sm text-slate-600 mt-1">
                Quản lý thông tin và thiết lập nhân viên
              </p>
            </div>
            {canCreate('staff') && (
              <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm nhân viên
                  </Button>
                </DialogTrigger>
                <DialogContent
                  className="max-w-4xl max-h-[90vh] overflow-y-auto"
                  style={{ maxWidth: "60rem" }}
                >
                  <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">Thêm nhân viên mới</DialogTitle>
                  </DialogHeader>

                  <Tabs defaultValue="info" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="info">Thông tin</TabsTrigger>
                      <TabsTrigger value="salary">Thiết lập lương</TabsTrigger>
                      <TabsTrigger value="account">
                        Thông tin tài khoản
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="info" className="mt-6">
                      <div className="space-y-6">
                        {/* Basic Information */}
                        <div>
                          <h3 className="text-sm font-medium text-slate-900 mb-4">
                            Thông tin cơ bản
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                              <Label>
                                Họ và tên <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                placeholder="VD: Nguyễn Văn A"
                                value={formData.fullName}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    fullName: e.target.value,
                                  })
                                }
                                className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                              />
                            </div>
                            <div>
                              <Label>
                                Số điện thoại{" "}
                                <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                placeholder="VD: 0901234567"
                                value={formData.phone}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,

                                    phone: e.target.value,
                                  })
                                }
                                className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                              />
                            </div>
                            <div>
                              <Label>
                                Số CCCD <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                placeholder="VD: 001234567890"
                                value={formData.idCard}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    idCard: e.target.value,
                                  })
                                }
                                className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                              />
                            </div>
                            <div>
                              <Label>
                                Giới tính <span className="text-red-500">*</span>
                              </Label>
                              <Select
                                value={formData.gender}
                                onValueChange={(value) =>
                                  setFormData({ ...formData, gender: value })
                                }
                              >
                                <SelectTrigger className="mt-1.5 bg-white border-slate-300 shadow-none">
                                  <SelectValue placeholder="Chọn giới tính" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="male">Nam</SelectItem>
                                  <SelectItem value="female">Nữ</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>
                                Ngày sinh <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                type="date"
                                value={formData.birthDate}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    birthDate: e.target.value,
                                  })
                                }
                                className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Work Information */}
                        <div className="border-t pt-6">
                          <h3 className="text-sm font-medium text-slate-900 mb-4">
                            Thông tin công việc
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>
                                Vị trí <span className="text-red-500">*</span>
                              </Label>
                              <Select
                                value={formData.position}
                                onValueChange={(value) =>
                                  setFormData({ ...formData, position: value })
                                }
                              >
                                <SelectTrigger className="mt-1.5 bg-white border-slate-300 shadow-none">
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
                              <Label>
                                Ngày vào làm{" "}
                                <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                type="date"
                                value={formData.joinDate}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    joinDate: e.target.value,
                                  })
                                }
                                className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Address Information */}
                        <div className="border-t pt-6">
                          <h3 className="text-sm font-medium text-slate-900 mb-4">
                            Địa chỉ
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>
                                Thành phố <span className="text-red-500">*</span>
                              </Label>
                              <div className="mt-1.5">
                                <SimpleSearchSelect
                                  value={formData.city}
                                  onValueChange={(value) =>
                                    setFormData({
                                      ...formData,
                                      city: value,
                                      ward: "",
                                    })
                                  }
                                  options={cities}
                                  placeholder="Chọn thành phố"
                                />
                              </div>
                            </div>
                            <div>
                              <Label>
                                Phường/Xã <span className="text-red-500">*</span>
                              </Label>
                              <div className="mt-1.5">
                                <SimpleSearchSelect
                                  value={formData.ward}
                                  onValueChange={(value) =>
                                    setFormData({ ...formData, ward: value })
                                  }
                                  options={
                                    formData.city
                                      ? wards[formData.city] || []
                                      : []
                                  }
                                  placeholder="Chọn phường/xã"
                                  disabled={!formData.city}
                                />
                              </div>
                            </div>
                            <div className="col-span-2">
                              <Label>
                                Địa chỉ cụ thể{" "}
                                <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                placeholder="VD: Số nhà, tên đường..."
                                value={formData.addressDetail}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    addressDetail: e.target.value,
                                  })
                                }
                                className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="salary" className="mt-6">
                      <div className="space-y-6">
                        {/* Main Salary Section */}
                        <div>
                          <h3 className="text-sm font-medium text-slate-900 mb-4">
                            Lương chính
                          </h3>
                          <div className="space-y-0 border-t border-l border-r rounded-lg">
                            {/* Loại lương */}
                            <div className="flex items-center px-4 py-3 border-b">
                              <div className="flex items-center">
                                <Label className="text-sm font-normal">
                                  Loại lương{" "}
                                  <span className="text-red-500">*</span>
                                </Label>
                                <div className="px-4">
                                  <Select
                                    value={salarySettings.salaryType}
                                    onValueChange={(value: "shift" | "fixed") => {
                                      setSalarySettings({
                                        ...salarySettings,
                                        salaryType: value,
                                        advancedSetup:
                                          value === "fixed"
                                            ? false
                                            : salarySettings.advancedSetup,
                                      });
                                    }}
                                  >
                                    <SelectTrigger className="w-64 bg-white border-slate-300 shadow-none">
                                      <SelectValue placeholder="Chọn loại lương" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="shift">
                                        Theo ca làm việc
                                      </SelectItem>
                                      <SelectItem value="fixed">
                                        Lương cố định
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>

                            {/* Mức lương và Thiết lập nâng cao */}
                            <div className="flex items-center justify-between px-4 py-3 border-b">
                              {/* Div 1: Mức lương */}
                              <div className="flex items-center">
                                <Label className="text-sm font-normal">
                                  Mức lương{" "}
                                  <span className="text-red-500">*</span>
                                </Label>
                                {salarySettings.salaryType === "fixed" ||
                                  (salarySettings.salaryType === "shift" &&
                                    !salarySettings.advancedSetup) ? (
                                  <div className="ml-5 flex items-center gap-2 px-4">
                                    <Input
                                      type="text"
                                      placeholder="0"
                                      value={formatVNCurrency(
                                        salarySettings.salaryAmount
                                      )}
                                      onChange={(e) => {
                                        const rawValue = parseVNCurrency(
                                          e.target.value
                                        );
                                        if (
                                          rawValue === "" ||
                                          /^\d+$/.test(rawValue)
                                        ) {
                                          setSalarySettings({
                                            ...salarySettings,
                                            salaryAmount: rawValue,
                                          });
                                        }
                                      }}
                                      className="w-48 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                                    />
                                    <span className="text-sm text-slate-600 whitespace-nowrap">
                                      {salarySettings.salaryType === "shift"
                                        ? "/ ca"
                                        : "/ kỳ lương"}
                                    </span>
                                  </div>
                                ) : null}
                              </div>

                              {/* Div 2: Thiết lập nâng cao */}
                              {salarySettings.salaryType === "shift" && (
                                <div className="flex items-center gap-3">
                                  <Label className="text-sm font-normal">
                                    Thiết lập nâng cao
                                  </Label>
                                  <Switch
                                    checked={salarySettings.advancedSetup}
                                    onCheckedChange={(checked) => {
                                      // Sync giá trị từ mức lương vào cell lương/ca khi mở thiết lập nâng cao
                                      if (
                                        checked &&
                                        salarySettings.salaryAmount
                                      ) {
                                        const defaultShift =
                                          salarySettings.shifts.find(
                                            (s) => s.id === "default"
                                          );
                                        if (defaultShift) {
                                          const updatedShifts =
                                            salarySettings.shifts.map((s) =>
                                              s.id === "default"
                                                ? {
                                                  ...s,
                                                  salaryPerShift:
                                                    salarySettings.salaryAmount,
                                                }
                                                : s
                                            );
                                          setSalarySettings({
                                            ...salarySettings,
                                            advancedSetup: checked,
                                            shifts: updatedShifts,
                                          });
                                        } else {
                                          setSalarySettings({
                                            ...salarySettings,
                                            advancedSetup: checked,
                                          });
                                        }
                                      } else {
                                        setSalarySettings({
                                          ...salarySettings,
                                          advancedSetup: checked,
                                        });
                                      }
                                    }}
                                  />
                                </div>
                              )}
                            </div>

                            {salarySettings.salaryType === "shift" &&
                              salarySettings.advancedSetup && (
                                <div className="border-b rounded-b-lg overflow-hidden">
                                  <div className="overflow-x-auto">
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead className="w-40">
                                            Ca
                                          </TableHead>
                                          <TableHead className="w-40">
                                            Lương/ca
                                          </TableHead>
                                          <TableHead className="w-32">
                                            Thứ 7
                                          </TableHead>
                                          <TableHead className="w-32">
                                            Chủ nhật
                                          </TableHead>
                                          <TableHead className="w-32">
                                            Ngày nghỉ
                                          </TableHead>
                                          <TableHead className="w-32">
                                            Ngày lễ tết
                                          </TableHead>
                                          <TableHead className="w-16"></TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {salarySettings.shifts.map((shift) => (
                                          <TableRow key={shift.id}>
                                            <TableCell className="font-medium">
                                              {shift.id === "default" ? (
                                                shift.name
                                              ) : (
                                                <Select
                                                  value={shift.name}
                                                  onValueChange={(value) => {
                                                    const updatedShifts =
                                                      salarySettings.shifts.map(
                                                        (s) =>
                                                          s.id === shift.id
                                                            ? {
                                                              ...s,
                                                              name: value,
                                                            }
                                                            : s
                                                      );
                                                    setSalarySettings({
                                                      ...salarySettings,
                                                      shifts: updatedShifts,
                                                    });
                                                  }}
                                                >
                                                  <SelectTrigger className="h-8 bg-white border-slate-300 shadow-none">
                                                    <SelectValue />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    {shiftTypes.map((st) => (
                                                      <SelectItem
                                                        key={st.value}
                                                        value={st.value}
                                                      >
                                                        {st.label}
                                                      </SelectItem>
                                                    ))}
                                                  </SelectContent>
                                                </Select>
                                              )}
                                            </TableCell>
                                            <TableCell>
                                              <Input
                                                type="text"
                                                value={formatVNCurrency(
                                                  shift.salaryPerShift
                                                )}
                                                onChange={(e) => {
                                                  const rawValue =
                                                    parseVNCurrency(
                                                      e.target.value
                                                    );
                                                  if (
                                                    rawValue === "" ||
                                                    /^\d+$/.test(rawValue)
                                                  ) {
                                                    const updatedShifts =
                                                      salarySettings.shifts.map(
                                                        (s) =>
                                                          s.id === shift.id
                                                            ? {
                                                              ...s,
                                                              salaryPerShift:
                                                                rawValue,
                                                            }
                                                            : s
                                                      );
                                                    setSalarySettings({
                                                      ...salarySettings,
                                                      shifts: updatedShifts,
                                                    });
                                                  }
                                                }}
                                                className="h-8 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                                              />
                                            </TableCell>
                                            <TableCell>
                                              <CoefficientInput
                                                value={shift.saturdayCoeff}
                                                onChange={(value) => {
                                                  const updatedShifts =
                                                    salarySettings.shifts.map(
                                                      (s) =>
                                                        s.id === shift.id
                                                          ? {
                                                            ...s,
                                                            saturdayCoeff:
                                                              value,
                                                          }
                                                          : s
                                                    );
                                                  setSalarySettings({
                                                    ...salarySettings,
                                                    shifts: updatedShifts,
                                                  });
                                                }}
                                                placeholder="100%"
                                              />
                                            </TableCell>
                                            <TableCell>
                                              <CoefficientInput
                                                value={shift.sundayCoeff}
                                                onChange={(value) => {
                                                  const updatedShifts =
                                                    salarySettings.shifts.map(
                                                      (s) =>
                                                        s.id === shift.id
                                                          ? {
                                                            ...s,
                                                            sundayCoeff: value,
                                                          }
                                                          : s
                                                    );
                                                  setSalarySettings({
                                                    ...salarySettings,
                                                    shifts: updatedShifts,
                                                  });
                                                }}
                                                placeholder="100%"
                                              />
                                            </TableCell>
                                            <TableCell>
                                              <CoefficientInput
                                                value={shift.dayOffCoeff}
                                                onChange={(value) => {
                                                  const updatedShifts =
                                                    salarySettings.shifts.map(
                                                      (s) =>
                                                        s.id === shift.id
                                                          ? {
                                                            ...s,
                                                            dayOffCoeff: value,
                                                          }
                                                          : s
                                                    );
                                                  setSalarySettings({
                                                    ...salarySettings,
                                                    shifts: updatedShifts,
                                                  });
                                                }}
                                                placeholder="100%"
                                              />
                                            </TableCell>
                                            <TableCell>
                                              <CoefficientInput
                                                value={shift.holidayCoeff}
                                                onChange={(value) => {
                                                  const updatedShifts =
                                                    salarySettings.shifts.map(
                                                      (s) =>
                                                        s.id === shift.id
                                                          ? {
                                                            ...s,
                                                            holidayCoeff: value,
                                                          }
                                                          : s
                                                    );
                                                  setSalarySettings({
                                                    ...salarySettings,
                                                    shifts: updatedShifts,
                                                  });
                                                }}
                                                placeholder="100%"
                                              />
                                            </TableCell>
                                            <TableCell>
                                              {shift.id !== "default" && (
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                                  onClick={() => {
                                                    const updatedShifts =
                                                      salarySettings.shifts.filter(
                                                        (s) => s.id !== shift.id
                                                      );
                                                    setSalarySettings({
                                                      ...salarySettings,
                                                      shifts: updatedShifts,
                                                    });
                                                  }}
                                                >
                                                  <Trash2 className="w-4 h-4" />
                                                </Button>
                                              )}
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                  <div className="p-3 border-t">
                                    <Button
                                      variant="link"
                                      className="text-blue-600 p-0 h-auto"
                                      onClick={() => {
                                        // Tìm ca chưa được sử dụng
                                        const usedShifts = salarySettings.shifts
                                          .filter((s) => s.id !== "default")
                                          .map((s) => s.name);
                                        const availableShift = shiftTypes.find(
                                          (st) => !usedShifts.includes(st.value)
                                        );

                                        const newShift = {
                                          id: `shift-${Date.now()}`,
                                          name:
                                            availableShift?.value || "Ca sáng",
                                          salaryPerShift: "0",
                                          saturdayCoeff: "100%",
                                          sundayCoeff: "100%",
                                          dayOffCoeff: "100%",
                                          holidayCoeff: "100%",
                                        };
                                        setSalarySettings({
                                          ...salarySettings,
                                          shifts: [
                                            ...salarySettings.shifts,
                                            newShift,
                                          ],
                                        });
                                      }}
                                    >
                                      + Thêm điều kiện
                                    </Button>
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>

                        {/* Overtime Salary Section */}
                        {salarySettings.salaryType === "shift" && (
                          <div>
                            <div className="space-y-0 border-t border-l border-r rounded-lg">
                              <div className="flex items-center justify-between px-4 py-3 border-b">
                                <Label className="text-sm font-normal">
                                  Lương làm thêm giờ
                                </Label>
                                <Switch
                                  checked={salarySettings.overtimeEnabled}
                                  onCheckedChange={(checked) =>
                                    setSalarySettings({
                                      ...salarySettings,
                                      overtimeEnabled: checked,
                                    })
                                  }
                                />
                              </div>

                              {salarySettings.overtimeEnabled && (
                                <div className="border-b rounded-b-lg overflow-hidden">
                                  <div className="overflow-x-auto">
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead className="w-32"></TableHead>
                                          <TableHead className="w-32">
                                            Ngày thường
                                          </TableHead>
                                          <TableHead className="w-32">
                                            Thứ 7
                                          </TableHead>
                                          <TableHead className="w-32">
                                            Chủ nhật
                                          </TableHead>
                                          <TableHead className="w-32">
                                            Ngày nghỉ
                                          </TableHead>
                                          <TableHead className="w-32">
                                            Ngày lễ tết
                                          </TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        <TableRow>
                                          <TableCell className="font-medium">
                                            Hệ số lương trên giờ
                                          </TableCell>
                                          <TableCell>
                                            <CoefficientInput
                                              value={
                                                salarySettings.overtimeCoeffs
                                                  .weekday
                                              }
                                              onChange={(value) => {
                                                setSalarySettings({
                                                  ...salarySettings,
                                                  overtimeCoeffs: {
                                                    ...salarySettings.overtimeCoeffs,
                                                    weekday: value,
                                                  },
                                                });
                                              }}
                                              placeholder="50%"
                                            />
                                          </TableCell>
                                          <TableCell>
                                            <CoefficientInput
                                              value={
                                                salarySettings.overtimeCoeffs
                                                  .saturday
                                              }
                                              onChange={(value) => {
                                                setSalarySettings({
                                                  ...salarySettings,
                                                  overtimeCoeffs: {
                                                    ...salarySettings.overtimeCoeffs,
                                                    saturday: value,
                                                  },
                                                });
                                              }}
                                              placeholder="100%"
                                            />
                                          </TableCell>
                                          <TableCell>
                                            <CoefficientInput
                                              value={
                                                salarySettings.overtimeCoeffs
                                                  .sunday
                                              }
                                              onChange={(value) => {
                                                setSalarySettings({
                                                  ...salarySettings,
                                                  overtimeCoeffs: {
                                                    ...salarySettings.overtimeCoeffs,
                                                    sunday: value,
                                                  },
                                                });
                                              }}
                                              placeholder="100%"
                                            />
                                          </TableCell>
                                          <TableCell>
                                            <CoefficientInput
                                              value={
                                                salarySettings.overtimeCoeffs
                                                  .dayOff
                                              }
                                              onChange={(value) => {
                                                setSalarySettings({
                                                  ...salarySettings,
                                                  overtimeCoeffs: {
                                                    ...salarySettings.overtimeCoeffs,
                                                    dayOff: value,
                                                  },
                                                });
                                              }}
                                              placeholder="100%"
                                            />
                                          </TableCell>
                                          <TableCell>
                                            <CoefficientInput
                                              value={
                                                salarySettings.overtimeCoeffs
                                                  .holiday
                                              }
                                              onChange={(value) => {
                                                setSalarySettings({
                                                  ...salarySettings,
                                                  overtimeCoeffs: {
                                                    ...salarySettings.overtimeCoeffs,
                                                    holiday: value,
                                                  },
                                                });
                                              }}
                                              placeholder="100%"
                                            />
                                          </TableCell>
                                        </TableRow>
                                      </TableBody>
                                    </Table>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="account" className="mt-6">
                      <div className="space-y-6">
                        {/* Username */}
                        <div>
                          <Label>Tên đăng nhập <span className="text-red-500">*</span></Label>
                          <Input
                            placeholder="Tên đăng nhập"
                            value={formData.username || ''}
                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                            className="mt-1.5 bg-white border-slate-300 shadow-none"
                          />
                        </div>
                        {/* Password */}
                        <div>
                          <Label>Mật khẩu <span className="text-red-500">*</span></Label>
                          <div className="relative">
                            <Input
                              type={formData.showPassword ? 'text' : 'password'}
                              placeholder="Mật khẩu"
                              value={formData.password || ''}
                              onChange={e => setFormData({ ...formData, password: e.target.value })}
                              className="mt-1.5 bg-white border-slate-300 shadow-none pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-500 hover:text-slate-700"
                              onClick={() => setFormData({ ...formData, showPassword: !formData.showPassword })}
                            >
                              {formData.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                        {/* Existing account select (optional) */}
                        <div className="space-y-4">
                          <Label>Chọn tài khoản hệ thống <span className="text-red-500">*</span></Label>
                          <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                            <SelectTrigger className="w-full bg-white border-slate-300 shadow-none">
                              <SelectValue placeholder="Chọn tài khoản..." />
                            </SelectTrigger>
                            <SelectContent>
                              {initialAccounts.map(acc => {
                                const roleName = initialRoles.find(r => r.id === acc.roleId)?.name || "Unknown";
                                return (
                                  <SelectItem key={acc.id} value={acc.id}>
                                    {acc.username} - {acc.fullName} ({roleName})
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <div className="bg-blue-50 p-3 rounded text-xs text-blue-700">
                            Chọn tài khoản đã được tạo trước trong danh sách tài khoản hệ thống.
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setAddDialogOpen(false)}
                    >
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
            )}
          </div>
          {/* Search and Filter */}
          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Search and Filter Toggle */}
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Tìm kiếm theo tên, mã nhân viên..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    Bộ lọc
                    {(filterPosition !== "all" || filterStatus !== "all") && (
                      <Badge className="ml-1 bg-blue-500 text-white px-1.5 py-0.5 text-xs">
                        {(filterPosition !== "all" ? 1 : 0) + (filterStatus !== "all" ? 1 : 0)}
                      </Badge>
                    )}
                  </Button>
                </div>

                {/* Collapsible Filter Panel */}
                {showFilters && (
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Filter by Position */}
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-600">Vị trí</Label>
                        <Select
                          value={filterPosition}
                          onValueChange={(value) => setFilterPosition(value)}
                        >
                          <SelectTrigger className="bg-white border-slate-300 shadow-none">
                            <SelectValue placeholder="Chọn vị trí" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tất cả vị trí</SelectItem>
                            {positions.map((pos) => (
                              <SelectItem key={pos.value} value={pos.value}>
                                {pos.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Filter by Status */}
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-600">Trạng thái</Label>
                        <Select
                          value={filterStatus}
                          onValueChange={(value) => setFilterStatus(value)}
                        >
                          <SelectTrigger className="bg-white border-slate-300 shadow-none">
                            <SelectValue placeholder="Chọn trạng thái" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tất cả trạng thái</SelectItem>
                            <SelectItem value="active">Đang làm việc</SelectItem>
                            <SelectItem value="inactive">Nghỉ việc</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Statistics */}
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-600">Thống kê</Label>
                        <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Tổng nhân viên:</span>
                            <span className="font-medium text-slate-900">{staffMembers.length}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Đang hiển thị:</span>
                            <span className="font-medium text-blue-600">{filteredStaff.length}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Clear Filters Button */}
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFilterPosition("all");
                          setFilterStatus("all");
                          setSearchQuery("");
                        }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Xóa bộ lọc
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto p-6">
          <Card className="border-blue-200">
            <CardContent className="p-0">
              <div className="overflow-x-auto rounded-xl">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-100">
                      <TableHead className="w-16 text-sm text-center">STT</TableHead>
                      <TableHead
                        className="w-24 text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                        onClick={() => handleSort("staffCode")}
                      >
                        <div className="flex items-center">
                          Mã NV
                          {getSortIcon("staffCode")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                        onClick={() => handleSort("fullName")}
                      >
                        <div className="flex items-center">
                          Tên nhân viên
                          {getSortIcon("fullName")}
                        </div>
                      </TableHead>
                      <TableHead className="w-32 text-sm">SĐT</TableHead>
                      <TableHead className="w-36 text-sm">CCCD</TableHead>
                      <TableHead
                        className="w-32 text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                        onClick={() => handleSort("joinDate")}
                      >
                        <div className="flex items-center">
                          Ngày vào làm
                          {getSortIcon("joinDate")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="w-28 text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                        onClick={() => handleSort("position")}
                      >
                        <div className="flex items-center">
                          Vị trí
                          {getSortIcon("position")}
                        </div>
                      </TableHead>
                      <TableHead className="w-28 text-sm">Trạng thái</TableHead>
                      <TableHead className="w-24 text-sm text-center">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStaff.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          className="text-center text-slate-500 py-8"
                        >
                          Không tìm thấy nhân viên nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStaff.map((staff, index) => (
                        <TableRow key={staff.id} className="hover:bg-blue-100/50">
                          <TableCell className="text-sm text-slate-600 text-center">
                            {index + 1}
                          </TableCell>
                          <TableCell className="text-sm text-blue-600">
                            {staff.staffCode}
                          </TableCell>
                          <TableCell className="text-sm text-slate-900">{staff.fullName}</TableCell>
                          <TableCell className="text-sm text-slate-700">{staff.phone}</TableCell>
                          <TableCell className="text-sm text-slate-700">{staff.idCard}</TableCell>
                          <TableCell className="text-sm text-slate-700">
                            {new Date(staff.joinDate).toLocaleDateString("vi-VN")}
                          </TableCell>
                          <TableCell className="text-sm">
                            <Badge
                              variant="outline"
                              className={
                                staff.position === "manager"
                                  ? "border-purple-300 text-purple-700"
                                  : staff.position === "barista"
                                    ? "border-blue-300 text-blue-700"
                                    : staff.position === "cashier"
                                      ? "border-cyan-300 text-cyan-700"
                                      : "border-emerald-300 text-emerald-700"
                              }
                            >
                              {staff.positionLabel}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {staff.status === "active" ? (
                              <Badge className="bg-emerald-500">Đang làm</Badge>
                            ) : (
                              <Badge variant="secondary">Nghỉ việc</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            <div className="flex gap-1 justify-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleEdit(staff)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                onClick={() => handleDelete(staff)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleStatus(staff.id)}
                                className={
                                  staff.status === "active"
                                    ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                                    : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                }
                              >
                                {staff.status === "active" ? (
                                  <PowerOff className="w-4 h-4" />
                                ) : (
                                  <Power className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog - Same form as Add but for editing */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent
          className="max-w-4xl max-h-[90vh] overflow-y-auto"
          style={{ maxWidth: "60rem" }}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Chỉnh sửa thông tin nhân viên</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Thông tin</TabsTrigger>
              <TabsTrigger value="salary">Thiết lập lương</TabsTrigger>
              <TabsTrigger value="account">Thông tin tài khoản</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-6">
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-sm font-medium text-slate-900 mb-4">
                    Thông tin cơ bản
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label>
                        Họ và tên <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        placeholder="VD: Nguyễn Văn A"
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                      />
                    </div>
                    <div>
                      <Label>
                        Số điện thoại <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        placeholder="VD: 0901234567"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                      />
                    </div>
                    <div>
                      <Label>
                        Số CCCD <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        placeholder="VD: 001234567890"
                        value={formData.idCard}
                        onChange={(e) =>
                          setFormData({ ...formData, idCard: e.target.value })
                        }
                        className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                      />
                    </div>
                    <div>
                      <Label>
                        Giới tính <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) =>
                          setFormData({ ...formData, gender: value })
                        }
                      >
                        <SelectTrigger className="mt-1.5 bg-white border-slate-300 shadow-none">
                          <SelectValue placeholder="Chọn giới tính" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Nam</SelectItem>
                          <SelectItem value="female">Nữ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>
                        Ngày sinh <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            birthDate: e.target.value,
                          })
                        }
                        className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Work Information */}
                <div className="border-t pt-6">
                  <h3 className="text-sm font-medium text-slate-900 mb-4">
                    Thông tin công việc
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>
                        Vị trí <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.position}
                        onValueChange={(value) =>
                          setFormData({ ...formData, position: value })
                        }
                      >
                        <SelectTrigger className="mt-1.5 bg-white border-slate-300 shadow-none">
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
                      <Label>
                        Ngày vào làm <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="date"
                        value={formData.joinDate}
                        onChange={(e) =>
                          setFormData({ ...formData, joinDate: e.target.value })
                        }
                        className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>
                        Lương cơ bản (VNĐ){" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={formData.salary}
                        onChange={(e) =>
                          setFormData({ ...formData, salary: e.target.value })
                        }
                        className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="border-t pt-6">
                  <h3 className="text-sm font-medium text-slate-900 mb-4">Địa chỉ</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>
                        Thành phố <span className="text-red-500">*</span>
                      </Label>
                      <div className="mt-1.5">
                        <SimpleSearchSelect
                          value={formData.city}
                          onValueChange={(value) =>
                            setFormData({ ...formData, city: value, ward: "" })
                          }
                          options={cities}
                          placeholder="Chọn thành phố"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>
                        Phường/Xã <span className="text-red-500">*</span>
                      </Label>
                      <div className="mt-1.5">
                        <SimpleSearchSelect
                          value={formData.ward}
                          onValueChange={(value) =>
                            setFormData({ ...formData, ward: value })
                          }
                          options={
                            formData.city ? wards[formData.city] || [] : []
                          }
                          placeholder="Chọn phường/xã"
                          disabled={!formData.city}
                        />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <Label>
                        Địa chỉ cụ thể <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        placeholder="VD: Số nhà, tên đường..."
                        value={formData.addressDetail}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            addressDetail: e.target.value,
                          })
                        }
                        className="mt-1.5 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
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

            <TabsContent value="salary" className="mt-6">
              <div className="space-y-6">
                {/* Main Salary Section */}
                <div>
                  <h3 className="text-sm font-medium text-slate-900 mb-4">
                    Lương chính
                  </h3>
                  <div className="space-y-0 border-t border-l border-r rounded-lg">
                    {/* Loại lương */}
                    <div className="flex items-center px-4 py-3 border-b">
                      <div className="flex items-center">
                        <Label className="text-sm font-normal">
                          Loại lương <span className="text-red-500">*</span>
                        </Label>
                        <div className="px-4">
                          <Select
                            value={salarySettings.salaryType}
                            onValueChange={(value: "shift" | "fixed") => {
                              setSalarySettings({
                                ...salarySettings,
                                salaryType: value,
                                advancedSetup:
                                  value === "fixed"
                                    ? false
                                    : salarySettings.advancedSetup,
                              });
                            }}
                          >
                            <SelectTrigger className="w-64 bg-white border-slate-300 shadow-none">
                              <SelectValue placeholder="Chọn loại lương" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="shift">
                                Theo ca làm việc
                              </SelectItem>
                              <SelectItem value="fixed">
                                Lương cố định
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Mức lương và Thiết lập nâng cao */}
                    <div className="flex items-center justify-between px-4 py-3 border-b">
                      {/* Div 1: Mức lương */}
                      <div className="flex items-center">
                        <Label className="text-sm font-normal">
                          Mức lương <span className="text-red-500">*</span>
                        </Label>
                        {salarySettings.salaryType === "fixed" ||
                          (salarySettings.salaryType === "shift" &&
                            !salarySettings.advancedSetup) ? (
                          <div className="ml-5 flex items-center gap-2 px-4">
                            <Input
                              type="text"
                              placeholder="0"
                              value={formatVNCurrency(
                                salarySettings.salaryAmount
                              )}
                              onChange={(e) => {
                                const rawValue = parseVNCurrency(
                                  e.target.value
                                );
                                if (rawValue === "" || /^\d+$/.test(rawValue)) {
                                  setSalarySettings({
                                    ...salarySettings,
                                    salaryAmount: rawValue,
                                  });
                                }
                              }}
                              className="w-48 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                            />
                            <span className="text-sm text-slate-600 whitespace-nowrap">
                              {salarySettings.salaryType === "shift"
                                ? "/ ca"
                                : "/ kỳ lương"}
                            </span>
                          </div>
                        ) : null}
                      </div>

                      {/* Div 2: Thiết lập nâng cao */}
                      {salarySettings.salaryType === "shift" && (
                        <div className="flex items-center gap-3">
                          <Label className="text-sm font-normal">
                            Thiết lập nâng cao
                          </Label>
                          <Switch
                            checked={salarySettings.advancedSetup}
                            onCheckedChange={(checked) => {
                              if (checked && salarySettings.salaryAmount) {
                                const defaultShift = salarySettings.shifts.find(
                                  (s) => s.id === "default"
                                );
                                if (defaultShift) {
                                  const updatedShifts =
                                    salarySettings.shifts.map((s) =>
                                      s.id === "default"
                                        ? {
                                          ...s,
                                          salaryPerShift:
                                            salarySettings.salaryAmount,
                                        }
                                        : s
                                    );
                                  setSalarySettings({
                                    ...salarySettings,
                                    advancedSetup: checked,
                                    shifts: updatedShifts,
                                  });
                                } else {
                                  setSalarySettings({
                                    ...salarySettings,
                                    advancedSetup: checked,
                                  });
                                }
                              } else {
                                setSalarySettings({
                                  ...salarySettings,
                                  advancedSetup: checked,
                                });
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {salarySettings.salaryType === "shift" &&
                      salarySettings.advancedSetup && (
                        <div className="border-b rounded-b-lg overflow-hidden">
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-40">Ca</TableHead>
                                  <TableHead className="w-40">
                                    Lương/ca
                                  </TableHead>
                                  <TableHead className="w-32">Thứ 7</TableHead>
                                  <TableHead className="w-32">
                                    Chủ nhật
                                  </TableHead>
                                  <TableHead className="w-32">
                                    Ngày nghỉ
                                  </TableHead>
                                  <TableHead className="w-32">
                                    Ngày lễ tết
                                  </TableHead>
                                  <TableHead className="w-16"></TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {salarySettings.shifts.map((shift) => (
                                  <TableRow key={shift.id}>
                                    <TableCell className="font-medium">
                                      {shift.id === "default" ? (
                                        shift.name
                                      ) : (
                                        <Select
                                          value={shift.name}
                                          onValueChange={(value) => {
                                            const updatedShifts =
                                              salarySettings.shifts.map((s) =>
                                                s.id === shift.id
                                                  ? { ...s, name: value }
                                                  : s
                                              );
                                            setSalarySettings({
                                              ...salarySettings,
                                              shifts: updatedShifts,
                                            });
                                          }}
                                        >
                                          <SelectTrigger className="h-8 bg-white border-slate-300 shadow-none">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {shiftTypes.map((st) => (
                                              <SelectItem
                                                key={st.value}
                                                value={st.value}
                                              >
                                                {st.label}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <Input
                                        type="text"
                                        value={formatVNCurrency(
                                          shift.salaryPerShift
                                        )}
                                        onChange={(e) => {
                                          const rawValue = parseVNCurrency(
                                            e.target.value
                                          );
                                          if (
                                            rawValue === "" ||
                                            /^\d+$/.test(rawValue)
                                          ) {
                                            const updatedShifts =
                                              salarySettings.shifts.map((s) =>
                                                s.id === shift.id
                                                  ? {
                                                    ...s,
                                                    salaryPerShift: rawValue,
                                                  }
                                                  : s
                                              );
                                            setSalarySettings({
                                              ...salarySettings,
                                              shifts: updatedShifts,
                                            });
                                          }
                                        }}
                                        className="h-8 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <CoefficientInput
                                        value={shift.saturdayCoeff}
                                        onChange={(value) => {
                                          const updatedShifts =
                                            salarySettings.shifts.map((s) =>
                                              s.id === shift.id
                                                ? { ...s, saturdayCoeff: value }
                                                : s
                                            );
                                          setSalarySettings({
                                            ...salarySettings,
                                            shifts: updatedShifts,
                                          });
                                        }}
                                        placeholder="100%"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <CoefficientInput
                                        value={shift.sundayCoeff}
                                        onChange={(value) => {
                                          const updatedShifts =
                                            salarySettings.shifts.map((s) =>
                                              s.id === shift.id
                                                ? { ...s, sundayCoeff: value }
                                                : s
                                            );
                                          setSalarySettings({
                                            ...salarySettings,
                                            shifts: updatedShifts,
                                          });
                                        }}
                                        placeholder="100%"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <CoefficientInput
                                        value={shift.dayOffCoeff}
                                        onChange={(value) => {
                                          const updatedShifts =
                                            salarySettings.shifts.map((s) =>
                                              s.id === shift.id
                                                ? { ...s, dayOffCoeff: value }
                                                : s
                                            );
                                          setSalarySettings({
                                            ...salarySettings,
                                            shifts: updatedShifts,
                                          });
                                        }}
                                        placeholder="100%"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <CoefficientInput
                                        value={shift.holidayCoeff}
                                        onChange={(value) => {
                                          const updatedShifts =
                                            salarySettings.shifts.map((s) =>
                                              s.id === shift.id
                                                ? { ...s, holidayCoeff: value }
                                                : s
                                            );
                                          setSalarySettings({
                                            ...salarySettings,
                                            shifts: updatedShifts,
                                          });
                                        }}
                                        placeholder="100%"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      {shift.id !== "default" && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                          onClick={() => {
                                            const updatedShifts =
                                              salarySettings.shifts.filter(
                                                (s) => s.id !== shift.id
                                              );
                                            setSalarySettings({
                                              ...salarySettings,
                                              shifts: updatedShifts,
                                            });
                                          }}
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                          <div className="p-3 border-t">
                            <Button
                              variant="link"
                              className="text-blue-600 p-0 h-auto"
                              onClick={() => {
                                const usedShifts = salarySettings.shifts
                                  .filter((s) => s.id !== "default")
                                  .map((s) => s.name);
                                const availableShift = shiftTypes.find(
                                  (st) => !usedShifts.includes(st.value)
                                );

                                const newShift = {
                                  id: `shift-${Date.now()}`,
                                  name: availableShift?.value || "Ca sáng",
                                  salaryPerShift: "0",
                                  saturdayCoeff: "100%",
                                  sundayCoeff: "100%",
                                  dayOffCoeff: "100%",
                                  holidayCoeff: "100%",
                                };
                                setSalarySettings({
                                  ...salarySettings,
                                  shifts: [...salarySettings.shifts, newShift],
                                });
                              }}
                            >
                              + Thêm điều kiện
                            </Button>
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                {/* Overtime Salary Section */}
                {salarySettings.salaryType === "shift" && (
                  <div>
                    <div className="space-y-0 border-t border-l border-r rounded-lg">
                      <div className="flex items-center justify-between px-4 py-3 border-b">
                        <Label className="text-sm font-normal">
                          Lương làm thêm giờ
                        </Label>
                        <Switch
                          checked={salarySettings.overtimeEnabled}
                          onCheckedChange={(checked) =>
                            setSalarySettings({
                              ...salarySettings,
                              overtimeEnabled: checked,
                            })
                          }
                        />
                      </div>

                      {salarySettings.overtimeEnabled && (
                        <div className="border-b rounded-b-lg overflow-hidden">
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-32"></TableHead>
                                  <TableHead className="w-32">
                                    Ngày thường
                                  </TableHead>
                                  <TableHead className="w-32">Thứ 7</TableHead>
                                  <TableHead className="w-32">
                                    Chủ nhật
                                  </TableHead>
                                  <TableHead className="w-32">
                                    Ngày nghỉ
                                  </TableHead>
                                  <TableHead className="w-32">
                                    Ngày lễ tết
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                <TableRow>
                                  <TableCell className="font-medium">
                                    Hệ số lương trên giờ
                                  </TableCell>
                                  <TableCell>
                                    <CoefficientInput
                                      value={
                                        salarySettings.overtimeCoeffs.weekday
                                      }
                                      onChange={(value) => {
                                        setSalarySettings({
                                          ...salarySettings,
                                          overtimeCoeffs: {
                                            ...salarySettings.overtimeCoeffs,
                                            weekday: value,
                                          },
                                        });
                                      }}
                                      placeholder="50%"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <CoefficientInput
                                      value={
                                        salarySettings.overtimeCoeffs.saturday
                                      }
                                      onChange={(value) => {
                                        setSalarySettings({
                                          ...salarySettings,
                                          overtimeCoeffs: {
                                            ...salarySettings.overtimeCoeffs,
                                            saturday: value,
                                          },
                                        });
                                      }}
                                      placeholder="100%"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <CoefficientInput
                                      value={
                                        salarySettings.overtimeCoeffs.sunday
                                      }
                                      onChange={(value) => {
                                        setSalarySettings({
                                          ...salarySettings,
                                          overtimeCoeffs: {
                                            ...salarySettings.overtimeCoeffs,
                                            sunday: value,
                                          },
                                        });
                                      }}
                                      placeholder="100%"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <CoefficientInput
                                      value={
                                        salarySettings.overtimeCoeffs.dayOff
                                      }
                                      onChange={(value) => {
                                        setSalarySettings({
                                          ...salarySettings,
                                          overtimeCoeffs: {
                                            ...salarySettings.overtimeCoeffs,
                                            dayOff: value,
                                          },
                                        });
                                      }}
                                      placeholder="100%"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <CoefficientInput
                                      value={
                                        salarySettings.overtimeCoeffs.holiday
                                      }
                                      onChange={(value) => {
                                        setSalarySettings({
                                          ...salarySettings,
                                          overtimeCoeffs: {
                                            ...salarySettings.overtimeCoeffs,
                                            holiday: value,
                                          },
                                        });
                                      }}
                                      placeholder="100%"
                                    />
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="account" className="mt-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label>Chọn tài khoản hệ thống <span className="text-red-500">*</span></Label>
                  <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                    <SelectTrigger className="w-full bg-white border-slate-300 shadow-none">
                      <SelectValue placeholder="Chọn tài khoản..." />
                    </SelectTrigger>
                    <SelectContent>
                      {initialAccounts.map(acc => {
                        const roleName = initialRoles.find(r => r.id === acc.roleId)?.name || "Unknown";
                        return (
                          <SelectItem key={acc.id} value={acc.id}>
                            {acc.username} - {acc.fullName} ({roleName})
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {selectedAccountId && (
                    <div className="bg-blue-50 p-3 rounded text-xs text-blue-700">
                      Đang chỉnh sửa thông tin cho tài khoản: {initialAccounts.find(a => a.id === selectedAccountId)?.username}
                    </div>
                  )}
                </div>

                <div className="space-y-4 border-t pt-4">
                  <h4 className="text-sm font-medium">Thông tin đăng nhập</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tên đăng nhập</Label>
                      <Input
                        value={accountForm.username}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAccountForm({ ...accountForm, username: e.target.value })}
                        placeholder="Nhập tên đăng nhập"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Mật khẩu mới</Label>
                      <PasswordInput
                        value={accountForm.password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAccountForm({ ...accountForm, password: e.target.value })}
                        placeholder="Nhập mật khẩu mới (nếu đổi)"
                      />
                    </div>
                  </div>
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
