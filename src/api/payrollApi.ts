import axiosClient from './axiosClient';
import { CreatePayrollDto, Payroll, PayrollPayment, PayrollPaymentDto, PayrollQueryDto, Payslip, UpdatePayslipDto } from '../types/payroll';

const payrollApi = {
  getAll: (params?: PayrollQueryDto) => {
    return axiosClient.get<Payroll[]>('/payrolls', { params });
  },

  create: (data: CreatePayrollDto) => {
    return axiosClient.post<Payroll>('/payrolls', data);
  },

  getPayslips: (payrollId: number) => {
    return axiosClient.get<Payslip[]>(`/payrolls/${payrollId}/payslips`);
  },

  updatePayslip: (payrollId: number, staffId: number, data: UpdatePayslipDto) => {
    return axiosClient.patch<Payslip>(`/payrolls/${payrollId}/payslips/${staffId}`, data);
  },

  addPayment: (payrollId: number, data: PayrollPaymentDto) => {
    return axiosClient.post<PayrollPayment>(`/payrolls/${payrollId}/payment`, data);
  },

  finalize: (payrollId: number) => {
    return axiosClient.patch<Payroll>(`/payrolls/${payrollId}/finalize`);
  },

  reload: (id: number) => {
    return axiosClient.post(`/payrolls/${id}/reload`);
  },

  export: (id: number) => {
    return axiosClient.get(`/payrolls/${id}/export`, { responseType: 'blob' });
  },

  delete: (id: number) => {
    return axiosClient.delete(`/payrolls/${id}`);
  }
};

export default payrollApi;
