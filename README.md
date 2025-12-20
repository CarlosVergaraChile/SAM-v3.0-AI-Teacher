# 🎓 SAM v3.0 - Plataforma de IA para Educación

## 📋 Descripción

SAM (Sistema Asistente de Maestros) v3.0 es una plataforma web impulsada por IA que empodera a los docentes con:

✅ **Generador de Materiales Educativos** - Pruebas, planificaciones, juegos, guías adaptadas a tu curso  
✅ **Evaluador Automático de Pruebas Manuscritas** - Captura foto → IA evalúa → Nota + Feedback en tono profesor  
✅ **Monetización Integrada** - Sistema de créditos con Mercado Pago (CLP)  
✅ **Características Especiales** - TEA, TDAH, cursos desmotivados, alto rendimiento, etc.  

---

## 🚀 Características Principales

### 1. Generador de Materiales
- Selecciona: Nivel, Asignatura, Tipo de Producto
- Ingresa: Características del curso (TEA, TDAH, desmotivación, etc.)
- IA genera: Material personalizado en segundos
- Formatos: Pruebas, Planificaciones, Juegos, Guías, Rúbricas

### 2. Evaluador de Pruebas Manuscritas
- Abre cámara o carga foto
- Define rúbrica de evaluación
- IA extrae texto (OCR) + evalúa
- Resultado: Nota + Feedback listo para compartir

### 3. Panel de Administración
- Historial de generaciones
- Control de créditos/cuota mensual
- Informacién del plan actual
- Estadísticas de uso

---

## 💰 Planes y Monetización

| Plan | Precio | Generaciones/mes | Características |
|------|--------|-----------------|------------------|
| **Gratuito** | $0 | 5 | Interfaz básica |
| **Pro Mensual** | $4.900 CLP | 100 | PDF, Sin anuncios |
| **Pro Anual** | $49.000 CLP | 100/mes | Ahorro 17% |
| **Empresa** | $14.900+ | Ilimitadas | Múltiples usuarios |

**Pasarela de Pago**: Mercado Pago  
**Opciones**: Tarjeta, Transferencia, Pago en efectivo (5.000+ puntos)  

---

## 🛠️ Stack Tecnológico

- **Frontend**: HTML5 + CSS3 + JavaScript Vanilla
- **IA**: Google Gemini 2.0 (Generación + Vision)
- **OCR**: Google Vision API
- **Pagos**: Mercado Pago API
- **Hosting**: Vercel (Frontend) + Firebase/Node.js (Backend)
- **BD**: Firestore o PostgreSQL

---

## 🔧 Instalación Local

1. **Clona el repositorio**
```bash
git clone https://github.com/CarlosVergaraChile/SAM-v3.0-AI-Teacher.git
cd SAM-v3.0-AI-Teacher
```

2. **Copia `.env.example` a `.env`**
```bash
cp .env.example .env
```

3. **Obtén tus claves API**
- Google Gemini: https://aistudio.google.com/
- Google Vision: https://console.cloud.google.com/
- Mercado Pago: https://www.mercadopago.cl/

4. **Llena `.env` con tus claves**
```
GEMINI_API_KEY=tu_clave_aqui
VISION_API_KEY=tu_clave_aqui
MERCADO_PAGO_TOKEN=tu_token_aqui
```

5. **Abre `index.html` en tu navegador**
```bash
open index.html
# o
open file:///ruta/a/index.html
```

---

## 📖 Cómo Usar

### Generador de Materiales
1. Abre la app → Tab "Generador"
2. Selecciona Nivel, Asignatura, Tipo de Producto
3. Marca características especiales si aplica
4. Haz clic en "GENERAR CON IA"
5. Espera 10-30 segundos
6. Descarga o copia el material

### Evaluador de Pruebas
1. Ve a Tab "Evaluador"
2. Abre cámara o sube foto
3. Define rúbrica (ej: "Ortografía: 20%, Claridad: 30%")
4. Haz clic en "EVALUAR PRUEBA"
5. Obten nota + feedback
6. Copia y comparte con estudiante/apoderado

---

## 🌐 Despliegue a Producción

### Opción 1: Netlify (Recomendado)
1. Sube el repo a GitHub
2. Conecta Netlify: https://app.netlify.com/
3. Env vars en Netlify: Agrega `.env` variables
4. Deploy automático en cada push

