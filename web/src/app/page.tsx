'use client'
import { useCallback, useState, useRef } from 'react';
import { IconCloudUpload } from '@tabler/icons-react';


export default function Home() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file) {
      setIsUploaded(true);
      setTimeout(() => {
        // Proceed with app functionality
      }, 1500);
    }
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, []);

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // Reset input value to allow selecting the same file again
    if (e.target) {
      e.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div
        className={`w-full max-w-3xl rounded-2xl border-2 border-dashed ${
          isDragging ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-600'
        } transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
          isUploaded ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-6 p-12 text-center">
          <div className={`relative transition-transform duration-300 p-2 ${isDragging ? 'scale-110' : 'scale-100'}`}>
            <div className={`absolute inset-0 rounded-full bg-teal-600/40 ${isDragging ? 'animate-ping' : ''}`} />
            <IconCloudUpload stroke={2} size={40} className='text-teal-800' />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-slate-100 transition-all">
              {isUploaded ? 'File Received!' : isDragging ? 'Drop to Upload' : 'Drop a File to Start'}
            </h1>
            <p className="text-slate-400 transition-all">
              {isUploaded
                ? 'Processing your file...'
                : 'Drag & drop any file, or browse to upload'}
            </p>
          </div>

          {!isUploaded && (
            <>
              <div className="flex items-center space-x-2 text-slate-400">
                <span className="h-px w-8 bg-current" />
                <span className="text-sm">OR</span>
                <span className="h-px w-8 bg-current" />
              </div>

              <button 
                onClick={handleBrowse}
                className="cursor-pointer rounded-lg bg-slate-700 px-6 py-2 font-medium text-slate-200 transition-all hover:bg-slate-600 hover:text-white active:scale-95"
              >
                Browse Files
              </button>
            </>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileInputChange}
        className="absolute opacity-0 -z-10"
        aria-hidden="true"
      />
    </div>
  );
}