import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { MOCK_REPORTS_25 } from '@/data/mockReports';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Resumen del contexto territorial de San Juan de Lurigancho para la IA
const SJL_CONTEXT_SUMMARY = `
DATOS CLAVE DEL SISTEMA COMUNITARIO "HILANDO VOCES" - SAN JUAN DE LURIGANCHO:
- Total de Reportes Activos: 25 casos ciudadanos verificados.
- Ejes Comunitarios:
  * Alumbrado Comunal: 9 casos (Pasajes escolares oscuros en Canto Grande, Bayóvar, Campoy, Motupe, etc.)
  * Microbasurales: 9 casos (Puntos críticos de desmonte y basura en Las Flores, Huáscar, 10 de Octubre, etc.)
  * Recuperación de Espacios: 7 casos (Lozas y parques comunales en Mariscal Cáceres, Mangomarca, Jicamarca, etc.)
- Faenas Barriales Programadas (5 faenas activas):
  1. #HV-SJL-F2B8K: Sábado 21 Nov 2026, 08:30 AM - Iluminación y luminarias LED en Escalera 14, AA.HH. Cruz de Motupe (Canto Grande). Coordinador: Walter Quispe Condori (984712039). Herramientas: Escalera de tijera 5m, taladro percutor.
  2. #HV-SJL-A1B2C: Sábado 21 Nov 2026, 09:00 AM - Erradicación de basural y siembra de buganvilias en Parque Las Fresas (Campoy). Coordinadora: Elena Mamani Choque (943219876). Herramientas: 3 carretillas, 4 palas.
  3. #HV-SJL-C3D4E: Domingo 22 Nov 2026, 08:00 AM - Refacción de aros de básquet y pintado de losa en AA.HH. Ampliación Huáscar. Coordinador: Marcos Tello Salazar (952109843). Herramientas: Compresora, pintura esmalte.
  4. #HV-SJL-L6M7N: Sábado 28 Nov 2026, 09:00 AM - Despeje de basural en Colegio Los Héroes (10 de Octubre). Coordinador: David Morales Poma (971908234). Herramientas: 2 carretillas, bolsas 140L.
  5. #HV-SJL-R9S0T: Domingo 29 Nov 2026, 08:30 AM - Nivelación de tierra y juegos para niños en AA.HH. Quebrada Alta (Jicamarca). Coordinadora: Silvia Ccallo Cárdenas (964321098). Herramientas: 4 picos, 3 palas.
- Red de Voluntarios: 18 vecinos coordinadores registrados con herramientas propias (escaleras, carretillas, taladros, palas, compresoras).
- Protocolo de Seguridad (Ley N° 29733): No se almacenan números de DNI en texto plano, se usa hash SHA-256 en memoria; el uso de teléfonos de vecinos es estrictamente para coordinación comunitaria de faenas.
`;

export async function POST(req: NextRequest) {
  try {
    const { messages, userRole, userName } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere un historial de mensajes válido.' },
        { status: 400 }
      );
    }

    const lastMessage = messages[messages.length - 1]?.content || '';

    const systemInstruction = `
Eres Warmicha 🦉🧵, la mascota y copiloto comunitaria oficial del panel de lideresas de "Hilando Voces" en San Juan de Lurigancho (SJL), Lima, Perú.
Eres una lechuza vigía sabia, afectuosa, enérgica y altamente organizada. Vistes con orgullo una chalina con los colores comunitarios (magenta #d30684 y ámbar #E4981E).
Te estás comunicando con ${userName || 'Lideresa'}, quien tiene el rol de ${userRole || 'Lideresa Territorial SJL'}.

Tu rol es:
1. Responder dudas precisas sobre los 25 reportes territoriales de San Juan de Lurigancho, sus ubicaciones (Canto Grande, Bayóvar, Campoy, Zárate, Mariscal Cáceres, Huáscar, Jicamarca, Mangomarca, Las Flores).
2. Informar sobre las faenas comunitarias programadas, fechas, puntos de encuentro, coordinadores y herramientas necesarias.
3. Ayudar a identificar qué vecinos voluntarios tienen las herramientas adecuadas para cada faena barrial.
4. Dar consejos tácticos de mediación comunitaria, autogestión de recursos y protocolos de seguridad (Ley N° 29733).

Reglas de respuesta:
- Sé concisa, ejecutiva y cálida (máximo 2 a 3 párrafos cortos o listas con viñetas claras).
- Usa emojis con moderación y sentido comunitario (🦉, 🧵, ⚡, 🧹, 📅, 🤝).
- No inventes reportes que no existan; básate estrictamente en los datos provistos en el resumen territorial.
- Si te hacen preguntas fuera de contexto comunitario o de San Juan de Lurigancho, recuérdales amablemente que tu vigilia está dedicada a las comunidades de SJL.
`;

    // Intentar responder con Gemini 3.8 Flash
    if (apiKey) {
      try {
        const fullPrompt = `
${systemInstruction}

CONTEXTO TERRITORIAL DEL SISTEMA:
${SJL_CONTEXT_SUMMARY}

HISTORIAL DE CONVERSACIÓN RECIENTE:
${messages
  .slice(-4)
  .map((m: any) => `${m.role === 'user' ? 'Lideresa' : 'Warmicha'}: ${m.content}`)
  .join('\n')}

Pregunta actual de la Lideresa:
"${lastMessage}"

Respuesta de Warmicha:`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: fullPrompt,
        });

        const reply = response.text || '';
        if (reply.trim()) {
          return NextResponse.json({ reply: reply.trim() });
        }
      } catch (geminiError) {
        console.warn('Gemini API temporalmente inaccesible en chatbot, aplicando respuesta contextualizada:', geminiError);
      }
    }

    // Fallback contextualizado e inteligente si la API no responde
    const fallbackReply = generateWarmichaFallback(lastMessage);
    return NextResponse.json({ reply: fallbackReply });
  } catch (err: any) {
    console.error('Error en POST /api/admin/chat:', err);
    return NextResponse.json(
      { reply: '¡Hola vecina! 🦉 Tuve una pequeña interferencia en la señal comunitaria. Pero recuerda que tenemos 5 faenas agendadas y 25 casos activos en SJL. ¿En qué te puedo apoyar ahora?' },
      { status: 200 }
    );
  }
}

