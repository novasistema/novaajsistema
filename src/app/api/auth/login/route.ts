import { NextRequest, NextResponse } from 'next/server';
import { verifyUser } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    if (!data.username || !data.password) {
      return NextResponse.json({ error: 'Usuario y contraseña requeridos' }, { status: 400 });
    }
    
    const isValid = verifyUser(data.username, data.password);
    
    if (!isValid) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al iniciar sesión' }, { status: 500 });
  }
}
