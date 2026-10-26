# TP 08 - Endpoints persistentes de reservas

Copia individual del TP 07 `tp-07-salas-mongodb`. Esta entrega integra el sitio HTML y una API JSON con la misma base MongoDB Atlas y el mismo servicio asíncrono. Se mantienen CommonJS, el modelo Mongoose y los scripts de terminal; el servicio en memoria y su semilla ya no se importan al iniciar. No se inserta ni se borra información automáticamente.

## Requisitos y versiones

- Node.js 20.6 o posterior y npm.
- Express 5, Mongoose 8, EJS y MongoDB Atlas Free (M0).
- Base de datos `reservas_salas_u8`, colección `reservas`.
- Las versiones solicitadas están en `package.json`; las versiones resueltas, en `package-lock.json`.

## Preparación

1. Ejecutar `npm install`.
2. En Atlas, crear o seleccionar un clúster Free (M0), un usuario con permisos de lectura/escritura y una regla de Network Access para la IP de trabajo.
3. Copiar la URI de conexión de Atlas y sustituir el nombre de base por `reservas_salas_u8`, manteniendo las opciones entregadas por Atlas.
4. Copiar `.env.example` a `.env` y reemplazar `USUARIO`, `CLAVE` y `HOST` con los valores de la propia cuenta. Codificar los caracteres reservados de la contraseña como corresponda en una URI.
5. Desde la raíz, iniciar con `npm start` (equivale a `node --env-file=.env src/index.js`). El servidor espera la conexión antes de abrir el puerto. Mantenerlo en ejecución mientras se usa el navegador o Postman.

`.env` no se entrega ni se versiona. `.env.example` contiene únicamente marcadores; el `HOST` ilustrativo no es una dirección conectable. No incluir secretos ni datos personales reales en código, capturas o exportaciones de Postman.

## Conexión y ciclo de vida

`src/config/base-datos.js` configura una sola vez los resolutores DNS de Node (`8.8.8.8`, `1.1.1.1`), valida la URI y conecta Mongoose. Si la red requiere otro ajuste, acordarlo y documentarlo; no se aplica DNS por solicitud. Los diagnósticos de conexión no imprimen la URI.

El arranque carga la configuración, conecta MongoDB y solo después escucha en `PORT`. Una URI ausente o una conexión fallida impide abrir el puerto. SIGINT y SIGTERM cierran primero el servidor HTTP y luego la conexión. Los programas de `scripts/` cierran la conexión al finalizar; el servidor la conserva entre peticiones.

## Estructura

- `src/config/`: configuración de entorno y conexión MongoDB.
- `src/modelos/reserva.js`: esquema, validaciones y default de estado.
- `src/servicios/reservas.js`: operaciones asíncronas MongoDB y representación del recurso.
- `src/controladores/reservas.js`: respuestas y coordinación con el servicio.
- `src/rutas/`: router HTML y router API separados.
- `src/middleware/`: validación de entrada, contexto y registro HTTP.
- `src/index.js`: conexión previa al arranque y cierre ordenado.
- `scripts/`: comprobación, alta y listado de terminal. No se ejecutan automáticamente al arrancar.

Todas las vistas y la API consultan y crean a través del mismo servicio. La semilla del TP 06 y el servicio en memoria pueden conservarse como referencia histórica, pero no se importan en el arranque persistente.

## Modelo y límites de validación

Los campos admitidos para crear son `estudiante`, `email`, `sala`, `fecha`, `turno` y `personas`. Los cinco campos de texto son obligatorios y se recortan; email requiere `@`; sala admite `Sala Norte`, `Sala Sur` o `Sala Multimedia`; turno admite `Mañana`, `Tarde` o `Noche`; personas debe ser entero entre 1 y 6. `estado` tiene default `pendiente` y enum `pendiente`/`confirmada`; el cliente no puede asignarlo en esta API. El `_id` lo genera MongoDB y se presenta como `id` textual.

El middleware comprueba tipos y valores y copia solo los seis campos admitidos. No pasa el cuerpo completo ni el query del cliente a Mongoose. El modelo también conserva validaciones. No se valida formato completo ni fecha real/futura, disponibilidad, solapamientos, duplicados o cupos compartidos; tampoco se ofrece autenticación/autorización ni migración de documentos antiguos. No se implementan PUT, PATCH o DELETE y no se recomienda publicar este servidor en Internet.

## Endpoints

