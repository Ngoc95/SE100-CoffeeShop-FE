import { useState, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface SimpleSearchSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function SimpleSearchSelect({
  value,
  onValueChange,
  options,
  placeholder = "Chọn...",
  disabled = false,
  className = "",
}: SimpleSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(search.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="w-full justify-between bg-white border-slate-300"
        disabled={disabled}
        onClick={() => setOpen(!open)}
      >
        <span className={value ? "" : "text-slate-500"}>
          {value || placeholder}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {open && (
        <div 
          className="absolute z-[10000] w-full mt-1 bg-white border border-slate-300 rounded-md shadow-lg"
          style={{ maxHeight: '300px' }}
        >
          <div className="p-2 border-b border-slate-300">
            <Input
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="max-h-[200px] overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-slate-500">
                Không tìm thấy kết quả
              </div>
            ) : (
              <div className="p-1">
                {filteredOptions.map((option) => (
                  <div
                    key={option}
                    className={`
                      flex items-center px-2 py-1.5 text-sm rounded cursor-pointer
                      hover:bg-blue-50 transition-colors
                      ${value === option ? 'bg-blue-50' : ''}
                    `}
                    onClick={() => {
                      onValueChange(option);
                      setOpen(false);
                      setSearch('');
                    }}
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${
                        value === option ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
