# 🍔 Food Store

Trabajo Práctico Integrador — **Programación 4** · Tecnicatura Universitaria en Programación (UTN)

Aplicación web de pedidos de comida: catálogo con búsqueda, filtros y paginación, carrito persistente, checkout, seguimiento de pedidos para el cliente y panel de administración (resumen, pedidos, productos, categorías y usuarios).

- **Repositorio:** https://github.com/Santir9515/food-store 
- **Video de demostración:*https://youtu.be/wcu-izXXpnQ* 

---

## Stack

| Capa | Tecnologías |
|---|---|
| Backend | Python 3.11+ · FastAPI · SQLModel · PostgreSQL · pydantic-settings · JWT (python-jose) en cookie HttpOnly · passlib + bcrypt |
| Frontend | React 19 · TypeScript (strict) · Vite · Tailwind CSS 4 · TanStack Query / Form / Table · Zustand · React Router 7 · Axios |

## Requisitos

- **Python** 3.11 o superior (probado también en 3.10 y 3.13)
- **PostgreSQL** 14 o superior
- **Node.js** 20 o superior y **pnpm** (`npm install -g pnpm`)

---

## 1. Backend

```bash
# 1) Crear la base de datos (una sola vez)
psql -U postgres -c "CREATE DATABASE foodstore_db;"

# 2) Entorno virtual e instalación
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 3) Variables de entorno
cp .env.example .env              # editar DATABASE_URL (usuario y clave de PostgreSQL) y SECRET_KEY

# 4) Cargar datos iniciales (admin, categorías y productos)
python -m app.db.seed

# 5) Ejecutar la API
uvicorn app.main:app --reload
```

- API: http://localhost:8000/api/v1 · Documentación interactiva: http://localhost:8000/docs
- Las tablas se crean automáticamente al iniciar la aplicación.
- El seed es idempotente: se puede ejecutar más de una vez sin duplicar datos.

### Variables de entorno (`backend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL | `postgresql://usuario:clave@localhost:5432/foodstore_db` |
| `SECRET_KEY` | Clave para firmar el JWT (mínimo 32 caracteres) | `python -c "import secrets; print(secrets.token_hex(32))"` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración del token (minutos) | `30` |
| `FRONTEND_ORIGIN` | Origen permitido por CORS | `http://localhost:5173` |
| `COOKIE_SECURE` | `true` solo si se sirve por HTTPS | `false` |

### Usuario administrador (seed)

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `Admin1234!` | admin |

El seed también carga 4 categorías (Hamburguesas, Pizzas, Bebidas, Postres) y 9 productos con stock. Los clientes se crean desde la pantalla **Registrarme**.

---

## 2. Frontend

```bash
cd frontend
pnpm install
cp .env.example .env              # VITE_API_URL=http://localhost:8000/api/v1
pnpm build                        # verifica TypeScript y genera el bundle de producción
pnpm dev                          # http://localhost:5173
```

### Variables de entorno (`frontend/.env`)

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:8000/api/v1` |

---

## Diseño

- Paleta del manual de marca del Club Atlético Belgrano: celeste `#3a9cd0`, negro `#1d1d1b` y blanco `#ffffff`.
- **Modo claro y oscuro:** botón en la barra superior; la elección se guarda en el navegador (`themeStore`) y, sin preferencia guardada, se usa la del sistema.

## Arquitectura

### Backend — capas por módulo

```
Router  →  Service  →  UnitOfWork  →  Repository  →  Model
```

- **Router:** valida entrada/salida y traduce excepciones de dominio a códigos HTTP. Recibe el servicio por `Depends`; nunca abre el UoW.
- **Service:** reglas de negocio. Abre `with self.uow as uow:` y devuelve esquemas `Read` dentro del bloque.
- **UnitOfWork:** única capa que hace `commit`/`rollback`/`close` (en `__exit__`).
- **Repository:** acceso a datos (`BaseRepository[T]` genérico + repositorios por módulo).

```
backend/app/
├── core/       # config, database, security (JWT/bcrypt), BaseRepository, UnitOfWork, deps (auth/roles)
├── db/         # seed.py
├── modules/    # auth · usuarios · categorias · productos · pedidos  (router/service/uow/repository/models/schemas)
└── main.py
```

### Frontend — por features

```
frontend/src/
├── features/   # auth · categorias · productos · usuarios · pedidos  (api / hooks / components / pages / types)
├── shared/     # ui · components · layout · hooks · api (axios, handleApiError, queryClient)
├── store/      # authStore (sesión) · cartStore (carrito persistente) · themeStore (modo claro/oscuro)
└── routes/     # AppRouter + ProtectedRoute (por sesión y por rol)
```

- **Sesión:** el JWT viaja en una cookie `access_token` **HttpOnly** (30 min); JavaScript nunca lo lee. `authStore` persiste únicamente el usuario y verifica la sesión con `GET /auth/me` al arrancar.
- **Interceptor de Axios:** ante un `401` (fuera de `/auth/token` y `/auth/me`) o `400 "Cuenta de usuario desactivada"` limpia la sesión y `ProtectedRoute` redirige a `/login`.
- **Rutas:** públicas (`/`, `/carrito`, `/login`, `/register`), con sesión (`/checkout`), solo cliente (`/mis-pedidos`) y solo admin (`/admin/resumen|pedidos|productos|categorias|usuarios`). Sin permiso → `/unauthorized`.

## Reglas de negocio de pedidos

1. El pedido se crea de forma **atómica**: valida producto activo, disponible y con stock suficiente, sin productos repetidos; descuenta stock y guarda nombre/precio vigentes.
2. El total es la suma de subtotales; líneas y total son **inmutables**.
3. Estados: `PENDIENTE → EN_PREPARACION → ENTREGADO`; se puede pasar a `CANCELADO` desde `PENDIENTE` o `EN_PREPARACION`. `ENTREGADO` y `CANCELADO` son terminales.
4. **Cancelar restituye el stock** en la misma transacción.
5. El cliente solo ve y cancela **sus** pedidos y solo en `PENDIENTE`; el admin ve todos y gestiona cualquier pedido no terminal.
6. Forma de pago: `EFECTIVO` o `TRANSFERENCIA`; dirección de entrega de 5 a 200 caracteres.

## Endpoints principales (`/api/v1`)

| Método | Ruta | Acceso |
|---|---|---|
| POST | `/auth/register` · `/auth/token` · `/auth/logout` | público |
| GET | `/auth/me` | sesión |
| GET | `/categorias` · `/productos` · `/productos/{id}` | público |
| POST/PUT/DELETE | `/categorias` · `/productos` · PATCH `/productos/{id}/stock` | admin |
| POST/GET | `/pedidos` · GET `/pedidos/{id}` · PATCH `/pedidos/{id}/cancelar` | sesión (dueño o admin) |
| GET | `/pedidos/resumen` · PATCH `/pedidos/{id}/estado` | admin |
| GET/POST | `/admin/usuarios` · `/admin/usuarios/{id}/activar` · `/desactivar` | admin |

Documentación completa y probable en http://localhost:8000/docs.

## Ejecución rápida (resumen)

```bash
# Terminal 1
cd backend && source venv/bin/activate && uvicorn app.main:app --reload
# Terminal 2
cd frontend && pnpm dev
```

Abrir http://localhost:5173 e ingresar como `admin` / `Admin1234!`, o registrar un cliente nuevo.
