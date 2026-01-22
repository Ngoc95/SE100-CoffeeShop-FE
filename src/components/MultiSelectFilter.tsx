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

export interface SelectableItem {
    id: number | string;
    name: string;
    code?: string;
}

interface MultiSelectFilterProps {
    items: SelectableItem[];
    selectedIds: Array<number | string>;
    onSelectionChange: (selectedIds: Array<number | string>) => void;
    label?: string;
    placeholder?: string;
}

export function MultiSelectFilter({
    items,
    selectedIds,
    onSelectionChange,
    label = 'Chọn',
    placeholder = 'Tìm kiếm...',
}: MultiSelectFilterProps) {
    const [searchOpen, setSearchOpen] = useState(false);

    const toggleItem = (itemId: number | string) => {
        const newSelection = selectedIds.includes(itemId)
            ? selectedIds.filter(id => id !== itemId)
            : [...selectedIds, itemId];
        onSelectionChange(newSelection);
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            onSelectionChange(items.map(e => e.id));
        } else {
            onSelectionChange([]);
        }
    };

    const isAllSelected = selectedIds.length === 0 || selectedIds.length === items.length;

    return (
        <div>
            <h3 className="text-sm text-slate-900 mb-3">{label}</h3>
            <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between h-9 text-sm bg-white border-slate-300"
                    >
                        <span className="text-slate-700">
                            {selectedIds.length === 0
                                ? 'Tất cả'
                                : `Đã chọn ${selectedIds.length}`}
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
                                {items.map((item) => (
                                    <CommandItem
                                        key={item.id}
                                        onSelect={() => toggleItem(item.id)}
                                    >
                                        <Checkbox
                                            checked={selectedIds.includes(item.id)}
                                            className="mr-2"
                                        />
                                        {item.code ? `${item.code} - ${item.name}` : item.name}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            {selectedIds.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                    {selectedIds.map((itemId) => {
                        const item = items.find(e => e.id === itemId);
                        return (
                            <div
                                key={itemId}
                                className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs"
                            >
                                {item?.code ? `${item.code} - ${item.name}` : item?.name}
                                <button
                                    onClick={() => toggleItem(itemId)}
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
