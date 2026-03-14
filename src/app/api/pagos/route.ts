import { NextRequest, NextResponse } from 'next/server';
import { 
  getPagos, 
  getPagoById, 
  createPago, 
  getSuscripcionById,
  getNextComprobanteNumber,
  createComprobante,
  getClienteById,
  getComprobantes,
  getComprobanteById,
  setEmpresa,
  getEmpresa,
  getEstadisticas,
  updateSuscripcion,
  updateUserPassword
} from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const type = searchParams.get('type');
    const stats = searchParams.get('stats');
    
    if (stats === 'true') {
      return NextResponse.json(getEstadisticas());
    }
    
    if (type === 'comprobantes') {
      const comprobantes = getComprobantes();
      return NextResponse.json(comprobantes);
    }
    
    if (type === 'empresa') {
      const empresa = getEmpresa();
      return NextResponse.json(empresa || {});
    }
    
    if (id) {
      if (type === 'comprobante') {
        const comprobante = getComprobanteById(id);
        if (!comprobante) {
          return NextResponse.json({ error: 'Comprobante no encontrado' }, { status: 404 });
        }
        return NextResponse.json(comprobante);
      }
      const pago = getPagoById(id);
      if (!pago) {
        return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 });
      }
      return NextResponse.json(pago);
    }
    
    const pagos = getPagos();
    return NextResponse.json(pagos);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener datos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');
    
    if (action === 'empresa') {
      const data = await request.json();
      setEmpresa(data);
      return NextResponse.json({ success: true });
    }
    
    if (action === 'pago') {
      const data = await request.json();
      
      if (!data.suscripcion_id || !data.monto || !data.fecha_pago) {
        return NextResponse.json({ error: 'Suscripción, monto y fecha son requeridos' }, { status: 400 });
      }
      
      const suscripcion = getSuscripcionById(data.suscripcion_id);
      if (!suscripcion) {
        return NextResponse.json({ error: 'Suscripción no encontrada' }, { status: 404 });
      }
      
      const cliente = getClienteById(suscripcion.cliente_id);
      if (!cliente) {
        return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
      }
      
      const numeroRecibo = getNextComprobanteNumber('recibo');
      const subtotal = parseFloat(data.monto);
      const iva = 0;
      const total = subtotal;
      
      const comprobante = createComprobante({
        tipo: 'recibo',
        cliente_id: cliente.id,
        suscripcion_id: suscripcion.id,
        numero: numeroRecibo,
        fecha: data.fecha_pago,
        subtotal,
        iva,
        total,
      });
      
      const pago = createPago({
        suscripcion_id: data.suscripcion_id,
        monto: subtotal,
        fecha_pago: data.fecha_pago,
        metodo_pago: data.metodo_pago || 'efectivo',
        comprobante_id: comprobante.id,
      });
      
      if (data.activar_suscripcion) {
        const fechaFin = new Date(data.fecha_pago);
        fechaFin.setMonth(fechaFin.getMonth() + 1);
        
        updateSuscripcion(suscripcion.id, {
          activa: true,
          fecha_fin: fechaFin.toISOString().split('T')[0],
        });
      }
      
      return NextResponse.json({ pago, comprobante }, { status: 201 });
    }
    
    if (action === 'comprobante_venta') {
      const data = await request.json();
      
      if (!data.cliente_id || !data.monto || !data.fecha) {
        return NextResponse.json({ error: 'Cliente, monto y fecha son requeridos' }, { status: 400 });
      }
      
      const numeroComprobante = getNextComprobanteNumber('venta');
      const subtotal = parseFloat(data.monto);
      const iva = data.con_iva ? subtotal * 0.21 : 0;
      const total = subtotal + iva;
      
      const comprobante = createComprobante({
        tipo: 'venta',
        cliente_id: data.cliente_id,
        suscripcion_id: data.suscripcion_id || null,
        numero: numeroComprobante,
        fecha: data.fecha,
        subtotal,
        iva,
        total,
      });
      
      return NextResponse.json(comprobante, { status: 201 });
    }

    if (action === 'change_password') {
      const data = await request.json();
      
      if (!data.username || !data.newPassword) {
        return NextResponse.json({ error: 'Usuario y nueva contraseña requeridos' }, { status: 400 });
      }
      
      const success = updateUserPassword(data.username, data.newPassword);
      
      if (!success) {
        return NextResponse.json({ error: 'Error al cambiar contraseña' }, { status: 500 });
      }
      
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al procesar solicitud' }, { status: 500 });
  }
}
