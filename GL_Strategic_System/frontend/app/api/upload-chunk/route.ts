import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// ========== CONFIGURATION ==========
const UPLOAD_TEMP_DIR = path.join(os.tmpdir(), 'sam-v3-uploads');
const MAX_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB maximum per chunk
const REQUEST_TIMEOUT_MS = 30000; // 30 seconds timeout
const MAX_FILENAME_LENGTH = 255;
const ALLOWED_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.m4a', '.flac'];

// ========== UTILITIES ==========

/**
 * Sanitize filenames to prevent path traversal attacks
 */
function sanitizeFilename(filename: string): string {
  let sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  sanitized = sanitized.substring(0, MAX_FILENAME_LENGTH);
  sanitized = sanitized.replace(/^\.+/, ''); // Prevent hidden files
  return sanitized || 'audio';
}

/**
 * Validate session ID is a valid UUID
 */
function isValidSessionId(sessionId: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionId);
}

/**
 * Validate allowed file types
 */
function isAllowedFileType(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
}

// ========== MAIN POST HANDLER ==========

export async function POST(request: NextRequest) {
  try {
    // Timeout wrapper
    return await Promise.race([
      handleChunkUpload(request),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), REQUEST_TIMEOUT_MS)
      )
    ]) as Promise<NextResponse>;
  } catch (error: any) {
    console.error('[upload-chunk] Error:', error);
    
    if (error.message === 'Request timeout') {
      return NextResponse.json(
        { error: 'Upload timeout' },
        { status: 408 }
      );
    }
    
    const statusCode = error.status || 500;
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: statusCode }
    );
  }
}

async function handleChunkUpload(request: NextRequest): Promise<NextResponse> {
  if (!fs.existsSync(UPLOAD_TEMP_DIR)) {
    fs.mkdirSync(UPLOAD_TEMP_DIR, { recursive: true });
  }

  const formData = await request.formData();
  const sessionId = formData.get('sessionId') as string;
  const chunkNumber = parseInt(formData.get('chunkNumber') as string, 10);
  const totalChunks = parseInt(formData.get('totalChunks') as string, 10);
  const filename = formData.get('filename') as string;
  const chunkData = formData.get('chunk') as Blob;

  // Validate inputs
  if (!sessionId || !isValidSessionId(sessionId)) {
    const error: any = new Error('Invalid session ID');
    error.status = 400;
    throw error;
  }

  if (!filename || !isAllowedFileType(filename)) {
    const error: any = new Error('Invalid file type');
    error.status = 400;
    throw error;
  }

  if (isNaN(chunkNumber) || isNaN(totalChunks) || chunkNumber < 0 || totalChunks <= 0) {
    const error: any = new Error('Invalid chunk parameters');
    error.status = 400;
    throw error;
  }

  if (!chunkData) {
    const error: any = new Error('Missing chunk data');
    error.status = 400;
    throw error;
  }

  const chunkBuffer = Buffer.from(await chunkData.arrayBuffer());
  
  if (chunkBuffer.length > MAX_CHUNK_SIZE) {
    const error: any = new Error(`Chunk exceeds ${MAX_CHUNK_SIZE / 1024 / 1024}MB`);
    error.status = 413;
    throw error;
  }

  // Create session directory
  const sanitizedFilename = sanitizeFilename(filename);
  const sessionDir = path.join(UPLOAD_TEMP_DIR, sessionId);
  const chunksDir = path.join(sessionDir, 'chunks');

  if (!fs.existsSync(chunksDir)) {
    fs.mkdirSync(chunksDir, { recursive: true });
  }

  // Write chunk
  const chunkPath = path.join(chunksDir, `chunk_${chunkNumber}`);
  try {
    fs.writeFileSync(chunkPath, chunkBuffer);
  } catch (err: any) {
    const error: any = new Error(`Failed to write: ${err.message}`);
    error.status = 500;
    throw error;
  }

  // Update metadata
  const metadataPath = path.join(sessionDir, 'metadata.json');
  const metadata = {
    filename: sanitizedFilename,
    totalChunks,
    receivedChunks: 0,
    totalSize: 0,
    createdAt: new Date().toISOString(),
  };

  try {
    const chunks = fs.readdirSync(chunksDir);
    metadata.receivedChunks = chunks.length;
    metadata.totalSize = chunks.reduce((sum, chunk) => {
      try {
        const stats = fs.statSync(path.join(chunksDir, chunk));
        return sum + stats.size;
      } catch {
        return sum;
      }
    }, 0);
  } catch {}

  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

  console.log(`[upload-chunk] ${chunkNumber}/${totalChunks} for session ${sessionId}`);

  return NextResponse.json({
    success: true,
    sessionId,
    chunkNumber,
    totalChunks,
    receivedChunks: metadata.receivedChunks,
  });
}
