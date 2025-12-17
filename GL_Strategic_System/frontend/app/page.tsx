'use client';

import { useState } from 'react';
import AudioUploader from '@/components/AudioUploader';
import TranscriptView from '@/components/TranscriptView';
import ProcessingStatus from '@/components/ProcessingStatus';

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleAudioUpload = async (file: File) => {
    try {
      setError(null);
      setIsProcessing(true);
      setProgress(10);
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al subir el archivo');
      }

      const data = await response.json();
      setProgress(30);
      setUploadedFile(data.filename);

      // Simular procesamiento
      setProgress(60);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Obtener transcripción
      const transcriptResponse = await fetch(`/api/transcript?file=${data.filename}`);
      
      if (transcriptResponse.ok) {
        const transcriptData = await transcriptResponse.json();
        setProgress(100);
        setTranscript(transcriptData.transcript);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setUploadedFile(null);
    setTranscript(null);
    setError(null);
    setProgress(0);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">Convierte Audio en Sitios Web</h2>
        <p className="text-lg text-blue-100">
          Sube un archivo de audio (MP3, WAV) y genera automáticamente una página web con transcripción
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">1. Subir Audio</h3>
            <AudioUploader 
              onUpload={handleAudioUpload}
              isProcessing={isProcessing}
            />
          </div>

          {/* Status Section */}
          {isProcessing && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Procesando...</h3>
              <ProcessingStatus progress={progress} />
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-semibold">Error:</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {uploadedFile && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-semibold">✓ Archivo subido:</p>
              <p className="text-green-700 text-sm mt-1">{uploadedFile}</p>
            </div>
          )}

          {transcript && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">2. Transcripción</h3>
              <TranscriptView transcript={transcript} />
              <button
                onClick={handleReset}
                className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Procesar Otro Audio
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h4 className="font-semibold text-gray-900 mb-3">Información del Sistema</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>✓ Formatos soportados: MP3, WAV, OGG</li>
          <li>✓ Tamaño máximo: 100MB</li>
          <li>✓ Transcripción: OpenAI Whisper API</li>
          <li>✓ Generación de web: Next.js + n8n</li>
        </ul>
      </div>
    </div>
  );
}
