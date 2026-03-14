'use client';

import { useEffect, useState, useRef } from 'react';

interface Empresa {
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  cuil: string;
  documento: string;
  logo: string;
}

export default function ConfiguracionPage() {
  const [empresa, setEmpresa] = useState<Empresa>({
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
    cuil: '',
    documento: 'DNI',
    logo: '',
  });
  const [saved, setSaved] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    fetch('/api/pagos?type=empresa')
      .then(res => res.json())
      .then(data => {
        if (data.nombre) {
          setEmpresa(data);
          if (data.logo) {
            setLogoPreview(data.logo);
          }
        }
      })
      .catch(console.error);
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLogoPreview(base64);
        setEmpresa({ ...empresa, logo: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview('');
    setEmpresa({ ...empresa, logo: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const res = await fetch('/api/pagos?action=empresa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(empresa),
    });
    
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }
    
    if (passwordData.newPassword.length < 4) {
      setPasswordError('La contraseña debe tener al menos 4 caracteres');
      return;
    }
    
    const res = await fetch('/api/pagos?action=change_password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        newPassword: passwordData.newPassword,
      }),
    });
    
    if (res.ok) {
      setPasswordSaved(true);
      setPasswordData({ newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSaved(false), 3000);
    } else {
      setPasswordError('Error al cambiar la contraseña');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="mt-1 text-sm text-gray-600">Configura los datos de tu empresa y branding</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Logo y Marca</h2>
          
          {saved && (
            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              Configuración guardada correctamente
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo de la Empresa</label>
              <div className="flex items-center gap-4">
                <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <span className="text-gray-400 text-sm text-center px-2">Sin logo</span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 inline-block text-center text-sm"
                  >
                    Subir Logo
                  </label>
                  {logoPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG o GIF. Máximo 2MB.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre de la Empresa *</label>
              <input
                type="text"
                required
                value={empresa.nombre}
                onChange={(e) => setEmpresa({ ...empresa, nombre: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Mi Empresa"
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleSubmit}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Guardar
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Datos de Contacto</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de Documento</label>
                  <select
                    value={empresa.documento}
                    onChange={(e) => setEmpresa({ ...empresa, documento: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="DNI">DNI</option>
                    <option value="CUIT">CUIT</option>
                    <option value="CUIL">CUIL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Número de Documento</label>
                  <input
                    type="text"
                    value={empresa.cuil}
                    onChange={(e) => setEmpresa({ ...empresa, cuil: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="XX-XXXXXXXX-X"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Dirección</label>
                <input
                  type="text"
                  value={empresa.direccion}
                  onChange={(e) => setEmpresa({ ...empresa, direccion: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Calle y número"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                  <input
                    type="tel"
                    value={empresa.telefono}
                    onChange={(e) => setEmpresa({ ...empresa, telefono: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="+54 9 11 XXXX XXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={empresa.email}
                    onChange={(e) => setEmpresa({ ...empresa, email: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="contacto@empresa.com"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Cambiar Contraseña</h2>
          
          {passwordSaved && (
            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              Contraseña cambiada correctamente
            </div>
          )}
          
          {passwordError && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {passwordError}
            </div>
          )}
          
          <form onSubmit={handlePasswordChange}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Mínimo 4 caracteres"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Repite la contraseña"
                  required
                />
              </div>
            </div>
            <div className="mt-6">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Cambiar Contraseña
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-medium text-yellow-800">Nota importante</h3>
        <p className="text-sm text-yellow-700 mt-1">
          Los comprobantes generados por este sistema <strong>no constituyen documento fiscal</strong> 
          y no están registrados frente a la ARCA (AFIP). Este sistema es solo para control interno 
          y emitirá comprobantes simples de venta y recibos de pago.
        </p>
      </div>
    </div>
  );
}
