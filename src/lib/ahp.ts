/**
 * Motor de Priorización Multicriterio AHP (Analytic Hierarchy Process) de Saaty
 * Implementación oficial para Hilando Voces (Grupo 7) - San Juan de Lurigancho
 */

export interface AHPCriteriaWeights {
  salud: number;
  seguridad: number;
  alcance: number;
  equidad: number;
  convivencia: number;
}

export interface AHPEvaluation {
  ahp_score: number; // 0.0000 a 1.0000
  priority: 'alta' | 'media' | 'baja';
  priority_label: string;
  rank_position?: number;
  criteria_ratings: {
    salud: number;
    seguridad: number;
    alcance: number;
    equidad: number;
    convivencia: number;
  };
}

// 1. Pesos científicos calculados a partir de la matriz de juicios de Saaty (CR = 0.0221 < 0.10)
export const AHP_WEIGHTS: AHPCriteriaWeights = {
  salud: 0.2268,      // 22.68% - Focos infecciosos, olores, plagas, salud infantil
  seguridad: 0.4847,  // 48.47% - Oscuridad, rutas escolares nocturnas, asaltos
  alcance: 0.0888,    //  8.88% - Volumen de vecinos y familias impactadas
  equidad: 0.1431,    // 14.31% - Zonas altas, escaleras sin servicios, AA.HH. vulnerables
  convivencia: 0.0566 //  5.66% - Recuperación de losas deportivas, parques comunitarios
};

export const AHP_CONSISTENCY = {
  lambdaMax: 5.0990,
  ci: 0.0248,
  ri: 1.12,
  cr: 0.0221,
  isConsistent: true,
  scale: 'Escala Fundamental de Saaty (1 a 9)'
};

/**
 * Evalúa una incidencia comunitaria de SJL mediante AHP
 */
export function evaluateIncidentAHP(
  description: string,
  axis: string,
  reference?: string | null
): AHPEvaluation {
  const text = `${description} ${reference || ''}`.toLowerCase();

  // 1. SALUD (0.10 a 0.55)
  let health = 0.10;
  if (axis === 'microbasurales' || text.includes('basura') || text.includes('desmonte') || text.includes('basural')) {
    health = 0.35;
    if (text.includes('nido') || text.includes('colegio') || text.includes('salud') || text.includes('niños') || text.includes('mercado') || text.includes('roedor')) {
      health = 0.52;
    }
  } else if (text.includes('quema') || text.includes('tóxico') || text.includes('humo') || text.includes('llanta')) {
    health = 0.46;
  }

  // 2. SEGURIDAD (0.10 a 0.55)
  let security = 0.10;
  if (axis === 'alumbrado' || text.includes('poste') || text.includes('luz') || text.includes('foco') || text.includes('luminaria')) {
    security = 0.30;
    if (text.includes('cerro') || text.includes('escalera') || text.includes('pasaje') || text.includes('escolar') || text.includes('colegio')) {
      security = 0.45;
      if (text.includes('asalto') || text.includes('robo') || text.includes('arrebato') || text.includes('mototaxi') || text.includes('peligro') || text.includes('oscuridad')) {
        security = 0.55;
      }
    }
  } else if (text.includes('quema') || text.includes('delincuencia') || text.includes('drogas')) {
    security = 0.28;
  }

  // 3. ALCANCE (0.15 a 0.45)
  let scope = 0.15;
  if (text.includes('avenida') || text.includes('paradero') || text.includes('colegio') || text.includes('mercado') || text.includes('canto grande')) {
    scope = 0.42;
  } else if (text.includes('pasaje') || text.includes('callejón')) {
    scope = 0.22;
  }

  // 4. EQUIDAD (0.15 a 0.45)
  let equity = 0.15;
  if (
    text.includes('aa.hh') ||
    text.includes('asentamiento') ||
    text.includes('quebrada') ||
    text.includes('cerro') ||
    text.includes('escalera') ||
    text.includes('motupe') ||
    text.includes('huáscar') ||
    text.includes('jicamarca') ||
    text.includes('ampliación')
  ) {
    equity = 0.46;
  } else if (text.includes('urbanización') || text.includes('zárate')) {
    equity = 0.16;
  }

  // 5. CONVIVENCIA (0.10 a 0.55)
  let convivence = 0.10;
  if (axis === 'espacios_recreativos' || text.includes('parque') || text.includes('losa') || text.includes('juegos') || text.includes('cancha')) {
    convivence = 0.45;
    if (text.includes('club de madres') || text.includes('vóley') || text.includes('básquet') || text.includes('plantones') || text.includes('árbol')) {
      convivence = 0.55;
    }
  }

  // Normalizar vector de alternativas para que la suma relativa sea 1.0
  const rawSum = health + security + scope + equity + convivence;
  const normRatings = {
    salud: Number((health / rawSum).toFixed(4)),
    seguridad: Number((security / rawSum).toFixed(4)),
    alcance: Number((scope / rawSum).toFixed(4)),
    equidad: Number((equity / rawSum).toFixed(4)),
    convivencia: Number((convivence / rawSum).toFixed(4)),
  };

  // Cálculo del puntaje final ponderado AHP: P = sum(w_j * s_ij)
  const score =
    AHP_WEIGHTS.salud * normRatings.salud +
    AHP_WEIGHTS.seguridad * normRatings.seguridad +
    AHP_WEIGHTS.alcance * normRatings.alcance +
    AHP_WEIGHTS.equidad * normRatings.equidad +
    AHP_WEIGHTS.convivencia * normRatings.convivencia;

  const roundedScore = Number(score.toFixed(4));

  // Clasificación objetiva AHP
  let priority: 'alta' | 'media' | 'baja' = 'baja';
  let priority_label = 'Prioridad Normal (Comunitaria)';

  if (roundedScore >= 0.22) {
    priority = 'alta';
    priority_label = 'Prioridad Alta / Crítica';
  } else if (roundedScore >= 0.16) {
    priority = 'media';
    priority_label = 'Prioridad Media (Planificable)';
  }

  return {
    ahp_score: roundedScore,
    priority,
    priority_label,
    criteria_ratings: normRatings,
  };
}
