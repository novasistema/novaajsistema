import { NextRequest, NextResponse } from 'next/server';
import { getAplicaciones, getAplicacionById, createAplicacion, updateAplicacion, deleteAplicacion } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (id) {
      const aplicacion = getAplicacionById(id);
      if (!aplicacion) {
        return NextResponse.json({ error: 'Aplicación no encontrada' }, { status: 404 });
      }
      return NextResponse.json(aplicacion);
    }
    
    const aplicaciones = getAplicaciones();
    return NextResponse.json(aplicaciones);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener aplicaciones' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    if (!data.nombre || data.precio_mensual === undefined) {
      return NextResponse.json({ error: 'Nombre y precio son requeridos' }, { status: 400 });
    }
    
    const aplicacion = createAplicacion({
      nombre: data.nombre,
      descripcion: data.descripcion,
      precio_mensual: parseFloat(data.precio_mensual),
      activa: data.activa ?? true,
    });
    
    return NextResponse.json(aplicacion, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear aplicación' }, { status: 500 });
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
    const aplicacion = updateAplicacion(id, {
      nombre: data.nombre,
      descripcion: data.descripcion,
      precio_mensual: data.precio_mensual ? parseFloat(data.precio_mensual) : undefined,
      activa: data.activa,
    });
    
    if (!aplicacion) {
      return NextResponse.json({ error: 'Aplicación no encontrada' }, { status: 404 });
    }
    
    return NextResponse.json(aplicacion);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar aplicación' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }
    
    const success = deleteAplicacion(id);
    
    if (!success) {
      return NextResponse.json({ error: 'Aplicación no encontrada' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar aplicación' }, { status: 500 });
  }
}
