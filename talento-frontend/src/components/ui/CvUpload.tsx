"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, Upload, X } from "lucide-react";
import api from "@/lib/api";

interface Props {
  value: string;
  onChange: (url: string) => void;
  labels: {
    upload: string;
    uploading: string;
    replace: string;
    view: string;
    uploadError: string;
  };
}

export default function CvUpload({ value, onChange, labels }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filename = value ? decodeURIComponent(value.split("/").pop() ?? value) : null;

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post<{ url: string }>("/candidates/upload-cv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onChange(data.url);
    } catch {
      setError(labels.uploadError);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={handleFile}
      />

      {value ? (
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
          <FileText className="h-4 w-4 shrink-0 text-blue-500" />
          <span className="min-w-0 flex-1 truncate text-sm text-gray-700">{filename}</span>
          <a href={value} target="_blank" rel="noreferrer" className="shrink-0 text-xs text-blue-600 hover:underline">
            {labels.view}
          </a>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="shrink-0 text-xs text-gray-500 hover:text-gray-700"
          >
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : labels.replace}
          </button>
          <button type="button" onClick={() => onChange("")} className="shrink-0 text-gray-400 hover:text-red-500">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-4 text-sm text-gray-500 transition-colors hover:border-blue-400 hover:text-blue-600 disabled:opacity-60"
        >
          {uploading ? (
            <><Loader2 className="h-4 w-4 animate-spin" />{labels.uploading}</>
          ) : (
            <><Upload className="h-4 w-4" />{labels.upload}</>
          )}
        </button>
      )}

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