### Opción 2: Vercel
1. Conecta tu repo en https://vercel.com/
2. Configura env vars
3. Vercel despliega automáticamente

### Opción 3: Hosting Manual (Hostinger)
1. Comprime los archivos (HTML + JS + CSS)
2. Sube a tu FTP en Hostinger
3. Configura las env vars en el servidor

---

## 📁 Estructura de Archivos

```
SAM-v3.0-AI-Teacher/
├── index.html          # Interfaz completa (3 tabs)
├── app.js              # Lógica de la aplicación
├── config.js           # Configuración y claves API
├── .env.example        # Template de variables
├── README.md           # Este archivo
└── .gitignore          # Archivos ignorados
```

---

## 🔒 Seguridad

⚠️ **NUNCA** compartas tus claves API en público  
- Usa `.env.local` para desarrollo
- Env vars en plataforma de hosting para producción
- `.gitignore` excluye `.env` automáticamente

---

## 📊 Roadmap Futuro

- [ ] App móvil (React Native)
- [ ] Integración con Google Classroom
- [ ] Más modelos de IA (GPT-4, Claude)
- [ ] Sistema de reportes PDF
- [ ] Calificación en tiempo real
- [ ] Panel de administrador para instituciones

---

## 📞 Soporte

- 📧 Email: carlosvergarachile@uchile.cl
- 🐛 Reporta bugs: Issues en GitHub
- 💡 Sugerencias: Discussions en GitHub

---

**©2025 SAM - Empoderando Docentes con IA**


## 💳 Integración con Payment Gateway Standard

Esta aplicación utiliza el estándar de pasarela de pagos unificado para todos los proyectos de CarlosVergaraChile.

### Documentación

