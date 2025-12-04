import { CheckCircle2, AlertCircle, Sparkles, X } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface ComboSuggestion {
  id: string;
  name: string;
  description: string;
  discount: number;
  eligible: boolean;
  missingItems?: string[];
  applicableCount?: number; // How many times this combo can be applied
}

interface ComboSuggestionBannerProps {
  suggestions: ComboSuggestion[];
  onApply: (comboId: string) => void;
  onDismiss: (comboId: string) => void;
}

export function ComboSuggestionBanner({ 
  suggestions, 
  onApply, 
  onDismiss 
}: ComboSuggestionBannerProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-2">
      {suggestions.map((suggestion) => (
        <div
          key={suggestion.id}
          className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all ${
            suggestion.eligible
              ? 'bg-emerald-50 border-emerald-400'
              : 'bg-yellow-50 border-yellow-300'
          }`}
        >
          {suggestion.eligible ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {suggestion.eligible ? (
                    <Badge className="bg-emerald-600 text-white text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Đủ điều kiện
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-yellow-100 border-yellow-400 text-yellow-800 text-xs">
                      Thiếu món
                    </Badge>
                  )}
                  
                  {suggestion.applicableCount && suggestion.applicableCount > 1 && (
                    <Badge variant="outline" className="text-xs">
                      x{suggestion.applicableCount}
                    </Badge>
                  )}
                </div>
                
                <h4 className={`text-sm font-medium ${
                  suggestion.eligible ? 'text-emerald-900' : 'text-yellow-900'
                }`}>
                  {suggestion.name}
                </h4>
                
                <p className={`text-xs mt-1 ${
                  suggestion.eligible ? 'text-emerald-700' : 'text-yellow-700'
                }`}>
                  {suggestion.description}
                </p>
                
                {!suggestion.eligible && suggestion.missingItems && suggestion.missingItems.length > 0 && (
                  <p className="text-xs text-yellow-800 mt-1">
                    Thiếu: {suggestion.missingItems.join(', ')}
                  </p>
                )}
                
                {suggestion.eligible && (
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-sm font-semibold text-emerald-700">
                      Giảm {(suggestion.discount * (suggestion.applicableCount || 1)).toLocaleString()}đ
                    </span>
                  </div>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => onDismiss(suggestion.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {suggestion.eligible && (
              <Button
                size="sm"
                className="mt-2 h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
                onClick={() => onApply(suggestion.id)}
              >
                Áp dụng combo
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
