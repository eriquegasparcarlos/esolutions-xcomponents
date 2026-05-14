# ESolutions — Ecosistema de Paquetes

Documentación de arquitectura para la refactorización de `esolutions/core` en paquetes independientes.

---

## Índice

- [Visión general](#visión-general)
- [esolutions/laravel](#esolutionslaravel)
- [esolutions/datatable](#esolutionsdatatable)
- [esolutions/peru](#esolutionsperu)
- [esolutions/apiperudev](#esolutionsapiperudev)
- [esolutions/ws](#esolutionsws)
- [config/esolutions.php](#configesolutionsphp)
- [Migración desde esolutions/core](#migración-desde-esolutionscore)

---

## Visión general

```
esolutions/laravel       → Base Laravel: helpers, cache, auth, response, logging, console
esolutions/datatable     → DataTable server-side + exportación Excel
esolutions/peru          → Utilidades específicas de Perú: validadores, número a letras
esolutions/apiperudev    → Cliente HTTP para api.apiconsulta.dev (RUC, DNI, tipo de cambio)
esolutions/ws            → Cliente HTTP para WhatsApp API
```

### Dependencias entre paquetes

```
esolutions/laravel        ← base, sin dependencias internas
esolutions/datatable      ← requiere esolutions/laravel
esolutions/apiperudev     ← requiere esolutions/laravel (ApiResponse)
esolutions/ws             ← independiente
esolutions/peru           ← independiente
```

### Namespace

Todos usan el namespace raíz `Esolutions\` en lugar del antipatrón anterior `App\ESolutions\`.

```php
// Antes
use App\ESolutions\Helpers\AuthHelper;
use App\ESolutions\Utils\ApiResponse;

// Después
use Esolutions\Laravel\Auth\AuthHelper;
use Esolutions\Laravel\Http\ApiResponse;
```

---

## esolutions/laravel

**Repo:** `github:eriquegasparcarlos/esolutions-laravel`
**Namespace:** `Esolutions\Laravel\`
**Descripción:** Utilidades base para proyectos Laravel del ecosistema ESolutions.

### Estructura

```
src/
├── Auth/
│   └── AuthHelper.php
├── Cache/
│   ├── TraitCache.php
│   ├── HelperCache.php
│   └── CacheRegistry.php
├── Console/
│   └── ProgressBarHelper.php
├── Events/
│   └── CacheTableCleared.php
├── Http/
│   ├── ApiResponse.php
│   └── helpers.php
├── Logging/
│   └── LogHelper.php
└── Support/
    ├── StringHelper.php
    ├── NumberHelper.php
    └── SystemHelper.php
```

---

### `Auth/AuthHelper`

Verifica que la contraseña enviada coincida con la del usuario autenticado vía Sanctum.

```php
use Esolutions\Laravel\Auth\AuthHelper;

if (!AuthHelper::checkPassword($request->input('password'))) {
    return ApiResponse::error('La contraseña es incorrecta', 403);
}
```

**Métodos:**

| Método | Descripción | Retorno |
|---|---|---|
| `checkPassword(string $password)` | Compara con `auth()->user()->password` usando `Hash::check` | `bool` |

---

### `Cache/TraitCache`

Trait base para clases de cache del proyecto. Provee nombre de clave y limpieza.
Al limpiar, dispara el evento `CacheTableCleared` para que los proyectos reaccionen opcionalmente.

```php
// En el proyecto — app/Cache/System/PlanCache.php
use Esolutions\Laravel\Cache\TraitCache;

class PlanCache
{
    use TraitCache;

    static function getModel(): Plan { return new Plan(); }

    static function getCache(): array
    {
        // lógica de cache...
    }
}

// Limpiar cache (dispara CacheTableCleared automáticamente)
PlanCache::clearCache();
```

**Métodos que provee el trait:**

| Método | Descripción |
|---|---|
| `getNameCache()` | Genera la clave de cache basada en el nombre de la tabla del modelo |
| `clearCache()` | Olvida la cache y dispara `CacheTableCleared` |

**Requiere implementar en la clase:**

| Método | Descripción |
|---|---|
| `getModel()` | Retorna instancia del modelo Eloquent |
| `getCache()` | Retorna los datos cacheados |

---

### `Cache/HelperCache`

Genera nombres de claves de cache consistentes.

```php
use Esolutions\Laravel\Cache\HelperCache;

$key = HelperCache::nameCache('plans'); // → "k_table_plans"
```

---

### `Cache/CacheRegistry`

Escanea automáticamente el directorio `app/Cache/` del proyecto, ejecuta `getCache()` en cada clase encontrada y devuelve todos los datos agregados. Usado por `AppController::getTables()`.

```php
use Esolutions\Laravel\Cache\CacheRegistry;

// Retorna todas las tablas cacheadas del proyecto
$tables = CacheRegistry::getTables();
// → ['plans' => [...], 'translations' => [...], 'establishments' => [...]]
```

**Convención:** Las clases deben llamarse `{Nombre}Cache` y tener el método estático `getCache()`.

---

### `Events/CacheTableCleared`

Evento disparado automáticamente por `TraitCache::clearCache()`. Los proyectos que necesiten broadcast (Reverb, Pusher, etc.) escuchan este evento en su `EventServiceProvider`.

```php
// En el proyecto — app/Listeners/BroadcastCacheUpdate.php
use Esolutions\Laravel\Events\CacheTableCleared;

class BroadcastCacheUpdate
{
    public function handle(CacheTableCleared $event): void
    {
        broadcast(new SystemTableUpdated($event->table, $event->data))->toOthers();
    }
}

// En EventServiceProvider del proyecto
protected $listen = [
    CacheTableCleared::class => [BroadcastCacheUpdate::class],
];
```

Proyectos sin Reverb simplemente no registran el listener — el evento se dispara pero nadie lo escucha.

**Propiedades:**

| Propiedad | Tipo | Descripción |
|---|---|---|
| `$table` | `string` | Nombre de la tabla (ej: `plans`, `translations`) |
| `$data` | `array` | Datos actualizados tras limpiar la cache |

---

### `Http/ApiResponse`

Respuestas JSON estandarizadas con encoding UTF-8.

```php
use Esolutions\Laravel\Http\ApiResponse;

return ApiResponse::success('Plan creado', 201, $data);
return ApiResponse::error('No encontrado', 404);
return ApiResponse::response(['custom' => 'data'], 200);
```

**Métodos:**

| Método | Parámetros | Descripción |
|---|---|---|
| `success(message, code, data)` | `string, int=200, array=null` | Respuesta de éxito |
| `error(message, code, errors)` | `string, int=500, array=null` | Respuesta de error |
| `response(data, code)` | `array, int=200` | Respuesta genérica |

---

### `Http/helpers.php`

Funciones globales que delegan a `ApiResponse`. Se cargan automáticamente vía `autoload.files`.

```php
apiSuccess('Guardado correctamente', 200, $data);
apiError('Error al procesar', 500);
```

---

### `Support/StringHelper`

```php
use Esolutions\Laravel\Support\StringHelper;

StringHelper::upper('hola mundo');          // → "HOLA MUNDO"
StringHelper::lower('HOLA MUNDO');          // → "hola mundo"
StringHelper::removeSpaces('hola  mundo');  // → "hola mundo"
StringHelper::removeNewLines("hola\nmundo"); // → "hola | mundo"
StringHelper::random(8);                    // → "A3KX92BM"
StringHelper::random(6, '0123456789');      // → "482901"
```

**Métodos:**

| Método | Descripción |
|---|---|
| `upper(string $text)` | Convierte a mayúsculas UTF-8 |
| `lower(string $text)` | Convierte a minúsculas UTF-8 |
| `removeSpaces(string $text)` | Normaliza espacios múltiples a uno |
| `removeNewLines(string $text, string $replacement)` | Reemplaza saltos de línea |
| `random(int $length, string $chars)` | Genera string aleatorio seguro |

---

### `Support/NumberHelper`

```php
use Esolutions\Laravel\Support\NumberHelper;

NumberHelper::format(1234.5678);     // → "1234.57"
NumberHelper::format(1234.5678, 4);  // → "1234.5678"
NumberHelper::format('1,234.56');    // → "1234.56"
```

**Métodos:**

| Método | Descripción |
|---|---|
| `format(float\|int\|string $value, int $decimals = 2)` | Formatea número con punto decimal, sin separador de miles |

---

### `Support/SystemHelper`

```php
use Esolutions\Laravel\Support\SystemHelper;

SystemHelper::isWindows(); // → true/false
SystemHelper::getDomain(); // → "garcia.intipos13.oo"
```

**Métodos:**

| Método | Descripción |
|---|---|
| `isWindows()` | Detecta si el servidor corre en Windows (`PHP_OS_FAMILY`) |
| `getDomain()` | Retorna el host actual desde el request |

---

### `Logging/LogHelper`

Registra excepciones en archivos de log por usuario con contexto completo (IP, headers, input, URL).

```php
use Esolutions\Laravel\Logging\LogHelper;

try {
    // ...
} catch (Throwable $e) {
    LogHelper::logUserException($e, $request);
}
```

Genera archivos en `storage/logs/user-{id}.log` con JSON por línea.

---

### `Console/ProgressBarHelper`

Barra de progreso visual para comandos Artisan.

```php
use Esolutions\Laravel\Console\ProgressBarHelper;

$bar = new ProgressBarHelper(barLength: 30);

foreach ($records as $i => $record) {
    // procesar...
    $bar->render(processed: $i + 1, total: count($records), status: 'success', message: $record->name);
}
```

**Salida en consola:**
```
Progreso: [████████████████░░░░░░░░░░░░░░] 16/30 (53.3%) - García Pérez S.A.C.
```

| Status | Color |
|---|---|
| `success` | Verde |
| `error` | Rojo |
| `warning` | Amarillo |
| `info` | Blanco |

---

## esolutions/datatable

**Repo:** `github:eriquegasparcarlos/esolutions-datatable`
**Namespace:** `Esolutions\Datatable\`
**Descripción:** Infraestructura para tablas server-side con paginación, filtros, columnas, diálogos de acción y exportación Excel.

### Estructura

```
src/
├── Dialog/
│   ├── DialogAction.php
│   └── Requests/
│       └── ActionRequest.php
├── Exports/
│   └── GenericReportExport.php
└── Table/
│   ├── Button.php
│   ├── ButtonBuilder.php
│   ├── Cell.php
│   ├── CellComponent.php
│   ├── Column.php
│   ├── ColumnBuilder.php
│   ├── Filter.php
│   └── FilterBuilder.php
└── Traits/
    ├── ExcelTrait.php
    ├── FilterTrait.php
    ├── PaginationBaseTrait.php
    ├── PaginationSystemTrait.php
    └── PaginationTenantTrait.php
```

---

### `Dialog/DialogAction`

Genera la configuración del diálogo de confirmación para acciones destructivas o de cambio de estado. El frontend renderiza el diálogo con estos datos.

```php
use Esolutions\Datatable\Dialog\DialogAction;

// En recordDestroy($id)
return DialogAction::getDeleteRecordActionData($record, 'name', 'plan');

// Con verificación de contraseña
return DialogAction::getDeleteRecordActionData($record, 'name', 'plan', verifyPassword: true);

// En recordActive($id)
return DialogAction::getActiveRecordActionData($record, 'name', 'plan');
```

**`getDeleteRecordActionData`** — retorna:
```json
{
    "title": "Eliminar plan",
    "description": "¿Está seguro que desea eliminar el plan <strong>Básico</strong>?",
    "button_label_submit": "Eliminar",
    "button_color": "red",
    "icon": "triangle-exclamation",
    "icon_color": "red",
    "verify_password": false
}
```

**`getActiveRecordActionData`** — retorna según estado actual del registro (`is_active`):
```json
{
    "title": "Desactivar el plan",
    "description": "¿Está seguro que desea desactivar el plan <strong>Básico</strong>?",
    "button_label_submit": "Desactivar",
    "button_color": "red",
    "icon": "shield-xmark",
    "verify_password": false
}
```

---

### `Dialog/Requests/ActionRequest`

FormRequest para los endpoints de confirmación de acción (`storeDelete`, `storeActive`).

```php
use Esolutions\Datatable\Dialog\Requests\ActionRequest;

public function storeDelete(ActionRequest $request)
{
    $password = $request->input('password');
    if ($password && !AuthHelper::checkPassword($password)) {
        return ApiResponse::error('La contraseña es incorrecta', 403);
    }
    // ...
}
```

**Reglas:**

| Campo | Regla |
|---|---|
| `id` | `required` |
| `password` | `nullable`, `required_if:verify_password,true` |

---

### `Table/Column`, `ColumnBuilder`

Define las columnas de la tabla.

```php
use Esolutions\Datatable\Table\Column;
use Esolutions\Datatable\Table\ColumnBuilder;

$columns = (new ColumnBuilder())
    ->addColumn(Column::make('name')->label('Nombre'))
    ->addColumn(Column::make('price')->label('Precio')->alignRight()->width('100px'))
    ->addColumn(Column::isActive())   // columna estándar de estado activo/inactivo
    ->addColumn(Column::actions())    // columna estándar de acciones
    ->getColumns();
```

---

### `Table/Filter`, `FilterBuilder`

Define los filtros del encabezado de la tabla.

```php
use Esolutions\Datatable\Table\Filter;
use Esolutions\Datatable\Table\FilterBuilder;

$filters = (new FilterBuilder())
    ->addFilter(Filter::makeInput('search')->label('Buscar por nombre')->cssClass('col-12'))
    ->addFilter(Filter::makeSelect('status')->label('Estado')->options([...]))
    ->getFilters();
```

---

### `Table/Button`, `ButtonBuilder`

Define los botones del encabezado de la tabla.

```php
use Esolutions\Datatable\Table\Button;
use Esolutions\Datatable\Table\ButtonBuilder;

$buttons = (new ButtonBuilder())
    ->addButton(Button::newButton())       // botón "Nuevo"
    ->addButton(Button::refreshButton())   // botón "Refrescar"
    ->addButtonGroup([Button::exportButton()]) // grupo con botón "Exportar"
    ->getButtons();
```

---

### `Traits/PaginationSystemTrait` y `PaginationTenantTrait`

Traits para paginación en contexto de sistema (central) o tenant. Se usan en las clases DataTable.

```php
use Esolutions\Datatable\Traits\PaginationSystemTrait;

trait PlanDataTable
{
    use PaginationSystemTrait;

    protected function getTableConfig(): array
    {
        return [
            'page_title'  => __('plans title page'),
            'table_title' => __('plans title table'),
            'table_name'  => 'plans',
        ];
    }

    // getColumns(), getFilters(), getHeaderButtons(), getRecords(), buildFilters()
}
```

---

### `Exports/GenericReportExport`

Exportador Excel genérico reutilizable. Genera un archivo `.xlsx` con título, encabezados estilizados y datos.

```php
use Esolutions\Datatable\Exports\GenericReportExport;
use Maatwebsite\Excel\Facades\Excel;

return Excel::download(
    new GenericReportExport(
        data: $rows,
        headings: ['Nombre', 'Precio', 'Estado'],
        title: 'Reporte de Planes'
    ),
    'reporte_planes.xlsx'
);
```

**Características del Excel generado:**
- Fila 1: título centrado, negrita, tamaño 18
- Fila 2: encabezados con fondo azul `#1976d2` y texto blanco
- Filas de datos: bordes, texto envuelto, columnas auto-dimensionadas

---

## esolutions/peru

**Repo:** `github:eriquegasparcarlos/esolutions-peru`
**Namespace:** `Esolutions\Peru\`
**Descripción:** Utilidades específicas para el mercado peruano: validación de documentos de identidad y conversión de números a letras para comprobantes.

### Estructura

```
src/
├── Validators/
│   ├── RucValidator.php
│   └── DniValidator.php
└── Support/
    └── NumberToLetterHelper.php
```

---

### `Validators/RucValidator`

Valida el RUC peruano usando el algoritmo del dígito verificador oficial de SUNAT.

```php
use Esolutions\Peru\Validators\RucValidator;

$result = RucValidator::validate('20100070970');
// → ['success' => true]

$result = RucValidator::validate('12345678901');
// → ['success' => false, 'message' => 'El RUC es incorrecto']
```

Validaciones que aplica:
- Longitud exacta de 11 dígitos
- Solo caracteres numéricos
- Dígito verificador correcto (módulo 11)

---

### `Validators/DniValidator`

Valida el formato del DNI peruano.

```php
use Esolutions\Peru\Validators\DniValidator;

DniValidator::validate('12345678');       // → ['success' => true]
DniValidator::validate('12345678-1234');  // → ['success' => true]  (con código de verificación)
DniValidator::validate('1234');           // → ['success' => false, 'message' => 'El DNI es incorrecto']
```

Formatos aceptados:
- `12345678` — 8 dígitos
- `12345678-1234` — 8 dígitos + guion + 4 dígitos
- `12345678 1234` — 8 dígitos + espacio + 4 dígitos

---

### `Support/NumberToLetterHelper`

Convierte valores numéricos a su representación en letras en español. Usado en comprobantes electrónicos (SUNAT requiere el monto en letras).

```php
use Esolutions\Peru\Support\NumberToLetterHelper;

NumberToLetterHelper::convertToLetter(1234.56, 'SOLES');
// → "Mil doscientos treinta y cuatro con 56/100 SOLES"

NumberToLetterHelper::convertToLetter(1234.56, 'SOLES', format: true);
// → "1.234,56 (Mil doscientos treinta y cuatro con 56/100 SOLES)"
```

**Parámetros:**

| Parámetro | Tipo | Default | Descripción |
|---|---|---|---|
| `$number` | `float\|int\|string` | — | Número a convertir. Acepta `"1,234.56"`, `"1.234,56"`, `1234.56` |
| `$currency` | `string` | `''` | Texto de moneda (`SOLES`, `DÓLARES`) |
| `$format` | `bool` | `false` | `true` incluye el número formateado al inicio |

Rango soportado: `0` a `999,999,999.99`

---

## esolutions/apiperudev

**Repo:** `github:eriquegasparcarlos/esolutions-apiperudev`
**Namespace:** `Esolutions\ApiPeruDev\`
**Descripción:** Cliente HTTP para la API de `apiconsulta.dev`. Consulta datos de RUC, DNI y tipo de cambio en tiempo real.

### Estructura

```
src/
└── Service.php
```

### Configuración requerida en `config/esolutions.php`

```php
'apiperudev' => [
    'url'   => env('APIPERUDEV_URL', 'https://my.apiconsulta.dev/api'),
    'token' => env('APIPERUDEV_TOKEN'),
],
```

### Uso

```php
use Esolutions\ApiPeruDev\Service as ApiPeruDev;

// Búsqueda por RUC
$result = ApiPeruDev::searchWithInput('ruc', '20100070970');
// → ['success' => true, 'data' => ['razon_social' => '...', 'direccion' => '...']]

// Búsqueda por DNI
$result = ApiPeruDev::searchWithInput('dni', '12345678');
// → ['success' => true, 'data' => ['nombres' => '...', 'apellidos' => '...']]

// Tipo de cambio
$result = ApiPeruDev::searchExchangeRateSaleWithInput('2026-05-13');
// → ['success' => true, 'data' => ['venta' => 3.72, 'compra' => 3.70]]
```

**Métodos:**

| Método | Descripción |
|---|---|
| `searchWithInput(string $type, string $number)` | Consulta RUC o DNI. `$type`: `'ruc'` o `'dni'` |
| `searchExchangeRateSaleWithInput(string $date)` | Tipo de cambio para una fecha `Y-m-d` |
| `searchRuc(Request $request)` | Endpoint de controlador — lee `number` del request |
| `searchDni(Request $request)` | Endpoint de controlador — lee `number` del request |

**Comportamiento de red:**
- Timeout de conexión: 5s
- Timeout de respuesta: 10s
- SSL verify: desactivado (entornos locales)
- Headers: `Authorization: Bearer {token}`, `x-app-version`, `x-app-build`

---

## esolutions/ws

**Repo:** `github:eriquegasparcarlos/esolutions-ws`
**Namespace:** `Esolutions\Ws\`
**Descripción:** Cliente HTTP para WhatsApp API. Envía mensajes de texto y documentos PDF, gestiona sesiones.

### Estructura

```
src/
└── Service.php
```

### Configuración requerida en `config/esolutions.php`

```php
'ws' => [
    'url'   => env('WS_API_URL'),
    'token' => env('WS_API_TOKEN'),
],
```

### Uso

```php
use Esolutions\Ws\Service as WhatsApp;

// Enviar PDF
WhatsApp::sendPdf(
    base64Pdf: base64_encode($pdfContent),
    number: '51987654321',
    message: 'Adjunto su comprobante',
    filename: 'factura_001.pdf'
);

// Enviar texto
WhatsApp::sendText(
    sessionId: 'session-01',
    to: '51987654321',
    text: 'Su pedido fue procesado correctamente.'
);

// Listar sesiones activas
$sessions = WhatsApp::getSessions();

// Estado de una sesión
$status = WhatsApp::getSessionStatus('session-01');
```

**Métodos:**

| Método | Timeout | Descripción |
|---|---|---|
| `sendPdf(base64, number, message, filename)` | 30s | Envía un PDF como archivo adjunto |
| `sendText(sessionId, to, text)` | 15s | Envía mensaje de texto plano |
| `getSessions()` | 15s | Lista todas las sesiones disponibles |
| `getSessionStatus(sessionId)` | 15s | Estado de una sesión específica |
| `getMessageStatus(messageId)` | 15s | Estado de entrega de un mensaje |

Todos los métodos retornan `array` con `['success' => bool, ...]`. Los errores de red se capturan internamente — nunca lanza excepciones.

---

## config/esolutions.php

Archivo de configuración unificado. Reemplaza `config/configuration.php`.

```php
// config/esolutions.php
return [
    'app' => [
        'url_base'         => env('APP_URL_BASE'),
        'subdomain_system' => env('APP_SUBDOMAIN_SYSTEM', 'administration'),
        'color_primary'    => env('APP_COLOR_PRIMARY', '#D43759'),
        'type'             => env('APP_TYPE', 'pos'),
    ],

    'tenancy' => [
        'database_prefix' => env('TENANCY_DATABASE_PREFIX'),
    ],

    'support' => [
        'email' => env('SUPPORT_EMAIL'),
        'name'  => env('SUPPORT_NAME', 'Soporte'),
    ],

    'apiperudev' => [
        'url'   => env('APIPERUDEV_URL', 'https://my.apiconsulta.dev/api'),
        'token' => env('APIPERUDEV_TOKEN'),
    ],

    'ws' => [
        'url'   => env('WS_API_URL'),
        'token' => env('WS_API_TOKEN'),
    ],

    'igv' => [
        'start'      => env('IGV_31556_START', '2022-09-01'),
        'end'        => env('IGV_31556_END', '2026-12-31'),
        'percentage' => env('IGV_31556_PERCENTAGE', 0.10),
    ],
];
```

**Uso:**
```php
// Antes
config('configuration.api_url')
config('configuration.support_email')
config('configuration.app_url_base')

// Después
config('esolutions.apiperudev.url')
config('esolutions.support.email')
config('esolutions.app.url_base')
```

---

## Migración desde esolutions/core

### 1. Actualizar `composer.json`

```json
{
    "require": {
        "esolutions/laravel":     "^1.0",
        "esolutions/datatable":   "^1.0",
        "esolutions/peru":        "^1.0",
        "esolutions/apiperudev":  "^1.0",
        "esolutions/ws":          "^1.0"
    }
}
```

Remover: `"esolutions/core": "^1.4"`

### 2. Reemplazar namespaces

| Antes | Después |
|---|---|
| `App\ESolutions\Helpers\AuthHelper` | `Esolutions\Laravel\Auth\AuthHelper` |
| `App\ESolutions\Utils\ApiResponse` | `Esolutions\Laravel\Http\ApiResponse` |
| `App\ESolutions\Utils\CacheTable` | `Esolutions\Laravel\Cache\CacheRegistry` |
| `App\ESolutions\Cache\TraitCache` | `Esolutions\Laravel\Cache\TraitCache` |
| `App\ESolutions\DataTable\Dialog\DialogAction` | `Esolutions\Datatable\Dialog\DialogAction` |
| `App\ESolutions\DataTable\Dialog\Requests\ActionRequest` | `Esolutions\Datatable\Dialog\Requests\ActionRequest` |
| `App\ESolutions\DataTable\Table\Column` | `Esolutions\Datatable\Table\Column` |
| `App\ESolutions\DataTable\Traits\PaginationSystemTrait` | `Esolutions\Datatable\Traits\PaginationSystemTrait` |
| `App\ESolutions\Exports\GenericReportExport` | `Esolutions\Datatable\Exports\GenericReportExport` |
| `App\ESolutions\ApiPeruDev\Service` | `Esolutions\ApiPeruDev\Service` |
| `App\ESolutions\WhatsAppApi\Service` | `Esolutions\Ws\Service` |

### 3. Renombrar config

```bash
# Renombrar archivo
mv config/configuration.php config/esolutions.php

# Actualizar todas las referencias
# config('configuration.x') → config('esolutions.x')
```

### 4. Agregar listener para broadcast (proyectos con Reverb)

```php
// app/Listeners/BroadcastCacheUpdate.php
use Esolutions\Laravel\Events\CacheTableCleared;

class BroadcastCacheUpdate
{
    public function handle(CacheTableCleared $event): void
    {
        try {
            broadcast(new SystemTableUpdated($event->table, $event->data))->toOthers();
        } catch (Throwable $e) {
            Log::warning("Broadcast failed [{$event->table}]: " . $e->getMessage());
        }
    }
}
```

### 5. Eliminar `TraitCache` local

Los proyectos que tenían `app/Cache/System/TraitCache.php` como override local pueden eliminarlo — la funcionalidad de broadcast ahora se maneja vía el listener.
