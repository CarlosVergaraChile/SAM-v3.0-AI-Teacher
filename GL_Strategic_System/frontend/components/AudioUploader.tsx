'use client';

import { useRef, useState } from 'react';

interface AudioUploaderProps {
  onUpload: (file: File) => Promise<void>;
  isProcessing: boolean;
}

export default function AudioUploader({
  onUpload,
  isProcessing,
}: AudioUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (isAudioFile(file)) {
        setSelectedFile(file);
      } else {
        alert('Por favor sube un archivo de audio (MP3, WAV, OGG)');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (isAudioFile(file)) {
        setSelectedFile(file);
      } else {
        alert('Por favor sube un archivo de audio (MP3, WAV, OGG)');
      }
    }
  };

  const isAudioFile = (file: File): boolean => {
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'];
    return validTypes.includes(file.type) || /\.(mp3|wav|ogg)$/i.test(file.name);
  };

  const handleUpload = async () => {
    if (selectedFile) {
      try {
        await onUpload(selectedFile);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer"
        >
          <div className="text-4xl mb-2">🎵</div>
          <p className="font-semibold text-gray-900 mb-1">
            {selectedFile ? selectedFile.name : 'Arrastra tu audio aquí'}
          </p>
          <p className="text-sm text-gray-600">
            o haz clic para seleccionar un archivo
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Formatos soportados: MP3, WAV, OGG (Máx. 100MB)
          </p>
        </div>
      </div>

      {selectedFile && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-2">
            Archivo seleccionado: <span className="font-semibold">{selectedFile.name}</span>
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Tamaño: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </p>
          <button
            onClick={handleUpload}
            disabled={isProcessing}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-semibold"
          >
            {isProcessing ? 'Procesando...' : 'Iniciar Transcripción'}
          </button>
        </div>
      )}
    </div>
  );
}
