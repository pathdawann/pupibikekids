// src/utils/seguridad.js

// Lista global de correos con acceso al panel administrativo
export const CORREOS_AUTORIZADOS = [
  "pathdawann@gmail.com", 
  "cesarpupibike@gmail.com", 
  "pupibikeweb@gmail.com"
];

// Lista de correos con privilegios destructivos (eliminar atletas/pagos)
export const CORREOS_SUPERADMIN = [
  "pathdawann@gmail.com", 
  "pupibikeweb@gmail.com"
];

export function esUsuarioAutorizado(email) {
  return email ? CORREOS_AUTORIZADOS.includes(email) : false;
}

export function tienePermisosSuperAdmin(email) {
  return email ? CORREOS_SUPERADMIN.includes(email) : false;
}