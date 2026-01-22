import { StaffShort } from './hr';

export interface PayrollPayment {
  id: number;
  payslipId: number;
  amount: number;
  method: 'cash' | 'transfer';
  bankName?: string;
  bankAccount?: string;
  note?: string;
  financeTransactionId?: number;
  financeTransaction?: { code: string };
  createdBy?: number;
  createdAt: string;
}

export interface Payslip {
  id: number;
  code: string;
  payrollId: number;
  staffId: number;
  baseSalary: number;
  totalSalary: number;
  workDays: number;
  bonus: number;
  penalty: number;
  paidAmount: number;
  notes?: string;
  createdAt: string;
  
  staff?: StaffShort;
  payments?: PayrollPayment[];
}

export interface Payroll {
  id: number;
  code: string;
  name: string;
  periodStart: string;
  periodEnd: string;
  status: 'draft' | 'finalized';
  totalAmount: number;
  paidAmount: number;
  createdBy?: number;
  finalizedAt?: string;
  createdAt: string;
  
  payslips?: Payslip[];
  _count?: {
      payslips: number;
  };
}

export interface CreatePayrollDto {
  month: number;
  year: number;
}

export interface PayrollQueryDto {
  month?: number;
  year?: number;
}

export interface UpdatePayslipDto {
  bonus?: number;
  penalty?: number;
  notes?: string;
}

export interface PayrollPaymentDto {
  staffId: number;
  amount: number;
  method: 'cash' | 'transfer';
  bankName?: string;
  bankAccount?: string;
  note?: string;
}
