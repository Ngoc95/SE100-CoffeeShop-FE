import { useState, useEffect } from "react";
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
import roleApi from "../../api/roleApi";
import { Role } from "../../types/account";
import staffApi from "../../api/staffApi"; // Import API
import { CreateStaffDto, UpdateStaffDto } from "../../types/staff"; // Import DTOs
import { useDebounce } from "../../hooks/useDebounce";

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
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
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
    email: "", // Added email field
    idCard: "",
    position: "",
    joinDate: "",
    salary: "",
    city: "",
    ward: "",
    addressDetail: "",
    gender: "Nam",
    birthDate: "",
  });

  // Account info state
  // Account info state
  // const [accountData, setAccountData] = useState({ ... }); // Removed as we only link existing accounts
  const [selectedRoleId, setSelectedRoleId] = useState("");

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

  const [localStaffMembers, setLocalStaffMembers] = useState<StaffMember[]>([]);
  const staffMembers = propsStaffList || localStaffMembers;
  const setStaffMembers = setPropsStaffList || setLocalStaffMembers;

  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await roleApi.getAll();
        const rolesData = res.data.metaData?.roles || [];
        setRoles(Array.isArray(rolesData) ? rolesData : []);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };
    fetchRoles();
  }, []);

  const positions = [
    { value: "Quản lý", label: "Quản lý" },
    { value: "Pha chế", label: "Pha chế" },
    { value: "Thu ngân", label: "Thu ngân" },
    { value: "Phục vụ", label: "Phục vụ" },
  ];

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // FETCH DATA FROM API
  const fetchStaffs = React.useCallback(async () => {
    try {
      const params: any = {
        limit: pageSize.toString(),
        page: currentPage.toString(),
      };

      if (debouncedSearchQuery) {
        params.search = debouncedSearchQuery;
      }
      if (filterPosition !== "all") {
        params.position = filterPosition;
      }
      if (filterStatus !== "all") {
        params.status = filterStatus;
      }
      if (sortField && sortOrder !== "none") {
        const sortKey = sortField === "staffCode" ? "code" : sortField === "joinDate" ? "hireDate" : sortField;
        params.sort = JSON.stringify({ [sortKey]: sortOrder.toUpperCase() });
      }

      const res = await staffApi.getAll(params);
      // Helper to extract data handling potential wrappers
      const responseData = res.data as any;
      const staffList = responseData.staffs || responseData.metaData?.staffs || responseData.data?.staffs || [];
      const meta = responseData.metaData;
      if (meta) {
        setTotalPages(meta.totalPages);
      }
      
      if (!Array.isArray(staffList)) {
          console.warn("Unexpected staff response structure:", res.data);
          setStaffMembers([]);
          return;
      }

      // Map Backend Data to UI Structure
      const mappedStaff: StaffMember[] = staffList.map((s: any) => ({
          id: s.id.toString(),
          staffCode: s.code,
          fullName: s.fullName,
          phone: s.phone || '',
          idCard: s.idCard || '',
          gender: s.gender || "Nam",
          birthDate: s.birthday ? new Date(s.birthday).toISOString().split('T')[0] : '',
          joinDate: s.hireDate ? new Date(s.hireDate).toISOString().split('T')[0] : '',
          position: s.position || '',
          positionLabel: positions.find(p => p.value === s.position)?.label || s.position || '',
          status: s.status as "active" | "quit", // Cast to match UI type
          salary: Number(s.salarySetting?.baseRate) || 0,
          address: {
              city: s.city || '',
              ward: s.address ? s.address.split(', ')[1] || '' : '', 
              detail: s.address ? s.address.split(', ')[0] || '' : ''
          },
          account: s.user ? {
              username: s.user.username,
              password: '',
              roleId: s.user.role.id.toString(), // Helper mapping needed if roles differ
              roleName: s.user.role.name
          } : undefined,
          accountId: s.user?.id.toString(),
          
          // Map simple backend salary to complex frontend structure
          salarySettings: {
              salaryType: s.salarySetting?.salaryType === 'monthly' ? 'fixed' : 'shift',
              salaryAmount: s.salarySetting?.baseRate.toString() || '0',
              advancedSetup: false,
              overtimeEnabled: false,
              shifts: [
                  {
                      id: "default",
                      name: "Mặc định",
                      salaryPerShift: s.salarySetting?.baseRate.toString() || '0',
                      saturdayCoeff: "100%",
                      sundayCoeff: "100%",
                      dayOffCoeff: "100%",
                      holidayCoeff: "100%",
                  }
              ],
              overtimeCoeffs: {
                  weekday: "100%",
                  saturday: "100%",
                  sunday: "100%",
                  dayOff: "100%",
                  holiday: "100%",
              }
          }
      }));
      setStaffMembers(mappedStaff);
    } catch (error) {
      console.error("Error fetching staff:", error);
      toast.error("Không thể tải danh sách nhân viên");
    }
  }, [currentPage, pageSize, debouncedSearchQuery, filterPosition, filterStatus, sortField, sortOrder]);

  useEffect(() => {
    fetchStaffs();
  }, [fetchStaffs]);



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

  // Sorting helpers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
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

  // Client-side filtering and sorting removed in favor of Server-side
  const filteredStaff = staffMembers;



  const resetForm = () => {
    setFormData({
      fullName: "",
      phone: "",
      email: "",
      idCard: "",
      gender: "",
      birthDate: "",
      position: "",
      joinDate: new Date().toISOString().split('T')[0],
      salary: "",
      city: "",
      ward: "",
      addressDetail: "",
      gender: "Nam",
      birthDate: "",
    });
    setSalarySettings({
      salaryType: "shift",
      salaryAmount: "",
      advancedSetup: false,
      overtimeEnabled: false,
      shifts: [],
      overtimeCoeffs: {
        weekday: "100%",
        saturday: "100%",
        sunday: "100%",
        dayOff: "100%",
        holiday: "100%",
      }
    });
    setAccountForm({ username: "", password: "" });
    setSelectedRoleId("");
  };

  const handleAddNew = () => {
    resetForm();
    setAddDialogOpen(true);
  };

  const handleSubmit = async () => {
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
    if (selectedRoleId && !accountForm.username) {
       // Only if role is select but username is empty
       // Note: logic in UI allows selecting role without username? 
       // Just ensuring if they want account, need username/pass
       toast.error("Vui lòng nhập tên đăng nhập nếu chọn vai trò");
       return;
    }

    try {
        const createDto: CreateStaffDto = {
            fullName: formData.fullName,
            phone: formData.phone,
            idCard: formData.idCard,
            gender: formData.gender,
            birthday: formData.birthDate,
            position: formData.position,
            department: 'Store', // Default
            hireDate: formData.joinDate,
            city: formData.city,
            address: `${formData.addressDetail}, ${formData.ward}`,
            
            // Salary
            salaryType: salarySettings.salaryType === 'fixed' ? 'monthly' : 'hourly',
            baseRate: Number(parseVNCurrency(salarySettings.salaryAmount)),

            // Account
            username: accountForm.username || undefined,
            password: accountForm.password || undefined,
            roleId: selectedRoleId ? Number(selectedRoleId) : undefined,
            // Salary
            salaryType: salarySettings.salaryType === 'fixed' ? 'monthly' : 'hourly',
            baseRate: Number(parseVNCurrency(salarySettings.salaryAmount)),

            // Account
            username: accountForm.username || undefined,
            password: accountForm.password || undefined,
            roleId: selectedRoleId ? Number(selectedRoleId) : undefined
        };

        // Remove optional empty fields to check
        if (!createDto.email) delete createDto.email;
        if (!createDto.username) {
             delete createDto.username;
             delete createDto.password;
             delete createDto.roleId;
        }

        await staffApi.create(createDto);
        toast.success("Thêm nhân viên thành công");
        setAddDialogOpen(false);
        resetForm();
        
        // Refresh list
        // Refresh list
        fetchStaffs(); 

    } catch (error: any) {
        toast.error(error.response?.data?.message || "Lỗi khi tạo nhân viên");
    }
  };

  const handleEdit = (staff: StaffMember) => {
    setEditingStaff(staff);
    setFormData({
      fullName: staff.fullName,
      phone: staff.phone,
      email: staff.email || "",
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
        salaryAmount: staff.salary ? staff.salary.toString() : "",
        advancedSetup: false,
        overtimeEnabled: false,
        shifts: [
          {
            id: "default",
            name: "Mặc định",
            salaryPerShift: staff.salary ? staff.salary.toString() : "",
            saturdayCoeff: "100%",
            sundayCoeff: "100%",
            dayOffCoeff: "100%",
            holidayCoeff: "100%",
          },
        ],
        overtimeCoeffs: {
          weekday: "100%",
          saturday: "100%",
          sunday: "100%",
          dayOff: "100%",
          holiday: "100%",
        },
      });
    }
    // Reset account data when editing
    if (staff.accountId || staff.account) {
      const acc = staff.account; 
      setSelectedRoleId(acc?.roleId?.toString() || "");
      setAccountForm({
        username: acc?.username || "",
        password: ""
      });
    } else {
      setSelectedRoleId("");
      setAccountForm({ username: "", password: "" });
    }
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    // Validate
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

    if (!editingStaff) return;

    try {
      // 1. Construct UpdateStaffDto
      const updateData: UpdateStaffDto = {
        fullName: formData.fullName,
        gender: formData.gender,
        birthday: formData.birthDate, // Map back if needed
        phone: formData.phone,
        email: formData.email,
        address: formData.addressDetail,
        city: formData.city, // simplified Addr
        idCard: formData.idCard,
        position: formData.position,
        department: "TBD", // hidden field
        hireDate: formData.joinDate,
        status: editingStaff.status, // keep existing status or use specific field
        
        // Account 
        username: accountForm.username,
        password: accountForm.password, // Only if changed
        roleId: selectedRoleId ? Number(selectedRoleId) : undefined,

        // Salary
        salaryType: salarySettings.salaryType === 'fixed' ? 'monthly' : 'hourly',
        baseRate: Number(salarySettings.salaryAmount) || 0
      };

      // Sanitize optional fields
      if (!updateData.email) delete updateData.email;
      if (!updateData.username) {
        delete updateData.username;
        delete updateData.password;
        delete updateData.roleId;
      } else if (!updateData.password) {
        delete updateData.password; // Don't send empty password if not changing
      }

      // 2. Call API
      await staffApi.update(Number(editingStaff.id), updateData);

      // 3. Success
      toast.success("Cập nhật thông tin nhân viên thành công");
      
      // 4. Refresh List
      await fetchStaffs(); // Await to ensure refresh completes
      setEditDialogOpen(false);
      
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi cập nhật nhân viên");
    }
  };

  const handleDelete = async (staff: StaffMember) => {
    if (!window.confirm(`Bạn có chắc muốn xóa nhân viên "${staff.fullName}"?`)) {
      return;
    }

    try {
      await staffApi.delete(Number(staff.id));
      
      // Refresh List
      fetchStaffs();
      
      toast.success("Đã xóa nhân viên");
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi xóa nhân viên");
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const staffRef = staffMembers.find((s) => s.id === id);
      if (!staffRef) return;

      const newStatus = staffRef.status === "active" ? "inactive" : "active";
      
      // Optimistic update
      setStaffMembers(
        staffMembers.map((staff) =>
          staff.id === id ? { ...staff, status: newStatus as "active" | "inactive" } : staff
        )
      );

      // Call API
      await staffApi.update(Number(id), { 
        status: newStatus 
      } as any);

      toast.success(
        newStatus === "inactive"
          ? "Đã vô hiệu hóa nhân viên"
          : "Đã kích hoạt nhân viên"
      );
    } catch (error) {
       console.error(error);
       toast.error("Lỗi khi cập nhật trạng thái");
       fetchStaffs(); // Revert on error
    }
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
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={handleAddNew}
                  >
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
                                  <SelectItem value="Nam">Nam</SelectItem>
                                  <SelectItem value="Nữ">Nữ</SelectItem>
                                  <SelectItem value="Khác">Khác</SelectItem>
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
                                Thành phố
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
                                Phường/Xã
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

                            {/* Mức lương */}
                            <div className="flex items-center px-4 py-3 border-b">
                                <Label className="text-sm font-normal w-32">
                                  Mức lương <span className="text-red-500">*</span>
                                </Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                      type="text"
                                      placeholder="0"
                                      value={formatVNCurrency(salarySettings.salaryAmount)}
                                      onChange={(e) => {
                                        const rawValue = parseVNCurrency(e.target.value);
                                        if (rawValue === "" || /^\d+$/.test(rawValue)) {
                                          setSalarySettings({ ...salarySettings, salaryAmount: rawValue });
                                        }
                                      }}
                                      className="w-48 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                                    />
                                    <span className="text-sm text-slate-600 whitespace-nowrap">
                                      {salarySettings.salaryType === "shift" ? "/ ca" : "/ kỳ lương"}
                                    </span>
                                </div>
                            </div>
                            </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="account" className="mt-6">
                      <div className="space-y-6">
                        {/* Username */}
                        <div>
                          <Label>Tên đăng nhập <span className="text-red-500">*</span></Label>
                          <Input
                            placeholder="Tên đăng nhập"
                            value={accountForm.username || ''}
                            onChange={e => setAccountForm({ ...accountForm, username: e.target.value })}
                            className="mt-1.5 bg-white border-slate-300 shadow-none"
                          />
                        </div>
                        {/* Password */}
                        <div>
                          <Label>Mật khẩu <span className="text-red-500">*</span></Label>
                          <PasswordInput 
                                value={accountForm.password || ''}
                                onChange={e => setAccountForm({ ...accountForm, password: e.target.value })}
                                placeholder="Mật khẩu"
                          />
                        </div>
                        {/* Existing account select (optional) */}
                        <div className="space-y-4">
                          <Label>Loại tài khoản <span className="text-red-500">*</span></Label>
                          <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                            <SelectTrigger className="w-full bg-white border-slate-300 shadow-none">
                              <SelectValue placeholder="Chọn loại tài khoản..." />
                            </SelectTrigger>
                            <SelectContent>
                              {roles.map(role => (
                                <SelectItem key={role.id} value={role.id.toString()}>
                                  {role.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="bg-blue-50 p-3 rounded text-xs text-blue-700">
                            Chọn loại phân quyền cho tài khoản này.
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                    <div className="mt-4 bg-slate-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-600">
                        <span className="text-red-500">*</span> Trường bắt buộc
                      </p>
                    </div>
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
                            {staff.joinDate ? new Date(staff.joinDate).toLocaleDateString("vi-VN") : "Chưa cập nhật"}
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
                              {canUpdate('staff') && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleEdit(staff)}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                              )}
                              {canDelete('staff') && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                  onClick={() => handleDelete(staff)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                              {canUpdate('staff') && (
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
                              )}
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
                          <SelectItem value="Nam">Nam</SelectItem>
                          <SelectItem value="Nữ">Nữ</SelectItem>
                          <SelectItem value="Khác">Khác</SelectItem>
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
                </div>
              </div>

                {/* Address Information */}
                <div className="border-t pt-6">
                  <h3 className="text-sm font-medium text-slate-900 mb-4">Địa chỉ</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>
                        Thành phố
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
                        Phường/Xã
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
                        Địa chỉ
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

                    {/* Mức lương */}
                    <div className="flex items-center px-4 py-3 border-b">
                        <Label className="text-sm font-normal w-32">
                          Mức lương <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex items-center gap-2">
                            <Input
                              type="text"
                              placeholder="0"
                              value={formatVNCurrency(salarySettings.salaryAmount)}
                              onChange={(e) => {
                                const rawValue = parseVNCurrency(e.target.value);
                                if (rawValue === "" || /^\d+$/.test(rawValue)) {
                                  setSalarySettings({ ...salarySettings, salaryAmount: rawValue });
                                }
                              }}
                              className="w-48 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                            />
                            <span className="text-sm text-slate-600 whitespace-nowrap">
                              {salarySettings.salaryType === "shift" ? "/ ca" : "/ kỳ lương"}
                            </span>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="account" className="mt-6">
              <div className="space-y-6">
                {/* Username */}
                <div>
                  <Label>Tên đăng nhập <span className="text-red-500">*</span></Label>
                  <Input
                    placeholder="Tên đăng nhập"
                    value={accountForm.username}
                    onChange={(e) => setAccountForm({ ...accountForm, username: e.target.value })}
                    className="mt-1.5 bg-white border-slate-300 shadow-none"
                  />
                </div>

                {/* Password */}
                <div>
                  <Label>Mật khẩu <span className="text-red-500">*</span></Label>
                  <Input
                    type="password"
                    placeholder="Mật khẩu"
                    value={accountForm.password}
                    onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
                    className="mt-1.5 bg-white border-slate-300 shadow-none"
                  />
                </div>

                {/* Existing account select (optional) */}
                <div className="space-y-4">
                  <Label>Loại tài khoản <span className="text-red-500">*</span></Label>
                  <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                    <SelectTrigger className="w-full bg-white border-slate-300 shadow-none">
                      <SelectValue placeholder="Chọn loại tài khoản..." />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="bg-blue-50 p-3 rounded text-xs text-blue-700">
                    Chọn loại phân quyền cho tài khoản này.
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs >

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
        </DialogContent >
      </Dialog >
    </div >
  );
}
