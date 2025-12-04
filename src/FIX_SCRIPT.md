# Quick Fix for POSOrdering.tsx Build Error

## Problem
Lines 1790-1795 contain escaped characters that cause build errors.

## Solution - Use Find & Replace in Your Editor

### Step 1: Open Find & Replace
1. Open `/components/pages/POSOrdering.tsx`
2. Press Ctrl+H (Windows/Linux) or Cmd+H (Mac) to open Find & Replace

### Step 2: First Replacement
**Find:** `)}\\n        </div>`
**Replace with:** `)}
        </div>`

Click "Replace" (NOT "Replace All") - should replace line 1790

### Step 3: Second Replacement  
**Find:** `<Separator className=\\\"shadow-sm\\\" />`
**Replace with:** `<Separator className="shadow-sm" />`

Click "Replace" (NOT "Replace All") - should replace line 1792

### Step 4: Third Replacement
**Find:** `<div className=\\\"p-3 space-y-2 bg-gradient-to-r from-blue-50 to-blue-100\\\">`
**Replace with:** `<div className="p-3 space-y-2 bg-gradient-to-r from-blue-50 to-blue-100">`

Click "Replace" (NOT "Replace All") - should replace line 1794

### Step 5: Delete Duplicate Code
After the above fixes, you should see a duplicate cart item rendering block starting around line 1796.

**Delete lines 1796-1984** (approximately 189 lines of JSX code that renders individual cart items - this is OLD code replaced by CartItemDisplay component)

The deleted section should start with:
```
                    <div className="flex items-start justify-between mb-2">
```

And end with:
```
                );
              })}
            </div>
          )}
        </div>
```

After deletion, line ~1796 should show:
```
          {/* Inline Promo Code Input */}
          {!appliedPromoCode && cart.length > 0 && (
```

## Verify
Save the file. The build error should be resolved.

If you still see errors, please let me know the exact error message.
