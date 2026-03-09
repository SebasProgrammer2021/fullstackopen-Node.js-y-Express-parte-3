### iniciar app con nodemon
node_modules/.bin/nodemon index.js 

### iniciar app con npm
npm start

### iniciar app con npm en modo desarrollo
npm run dev

### generar archivos de requests
npm run gen:requests

### despliegue en fly.io (resumen)

- Fly.io puede pedir tarjeta de credito incluso en plan gratuito. Hay casos donde no la pide.
- Alternativa: Render actualmente puede usarse sin tarjeta.
- En Fly.io, por defecto tienes 2 maquinas gratuitas (puedes correr 2 apps al mismo tiempo).

#### 1) instalar y autenticar

Instala `flyctl` siguiendo la guia oficial y crea una cuenta.

Autenticacion por CLI:

```bash
fly auth login
```

Si `fly` no funciona, prueba `flyctl`.

#### 2) inicializar la app

En la raiz del proyecto:

```bash
fly launch
```

Durante el asistente:

- Elige nombre de app (o auto-generado).
- Elige region.
- No crees PostgreSQL.
- No crees Upstash Redis.
- A la pregunta de desplegar ahora, responde `no`.

#### 3) revisar `fly.toml`

Verifica que tenga algo equivalente a esto:

```toml
[build]

[env]
	PORT = "3000"

[http_service]
	internal_port = 3000
	force_https = true
	auto_stop_machines = true
	auto_start_machines = true
	min_machines_running = 0
	processes = ["app"]
```

`PORT` en `[env]` debe coincidir con `internal_port`.

#### 4) desplegar y abrir

```bash
fly deploy
fly apps open
```

Logs recomendados:

```bash
fly logs
```

#### 5) evitar inconsistencias por multiples maquinas

Fly puede crear 2 maquinas para una misma app. Si tu estado vive en memoria, esto puede generar respuestas inconsistentes entre requests.

Revisa cantidad:

```bash
fly scale show
```

Si hay mas de 1, fuerza una sola:

```bash
fly scale count 1
```

#### 6) diagnostico de conexion (WSL/Windows)

Si se cuelga:

```bash
flyctl ping -o personal
```

y no responde, hay un problema de conectividad local con Fly.io.

Si ves respuestas continuas tipo `bytes from ... time=...ms`, la conexion esta bien.

#### 7) actualizaciones

Cada cambio nuevo a produccion:

```bash
fly deploy
```

