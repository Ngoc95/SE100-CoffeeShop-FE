import { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

/**
 * Demonstration component showing how the POS system handles ingredient restock notifications.
 * This component is used to add the restock functionality to POSOrdering.tsx
 */

export interface RestockedItemInfo {
  itemId: string;
  itemName: string;
  ingredient: string;
  timestamp: number;
}

// Function to show restock notification toast
export const showRestockNotification = (itemName: string, ingredient: string) => {
  toast.success(
    <div className="flex items-start gap-3">
      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm text-slate-900 mb-1">
          Nguyên liệu đã bổ sung
        </p>
        <p className="text-xs text-slate-600">
          {ingredient} đã có lại trong kho. Món {itemName} có thể pha chế.
        </p>
      </div>
    </div>,
    {
      duration: 4000,
      className: 'bg-emerald-50 border-emerald-200',
      style: {
        background: '#E8F8ED',
        border: '1px solid #86EFAC',
      },
    }
  );
};

// CSS for green glow animation
export const restockAnimationStyles = `
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
`;

// Hook to auto-remove items from recently restocked list
export const useAutoRemoveRestocked = (
  restockedItems: string[],
  setRestockedItems: (items: string[]) => void,
  delay: number = 3000
) => {
  useEffect(() => {
    if (restockedItems.length === 0) return;
    
    const timers = restockedItems.map((itemId) => {
      return setTimeout(() => {
        setRestockedItems(restockedItems.filter(id => id !== itemId));
      }, delay);
    });
    
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [restockedItems, setRestockedItems, delay]);
};
