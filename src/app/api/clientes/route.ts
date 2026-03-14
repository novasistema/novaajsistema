import { NextRequest, NextResponse } from 'next/server';
import { getClientes, getClienteById, createCliente, updateCliente, deleteCliente } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (id) {
      const cliente = getClienteById(id);
      if (!cliente) {
        return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
      }
      return NextResponse.json(cliente);
    }
    
    const clientes = getClientes();
    return NextResponse.json(clientes);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener clientes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    if (!data.nombre || !data.email) {
      return NextResponse.json({ error: 'Nombre y email son requeridos' }, { status: 400 });
    }
    
    const cliente = createCliente({
      nombre: data.nombre,
      email: data.email,
      telefono: data.telefono,
      direccion: data.direccion,
      documento: data.documento,
      tipo_documento: data.tipo_documento || 'DNI',
    });
    
    return NextResponse.json(cliente, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'message' in error && error.message === 'UNIQUE constraint failed: clientes.email') {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error al crear cliente' }, { status: 500 });
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
    const cliente = updateCliente(id, data);
    
    if (!cliente) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }
    
    return NextResponse.json(cliente);
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'message' in error && error.message === 'UNIQUE constraint failed: clientes.email') {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error al actualizar cliente' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }
    
    const success = deleteCliente(id);
    
    if (!success) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar cliente' }, { status: 500 });
  }
}
