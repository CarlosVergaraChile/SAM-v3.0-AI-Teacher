'use client';

import { useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

// ========== CONFIGURATION ==========
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
const ALLOWED_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/flac'];

interface AudioUploaderProps {
  onUpload?: (sessionId: string, filename: string) => void;
  isProcessing?: boolean;
}

interface UploadProgress {
  percentage: number;
  currentChunk: number;
  totalChunks: number;
  status: 'idle' | 'uploading' | 'finalizing' | 'complete' | 'error';
  message: string;
}

/**
 * Modular AudioUploader Component - Reusable across ecosystem
 * Handles large file uploads with automatic chunking
 */
export default function AudioUploader({ onUpload, isProcessing = false }: AudioUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<UploadProgress>({
    percentage: 0,
    currentChunk: 0,
    totalChunks: 0,
    status: 'idle',
    message: 'Select audio file to upload',
  });
  const [sessionId, setSessionId] = useState<string | null>(null);

  /**
   * Calculate total chunks for a file
   */
  const calculateChunks = (fileSize: number): number => {
    return Math.ceil(fileSize / CHUNK_SIZE);
  };

  /**
   * Upload a single chunk to the server
   */
  const uploadChunk = async (
    file: File,
    chunkIndex: number,
    totalChunks: number,
    sessionId: string
  ): Promise<boolean> => {
    const start = chunkIndex * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    const formData = new FormData();
    formData.append('sessionId', sessionId);
    formData.append('chunkNumber', chunkIndex.toString());
    formData.append('totalChunks', totalChunks.toString());
    formData.append('filename', file.name);
    formData.append('chunk', chunk);

    try {
      const response = await fetch('/api/upload-chunk', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Chunk ${chunkIndex} failed`);
      }

      return true;
    } catch (error) {
      console.error(`Chunk ${chunkIndex} error:`, error);
      throw error;
    }
  };

  /**
   * Finalize the upload by assembling chunks on server
   */
  const finalizeUpload = async (sessionId: string, filename: string): Promise<boolean> => {
    const formData = new FormData();
    formData.append('sessionId', sessionId);

    try {
      setProgress(p => ({ ...p, status: 'finalizing', message: 'Assembling audio file...' }));
      
      const response = await fetch('/api/finalize-upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Finalization failed');
      }

      const result = await response.json();
      setProgress(p => ({
        ...p,
        status: 'complete',
        percentage: 100,
        message: `Upload complete: ${filename}`,
      }));

      onUpload?.(sessionId, filename);
      return true;
    } catch (error) {
      console.error('Finalization error:', error);
      throw error;
    }
  };

  /**
   * Main upload handler
   */
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setProgress(p => ({
        ...p,
        status: 'error',
        message: 'Invalid file type. Please upload an audio file.',
      }));
      return;
    }

    // Generate session ID and prepare
    const newSessionId = uuidv4();
    setSessionId(newSessionId);
    const totalChunks = calculateChunks(file.size);

    setProgress({
      percentage: 0,
      currentChunk: 0,
      totalChunks,
      status: 'uploading',
      message: `Uploading 0/${totalChunks} chunks...`,
    });

    try {
      // Upload all chunks
      for (let i = 0; i < totalChunks; i++) {
        await uploadChunk(file, i, totalChunks, newSessionId);
        
        const percentage = Math.round(((i + 1) / totalChunks) * 100);
        setProgress(p => ({
          ...p,
          currentChunk: i + 1,
          percentage,
          message: `Uploaded ${i + 1}/${totalChunks} chunks...`,
        }));
      }

      // Finalize upload
      await finalizeUpload(newSessionId, file.name);
    } catch (error) {
      setProgress(p => ({
        ...p,
        status: 'error',
        message: `Error: ${error instanceof Error ? error.message : 'Upload failed'}`,
      }));
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="audio-uploader">
      <div className="upload-box">
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileSelect}
          disabled={isProcessing || progress.status === 'uploading'}
          style={{ display: 'none' }}
        />
        <button
          onClick={handleClick}
          disabled={isProcessing || progress.status === 'uploading'}
          className="upload-button"
        >
          {progress.status === 'uploading' ? 'Uploading...' : 'Select Audio File'}
        </button>
      </div>

      {progress.status !== 'idle' && (
        <div className="progress-container">
          <div className="progress-message">{progress.message}</div>
          <div className="progress-bar-wrapper">
            <div className="progress-bar" style={{ width: `${progress.percentage}%` }} />
          </div>
          <div className="progress-percentage">{progress.percentage}%</div>
          {progress.status === 'error' && (
            <div className="error-message">{progress.message}</div>
          )}
        </div>
      )}

      <style jsx>{`
        .audio-uploader {
          padding: 20px;
          border-radius: 8px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
        }
        .upload-box {
          margin-bottom: 16px;
        }
        .upload-button {
          background-color: #3b82f6;
          color: white;
          padding: 10px 20px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        .upload-button:hover:not(:disabled) {
          background-color: #2563eb;
        }
        .upload-button:disabled {
          background-color: #d1d5db;
          cursor: not-allowed;
        }
        .progress-container {
          margin-top: 16px;
        }
        .progress-message {
          font-size: 13px;
          color: #6b7280;
          margin-bottom: 8px;
        }
        .progress-bar-wrapper {
          width: 100%;
          height: 8px;
          background-color: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }
        .progress-bar {
          height: 100%;
          background-color: #3b82f6;
          transition: width 0.3s ease;
        }
        .progress-percentage {
          font-size: 12px;
          color: #9ca3af;
          text-align: right;
        }
        .error-message {
          color: #dc2626;
          font-size: 13px;
          margin-top: 8px;
        }
      `}</style>
    </div>
  );
}
