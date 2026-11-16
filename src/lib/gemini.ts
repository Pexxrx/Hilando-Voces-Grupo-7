import { GoogleGenAI } from '@google/genai';
import { PriorityLevel } from '@/types';

export interface ReportAnalysis {
  summary: string;
  tags: string[];
  priority: PriorityLevel;
  urgencyReason: string;
}

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * Analiza un reporte ciudadano utilizando Gemini 3.8 Flash
 * Retorna resumen de 2 líneas, etiquetas temáticas y recomendación de prioridad orientativa.
 */
export async function analyzeReportWithGemini(
  description: string,
  axis: string
): Promise<ReportAnalysis> {
  const prompt = `
Eres el Asistente Copiloto de IA para la plataforma comunitaria "Hilando Voces" en San Juan de Lurigancho (SJL), Lima, Perú.
Tu labor es orientar a las lideresas juveniles analizando el siguiente reporte ciudadano sin modificar la voz del vecino.

Eje temático: ${axis}
Descripción del vecino: "${description}"

Analiza la incidencia y responde estrictamente en formato JSON válido con la siguiente estructura:
{
  "summary": "Resumen conciso de máximo 2 líneas destacando la problemática específica y lugar.",
  "tags": ["Etiqueta1", "Etiqueta2", "Etiqueta3"],
  "priority": "baja" | "media" | "alta",
  "urgencyReason": "Breve justificación de la prioridad recomendada (ej: cerca de colegio, riesgo de acoso nocturno, foco infeccioso)."
}

Criterios de prioridad:
- "alta": Vías escolares oscuras, riesgo delictivo/acoso inminente, o cúmulos de basura obstruyendo el paso comunal o cerca de alimentos/salud.
- "media": Espacios recreativos deteriorados con uso activo, falta de luminarias intermedias.
- "baja": Mejoras estéticas o problemáticas menores.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '';
    const parsed = JSON.parse(text);

    return {
      summary: parsed.summary || 'Resumen generado por asistente.',
      tags: Array.isArray(parsed.tags) ? parsed.tags : ['Comunidad', axis],
      priority: ['baja', 'media', 'alta'].includes(parsed.priority) ? parsed.priority : 'media',
      urgencyReason: parsed.urgencyReason || 'Evaluación automática orientativa.',
    };
  } catch (error) {
    console.warn('Fallo llamada Gemini, aplicando fallback heurístico:', error);
    return getHeuristicAnalysis(description, axis);
  }
}

/**
 * Fallback heurístico si no hay conexión o se agota temporalmente la cuota
 */
function getHeuristicAnalysis(description: string, axis: string): ReportAnalysis {
  const lower = description.toLowerCase();
  let priority: PriorityLevel = 'media';
  const tags: string[] = ['Comunitario'];

  if (axis === 'alumbrado') {
    tags.push('Seguridad', 'Luminarias');
    if (lower.includes('oscuro') || lower.includes('peligro') || lower.includes('robo') || lower.includes('acoso')) {
      priority = 'alta';
      tags.push('Zona Crítica');
    }
  } else if (axis === 'microbasurales') {
    tags.push('Salubridad', 'Residuos');
    if (lower.includes('colegio') || lower.includes('niños') || lower.includes('infeccioso') || lower.includes('rata')) {
      priority = 'alta';
      tags.push('Riesgo Sanitario');
    }
  } else {
    tags.push('Espacio Público', 'Recuperación');
  }

  return {
    summary: description.slice(0, 140) + (description.length > 140 ? '...' : ''),
    tags,
    priority,
    urgencyReason: 'Evaluación local automática por palabras clave.',
  };
}
