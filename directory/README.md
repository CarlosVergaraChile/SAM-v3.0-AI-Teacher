# Directorio CRM: Sistema de Gestión de Contactos y Relaciones

## Objetivo del Negocio

Desarrollar un sistema integral de CRM (Customer Relationship Management) que centraliza la gestión de contactos, empresas, y relaciones comerciales. Automatiza el seguimiento de clientes, gestiona pipelines de ventas y proporciona analytics para decisiones comerciales.

**Clientes Potenciales:** PyMEs chilenas, consultoras, agencias de ventas

## Stack Tecnológico Sugerido

- **Backend:** Python FastAPI / Django REST
- **Frontend:** React + TypeScript + TailwindCSS
- **Base de Datos:** PostgreSQL con jsonb para datos flexibles
- **Cache:** Redis para sesiones y caché de consultas
- **ORM:** SQLAlchemy para Python
- **API:** RESTful con OpenAPI/Swagger
- **Auth:** JWT + OAuth2
- **Storage:** AWS S3 para documentos
- **Hosting:** AWS RDS (BD), EC2 (Backend), Vercel (Frontend)

## Próximos Pasos Inmediatos

1. Completar implementación de CRUD operations (en progreso)
2. Crear endpoints REST API para entidades principales
3. Implementar autenticación y autorización
4. Diseñar dashboard de análisis y reportes
5. Realizar pruebas de rendimiento e integración
6. Documentar API con Swagger/OpenAPI

## Estructura de Datos

Ver `schema.sql` para estructura completa de BD. Principales entidades:

- **Contactos:** Personas y sus datos de contacto
- **Empresas:** Organizaciones y información comercial
- **Interacciones:** Llamadas, emails, reuniones, notas
- **Oportunidades:** Pipelines de ventas y seguimiento
- **Tareas:** Recordatorios y asignaciones

## Características Principales

- ✅ CRUD completo para contactos y empresas
- ✅ Base de datos relacional normalizada
- ⏳ Dashboard de ventas en tiempo real
- ⏳ Reportes automáticos y exportación a Excel/PDF
- ⏳ Integración con email y calendario
- ⏳ Notificaciones y recordatorios automáticos
- ⏳ API para terceros y extensiones
