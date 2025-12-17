# GL_Strategic_System Frontend - Setup Guide

## Descripción del Proyecto

MVP funcional para la plataforma de conversión de Audio -> Sitios Web. Este frontend Next.js proporciona una interfaz para:
- Carga de archivos de audio (.mp3, .wav)
- Integración con el workflow n8n de automatización
- Visualización de transcripciones generadas
- Dashboard de estado de procesamiento

## Requisitos Previos

- **Node.js 18+** ([Descargar](https://nodejs.org/))
- **npm 9+** o **yarn 4+**
- **Git** para control de versiones
- Acceso a variables de entorno para API keys (Whisper/OpenAI)

## Estructura de Carpetas

```
frontend/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Página principal
│   ├── layout.tsx         # Layout global
│   ├── api/              # API routes
│   │   ├── upload.ts      # Endpoint para carga de archivos
│   │   ├── status.ts      # Endpoint para estado de procesamiento
│   └   └── transcript.ts  # Endpoint para recuperar transcripción
├── components/           # Componentes React reutilizables
│   ├── AudioUploader.tsx  # Componente de carga de audio
│   ├── TranscriptView.tsx # Visualizador de transcripción
│   ├── ProcessingStatus.tsx # Indicador de progreso
│   └── Layout.tsx         # Componente de layout
├── lib/                  # Funciones de utilidad
│   ├── api.ts             # Cliente API
│   ├── utils.ts           # Funciones auxiliares
│   └── constants.ts       # Configuración global
├── public/               # Archivos estáticos
├── styles/               # Estilos CSS/TailwindCSS
├── .env.local            # Variables de entorno (NO comitear)
├── .env.example          # Template de variables de entorno
├── package.json          # Dependencias del proyecto
├── next.config.js        # Configuración de Next.js
├── tsconfig.json         # Configuración de TypeScript
└── tailwind.config.js    # Configuración de TailwindCSS
```

## Instalación Local

### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/CarlosVergaraChile/SAM-v3.0-AI-Teacher.git
cd SAM-v3.0-AI-Teacher/GL_Strategic_System/frontend
```

### Paso 2: Instalar Dependencias

```bash
npm install
# o
yarn install
# o
pnpm install
```

### Paso 3: Configurar Variables de Entorno

Copiar `.env.example` a `.env.local` y actualizar con tus credenciales:

```bash
cp .env.example .env.local
```

Archivo `.env.local` (NO comitear):
```
NEXT_PUBLIC_API_URL=http://localhost:3000
OPENAI_API_KEY=sk-xxxxxxxxxxxx
n8n_WEBHOOK_URL=http://localhost:5678/webhook/...
AUDIO_UPLOAD_PATH=/uploads/audio
```

### Paso 4: Iniciar Servidor de Desarrollo

```bash
npm run dev
```

El servidor estará disponible en: **http://localhost:3000**

## Scripts Disponibles

```bash
# Desarrollo local
npm run dev

# Compilar para producción
npm run build

# Iniciar servidor de producción
npm start

# Linter (ESLint)
npm run lint

# Verificar tipos TypeScript
npm run type-check
```

## Stack Tecnológico

| Tecnología | Versión | Propósito |
|---|---|---|
| **Next.js** | 14+ | Framework React con SSR |
| **React** | 18+ | Librería UI |
| **TypeScript** | 5+ | Type safety |
| **TailwindCSS** | 3+ | Estilos |
| **Axios** | 1.6+ | Cliente HTTP |

## Flujo de Funcionalidad (MVP)

1. **Usuario carga archivo de audio** en el formulario
2. **Frontend envía archivo a** `/api/upload` (Next.js API Route)
3. **Backend (n8n) recibe el archivo** y lo procesa con Whisper
4. **Transcripción se almacena** en `/output/`
5. **Frontend consulta estado** con `/api/status`
6. **Una vez completo, muestra** transcripción en `/api/transcript`

## Troubleshooting

### Error: "Cannot find module 'next'"
- Ejecutar: `npm install`

### Error: "Port 3000 already in use"
- Usar puerto alternativo: `npm run dev -- -p 3001`

### CORS errors con n8n
- Verificar que n8n webhook URL sea accesible desde el navegador
- Configurar headers CORS en n8n

## Documentación Adicional

- [Next.js Docs](https://nextjs.org/docs)
- [React 18 Docs](https://react.dev)
- [TailwindCSS Docs](https://tailwindcss.com/docs)

## Soporte

Para problemas o preguntas, contactar al equipo de desarrollo o crear un issue en GitHub.
