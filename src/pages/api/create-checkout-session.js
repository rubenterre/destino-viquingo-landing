// src/pages/api/create-checkout-session.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export const prerender = false; // muy importante: este endpoint no se prerenderiza
const STOCK_TOTAL = 10;
export async function POST({ request }) {
  try {
    const body = await request.json();
    const cart = body.cart || {};
    const items = Object.values(cart);

    const totalQuantity = items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    if (totalQuantity > STOCK_TOTAL) {
      return new Response(
        JSON.stringify({ error: 'Non hai stock suficiente.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Convertir el carrito en line_items para Checkout
    const line_items = items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: 'eur',
        unit_amount: item.price,
        product_data: {
          name: item.name,
        },
      },
    }));



    // 3. Crear la sesión de Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      success_url: `${import.meta.env.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: import.meta.env.STRIPE_CANCEL_URL,

      shipping_address_collection: {
        allowed_countries: ['ES'], // o ['ES', 'PT'] si amplías
      },


      shipping_options: [
        { shipping_rate: "shr_1T2aNRHjNOdqkZ11GeJAXfoa" },
        //envío pagado
        { shipping_rate: "shr_1T2aONHjNOdqkZ11K54M1qhw" }
        // envío recollida
      ],
      phone_number_collection: {
        enabled: true,
      },

      // meta { project: 'DestinoViquingo' },
    });

    // 4. Devolver la URL de la sesión para que el frontend redirija
    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Stripe Checkout error:', error);
    return new Response(
      JSON.stringify({ error: 'Erro ao crear a sesión de pago.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
