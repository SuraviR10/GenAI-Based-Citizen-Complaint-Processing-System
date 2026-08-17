import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { UploadCloud, Image as ImageIcon, X, AlertCircle, Loader2, Check } from 'lucide-react';
import { validateFile, uploadEvidenceImage } from '../../lib/storage';

export interface UploadedFileState {
  file: File;
  previewUrl: string;
  storageUrl?: string;
  storagePath?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  errorMessage?: string;
}

export interface FileUploaderProps {
  userId: string;
  maxFiles?: number;
  onFilesChanged: (uploadedUrls: string[]) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  userId,
  maxFiles = 4,
  onFilesChanged
}) => {
  const [files, setFiles] = useState<UploadedFileState[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (newFiles: FileList | File[]) => {
    setGeneralError(null);
    const fileArray = Array.from(newFiles);

    if (files.length + fileArray.length > maxFiles) {
      setGeneralError(`You can upload a maximum of ${maxFiles} photos.`);
      return;
    }

    const validatedItems: UploadedFileState[] = [];

    for (const file of fileArray) {
      const validation = validateFile(file);
      if (!validation.valid) {
        setGeneralError(validation.error || 'Invalid file');
        return;
      }

      validatedItems.push({
        file,
        previewUrl: URL.createObjectURL(file),
        progress: 0,
        status: 'pending'
      });
    }

    const updatedFiles = [...files, ...validatedItems];
    setFiles(updatedFiles);

    // Start uploading the newly added files
    for (let i = 0; i < validatedItems.length; i++) {
      const item = validatedItems[i];
      const targetIndex = files.length + i;

      // Update to uploading
      setFiles((prev) => {
        const next = [...prev];
        if (next[targetIndex]) next[targetIndex].status = 'uploading';
        return next;
      });

      try {
        const result = await uploadEvidenceImage(item.file, userId, (progress) => {
          setFiles((prev) => {
            const next = [...prev];
            if (next[targetIndex]) next[targetIndex].progress = progress;
            return next;
          });
        });

        setFiles((prev) => {
          const next = [...prev];
          if (next[targetIndex]) {
            next[targetIndex].status = 'completed';
            next[targetIndex].storageUrl = result.url;
            next[targetIndex].storagePath = result.storagePath;
            next[targetIndex].progress = 100;
          }
          // Notify parent
          const allCompletedUrls = next
            .filter((f) => f.status === 'completed' && f.storageUrl)
            .map((f) => f.storageUrl as string);
          onFilesChanged(allCompletedUrls);
          return next;
        });
      } catch (err: any) {
        setFiles((prev) => {
          const next = [...prev];
          if (next[targetIndex]) {
            next[targetIndex].status = 'error';
            next[targetIndex].errorMessage = err.message || 'Upload failed';
          }
          return next;
        });
      }
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    const target = files[index];
    if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);

    setFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      const allCompletedUrls = next
        .filter((f) => f.status === 'completed' && f.storageUrl)
        .map((f) => f.storageUrl as string);
      onFilesChanged(allCompletedUrls);
      return next;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragging ? 'var(--color-accent-500)' : 'var(--color-border)'}`,
          backgroundColor: isDragging ? 'var(--color-accent-100)' : 'var(--color-bg-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all var(--transition-normal)'
        }}
        role="button"
        tabIndex={0}
        aria-label="Upload photo evidence"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          multiple
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <div
            className="icon-container-3d-cyan"
            style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-full)' }}
          >
            <UploadCloud size={24} />
          </div>
          <div>
            <p style={{ fontWeight: 600, color: 'var(--color-primary-800)', fontSize: '0.95rem' }}>
              Click to upload photos or drag and drop
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Supports JPG, PNG, WebP (Max 5MB per image, up to {maxFiles} photos)
            </p>
          </div>
        </div>
      </div>

      {generalError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-critical)', fontSize: '0.85rem' }}>
          <AlertCircle size={16} />
          <span>{generalError}</span>
        </div>
      )}

      {/* Uploaded File Previews Grid */}
      {files.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: '0.75rem'
          }}
        >
          {files.map((item, index) => (
            <div
              key={index}
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg-card)',
                aspectRatio: '1',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <img
                src={item.previewUrl}
                alt={`Evidence ${index + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* Status Overlay */}
              {item.status === 'uploading' && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(11, 25, 44, 0.6)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    gap: '4px'
                  }}
                >
                  <Loader2 size={20} className="animate-spin" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{item.progress}%</span>
                </div>
              )}

              {item.status === 'completed' && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '6px',
                    left: '6px',
                    backgroundColor: 'var(--color-success)',
                    color: '#ffffff',
                    borderRadius: 'var(--radius-full)',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <Check size={12} strokeWidth={3} />
                </div>
              )}

              {item.status === 'error' && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(239, 68, 68, 0.85)',
                    color: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '6px',
                    textAlign: 'center',
                    fontSize: '0.75rem'
                  }}
                >
                  <AlertCircle size={18} style={{ marginBottom: '2px' }} />
                  <span>Failed</span>
                </div>
              )}

              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeFile(index)}
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  backgroundColor: 'rgba(11, 25, 44, 0.75)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-full)',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background var(--transition-fast)'
                }}
                aria-label="Remove photo"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
