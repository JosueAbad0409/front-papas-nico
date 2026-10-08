# Papas Nico como aplicación

El manifest, los iconos y el service worker se generan con `npm run build`.
Publicar todo `dist/front-papas-nico/browser` en el alojamiento HTTPS habitual.
El servidor debe devolver `index.html` para las rutas Angular y servir los archivos
`manifest.webmanifest`, `ngsw.json`, `ngsw-worker.js` e `icons/*` directamente.
Evitar caché prolongada para `index.html`, `ngsw.json` y `ngsw-worker.js`.

## Verificar en local

```bash
npm install
npx ng serve --configuration production
```

Abrir http://localhost:4200. `npm start` usa desarrollo, sin service worker.

## Instalar

- Chrome/Edge de escritorio: usar la opción de instalación de la barra o menú del navegador.
- Android/Chrome: menú → Instalar aplicación o Agregar a pantalla principal.
- iPhone/Safari: Compartir → Agregar a pantalla de inicio.

Los iconos PNG cuadrados se derivaron de `public/logonico.png`, el logo existente.
`logonico.jpg` no estaba en el repositorio al implementar este cambio.

La interfaz puede abrir desde la caché después de la primera visita, pero consultar
reportes y guardar ventas/compras requiere conexión. La API no se guarda en caché
ni se implementa una cola de operaciones sin conexión.

Al detectar una versión nueva aparece Actualizar; pide guardar el formulario antes
de recargar y no recarga automáticamente durante una venta o compra.
