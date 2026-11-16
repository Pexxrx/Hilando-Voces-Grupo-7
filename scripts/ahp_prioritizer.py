"""
Priorización Multicriterio AHP (Analytic Hierarchy Process) - Hilando Voces (Grupo 7)
Implementación oficial de Saaty para la priorización científica de problemáticas barriales
en San Juan de Lurigancho (SJL), Lima, Perú.
"""

import numpy as np
import json
from typing import List, Dict, Any

# 1. Escala de Saaty y Valores de Referencia del Índice Aleatorio (RI)
SAATY_RI = {
    1: 0.00, 2: 0.00, 3: 0.58, 4: 0.90, 5: 1.12,
    6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49
}

# 2. Criterios de Impacto Social definidos por el equipo Hilando Voces:
CRITERIA = [
    {"id": "salud", "name": "Mejora de la salud física y mental", "abbr": "Salud"},
    {"id": "seguridad", "name": "Mejora de la seguridad ciudadana", "abbr": "Seguridad"},
    {"id": "alcance", "name": "Alcance de los beneficios en la población", "abbr": "Alcance"},
    {"id": "equidad", "name": "Equidad en la distribución de los beneficios", "abbr": "Equidad"},
    {"id": "convivencia", "name": "Mejora de la convivencia y uso comunitario", "abbr": "Convivencia"}
]

# 3. Matriz de comparación de pares de criterios (Juicios del Grupo 7):
# Filas y columnas: [Salud, Seguridad, Alcance, Equidad, Convivencia]
CRITERIA_PAIRWISE_MATRIX = np.array([
    [1.0,     1.0/3.0, 3.0,     2.0,     4.0],      # Salud
    [3.0,     1.0,     5.0,     4.0,     6.0],      # Seguridad (Criterio dominante en SJL)
    [1.0/3.0, 1.0/5.0, 1.0,     1.0/2.0, 2.0],      # Alcance
    [1.0/2.0, 1.0/4.0, 2.0,     1.0,     3.0],      # Equidad
    [1.0/4.0, 1.0/6.0, 1.0/2.0, 1.0/3.0, 1.0]       # Convivencia
], dtype=float)

def calculate_ahp_weights(matrix: np.ndarray) -> Dict[str, Any]:
    """
    Calcula el vector de prioridades (pesos) y la razón de consistencia (CR) de Saaty.
    """
    n = matrix.shape[0]
    
    # 1. Normalización por columnas
    col_sums = matrix.sum(axis=0)
    norm_matrix = matrix / col_sums
    
    # 2. Vector de prioridad (promedio de las filas de la matriz normalizada)
    weights = norm_matrix.mean(axis=1)
    
    # 3. Cálculo de Consistencia (A * w)
    weighted_sum_vector = np.dot(matrix, weights)
    lambda_values = weighted_sum_vector / weights
    lambda_max = float(np.mean(lambda_values))
    
    # 4. Índice de Consistencia (CI) y Razón de Consistencia (CR)
    ci = (lambda_max - n) / (n - 1) if n > 1 else 0.0
    ri = SAATY_RI.get(n, 1.12)
    cr = ci / ri if ri > 0 else 0.0
    
    is_consistent = cr < 0.10
    
    return {
        "weights": weights.tolist(),
        "lambda_max": lambda_max,
        "ci": ci,
        "ri": ri,
        "cr": cr,
        "is_consistent": is_consistent
    }

