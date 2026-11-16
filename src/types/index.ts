export type ReportAxis = 'alumbrado' | 'microbasurales' | 'espacios_recreativos';

export type ReportStatus = 'recibido' | 'en_evaluacion' | 'faena_programada' | 'resuelto';

export type PriorityLevel = 'baja' | 'media' | 'alta';

export interface Report {
  id: string;
  ticket_code: string; // Ej: #HV-SJL-048
  axis: ReportAxis;
  description: string;
  photo_before_url?: string | null;
  photo_after_url?: string | null;
  
  // Georreferenciación
  latitude: number;
  longitude: number;
  ubigeo: string;
  reference?: string | null;
  
  // Articulación Comunitaria
  wants_to_coordinate: boolean;
  coordinator_whatsapp?: string | null;
  
  // Seguridad y Privacidad (Token Anti-Spam en memoria, nunca se guarda DNI)
  anti_spam_hash?: string;
  
  // Estados y Copiloto IA
  status: ReportStatus;
  priority_level: PriorityLevel;
  ai_summary?: string | null;
  ai_tags?: string[] | null;
  
  created_at: string;
  resolved_at?: string | null;
}

export interface ReportCluster {
  cluster_id: string;
  latitude: number;
  longitude: number;
  axis: ReportAxis;
  report_count: number;
  reports: Report[];
  priority_level: PriorityLevel;
  latest_created_at: string;
}

export interface UserRole {
  id: string;
  email: string;
  role: 'lideresa' | 'coordinadora' | 'superadmin';
  created_at: string;
}
