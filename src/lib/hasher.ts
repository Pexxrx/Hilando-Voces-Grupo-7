import crypto from 'crypto';

/**
 * Genera un token unidireccional SHA-256 a partir del DNI y una sal secreta.
 * Garantiza cumplimiento de la Ley N° 29733:
 * El DNI se procesa exclusivamente en memoria volátil (RAM) y NUNCA se persiste en disco ni en BD.
 */
export function hashDniInMemory(dni: string): string {
  const cleanDni = dni.trim();
  const salt = process.env.DNI_SECRET_SALT || 'fallback-secret-salt-sjl-2026';
  
  return crypto
    .createHmac('sha256', salt)
    .update(cleanDni)
    .digest('hex');
}

/**
 * Valida formato sintáctico del DNI peruano (8 dígitos numéricos).
 */
export function isValidDniFormat(dni: string): boolean {
  return /^[0-9]{8}$/.test(dni.trim());
}