Ver [payment-gateway-standard](https://github.com/CarlosVergaraChile/payment-gateway-standard) para información detallada sobre:
- Configuración de proveedores de pago
- Análisis de costos
- Integración en otros proyectos

### Proveedores Soportados

- **Flow**: Principal para transacciones en CLP (recomendado para Chile)
- **Global66**: Pagos internacionales y múltiples monedas
- **PayPal**: Opción alternativa para alcance global
- **Mercado Pago**: Cobertura regional en América Latina


## 📅 Integración Temporal - Seasonal & Market Analysis

SAM v3.0 debe considerar contexto temporal para personalización avanzada.

Ver [seasonal-market-standard](https://github.com/CarlosVergaraChile/seasonal-market-standard) para:

- **Calendario Escolar Chile**: Inicio/mitad/final de semestre
- **Demanda Docente por Período**: Qué necesitan en marzo vs. octubre
- **Productos Sugeridos**: Evaluaciones iniciales, refuerzo, evaluaciones finales
- **Pricing Dinámico**: Precios según temporada de inscripción

## 🔄 Código RED: Reutilizable, Escalable, Documentado

**Reutilizable**: Generador parametrizado + Evaluador agnóstico + Integraciones varias

**Escalable**: Arquitectura modular, hosting flexible, soporte para 100s usuarios

**Documentado**: README completo, .env.example, stack technology, roadmap

---

## 🌐 SAM v3.0 en el Ecosistema Integrado de CarlosVergaraChile

SAM v3.0 actúa como la **plataforma educativa central** dentro de un ecosistema más amplio de proyectos integrados.

### Flujos de Integracion principales:

**1. Contenidos Educativos:**
- Usa plantillas de [course-module-standard](https://github.com/CarlosVergaraChile/course-module-standard)
- Estructura modular de 8-12 horas por módulo
- Rúbricas estandarizadas para evaluaciones

**2. Monetizacion:**
- Integrado con [payment-gateway-standard](https://github.com/CarlosVergaraChile/payment-gateway-standard)
- Soporta: Flow, PayPal, Mercado Pago, Global66
- Sistema de créditos y planes por suscripción

**3. Analisis Temporal:**
- Usa [seasonal-market-standard](https://github.com/CarlosVergaraChile/seasonal-market-standard)
- Detecta demanda docente por período escolar
- Pricing dinámico según temporada

**4. Marketing Digital:**
- Distribuido via [marketing-digital-standard](https://github.com/CarlosVergaraChile/marketing-digital-standard)
- SEO optimizado
- Canales de distribución integrados

**5. Orquestacion Inteligente:**
- Coordinado por [maquina-orquestadora-gl-strategic](https://github.com/CarlosVergaraChile/maquina-orquestadora-gl-strategic)
- Control adaptativo de modelos IA
- Aprendizaje en tiempo real

### Arquitectura General:

Ver [deploy-guide/ECOSYSTEM_ARCHITECTURE.md](https://github.com/CarlosVergaraChile/deploy-guide/blob/main/ECOSYSTEM_ARCHITECTURE.md) para visión completa del ecosistema de 12 repositorios integrados.

### Ejemplos de Implementacion:

- **Proyecto-Sence-2026**: Cursos especializados usando estructura CMS
- **cosas-i-doodle-shop**: E-commerce usando payment-gateway
- **GL Strategic MVP**: Consultoría coordinada por orquestadora

**SAM v3.0** integra curso-module-standard, payment-gateway-standard y seasonal-market-standard para máxima reutilización.


---

## 🎯 GL Strategic - Team Flip Cards Implementation (Diciembre 2025)

### Descripción
Implementación de tarjetas interactivas con efecto 3D flip para visualizar el equipo de GL Strategic. La solución incluye 25 miembros profesionales organizados por categoría (Socios, Consultores, Otros) con diseño responsive y animaciones modernas.

### Características Principales

#### ✨ Tarjetas de Equipo Interactivas
- **3D Flip Cards**: Efecto de rotación 3D al pasar el cursor
- **25 Miembros**: Socios (7), Consultores (14), Otros (4)
- **Información Dual**: Frente muestra nombre/rol, reverso muestra descripción profesional
- **Color-Coding**: Colores distintivos por categoría
  - 🔴 Socios: Rojo (#ff6b6b)
  - 🔵 Consultores: Turquesa (#4ecdc4)
  - 🟡 Otros: Amarillo (#ffd166)

#### 📱 Diseño Responsive
- **Desktop** (≥1200px): 10 tarjetas por fila
- **Tablet** (992-1199px): 6-8 tarjetas por fila
- **Mobile** (576-991px): 3-4 tarjetas por fila
- **Ultra-mobile** (<576px): 2 tarjetas por fila

#### 🎨 Tecnologías Implementadas
- **CSS**: Grid layout, 3D transforms, media queries
- **JavaScript**: Generación dinámica de tarjetas, población automática de datos
- **HTML5**: Estructura semántica con contenedores por rol
- **Font Awesome**: Iconografía integrante via CDN

### Datos del Equipo

#### SOCIOS (7)
1. Gastón L'Huillier T. - Socio Principal
2. Rafael Sotil Bidart - Socio
3. Guillermo Muñoz H. - Socio
4. Carlos Vergara Del Río - Socio
5. Edith Wilson Porter - Socia Legal
6. Juan Manuel Fernández - Socio Alianza
7. Claudio Hohmann - Socio Alianza

#### CONSULTORES (14)
8. Gastón L'Huillier Ch. - Consultor Asociado
9. Maurice Filippi R. - Consultor Asociado
10. Pablo Vega Buccicardi - Consultor Asociado
11. Gilberto Céspedes G. - Consultor Senior
12. José Ignacio Martínez - Consultor Senior
13. Juan Ramón Samaniego - Consultor Senior
14. Rodrigo Villena Nieto - Consultor Senior
15. José Rojas Ubilla - Consultor Senior
16. Sergio Martínez - Consultor Senior
17. Cristián Durán Egle - Consultor Senior
18. Angelo Cerda R. - Consultor Asociado
19. María Loreto Leiva - Consultora Asociada
20. Mario Boada - Consultor Comms
21. Nicole L'Huillier C. - Consultora Asociada

#### OTROS (4)
22. Paula Castro - Consultora Asociada
23. Tomás L'Huillier - Consultor Asociado
24. Marcelo Russo - Consultor Asociado
25. Elena Pailamilla S. - Consultora

### Url del Sitio
🔗 [GL Strategic - Live Site](https://carlosvergarachile.github.io/SAM-v3.0-AI-Teacher/gl-strategic/)

### Archivos Modificados
- `gl-strategic/index.html` - Agregadas secciones de equipo, CSS y JavaScript

### Commit Relacionado
- `Add comprehensive team flip cards with 25 members and styling`
