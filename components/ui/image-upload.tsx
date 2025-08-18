'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, UploadCloud, X } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setIsUploading(true);
      
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Upload error details:', {
            status: response.status,
            statusText: response.statusText,
            errorData
          });
          throw new Error(errorData.message || 'Échec du téléchargement de l\'image');
        }

        const data = await response.json();
        onChange(data.url);
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error(error instanceof Error ? error.message : 'Une erreur est survenue lors du téléchargement de l\'image');
      } finally {
        setIsUploading(false);
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
    },
    disabled: disabled || isUploading,
    multiple: false,
  });

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer
          ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50'}
          transition-colors
        `}
      >
        <input {...getInputProps()} />
        {value ? (
          <div className="relative">
            <Avatar className="h-32 w-32">
              <AvatarImage src={value} alt="Photo de profil" />
              <AvatarFallback>PP</AvatarFallback>
            </Avatar>
            {!disabled && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 rounded-full h-6 w-6"
                onClick={removeImage}
                disabled={isUploading}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            {isUploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : (
              <UploadCloud className="h-8 w-8 text-muted-foreground" />
            )}
            <div className="text-center">
              <p className="text-sm font-medium">
                {isUploading
                  ? 'Téléchargement...'
                  : isDragActive
                  ? 'Déposez l\'image ici'
                  : 'Glissez-déposez une image ou cliquez pour sélectionner'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, WEBP (max. 5MB)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
