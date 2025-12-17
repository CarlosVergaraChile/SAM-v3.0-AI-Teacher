# OSINT Tools & Integration for SAM-v3.0

## Objetivos

Integrar herramientas Open Source Intelligence (OSINT) en SAM-v3.0 para:
- Búsqueda y validación automática de contactos (directores, expertos educativos)
- Scraping ético de información pública (perfiles académicos, publicaciones)
- Resumen automático de documentos y referencias

## Herramientas Candidatas

### Herramientas Base (v0)
- **PhantomBuster**: API para scraping ético (LinkedIn, email finder)
- **Perplexity API**: Búsqueda + análisis de información pública
- **Google Custom Search API**: Búsqueda enfocada en dominios educativos
- **BeautifulSoup + Selenium**: Web scraping ligero para documentos públicos

### Herramientas Futuro (v1+)
- EmailHunter: Validación de emails corporativos
- Hunter.io: Búsqueda de contactos profesionales
- Clearbit: Datos de empresas e individuos

## Casos de Uso Iniciales

### Caso de Uso 1: Director Search
**Objetivo**: Buscar automáticamente información de directores por nombre/institución
**Input**: Nombre, institución
**Output**: Perfil resumido (email, teléfono, LinkedIn, especialidad)
**Status**: Diseño inicial

### Caso de Uso 2: Document Summary
**Objetivo**: Extraer resumen automático de papers/sílabos educativos
**Input**: URL o PDF
**Output**: Resumen en 500 palabras + conceptos clave
**Status**: Research phase

### Caso de Uso 3: Expertise Validation
**Objetivo**: Validar experiencia de expertos contra información pública
**Input**: Nombre, campo de especialidad
**Output**: Score de confiabilidad (0-100)
**Status**: Backlog

## Roadmap

- **Semana 1 (v0.1)**: Setup base + API keys, caso #1 prototipo
- **Semana 2 (v0.2)**: Integración con Directorio CRM, caso #2 refinado
- **Semana 3 (v0.3)**: Testing + documentación, preparación para v1

## Referencias

- [PhantomBuster Docs](https://phantombuster.com/api)
- [Perplexity API](https://docs.perplexity.ai/)
- [BeautifulSoup Guide](https://www.crummy.com/software/BeautifulSoup/)
