import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// ========== CONFIGURACIÓN ==========
const UPLOAD_TEMP_DIR = path.join(os.tmpdir(), 'gl-strategic-uploads');
const FINAL_UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/audio-processing';
const N8N_API_KEY = process.env.N8N_API_KEY || '';
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

// Crear directorio final si no existe
if (!fs.existsSync(FINAL_UPLOAD_DIR)) {
  fs.mkdirSync(FINAL_UPLOAD_DIR, { recursive: true });
}

// ========== TIPOS ==========
interface FinalizeRequest {
  uploadId: string;
  fileName: string;
}

interface FinalizeResponse {
  success: boolean;
  uploadId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  message: string;
  n8nTriggered: boolean;
  timestamp: string;
}

// ========== UTILIDADES ==========
/**
 * Obtiene el directorio de uploads para un uploadId
 */
function getUploadDirPath(uploadId: string): string {
  const sanitizedUploadId = uploadId.replace(/[^a-zA-Z0-9_-]/g, '');
  return path.join(UPLOAD_TEMP_DIR, sanitizedUploadId);
}

/**
 * Obtiene el path del chunk
 */
function getChunkPath(uploadId: string, chunkIndex: number): string {
  const sanitizedUploadId = uploadId.replace(/[^a-zA-Z0-9_-]/g, '');
  return path.join(UPLOAD_TEMP_DIR, `${sanitizedUploadId}_chunk_${chunkIndex}`);
}

/**
 * Sanitiza el nombre del archivo
 */
function sanitizeFileName(fileName: string): string {
  // Remover caracteres peligrosos
  let sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  // Limitar longitud
  sanitized = sanitized.substring(0, 100);
  return sanitized;
}

/**
 * Cuenta cuántos chunks existen para un upload
 */
function countChunks(uploadId: string, totalChunks: number): number {
  let count = 0;
  for (let i = 0; i < totalChunks; i++) {
    const chunkPath = getChunkPath(uploadId, i);
    if (fs.existsSync(chunkPath)) {
      count++;
    }
  }
  return count;
}

/**
 * Ensamble todos los chunks en un archivo final
 */
async function assembleChunks(
  uploadId: string,
  totalChunks: number,
  finalFilePath: string
): Promise<number> {
  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(finalFilePath);
    let totalBytesWritten = 0;
    let chunkIndex = 0;

    const writeNextChunk = () => {
      if (chunkIndex >= totalChunks) {
        writeStream.end();
        console.log(`✓ All chunks assembled. Total: ${(totalBytesWritten / 1024 / 1024).toFixed(2)}MB`);
        resolve(totalBytesWritten);
        return;
      }

      const chunkPath = getChunkPath(uploadId, chunkIndex);

      try {
        const chunkData = fs.readFileSync(chunkPath);
        totalBytesWritten += chunkData.length;
        writeStream.write(chunkData);
        console.log(`✓ Chunk ${chunkIndex + 1}/${totalChunks} written (${(chunkData.length / 1024).toFixed(2)}KB)`);
        chunkIndex++;
        writeNextChunk();
      } catch (error) {
        writeStream.destroy();
        reject(new Error(`Failed to read chunk ${chunkIndex}: ${error}`));
      }
    };

    writeStream.on('error', (error) => reject(error));
    writeNextChunk();
  });
}

/**
 * Limpia los chunks temporales después del ensamblaje
 */
function cleanupChunks(uploadId: string, totalChunks: number): void {
  for (let i = 0; i < totalChunks; i++) {
    const chunkPath = getChunkPath(uploadId, i);
    try {
      if (fs.existsSync(chunkPath)) {
        fs.unlinkSync(chunkPath);
        console.log(`✓ Cleaned up chunk ${i}`);
      }
    } catch (error) {
      console.error(`❌ Failed to cleanup chunk ${i}:`, error);
    }
  }

  // Limpiar directorio del upload
  const uploadDir = getUploadDirPath(uploadId);
  try {
    if (fs.existsSync(uploadDir)) {
      fs.rmdirSync(uploadDir, { recursive: true });
      console.log(`✓ Cleaned up upload directory`);
    }
  } catch (error) {
    console.error(`❌ Failed to cleanup upload directory:`, error);
  }
}

/**
 * Dispara el webhook de n8n para procesar el archivo
 */
