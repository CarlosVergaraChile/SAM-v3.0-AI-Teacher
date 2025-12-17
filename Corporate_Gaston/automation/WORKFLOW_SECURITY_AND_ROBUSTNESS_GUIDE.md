# n8n Market Research Workflow - Seguridad y Robustez

## Introducción

Este documento proporciona instrucciones paso a paso para:
1. **Asegurar el webhook** contra accesos no autorizados
2. **Mejorar la resiliencia** ante fallos temporales de APIs externas
3. **Registrar errores** de forma centralizada en Google Sheets

---

## PARTE 1: SEGURIDAD DEL WEBHOOK (Autenticación con Header)

### Objetivo
Proteger tu webhook de entrada para que SOLO tu aplicación pueda disparar el workflow.

### Paso 1: Configurar el Nodo Webhook

1. En n8n, abre tu workflow `market_research_workflow.json`
2. Selecciona el nodo **"Webhook Trigger"**
3. En el panel de configuración, busca "Authentication"
4. Cambia de "None" a "Header Auth"
5. Configura:
   - **Header Name:** `x-api-key`
   - **Header Value:** `{{$env.N8N_API_KEY}}`

### Paso 2: Agregar Variable de Entorno en n8n

```bash
# En tu servidor n8n, edita el archivo .env

N8N_API_KEY=sk-corporate-gaston-2025-secure-random-string-here
# ⚠️ Usa una cadena fuerte (mínimo 32 caracteres)
# Recomendación: Genera con: openssl rand -hex 32
```

### Paso 3: Crear Nodo de Validación (If/Switch)

Después del webhook, agrega un nodo **"If"** (condición):

```
Nodo Type: "If"
Condition: 
  Conditions: [1]
    - Condition 1:
      - Value: {{$node['Webhook Trigger'].json.headers['x-api-key']}}
      - Operation: "equals"
      - Value: {{$env.N8N_API_KEY}}
  Combine: "AND"
  Truthy: "Undefined"
True: [conectar a Google Search API]
False: [Respuesta de error]
```

### Paso 4: Configurar Respuesta de Error 403

En la rama **False** del nodo "If", agrega:

```
Nodo Type: "Respond to Webhook"
Status Code: 403
Response:
{
  "error": "Unauthorized",
  "message": "Invalid or missing x-api-key header",
  "timestamp": "{{$now.toISO()}}"
}
```

### Cómo Usar el Webhook Protegido

Desde tu aplicación frontend:

```typescript
// Ejemplo en React/NextJS
const executeMarketResearch = async (query: string) => {
  const response = await fetch(
    'https://your-n8n-instance.com/webhook/market-research',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NEXT_PUBLIC_N8N_API_KEY, // Desde .env
      },
      body: JSON.stringify({ query }),
    }
  );

  if (response.status === 403) {
    throw new Error('Unauthorized: Invalid API key');
  }

  return response.json();
};
```

---

## PARTE 2: ROBUSTEZ Y REINTENTOS

### Objetivo
Evitar que errores temporales de Google APIs rompan el workflow completo.

### Paso 1: Habilitar Reintentos en HTTP Request

1. Selecciona el nodo **"Google Custom Search API"**
2. En el panel derecho, busca "Options" → "Retry"
3. Configura:
   - **Retry On Fail:** ON ✓
   - **Max Retries:** 3
   - **Wait Between Retries (ms):** 1000
   - **Backoff Strategy:** "Linear" (opcional: exponential para más espaciado)

```
Intento 1: Inmediato
Intento 2: +1000ms (1 segundo)
Intento 3: +1000ms (1 segundo)
Intento 4: +1000ms (1 segundo)
Total: 3 segundos máximo antes de fallar
```

### Paso 2: Repetir para Google Sheets API

1. Selecciona el nodo **"Append to Google Sheets"**
2. Repite la configuración de reintentos:
   - Max Retries: 3
   - Wait: 1000ms

### Paso 3: Crear Error Handler

Agrega un nodo **"Catch"** (Error Catcher) al final del workflow:

```
Nodo Type: "Catch Error"
Triggered when: Any node fails
Error Output:
  - error.message
  - error.description
  - node.name (nodo que falló)
```

### Paso 4: Crear Hoja de Logs en Google Sheets

1. Abre tu Google Sheet con ID `{{$secrets.GOOGLE_SHEETS_DOCUMENT_ID}}`
2. Crea una nueva sheet llamada **"Error Logs"**
3. Encabezados:
   - Timestamp
   - Node Failed
   - Error Message
   - Query
   - Retry Count
   - Status

### Paso 5: Conectar Error Handler a Google Sheets

Después del nodo "Catch", agrega:

