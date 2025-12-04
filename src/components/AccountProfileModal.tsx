import { useState, useEffect } from 'react';
import { User, Lock, Eye, EyeOff, Save } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';

interface AccountProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountProfileModal({ open, onOpenChange }: AccountProfileModalProps) {
  const { user } = useAuth();
  
  // Username change state
  const [username, setUsername] = useState('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Update username when modal opens
  useEffect(() => {
    if (open && user) {
      setUsername(user.username);
    }
  }, [open, user]);

  const handleUsernameChange = () => {
    // Validation
    if (!username || username.trim() === '') {
      toast.error('Tên đăng nhập không được để trống');
      return;
    }

    if (username.length < 3) {
      toast.error('Tên đăng nhập phải có ít nhất 3 ký tự');
      return;
    }

    // In real app, this would call API
    toast.success('Đổi tên đăng nhập thành công!');
    setIsEditingUsername(false);
  };

  const handlePasswordChange = () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu mới và xác nhận mật khẩu không khớp');
      return;
    }

    // In real app, this would call API
    toast.success('Đổi mật khẩu thành công!');
    
    // Reset form
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thông tin tài khoản</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="personal">
              <User className="w-4 h-4 mr-2" />
              Thông tin cá nhân
            </TabsTrigger>
            <TabsTrigger value="account">
              <Lock className="w-4 h-4 mr-2" />
              Thông tin tài khoản
            </TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal" className="space-y-4 mt-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-amber-800">
                ℹ️ Thông tin cá nhân chỉ có thể được chỉnh sửa bởi Quản lý trong module Nhân viên
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Họ và tên</Label>
                <Input 
                  value={user?.fullName || ''} 
                  disabled 
                  className="bg-slate-50"
                />
              </div>

              <div className="space-y-2">
                <Label>Vai trò</Label>
                <Input 
                  value={user?.roleLabel || ''} 
                  disabled 
                  className="bg-slate-50"
                />
              </div>

              <div className="space-y-2">
                <Label>Mã nhân viên</Label>
                <Input 
                  value="NV001" 
                  disabled 
                  className="bg-slate-50"
                />
              </div>

              <div className="space-y-2">
                <Label>Số điện thoại</Label>
                <Input 
                  value="0901234567" 
                  disabled 
                  className="bg-slate-50"
                />
              </div>

              <div className="space-y-2">
                <Label>CMND/CCCD</Label>
                <Input 
                  value="001234567890" 
                  disabled 
                  className="bg-slate-50"
                />
              </div>

              <div className="space-y-2">
                <Label>Ngày sinh</Label>
                <Input 
                  type="date"
                  value="1990-01-01" 
                  disabled 
                  className="bg-slate-50"
                />
              </div>

              <div className="space-y-2">
                <Label>Giới tính</Label>
                <Input 
                  value="Nam" 
                  disabled 
                  className="bg-slate-50"
                />
              </div>

              <div className="space-y-2">
                <Label>Ngày vào làm</Label>
                <Input 
                  type="date"
                  value="2023-01-15" 
                  disabled 
                  className="bg-slate-50"
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label>Địa chỉ</Label>
                <Input 
                  value="123 Nguyễn Huệ, Phường Bến Nghé, TP. Hồ Chí Minh" 
                  disabled 
                  className="bg-slate-50"
                />
              </div>
            </div>
          </TabsContent>

          {/* Account Information Tab */}
          <TabsContent value="account" className="space-y-4 mt-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                🔒 Bạn có thể thay đổi mật khẩu của mình tại đây
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tên đăng nhập</Label>
                <div className="flex gap-2">
                  <Input 
                    value={username} 
                    disabled={!isEditingUsername}
                    onChange={(e) => setUsername(e.target.value)}
                    className={!isEditingUsername ? 'bg-slate-50' : ''}
                  />
                  {!isEditingUsername ? (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditingUsername(true)}
                    >
                      Chỉnh sửa
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setUsername(user?.username || '');
                          setIsEditingUsername(false);
                        }}
                      >
                        Hủy
                      </Button>
                      <Button
                        onClick={handleUsernameChange}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Lưu
                      </Button>
                    </>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  {isEditingUsername 
                    ? 'Tên đăng nhập phải có ít nhất 3 ký tự'
                    : 'Click "Chỉnh sửa" để thay đổi tên đăng nhập'}
                </p>
              </div>

              <div className="border-t pt-4">
                <h4 className="mb-4">Đổi mật khẩu</h4>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mật khẩu hiện tại *</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        placeholder="Nhập mật khẩu hiện tại"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        tabIndex={-1}
                      >
                        {showCurrentPassword ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Mật khẩu mới *</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        tabIndex={-1}
                      >
                        {showNewPassword ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới *</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Nhập lại mật khẩu mới"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button 
                    onClick={handlePasswordChange}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Lưu mật khẩu mới
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}