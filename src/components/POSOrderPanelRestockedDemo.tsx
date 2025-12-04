import { useState, useEffect } from 'react';
import { 
  Plus, 
  Minus, 
  Trash2, 
  MessageSquare,
  Settings,
  CheckCircle,
  Coffee,
  Loader2,
  AlertCircle,
  Clock,
  X,
  ArrowLeftRight,
  PackageCheck
} from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { toast } from 'sonner@2.0.3';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  status?: 'received' | 'preparing' | 'completed' | 'served' | 'out-of-stock' | 'waiting-ingredient' | 'restocked' | 'canceled' | 'replaced';
  toppings?: string[];
  outOfStockReason?: string;
  outOfStockIngredients?: string[];
}

/**
 * POS Order Panel - Ingredient Restocked State Demo
 * Shows what the cashier sees after kitchen marks ingredient as restocked
 */
export function POSOrderPanelRestockedDemo() {
  const [cart, setCart] = useState<CartItem[]>([
    {
      id: '1',
      name: 'Cà phê sữa đá',
      price: 35000,
      quantity: 2,
      status: 'preparing',
      toppings: ['Đá', 'Ít đường'],
    },
    {
      id: '2',
      name: 'Trà sữa trân châu',
      price: 38000,
      quantity: 1,
      status: 'waiting-ingredient',
      outOfStockReason: 'Trân châu',
      outOfStockIngredients: ['Trân châu'],
    },
    {
      id: '3',
      name: 'Bánh tiramisu',
      price: 50000,
      quantity: 1,
      status: 'completed',
    },
  ]);

  const [restockedItems, setRestockedItems] = useState<string[]>([]);
  const [glowingItems, setGlowingItems] = useState<string[]>([]);

  // Auto-remove from restocked list after 3 seconds
  useEffect(() => {
    if (restockedItems.length === 0) return;
    
    const timer = setTimeout(() => {
      setRestockedItems([]);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [restockedItems]);

  // Auto-remove glow after 2 seconds
  useEffect(() => {
    if (glowingItems.length === 0) return;
    
    const timer = setTimeout(() => {
      setGlowingItems([]);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [glowingItems]);

  const simulateRestockNotification = () => {
    const waitingItem = cart.find(item => item.status === 'waiting-ingredient');
    
    if (waitingItem) {
      // Show toast notification
      toast.success(
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-slate-900 mb-1">
              ✓ Nguyên liệu đã bổ sung
            </p>
            <p className="text-xs text-slate-600">
              {waitingItem.outOfStockReason} đã có lại trong kho. Món {waitingItem.name} có thể pha chế.
            </p>
          </div>
        </div>,
        {
          duration: 4000,
          style: {
            background: '#E8F8ED',
            border: '1px solid #86EFAC',
          },
        }
      );

      // Update item status
      setCart(cart.map(item => 
        item.id === waitingItem.id
          ? { 
              ...item, 
              status: 'restocked' as const,
              outOfStockReason: undefined,
              outOfStockIngredients: undefined
            }
          : item
      ));

      // Add to restocked and glowing lists
      setRestockedItems([waitingItem.id]);
      setGlowingItems([waitingItem.id]);

      // Add to order history
      console.log(`Nguyên liệu đã bổ sung cho món: ${waitingItem.name}`);
    }
  };

  const updateQuantity = (id: string, change: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const getItemStatusBadge = (status?: CartItem['status']) => {
    switch (status) {
      case 'received':
        return <Badge className="bg-gray-500 text-white text-xs">Đã nhận</Badge>;
      case 'preparing':
        return <Badge className="bg-blue-500 text-white text-xs flex items-center gap-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          Đang chế biến
        </Badge>;
      case 'completed':
        return <Badge className="bg-green-500 text-white text-xs flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Hoàn thành
        </Badge>;
      case 'served':
        return <Badge className="bg-emerald-600 text-white text-xs">Đã giao</Badge>;
      case 'out-of-stock':
        return <Badge variant="outline" className="bg-red-50 border-red-300 text-red-700 text-xs flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Hết nguyên liệu – Chờ xử lý
        </Badge>;
      case 'waiting-ingredient':
        return <Badge variant="outline" className="bg-amber-50 border-amber-300 text-amber-700 text-xs flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Đang đợi nguyên liệu
        </Badge>;
      case 'restocked':
        return <Badge className="bg-blue-500 text-white text-xs flex items-center gap-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          Đang chế biến
        </Badge>;
      case 'canceled':
        return <Badge variant="outline" className="bg-gray-100 border-gray-300 text-gray-700 text-xs flex items-center gap-1">
          <X className="w-3 h-3" />
          Đã hủy (hết nguyên liệu)
        </Badge>;
      case 'replaced':
        return <Badge variant="outline" className="bg-blue-50 border-blue-300 text-blue-700 text-xs flex items-center gap-1">
          <ArrowLeftRight className="w-3 h-3" />
          Đã thay thế món
        </Badge>;
      default:
        return null;
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="h-screen flex items-center justify-center bg-slate-100 p-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <h2 className="text-lg mb-1">Đơn hàng - Bàn 3</h2>
          <p className="text-xs text-blue-100">ORD-045 • {totalItems} món</p>
        </div>

        {/* Cart Items */}
        <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Coffee className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Chưa có món nào</p>
            </div>
          ) : (
            cart.map(item => {
              const isRestocked = restockedItems.includes(item.id);
              const isGlowing = glowingItems.includes(item.id);
              
              return (
                <Card 
                  key={item.id} 
                  className={`border-blue-200 shadow-sm transition-all ${
                    isGlowing ? 'restock-glow' : ''
                  } ${isRestocked ? 'green-ripple' : ''}`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        {/* Item name */}
                        <p className="text-sm text-slate-900 mb-1 break-words">{item.name}</p>
                        
                        {/* Status badge */}
                        {item.status && (
                          <div className="mb-2">
                            {getItemStatusBadge(item.status)}
                          </div>
                        )}

                        {/* Restocked badge - temporary, fades after 3s */}
                        {isRestocked && (
                          <div className="mb-2 restock-badge-fade">
                            <Badge variant="outline" className="bg-emerald-50 border-emerald-500 text-emerald-700 text-xs flex items-center gap-1 w-fit">
                              <PackageCheck className="w-3 h-3" />
                              Đã bổ sung NL
                            </Badge>
                          </div>
                        )}

                        {/* Toppings */}
                        {item.toppings && item.toppings.length > 0 && (
                          <div className="mb-2">
                            <span className="text-xs text-slate-500 block mb-1">Topping:</span>
                            <div className="flex gap-1 flex-wrap">
                              {item.toppings.map((topping, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs px-1 py-0">
                                  {topping}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Notes */}
                        {item.notes && (
                          <div className="flex items-start gap-1 mb-2">
                            <MessageSquare className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-slate-500 italic break-words">"{item.notes}"</span>
                          </div>
                        )}

                        {/* Restocked message - replaces out of stock warning */}
                        {isRestocked && (
                          <div className="bg-emerald-50 border border-emerald-200 p-2 rounded mb-2">
                            <p className="text-xs text-emerald-700 break-words flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Nguyên liệu đã sẵn sàng. Có thể pha chế.
                            </p>
                          </div>
                        )}
                        
                        {/* Waiting ingredient */}
                        {item.status === 'waiting-ingredient' && item.outOfStockReason && (
                          <div className="bg-amber-50 border border-amber-200 p-2 rounded mb-2">
                            <p className="text-xs text-amber-700 break-words">
                              Đang đợi: {item.outOfStockReason}
                            </p>
                          </div>
                        )}
                        
                        <p className="text-sm text-blue-700">
                          {item.price.toLocaleString()}₫
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="h-7 w-7 p-0 flex-shrink-0 ml-2"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="h-7 w-7 p-0 flex-shrink-0"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-sm w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="h-7 w-7 p-0 flex-shrink-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <span className="text-sm text-blue-900 font-medium">
                        {(item.price * item.quantity).toLocaleString()}₫
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 flex-shrink-0"
                        title="Tùy chỉnh món"
                      >
                        <Settings className="w-3 h-3 mr-1" />
                        <span className="text-xs">Tùy chỉnh</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0 flex-shrink-0 ml-auto"
                        title="Thêm ghi chú"
                      >
                        <MessageSquare className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        <Separator className="shadow-sm" />
        
        {/* Footer */}
        <div className="p-3 space-y-2 bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Tạm tính</span>
              <span className="text-slate-900">{totalAmount.toLocaleString()}₫</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Giảm giá</span>
              <span className="text-slate-900">0₫</span>
            </div>
            <Separator className="bg-blue-300 my-1" />
            <div className="flex justify-between text-sm">
              <span className="text-blue-950">Tổng cộng</span>
              <span className="text-blue-900">{totalAmount.toLocaleString()}₫</span>
            </div>
          </div>

          {/* Demo: Simulate restock notification */}
          {cart.some(item => item.status === 'waiting-ingredient') && (
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs border-emerald-300 text-emerald-600 hover:bg-emerald-50 h-8"
              onClick={simulateRestockNotification}
            >
              <PackageCheck className="w-3 h-3 mr-1" />
              Demo: Nhận thông báo đã bổ sung NL
            </Button>
          )}

          {/* Buttons Row */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 h-10"
              disabled={cart.some(item => item.status === 'waiting-ingredient')}
            >
              <Coffee className="w-4 h-4 mr-1" />
              Pha chế
            </Button>
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700 h-10">
              Thanh toán
            </Button>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes green-glow {
          0% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
            border-color: rgb(34, 197, 94);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(34, 197, 94, 0);
            border-color: rgb(34, 197, 94);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
            border-color: rgb(209, 213, 219);
          }
        }
        
        .restock-glow {
          animation: green-glow 2s ease-out;
          border: 2px solid rgb(34, 197, 94);
        }
        
        @keyframes fade-out {
          0% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            display: none;
          }
        }
        
        .restock-badge-fade {
          animation: fade-out 3s ease-out forwards;
        }
        
        @keyframes green-ripple {
          0% {
            transform: scale(0.95);
            background-color: rgba(34, 197, 94, 0.1);
          }
          50% {
            transform: scale(1);
            background-color: rgba(34, 197, 94, 0.05);
          }
          100% {
            transform: scale(0.95);
            background-color: rgba(34, 197, 94, 0);
          }
        }
        
        .green-ripple {
          animation: green-ripple 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
