import crypto from 'crypto';

/**
 * Genera un token unidireccional HMAC-SHA-256 a partir del DNI y una sal secreta.
 * Garantiza cumplimiento de la Ley N° 29733 (Protección de Datos Personales):
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

/**
 * Genera un código de ticket único, criptográficamente seguro e impredecible (#HV-SJL-YYYYY).
 * Utiliza 5 caracteres en base32 (sin caracteres ambiguos 0, O, 1, I).
 * Ofrece más de 33,554,432 de combinaciones posibles para prevenir ataques de fuerza bruta
 * y enumeración de tickets (IDOR).
 */
export function generateSecureTicketCode(): string {
  // Caracteres alfanuméricos seguros y legibles
  const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  const randomBytes = crypto.randomBytes(5);
  let suffix = '';
  for (let i = 0; i < 5; i++) {
    suffix += alphabet[randomBytes[i] % alphabet.length];
  }
  return `#HV-SJL-${suffix}`;
}

/**
 * Validador estricto para códigos de ticket para mitigar inyecciones y consultas maliciosas.
 */
export function isValidTicketCode(code: string): boolean {
  if (!code || typeof code !== 'string') return false;
  return /^#?HV-SJL-[A-Z0-9]{3,8}$/i.test(code.trim());
}

/**
 * Sanitiza texto eliminando etiquetas HTML y secuencias de escape peligrosas (anti-XSS).
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/[<>]/g, '') // Elimina etiquetas HTML
    .replace(/javascript:/gi, '') // Elimina pseudo-protocolos
    .trim();
}