| Método | URL | Resultado |
| --- | --- | --- |
| GET | `/api/reservas` | 200 y arreglo; [] cuando no hay resultados |
| GET | `/api/reservas?sala=Sala%20Norte` | 200 y coincidencias exactas |
| GET | `/api/reservas/:id` | 200 y recurso; 400 para ID mal formado; 404 si no existe |
| POST | `/api/reservas` | 201, recurso guardado y cabecera `Location` |
| GET | `/reservas` | Listado HTML persistente |
| GET | `/reservas/:id` | Detalle HTML persistente |
| POST | `/reservas` | Alta HTML válida con redirección 302; inválida con 400 y valores conservados |
| GET | `/estado` | Estado del servicio y conteo MongoDB |

La creación requiere JSON y solo usa seis campos admitidos. Campos extra como `estado` o `_id` se ignoran:

```json
{
  "estudiante": "Ana Ejemplo",
  "email": "ana@example.com",
  "sala": "Sala Norte",
  "fecha": "2026-10-21",
  "turno": "Mañana",
  "personas": 2
}
```

La respuesta 201 incluye `id`, los seis campos y `estado: "pendiente"`. `Location` apunta a `/api/reservas/{id}` y se puede consultar directamente. No se convierte el ID a número. El filtro acepta un solo parámetro textual `sala`; su criterio MongoDB se construye explícitamente, y una repetición del parámetro recibe 400. Una sala textual sin coincidencias produce 200 y `[]`.

Los cuerpos ausentes, de tipo incorrecto, valores inválidos y JSON mal formado reciben 400 JSON sin escritura. Los fallos internos reciben 500 JSON sin traza ni secretos. Las rutas API desconocidas también responden JSON. Los errores HTML no muestran trazas ni URI.

## Prueba manual de API con Postman

Iniciar el servidor con `npm start` y dejarlo activo. Si `PORT` no es 3000, reemplazar el puerto en las URL.

1. **Listado inicial:** GET `http://localhost:3000/api/reservas`, Body `none`. Registrar estado 200, arreglo y cantidad. Una base nueva puede devolver `[]`.
2. **Crear:** POST `http://localhost:3000/api/reservas`; Body > raw > JSON; dejar que Postman configure `Content-Type: application/json`. Enviar el JSON de ejemplo una sola vez. Comprobar 201, el ID textual, estado pendiente y `Location` en los headers de respuesta. Usar datos ficticios.
3. **Consultar Location:** GET a la URL indicada por Location (si es relativa, anteponer `http://localhost:3000`). Verificar 200 y los mismos datos/default.
4. **IDs:** GET `/api/reservas/1` debe responder 400. GET `/api/reservas/000000000000000000000000` responde 404 únicamente si no existe ese documento.
5. **Filtro:** GET `/api/reservas` con Params `sala` = `Sala Norte`; confirmar coincidencias exactas. Probar también una sala textual sin coincidencias (200, `[]`). Activar dos parámetros `sala` para verificar 400; desactivarlos al comparar el total.
6. **Entradas inválidas:** repetir POST cambiando un dato por vez: estudiante vacío, email sin `@`, sala/turno inválidos, fecha vacía y personas `0`, `7`, `2.5`, `"abc"`, `true`, arreglo u objeto. Enviar también Body `none` y JSON deliberadamente mal formado con Content-Type JSON. Todos deben dar 400. Repetir el GET sin filtros y comprobar que la cantidad no aumentó. Para `estado`/`_id` extra, una petición válida debe crear de todos modos con su propio ID y estado pendiente; contarla como alta.
7. **Persistencia:** guardar ID, Location y cantidades; detener y reiniciar el servidor con la misma base; volver a consultar el mismo ID y buscarlo en el sitio. No repetir POST para esta comprobación. Listar dos veces y verificar cantidad estable. Comparar `_id` en Atlas Data Explorer, base `reservas_salas_u8`, colección `reservas`.

Las capturas/registros deben mostrar método, URL, estado y resultado; en el POST, también Location. Recortar datos no pertinentes y nunca mostrar secretos. Para un fallo inesperado durante una operación, usar una simulación controlada en pruebas o un entorno acordado, sin alterar usuarios, accesos ni clústeres compartidos.

### Matriz de resultados

Completar los resultados observados durante la ejecución real; no presentar los esperados como evidencia. Las cantidades e IDs anotados corresponden a la ejecución de práctica y deben coincidir con las capturas que se adjunten.

