import { useState } from 'react';
import { Plus, Edit, Trash2, Clock, AlertCircle, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Alert, AlertDescription } from '../ui/alert';

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  lateAllowance: number; // phút được phép đi muộn
  earlyLeaveAllowance: number; // phút được phép về sớm
  workHourCalculation: string; // Tính theo ca hoặc thực tế
  overtimeCalculation: string; // Tính lương tăng ca
  overtimeHourlyRate?: number; // Mức lương theo giờ mới (nếu chọn hourly_rate)
  overtimePercentage?: number; // % lương chính (nếu chọn percentage)
  color: string;
}

interface ShiftManagementProps {
  shifts: Shift[];
  setShifts: (shifts: Shift[]) => void;
}

export function ShiftManagement({ shifts, setShifts }: ShiftManagementProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Partial<Shift>>({
    name: '',
    startTime: '',
    endTime: '',
    lateAllowance: 10,
    earlyLeaveAllowance: 10,
    workHourCalculation: 'fixed',
    overtimeCalculation: 'percentage',
    overtimePercentage: 150,
    color: 'bg-amber-100 border-amber-300',
  });

  const handleOpenDialog = (shift?: Shift) => {
    if (shift) {
      setEditingShift(shift);
      setFormData(shift);
    } else {
      setEditingShift(null);
      setFormData({
        name: '',
        startTime: '',
        endTime: '',
        lateAllowance: 10,
        earlyLeaveAllowance: 10,
        workHourCalculation: 'fixed',
        overtimeCalculation: 'percentage',
        overtimePercentage: 150,
        color: 'bg-amber-100 border-amber-300',
      });
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.startTime || !formData.endTime) {
      return;
    }

    if (editingShift) {
      // Update existing shift
      setShifts(shifts.map(s => 
        s.id === editingShift.id ? { ...formData, id: s.id } as Shift : s
      ));
    } else {
      // Create new shift
      const newShift: Shift = {
        ...formData as Shift,
        id: Date.now().toString(),
      };
      setShifts([...shifts, newShift]);
    }

    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa ca làm việc này?')) {
      setShifts(shifts.filter(s => s.id !== id));
    }
  };

  const calculateShiftDuration = (start: string, end: string) => {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    
    let hours = endHour - startHour;
    let mins = endMin - startMin;
    
    if (hours < 0) hours += 24; // Handle overnight shifts
    if (mins < 0) {
      hours -= 1;
      mins += 60;
    }
    
    return `${hours}h${mins > 0 ? ` ${mins}p` : ''}`;
  };

  const colorOptions = [
    { value: 'bg-amber-100 border-amber-300', label: 'Vàng cam' },
    { value: 'bg-blue-100 border-blue-300', label: 'Xanh dương' },
    { value: 'bg-purple-100 border-purple-300', label: 'Tím' },
    { value: 'bg-green-100 border-green-300', label: 'Xanh lá' },
    { value: 'bg-pink-100 border-pink-300', label: 'Hồng' },
    { value: 'bg-red-100 border-red-300', label: 'Đỏ' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-neutral-900">Danh sách ca làm việc</h2>
          <p className="text-sm text-neutral-600 mt-1">Cấu hình chi tiết cho từng ca làm việc</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-amber-700 hover:bg-amber-800">
          <Plus className="w-4 h-4 mr-2" />
          Thêm ca mới
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shifts.map(shift => (
          <Card key={shift.id} className={`border ${shift.color.split(' ')[1]}`}>
            <CardHeader className={shift.color.split(' ')[0]}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg text-neutral-900">{shift.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="w-4 h-4 text-neutral-600" />
                    <span className="text-sm text-neutral-700">
                      {shift.startTime} - {shift.endTime}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {calculateShiftDuration(shift.startTime, shift.endTime)}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleOpenDialog(shift)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(shift.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Đi muộn tối đa:</span>
                  <span className="text-neutral-900">{shift.lateAllowance} phút</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Về sớm tối đa:</span>
                  <span className="text-neutral-900">{shift.earlyLeaveAllowance} phút</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Tính giờ làm:</span>
                  <Badge variant="outline" className="text-xs">
                    {shift.workHourCalculation === 'fixed' ? 'Theo ca' : 'Thực tế'}
                  </Badge>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-neutral-600">Lương tăng ca:</span>
                  <div className="text-right">
                    {shift.overtimeCalculation === 'percentage' ? (
                      <span className="text-neutral-900">{shift.overtimePercentage}% lương</span>
                    ) : (
                      <span className="text-neutral-900">
                        {shift.overtimeHourlyRate?.toLocaleString('vi-VN')}đ/giờ
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingShift ? 'Chỉnh sửa ca làm việc' : 'Thêm ca làm việc mới'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm text-neutral-900">Thông tin cơ bản</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên ca làm việc *</Label>
                  <Input
                    id="name"
                    placeholder="VD: Ca sáng, Ca chiều..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">Màu hiển thị</Label>
                  <Select
                    value={formData.color}
                    onValueChange={(value) => setFormData({ ...formData, color: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded ${opt.value.split(' ')[0]} border ${opt.value.split(' ')[1]}`} />
                            {opt.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Thời gian bắt đầu *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">Thời gian kết thúc *</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>

              {formData.startTime && formData.endTime && (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Thời lượng ca: {calculateShiftDuration(formData.startTime, formData.endTime)}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Attendance Settings */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm text-neutral-900">Cài đặt chấm công</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lateAllowance">Thời gian được phép đi muộn (phút)</Label>
                  <Input
                    id="lateAllowance"
                    type="number"
                    min="0"
                    value={formData.lateAllowance}
                    onChange={(e) => setFormData({ ...formData, lateAllowance: Number(e.target.value) })}
                  />
                  <p className="text-xs text-neutral-500">
                    Nhân viên đi muộn trong khoảng này sẽ không bị trừ lương
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="earlyLeaveAllowance">Thời gian được phép về sớm (phút)</Label>
                  <Input
                    id="earlyLeaveAllowance"
                    type="number"
                    min="0"
                    value={formData.earlyLeaveAllowance}
                    onChange={(e) => setFormData({ ...formData, earlyLeaveAllowance: Number(e.target.value) })}
                  />
                  <p className="text-xs text-neutral-500">
                    Nhân viên về sớm trong khoảng này sẽ không bị trừ lương
                  </p>
                </div>
              </div>
            </div>

            {/* Work Hour Calculation */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm text-neutral-900">Cách tính giờ làm việc</h3>
              
              <RadioGroup
                value={formData.workHourCalculation}
                onValueChange={(value: string) => 
                  setFormData({ ...formData, workHourCalculation: value })
                }
              >
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-neutral-50">
                    <RadioGroupItem value="fixed" id="fixed" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="fixed" className="cursor-pointer">
                        Tính theo số giờ của ca
                      </Label>
                      <p className="text-sm text-neutral-500 mt-1">
                        Chỉ tính giờ đủ và giờ thiếu, không tính giờ dư. 
                        Phù hợp cho ca làm việc cố định.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-neutral-50">
                    <RadioGroupItem value="actual" id="actual" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="actual" className="cursor-pointer">
                        Tính theo thời gian chấm công
                      </Label>
                      <p className="text-sm text-neutral-500 mt-1">
                        Tính chính xác theo giờ vào/ra thực tế, có thể tính cả giờ dư. 
                        Phù hợp cho ca làm linh hoạt.
                      </p>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Overtime Calculation */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm text-neutral-900">Cách tính lương tăng ca</h3>
              
              <RadioGroup
                value={formData.overtimeCalculation}
                onValueChange={(value: string) => 
                  setFormData({ ...formData, overtimeCalculation: value })
                }
              >
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-neutral-50">
                    <RadioGroupItem value="percentage" id="percentage" className="mt-1" />
                    <div className="flex-1 space-y-3">
                      <div>
                        <Label htmlFor="percentage" className="cursor-pointer">
                          Tính theo % lương chính
                        </Label>
                        <p className="text-sm text-neutral-500 mt-1">
                          Lương tăng ca = (Lương cơ bản / Số giờ chuẩn) × % × Số giờ tăng ca
                        </p>
                      </div>
                      {formData.overtimeCalculation === 'percentage' && (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="100"
                            step="10"
                            value={formData.overtimePercentage || 150}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              overtimePercentage: Number(e.target.value) 
                            })}
                            className="w-24"
                          />
                          <span className="text-sm text-neutral-700">% lương cơ bản</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-neutral-50">
                    <RadioGroupItem value="hourly_rate" id="hourly_rate" className="mt-1" />
                    <div className="flex-1 space-y-3">
                      <div>
                        <Label htmlFor="hourly_rate" className="cursor-pointer">
                          Lương theo giờ tăng ca
                        </Label>
                        <p className="text-sm text-neutral-500 mt-1">
                          Áp dụng mức lương cố định cho mỗi giờ tăng ca
                        </p>
                      </div>
                      {formData.overtimeCalculation === 'hourly_rate' && (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            step="1000"
                            value={formData.overtimeHourlyRate || 50000}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              overtimeHourlyRate: Number(e.target.value) 
                            })}
                            className="w-32"
                          />
                          <span className="text-sm text-neutral-700">đ/giờ</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-amber-700 hover:bg-amber-800"
              disabled={!formData.name || !formData.startTime || !formData.endTime}
            >
              {editingShift ? 'Cập nhật' : 'Tạo ca làm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}