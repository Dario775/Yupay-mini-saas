# 🎯 Roadmap & Checkpoint - Yupay

## 📅 Estado al 04 de Febrero (04:00 AM)
El proyecto ha alcanzado una fase de **estabilidad operativa** con Supabase real. Los flujos críticos de autenticación y autorización están funcionando.

### ✅ Logros de hoy:
- **Auth Robustecida**: Manejo de carga (loading) sincronizado en `useAuth`. Fallback de 5s para evitar bloqueos.
- **Detección de Roles**: Lógica de elevación de privilegios (si tiene tienda, es dueño).
- **Hard Logout**: Limpieza total del estado al cerrar sesión para evitar fugas de memoria y errores de sesión pegada.
- **Admin Persistence**: La API de administración ya guarda planes, estados de usuario y suscripciones en Supabase.
- **Vercel Config**: Añadido `vercel.json` para manejar rutas SPA y evitar errores 404 en sub-rutas.

---

## 🛠 Tareas pendientes (Mañana):

### 1. Navegación y UI (Prioridad Alta)
- [ ] Ajustar el cierre del menú móvil al hacer clic en una opción.
- [ ] Mejorar el contraste del "ThemeToggle" en ciertos fondos.
- [ ] Añadir breadcrumbs o migas de pan en el panel de administración.

### 2. Flujo de Usuario Nuevo (Onboarding)
- [ ] Implementar el modal de "Crear tu primera tienda" para usuarios con rol `tienda` que aún no tienen una.
- [ ] Validar que el slug (link) de la tienda sea único y no tenga espacios.

### 3. Funcionalidades de Tienda
- [ ] Implementar la carga de imágenes reales a Supabase Storage (actualmente usa URLs externas).
- [ ] Refinar el Dashboard de Ventas con datos filtrados por mes/semana.

### 4. Seguridad (Pre-Lanzamiento)
- [ ] Revisión final de RLS (Row Level Security) en todas las tablas.
- [ ] Test de estrés del login con múltiples cuentas de Google.

---

## 📌 Punto de Retorno
**Commit ID**: [Se generará al ejecutar el comando]
**Rama**: `main`
**Entorno**: Producción en `yupay.com.ar`
