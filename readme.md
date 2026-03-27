## 🚀 App desplegada en Fly.io

URL: https://fullstackopen-node-js-y-express.fly.dev/

Esta aplicacion ya esta en produccion y disponible publicamente en la URL anterior.

### sobre la plataforma (Fly.io)

- Fly.io despliega aplicaciones en contenedores y las ejecuta en maquinas ligeras.
- La app puede entrar en modo inactivo cuando no hay trafico (`auto_stop_machines = true`) para ahorrar recursos.
- En el primer request despues de inactividad puede haber una pequena demora de arranque.
- El despliegue se hace con `fly deploy` y los logs se revisan con `fly logs`.
- Si usas estado en memoria, conviene mantener una sola maquina con `fly scale count 1` para evitar inconsistencias.

### iniciar app con nodemon
node_modules/.bin/nodemon index.js 

### iniciar app con npm
npm start

### iniciar app con npm en modo desarrollo
npm run dev

### ejecutar script de Mongo con contraseña
node mongo.js contraseña

### generar archivos de requests
npm run gen:requests

## levantar el repo con MongoDB (paso a paso)

Esta app ahora puede conectarse a MongoDB desde `index.js` de dos formas:

- Principal (actual): pasando la clave como argumento (`process.argv[2]`).
- Opcional: usando la variable de entorno `MONGODB_URI`.

### 1) instalar dependencias

```bash
npm install
```

### 2) configurar la cadena de conexion

Formato esperado:

```text
mongodb+srv://USUARIO:CLAVE@cluster0.crexpey.mongodb.net/noteApp?appName=Cluster0
```

Opcion principal (sin variables de entorno):

```bash
npm run dev -- TU_CLAVE
```

Opcion opcional en Git Bash:

```bash
export MONGODB_URI="mongodb+srv://USUARIO:CLAVE@cluster0.crexpey.mongodb.net/noteApp?appName=Cluster0"
npm run dev
```

Opcion opcional en PowerShell:

```powershell
$env:MONGODB_URI="mongodb+srv://USUARIO:CLAVE@cluster0.crexpey.mongodb.net/noteApp?appName=Cluster0"
npm run dev
```

### 3) verificar que conecto bien

En consola debe aparecer:

```text
Connected to MongoDB
Server running on port 3001
```

Luego prueba:

```bash
curl http://localhost:3001/api/notes
```

### 4) nota importante

- `mongo.js` se mantiene como archivo de referencia y pruebas manuales.
- No se ejecuta automaticamente: solo corre si lanzas `node mongo.js ...`.
- Nunca subas tu clave real a GitHub.

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

Si se cuelga:find({}).then(result =>

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

