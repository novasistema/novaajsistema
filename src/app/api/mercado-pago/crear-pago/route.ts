import { NextRequest, NextResponse } from 'next/server';
import { getAplicacionById, createCliente, createSuscripcion, getEmpresa } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

const mercadopago = require('mercadopago');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { aplicacionId, nombre, email, telefono, precio } = body;

    if (!aplicacionId || !nombre || !email || !precio) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    const aplicacion = getAplicacionById(aplicacionId);
    if (!aplicacion) {
      return NextResponse.json({ error: 'Aplicación no encontrada' }, { status: 404 });
    }

    const empresa = getEmpresa();
    if (!empresa?.mercadopago_access_token) {
      return NextResponse.json({ error: 'Mercado Pago no está configurado. Contactá al administrador.' }, { status: 400 });
    }

    mercadopago.configure({
      access_token: empresa.mercadopago_access_token,
    });

    const existingCliente = await fetch(`${request.nextUrl.origin}/api/clientes?email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .catch(() => null);
    
    let clienteId;
    if (existingCliente && existingCliente.length > 0) {
      clienteId = existingCliente[0].id;
    } else {
      const nuevoCliente = createCliente({
        nombre,
        email,
        telefono: telefono || '',
        direccion: '',
        documento: '',
        tipo_documento: 'DNI',
      });
      clienteId = nuevoCliente.id;
    }

    const suscripcionId = uuidv4();
    const preferencia = {
      items: [
        {
          title: `${aplicacion.nombre} - Suscripción Mensual`,
          description: aplicacion.descripcion || `Suscripción mensual a ${aplicacion.nombre}`,
          quantity: 1,
          unit_price: Number(precio),
          currency_id: 'ARS',
        }
      ],
      payer: {
        name: nombre,
        email: email,
      },
      external_reference: suscripcionId,
      notification_url: `${request.nextUrl.origin}/api/mercado-pago/webhook`,
      back_urls: {
        success: `${request.nextUrl.origin}/pago/exitoso?ref=${suscripcionId}`,
        failure: `${request.nextUrl.origin}/pago/fallido`,
        pending: `${request.nextUrl.origin}/pago/pendiente`,
      },
      auto_return: 'approved',
    };

    const preferenciaCreada = await mercadopago.preferences.create(preferencia);

    createSuscripcion({
      cliente_id: clienteId,
      aplicacion_id: aplicacionId,
      activa: false,
      fecha_inicio: new Date().toISOString().split('T')[0],
      fecha_fin: undefined,
    });

    return NextResponse.json({
      init_point: preferenciaCreada.body.init_point,
      preference_id: preferenciaCreada.body.id,
    });

  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json({ error: 'Error al crear el pago' }, { status: 500 });
  }
}
