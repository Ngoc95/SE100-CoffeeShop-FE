import { useEffect, useState } from 'react';
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
import { 
  getFinanceTransactions, 
  getFinanceCategories, 
  getBankAccounts, 
  getFinancePersons,
  createFinanceTransaction,
  createFinanceCategory,
  deleteFinanceCategory,
  createBankAccount,
  deleteBankAccount,
  createFinancePerson,
  exportFinanceTransactions
} from '../../api/finance';
import staffApi from '../../api/staffApi';
import { supplierApi } from '../../api/supplierApi';
import { toast } from 'sonner';

export function Finance() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('finance:create');

  // New States for Top Filter
  const [dateRangeType, setDateRangeType] = useState<'preset' | 'custom'>('preset');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(() => startOfMonth(new Date()));
  const [dateTo, setDateTo] = useState<Date | undefined>(() => endOfMonth(new Date()));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['income', 'expense']);
  const [selectedMethods, setSelectedMethods] = useState<string[]>(['cash', 'transfer']);

  // Sort states
  type SortField = "id" | "time" | "category" | "person" | "amount" | null;
  type SortOrder = "asc" | "desc" | "none";
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");

  const [timePreset, setTimePreset] = useState("this-month");
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

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
  
  // Export Modal State
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportDateFrom, setExportDateFrom] = useState<Date | undefined>(new Date());
  const [exportDateTo, setExportDateTo] = useState<Date | undefined>(new Date());
  
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

  const [allCreators, setAllCreators] = useState<Array<{ id: string; name: string }>>([]);

  const [allCategories, setAllCategories] = useState<Array<{ id: string; name: string; type?: 'receipt' | 'payment' }>>([]);

  // Helper for Amount Formatting
  const formatCurrencyInput = (value: string) => {
    const number = parseInt(value.replace(/[^0-9]/g, ''));
    if (isNaN(number)) return '';
    return number.toLocaleString('vi-VN');
  };

  const handleReceiptAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setReceiptAmount(formatCurrencyInput(e.target.value));
  };

  const handlePaymentAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setPaymentAmount(formatCurrencyInput(e.target.value));
  };

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

  const [allSuppliers, setAllSuppliers] = useState<Array<{ id: string; name: string }>>([]);
  
  // Options for Person Select in Modal
  const [receiptPersonOptions, setReceiptPersonOptions] = useState<Array<{ id: string | number, name: string, phone?: string }>>([]);
  const [paymentPersonOptions, setPaymentPersonOptions] = useState<Array<{ id: string | number, name: string, phone?: string }>>([]);


  const [allBankAccounts, setAllBankAccounts] = useState<Array<{ id: string; name?: string; accountNumber: string; bank?: string; bankFull?: string; owner?: string }>>([]);

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

  // Debounce hook
  function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);
    return debouncedValue;
  }

  // Debounced filter values
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedSearchCode = useDebounce(searchCode, 500);
  const debouncedSearchNote = useDebounce(searchNote, 500);
  const debouncedPersonName = useDebounce(personName, 500);
  const debouncedPersonPhone = useDebounce(personPhone, 500);
  const debouncedReceiptPersonName = useDebounce(receiptPersonName, 500);
  const debouncedPaymentPersonName = useDebounce(paymentPersonName, 500);
  
  const [receiptPersonSearchOpen, setReceiptPersonSearchOpen] = useState(false);
  const [paymentPersonSearchOpen, setPaymentPersonSearchOpen] = useState(false);
  
  const [creatorSearch, setCreatorSearch] = useState('');
  const debouncedCreatorSearch = useDebounce(creatorSearch, 500);

  const [stats, setStats] = useState({
    openingBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
    closingBalance: 0,
  });

  const [transactions, setTransactions] = useState<Array<{ id: string; time: string; type: 'thu' | 'chi'; category: string; person: string; amount: number; status: string; note: string; method: 'cash' | 'transfer' }>>([]);
  const [loading, setLoading] = useState(false);

  // Fetch finance data from backend
  const fetchTransactions = async () => {
      setLoading(true);
      try {
        const params: any = {
            page,
            limit
        };
        
        // Generic search
        if (debouncedSearchTerm) params.search = debouncedSearchTerm;
        
        // Specific filters
        if (debouncedSearchCode) params.code = debouncedSearchCode;
        if (debouncedSearchNote) params.notes = debouncedSearchNote;
        if (debouncedPersonName) params.personName = debouncedPersonName;
        if (debouncedPersonPhone) params.personPhone = debouncedPersonPhone;
        
        // Date range
        if (dateFrom) params.dateFrom = format(dateFrom, 'yyyy-MM-dd');
        if (dateTo) params.dateTo = format(dateTo, 'yyyy-MM-dd');

        // Status filter
        if (statusCompleted && !statusCancelled) params.status = 'completed';
        if (statusCancelled && !statusCompleted) params.status = 'cancelled';
        
        // Creator filter
        if (selectedCreators.length > 0) {
             const ids = selectedCreators.map(id => Number(id)).filter(n => !isNaN(n));
             if (ids.length > 0) params.creatorIds = ids;
        }

        // Category filter
        if (selectedCategories.length > 0) {
            const catIds = allCategories
                .filter(c => selectedCategories.includes(c.name))
                .map(c => Number(c.id))
                .filter(n => !isNaN(n));
            
            if (catIds.length > 0) params.categoryIds = catIds;
        }

        // Type filter (1=Thu, 2=Chi)
        // Only apply if ONE is selected. If both or neither, fetch all.
        if (selectedTypes.includes('income') && !selectedTypes.includes('expense')) {
            params.typeId = 1;
        } else if (selectedTypes.includes('expense') && !selectedTypes.includes('income')) {
            params.typeId = 2;
        }

        // Method filter
        if (selectedMethods.length === 1) {
            params.paymentMethod = selectedMethods[0];
        }

        // Category filter
        // Note: Simple ID mapping needed if we want to filter by exact category ID
        // For now backend supports categoryIds array
        
        // Sort
        if (sortField) {
            // Map frontend sort fields to backend
            const sortMap: Record<string, string> = {
                'id': 'code',
                'time': 'transactionDate',
                'amount': 'amount'
            };
            if (sortMap[sortField]) {
                params.sort = `${sortMap[sortField]}:${sortOrder === 'asc' ? 'asc' : 'desc'}`;
            }
        }

        const tranRes = await getFinanceTransactions(params);

        // Process Stats
        if (tranRes?.data?.metaData?.stats) {
             setStats(tranRes.data.metaData.stats);
        }
        
        // Update Pagination Info
        if (tranRes?.data?.metaData?.totalPages) {
            setTotalPages(tranRes.data.metaData.totalPages);
            setTotalItems(tranRes.data.metaData.total || 0);
        }

        // Process Transactions
        console.log("Finance Response:", tranRes.data);
        
        let rawItems = 
            tranRes?.data?.metaData?.transactions ?? 
            tranRes?.data?.metaData?.items ?? 
            tranRes?.data?.transactions ?? 
            tranRes?.data ?? 
            [];

        if (!Array.isArray(rawItems)) {
            console.warn("Transactions data is not an array, falling back to empty array. Received:", rawItems);
            rawItems = [];
        }
        const tranItems = rawItems as any[];
        const mappedTrans = tranItems.map((t: any) => {
          const code = String(t.code ?? t.id ?? t.transactionId ?? '');
          const dateStr = t.transactionDate ?? t.createdAt ?? new Date().toISOString();
          const dt = new Date(dateStr);
          const time = `${dt.toLocaleDateString('vi-VN')} ${dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
          // Detect type from category type or explicit type
          // Backend: Category Type 1=Thu, 2=Chi
          const typeId = t.category?.type?.id ?? t.category?.typeId;
          const isReceipt = typeId === 1;
          const isPayment = typeId === 2;
          
          const amountNum = Number(t.amount ?? 0);
          const type: 'thu' | 'chi' = isReceipt ? 'thu' : 'chi';
          // Frontend expects negative for expense for visual consistency, or just 'chi' type
          const normalizedAmount = type === 'chi' ? -Math.abs(amountNum) : Math.abs(amountNum);
          
          return {
            id: code,
            time,
            type,
            category: t.category?.name ?? t.categoryName ?? '',
            person: t.personName ?? t.person?.name ?? '',
            amount: normalizedAmount,
            status: t.status ?? 'completed',
            note: t.notes ?? t.note ?? '', // Backend uses 'notes'
            method: ((t.paymentMethod ?? 'cash') === 'transfer' ? 'transfer' : 'cash') as 'cash' | 'transfer',
          };
        });
        setTransactions(mappedTrans);

      } catch (err: any) {
        console.error(err);
        toast.error('Lỗi tải dữ liệu', { description: err?.message });
      } finally {
        setLoading(false);
      }
  };



  // ... (debouncing hooks matching previous step if not already there, ensure no duplication)

  // ... (useEffect for transactions)

  const fetchMasterData = async () => {
      try {
        // Categories
        const catRes = await getFinanceCategories();
        const catItems = (catRes?.data?.metaData?.items ?? catRes?.data?.metaData ?? catRes?.data ?? []) as any[];
        const mappedCats = catItems.map((c: any) => {
          const typeId = c.type?.id ?? c.typeId;
          const type: 'receipt' | 'payment' | undefined = typeId === 1 ? 'receipt' : (typeId === 2 ? 'payment' : undefined);
          return { id: String(c.id), name: c.name, type };
        });
        setAllCategories(mappedCats);

        // Bank Accounts
        const bankRes = await getBankAccounts();
        const bankItems = (bankRes?.data?.metaData?.items ?? bankRes?.data?.metaData ?? bankRes?.data ?? []) as any[];
        const mappedBanks = bankItems.map((ba: any) => ({
          id: String(ba.id),
          name: ba.name ?? `${ba.bankName ?? 'Ngân hàng'} - ${ba.ownerName ?? ba.owner ?? ''}`,
          accountNumber: String(ba.accountNumber),
          bank: ba.bankCode ?? ba.bankName,
          bankFull: ba.bankFullName ?? ba.bankName,
          owner: ba.ownerName ?? ba.owner,
        }));
        setAllBankAccounts(mappedBanks);
        
        // Fetch Staff (Creators)
        const staffRes = await staffApi.getAll({ limit: 100 });
        const staffList = (staffRes?.data?.metaData?.staffs ?? staffRes?.data?.data ?? []) as any[];
        console.log("Fetch Creators Debug:", staffRes); // DEBUG
        const mappedStaff = staffList.map((s: any) => ({
            id: String(s.id),
            name: s.fullName,
            phone: s.phone
        }));
        setAllCreators(mappedStaff);

      } catch (err) {
          console.error(err);
      }
  };

  // Fetch creators with search
  useEffect(() => {
      const fetchCreators = async () => {
          try {
            const staffRes = await staffApi.getAll({ limit: 20, search: debouncedCreatorSearch });
            const staffList = (staffRes?.data?.metaData?.staffs ?? staffRes?.data?.data ?? []) as any[];
            const mappedStaff = staffList.map((s: any) => ({
                id: String(s.id),
                name: s.fullName,
                phone: s.phone
            }));
            setAllCreators(mappedStaff);
          } catch (e) {
              console.error(e);
          }
      };
      fetchCreators();
  }, [debouncedCreatorSearch]);

  // Handle Person Group Change (Receipt) - Fetch with Search
  useEffect(() => {
      const fetchOptions = async () => {
          const search = debouncedReceiptPersonName; // Use debounced input value
          
          if (receiptPersonGroup === 'staff') {
              try {
                  const res = await staffApi.getAll({ search, limit: 20 });
                  const items = (res?.data?.metaData?.staffs ?? res?.data?.data ?? []) as any[];
                  setReceiptPersonOptions(items.map((s: any) => ({ id: s.id, name: s.fullName, phone: s.phone })));
              } catch(e) { console.error(e); }
          } else if (receiptPersonGroup === 'supplier') {
               try {
                  const res = await supplierApi.getAll({ search, limit: 20 });
                  const items = (res?.data?.metaData?.suppliers ?? res?.data?.data ?? []) as any[];
                  setReceiptPersonOptions(items.map((s: any) => ({ id: s.id, name: s.name, phone: s.phone })));
               } catch(e) { console.error(e); }
          } else if (receiptPersonGroup === 'other') {
              try {
                  const res = await getFinancePersons({ search, limit: 20 });
                  const items = (res?.data?.metaData?.data ?? res?.data?.data ?? []) as any[];
                  setReceiptPersonOptions(items.map((i: any) => ({ id: i.id, name: i.name, phone: i.phone })));
              } catch (e) {
                  console.error(e);
                  setReceiptPersonOptions([]);
              }
          } else {
              setReceiptPersonOptions([]);
          }
      };
      
      fetchOptions();
  }, [receiptPersonGroup, debouncedReceiptPersonName]);

  // Handle Person Group Change (Payment) - Fetch with Search
  useEffect(() => {
      const fetchOptions = async () => {
          const search = debouncedPaymentPersonName;
          
          if (paymentPersonGroup === 'staff') {
              try {
                  const res = await staffApi.getAll({ search, limit: 20 });
                  const items = (res?.data?.metaData?.staffs ?? res?.data?.data ?? []) as any[];
                  setPaymentPersonOptions(items.map((s: any) => ({ id: s.id, name: s.fullName, phone: s.phone })));
              } catch(e) { console.error(e); }
          } else if (paymentPersonGroup === 'supplier') {
               try {
                  const res = await supplierApi.getAll({ search, limit: 20 });
                  const items = (res?.data?.metaData?.suppliers ?? res?.data?.data ?? []) as any[];
                  setPaymentPersonOptions(items.map((s: any) => ({ id: s.id, name: s.name, phone: s.phone })));
               } catch(e) { console.error(e); }
          } else if (paymentPersonGroup === 'other') {
              try {
                  const res = await getFinancePersons({ search, limit: 20 });
                   const items = (res?.data?.metaData?.data ?? res?.data?.data ?? []) as any[];
                  setPaymentPersonOptions(items.map((i: any) => ({ id: i.id, name: i.name, phone: i.phone })));
              } catch (e) {
                  console.error(e);
                  setPaymentPersonOptions([]);
              }
          } else {
              setPaymentPersonOptions([]);
          }
      };
      fetchOptions();
  }, [paymentPersonGroup, debouncedPaymentPersonName]);


  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [
    dateFrom, 
    dateTo, 
    debouncedSearchTerm, 
    debouncedSearchCode, 
    debouncedSearchNote,
    debouncedPersonName,
    debouncedPersonPhone,
    selectedTypes, 
    selectedMethods, 
    sortField, 
    sortOrder,
    statusCompleted,
    statusCancelled,
    selectedCreators,
    dateTo, 
    debouncedSearchTerm, 
    debouncedSearchCode, 
    debouncedSearchNote,
    debouncedPersonName,
    debouncedPersonPhone,
    selectedTypes, 
    selectedMethods, 
    sortField, 
    sortOrder,
    statusCompleted,
    statusCancelled,
    selectedCreators,
    selectedCategories,
    page, // Add page dependency
    limit
  ]);
  
  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [
    dateFrom, 
    dateTo, 
    debouncedSearchTerm, 
    debouncedSearchCode, 
    debouncedSearchNote,
    debouncedPersonName,
    debouncedPersonPhone,
    selectedTypes, 
    selectedMethods, 
    sortField, 
    sortOrder,
    statusCompleted,
    statusCancelled,
    selectedCreators,
    selectedCategories
  ]);

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
    setDateFrom(undefined);
    setDateTo(undefined);
    setSelectedTypes([]);
    setSelectedMethods(['cash', 'transfer']); // Default to "Tất cả"
    setStatusCompleted(false);
    setStatusCancelled(false);
    setSelectedCreators([]);
    setPersonName('');
    setPersonPhone('');
    setSelectedCategories([]);
  };

  // Filtering logic
  const [activeTab, setActiveTab] = useState<'cash' | 'bank' | 'total'>('cash'); // Kept for Dialog compatibility

  // No client-side filtering needed anymore, use transactions state
  const filteredTransactions = transactions;







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

  const handleSaveReceipt = async () => {
    try {
        if (!receiptCategory) {
            toast.error("Vui lòng chọn loại phiếu thu");
            return;
        }

        const payload = {
            categoryId: Number(receiptCategory),
            amount: Number(receiptAmount.replace(/,/g, '')),
            notes: receiptNote,
            paymentMethod: receiptPaymentType === 'bank' ? 'bank' : 'cash',
            transactionDate: receiptDate.toISOString(),
            personName: receiptPersonName,
            bankAccountId: receiptBankAccount ? Number(receiptBankAccount) : undefined,
            personType: receiptPersonGroup,
            // personId: ... logic to find person ID if selecting from list
        };

        await createFinanceTransaction(payload);
        toast.success("Đã tạo phiếu thu");
        setReceiptDialogOpen(false);
        fetchTransactions();
    } catch (err: any) {
        toast.error("Lỗi tạo phiếu thu", { description: err.message });
    }
  };

  const handleSaveAndPrintReceipt = () => {
    // Save and print receipt logic
    console.log('Saving and printing receipt...');
    setReceiptDialogOpen(false);
  };

  const handleSavePayment = async () => {
     try {
        if (!paymentCategory) {
            toast.error("Vui lòng chọn loại phiếu chi");
            return;
        }

        const payload = {
            categoryId: Number(paymentCategory),
            amount: Number(paymentAmount.replace(/,/g, '')),
            notes: paymentNote,
            paymentMethod: paymentPaymentType === 'bank' ? 'bank' : 'cash',
            transactionDate: paymentDate.toISOString(),
            personName: paymentPersonName,
            bankAccountId: paymentBankAccount ? Number(paymentBankAccount) : undefined,
            personType: paymentPersonGroup
        };

        await createFinanceTransaction(payload);
        toast.success("Đã tạo phiếu chi");
        setPaymentDialogOpen(false);
        fetchTransactions();
    } catch (err: any) {
        toast.error("Lỗi tạo phiếu chi", { description: err.message });
    }
  };

  const handleSaveAndPrintPayment = () => {
    // Save and print payment logic
    console.log('Saving and printing payment...');
    setPaymentDialogOpen(false);
  };

  const handleAddPerson = async () => {
    try {
      await createFinancePerson({
          name: newPersonName,
          phone: newPersonPhone,
          address: newPersonAddress,
          type: 'other' // Default type
      });
      toast.success("Đã thêm người mới");
      setAddPersonDialogOpen(false);
      setNewPersonName('');
      setNewPersonPhone('');
      setNewPersonAddress('');
      setNewPersonNote('');
      // Refresh options if currently selecting 'other'
      if (receiptPersonGroup === 'other' || paymentPersonGroup === 'other') {
          // Trigger useEffect dependency update?
          // fetchMasterData does not fetch 'other' persons generally, usually handled by useEffect on group change
          // We can toggle group to refresh or manually fetch?
          // Simplest is to force refresh by temporary state or just let user re-select?
          // Actually, useEffect[receiptPersonGroup] handles fetching.
          // We can call getFinancePersons again here if we want immediate update.
          const res = await getFinancePersons({ limit: 100 });
          const items = (res?.data?.metaData?.items ?? res?.data?.data ?? []) as any[];
          const opts = items.map((i: any) => ({ id: i.id, name: i.name, phone: i.phone }));
          if (receiptPersonGroup === 'other') setReceiptPersonOptions(opts);
          if (paymentPersonGroup === 'other') setPaymentPersonOptions(opts);
      }
    } catch (err: any) {
      toast.error("Lỗi thêm người mới", { description: err.message });
    }
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

  const handleSaveBankAccount = async () => {
      try {
        await createBankAccount({
            bankName: bankAccountBank,
            accountNumber: bankAccountNumber,
            ownerName: bankAccountOwner,
            notes: bankAccountNote
        });
        toast.success("Đã thêm tài khoản");
        setAddBankAccountDialogOpen(false);
        fetchMasterData();
      } catch (err: any) {
        toast.error("Lỗi thêm tài khoản", { description: err.message });
      }
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

  const handleSaveCategory = async () => {
      try {
          const typeId = editingCategoryType === 'receipt' ? 1 : 2;
          await createFinanceCategory({
              name: categoryName,
              typeId: typeId
          });
          toast.success("Đã thêm danh mục");
          setAddReceiptCategoryDialogOpen(false);
          setAddPaymentCategoryDialogOpen(false);
          fetchMasterData();
      } catch (err: any) {
          toast.error("Lỗi thêm danh mục", { description: err.message });
      }
  };

  const handleDeleteCategory = async () => {
    try {
        const typeId = editingCategoryType === 'receipt' ? 1 : 2;
        const selectedId = editingCategoryType === 'receipt' ? receiptCategory : paymentCategory;
        if (!selectedId) return;

        await deleteFinanceCategory(selectedId);
        toast.success("Đã xóa danh mục");
        
        // Clear selection
        if (editingCategoryType === 'receipt') setReceiptCategory('');
        else setPaymentCategory('');

        setEditCategoryDialogOpen(false);
        fetchMasterData();
    } catch (err: any) {
        toast.error("Lỗi xóa danh mục", { description: err.message });
    }
  };

  const handleExportClick = () => {
       setExportDateFrom(dateFrom || startOfMonth(new Date()));
       setExportDateTo(dateTo || endOfMonth(new Date()));
       setExportDialogOpen(true);
  };

  const processExport = async () => {
    try {
        const params: any = {};
        // Add current filters to params (except date, which comes from modal)
        if (debouncedSearchTerm) params.search = debouncedSearchTerm;
        if (debouncedSearchCode) params.code = debouncedSearchCode;
        if (debouncedSearchNote) params.notes = debouncedSearchNote;
        if (debouncedPersonName) params.personName = debouncedPersonName;
        if (debouncedPersonPhone) params.personPhone = debouncedPersonPhone;
        
        // Use dates from Export Modal
        if (exportDateFrom) params.dateFrom = format(exportDateFrom, 'yyyy-MM-dd');
        else if (dateFrom) params.dateFrom = format(dateFrom, 'yyyy-MM-dd');

        if (exportDateTo) params.dateTo = format(exportDateTo, 'yyyy-MM-dd');
        else if (dateTo) params.dateTo = format(dateTo, 'yyyy-MM-dd');

        if (statusCompleted && !statusCancelled) params.status = 'completed';
        if (statusCancelled && !statusCompleted) params.status = 'cancelled';
        if (selectedCreators.length > 0) {
              const ids = selectedCreators.map(id => Number(id)).filter(n => !isNaN(n));
              if (ids.length > 0) params.creatorIds = ids;
        }
        if (selectedCategories.length > 0) {
             const catIds = allCategories
                 .filter(c => selectedCategories.includes(c.name))
                 .map(c => Number(c.id))
                 .filter(n => !isNaN(n));
             if (catIds.length > 0) params.categoryIds = catIds;
        }
        if (selectedTypes.includes('income') && !selectedTypes.includes('expense')) params.typeId = 1;
        else if (selectedTypes.includes('expense') && !selectedTypes.includes('income')) params.typeId = 2;
        if (selectedMethods.length === 1) params.paymentMethod = selectedMethods[0];
        
        const response = await exportFinanceTransactions(params);
        // Create blob and download - use response.data as it contains the binary
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Transaction_Export_${format(new Date(), 'ddMMyyyy')}.xlsx`); 
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        setExportDialogOpen(false); // Close dialog
    } catch (err: any) {
        toast.error("Lỗi xuất file", { description: err.message });
    }
  };



  const [showFilters, setShowFilters] = useState(false);
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-blue-900 text-2xl font-semibold mb-2">
            Sổ quỹ
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
          <Button variant="outline" size="sm" onClick={handleExportClick}>
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
              {stats.openingBalance.toLocaleString('vi-VN')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
             <div className="text-sm text-slate-600 mb-2">Tổng thu</div>
            <div className="text-xl text-emerald-600">
              {stats.totalIncome.toLocaleString('vi-VN')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
             <div className="text-sm text-slate-600 mb-2">Tổng chi</div>
            <div className="text-xl text-red-600">
              {stats.totalExpense.toLocaleString('vi-VN')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
             <div className="text-sm text-slate-600 mb-2">Tồn quỹ</div>
            <div className="text-xl text-blue-600">
              {stats.closingBalance.toLocaleString('vi-VN')}
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
                 {/* First Row - Time + Search + Person */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   {/* Time Filter */}
                   <div className="space-y-2">
                     <Label className="text-xs text-slate-600">Thời gian</Label>
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
                   </div>

                   {/* Tìm kiếm */}
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

                   {/* Người nộp/nhận */}
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
                 </div>

                 {/* Second Row */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   {/* Loại thu chi */}
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

                    {/* Người tạo */}
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
                                            ? 'Người tạo'
                                            : `Đã chọn ${selectedCreators.length}`}
                                    </span>
                                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[240px] p-0">
                                <Command shouldFilter={false}>
                                    <CommandInput 
                                        placeholder="Tìm người tạo..." 
                                        value={creatorSearch}
                                        onValueChange={setCreatorSearch}
                                    />
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
                                {selectedCreators.map((id) => {
                                    const c = allCreators.find(x => x.id === id);
                                    return (
                                        <div key={id} className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                                            {c?.name ?? id}
                                            <button onClick={() => toggleCreator(id)} className="hover:bg-blue-200 rounded">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    )
                                })}
                             </div>
                        )}
                    </div>


                   {/* Loại giao dịch */}
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

                   {/* Trạng thái */}
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
      {/* Payment Method Filter */}
      <div className="flex items-center gap-2">
        <Button 
          variant={selectedMethods.length === 2 ? 'default' : 'outline'}
          onClick={() => setSelectedMethods(['cash', 'transfer'])}
          className={selectedMethods.length === 2 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-white border-slate-300'}
          size="sm"
        >
          Tất cả
        </Button>
        <Button 
          variant={selectedMethods.includes('cash') && selectedMethods.length === 1 ? 'default' : 'outline'}
          onClick={() => setSelectedMethods(['cash'])}
          className={selectedMethods.includes('cash') && selectedMethods.length === 1 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-white border-slate-300'}
          size="sm"
        >
          Tiền mặt
        </Button>
         <Button 
          variant={selectedMethods.includes('bank') && selectedMethods.length === 1 ? 'default' : 'outline'}
          onClick={() => setSelectedMethods(['bank'])}
          className={selectedMethods.includes('bank') && selectedMethods.length === 1 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-white border-slate-300'}
          size="sm"
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
                      <TableHead className="text-sm">
                          Ghi chú
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
                          <TableCell className="text-sm text-slate-500 max-w-[200px] truncate" title={transaction.note}>
                            {transaction.note}
                          </TableCell>
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
            <div className="flex items-center justify-between px-4 py-4 border-t border-slate-200 bg-slate-50 rounded-b-lg">
                <div className="text-sm text-slate-500">
                    Hiển thị {((page - 1) * limit) + 1} - {Math.min(page * limit, totalItems)} trong tổng số {totalItems} bản ghi
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronDown className="h-4 w-4 rotate-90" />
                    </Button>
                    <span className="text-sm font-medium text-slate-700">
                        Trang {page} / {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronDown className="h-4 w-4 -rotate-90" />
                    </Button>
                </div>
            </div>
            </CardContent>
          </Card>


      {/* Receipt Dialog */}
      <Dialog open={receiptDialogOpen} onOpenChange={(open: boolean) => {
        setReceiptDialogOpen(open);
        if (!open) {
            // Reset Receipt Form
            setReceiptPaymentType('cash');
            setReceiptCode('');
            setReceiptDate(new Date());
            setReceiptCategory('');
            setReceiptAmount('');
            setReceiptNote('');
            setReceiptPersonGroup('other');
            setReceiptPersonName('');
            setReceiptPaymentMethod('');
            setReceiptBankAccount('');
        }
      }}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>Lập phiếu thu</DialogTitle>
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
              {/* Kiểu thu - NEW: Added before Mã phiếu */}
              <div className="space-y-2">
                <Label htmlFor="receipt-payment-type">Kiểu thu</Label>
                <Select value={receiptPaymentType} onValueChange={setReceiptPaymentType}>
                  <SelectTrigger className="bg-white border border-slate-300 shadow-none">
                    <SelectValue placeholder="Chọn kiểu thu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Tiền mặt</SelectItem>
                    <SelectItem value="bank">Ngân hàng</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                      onSelect={(date: Date | undefined) => date && setReceiptDate(date)}
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
                    type="text"
                    value={receiptAmount}
                    onChange={handleReceiptAmountChange}
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
                <div className="flex gap-2">
                   <Popover open={receiptPersonSearchOpen} onOpenChange={setReceiptPersonSearchOpen}>
                    <PopoverTrigger asChild>
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="receipt-person-name"
                          value={receiptPersonName}
                          onChange={(e) => {
                            setReceiptPersonName(e.target.value);
                            setReceiptPersonSearchOpen(true);
                          }}
                          onFocus={() => {
                              setReceiptPersonSearchOpen(true);
                          }}
                          autoComplete="off"
                          placeholder="Tìm kiếm hoặc nhập tên"
                          className="pl-9 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                        />
                      </div>
                    </PopoverTrigger>
                    {/* Always render Content if open to show CommandEmpty/Loading */}
                    <PopoverContent className="w-[300px] p-0" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
                        <Command shouldFilter={false}>
                            <CommandList>
                            <CommandEmpty>Không tìm thấy.</CommandEmpty>
                            <CommandGroup heading="Gợi ý">
                                {receiptPersonOptions.map((option) => (
                                <CommandItem
                                    key={option.id}
                                    value={option.name}
                                    onSelect={() => {
                                    setReceiptPersonName(option.name);
                                    setReceiptPersonSearchOpen(false);
                                    }}
                                >
                                    {option.name} {option.phone ? ` - ${option.phone}` : ''}
                                </CommandItem>
                                ))}
                            </CommandGroup>
                            </CommandList>
                        </Command>
                        </PopoverContent>
                   </Popover>

                    {(receiptPersonGroup === 'other' || !receiptPersonGroup) && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setAddPersonDialogOpen(true)}
                          title="Thêm người nộp mới"
                        > <Plus className="h-4 w-4" /> </Button>
                    )}
                  </div>
              </div>

              {/* Bank fields - only show when receiptPaymentType is 'bank' */}
              {receiptPaymentType === 'bank' && (
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
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={(open: boolean) => {
        setPaymentDialogOpen(open);
        if (!open) {
             // Reset Payment Form
             setPaymentPaymentType('cash');
             setPaymentCode('');
             setPaymentDate(new Date());
             setPaymentCategory('');
             setPaymentAmount('');
             setPaymentNote('');
             setPaymentPersonGroup('other');
             setPaymentPersonName('');
             setPaymentPaymentMethod('');
             setPaymentBankAccount('');
        }
      }}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Lập phiếu chi</DialogTitle>
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
              {/* Kiểu chi - NEW: Added before Mã phiếu */}
              <div className="space-y-2">
                <Label htmlFor="payment-payment-type">Kiểu chi</Label>
                <Select value={paymentPaymentType} onValueChange={setPaymentPaymentType}>
                  <SelectTrigger className="bg-white border border-slate-300 shadow-none">
                    <SelectValue placeholder="Chọn kiểu chi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Tiền mặt</SelectItem>
                    <SelectItem value="bank">Ngân hàng</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                      onSelect={(date: Date | undefined) => date && setPaymentDate(date)}
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
                <div className="flex gap-2">
                  <Popover open={paymentPersonSearchOpen} onOpenChange={setPaymentPersonSearchOpen}>
                    <PopoverTrigger asChild>
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="payment-person-name"
                          value={paymentPersonName}
                          onChange={(e) => {
                            setPaymentPersonName(e.target.value);
                            setPaymentPersonSearchOpen(true);
                          }}
                          onFocus={() => {
                              setPaymentPersonSearchOpen(true);
                          }}
                          autoComplete="off"
                          placeholder="Tìm kiếm hoặc nhập tên"
                          className="pl-9 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                        />
                      </div>
                    </PopoverTrigger>
                    {/* Always render Content if open */}
                        <PopoverContent className="w-[300px] p-0" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
                        <Command shouldFilter={false}>
                            <CommandList>
                            <CommandEmpty>Không tìm thấy.</CommandEmpty>
                            <CommandGroup heading="Gợi ý">
                                {paymentPersonOptions.map((option) => (
                                <CommandItem
                                    key={option.id}
                                    value={option.name}
                                    onSelect={() => {
                                    setPaymentPersonName(option.name);
                                    setPaymentPersonSearchOpen(false);
                                    }}
                                >
                                    {option.name} {option.phone ? ` - ${option.phone}` : ''}
                                </CommandItem>
                                ))}
                            </CommandGroup>
                            </CommandList>
                        </Command>
                        </PopoverContent>
                   </Popover>

                    {(paymentPersonGroup === 'other' || !paymentPersonGroup) && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setAddPersonDialogOpen(true)}
                          title="Thêm người nhận mới"
                        > <Plus className="h-4 w-4" /> </Button>
                    )}
                  </div>
              </div>

              {/* Bank fields - only show when paymentPaymentType is 'bank' */}
              {paymentPaymentType === 'bank' && (
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
      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={(open: boolean) => setExportDialogOpen(open)}>
        <DialogContent className="sm:max-w-[100px]" style={{ width: "30vw" }}>
          <DialogHeader>
            <DialogTitle>Xuất file Excel</DialogTitle>
            <DialogDescription>
              Chọn khoảng thời gian cần xuất dữ liệu
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-2">
                    <Label>Từ ngày</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !exportDateFrom && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {exportDateFrom ? format(exportDateFrom, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={exportDateFrom}
                                onSelect={setExportDateFrom}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="flex flex-col space-y-2">
                    <Label>Đến ngày</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !exportDateTo && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {exportDateTo ? format(exportDateTo, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={exportDateTo}
                                onSelect={setExportDateTo}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>Hủy</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={processExport}>Xuất file</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
