import { NextRequest, NextResponse } from 'next/server';
import { 
  getSuscripciones, 
  getSuscripcionById, 
  getSuscripcionesByCliente,
  createSuscripcion, 
  updateSuscripcion, 
  deleteSuscripcion,
  getComprobantes,
  getNextComprobanteNumber,
  createComprobante,
  getClienteById,
  getAplicacionById
} from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const clienteId = searchParams.get('cliente_id');
    
    if (id) {
      const suscripcion = getSuscripcionById(id);
      if (!suscripcion) {
        return NextResponse.json({ error: 'Suscripción no encontrada' }, { status: 404 });
      }
      return NextResponse.json(suscripcion);
    }
    
    if (clienteId) {
      const suscripciones = getSuscripcionesByCliente(clienteId);
      return NextResponse.json(suscripciones);
    }
    
    const suscripciones = getSuscripciones();
    return NextResponse.json(suscripciones);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener suscripciones' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    if (!data.cliente_id || !data.aplicacion_id || !data.fecha_inicio) {
      return NextResponse.json({ error: 'Cliente, aplicación y fecha de inicio son requeridos' }, { status: 400 });
    }
    
    const suscripcion = createSuscripcion({
      cliente_id: data.cliente_id,
      aplicacion_id: data.aplicacion_id,
      activa: data.activa ?? true,
      fecha_inicio: data.fecha_inicio,
      fecha_fin: data.fecha_fin,
    });
    
    return NextResponse.json(suscripcion, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear suscripción' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }
    
    const data = await request.json();
    const suscripcion = updateSuscripcion(id, {
      activa: data.activa,
      fecha_inicio: data.fecha_inicio,
      fecha_fin: data.fecha_fin,
    });
    
    if (!suscripcion) {
      return NextResponse.json({ error: 'Suscripción no encontrada' }, { status: 404 });
    }
    
    return NextResponse.json(suscripcion);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar suscripción' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }
    
    const success = deleteSuscripcion(id);
    
    if (!success) {
      return NextResponse.json({ error: 'Suscripción no encontrada' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar suscripción' }, { status: 500 });
  }
}
