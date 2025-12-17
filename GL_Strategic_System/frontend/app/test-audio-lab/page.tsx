'use client';

import AudioUploader from '../../components/AudioUploader';

export default function AudioLabPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f3f4f6',
      padding: '20px',
    }}>
      <h1 style={{
        fontSize: '48px',
        fontWeight: 'bold',
        marginBottom: '40px',
        textAlign: 'center',
        color: '#1f2937',
      }}>
        🧪 Laboratorio de Audio - Prueba de Humo
      </h1>
      
      <div style={{
        maxWidth: '600px',
        width: '100%',
      }}>
        <AudioUploader 
          onUpload={(sessionId, filename) => {
            console.log(`✅ Upload complete: ${filename}`);
            console.log(`Session ID: ${sessionId}`);
          }}
        />
      </div>
      
      <div style={{
        marginTop: '60px',
        maxWidth: '600px',
        backgroundColor: '#e0f2fe',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #0284c7',
      }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: '600',
          marginBottom: '12px',
          color: '#0c4a6e',
        }}>
          📝 Instrucciones de Prueba
        </h2>
        <ul style={{
          listStyleType: 'none',
          padding: 0,
          color: '#0c4a6e',
          lineHeight: '1.8',
        }}>
          <li>✓ Selecciona un archivo de audio (MP3, WAV, OGG, M4A, FLAC)</li>
          <li>✓ El sistema automáticamente lo dividirá en chunks de 5MB</li>
          <li>✓ Verás el progreso en tiempo real</li>
          <li>✓ Se ensamblará en el servidor y se limpiará temporales</li>
          <li>✓ Revisa la consola del navegador para logs de sesión</li>
        </ul>
      </div>
    </div>
  );
}
