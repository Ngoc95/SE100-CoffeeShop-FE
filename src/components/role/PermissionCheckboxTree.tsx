import { useState } from 'react';
import { Permission, PermissionCategory } from '../../types/account';
import { PERMISSION_CATEGORIES } from '../../data/permissionData';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { ChevronDown, ChevronRight, Minus, Check } from 'lucide-react';
import { cn } from '../ui/utils';

interface PermissionCheckboxTreeProps {
  selectedPermissions: Permission[];
  onChange: (permissions: Permission[]) => void;
}

export function PermissionCheckboxTree({
  selectedPermissions,
  onChange,
}: PermissionCheckboxTreeProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    'system', // Expand system by default
  ]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handlePermissionToggle = (permission: Permission) => {
    const newPermissions = selectedPermissions.includes(permission)
      ? selectedPermissions.filter(p => p !== permission)
      : [...selectedPermissions, permission];
    onChange(newPermissions);
  };

  const handleCategoryToggle = (category: PermissionCategory) => {
    const categoryPermissions = category.modules.flatMap(m => m.permissions.map(p => p.id));
    const allSelected = categoryPermissions.every(p => selectedPermissions.includes(p));

    if (allSelected) {
      // Uncheck all
      onChange(selectedPermissions.filter(p => !categoryPermissions.includes(p)));
    } else {
      // Check all
      const newPermissions = [...selectedPermissions];
      categoryPermissions.forEach(p => {
        if (!newPermissions.includes(p)) {
          newPermissions.push(p);
        }
      });
      onChange(newPermissions);
    }
  };

  const isCategoryChecked = (category: PermissionCategory) => {
    const categoryPermissions = category.modules.flatMap(m => m.permissions.map(p => p.id));
    return categoryPermissions.every(p => selectedPermissions.includes(p));
  };

  const isCategoryIndeterminate = (category: PermissionCategory) => {
    const categoryPermissions = category.modules.flatMap(m => m.permissions.map(p => p.id));
    const someSelected = categoryPermissions.some(p => selectedPermissions.includes(p));
    const allSelected = categoryPermissions.every(p => selectedPermissions.includes(p));
    return someSelected && !allSelected;
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {PERMISSION_CATEGORIES.map(category => {
        const isExpanded = expandedCategories.includes(category.id);
        const isChecked = isCategoryChecked(category);
        const isIndeterminate = isCategoryIndeterminate(category);
        
        const checkedState: boolean | 'indeterminate' = isChecked ? true : isIndeterminate ? 'indeterminate' : false;

        return (
          <div key={category.id} className="border rounded-lg">
            {/* Category Header */}
            <div className="flex items-center gap-2 p-3 bg-slate-50 border-b">
              <button
                type="button"
                onClick={() => toggleCategory(category.id)}
                className="p-1 hover:bg-slate-200 rounded transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              <CheckboxPrimitive.Root
                checked={checkedState}
                onCheckedChange={() => handleCategoryToggle(category)}
                style={{
                  backgroundColor: checkedState ? '#000' : '#fff',
                  borderColor: checkedState ? '#000' : '#cbd5e1',
                }}
                className={cn(
                  "h-4 w-4 rounded border flex items-center justify-center shrink-0 shadow-sm",
                  "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                )}
              >
                <CheckboxPrimitive.Indicator className="flex items-center justify-center">
                  {checkedState === 'indeterminate' ? (
                    <Minus className="h-3 w-3 text-white" strokeWidth={2.5} />
                  ) : (
                    <Check className="h-3 w-3 text-white" strokeWidth={2.5} />
                  )}
                </CheckboxPrimitive.Indicator>
              </CheckboxPrimitive.Root>
              <Label
                className="font-semibold text-slate-900 cursor-pointer flex-1"
                onClick={() => toggleCategory(category.id)}
              >
                {category.name}
              </Label>
            </div>

            {/* Category Modules */}
            {isExpanded && (
              <div className="p-4 space-y-4">
                {category.modules.map(module => (
                  <div key={module.id} className="space-y-2">
                    <div className="font-medium text-sm text-slate-700">
                      {module.name}
                    </div>
                    <div className="grid grid-cols-2 gap-2 pl-4">
                      {module.permissions.map(permission => (
                        <div key={permission.id} className="flex items-center gap-2">
                          <Checkbox
                            id={permission.id}
                            checked={selectedPermissions.includes(permission.id)}
                            onCheckedChange={() => handlePermissionToggle(permission.id)}
                          />
                          <Label
                            htmlFor={permission.id}
                            className="text-sm cursor-pointer"
                          >
                            {permission.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
