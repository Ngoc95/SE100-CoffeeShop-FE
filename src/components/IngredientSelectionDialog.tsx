import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Search, X, Lightbulb } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

interface IngredientItem {
  code: string;
  name: string;
  category: string;
  unit: string;
  stock: number;
}

interface IngredientSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableIngredients: IngredientItem[];
  onAddIngredients: (
    ingredients: Array<IngredientItem & { quantity: number }>
  ) => void;
}

const categories = [
  { id: "all", name: "Tất cả" },
  { id: "coffee", name: "Cà phê" },
  { id: "dairy", name: "Sữa & Kem" },
  { id: "syrup", name: "Siro & Đường" },
  { id: "tea", name: "Trà" },
  { id: "fruit", name: "Trái cây" },
  { id: "brewing-ingredients", name: "Nguyên liệu pha chế" },
  { id: "other", name: "Khác" },
];

const getCategoryName = (categoryId: string): string => {
  const category = categories.find((cat) => cat.id === categoryId);
  return category ? category.name : categoryId;
};

export function IngredientSelectionDialog({
  open,
  onOpenChange,
  availableIngredients,
  onAddIngredients,
}: IngredientSelectionDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    useState<string>("all");
  const [selectedIngredientCodes, setSelectedIngredientCodes] = useState<
    string[]
  >([]);
  const [ingredientQuantities, setIngredientQuantities] = useState<
    Record<string, number>
  >({});

  // Get filtered ingredients
  const getFilteredIngredients = () => {
    return availableIngredients.filter((item) => {
      const matchesSearch =
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat =
        selectedCategoryFilter === "all" ||
        selectedCategoryFilter === item.category;
      return matchesSearch && matchesCat;
    });
  };

  const filteredIngredients = getFilteredIngredients();
  const allIngredientsSelected =
    filteredIngredients.length > 0 &&
    filteredIngredients.every((item) =>
      selectedIngredientCodes.includes(item.code)
    );

  const toggleIngredient = (code: string) => {
    setSelectedIngredientCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleSelectAllIngredients = (checked: boolean) => {
    if (checked) {
      const allCodes = filteredIngredients.map((item) => item.code);
      setSelectedIngredientCodes((prev) => [
        ...new Set([...prev, ...allCodes]),
      ]);
    } else {
      const allCodes = filteredIngredients.map((item) => item.code);
      setSelectedIngredientCodes((prev) =>
        prev.filter((code) => !allCodes.includes(code))
      );
    }
  };

  const handleSelectCategoryIngredients = (categoryId: string) => {
    // Only update the category filter - don't toggle selection
    setSelectedCategoryFilter(categoryId);
  };

  const handleQuantityChange = (code: string, quantity: number) => {
    setIngredientQuantities((prev) => ({
      ...prev,
      [code]: quantity,
    }));
  };

  const handleAddSelectedIngredients = () => {
    const ingredientsToAdd = availableIngredients
      .filter((item) => selectedIngredientCodes.includes(item.code))
      .map((item) => ({
        ...item,
        quantity: ingredientQuantities[item.code] || 1,
      }));

    onAddIngredients(ingredientsToAdd);

    // Reset state
    setSearchQuery("");
    setSelectedCategoryFilter("all");
    setSelectedIngredientCodes([]);
    setIngredientQuantities({});
    onOpenChange(false);
  };

  const handleClose = () => {
    setSearchQuery("");
    setSelectedCategoryFilter("all");
    setSelectedIngredientCodes([]);
    setIngredientQuantities({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="!min-w-[1100px] !max-w-[1400px] !w-[95vw] !h-[90vh] overflow-hidden flex flex-col p-0 sm:!max-w-[1400px] [&>button]:!hidden"
        style={{
          minWidth: "1100px",
          maxWidth: "1400px",
          width: "95vw",
          height: "90vh",
        }}
        aria-describedby={undefined}
        onInteractOutside={(e: any) => {
          e.preventDefault();
        }}
        onEscapeKeyDown={(e: any) => {
          e.preventDefault();
        }}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `
          [data-slot="dialog-content"] button.absolute.top-4.right-4:not([data-custom-close]) {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
            width: 0 !important;
            height: 0 !important;
          }
        `,
          }}
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <h2 className="text-lg font-medium text-slate-700">
            Thêm nguyên liệu vào công thức
          </h2>
          <button
            type="button"
            data-custom-close="true"
            className="text-slate-600 hover:text-slate-800 transition-colors"
            onClick={handleClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Tìm kiếm nguyên liệu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border-slate-300 rounded-lg text-sm shadow-none focus:outline-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="mb-4 flex gap-2 flex-wrap">
            {categories.map((cat) => {
              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategoryIngredients(cat.id)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                    selectedCategoryFilter === cat.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-300 bg-white hover:border-blue-300"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Products Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden mb-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-50">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={allIngredientsSelected}
                        onCheckedChange={handleSelectAllIngredients}
                      />
                    </TableHead>
                    <TableHead>Mã</TableHead>
                    <TableHead>Tên nguyên liệu</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Đơn vị</TableHead>
                    <TableHead>Tồn kho</TableHead>
                    <TableHead>Số lượng cần</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIngredients.map((item) => (
                    <TableRow
                      key={item.code}
                      className={
                        selectedIngredientCodes.includes(item.code)
                          ? "bg-blue-50"
                          : ""
                      }
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedIngredientCodes.includes(item.code)}
                          onCheckedChange={() => toggleIngredient(item.code)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{item.code}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{getCategoryName(item.category)}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{item.stock}</TableCell>
                      <TableCell>
                        {selectedIngredientCodes.includes(item.code) ? (
                          <Input
                            type="number"
                            min="0"
                            value={ingredientQuantities[item.code] ?? ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "") {
                                setIngredientQuantities((prev) => {
                                  const newState = { ...prev };
                                  delete newState[item.code];
                                  return newState;
                                });
                              } else {
                                handleQuantityChange(item.code, Number(val));
                              }
                            }}
                            className="w-20 h-8 bg-white border-slate-300 shadow-none focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-500 focus-visible:ring-2"
                          />
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-slate-600">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p>
                  <strong>Hướng dẫn:</strong> Chọn các nguyên liệu cần thiết cho
                  công thức. Bạn có thể chọn từng item riêng lẻ hoặc chọn theo
                  danh mục. Nhập số lượng cần thiết cho mỗi nguyên liệu.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <span className="text-sm text-slate-600">
            Đã chọn:{" "}
            <span className="font-semibold">
              {selectedIngredientCodes.length}
            </span>{" "}
            nguyên liệu
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700"
              onClick={handleClose}
            >
              Hủy
            </Button>
            <Button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleAddSelectedIngredients}
              disabled={selectedIngredientCodes.length === 0}
            >
              Thêm vào danh sách
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
