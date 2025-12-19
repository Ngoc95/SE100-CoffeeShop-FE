import { useState } from 'react';
import { useAuth } from "../../contexts/AuthContext";
import {
  Plus, 
  Download, 
  Search,
  Calendar as CalendarIcon,
  X,
  ChevronDown,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Filter,
  ArrowUpRight,
  ArrowDownLeft, // Check if this icon exists in lucide-react (it usually does as ArrowUpRight/ArrowDownLeft or similar. Let's assume standard names).
} from 'lucide-react';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';
import { CustomerTimeFilter } from '../reports/CustomerTimeFilter'; // Import CustomerTimeFilter
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Calendar } from '../ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command';
import { Separator } from '../ui/separator';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  subDays,
  subMonths,
  subQuarters,
  subYears,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear
} from 'date-fns';
import { vi } from 'date-fns/locale';

export function Finance() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('finance:create');

  // New States for Top Filter
  const [dateRangeType, setDateRangeType] = useState<'preset' | 'custom'>('preset');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(new Date(2025, 11, 1));
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date(2025, 11, 31));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['income', 'expense']);
  const [selectedMethods, setSelectedMethods] = useState<string[]>(['cash', 'transfer']);

  // Sort states
  type SortField = "id" | "time" | "category" | "person" | "amount" | null;
  type SortOrder = "asc" | "desc" | "none";
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");
  const [timePreset, setTimePreset] = useState("this-month");

  const handleTimePresetChange = (value: string) => {
    setTimePreset(value);
    const now = new Date();
    let from: Date | undefined;
    let to: Date | undefined;

    switch (value) {
      case 'today':
        from = now; to = now; break;
      case 'yesterday':
        const y = subDays(now, 1); from = y; to = y; break;
      case 'this-week':
        from = startOfWeek(now, { weekStartsOn: 1 }); to = endOfWeek(now, { weekStartsOn: 1 }); break;
      case 'last-week':
        const lastWeek = subDays(now, 7);
        from = startOfWeek(lastWeek, { weekStartsOn: 1 }); to = endOfWeek(lastWeek, { weekStartsOn: 1 }); break;
      case 'last-7-days':
        from = subDays(now, 7); to = now; break;
      case 'this-month':
        from = startOfMonth(now); to = endOfMonth(now); break;
      case 'last-month':
        const lastMonth = subMonths(now, 1);
        from = startOfMonth(lastMonth); to = endOfMonth(lastMonth); break;
      case 'last-30-days':
        from = subDays(now, 30); to = now; break;
      case 'this-quarter':
        from = startOfQuarter(now); to = endOfQuarter(now); break;
      case 'last-quarter':
        const lastQuarter = subQuarters(now, 1);
        from = startOfQuarter(lastQuarter); to = endOfQuarter(lastQuarter); break;
      case 'this-year':
        from = startOfYear(now); to = endOfYear(now); break;
      case 'last-year':
        const lastYear = subYears(now, 1);
        from = startOfYear(lastYear); to = endOfYear(lastYear); break;
    }
    
    if (value !== 'custom') {
        setDateFrom(from);
        setDateTo(to);
    }
  };
  
  // Modal states
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [addPersonDialogOpen, setAddPersonDialogOpen] = useState(false);
  const [addReceiptCategoryDialogOpen, setAddReceiptCategoryDialogOpen] = useState(false);
  const [addPaymentCategoryDialogOpen, setAddPaymentCategoryDialogOpen] = useState(false);
  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false);
  const [editingCategoryType, setEditingCategoryType] = useState<'receipt' | 'payment'>('receipt');
  const [addBankAccountDialogOpen, setAddBankAccountDialogOpen] = useState(false);
  
  // Receipt/Payment form states
  const [receiptCode, setReceiptCode] = useState('PT000051');
  const [receiptDate, setReceiptDate] = useState<Date>(new Date());
  const [receiptCategory, setReceiptCategory] = useState('');
  const [receiptAmount, setReceiptAmount] = useState('');
  const [receiptNote, setReceiptNote] = useState('');
  const [receiptPersonGroup, setReceiptPersonGroup] = useState('other');
  const [receiptPersonName, setReceiptPersonName] = useState('');
  const [receiptPaymentMethod, setReceiptPaymentMethod] = useState('');
  const [receiptBankAccount, setReceiptBankAccount] = useState('');
  const [receiptPaymentType, setReceiptPaymentType] = useState<'cash' | 'bank'>('cash');
  
  const [paymentCode, setPaymentCode] = useState('PC000051');
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [paymentCategory, setPaymentCategory] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [paymentPersonGroup, setPaymentPersonGroup] = useState('other');
  const [paymentPersonName, setPaymentPersonName] = useState('');
  const [paymentPaymentMethod, setPaymentPaymentMethod] = useState('');
  const [paymentBankAccount, setPaymentBankAccount] = useState('');
  const [paymentPaymentType, setPaymentPaymentType] = useState<'cash' | 'bank'>('cash');
  
  // Add person form states
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonPhone, setNewPersonPhone] = useState('');
  const [newPersonAddress, setNewPersonAddress] = useState('');
  const [newPersonNote, setNewPersonNote] = useState('');
  
  // Category form states
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryAccountToFinancial, setCategoryAccountToFinancial] = useState(true);
  
  // Bank account form states
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountBank, setBankAccountBank] = useState('');
  const [bankAccountOwner, setBankAccountOwner] = useState('');
  const [bankAccountNote, setBankAccountNote] = useState('');
  const [bankAccountSearchOpen, setBankAccountSearchOpen] = useState(false);

  // Sidebar filter states
  const [searchCode, setSearchCode] = useState('');
  const [searchNote, setSearchNote] = useState('');
  const [statusCompleted, setStatusCompleted] = useState(false);
  const [statusCancelled, setStatusCancelled] = useState(false);
  const [selectedCreators, setSelectedCreators] = useState<string[]>([]);
  const [creatorSearchOpen, setCreatorSearchOpen] = useState(false);
  const [personName, setPersonName] = useState('');
  const [personPhone, setPersonPhone] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categorySearchOpen, setCategorySearchOpen] = useState(false);
  const [documentTypeReceipt, setDocumentTypeReceipt] = useState(false);
  const [documentTypePayment, setDocumentTypePayment] = useState(false);
  const [presetTimeRange, setPresetTimeRange] = useState('this-month');

  // Mock data
  const allCreators = [
    { id: 'admin', name: 'Admin' },
    { id: 'nguyen-van-a', name: 'Nguyễn Văn A' },
    { id: 'tran-thi-b', name: 'Trần Thị B' },
    { id: 'le-van-c', name: 'Lê Văn C' },
  ];

  const allCategories = [
    { id: 'customer-payment', name: 'Tiền khách trả', type: 'receipt' },
    { id: 'debt-collection', name: 'Thu nợ', type: 'receipt' },
    { id: 'loan', name: 'Vay', type: 'receipt' },
    { id: 'investment', name: 'Đầu tư', type: 'receipt' },
    { id: 'other-receipt', name: 'Thu khác', type: 'receipt' },
    { id: 'supplier-payment', name: 'Tiền trả NCC', type: 'payment' },
    { id: 'salary', name: 'Tiền lương', type: 'payment' },
    { id: 'utilities', name: 'Điện nước', type: 'payment' },
    { id: 'rent', name: 'Tiền thuê mặt bằng', type: 'payment' },
    { id: 'debt-payment', name: 'Trả nợ', type: 'payment' },
    { id: 'other-payment', name: 'Chi khác', type: 'payment' },
  ];

  const allCustomers = [
    { id: '1', name: 'Anh Giang - Kim Mã', phone: '0987654321' },
    { id: '2', name: 'Nguyễn Văn Hải', phone: '0912345678' },
    { id: '3', name: 'Phạm Thu Hương', phone: '0923456789' },
  ];

  const allStaff = [
    { id: '1', name: 'Nguyễn Văn A', phone: '0901234567' },
    { id: '2', name: 'Trần Thị B', phone: '0902345678' },
    { id: '3', name: 'Lê Văn C', phone: '0903456789' },
  ];

  const allSuppliers = [
    { id: '1', name: 'Đại lý Hồng Phúc', phone: '0904567890' },
    { id: '2', name: 'Cửa hàng Đại Việt', phone: '0905678901' },
  ];

  const allOtherPersons = [
    { id: '1', name: 'Người khác 1', phone: '0906789012' },
    { id: '2', name: 'Người khác 2', phone: '0907890123' },
  ];

  const allBankAccounts = [
    { id: '1', name: 'TK Vietcombank', accountNumber: '1234567890', bank: 'VCB', bankFull: 'VCB - Ngân hàng TMCP Ngoại thương Việt Nam', owner: 'Nguyễn Văn A' },
    { id: '2', name: 'TK Techcombank', accountNumber: '0987654321', bank: 'TCB', bankFull: 'TCB - Ngân hàng TMCP Kỹ Thương Việt Nam', owner: 'Công ty ABC' },
  ];

  const vietnameseBanks = [
    { id: 'VCB', name: 'VCB - Ngân hàng TMCP Ngoại thương Việt Nam' },
    { id: 'TCB', name: 'TCB - Ngân hàng TMCP Kỹ Thương Việt Nam' },
    { id: 'BIDV', name: 'BIDV - Ngân hàng TMCP Đầu tư và Phát triển Việt Nam' },
    { id: 'VTB', name: 'VTB - Ngân hàng TMCP Vietinbank' },
    { id: 'ACB', name: 'ACB - Ngân hàng TMCP Á Châu' },
    { id: 'MB', name: 'MB - Ngân hàng TMCP Quân đội' },
    { id: 'SHB', name: 'SHB - Ngân hàng TMCP Sài Gòn - Hà Nội' },
    { id: 'VPB', name: 'VPB - Ngân hàng TMCP Việt Nam Thịnh Vượng' },
    { id: 'TPB', name: 'TPB - Ngân hàng TMCP Tiên Phong' },
    { id: 'MSB', name: 'MSB - Ngân hàng TMCP Hàng Hải' },
    { id: 'OCB', name: 'OCB - Ngân hàng TMCP Phương Đông' },
    { id: 'SCB', name: 'SCB - Ngân hàng TMCP Sài Gòn' },
    { id: 'HDBank', name: 'HDBank - Ngân hàng TMCP Phát triển TP.HCM' },
    { id: 'VIB', name: 'VIB - Ngân hàng TMCP Quốc tế' },
    { id: 'SGB', name: 'SGB - Ngân hàng TMCP Sài Gòn Công Thương' },
    { id: 'ABBank', name: 'ABBank - Ngân hàng TMCP An Bình' },
    { id: 'ICB', name: 'ICB - Ngân hàng TMCP Công Thương Việt Nam' },
  ];

  const paymentMethods = [
    { id: 'cash', name: 'Thẻ' },
    { id: 'transfer', name: 'Chuyển khoản' },
  ];

  // Toggle functions for multiselect filters
  const toggleCreator = (creatorId: string) => {
    setSelectedCreators(prev =>
      prev.includes(creatorId)
        ? prev.filter(id => id !== creatorId)
        : [...prev, creatorId]
    );
  };

  const toggleCategory = (categoryName: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(name => name !== categoryName)
        : [...prev, categoryName]
    );
  };

  const cashbookStats = {
    openingBalance: 7887500,
    totalIncome: 6417000,
    totalExpense: -5764500,
    closingBalance: 8540000,
  };

  const allTransactions = [
    { id: 'TTPN000050', time: '02/12/2025 16:00', type: 'chi', category: 'Tiền trả NCC', person: 'Đại lý Hồng Phúc', amount: -1283000, status: 'completed', note: '', method: 'cash' },
    { id: 'THD000050', time: '02/12/2025 16:00', type: 'thu', category: 'Tiền khách trả', person: 'Anh Giang - Kim Mã', amount: 1377000, status: 'completed', note: '', method: 'cash' },
    { id: 'TTPN000049', time: '02/12/2025 15:00', type: 'chi', category: 'Tiền trả NCC', person: 'Đại lý Hồng Phúc', amount: -745500, status: 'completed', note: '', method: 'bank' },
    { id: 'THD000049', time: '02/12/2025 15:00', type: 'thu', category: 'Tiền khách trả', person: 'Nguyễn Văn Hải', amount: 685000, status: 'completed', note: '', method: 'bank' },
    { id: 'TTPN000048', time: '02/12/2025 14:00', type: 'chi', category: 'Tiền trả NCC', person: 'Cửa hàng Đại Việt', amount: -207500, status: 'completed', note: '', method: 'cash' },
    { id: 'THD000048', time: '02/12/2025 14:00', type: 'thu', category: 'Tiền khách trả', person: 'Anh Giang - Kim Mã', amount: 282000, status: 'completed', note: '', method: 'cash' },
    { id: 'TTPN000047', time: '01/12/2025 10:00', type: 'chi', category: 'Tiền trả NCC', person: 'Cửa hàng Đại Việt', amount: -1766500, status: 'completed', note: '', method: 'cash' },
    { id: 'THD000047', time: '01/12/2025 10:00', type: 'thu', category: 'Tiền khách trả', person: 'Nguyễn Văn Hải', amount: 2060000, status: 'cancelled', note: '', method: 'cash' },
    { id: 'TTPN000046', time: '01/12/2025 09:00', type: 'chi', category: 'Tiền trả NCC', person: 'Cửa hàng Đại Việt', amount: -1727000, status: 'completed', note: '', method: 'bank' },
    { id: 'THD000046', time: '01/12/2025 09:00', type: 'thu', category: 'Tiền khách trả', person: 'Anh Giang - Kim Mã', amount: 1968000, status: 'completed', note: '', method: 'bank' },
    { id: 'TTPN000045', time: '01/12/2025 08:00', type: 'chi', category: 'Tiền trả NCC', person: 'Cửa hàng Đại Việt', amount: -35000, status: 'completed', note: '', method: 'cash' },
    { id: 'THD000045', time: '01/12/2025 08:00', type: 'thu', category: 'Tiền khách trả', person: 'Phạm Thu Hương', amount: 45000, status: 'completed', note: '', method: 'cash' },
  ];

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

  // Clear all filters function
  const clearAllFilters = () => {
    setSearchTerm('');
    setSearchCode('');
    setSearchNote('');
    setDateFrom(null);
    setDateTo(null);
    setSelectedTypes([]);
    setSelectedMethods([]);
    setStatusCompleted(false);
    setStatusCancelled(false);
    setSelectedCreators([]);
    setPersonName('');
    setPersonPhone('');
    setSelectedCategories([]);
  };

  // Filtering logic
  const [activeTab, setActiveTab] = useState<'cash' | 'bank' | 'total'>('cash'); // Kept for Dialog compatibility

  // Enhanced filtering logic with all new filters
  let filteredTransactions = allTransactions.filter(transaction => {
    // Filter by Search Code
    if (searchCode) {
      const lowerCode = searchCode.toLowerCase();
      if (!transaction.id.toLowerCase().includes(lowerCode)) return false;
    }

    // Filter by Search Note
    if (searchNote) {
      const lowerNote = searchNote.toLowerCase();
      if (!transaction.note.toLowerCase().includes(lowerNote)) return false;
    }

    // Filter by Search Term (legacy - for general search)
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      const matchesCode = transaction.id.toLowerCase().includes(lowerTerm);
      const matchesNote = transaction.note.toLowerCase().includes(lowerTerm);
      const matchesPerson = transaction.person.toLowerCase().includes(lowerTerm);
      if (!matchesCode && !matchesNote && !matchesPerson) return false;
    }

    // Filter by Date
    if (dateFrom || dateTo) {
      const [datePart] = transaction.time.split(' ');
      const [day, month, year] = datePart.split('/');
      const transDate = new Date(Number(year), Number(month) - 1, Number(day));
      
      if (dateFrom) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        if (transDate < from) return false;
      }
      
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(0, 0, 0, 0);
        if (transDate > to) return false;
      }
    }

    // Filter by Type (Thu/Chi)
    if (selectedTypes.length > 0) {
      const isIncome = transaction.type === 'thu';
      const isExpense = transaction.type === 'chi';
      if (isIncome && !selectedTypes.includes('income')) return false;
      if (isExpense && !selectedTypes.includes('expense')) return false;
    }

    // Filter by Method (Tien mat/Chuyen khoan)
    if (selectedMethods.length > 0) {
      const method = transaction.method === 'cash' ? 'cash' : 'transfer';
      if (!selectedMethods.includes(method)) return false;
    }

    // Filter by Status
    // Note: Mock data doesn't have status field, so this is placeholder logic
    // In real implementation, check transaction.status
    if (statusCompleted || statusCancelled) {
      // Placeholder: assume all transactions are completed for now
      // In real app: if (statusCompleted && transaction.status !== 'completed') return false;
      // In real app: if (statusCancelled && transaction.status !== 'cancelled') return false;
    }

    // Filter by Creator
    if (selectedCreators.length > 0) {
      // Placeholder: Mock data doesn't have creator field
      // In real app: if (!selectedCreators.includes(transaction.creatorId)) return false;
    }

    // Filter by Person Name
    if (personName) {
      const lowerName = personName.toLowerCase();
      if (!transaction.person.toLowerCase().includes(lowerName)) return false;
    }

    // Filter by Person Phone
    if (personPhone) {
      // Placeholder: Mock data doesn't have phone field
      // In real app: if (!transaction.personPhone.includes(personPhone)) return false;
    }

    // Filter by Category
    if (selectedCategories.length > 0) {
      // Placeholder: Mock data doesn't have category field
      // In real app: if (!selectedCategories.includes(transaction.category)) return false;
    }

    return true;
  });



  // Apply sorting
  if (sortField && sortOrder !== "none") {
    filteredTransactions = [...filteredTransactions].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortField === "id") {
        aValue = a.id;
        bValue = b.id;
      } else if (sortField === "time") {
        aValue = new Date(a.time.split(' ').reverse().join('-').replace(/\//g, '-')).getTime();
        bValue = new Date(b.time.split(' ').reverse().join('-').replace(/\//g, '-')).getTime();
      } else if (sortField === "category") {
        aValue = a.category;
        bValue = b.category;
      } else if (sortField === "person") {
        aValue = a.person;
        bValue = b.person;
      } else if (sortField === "amount") {
        aValue = a.amount;
        bValue = b.amount;
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



  const handleOpenReceiptDialog = () => {
    // Auto-generate receipt code
    setReceiptCode('PT' + String(Date.now()).slice(-6));
    setReceiptDate(new Date());
    setReceiptCategory('');
    setReceiptAmount('');
    setReceiptNote('');
    setReceiptPersonGroup('other');
    setReceiptPersonName('');
    setReceiptPaymentMethod('');
    setReceiptBankAccount('');
    setReceiptDialogOpen(true);
  };

  const handleOpenPaymentDialog = () => {
    // Auto-generate payment code
    setPaymentCode('PC' + String(Date.now()).slice(-6));
    setPaymentDate(new Date());
    setPaymentCategory('');
    setPaymentAmount('');
    setPaymentNote('');
    setPaymentPersonGroup('other');
    setPaymentPersonName('');
    setPaymentPaymentMethod('');
    setPaymentBankAccount('');
    setPaymentDialogOpen(true);
  };

  const handleSaveReceipt = () => {
    // Save receipt logic
    console.log('Saving receipt...');
    setReceiptDialogOpen(false);
  };

  const handleSaveAndPrintReceipt = () => {
    // Save and print receipt logic
    console.log('Saving and printing receipt...');
    setReceiptDialogOpen(false);
  };

  const handleSavePayment = () => {
    // Save payment logic
    console.log('Saving payment...');
    setPaymentDialogOpen(false);
  };

  const handleSaveAndPrintPayment = () => {
    // Save and print payment logic
    console.log('Saving and printing payment...');
    setPaymentDialogOpen(false);
  };

  const handleAddPerson = () => {
    // Add person logic
    console.log('Adding person:', {
      name: newPersonName,
      phone: newPersonPhone,
      address: newPersonAddress,
      note: newPersonNote,
    });
    setAddPersonDialogOpen(false);
    // Reset form
    setNewPersonName('');
    setNewPersonPhone('');
    setNewPersonAddress('');
    setNewPersonNote('');
  };

  const handleOpenAddReceiptCategory = () => {
    setCategoryName('');
    setCategoryDescription('');
    setCategoryAccountToFinancial(true);
    setAddReceiptCategoryDialogOpen(true);
  };

  const handleOpenAddPaymentCategory = () => {
    setCategoryName('');
    setCategoryDescription('');
    setCategoryAccountToFinancial(true);
    setAddPaymentCategoryDialogOpen(true);
  };

  const handleOpenAddBankAccount = () => {
    setBankAccountName('');
    setBankAccountNumber('');
    setBankAccountBank('');
    setBankAccountOwner('');
    setBankAccountNote('');
    setAddBankAccountDialogOpen(true);
  };

  const handleSaveBankAccount = () => {
    // Save bank account logic
    console.log('Saving bank account:', {
      name: bankAccountName,
      accountNumber: bankAccountNumber,
      bank: bankAccountBank,
      owner: bankAccountOwner,
      note: bankAccountNote,
    });
    setAddBankAccountDialogOpen(false);
  };

  const handleOpenEditCategory = (type: 'receipt' | 'payment') => {
    const selectedCategoryId = type === 'receipt' ? receiptCategory : paymentCategory;
    const category = allCategories.find(c => c.id === selectedCategoryId);
    
    if (category) {
      setCategoryName(category.name);
      setCategoryDescription('');
      setCategoryAccountToFinancial(true);
      setEditingCategoryType(type);
      setEditCategoryDialogOpen(true);
    }
  };

  const handleSaveCategory = () => {
    console.log('Saving category:', categoryName, categoryDescription);
    setAddReceiptCategoryDialogOpen(false);
    setAddPaymentCategoryDialogOpen(false);
    setEditCategoryDialogOpen(false);
  };

  const handleDeleteCategory = () => {
    console.log('Deleting category');
    setEditCategoryDialogOpen(false);
  };

  const getPersonList = (personGroup: string) => {
    switch (personGroup) {
      case 'customer':
        return allCustomers;
      case 'staff':
        return allStaff;
      case 'supplier':
        return allSuppliers;
      default:
        return allOtherPersons;
    }
  };

  const [showFilters, setShowFilters] = useState(false);
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-blue-900 text-2xl font-semibold mb-2">
            Sổ quỹ {activeTab === 'cash' ? '- Tiền mặt' : activeTab === 'bank' ? '- Ngân hàng' : '- Tổng quỹ'}
          </h1>
          <p className="text-slate-600 text-sm">
            Quản lý thu chi và dòng tiền
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab !== 'total' && (
            <>
              <Button size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setReceiptDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Lập phiếu thu
              </Button>
              <Button size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setPaymentDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Lập phiếu chi
              </Button>
            </>
          )}
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Xuất file
          </Button>
        </div>
      </div>

       {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-slate-600 mb-2">Quỹ đầu kỳ</div>
            <div className="text-xl text-slate-900">
              {cashbookStats.openingBalance.toLocaleString('vi-VN')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
             <div className="text-sm text-slate-600 mb-2">Tổng thu</div>
            <div className="text-xl text-emerald-600">
              {cashbookStats.totalIncome.toLocaleString('vi-VN')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
             <div className="text-sm text-slate-600 mb-2">Tổng chi</div>
            <div className="text-xl text-red-600">
              {cashbookStats.totalExpense.toLocaleString('vi-VN')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
             <div className="text-sm text-slate-600 mb-2">Tồn quỹ</div>
            <div className="text-xl text-blue-600">
              {cashbookStats.closingBalance.toLocaleString('vi-VN')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm giao dịch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-slate-300"
                />
              </div>
              <CustomerTimeFilter
                dateRangeType={dateRangeType}
                timePreset={timePreset}
                dateFrom={dateFrom}
                dateTo={dateTo}
                onDateRangeTypeChange={setDateRangeType}
                onTimePresetChange={handleTimePresetChange}
                onDateFromChange={setDateFrom}
                onDateToChange={setDateTo}
              />
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                Bộ lọc
              </Button>
              {showFilters && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearAllFilters}
                  className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                  Xóa bộ lọc
                </Button>
              )}
            </div>


            {showFilters && (
               <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   {/* 1. Tìm kiếm */}
                   <div className="space-y-2">
                    <Label className="text-xs text-slate-600">Tìm kiếm</Label>
                    <div className="space-y-2">
                      <Input
                        placeholder="Theo mã phiếu"
                        value={searchCode}
                        onChange={(e) => setSearchCode(e.target.value)}
                        className="h-9 bg-white border-slate-300"
                      />
                      <Input
                        placeholder="Ghi chú"
                        value={searchNote}
                        onChange={(e) => setSearchNote(e.target.value)}
                        className="h-9 bg-white border-slate-300"
                      />
                    </div>
                   </div>

                   {/* 2. Người nộp/nhận */}
                   <div className="space-y-2">
                    <Label className="text-xs text-slate-600">Người nộp/nhận</Label>
                    <div className="space-y-2">
                      <Input
                        placeholder="Tên người nộp/nhận"
                        value={personName}
                        onChange={(e) => setPersonName(e.target.value)}
                        className="h-9 bg-white border-slate-300"
                      />
                      <Input
                        placeholder="Điện thoại"
                        value={personPhone}
                        onChange={(e) => setPersonPhone(e.target.value)}
                        className="h-9 bg-white border-slate-300"
                      />
                    </div>
                   </div>

                   {/* 3. Người tạo */}
                   <div className="space-y-2">
                    <Label className="text-xs text-slate-600">Người tạo</Label>
                    <Popover open={creatorSearchOpen} onOpenChange={setCreatorSearchOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between h-9 text-sm bg-white border-slate-300"
                        >
                          <span className="text-slate-500 text-xs">
                            {selectedCreators.length === 0
                              ? 'Tất cả'
                              : `Đã chọn ${selectedCreators.length}`}
                          </span>
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[240px] p-0">
                        <Command>
                          <CommandInput placeholder="Tìm người tạo..." />
                          <CommandList>
                            <CommandEmpty>Không tìm thấy.</CommandEmpty>
                            <CommandGroup className="max-h-64 overflow-auto">
                              {allCreators.map((creator) => (
                                <CommandItem
                                  key={creator.id}
                                  onSelect={() => toggleCreator(creator.id)}
                                >
                                  <Checkbox
                                    checked={selectedCreators.includes(creator.id)}
                                    className="mr-2"
                                  />
                                  {creator.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {selectedCreators.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedCreators.map((creatorId) => {
                          const creator = allCreators.find(c => c.id === creatorId);
                          return (
                            <div
                              key={creatorId}
                              className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                            >
                              {creator?.name}
                              <button
                                onClick={() => toggleCreator(creatorId)}
                                className="hover:bg-blue-200 rounded"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                   </div>
                 </div>

                 {/* Second Row */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   {/* 4. Loại thu chi */}
                   <div className="space-y-2">
                    <Label className="text-xs text-slate-600">Loại thu chi</Label>
                    <Popover open={categorySearchOpen} onOpenChange={setCategorySearchOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between h-9 text-sm bg-white border-slate-300"
                        >
                          <span className="text-slate-500 text-xs">
                            {selectedCategories.length === 0
                              ? 'Loại thu chi'
                              : `Đã chọn ${selectedCategories.length}`}
                          </span>
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[240px] p-0">
                        <Command>
                          <CommandInput placeholder="Tìm loại thu chi..." />
                          <CommandList>
                            <CommandEmpty>Không tìm thấy.</CommandEmpty>
                            <CommandGroup className="max-h-64 overflow-auto">
                              {allCategories.map((category) => (
                                <CommandItem
                                  key={category.id}
                                  onSelect={() => toggleCategory(category.name)}
                                >
                                  <Checkbox
                                    checked={selectedCategories.includes(category.name)}
                                    className="mr-2"
                                  />
                                  {category.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {selectedCategories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedCategories.map((categoryName) => (
                          <div
                            key={categoryName}
                            className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                          >
                            {categoryName}
                            <button
                              onClick={() => toggleCategory(categoryName)}
                              className="hover:bg-blue-200 rounded"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                   </div>

                   {/* 5. Loại giao dịch */}
                   <div className="space-y-2">
                    <Label className="text-xs text-slate-600">Loại giao dịch</Label>
                    <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="type-income"
                          checked={selectedTypes.includes('income')}
                          onCheckedChange={() => {
                            setSelectedTypes(prev => 
                              prev.includes('income') ? prev.filter(t => t !== 'income') : [...prev, 'income']
                            )
                          }}
                          className="border-slate-300"
                        />
                        <Label htmlFor="type-income" className="text-sm text-slate-700 cursor-pointer font-normal">Phiếu thu</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="type-expense"
                          checked={selectedTypes.includes('expense')}
                          onCheckedChange={() => {
                            setSelectedTypes(prev => 
                              prev.includes('expense') ? prev.filter(t => t !== 'expense') : [...prev, 'expense']
                            )
                          }}
                          className="border-slate-300"
                        />
                        <Label htmlFor="type-expense" className="text-sm text-slate-700 cursor-pointer font-normal">Phiếu chi</Label>
                      </div>
                    </div>
                   </div>

                   {/* 6. Trạng thái */}
                   <div className="space-y-2">
                    <Label className="text-xs text-slate-600">Trạng thái</Label>
                    <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="status-completed"
                          checked={statusCompleted}
                          onCheckedChange={(checked: boolean) => setStatusCompleted(!!checked)}
                          className="border-slate-300"
                        />
                        <Label htmlFor="status-completed" className="text-sm text-slate-700 cursor-pointer font-normal">Đã thanh toán</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="status-cancelled"
                          checked={statusCancelled}
                          onCheckedChange={(checked: boolean) => setStatusCancelled(!!checked)}
                          className="border-slate-300"
                        />
                        <Label htmlFor="status-cancelled" className="text-sm text-slate-700 cursor-pointer font-normal">Đã hủy</Label>
                      </div>
                    </div>
                   </div>
                 </div>
               </div>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Tabs */}
      <div className="flex items-center gap-2">
        <Button 
          variant={activeTab === 'total' ? 'default' : 'outline'}
          onClick={() => { setActiveTab('total'); setSelectedMethods(['cash', 'transfer']); }}
          className={activeTab === 'total' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-white border-slate-300'}
        >
          Tất cả
        </Button>
        <Button 
          variant={activeTab === 'cash' ? 'default' : 'outline'}
          onClick={() => { setActiveTab('cash'); setSelectedMethods(['cash']); }}
          className={activeTab === 'cash' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-white border-slate-300'}
        >
          Tiền mặt
        </Button>
         <Button 
          variant={activeTab === 'bank' ? 'default' : 'outline'}
          onClick={() => { setActiveTab('bank'); setSelectedMethods(['transfer']); }}
          className={activeTab === 'bank' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-white border-slate-300'}
        >
          Ngân hàng
        </Button>
      </div>

      {/* Transactions Table */}
      <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto rounded-xl">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-100">
                      <TableHead
                        className="text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                        onClick={() => handleSort("id")}
                      >
                        <div className="flex items-center">
                          Mã phiếu
                          {getSortIcon("id")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                        onClick={() => handleSort("time")}
                      >
                        <div className="flex items-center">
                          Thời gian
                          {getSortIcon("time")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                        onClick={() => handleSort("category")}
                      >
                        <div className="flex items-center">
                          Loại thu chi
                          {getSortIcon("category")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                        onClick={() => handleSort("person")}
                      >
                        <div className="flex items-center">
                          Người nộp/nhận
                          {getSortIcon("person")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-sm text-right cursor-pointer hover:bg-blue-100 transition-colors"
                        onClick={() => handleSort("amount")}
                      >
                        <div className="flex items-center justify-end">
                          Giá trị
                          {getSortIcon("amount")}
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id} className="hover:bg-blue-100/50">
                          <TableCell className="text-sm text-blue-600">{transaction.id}</TableCell>
                          <TableCell className="text-sm text-slate-700">{transaction.time}</TableCell>
                          <TableCell className="text-sm text-slate-700">
                            {transaction.type === 'thu' ? 'Thu' : 'Chi'} {transaction.category}
                          </TableCell>
                          <TableCell className="text-sm text-slate-700">{transaction.person}</TableCell>
                          <TableCell className="text-sm text-right">
                            <span className={transaction.amount > 0 ? 'text-emerald-600' : 'text-red-600'}>
                              {transaction.amount.toLocaleString('vi-VN')}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-sm text-slate-500 py-8">
                          Không tìm thấy giao dịch phù hợp
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              <div className="flex items-center justify-between p-4 border-t border-slate-200">
                <div className="text-sm text-slate-600">
                  Số bản ghi: <span>{filteredTransactions.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>


      {/* Receipt Dialog */}
      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>Lập phiếu thu ({activeTab === 'bank' ? 'ngân hàng' : 'tiền mặt'})</DialogTitle>
            <button
              onClick={() => setReceiptDialogOpen(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-6 py-4">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="receipt-code">Mã phiếu</Label>
                <Input 
                  id="receipt-code" 
                  value={receiptCode}
                  disabled
                  placeholder="Mã phiếu tự động"
                  className="bg-slate-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="receipt-date">Thời gian</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {receiptDate ? format(receiptDate, 'dd/MM/yyyy', { locale: vi }) : 'Chọn ngày'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={receiptDate}
                      onSelect={(date) => date && setReceiptDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="receipt-category">Loại thu</Label>
                <div className="flex gap-2">
                  <Select value={receiptCategory} onValueChange={setReceiptCategory}>
                    <SelectTrigger className="flex-1 bg-white border border-slate-300 shadow-none">
                      <SelectValue placeholder="Tìm loại thu" />
                    </SelectTrigger>
                    <SelectContent>
                      {allCategories
                        .filter(cat => cat.type === 'receipt')
                        .map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleOpenAddReceiptCategory}
                    title="Thêm loại thu mới"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  {receiptCategory && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleOpenEditCategory('receipt')}
                      title="Chỉnh sửa loại thu"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="receipt-amount">Giá trị</Label>
                <div className="relative">
                  <Input
                    id="receipt-amount"
                    type="number"
                    value={receiptAmount}
                    onChange={(e) => setReceiptAmount(e.target.value)}
                    placeholder="0"
                    className="pr-8 bg-white border border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">₫</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="receipt-note">Ghi chú</Label>
                <Input
                  id="receipt-note"
                  value={receiptNote}
                  onChange={(e) => setReceiptNote(e.target.value)}
                  placeholder="Nhập ghi chú"
                  className="h-9 bg-white border border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="receipt-person-group">Nhóm người nộp</Label>
                <Select value={receiptPersonGroup} onValueChange={setReceiptPersonGroup}>
                  <SelectTrigger className="bg-white border border-slate-300 shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="other">Khác</SelectItem>
                    <SelectItem value="staff">Nhân viên</SelectItem>
                    <SelectItem value="supplier">Nhà cung cấp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="receipt-person-name">Tên người nộp</Label>
                {!receiptPersonName ? (
                  <>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="receipt-person-name"
                          value={receiptPersonName}
                          onChange={(e) => setReceiptPersonName(e.target.value)}
                          placeholder="Tìm kiếm"
                          className="pl-9 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                        />
                      </div>
                      {(receiptPersonGroup === 'other' || !receiptPersonGroup) && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setAddPersonDialogOpen(true)}
                          title="Thêm người nộp mới"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    {/* Show person suggestions based on group */}
                    {receiptPersonGroup && receiptPersonGroup !== 'other' && (
                      <div className="mt-2 border border-slate-200 rounded-md max-h-40 overflow-y-auto">
                        {getPersonList(receiptPersonGroup).map((person) => (
                          <button
                            key={person.id}
                            onClick={() => setReceiptPersonName(person.name)}
                            className="w-full text-left px-3 py-2 hover:bg-slate-50 text-sm"
                          >
                            <div className="text-slate-900">{person.name}</div>
                            <div className="text-xs text-slate-500">{person.phone}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded text-sm">
                    <div className="flex-1">
                      <div className="text-slate-900">{receiptPersonName}</div>
                      {receiptPersonGroup !== 'other' && getPersonList(receiptPersonGroup).find(p => p.name === receiptPersonName) && (
                        <div className="text-xs text-slate-500">
                          {getPersonList(receiptPersonGroup).find(p => p.name === receiptPersonName)?.phone}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setReceiptPersonName('')}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Bank fields - only show when activeTab is 'bank' */}
              {activeTab === 'bank' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="receipt-payment-method">Phương thức</Label>
                    <Select value={receiptPaymentMethod} onValueChange={setReceiptPaymentMethod}>
                      <SelectTrigger className="bg-white border border-slate-300 shadow-none">
                        <SelectValue placeholder="--Chọn phương thức--" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map(method => (
                          <SelectItem key={method.id} value={method.id}>
                            {method.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="receipt-bank-account">Tài khoản nhận</Label>
                    <div className="flex gap-2">
                      <Select value={receiptBankAccount} onValueChange={setReceiptBankAccount}>
                        <SelectTrigger className="flex-1 bg-white border border-slate-300 shadow-none">
                          <SelectValue placeholder="--Chọn tài khoản nhận--" />
                        </SelectTrigger>
                        <SelectContent>
                          {allBankAccounts.map(account => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleOpenAddBankAccount}
                        title="Thêm tài khoản mới"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline"
              onClick={() => setReceiptDialogOpen(false)}
            >
              Bỏ qua
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSaveReceipt}
            >
              Lưu
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSaveAndPrintReceipt}
            >
              Lưu & In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Lập phiếu chi ({activeTab === 'bank' ? 'ngân hàng' : 'tiền mặt'})</DialogTitle>
            <button
              onClick={() => setPaymentDialogOpen(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-6 py-4">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="payment-code">Mã phiếu</Label>
                <Input 
                  id="payment-code" 
                  value={paymentCode}
                  disabled
                  placeholder="Mã phiếu tự động"
                  className="bg-slate-50 border-slate-300 shadow-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-date">Thời gian</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left bg-white border-slate-300">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {paymentDate ? format(paymentDate, 'dd/MM/yyyy', { locale: vi }) : 'Chọn ngày'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={paymentDate}
                      onSelect={(date) => date && setPaymentDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-category">Loại chi</Label>
                <div className="flex gap-2">
                  <Select value={paymentCategory} onValueChange={setPaymentCategory}>
                    <SelectTrigger className="flex-1 bg-white border-slate-300 shadow-none">
                      <SelectValue placeholder="Tìm loại chi" />
                    </SelectTrigger>
                    <SelectContent>
                      {allCategories
                        .filter(cat => cat.type === 'payment')
                        .map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleOpenAddPaymentCategory}
                    title="Thêm loại chi mới"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  {paymentCategory && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleOpenEditCategory('payment')}
                      title="Chỉnh sửa loại chi"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-amount">Giá trị</Label>
                <div className="relative">
                    <Input
                      id="payment-amount"
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="0"
                      className="pr-8 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                    />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">₫</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-note">Ghi chú</Label>
                <Input
                  id="payment-note"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="Nhập ghi chú"
                  className="h-9 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="payment-person-group">Nhóm người nhận</Label>
                <Select value={paymentPersonGroup} onValueChange={setPaymentPersonGroup}>
                  <SelectTrigger className="bg-white border-slate-300 shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="other">Khác</SelectItem>
                    <SelectItem value="staff">Nhân viên</SelectItem>
                    <SelectItem value="supplier">Nhà cung cấp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-person-name">Tên người nhận</Label>
                {!paymentPersonName ? (
                  <>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="payment-person-name"
                          value={paymentPersonName}
                          onChange={(e) => setPaymentPersonName(e.target.value)}
                          placeholder="Tìm kiếm"
                          className="pl-9 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                        />
                      </div>
                      {(paymentPersonGroup === 'other' || !paymentPersonGroup) && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setAddPersonDialogOpen(true)}
                          title="Thêm người nhận mới"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    {/* Show person suggestions based on group */}
                    {paymentPersonGroup && paymentPersonGroup !== 'other' && (
                      <div className="mt-2 border border-slate-200 rounded-md max-h-40 overflow-y-auto">
                        {getPersonList(paymentPersonGroup).map((person) => (
                          <button
                            key={person.id}
                            onClick={() => setPaymentPersonName(person.name)}
                            className="w-full text-left px-3 py-2 hover:bg-slate-50 text-sm"
                          >
                            <div className="text-slate-900">{person.name}</div>
                            <div className="text-xs text-slate-500">{person.phone}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded text-sm">
                    <div className="flex-1">
                      <div className="text-slate-900">{paymentPersonName}</div>
                      {paymentPersonGroup !== 'other' && getPersonList(paymentPersonGroup).find(p => p.name === paymentPersonName) && (
                        <div className="text-xs text-slate-500">
                          {getPersonList(paymentPersonGroup).find(p => p.name === paymentPersonName)?.phone}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setPaymentPersonName('')}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Bank fields - only show when activeTab is 'bank' */}
              {activeTab === 'bank' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="payment-payment-method">Phương thức</Label>
                    <Select value={paymentPaymentMethod} onValueChange={setPaymentPaymentMethod}>
                      <SelectTrigger className="bg-white border-slate-300 shadow-none">
                        <SelectValue placeholder="--Chọn phương thức--" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map(method => (
                          <SelectItem key={method.id} value={method.id}>
                            {method.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payment-bank-account">Tài khoản gửi</Label>
                    <div className="flex gap-2">
                      <Select value={paymentBankAccount} onValueChange={setPaymentBankAccount}>
                        <SelectTrigger className="flex-1 bg-white border-slate-300 shadow-none">
                          <SelectValue placeholder="--Chọn tài khoản gửi--" />
                        </SelectTrigger>
                        <SelectContent>
                          {allBankAccounts.map(account => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleOpenAddBankAccount}
                        title="Thêm tài khoản mới"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline"
              onClick={() => setPaymentDialogOpen(false)}
            >
              Bỏ qua
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSavePayment}
            >
              Lưu
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSaveAndPrintPayment}
            >
              Lưu & In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Person Dialog */}
      <Dialog open={addPersonDialogOpen} onOpenChange={setAddPersonDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Thêm người nộp/nhận</DialogTitle>
            <DialogDescription>
              Thêm thông tin người nộp/nhận tiền mới
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-person-name">
                Tên <span className="text-red-500">*</span>
              </Label>
              <Input
                id="new-person-name"
                value={newPersonName}
                onChange={(e) => setNewPersonName(e.target.value)}
                placeholder="Nhập tên"
                className="bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-person-phone">
                Số điện thoại <span className="text-red-500">*</span>
              </Label>
              <Input
                id="new-person-phone"
                value={newPersonPhone}
                onChange={(e) => setNewPersonPhone(e.target.value)}
                placeholder="Nhập số điện thoại"
                className="bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-person-address">Địa chỉ</Label>
              <Input
                id="new-person-address"
                value={newPersonAddress}
                onChange={(e) => setNewPersonAddress(e.target.value)}
                placeholder="Nhập địa chỉ"
                className="bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-person-note">Ghi chú</Label>
              <Input
                id="new-person-note"
                value={newPersonNote}
                onChange={(e) => setNewPersonNote(e.target.value)}
                placeholder="Nhập ghi chú"
                className="bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddPersonDialogOpen(false)}>
              Hủy
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleAddPerson}
              disabled={!newPersonName || !newPersonPhone}
            >
              Thêm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Receipt Category Dialog */}
      <Dialog open={addReceiptCategoryDialogOpen} onOpenChange={setAddReceiptCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Thêm loại thu</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="receipt-category-name">Loại thu</Label>
              <Input
                id="receipt-category-name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Nhập tên loại thu"
                className="bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receipt-category-desc">Mô tả</Label>
              <Input
                id="receipt-category-desc"
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                placeholder="Nhập mô tả"
                className="bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline"
              onClick={() => setAddReceiptCategoryDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleSaveCategory}
            >
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Payment Category Dialog */}
      <Dialog open={addPaymentCategoryDialogOpen} onOpenChange={setAddPaymentCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Thêm loại chi</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="payment-category-name">Loại chi</Label>
              <Input
                id="payment-category-name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Nhập tên loại chi"
                className="bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-category-desc">Mô tả</Label>
              <Input
                id="payment-category-desc"
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                placeholder="Nhập mô tả"
                className="bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline"
              onClick={() => setAddPaymentCategoryDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleSaveCategory}
            >
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={editCategoryDialogOpen} onOpenChange={setEditCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Sửa loại {editingCategoryType === 'receipt' ? 'thu' : 'chi'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category-name">Loại {editingCategoryType === 'receipt' ? 'thu' : 'chi'}</Label>
              <Input
                id="edit-category-name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder={editingCategoryType === 'receipt' ? 'Nhập tên loại thu' : 'Nhập tên loại chi'}
                className="bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category-desc">Mô tả</Label>
              <Input
                id="edit-category-desc"
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                placeholder="Nhập mô tả"
                className="bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline"
              onClick={() => setEditCategoryDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteCategory}
            >
              Xóa
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleSaveCategory}
            >
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Bank Account Dialog */}
      <Dialog open={addBankAccountDialogOpen} onOpenChange={setAddBankAccountDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Thêm tài khoản ngân hàng</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bank-account-name">
                Tên tài khoản <span className="text-red-500">*</span>
              </Label>
              <Input
                id="bank-account-name"
                value={bankAccountName}
                onChange={(e) => setBankAccountName(e.target.value)}
                placeholder="Nhập tên tài khoản"
                className="bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank-account-number">
                Số tài khoản <span className="text-red-500">*</span>
              </Label>
              <Input
                id="bank-account-number"
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                placeholder="Nhập số tài khoản"
                className="bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank-account-bank">
                Ngân hàng <span className="text-red-500">*</span>
              </Label>
              <Popover open={bankAccountSearchOpen} onOpenChange={setBankAccountSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between bg-white border-slate-300"
                  >
                    {bankAccountBank
                      ? vietnameseBanks.find((bank) => bank.id === bankAccountBank)?.name
                      : 'Chọn ngân hàng'}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[450px] p-0">
                  <Command>
                    <CommandInput placeholder="Tìm kiếm ngân hàng..." />
                    <CommandList>
                      <CommandEmpty>Không tìm thấy ngân hàng.</CommandEmpty>
                      <CommandGroup>
                        {vietnameseBanks.map((bank) => (
                          <CommandItem
                            key={bank.id}
                            value={bank.name}
                            onSelect={() => {
                              setBankAccountBank(bank.id);
                              setBankAccountSearchOpen(false);
                            }}
                          >
                            {bank.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank-account-owner">
                Chủ tài khoản <span className="text-red-500">*</span>
              </Label>
              <Input
                id="bank-account-owner"
                value={bankAccountOwner}
                onChange={(e) => setBankAccountOwner(e.target.value)}
                placeholder="Nhập tên chủ tài khoản"
                className="bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank-account-note">Ghi chú</Label>
              <Input
                id="bank-account-note"
                value={bankAccountNote}
                onChange={(e) => setBankAccountNote(e.target.value)}
                placeholder="Nhập ghi chú"
                className="bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddBankAccountDialogOpen(false)}>
              Hủy
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleSaveBankAccount}
              disabled={!bankAccountName || !bankAccountNumber || !bankAccountBank || !bankAccountOwner}
            >
              Thêm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
