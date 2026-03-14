# BTG Pactual - Gestión de Fondos FPV/FIC

Aplicación web interactiva y responsiva desarrollada con **Angular 21.2** que permite gestionar fondos de inversión (FPV y FIC) de BTG Pactual. Utiliza las últimas características del framework: **Signals**, **resource()**, **linkedSignal()**, **input()/output()**, **Zoneless** y **Vitest**.

---

## Funcionalidades

- Visualizar fondos disponibles con filtrado por categoría (FPV / FIC)
- Suscribirse a fondos validando monto mínimo y saldo disponible
- Cancelar suscripciones con reembolso automático al saldo
- Historial completo de transacciones (suscripciones y cancelaciones)
- Selección de método de notificación (Email o SMS) con destino personalizado
- **Envío real de emails** vía EmailJS (gratuito, 200/mes)
- **Envío real de SMS** vía Textbelt (gratuito, 1/día)
- Persistencia de datos en localStorage (sobrevive recargas de página)
- Mensajes de error, loading states y feedback visual

---

## Tecnologías y Features de Angular 21

| Feature | Uso en el proyecto |
|---|---|
| `signal()` | Estado global en servicios y estado local en componentes |
| `computed()` | Derivaciones: `totalInvested`, `filteredFunds`, `amountError`, `destinationError` |
| `resource()` | Carga asíncrona de fondos con loading/error states automáticos |
| `linkedSignal()` | Reset automático del monto al cambiar fondo seleccionado |
| `input()` | Inputs como signals en componentes reutilizables |
| `output()` | Outputs como funciones en `ConfirmDialogComponent` |
| `effect()` | Persistencia automática del estado en localStorage |
| `provideZonelessChangeDetection()` | Sin zone.js (Angular 21 default) |
| Vitest | Test runner por defecto |
| `@for` / `@if` / `@switch` | Control flow blocks nativos |
| Lazy loading | Rutas con `loadComponent()` |
| Standalone | 100% standalone, sin NgModules |

---

## Requisitos

- **Node.js** >= 22.16.0
- **Angular CLI** 21.2.2

---

## Instalación y Ejecución

```bash
# 1. Clonar el repositorio
git clone https://github.com/Farithcarrillo/btg-fondos.git
cd btg-fondos

# 2. Instalar dependencias
npm install

# 3. Ejecutar la aplicación
ng serve
```

Abrir en el navegador: **http://localhost:4200**

---

## Configuración de Notificaciones

La aplicación envía notificaciones reales al suscribirse a un fondo. El usuario elige el método (Email o SMS) e ingresa el destino (correo o número de celular).

### Email — EmailJS (gratuito, 200 emails/mes)

EmailJS permite enviar emails directamente desde el frontend sin necesidad de backend.

> **Nota:** Sin configurar EmailJS la aplicación funciona normalmente. Los emails se "simulan" mostrando una alerta informativa con los datos que se enviarían.

---

### SMS — Textbelt (gratuito, 1 SMS por día)

Textbelt es una API pública que permite enviar SMS desde el navegador sin necesidad de backend ni registro.

**No requiere configuración.** La key gratuita `textbelt` ya viene configurada en el servicio y permite enviar **1 SMS real por día** sin crear cuenta.

**Funcionamiento:**
- El usuario ingresa su número de celular en el formulario de suscripción
- La aplicación formatea el número automáticamente al formato internacional E.164
- Se envía un SMS real al número con los detalles de la suscripción

**Formato de números soportado (Colombia):**

| El usuario escribe | Se envía como |
|---|---|
| `3001234567` | `+573001234567` |
| `573001234567` | `+573001234567` |
| `+573001234567` | `+573001234567` |

**Limitaciones del plan gratuito:**
- 1 SMS por día (por IP)
- Si se agota la cuota, la app muestra un aviso amigable indicando que la suscripción fue exitosa pero el SMS se enviará después
- Para más SMS se puede comprar una API key [https://textbelt.com/](https://textbelt.com/) ($0.05/SMS)

> **Nota:** La suscripción al fondo siempre se procesa correctamente, independientemente de si el SMS se envió o no. Las notificaciones son informativas.

---

## Tests (Vitest)

```bash
ng test
```

Incluye tests para:
- `UserStateService` — suscripciones, cancelaciones, validaciones, persistencia, computed signals
- `AlertService` — creación, descarte y limpieza de alertas
- `CopCurrencyPipe` — formateo de moneda COP

---

## Arquitectura SOLID

```
src/app/
├── core/                          # Lógica de negocio (singleton services)
│   ├── models/
│   │   ├── fund.model.ts          # Interfaces y tipos
│   │   └── index.ts
│   └── services/
│       ├── fund.service.ts        # Datos de fondos (mock)
│       ├── user-state.service.ts  # Estado global con signals + localStorage
│       ├── alert.service.ts       # Alertas globales
│       ├── notification.service.ts # EmailJS + Textbelt
│       └── index.ts
├── shared/                        # Componentes reutilizables
│   ├── components/
│   │   ├── header/                # Navegación + saldo
│   │   ├── footer/
│   │   ├── alert/                 # Alertas flotantes
│   │   ├── loading-spinner/       # Spinner con input() signal
│   │   └── confirm-dialog/        # Diálogo con input()/output()
│   └── pipes/
│       └── cop-currency.pipe.ts   # Formato COP
├── features/                      # Páginas lazy-loaded
│   ├── dashboard/                 # Resumen con computed signals
│   ├── funds/                     # resource(), linkedSignal(), computed()
│   ├── subscriptions/             # Cancelación con confirm dialog
│   └── transactions/              # Historial con sortedTransactions
├── app.component.ts               # Layout principal
├── app.config.ts                  # Zoneless + Router
└── app.routes.ts                  # Lazy loading routes
```

### Principios aplicados:

- **SRP:** Cada servicio una responsabilidad (`FundService` datos, `UserStateService` estado, `AlertService` alertas, `NotificationService` envíos)
- **OCP:** Los servicios usan datos mock pero pueden migrar a API real sin cambiar componentes
- **ISP:** Interfaces segregadas (`Fund`, `Transaction`, `FundSubscription`, `SubscriptionRequest`)
- **DIP:** Componentes dependen de servicios inyectados vía `inject()`

---

## Fondos Disponibles

| ID | Nombre | Monto Mínimo | Categoría |
|---|---|---|---|
| 1 | FPV_BTG_PACTUAL_RECAUDADORA | COP $75.000 | FPV |
| 2 | FPV_BTG_PACTUAL_ECOPETROL | COP $125.000 | FPV |
| 3 | DEUDAPRIVADA | COP $50.000 | FIC |
| 4 | FDO-ACCIONES | COP $250.000 | FIC |
| 5 | FPV_BTG_PACTUAL_DINAMICA | COP $100.000 | FPV |

**Saldo inicial del usuario:** COP $500.000

---

## Diseño UI/UX

- Paleta basada en branding BTG Pactual: `#003087` (primary), `#0066CC` (secondary), `#00A3E0` (accent)
- 100% responsivo (mobile / tablet / desktop)
- Alertas animadas con auto-dismiss
- Diálogos de confirmación para acciones destructivas
- Loading states con spinners SVG
- Persistencia en localStorage (sobrevive recargas)
- Accesibilidad: aria-labels, roles, focus-visible

---

## Consideraciones

- No se implementa lógica de backend ni autenticación
- Se asume un usuario único con saldo inicial de COP $500.000
- Los datos persisten en `localStorage` del navegador
- Para resetear los datos: DevTools → Application → Local Storage → eliminar `btg_fondos_state`