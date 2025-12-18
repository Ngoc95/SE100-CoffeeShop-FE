import { useState } from 'react';
import { Plus, Edit, Trash2, Coffee, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';

export function MenuRecipe() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const menuItems = [
    {
      id: '1',
      name: 'Cà phê sữa đá',
      category: 'Cà phê',
      price: 35000,
      cost: 12000,
      prepTime: 3,
      status: 'active',
      recipe: [
        { ingredient: 'Cà phê phin', amount: 25, unit: 'g' },
        { ingredient: 'Sữa đặc', amount: 30, unit: 'ml' },
        { ingredient: 'Đá viên', amount: 100, unit: 'g' },
      ],
    },
    {
      id: '2',
      name: 'Bạc xỉu',
      category: 'Cà phê',
      price: 30000,
      cost: 10000,
      prepTime: 3,
      status: 'active',
      recipe: [
        { ingredient: 'Cà phê phin', amount: 15, unit: 'g' },
        { ingredient: 'Sữa đặc', amount: 40, unit: 'ml' },
        { ingredient: 'Đá viên', amount: 100, unit: 'g' },
      ],
    },
    {
      id: '3',
      name: 'Trà đào cam sả',
      category: 'Trà',
      price: 40000,
      cost: 15000,
      prepTime: 5,
      status: 'active',
      recipe: [
        { ingredient: 'Trà', amount: 20, unit: 'g' },
        { ingredient: 'Đào', amount: 50, unit: 'g' },
        { ingredient: 'Cam', amount: 30, unit: 'g' },
        { ingredient: 'Sả', amount: 10, unit: 'g' },
        { ingredient: 'Đường', amount: 20, unit: 'g' },
      ],
    },
  ];

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-blue-900 text-2xl font-semibold">Thực đơn & Công thức</h1>
          <p className="text-neutral-600 mt-1">Quản lý món ăn và công thức pha chế</p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-700 hover:bg-amber-800">
              <Plus className="w-4 h-4 mr-2" />
              Thêm món mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>Thêm món mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tên món</Label>
                  <Input placeholder="Nhập tên món" />
                </div>
                <div>
                  <Label>Danh mục</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coffee">Cà phê</SelectItem>
                      <SelectItem value="tea">Trà</SelectItem>
                      <SelectItem value="smoothie">Sinh tố</SelectItem>
                      <SelectItem value="pastry">Bánh ngọt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Giá bán</Label>
                  <Input type="number" placeholder="0" />
                </div>
                <div>
                  <Label>Thời gian pha chế (phút)</Label>
                  <Input type="number" placeholder="0" />
                </div>
              </div>
              <div>
                <Label>Mô tả</Label>
                <Textarea placeholder="Nhập mô tả món..." rows={3} />
              </div>
              <div>
                <Label>Công thức</Label>
                <div className="space-y-2 mt-2">
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm nguyên liệu
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Hủy
              </Button>
              <Button className="bg-amber-700 hover:bg-amber-800">
                Thêm món
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {menuItems.map(item => (
          <Card key={item.id} className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg text-neutral-900">{item.name}</CardTitle>
                  <Badge variant="secondary" className="mt-2">{item.category}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Giá bán:</span>
                <span className="text-amber-900">{item.price.toLocaleString()}₫</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Giá vốn:</span>
                <span className="text-neutral-900">{item.cost.toLocaleString()}₫</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Lợi nhuận:</span>
                <span className="text-emerald-700">
                  {((item.price - item.cost) / item.price * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Clock className="w-4 h-4" />
                <span>{item.prepTime} phút</span>
              </div>
              <div className="pt-3 border-t">
                <p className="text-xs text-neutral-600 mb-2">Công thức:</p>
                <div className="space-y-1">
                  {item.recipe.map((ing, idx) => (
                    <div key={idx} className="text-xs text-neutral-700">
                      • {ing.ingredient}: {ing.amount} {ing.unit}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
