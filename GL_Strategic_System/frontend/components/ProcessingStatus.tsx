'use client';

interface ProcessingStatusProps {
  progress: number;
}

export default function ProcessingStatus({ progress }: ProcessingStatusProps) {
  const getStatusMessage = (progress: number): string => {
    if (progress < 20) return 'Preparando archivo...';
    if (progress < 40) return 'Enviando a procesamiento...';
    if (progress < 60) return 'Transcribiendo audio...';
    if (progress < 80) return 'Optimizando transcripción...';
    if (progress < 100) return 'Finalizando...';
    return '¡Completo!';
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">
            {getStatusMessage(progress)}
          </span>
          <span className="text-sm font-bold text-blue-600">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className={`p-3 rounded-lg ${
          progress >= 20 ? 'bg-green-100 text-green-900' : 'bg-gray-100 text-gray-600'
        }`}>
          <div className="text-lg mb-1">{progress >= 20 ? '✓' : '1'}</div>
          <div className="text-xs font-medium">Cargado</div>
        </div>
        <div className={`p-3 rounded-lg ${
          progress >= 60 ? 'bg-green-100 text-green-900' : 'bg-gray-100 text-gray-600'
        }`}>
          <div className="text-lg mb-1">{progress >= 60 ? '✓' : '2'}</div>
          <div className="text-xs font-medium">Procesando</div>
        </div>
        <div className={`p-3 rounded-lg ${
          progress >= 100 ? 'bg-green-100 text-green-900' : 'bg-gray-100 text-gray-600'
        }`}>
          <div className="text-lg mb-1">{progress >= 100 ? '✓' : '3'}</div>
          <div className="text-xs font-medium">Listo</div>
        </div>
      </div>
    </div>
  );
}
