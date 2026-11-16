import { Report } from '@/types';

export interface ExtendedReport extends Report {
  coordinator_name?: string;
  volunteer_role?: string;
  tools_available?: string[];
  scheduled_date?: string;
  meeting_point?: string;
}

// Data sintética retirada a petición del usuario. Solo se mostrarán reportes reales.
export const MOCK_REPORTS_25: ExtendedReport[] = [];
