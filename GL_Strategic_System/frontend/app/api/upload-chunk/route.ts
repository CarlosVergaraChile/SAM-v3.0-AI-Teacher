import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// ========== CONFIGURACIÓN ==========
const UPLOAD_TEMP_DIR = path.join(os.tmpdir(), 'gl-strategic-uploads');
const MAX_CHUNK_SIZE = 10 * 1024 * 1024; // 10MB máximo por chunk
const REQUEST_TIMEOUT_MS = 30000; // 30 segundos timeout

// Crear directorio temporal si no existe
if (!fs.existsSync(UPLOAD_TEMP_DIR)) {
  fs.mkdirSync(UPLOAD_TEMP_DIR, { recursive: true });
}

// ========== TIPOS ==========
interface UploadRequest {
  chunkIndex: number;
  totalChunks: number;
  uploadId: string;
  fileName: string;
}

interface UploadResponse {
  success: boolean;
  chunkIndex: number;
  totalChunks: number;
  uploadId: string;
  message: string;
  timestamp: string;
}

// ========== VALIDACIONES ==========
/**
 * Valida que los parámetros del upload sean válidos
 */
function validateUploadParams(
  chunkIndex: string | number,
  totalChunks: string | number,
  uploadId: string,
  fileName: string
): { valid: boolean; error?: string } {
  // Validar uploadId
  if (!uploadId || typeof uploadId !== 'string' || uploadId.length < 10) {
    return { valid: false, error: 'Invalid uploadId format' };
  }

  // Validar fileName
  if (!fileName || typeof fileName !== 'string' || fileName.length === 0) {
    return { valid: false, error: 'Invalid fileName' };
  }

  // Evitar path traversal attacks
  if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
    return { valid: false, error: 'Invalid fileName: path traversal detected' };
  }

  // Validar chunkIndex
  const chunkIdx = Number(chunkIndex);
  if (isNaN(chunkIdx) || chunkIdx < 0) {
    return { valid: false, error: 'Invalid chunkIndex' };
  }

  // Validar totalChunks
  const totalChnks = Number(totalChunks);
  if (isNaN(totalChnks) || totalChnks <= 0 || totalChnks > 1000) {
    return { valid: false, error: 'Invalid totalChunks' };
  }

  // Validar que chunkIndex < totalChunks
  if (chunkIdx >= totalChnks) {
    return { valid: false, error: 'chunkIndex >= totalChunks' };
  }

  return { valid: true };
}

/**
 * Obtiene el path seguro del chunk temporal
 */
function getChunkPath(uploadId: string, chunkIndex: number): string {
  // Sanitizar uploadId para seguridad
  const sanitizedUploadId = uploadId.replace(/[^a-zA-Z0-9_-]/g, '');
  return path.join(UPLOAD_TEMP_DIR, `${sanitizedUploadId}_chunk_${chunkIndex}`);
}

/**
 * Obtiene info del directorio de uploads
 */
function getUploadDirPath(uploadId: string): string {
  const sanitizedUploadId = uploadId.replace(/[^a-zA-Z0-9_-]/g, '');
  return path.join(UPLOAD_TEMP_DIR, sanitizedUploadId);
}

// ========== HANDLER POST ==========
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    // Validar método
    if (request.method !== 'POST') {
      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
      );
    }

    // Parsear FormData
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (error) {
      console.error('❌ Error parsing FormData:', error);
      return NextResponse.json(
        { error: 'Invalid FormData' },
        { status: 400 }
      );
    }

    // Extraer parámetros
    const file = formData.get('file') as Blob | null;
    const chunkIndex = formData.get('chunkIndex');
    const totalChunks = formData.get('totalChunks');
    const uploadId = formData.get('uploadId') as string | null;
    const fileName = formData.get('fileName') as string | null;

    // Validar que file existe
    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: 'No file provided or file is empty' },
        { status: 400 }
      );
    }

    // Validar tamaño del chunk
    if (file.size > MAX_CHUNK_SIZE) {
      return NextResponse.json(
        { error: `Chunk size exceeds maximum (${MAX_CHUNK_SIZE / 1024 / 1024}MB)` },
        { status: 413 }
      );
    }

    // Validar parámetros
    const validation = validateUploadParams(chunkIndex, totalChunks, uploadId || '', fileName || '');
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const chunkIdx = Number(chunkIndex);
    const totalChnks = Number(totalChunks);
    const uploadDir = getUploadDirPath(uploadId!);
    const chunkPath = getChunkPath(uploadId!, chunkIdx);

    // Crear directorio de uploads si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Escribir chunk a disco
    try {
      const buffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      fs.writeFileSync(chunkPath, uint8Array);
      console.log(`✓ Chunk ${chunkIdx + 1}/${totalChnks} written to disk (${(file.size / 1024).toFixed(2)}KB)`);
    } catch (error) {
      console.error(`❌ Error writing chunk to disk:`, error);
      return NextResponse.json(
        { error: 'Failed to write chunk to disk' },
        { status: 500 }
      );
    }

    // Verificar que el archivo se escribió correctamente
    try {
      const stats = fs.statSync(chunkPath);
      if (stats.size !== file.size) {
        fs.unlinkSync(chunkPath);
        return NextResponse.json(
          { error: 'Chunk size mismatch' },
        { status: 400 }
        );
      }
    } catch (error) {
      console.error('❌ Error verifying chunk:', error);
      return NextResponse.json(
        { error: 'Failed to verify chunk' },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;

    const response: UploadResponse = {
      success: true,
      chunkIndex: chunkIdx,
      totalChunks: totalChnks,
      uploadId: uploadId!,
      message: `Chunk ${chunkIdx + 1}/${totalChnks} received successfully`,
      timestamp: new Date().toISOString(),
    };

    console.log(`📦 Upload successful: ${response.message} (${duration}ms)`);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('❌ Unexpected error in upload-chunk:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ========== HANDLER OPTIONS (CORS) ==========
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
    },
  });
}
