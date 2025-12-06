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

export interface Category {
  id: string;
  name: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryNames: string[];
  onSelectionChange: (selectedNames: string[]) => void;
  label?: string;
  placeholder?: string;
}

export function CategoryFilter({
  categories,
  selectedCategoryNames,
  onSelectionChange,
  label = 'Loại thu chi',
  placeholder = 'Tìm loại thu chi...',
}: CategoryFilterProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  const toggleCategory = (categoryName: string) => {
    const newSelection = selectedCategoryNames.includes(categoryName)
      ? selectedCategoryNames.filter(name => name !== categoryName)
      : [...selectedCategoryNames, categoryName];
    onSelectionChange(newSelection);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(categories.map(c => c.name));
    } else {
      onSelectionChange([]);
    }
  };

  const isAllSelected = selectedCategoryNames.length === 0 || selectedCategoryNames.length === categories.length;

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
              {selectedCategoryNames.length === 0
                ? 'Tất cả'
                : `Đã chọn ${selectedCategoryNames.length}`}
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
                {categories.map((category) => (
                  <CommandItem
                    key={category.id}
                    onSelect={() => toggleCategory(category.name)}
                  >
                    <Checkbox
                      checked={selectedCategoryNames.includes(category.name)}
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
      {selectedCategoryNames.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedCategoryNames.map((categoryName) => (
            <div
              key={categoryName}
              className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs"
            >
              {categoryName}
              <button
                onClick={() => toggleCategory(categoryName)}
                className="hover:bg-blue-100 rounded"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

