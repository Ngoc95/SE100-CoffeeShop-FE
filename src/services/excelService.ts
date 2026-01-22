import axiosClient from "../api/axiosClient";
import { saveAs } from 'file-saver';

// Define supported modules
export type ImportExportModule = 'inventory' | 'customer' | 'staff' | 'supplier' | 'customer-group';

export const excelService = {
  /**
   * Download Template
   */
  downloadTemplate: async (module: ImportExportModule, params?: any) => {
    try {
      const response = await axiosClient.get(`/io/${module}/template`, {
        params,
        responseType: 'blob',
      });
      saveAs(response.data, `${module}_template.xlsx`);
      return true;
    } catch (error) {
      console.error('Download template error:', error);
      throw error;
    }
  },

  /**
   * Export Data
   */
  exportData: async (module: ImportExportModule, fileName?: string) => {
    try {
      const response = await axiosClient.get(`/io/${module}/export`, {
        responseType: 'blob',
      });
      // Get filename from header or use default
      const name = fileName || `${module}_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(response.data, name);
      return true;
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  },

  /**
   * Import Data
   * Returns result with stats
   */
  importData: async (module: ImportExportModule, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axiosClient.post(`/io/${module}/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Import error:', error);
      throw error;
    }
  }
};