```
Nodo Type: "Google Sheets - Append Row"
Document ID: {{$secrets.GOOGLE_SHEETS_DOCUMENT_ID}}
Sheet Name: "Error Logs"
Columns to append:
  - Timestamp: {{$now.toISO()}}
  - Node Failed: {{$json.node.name}}
  - Error Message: {{$json.error.message}}
  - Query: {{$node['Webhook Trigger'].json.query}}
  - Retry Count: 3
  - Status: "Failed After Retries"
```

### Paso 6: Notificación Slack de Errores

Ahora que tienes el error capturado, notifica al equipo:

```
Nodo Type: "HTTP Request"
Method: POST
URL: {{$env.SLACK_ERROR_WEBHOOK_URL}}
Body:
{
  "text": "🚨 Market Research Workflow Error",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Error in Market Research Workflow*\n*Node:* {{$json.node.name}}\n*Message:* {{$json.error.message}}\n*Query:* {{$node['Webhook Trigger'].json.query}}"
      }
    }
  ]
}
```

---

## FLUJO COMPLETO CON SEGURIDAD Y ROBUSTEZ

```
┌─────────────────────┐
│  1. Webhook Trigger │
│  (POST /webhook)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  2. Validar Header  │
│  x-api-key Check    │
└──────────┬──────────┘
           │ ✓ Válido
           ▼
┌──────────────────────────┐
│  3. Google Search API    │
│  (Retry: 3x, 1000ms)     │
└──────────┬───────────────┘
           │
     ┌─────┴──────┐
     │ ✓ Success  │ ✗ Fail (después de 3 reintentos)
     ▼            ▼
┌────────────┐  ┌──────────────┐
│ 4. Process │  │ Error Catcher│
│  Results   │  │ (Catch Error)│
└─────┬──────┘  └──────┬───────┘
      │                │
      ▼                ▼
┌──────────────────────┐
│ 5a. Google Sheets    │  5b. Error Log Sheet
│ 5b. JSON File        │  5c. Slack Alert
│ 5c. Slack Alert      │
└──────────────────────┘
```

---

## MONITOREO Y DEBUGGING

### Ver Logs de Ejecución

1. En n8n, abre tu workflow
2. Click en **"Executions"**
3. Filtra por:
   - Status: "Failed"
   - Date Range: Hoy
4. Inspecciona el JSON de cada ejecución fallida

### Revisar Error Logs en Google Sheets

1. Abre tu Google Sheet
2. Ve a la hoja "Error Logs"
3. Ordena por Timestamp descendente (más recientes primero)
4. Identifica patrones de error

### Métricas Recomendadas

- Tasa de éxito: Ejecuciones exitosas / Total ejecuciones
- Tiempo promedio: Suma de tiempos / Total ejecuciones
- Errores por nodo: Contar fallos por cada nodo

---

## CHECKLIST DE IMPLEMENTACIÓN

- [ ] Webhook con autenticación Header (x-api-key)
- [ ] Variable de entorno N8N_API_KEY configurada
- [ ] Nodo "If" para validación de API key
- [ ] Respuesta 403 para requests no autorizados
- [ ] Reintentos configurados en Google Search API (3x, 1000ms)
- [ ] Reintentos configurados en Google Sheets (3x, 1000ms)
- [ ] Nodo "Catch Error" para capturar fallos
- [ ] Hoja "Error Logs" en Google Sheets
- [ ] Error Handler conectado a Google Sheets
- [ ] Notificaciones Slack en caso de error
- [ ] Prueba con API key inválida (debe retornar 403)
- [ ] Prueba con desconexión de internet (debe reintentar)

---

## VARIABLES DE ENTORNO FINALES

```env
# Security
N8N_API_KEY=sk-your-secure-key-here

# Google APIs
GOOGLE_SEARCH_API_KEY=AIzaSyD...xxxxx
GOOGLE_SEARCH_ENGINE_ID=123456789:xxxxxxx
GOOGLE_SHEETS_DOCUMENT_ID=1BxiMVs...

# Webhooks
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
SLACK_ERROR_WEBHOOK_URL=https://hooks.slack.com/services/...

# n8n Settings
N8N_HOST=your-n8n-instance.com
N8N_WEBHOOK_TUNNEL_URL=https://your-n8n-instance.com
```

---

## SOPORTE Y TROUBLESHOOTING

### "Header x-api-key no se envía"
- Verifica que tu frontend incluya el header en el request
- Revisa la consola del navegador (Network tab)
- Confirma que el valor coincida con N8N_API_KEY

### "Google API falla después de 3 reintentos"
- Verifica el status de Google APIs (status.cloud.google.com)
- Chequea la cuota API (Google Cloud Console)
- Aumenta Wait Between Retries a 2000ms si es necesario

### "Error Logs sheet crece demasiado"
- Implementa archivado mensual (copiar filas viejas a hoja de "Archive")
- Configura Google Sheets para auto-delete después de 90 días
- O usa BigQuery para análisis histórico

---

**Última actualización:** 2025-12-17  
**Versión:** 1.0  
**Autor:** SAM v3.0 - AI-Teacher
