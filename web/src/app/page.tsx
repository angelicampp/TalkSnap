"use client";
import { useCallback, useState, useRef, useEffect } from "react";
import { IconCloudUpload, IconStack2 , IconFile, IconX, IconReload } from "@tabler/icons-react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [selectedLang, setSelectedLang] = useState("en");
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageEndRef = useRef<null | HTMLDivElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFile = async (file: File) => {
    if (!file) return;

    setFileName(file.name);
    setIsUploaded(true);
    setIsProcessing(true);
    setMessages([]);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("lang", selectedLang);

    try {
      const response = await fetch("http://192.168.153.128:3001/", {
        method: "POST",
        body: formData,
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Handle both possible line endings from the server
        const lines = buffer.split(/(\n|\/n)/);
        buffer = lines.pop() || "";

        lines.forEach((line) => {
          if (line.trim() && !["\n", "/n"].includes(line)) {
            setMessages((prev) => [...prev, line]);
          }
        });
      }

      // Process remaining buffer
      if (buffer.trim()) {
        setMessages((prev) => [...prev, buffer]);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setMessages((prev) => [
        ...prev,
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset state to initial
  const resetUpload = () => {
    setIsUploaded(false);
    setIsProcessing(false);
    setMessages([]);
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
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
    if (e.target) e.target.value = "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-600 flex items-center justify-center">
                <IconStack2  size={24} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">
                TalkSnap
              </h1>
            </div>
            <nav className="hidden md:block">
              <ul className="flex space-x-8">
                <li>
                  <a href="#" className="text-slate-300 hover:text-white transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-300 hover:text-white transition">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-300 hover:text-white transition">
                    Pricing
                  </a>
                </li>
              </ul>
            </nav>
            <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-slate-700 to-slate-800 border border-slate-600 text-slate-300 hover:border-teal-500 hover:text-white transition">
              Contact Us
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-3xl space-y-6">
          {/* Upload Card */}
          <div
            className={`rounded-2xl border-2 border-dashed ${
              isDragging
                ? "border-emerald-500 bg-emerald-500/10"
                : "border-slate-600"
            } transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
              isUploaded ? "scale-95 opacity-50" : "scale-100 opacity-100"
            }`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <div className="flex flex-col items-center justify-center space-y-6 p-12 text-center relative">
              {/* Close button for uploaded state */}
              {isUploaded && (
                <button
                  onClick={resetUpload}
                  className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-700/50 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                  aria-label="Reset"
                >
                  <IconX size={20} />
                </button>
              )}

              {/* File info badge */}
              {isUploaded && fileName && (
                <div className="absolute -top-3 bg-slate-800 border border-emerald-500/30 rounded-full px-4 py-1.5 flex items-center text-sm text-emerald-400 animate-bounce">
                  <IconFile size={16} className="mr-2" />
                  <span className="truncate max-w-[160px]">{fileName}</span>
                </div>
              )}

              {/* Upload Icon Animation */}
              <div
                className={`relative transition-transform duration-300 p-2 ${
                  isDragging ? "scale-110" : "scale-100"
                }`}
              >
                <div
                  className={`absolute inset-0 rounded-full bg-teal-600/40 ${
                    isDragging ? "animate-ping" : ""
                  }`}
                />
                <IconCloudUpload
                  stroke={2}
                  size={40}
                  className={`${
                    isUploaded
                      ? "text-emerald-500"
                      : isDragging
                      ? "text-emerald-400"
                      : "text-teal-500"
                  } transition-colors`}
                />
              </div>

              {/* Text Content */}
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold text-slate-100 transition-all">
                  {isUploaded
                    ? "File Received!"
                    : isDragging
                    ? "Drop to Upload"
                    : "Drop a File to Start"}
                </h1>
                <p className="text-slate-400 transition-all">
                  {isUploaded
                    ? "Processing your file..."
                    : "Drag & drop any file, or browse to upload"}
                </p>
              </div>

              {/* Language Selector and Browse Button */}
              {!isUploaded && (
                <>
                  <div className="w-full max-w-xs">
                    <label className="block text-left text-slate-400 mb-2 text-sm">
                      Processing Language
                    </label>
                    <select
                      value={selectedLang}
                      onChange={(e) => setSelectedLang(e.target.value)}
                      className="w-full rounded-lg bg-slate-800 px-4 py-3 text-slate-200 cursor-pointer border border-slate-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 outline-none transition"
                    >
                      <option value="english">English</option>
                      <option value="spanish">Español</option>
                      <option value="french">French</option>
                    </select>
                  </div>

                  <div className="flex items-center w-full max-w-xs">
                    <div className="flex-grow h-px bg-slate-700" />
                    <span className="px-4 text-sm text-slate-500">OR</span>
                    <div className="flex-grow h-px bg-slate-700" />
                  </div>

                  <button
                    onClick={handleBrowse}
                    className="cursor-pointer rounded-lg bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-3 font-medium text-slate-200 transition-all hover:from-slate-700 hover:to-slate-800 hover:text-white active:scale-[.98] border border-slate-700 hover:border-teal-500/50 shadow-lg shadow-slate-900/50"
                  >
                    Browse Files
                  </button>
                </>
              )}

              {/* Processing status */}
              {isUploaded && (
                <div className="pt-4">
                  <div className="h-1.5 w-48 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r from-teal-500 to-emerald-500 ${
                        isProcessing ? "animate-pulse" : ""
                      }`}
                      style={{
                        width: isProcessing ? "70%" : "100%",
                        transition: "width 0.5s ease",
                      }}
                    ></div>
                  </div>
                  <p className="pt-2 text-sm text-slate-500">
                    {isProcessing ? "Analyzing content..." : "Processing complete"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Processing Messages */}
          {isUploaded && (
            <div className="bg-slate-800/50 rounded-2xl p-6 space-y-4 animate-fade-in shadow-xl shadow-slate-900/30">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-slate-100">
                  Processing Insights
                </h3>
                {!isProcessing && (
                  <button
                    onClick={resetUpload}
                    className="flex items-center text-sm bg-slate-700/60 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-slate-300 hover:text-white transition group"
                  >
                    <IconReload
                      size={18}
                      className="mr-1.5 group-hover:rotate-180 transition-transform"
                    />
                    New File
                  </button>
                )}
              </div>
              <div className="space-y-2 font-mono text-sm max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className="prose prose-invert max-w-none p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800/70 transition text-teal-100"
                  >
                    <ReactMarkdown>{message || ""}</ReactMarkdown>
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex items-center p-3 text-slate-400 animate-pulse">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></div>
                    Generating insights...
                  </div>
                )}
                <div ref={messageEndRef} />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center md:justify-start space-x-6">
              <a
                href="#"
                className="text-slate-400 hover:text-white transition"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white transition"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white transition"
              >
                Security
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white transition"
              >
                Status
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white transition"
              >
                Docs
              </a>
            </div>
            <div className="mt-8 md:mt-0 text-center">
              <p className="text-sm text-slate-500">
                © 2023 TalkSnap AI. All rights reserved.
              </p>
              <p className="mt-1 text-xs text-slate-600">
                Powered by advanced AI document processing
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileInputChange}
        className="absolute opacity-0 -z-10"
        aria-hidden="true"
      />

      {/* Decorative elements */}
      <div className="fixed top-20 left-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -z-10"></div>
      <div className="fixed bottom-20 right-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -z-10"></div>
    </div>
  );
}