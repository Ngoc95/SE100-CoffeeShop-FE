import { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command';

export interface Employee {
  id: string;
  code?: string;
  name: string;
}

interface EmployeeFilterProps {
  employees: Employee[];
  selectedEmployeeIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  label?: string;
  placeholder?: string;
}

export function EmployeeFilter({
  employees,
  selectedEmployeeIds,
  onSelectionChange,
  label = 'Nhân viên',
  placeholder = 'Tìm nhân viên...',
}: EmployeeFilterProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  const toggleEmployee = (employeeId: string) => {
    const newSelection = selectedEmployeeIds.includes(employeeId)
      ? selectedEmployeeIds.filter(id => id !== employeeId)
      : [...selectedEmployeeIds, employeeId];
    onSelectionChange(newSelection);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(employees.map(e => e.id));
    } else {
      onSelectionChange([]);
    }
  };

  const isAllSelected = selectedEmployeeIds.length === 0 || selectedEmployeeIds.length === employees.length;

  return (
    <div>
      <h3 className="text-sm text-slate-900 mb-2">{label}</h3>
      <Popover open={searchOpen} onOpenChange={setSearchOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between h-9 text-sm"
          >
            <span className="text-slate-500">
              {selectedEmployeeIds.length === 0
                ? 'Tất cả'
                : `Đã chọn ${selectedEmployeeIds.length}`}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[240px] p-0">
          <Command>
            <CommandInput placeholder={placeholder} />
            <CommandList>
              <CommandEmpty>Không tìm thấy.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                <CommandItem
                  onSelect={() => handleSelectAll(!isAllSelected)}
                >
                  <Checkbox
                    checked={isAllSelected}
                    className="mr-2"
                  />
                  Tất cả
                </CommandItem>
                {employees.map((employee) => (
                  <CommandItem
                    key={employee.id}
                    onSelect={() => toggleEmployee(employee.id)}
                  >
                    <Checkbox
                      checked={selectedEmployeeIds.includes(employee.id)}
                      className="mr-2"
                    />
                    {employee.code ? `${employee.code} - ${employee.name}` : employee.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedEmployeeIds.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedEmployeeIds.map((employeeId) => {
            const employee = employees.find(e => e.id === employeeId);
            return (
              <div
                key={employeeId}
                className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs"
              >
                {employee?.code ? `${employee.code} - ${employee.name}` : employee?.name}
                <button
                  onClick={() => toggleEmployee(employeeId)}
                  className="hover:bg-blue-100 rounded"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

