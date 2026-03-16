import { NextRequest, NextResponse } from 'next/server';
import { updateSuscripcion, getSuscripcionesByCliente, getEmpresa, createPago, createComprobante, getNextComprobanteNumber } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const topic = request.nextUrl.searchParams.get('topic');
    
    const empresa = getEmpresa();

    if (topic === 'payment') {
      const paymentId = request.nextUrl.searchParams.get('id');
      
      if (!empresa?.mercadopago_access_token) {
        return NextResponse.json({ error: 'Mercado Pago no configurado' }, { status: 400 });
      }

      const mercadopago = require('mercadopago');
      mercadopago.configure({
        access_token: empresa.mercadopago_access_token,
      });

      const payment = await mercadopago.payment.findById(paymentId);
      
      if (payment.body.status === 'approved') {
        const externalReference = payment.body.external_reference;
        
        if (externalReference) {
          const suscripciones = getSuscripcionesByCliente(externalReference.split('-')[0] || externalReference);
          
          if (suscripciones && suscripciones.length > 0) {
            const suscripcion = suscripciones[0];
            const fechaFin = new Date();
            fechaFin.setMonth(fechaFin.getMonth() + 1);

            updateSuscripcion(suscripcion.id, {
              activa: true,
              fecha_fin: fechaFin.toISOString().split('T')[0],
            });

            const comprobanteNumero = getNextComprobanteNumber('recibo');
            createComprobante({
              tipo: 'recibo',
              cliente_id: suscripcion.cliente_id,
              suscripcion_id: suscripcion.id,
              numero: comprobanteNumero,
              fecha: new Date().toISOString().split('T')[0],
              subtotal: payment.body.transaction_amount,
              iva: 0,
              total: payment.body.transaction_amount,
            });

            console.log(`Pago aprobado para suscripción: ${suscripcion.id}`);
          }
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Error procesando webhook' }, { status: 500 });
  }
}
