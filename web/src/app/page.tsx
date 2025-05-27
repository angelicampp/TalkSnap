'use client'
import { useCallback, useState, useRef } from 'react';
import { IconCloudUpload } from '@tabler/icons-react';

export default function Home() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [selectedLang, setSelectedLang] = useState('en');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    setIsUploaded(true);
    setIsProcessing(true);
    setMessages([]);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('lang', selectedLang);

    try {
      const response = await fetch('/api/your-endpoint', {
        method: 'POST',
        body: formData,
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // Handle both possible line endings from the server
        const lines = buffer.split(/(\n|\/n)/);
        buffer = lines.pop() || '';
        
        lines.forEach(line => {
          if (line.trim() && !['\n', '/n'].includes(line)) {
            setMessages(prev => [...prev, line]);
          }
        });
      }

      // Process remaining buffer
      if (buffer.trim()) {
        setMessages(prev => [...prev, buffer]);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setMessages(prev => [...prev, `Error: ${error instanceof Error ? error.message : 'Unknown error'}`]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Keep existing drag-and-drop handlers unchanged
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
    if (file) handleFile(file);
    if (e.target) e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl space-y-6">
        {/* Upload Card */}
        <div
          className={`rounded-2xl border-2 border-dashed ${
            isDragging ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-600'
          } transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
            isUploaded ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
          }`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-6 p-12 text-center">
            {/* Upload Icon Animation */}
            <div className={`relative transition-transform duration-300 p-2 ${isDragging ? 'scale-110' : 'scale-100'}`}>
              <div className={`absolute inset-0 rounded-full bg-teal-600/40 ${isDragging ? 'animate-ping' : ''}`} />
              <IconCloudUpload stroke={2} size={40} className='text-teal-800' />
            </div>

            {/* Text Content */}
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

            {/* Language Selector and Browse Button */}
            {!isUploaded && (
              <>
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="rounded-lg bg-slate-700 px-4 py-2 text-slate-200 cursor-pointer"
                >
                  <option value="spanish">English</option>
                  <option value="english">Español</option>
                  <option value="french">French</option>
                </select>

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

        {/* Processing Messages */}
        {isUploaded && (
          <div className="bg-slate-800/50 rounded-2xl p-6 space-y-4 animate-fade-in">
            <h3 className="text-xl font-semibold text-slate-100">Processing Progress</h3>
            <div className="space-y-2 font-mono text-sm">
              {messages.map((message, index) => (
                <div key={index} className="text-emerald-400">
                  {message.replace(/(\n|\/n)/g, '')}
                </div>
              ))}
              {isProcessing && (
                <div className="text-slate-400 animate-pulse">Processing...</div>
              )}
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileInputChange}
          className="absolute opacity-0 -z-10"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}