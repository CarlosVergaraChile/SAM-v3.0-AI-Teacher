import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

// ========== CONFIGURATION ==========
const UPLOAD_TEMP_DIR = path.join(os.tmpdir(), 'sam-v3-uploads');
const FINAL_UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
const REQUEST_TIMEOUT_MS = 120000; // 120 seconds timeout for assembly

// ========== UTILITIES ==========

/**
 * Validate session ID is a valid UUID
 */
function isValidSessionId(sessionId: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionId);
}

// ========== MAIN POST HANDLER ==========

export async function POST(request: NextRequest) {
  try {
    return await Promise.race([
      handleFinalize(request),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Finalize timeout')), REQUEST_TIMEOUT_MS)
      )
    ]) as Promise<NextResponse>;
  } catch (error: any) {
    console.error('[finalize-upload] Error:', error);
    
    if (error.message === 'Finalize timeout') {
      return NextResponse.json(
        { error: 'Assembly timeout' },
        { status: 408 }
      );
    }
    
    const statusCode = error.status || 500;
    return NextResponse.json(
      { error: error.message || 'Finalization failed' },
      { status: statusCode }
    );
  }
}

async function handleFinalize(request: NextRequest): Promise<NextResponse> {
  const formData = await request.formData();
  const sessionId = formData.get('sessionId') as string;

  // Validate session ID
  if (!sessionId || !isValidSessionId(sessionId)) {
    const error: any = new Error('Invalid session ID');
    error.status = 400;
    throw error;
  }

  const sessionDir = path.join(UPLOAD_TEMP_DIR, sessionId);
  const chunksDir = path.join(sessionDir, 'chunks');
  const metadataPath = path.join(sessionDir, 'metadata.json');

  // Validate session exists
  if (!fs.existsSync(metadataPath)) {
    const error: any = new Error('Session not found');
    error.status = 404;
    throw error;
  }

  // Read metadata
  let metadata;
  try {
    metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
  } catch (err: any) {
    const error: any = new Error('Invalid session metadata');
    error.status = 400;
    throw error;
  }

  const { filename, totalChunks } = metadata;
  const chunks = fs.readdirSync(chunksDir).sort((a, b) => {
    const numA = parseInt(a.split('_')[1], 10);
    const numB = parseInt(b.split('_')[1], 10);
    return numA - numB;
  });

  // Verify all chunks received
  if (chunks.length !== totalChunks) {
    const error: any = new Error(`Missing chunks: received ${chunks.length}, expected ${totalChunks}`);
    error.status = 400;
    throw error;
  }

  // Create final upload directory
  if (!fs.existsSync(FINAL_UPLOAD_DIR)) {
    fs.mkdirSync(FINAL_UPLOAD_DIR, { recursive: true });
  }

  // Assemble file from chunks using streams
  const finalPath = path.join(FINAL_UPLOAD_DIR, `${sessionId}_${filename}`);
  const writeStream = createWriteStream(finalPath);

  try {
    for (const chunk of chunks) {
      const chunkPath = path.join(chunksDir, chunk);
      const readStream = createReadStream(chunkPath);
      
      await pipeline(readStream, writeStream);
    }
  } catch (err: any) {
    try {
      if (fs.existsSync(finalPath)) fs.unlinkSync(finalPath);
    } catch {}
    
    const error: any = new Error(`Assembly failed: ${err.message}`);
    error.status = 500;
    throw error;
  }

  // Cleanup temporary files
  try {
    for (const chunk of chunks) {
      const chunkPath = path.join(chunksDir, chunk);
      fs.unlinkSync(chunkPath);
    }
    fs.rmdirSync(chunksDir);
    fs.rmdirSync(sessionDir);
  } catch (err) {
    console.warn('[finalize-upload] Cleanup error:', err);
  }

  console.log(`[finalize-upload] Session ${sessionId} finalized: ${finalPath}`);

  return NextResponse.json({
    success: true,
    sessionId,
    filename,
    totalChunks,
    finalPath,
    message: 'Upload completed and assembled',
  });
}
