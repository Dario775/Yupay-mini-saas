# MiniSaaS - Plataforma de Gestión para PYMES

![MiniSaaS](https://img.shields.io/badge/MiniSaaS-v1.0.0-blue) 
![React](https://img.shields.io/badge/React-19-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6)
![Vite](https://img.shields.io/badge/Vite-7-646cff)

Plataforma SaaS completa para la gestión de negocios PYMES. Administra tiendas, productos, órdenes y suscripciones desde un solo lugar.

## ⚠️ Filosofía de Diseño: Mercado Unificado

Es crucial entender que **YUPAY NO es un constructor de sitios web individuales** (como Shopify o Wix).

**YUPAY es un Marketplace Hiper-local:**
- Todas las tiendas y usuarios conviven en una única plataforma.
- **Geolocalización:** Los usuarios ven productos de las tiendas cercanas a su ubicación.
- **Perfil de Negocio:** Cada tienda tiene un perfil dentro del marketplace, no un sitio web aislado.
- **Comunidad:** El objetivo es conectar vecinos con comercios locales en un ecosistema compartido.

Cualquier cambio en el copy, diseño o funcionalidad debe reflejar esta naturaleza de "Comunidad/Marketplace" y no de "Tu propia página web aislada".

## 🚀 Características

- **🔐 Multi-rol**: Soporte para Administradores, Clientes y Dueños de Tienda
- **📊 Dashboard Analítico**: Gráficos interactivos con métricas de negocio
- **🌙 Modo Oscuro**: Tema claro/oscuro con persistencia
- **📱 Responsive**: Diseño adaptativo para todos los dispositivos
- **💾 Persistencia de Sesión**: Mantén tu sesión entre recargas
- **📤 Exportación de Datos**: Descarga reportes en CSV

## 🛠️ Tecnologías

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Estilos**: Tailwind CSS + shadcn/ui
- **Gráficos**: Recharts
- **Validación**: React Hook Form + Zod
- **Notificaciones**: Sonner

## 📦 Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd app

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev
```

## 🎮 Demo

La aplicación incluye cuentas de demo para probar cada rol:

| Rol | Email | Contraseña |
|-----|-------|------------|
| **Administrador** | admin@minisaas.com | cualquiera |
| **Cliente** | cliente@demo.com | cualquiera |
| **Dueño de Tienda** | tienda@demo.com | cualquiera |

## 📁 Estructura del Proyecto

```
src/
├── components/        # Componentes reutilizables
│   ├── ui/           # Componentes shadcn/ui
│   ├── ThemeToggle.tsx
│   └── ErrorBoundary.tsx
├── hooks/            # Custom hooks
│   ├── useAuth.tsx   # Autenticación con persistencia
│   ├── useData.ts    # Datos de la aplicación
│   └── useLocalStorage.ts
├── sections/         # Vistas principales
│   ├── AdminDashboard.tsx
│   ├── ClientDashboard.tsx
│   ├── StoreDashboard.tsx
│   └── Login.tsx
├── types/            # Tipos TypeScript
├── utils/            # Utilidades (exportación, etc.)
└── App.tsx           # Componente principal
```

## 🎨 Personalización

### Colores del Tema

Los colores se definen en `src/index.css` usando CSS variables:

```css
:root {
  --primary: 240 5.9% 10%;
  --secondary: 240 4.8% 95.9%;
  /* ... */
}
```

### Agregar Nuevos Componentes

```bash
# Usando shadcn/ui CLI
npx shadcn@latest add [component-name]
```

## 🧪 Scripts Disponibles

```bash
npm run dev       # Servidor de desarrollo
npm run build     # Build de producción
npm run preview   # Preview del build
npm run lint      # Linting con ESLint
```

## 📄 Licencia

MIT © Neurocortex
