# Destino viquingo: A comarca do Salnés

[![Astro](https://img.shields.io/badge/Astro-FF5D01?logo=astro&logoColor=white)](https://astro.build/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/docs/Web/JavaScript)
[![Stripe](https://img.shields.io/badge/Stripe-626CD9?logo=stripe&logoColor=white)](https://stripe.com/)
[![Netlify](https://img.shields.io/badge/Netlify-00C7B7?logo=netlify&logoColor=white)](https://www.netlify.com/)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/docs/Web/CSS)

[![Netlify Status](https://api.netlify.com/api/v1/badges/62b6b15f-c451-4646-8180-44ed0f08401b/deploy-status)](https://app.netlify.com/projects/destinoviquingo/deploys)

Landing y flujo completo de compra para el libro **“Destino viquingo: A comarca do Salnés”**, centrado en un checkout muy sencillo: pocos clics desde la página de compra hasta el pago con Stripe y el formulario mínimo necesario.

## Características

- Landing page del libro con foco en la historia dos viquingos en Galicia y la comarca do Salnés.
- Flujo de compra muy corto:
  - Página **Mercar** con botón “Engadir ao carrito” que añade el libro y redirige a **Checkout**.
  - Página **Checkout** con resumen del carrito, selección de unidades y totales.
  - Integración con **Stripe Checkout** (envío en España y opción de recollida local).
- Carrito persistente con `localStorage` (sin backend propio).
- Páginas legales adaptadas a la venta online en España (condiciones, aviso legal, etc.).
- Despliegue continuo en Netlify.

## Tecnologías

- **Astro** como framework principal para la web estática + rutas API server-side.
- **JavaScript/TypeScript** para la lógica del carrito y el endpoint de Stripe.
- **Stripe Checkout** para el pago seguro con tarjeta, dirección de envío y teléfono.
- **Netlify** como plataforma de despliegue (adapter oficial de Astro).
- **CSS** modularizado por página/componente.

## Estructura básica del proyecto

src/
  layouts/
    Layout.astro
  components/
    layout/
      Header.astro
      Footer.astro
  pages/
    index.astro          # Landing principal
    mercar.astro         # Página de compra / producto
    checkout/index.astro # Checkout y resumen de carrito
    checkout/success.astro
    legal/
      terminos.astro     # Condiciones del servicio y venta
    api/
      create-checkout-session.js # Endpoint de Stripe Checkout

public/
  images/
    ...                  # Mockups y portada del libro


## Carrito y Checkout

- El carrito se guarda en `localStorage` bajo una clave `CART_KEY`.
- Desde `mercar.astro`, el botón **“Engadir ao carrito”**:
  - Añade (o incrementa) una unidad del libro en el carrito.
  - Redirige directamente a `/checkout`.
- En `/checkout`:
  - Se leen los datos del carrito desde `localStorage`.
  - Se muestra la línea de pedido con:
    - Imagen del libro.
    - Nombre, precio unitario, cantidad y total.
  - Botones para aumentar/disminuir unidades y eliminar el ítem.
  - Resumen de subtotal, envío y total.

Al pulsar **“Ir a pagar con tarxeta”**, se lanza un `fetch` a `/api/create-checkout-session` que crea la sesión de Stripe y redirige automáticamente a la pasarela.

## Integración con Stripe

### Endpoint `create-checkout-session`

Ubicación: `src/pages/api/create-checkout-session.js`

Responsabilidades:

- Leer el carrito enviado desde `/checkout` (JSON: `{ cart }`).
- Transformar el carrito en `line_items` compatibles con Stripe (precio en céntimos).
- Configurar:
  - `shipping_address_collection` limitado a España (`['ES']`).
  - `shipping_options` con:
    - Envío estándar de pago (tarifa `shipping_rate`).
    - Recollida local gratuita (tarifa `shipping_rate` a 0 €).
  - `success_url` y `cancel_url` según las variables de entorno.
- Devolver `{ url: session.url }` al frontend.

### Variables de entorno

Todas se definen en Netlify (entorno de producción y, si se desea, test):

- `STRIPE_SECRET_KEY`  
  Clave secreta de Stripe (`sk_test_...` para pruebas, `sk_live_...` para producción).

- `STRIPE_SUCCESS_URL`  
  URL absoluta de la página de éxito, por ejemplo:  
  `https://destinoviquingo.netlify.app/checkout/success`

- `STRIPE_CANCEL_URL`  
  URL de retorno si el usuario cancela el pago, por ejemplo:  
  `https://destinoviquingo.netlify.app/checkout`

Los IDs de `shipping_rate` (`shr_...`) se configuran directamente en el código del endpoint (diferentes para test y producción).

## Desarrollo local

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/rubenterre/destinoviquingolanding.git
   cd destinoviquingo
   ```

2. Instalar dependencias:

   ```bash
   npm install
   ```

3. Configurar variables de entorno en `.env` (para desarrollo local):

   ```env
   STRIPE_SECRET_KEY=sk_test_xxx
   STRIPE_SUCCESS_URL=http://destinoviquingo.netlify.app/checkout/success
   STRIPE_CANCEL_URL=http://destinoviquingo.netlify.app/checkout
   ```

4. Ejecutar el entorno de desarrollo:

   ```bash
   npm run dev
   ```

   Por defecto, la web estará en `http://destinoviquingo.netlify.app`.

## Despliegue en Netlify

Este proyecto está configurado con el adapter de Netlify para Astro, lo que permite:

- Servir páginas estáticas.
- Ejecutar la ruta API `/api/create-checkout-session` como función serverless.

Configuración típica en Netlify:

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- Variables de entorno: las tres de Stripe descritas arriba.

Los deploys se disparan automáticamente al hacer push a la rama principal configurada (por ejemplo, `main`).

## Licencia

2026 Rubén Arturo Terré Lameiro.
El código del sitio puede usarse como referencia educativa. Para reutilización comercial, consultar previamente.