| Caso | Resultado esperado | Resultado observado / cantidad |
| --- | --- | --- |
| Listado inicial en `reservas_salas_u8` | 200 y arreglo; [] si nueva | Observado: 200 y `[]` antes del alta |
| Alta válida | 201, Location y estado pendiente | Observado en Postman: dos POST válidos respondieron 201. Primer ID `6adf85821036c8580c5dd525`; segunda Location `/api/reservas/6adf89bf5d81bd231c3a69ab`. Ambas respuestas incluyeron los seis campos y `estado: "pendiente"` |
| Consulta por Location | 200, mismo recurso | Observado en Postman: GET por ID `6adf85821036c8580c5dd525`, 200 y cuerpo con el mismo recurso; segundo GET a `/api/reservas/6adf89bf5d81bd231c3a69ab`, 200 |
| Consulta tras reinicio | 200, mismo ID | Observado: se reinició el servidor y el log registra GET de ese ID con 200; volver a guardar la captura de respuesta Postman posterior al reinicio como evidencia |
| ID `1` / ID válido inexistente | 400 / 404 | Pendiente de ejecutar |
| POST sin cuerpo | 400 JSON; cantidad sin aumento | Observado en Postman: 400 `Envía un cuerpo con los datos de la reserva.`; después del rechazo el listado permanece en 2 reservas |
| Estudiante vacío | 400; cantidad sin aumento | Observado en Postman: 400 `Completa todos los campos para continuar.`; listado posterior: 2 reservas, sin aumento |
| Email sin `@` | 400; cantidad sin aumento | Observado en Postman: 400 `Ingresa un email que incluya @.`; listado posterior: 2 reservas, sin aumento |
| Sala inválida (`Sala Oeste`) | 400; cantidad sin aumento | Observado: respuesta `Selecciona una sala permitida.`; listado posterior: 2 reservas, sin aumento |
| Turno inválido (`Madrugada`) | 400; cantidad sin aumento | Observado: respuesta `Selecciona un turno permitido.`; listado posterior: 2 reservas, sin aumento |
| Fecha vacía | 400; cantidad sin aumento | Observado: 400 `Completa todos los campos para continuar.`; listado posterior: 2 reservas, sin aumento |
| Personas `7`, `0` y `2.5` | 400; cantidad sin aumento | Observado en Postman en los tres casos: `La cantidad debe ser un número entero entre 1 y 6.`; listado posterior: 2, sin aumento |
| Personas `"abc"` | 400; cantidad sin aumento | Observado en Postman con `"abc"` entre comillas: 400 `La cantidad debe ser un número entero entre 1 y 6.`; no crea documento |
| Personas `true` | 400; cantidad sin aumento | Observado en Postman con booleano JSON válido `true`: 400 `La cantidad debe ser un número entero entre 1 y 6.`; listado posterior: 2, sin aumento |
| Personas arreglo `[]` y objeto `{}` | 400; cantidad sin aumento | Observado: 400 `La cantidad debe ser un número entero entre 1 y 6.`; listado posterior: 2, sin aumento. Confirmar que se hayan ensayado ambos valores por separado si la evidencia de Postman no los distingue |
| JSON mal formado | 400 JSON; cantidad sin aumento | Observado en Postman: 400 `La solicitud contiene datos inválidos.`; GET posterior confirmó 2 reservas, sin aumento |
| Filtro y sala sin coincidencias | 200; coincidencias / [] | Observado en Postman: `Sala Norte` devolvió la reserva; `Sala Sur` devolvió 200 y `[]` |
| Sala repetida | 400 | Observado en Postman: dos parámetros activos `sala` devolvieron 400; confirmación local con la misma URL, estado 400 |
| Campos extra `estado`/`_id` | Se ignoran; nueva reserva pendiente 
| Listado dos veces | Cantidad estable | Observado: dos GET consecutivos devolvieron 2 reservas y los mismos IDs (`6adf85821036c8580c5dd525`, `6adf89bf5d81bd231c3a69ab`); verificado nuevamente en la API |
| Formulario válido/inválido | 302 / 400 con valores 
| `/estado` y sitio | Conteo y vistas persistentes | Observado en navegador: `/reservas` muestra Ana Ejemplo y `/estado` informó `1` antes del segundo POST válido. Conteo actual verificado por API: `2`; volver a consultar `/estado` para actualizar la evidencia |
| URI ausente al arrancar | No abre el puerto 

## Scripts y calidad

```sh
npm run db:check
npm run db:create
npm run db:list
npm run format
npm run check
```

Los scripts DB requieren `.env`; no escriben al iniciar el servidor. `db:create` sí agrega una reserva ficticia nueva cuando se ejecuta explícitamente. `format` aplica Prettier a `src` y `scripts`; `check` verifica formato y ESLint.

## Continuidad respecto del TP 07

Se conserva el modelo y las operaciones Mongoose, pero ahora el servicio asíncrono es el origen de datos tanto del sitio como de HTTP. La aplicación deja de importar la semilla y el servicio síncrono en memoria. Se agregan estado, validación estricta del cuerpo, rutas JSON, errores HTTP diferenciados, Location, arranque después de conectar y cierre ordenado. Se conserva CommonJS, las seis reglas básicas del modelo y la estructura por capas.
#   t p - 0 8 - E n d p o i n t s - p e r s i s t e n t e s - d e - r e s e r v a s - d e - s a l a s  
 