async function triggerN8nWorkflow(filePath: string, fileName: string): Promise<boolean> {
  try {
    if (!N8N_WEBHOOK_URL) {
      console.warn('⚠️ n8n webhook URL not configured');
      return false;
    }

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(N8N_API_KEY && { 'x-api-key': N8N_API_KEY }),
      },
      body: JSON.stringify({
        filePath,
        fileName,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      console.error(`❌ n8n webhook returned ${response.status}`);
      return false;
    }

    console.log(`✓ n8n workflow triggered successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to trigger n8n workflow:`, error);
    return false;
  }
}

// ========== HANDLER POST ==========
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    // Parsear JSON body
    let body: FinalizeRequest;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const { uploadId, fileName } = body;

    // Validaciones
    if (!uploadId || typeof uploadId !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid uploadId' },
        { status: 400 }
      );
    }

    if (!fileName || typeof fileName !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid fileName' },
        { status: 400 }
      );
    }

    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      return NextResponse.json(
        { error: 'Invalid fileName: path traversal detected' },
        { status: 400 }
      );
    }

    const sanitizedFileName = sanitizeFileName(fileName);
    const finalFilePath = path.join(FINAL_UPLOAD_DIR, sanitizedFileName);

    console.log(`
🔙 Finalizing upload
├─ uploadId: ${uploadId}
├─ fileName: ${sanitizedFileName}
├─ destination: ${finalFilePath}
└─ timestamp: ${new Date().toISOString()}
    `);

    // TODO: Obtener totalChunks de algún lugar (necesitarías guardarlo)
    // Por ahora asumimos que el cliente enviará este dato
    // O lo recuperas de un archivo JSON que guardaste durante el upload
    const totalChunks = parseInt(request.headers.get('x-total-chunks') || '0', 10);

    if (totalChunks === 0) {
      return NextResponse.json(
        { error: 'totalChunks header not provided' },
        { status: 400 }
      );
    }

    // Verificar que todos los chunks existan
    const actualChunks = countChunks(uploadId, totalChunks);
    if (actualChunks !== totalChunks) {
      return NextResponse.json(
        {
          error: `Missing chunks: expected ${totalChunks}, found ${actualChunks}`,
        },
        { status: 400 }
      );
    }

    // Ensamblar chunks
    console.log(`🔗 Assembling ${totalChunks} chunks...`);
    let finalFileSize: number;
    try {
      finalFileSize = await assembleChunks(uploadId, totalChunks, finalFilePath);
    } catch (error) {
      console.error(`❌ Chunk assembly failed:`, error);
      return NextResponse.json(
        {
          error: `Failed to assemble chunks: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
        { status: 500 }
      );
    }

    // Validar tamaño final
    if (finalFileSize > MAX_FILE_SIZE) {
      fs.unlinkSync(finalFilePath); // Eliminar archivo si es demasiado grande
      cleanupChunks(uploadId, totalChunks);
      return NextResponse.json(
        { error: `Final file size exceeds maximum (${MAX_FILE_SIZE / 1024 / 1024}MB)` },
        { status: 413 }
      );
    }

    // Verificar integridad del archivo
    try {
      const stats = fs.statSync(finalFilePath);
      if (stats.size !== finalFileSize) {
        fs.unlinkSync(finalFilePath);
        cleanupChunks(uploadId, totalChunks);
        return NextResponse.json(
          { error: 'Final file size verification failed' },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error(`❌ Failed to verify final file:`, error);
      return NextResponse.json(
        { error: 'File verification failed' },
        { status: 500 }
      );
    }

    // Limpiar chunks temporales
    console.log(`🗑️ Cleaning up temporary chunks...`);
    cleanupChunks(uploadId, totalChunks);

    // Disparar webhook de n8n
    console.log(`🗣️ Triggering n8n workflow...`);
    const n8nTriggered = await triggerN8nWorkflow(finalFilePath, sanitizedFileName);

    const duration = Date.now() - startTime;

    const response: FinalizeResponse = {
      success: true,
      uploadId,
      fileName: sanitizedFileName,
      filePath: finalFilePath,
      fileSize: finalFileSize,
      message: `Upload finalized successfully (${(finalFileSize / 1024 / 1024).toFixed(2)}MB in ${(duration / 1000).toFixed(2)}s)`,
      n8nTriggered,
      timestamp: new Date().toISOString(),
    };

    console.log(`
✅ Upload finalized
├─ File: ${sanitizedFileName}
├─ Size: ${(finalFileSize / 1024 / 1024).toFixed(2)}MB
├─ Duration: ${(duration / 1000).toFixed(2)}s
└─ n8n: ${n8nTriggered ? '✅ Triggered' : '⚠️ Skipped'}
    `);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error(`❌ Unexpected error in finalize-upload:`, error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
