'use client';

import { useState } from 'react';

interface TranscriptViewProps {
  transcript: string;
}

export default function TranscriptView({ transcript }: TranscriptViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([transcript], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'transcript.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const wordCount = transcript.split(/\s+/).length;
  const charCount = transcript.length;

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>📄 {charCount} caracteres</span>
            <span>| 📖 {wordCount} palabras</span>
          </div>
        </div>
        <p className="text-gray-900 leading-relaxed whitespace-pre-wrap break-words">
          {transcript}
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleCopy}
          className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold text-sm"
        >
          {copied ? '✓ Copiado' : 'Copiar'}
        </button>
        <button
          onClick={handleDownload}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-sm"
        >
          ⬇ Descargar TXT
        </button>
      </div>
    </div>
  );
}
