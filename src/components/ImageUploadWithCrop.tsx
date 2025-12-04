import { useState, useRef, useCallback } from 'react';
import { Upload, X, Crop, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import ReactCrop, { Crop as CropType, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageUploadWithCropProps {
  value?: string;
  onChange?: (imageUrl: string) => void;
  label?: string;
}

export function ImageUploadWithCrop({ value, onChange, label = 'Hình ảnh' }: ImageUploadWithCropProps) {
  const [previewUrl, setPreviewUrl] = useState<string>(value || '');
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [originalImage, setOriginalImage] = useState<string>('');
  const [crop, setCrop] = useState<CropType>({
    unit: '%',
    width: 80,
    height: 80,
    x: 10,
    y: 10
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setOriginalImage(imageUrl);
        setCropDialogOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCroppedImage = useCallback(() => {
    if (!completedCrop || !imageRef.current) {
      return;
    }

    const image = imageRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    const pixelRatio = window.devicePixelRatio;
    canvas.width = completedCrop.width * scaleX * pixelRatio;
    canvas.height = completedCrop.height * scaleY * pixelRatio;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY
    );

    // Convert to base64
    const base64Image = canvas.toDataURL('image/jpeg', 0.9);
    setPreviewUrl(base64Image);
    onChange?.(base64Image);
    setCropDialogOpen(false);
  }, [completedCrop, onChange]);

  const handleRemoveImage = () => {
    setPreviewUrl('');
    onChange?.('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    imageRef.current = e.currentTarget;
  };

  return (
    <div className="space-y-2">
      <label className="text-sm text-slate-700">{label}</label>
      
      {previewUrl ? (
        <div className="relative w-32 h-32 border-2 border-slate-200 rounded-lg overflow-hidden group">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                setOriginalImage(previewUrl);
                setCropDialogOpen(true);
              }}
            >
              <Crop className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={handleRemoveImage}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="w-32 h-32 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-8 h-8 text-slate-400 mb-2" />
          <span className="text-xs text-slate-500">Tải ảnh lên</span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Crop Dialog */}
      <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Cắt và chỉnh sửa ảnh</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-auto flex items-center justify-center bg-slate-100 rounded-lg p-4">
            {originalImage && (
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop={false}
              >
                <img
                  ref={imageRef}
                  src={originalImage}
                  alt="Crop"
                  onLoad={onImageLoad}
                  className="max-w-full max-h-full"
                />
              </ReactCrop>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCropDialogOpen(false)}>
              Hủy
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={getCroppedImage}
            >
              <Check className="w-4 h-4 mr-2" />
              Áp dụng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
