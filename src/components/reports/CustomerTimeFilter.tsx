import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar as CalendarComponent } from '../ui/calendar';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface CustomerTimeFilterProps {
  dateRangeType: 'preset' | 'custom';
  timePreset: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  onDateRangeTypeChange: (type: 'preset' | 'custom') => void;
  onTimePresetChange: (preset: string) => void;
  onDateFromChange: (date: Date | undefined) => void;
  onDateToChange: (date: Date | undefined) => void;
}

export function CustomerTimeFilter({
  dateRangeType,
  timePreset,
  dateFrom,
  dateTo,
  onDateRangeTypeChange,
  onTimePresetChange,
  onDateFromChange,
  onDateToChange,
}: CustomerTimeFilterProps) {
  return (
    <div>
      <h3 className="text-sm text-slate-900 mb-3">Thời gian</h3>
      <RadioGroup value={dateRangeType} onValueChange={(value) => onDateRangeTypeChange(value as 'preset' | 'custom')}>
        {/* Preset Time Ranges */}
        <div className="flex items-center space-x-2 mb-3">
          <RadioGroupItem value="preset" id="customer-date-preset" className="border-slate-300" />
          <div className="flex-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between text-left text-sm bg-white border-slate-300"
                  onClick={() => onDateRangeTypeChange('preset')}
                >
                  <span>
                    {timePreset === 'today' && 'Hôm nay'}
                    {timePreset === 'yesterday' && 'Hôm qua'}
                    {timePreset === 'this-week' && 'Tuần này'}
                    {timePreset === 'last-week' && 'Tuần trước'}
                    {timePreset === 'last-7-days' && '7 ngày qua'}
                    {timePreset === 'this-month' && 'Tháng này'}
                    {timePreset === 'last-month' && 'Tháng trước'}
                    {timePreset === 'this-month-lunar' && 'Tháng này (âm lịch)'}
                    {timePreset === 'last-month-lunar' && 'Tháng trước (âm lịch)'}
                    {timePreset === 'last-30-days' && '30 ngày qua'}
                    {timePreset === 'this-quarter' && 'Quý này'}
                    {timePreset === 'last-quarter' && 'Quý trước'}
                    {timePreset === 'this-year' && 'Năm nay'}
                    {timePreset === 'last-year' && 'Năm trước'}
                    {timePreset === 'this-year-lunar' && 'Năm nay (âm lịch)'}
                    {timePreset === 'last-year-lunar' && 'Năm trước (âm lịch)'}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[600px] p-4" align="start">
                <div className="grid grid-cols-3 gap-6">
                  {/* Column 1: Theo ngày và tuần */}
                  <div>
                    <h4 className="text-sm text-slate-700 mb-3">Theo ngày và tuần</h4>
                    <div className="space-y-2">
                      {[
                        { value: 'today', label: 'Hôm nay' },
                        { value: 'yesterday', label: 'Hôm qua' },
                        { value: 'this-week', label: 'Tuần này' },
                        { value: 'last-week', label: 'Tuần trước' },
                        { value: 'last-7-days', label: '7 ngày qua' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            onTimePresetChange(option.value);
                            onDateRangeTypeChange('preset');
                          }}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            timePreset === option.value
                              ? 'bg-blue-600 text-white'
                              : 'text-blue-600 hover:bg-blue-50'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Column 2: Theo tháng và quý */}
                  <div>
                    <h4 className="text-sm text-slate-700 mb-3">Theo tháng và quý</h4>
                    <div className="space-y-2">
                      {[
                        { value: 'this-month', label: 'Tháng này' },
                        { value: 'last-month', label: 'Tháng trước' },
                        { value: 'this-month-lunar', label: 'Tháng này (âm lịch)' },
                        { value: 'last-month-lunar', label: 'Tháng trước (âm lịch)' },
                        { value: 'last-30-days', label: '30 ngày qua' },
                        { value: 'this-quarter', label: 'Quý này' },
                        { value: 'last-quarter', label: 'Quý trước' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            onTimePresetChange(option.value);
                            onDateRangeTypeChange('preset');
                          }}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            timePreset === option.value
                              ? 'bg-blue-600 text-white'
                              : 'text-blue-600 hover:bg-blue-50'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Column 3: Theo năm */}
                  <div>
                    <h4 className="text-sm text-slate-700 mb-3">Theo năm</h4>
                    <div className="space-y-2">
                      {[
                        { value: 'this-year', label: 'Năm nay' },
                        { value: 'last-year', label: 'Năm trước' },
                        { value: 'this-year-lunar', label: 'Năm nay (âm lịch)' },
                        { value: 'last-year-lunar', label: 'Năm trước (âm lịch)' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            onTimePresetChange(option.value);
                            onDateRangeTypeChange('preset');
                          }}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            timePreset === option.value
                              ? 'bg-blue-600 text-white'
                              : 'text-blue-600 hover:bg-blue-50'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Custom Date Range */}
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="custom" id="customer-date-custom" className="border-slate-300" />
          <div className="flex-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left text-sm bg-white border-slate-300"
                  onClick={() => onDateRangeTypeChange('custom')}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom && dateTo
                    ? `${format(dateFrom, 'dd/MM', { locale: vi })} - ${format(dateTo, 'dd/MM/yyyy', { locale: vi })}`
                    : 'Lựa chọn khác'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4" align="start">
                <div className="flex gap-4">
                  <div>
                    <Label className="text-xs text-slate-600 mb-2 block">Từ ngày</Label>
                    <CalendarComponent
                      mode="single"
                      selected={dateFrom}
                      onSelect={(date) => {
                        if (date) {
                          onDateFromChange(date);
                          onDateRangeTypeChange('custom');
                        }
                      }}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-600 mb-2 block">Đến ngày</Label>
                    <CalendarComponent
                      mode="single"
                      selected={dateTo}
                      onSelect={(date) => {
                        if (date) {
                          onDateToChange(date);
                          onDateRangeTypeChange('custom');
                        }
                      }}
                      disabled={(date) => dateFrom ? date < dateFrom : false}
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </RadioGroup>
    </div>
  );
}