def score_incident_ahp(description: str, axis: str, reference: str, weights: List[float]) -> Dict[str, Any]:
    """
    Evalúa una incidencia comunitaria de San Juan de Lurigancho contra los 5 criterios de AHP.
    Retorna el vector de ratings y el score AHP global (0 a 1).
    """
    text = (description + " " + reference).lower()
    
    # Puntajes relativos por criterio basados en las características del reporte (0 a 1 normalizado)
    # 1. SALUD: Riesgo de infecciones, acumulación de basura, olores nauseabundos, roedores, nidos/hospitales
    health_score = 0.10
    if "basura" in text or "desmonte" in text or "basural" in text or "roedor" in text:
        health_score = 0.35
        if "nido" in text or "colegio" in text or "salud" in text or "niños" in text or "mercado" in text:
            health_score = 0.50
    elif "llanta" in text or "quema" in text or "tóxico" in text or "humo" in text:
        health_score = 0.45
    elif axis == "microbasurales":
        health_score = 0.30

    # 2. SEGURIDAD: Oscuridad, asaltos, mototaxis sin placa, cerros, escaleras, acoso nocturno
    sec_score = 0.10
    if axis == "alumbrado" or "poste" in text or "luz" in text or "foco" in text:
        sec_score = 0.30
        if "cerro" in text or "escalera" in text or "pasaje" in text or "escolar" in text or "colegio" in text:
            sec_score = 0.45
            if "asalto" in text or "robo" in text or "arrebato" in text or "mototaxi" in text or "peligro" in text:
                sec_score = 0.55
    elif "quema" in text or "delincuencia" in text:
        sec_score = 0.25

    # 3. ALCANCE: Cantidad de familias beneficiadas, vías principales vs pasajes secundarios
    scope_score = 0.15
    if "avenida" in text or "paradero" in text or "colegio" in text or "mercado" in text or "canto grande" in text:
        scope_score = 0.40
    elif "pasaje" in text or "callejón" in text:
        scope_score = 0.20

    # 4. EQUIDAD: Zonas altas vulnerables, asentamientos humanos, laderas, escaleras sin servicios
    equity_score = 0.15
    if "aa.hh" in text or "asentamiento" in text or "quebrada" in text or "cerro" in text or "escalera" in text or "motupe" in text or "huáscar" in text or "jicamarca" in text:
        equity_score = 0.45
    elif "urbanización" in text or "zarate" in text:
        equity_score = 0.15

    # 5. CONVIVENCIA: Lozas, parques infantiles, deportes, niños, madres, áreas verdes
    conv_score = 0.10
    if axis == "espacios_recreativos" or "parque" in text or "losa" in text or "juegos" in text or "niños" in text:
        conv_score = 0.45
        if "club de madres" in text or "vóley" in text or "básquet" in text or "plantones" in text:
            conv_score = 0.55

    # Normalizar scores de criterios para que sumen a una proporción coherente
    raw_vector = [health_score, sec_score, scope_score, equity_score, conv_score]
    norm_vector = [v / sum(raw_vector) for v in raw_vector]

    # Puntaje AHP = Sumatoria del producto de pesos de criterios por ratings de la alternativa
    ahp_score = sum(w * s for w, s in zip(weights, norm_vector))

    # Clasificación objetiva Saaty de acuerdo al puntaje
    if ahp_score >= 0.23:
        priority = "alta"
        priority_label = "Prioridad Alta / Crítica"
    elif ahp_score >= 0.16:
        priority = "media"
        priority_label = "Prioridad Media / Planificable"
    else:
        priority = "baja"
        priority_label = "Prioridad Normal / Comunitaria"

    return {
        "ahp_score": round(ahp_score, 4),
        "priority": priority,
        "priority_label": priority_label,
        "criteria_ratings": {
            "salud": round(norm_vector[0], 4),
            "seguridad": round(norm_vector[1], 4),
            "alcance": round(norm_vector[2], 4),
            "equidad": round(norm_vector[3], 4),
            "convivencia": round(norm_vector[4], 4)
        }
    }

def main():
    print("=============================================================")
    print("   HILANDO VOCES (GRUPO 7) - MOTOR DE PRIORIZACIÓN AHP")
    print("=============================================================")
    
    ahp_result = calculate_ahp_weights(CRITERIA_PAIRWISE_MATRIX)
    weights = ahp_result["weights"]
    
    print("\n1. Pesos de los Criterios de Impacto Social (Vector de Prioridades):")
    for crit, w in zip(CRITERIA, weights):
        print(f"   • {crit['abbr']:<12}: {w*100:5.2f}% ({crit['name']})")
        
    print(f"\n2. Verificación de Consistencia Matemática:")
    print(f"   • Lambda Max (λmax): {ahp_result['lambda_max']:.4f}")
    print(f"   • Índice de Consistencia (CI): {ahp_result['ci']:.4f}")
    print(f"   • Relación de Consistencia (CR): {ahp_result['cr']:.4f} (Meta: < 0.10)")
    print(f"   • Dictamen: {'MATEMÁTICAMENTE CONSISTENTE ✅' if ahp_result['is_consistent'] else 'INCONSISTENTE ❌'}")
    
    # Casos de prueba emblemáticos de SJL
    test_cases = [
        {
            "id": "rep-001",
            "name": "Pasaje peatonal oscuro y sin luminarias en cerros de Motupe",
            "axis": "alumbrado",
            "ref": "Escalera 14, AA.HH. Cruz de Motupe, Canto Grande cerros"
        },
        {
            "id": "rep-002",
            "name": "Luminarias dañadas en Av. Principal Canto Grande",
            "axis": "alumbrado",
            "ref": "Av. Canto Grande Paradero 12 frente a mercado"
        },
        {
            "id": "rep-003",
            "name": "Microbasural frente a acceso de colegio nido Gotitas de Amor",
            "axis": "microbasurales",
            "ref": "Jr. Chinchaysuyo con Av. Las Flores frente a nido escolar"
        },
        {
            "id": "rep-004",
            "name": "Parque comunal abandonado sin juegos ni mantenimiento",
            "axis": "espacios_recreativos",
            "ref": "Parque infantil El Bosque en Urb. Campoy"
        },
        {
            "id": "rep-005",
            "name": "Acumulación de desmonte en esquina comercial",
            "axis": "microbasurales",
            "ref": "Cruce Av. Canto Grande con Jr. Los Rosales"
        }
    ]
    
    print("\n3. Ranking AHP Resultante:")
    scored = []
    for tc in test_cases:
        res = score_incident_ahp(tc["name"], tc["axis"], tc["ref"], weights)
        scored.append({**tc, **res})
        
    scored.sort(key=lambda x: x["ahp_score"], reverse=True)
    
    for rank, item in enumerate(scored, 1):
        print(f"   #{rank} [Score: {item['ahp_score']:.4f}] - {item['priority_label']}")
        print(f"      Problemática: {item['name']}")
        print(f"      Criterios -> Seg: {item['criteria_ratings']['seguridad']:.2f} | Sal: {item['criteria_ratings']['salud']:.2f} | Equ: {item['criteria_ratings']['equidad']:.2f}")

if __name__ == "__main__":
    main()