function generateWarmichaFallback(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('faena') || q.includes('agenda') || q.includes('calendario') || q.includes('fin de semana')) {
    return `¡Claro que sí, lideresa! 🦉 Tenemos **5 faenas comunitarias programadas** en noviembre para San Juan de Lurigancho:\n\n` +
      `📅 **Sábado 21 Nov (08:30 AM):** Luminarias en Escalera 14, Cruz de Motupe (Canto Grande). Coordina: Walter Quispe (984712039).\n` +
      `📅 **Sábado 21 Nov (09:00 AM):** Erradicación de basural en Parque Las Fresas (Campoy). Coordina: Elena Mamani (943219876).\n` +
      `📅 **Domingo 22 Nov (08:00 AM):** Pintado de losa y aros en Huáscar. Coordina: Marcos Tello (952109843).\n` +
      `📅 **Sábado 28 Nov (09:00 AM):** Limpieza en 10 de Octubre. Coordina: David Morales (971908234).\n` +
      `📅 **Domingo 29 Nov (08:30 AM):** Recuperación de juegos en Jicamarca. Coordina: Silvia Ccallo (964321098).\n\n` +
      `¿Deseas emitir la Ficha Técnica oficial de alguna de ellas?`;
  }

  if (q.includes('canto grande') || q.includes('prioridad') || q.includes('alta') || q.includes('urgente')) {
    return `En **Canto Grande** tenemos casos críticos identificados por el Copiloto Gemini ⚡:\n\n` +
      `1. **#HV-SJL-K7M9X:** 3 postes con focos quemados en Pasaje Los Gladiolos (Paradero 12). Ruta escolar de alumnas del Fe y Alegría 32 con riesgo nocturno. Coordina: Doris Quispe.\n` +
      `2. **#HV-SJL-F2B8K:** Escalera comunal oscura en Cruz de Motupe (Faena lista para el 21 Nov).\n` +
      `3. **#HV-SJL-N7P8Q:** Acumulación de basura en Av. San Martín cruce con Santa Rosa.\n\n` +
      `Recomiendo priorizar la entrega de reflectores LED para la ruta escolar de Canto Grande.`;
  }

  if (q.includes('herramienta') || q.includes('escalera') || q.includes('voluntario') || q.includes('bayóvar')) {
    return `¡En la red vecinal contamos con **18 voluntarios con herramientas activas**! 🛠️\n\n` +
      `• **Para Alumbrado/Electricidad:** Walter Quispe (Canto Grande) tiene escalera de 5m y taladro percutor; Sonia Huanca (Bayóvar) tiene escalera telescópica 7m y multímetro.\n` +
      `• **Para Basurales y Escombros:** Carlos Paucar (Las Flores) y Elena Mamani (Campoy) cuentan con 5 carretillas y 7 palas tipo cuchara.\n` +
      `• **Para Lozas y Parques:** Marcos Tello (Huáscar) tiene compresora y rodillos.\n\n` +
      `Todos tienen botón directo de WhatsApp en la pestaña **Red de Vecinos**.`;
  }

  return `¡Hola Lideresa! 🦉 Soy **Warmicha**, tu lechuza vigía comunitaria en San Juan de Lurigancho.\n\n` +
    `Actualmente tenemos **25 reportes ciudadanos**, 5 faenas en camino y 18 vecinos con herramientas listos para trabajar. Puedes preguntarme por fechas de faenas, casos urgentes por comuna, o qué vecino tiene palas y escaleras cerca. ¿Por dónde empezamos hoy? 🧵✨`;
}
