import { Input } from "./ui/input";

interface CurrencyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: number | string;
  onValueChange: (value: number) => void;
}

export const CurrencyInput = ({ value, onValueChange, className, ...props }: CurrencyInputProps) => {
  const formatNumber = (num: number | string) => {
    if (!num && num !== 0) return '';
    return Number(num).toLocaleString('vi-VN');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\./g, '');
    if (rawValue === '' || /^\d+$/.test(rawValue)) {
      onValueChange(Number(rawValue));
    }
  };

  return (
    <div className="relative">
      <Input
        {...props}
        type="text"
        className={className}
        value={formatNumber(value)}
        onChange={handleChange}
      />
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 text-sm pointer-events-none">
        đ
      </div>
    </div>
  );
};
