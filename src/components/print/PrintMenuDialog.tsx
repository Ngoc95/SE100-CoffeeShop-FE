import { useState, useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ScrollArea } from "../ui/scroll-area";
import { Printer, LayoutGrid, List, CheckSquare } from "lucide-react";
import { InventoryItem } from "../../types/inventory";

interface Category {
  id: string;
  name: string;
}

interface PrintMenuDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: InventoryItem[];
  categories: Category[];
  initialSelectedTypes?: string[];
}

export function PrintMenuDialog({
  open,
  onOpenChange,
  items,
  categories,
  initialSelectedTypes,
}: PrintMenuDialogProps) {
  const [menuTitle, setMenuTitle] = useState("THỰC ĐƠN");
  const [layout, setLayout] = useState<"list-simple" | "grid-image">("list-simple");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    categories.map((c) => c.id)
  );
  const [selectedTypes, setSelectedTypes] = useState<string[]>(initialSelectedTypes || ['ready-made', 'composite']);
  
  // Sync with initialSelectedTypes when dialog opens
  useEffect(() => {
    if (open && initialSelectedTypes) {
      setSelectedTypes(initialSelectedTypes);
    }
  }, [open, initialSelectedTypes]);

  const [showPrice, setShowPrice] = useState(true);
  const [showDescription, setShowDescription] = useState(false); // Default hidden for cleaner look
  const [showImages, setShowImages] = useState(true);

  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: "Menu",
    onAfterPrint: () => console.log("Print completed"),
    onPrintError: (error) => console.error("Print error:", error),
  });

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleAllCategories = () => {
    if (selectedCategoryIds.length === categories.length) {
      setSelectedCategoryIds([]);
    } else {
      setSelectedCategoryIds(categories.map((c) => c.id));
    }
  };

  // Filter items for preview/print
  const itemsToPrint = items.filter(
    (item) => {
      // Find the category object that corresponds to this item
      // item.category could be an ID (mock data) or a Name (API data)
      const category = categories.find(c => 
        String(item.categoryId) === c.id || 
        c.name === item.category
      );
      
      // If we found a category, check if it's selected
      if (category) {
        if (!selectedCategoryIds.includes(category.id)) return false;
      } else {
        // Fallback: direct check (unlikely to work if item.category is name and selectedCategoryIds are IDs)
        // But keep for safety if data structure changes
        if (!selectedCategoryIds.includes(String(item.categoryId)) && !selectedCategoryIds.includes(item.category)) return false;
      }

      // Check product status (selling/hot) - keep this rule? 
      // User didn't say to remove it, but "Fetch All" might imply printing everything?
      // "In Menu" usually implies selling items.
      const isSelling = (item.productStatus === "selling" || item.productStatus === "hot" || !item.productStatus);
      if (!isSelling) return false;

      // Check Type
      // Handle potential underscores/hyphens mismatch just in case
      const type = item.type;
if (!type) return false;

return selectedTypes.includes(type);
    }
  );

  // Group items by category
  const groupedItems = categories
    .filter((c) => selectedCategoryIds.includes(c.id))
    .map((category) => ({
      category,
      items: itemsToPrint.filter((item) => 
        String(item.categoryId) === category.id || item.category === category.name
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-w-[90vw] max-h-[90vh] flex flex-col p-0 gap-0 bg-slate-50 sm:max-w-none">
        <DialogHeader className="p-6 pb-2 bg-white border-b flex-none">
          <DialogTitle className="flex items-center gap-2 text-xl text-blue-900">
            <Printer className="w-5 h-5" />
            In Menu
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Configuration */}
          <div className="w-80 bg-white border-r p-6 flex flex-col gap-6 overflow-y-auto">
            
            {/* 1. General Settings */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-slate-900 uppercase tracking-wider">
                Cấu hình chung
              </h3>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Tiêu đề Menu</Label>
                  <Input
                    value={menuTitle}
                    onChange={(e) => setMenuTitle(e.target.value)}
                    placeholder="VD: Menu Cà Phê"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label>Giao diện</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={layout === "list-simple" ? "default" : "outline"}
                      className={`justify-start h-auto py-3 px-3 flex-col items-center gap-2 ${layout === "list-simple" ? "bg-blue-600" : ""}`}
                      onClick={() => setLayout("list-simple")}
                    >
                      <List className="w-5 h-5" />
                      <span className="text-xs font-medium">Danh sách</span>
                    </Button>
                    <Button
                      variant={layout === "grid-image" ? "default" : "outline"}
                      className={`justify-start h-auto py-3 px-3 flex-col items-center gap-2 ${layout === "grid-image" ? "bg-blue-600" : ""}`}
                      onClick={() => setLayout("grid-image")}
                    >
                      <LayoutGrid className="w-5 h-5" />
                      <span className="text-xs font-medium">Lưới ảnh</span>
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Label>Hiển thị</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="showPrice"
                        checked={showPrice}
                        onCheckedChange={(c: boolean | string) => setShowPrice(c === true)}
                      />
                      <Label htmlFor="showPrice" className="text-sm font-normal cursor-pointer">
                        Hiển thị giá tiền
                      </Label>
                    </div>
                         <div className="flex items-center space-x-2">
                         <Checkbox
                           id="showDescription"
                           checked={showDescription}
                           onCheckedChange={(c: boolean | string) => setShowDescription(c === true)}
                         />
                         <Label htmlFor="showDescription" className="text-sm font-normal cursor-pointer">
                           Hiển thị mô tả món
                         </Label>
                       </div>
                   
                    {layout === "grid-image" && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="showImages"
                          checked={showImages}
                          onCheckedChange={(c: boolean | string) => setShowImages(c === true)}
                        />
                        <Label htmlFor="showImages" className="text-sm font-normal cursor-pointer">
                          Hiển thị hình ảnh
                        </Label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* 1.5. Type Selection */}
            <div className="space-y-3">
               <h3 className="font-semibold text-sm text-slate-900 uppercase tracking-wider">
                  Loại hàng hóa
               </h3>
               <div className="space-y-2">
                 {[
                   { id: "ready-made", label: "Hàng bán sẵn" },
                   { id: "composite", label: "Hàng cấu thành" },
                   { id: "ingredient", label: "Nguyên liệu" },
                 ].map((type) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`print-type-${type.id}`}
                        checked={selectedTypes.includes(type.id)}
                        onCheckedChange={(checked: any) => {
                           setSelectedTypes(prev => 
                             checked 
                               ? [...prev, type.id]
                               : prev.filter(t => t !== type.id)
                           );
                        }}
                      />
                      <Label htmlFor={`print-type-${type.id}`} className="text-sm font-normal cursor-pointer">
                        {type.label}
                      </Label>
                    </div>
                 ))}
               </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* 2. Categories Selection */}
            <div className="space-y-3 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-slate-900 uppercase tracking-wider">
                  Danh mục
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-blue-600 hover:text-blue-700 px-2"
                  onClick={toggleAllCategories}
                >
                  {selectedCategoryIds.length === categories.length
                    ? "Bỏ chọn tất cả"
                    : "Chọn tất cả"}
                </Button>
              </div>
              
              <ScrollArea className="h-[300px] -mr-4 pr-4">
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center space-x-2 p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-100"
                    >
                      <Checkbox
                        id={`cat-${category.id}`}
                        checked={selectedCategoryIds.includes(category.id)}
                        onCheckedChange={() => toggleCategory(category.id)}
                      />
                      <Label
                        htmlFor={`cat-${category.id}`}
                        className="text-sm font-normal flex-1 cursor-pointer"
                      >
                        {category.name}
                        <span className="text-xs text-slate-400 ml-1">
                          ({items.filter(i => 
                            (String(i.categoryId) === category.id || i.category === category.name) && 
                            selectedTypes.includes(i.type)
                          ).length})
                        </span>
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

          </div>

      {/* Preview Area */}
      <div className="flex-1 bg-slate-200 overflow-auto flex justify-center p-12">
        <div className="origin-top scale-[0.85]">
          <div className="bg-white w-[210mm] min-h-[297mm] rounded-sm shadow-xl border border-slate-300">
            {/* Printable Content Wrapper */}
            <div ref={componentRef} className="print-content text-slate-900 w-full h-full p-[15mm]">
              
              {/* Menu Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold uppercase tracking-widest border-b-2 border-slate-900 inline-block pb-2 mb-2">
                  {menuTitle}
                </h1>
                <p className="text-sm text-slate-500 italic">Hân hạnh phục vụ quý khách</p>
              </div>

              {/* Menu Content */}
              <div className="space-y-6">
                {groupedItems.map((group) => (
                  <div key={group.category.id} className="break-inside-avoid">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 uppercase tracking-wide border-b-2 border-slate-300 pb-2 px-2">
                      {group.category.name}
                    </h2>

                    {layout === "list-simple" ? (
                      // LIST SIMPLE LAYOUT - Multi-column Style
                      <div className="grid grid-cols-2 gap-x-8 gap-y-1 px-2">
                        {group.items.map((item) => (
                          <div key={item.id} className="break-inside-avoid">
                            <div className="flex items-baseline justify-between gap-4 py-2.5">
                              <div className="flex-1">
                                {/* Tên món */}
                                <h3 className="font-semibold text-[15px] text-slate-900">
                                  {item.name}
                                </h3>
                                
                                {/* Mô tả */}
                                {showDescription && (
                                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                                    Món ngon được chế biến từ nguyên liệu tươi ngon
                                  </p>
                                )}
                              </div>

                              {/* Giá */}
                              {showPrice && (
                                <span className="font-bold text-[15px] text-blue-700 whitespace-nowrap">
                                  {item.sellingPrice?.toLocaleString()}đ
                                </span>
                              )}
                            </div>
                            <div className="border-b border-dotted border-slate-300"></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      // GRID LAYOUT - Modern Card Style
                      <div className="grid grid-cols-2 gap-4 p-5">
                        {group.items.map((item) => (
                          <div key={item.id} className="break-inside-avoid border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                            {showImages && (
                              <div className="w-full h-32 bg-slate-100 overflow-hidden">
                                {item.imageUrl ? (
                                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <LayoutGrid className="w-12 h-12" />
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="p-3">
                              <h3 className="font-semibold text-[15px] text-slate-900 mb-1">
                                {item.name}
                              </h3>
                              {showDescription && (
                                <p className="text-[11px] text-slate-500 mb-2 line-clamp-2">
                                  Món ngon được chế biến từ nguyên liệu tươi ngon
                                </p>
                              )}
                              {showPrice && (
                                <div className="text-blue-700 font-bold text-[15px] mt-2">
                                  {item.sellingPrice?.toLocaleString()}đ
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                {groupedItems.length === 0 && (
                  <div className="text-center py-20 text-slate-400">
                    <p>Chưa có món nào được chọn.</p>
                    <p className="text-sm">Vui lòng chọn danh mục bên trái.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
        </div>

        <DialogFooter className="p-4 bg-white border-t flex-none">
          <div className="flex justify-between w-full items-center">
             <div className="text-sm text-slate-500">
                Đã chọn <span className="font-medium text-slate-900">{itemsToPrint.length}</span> món
             </div>
             <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 min-w-[120px] gap-2">
                <Printer className="w-4 h-4" />
                In Menu
              </Button>
             </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
