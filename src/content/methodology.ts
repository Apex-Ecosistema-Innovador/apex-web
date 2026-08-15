export interface MethodologyInstrument {
  id: string;
  name: string;
  audience: string;
  purpose: string;
}

export const methodology: MethodologyInstrument[] = [
  {
    id: "matriz-analisis-documental",
    name: "Matriz de análisis documental",
    audience: "Revisión de literatura",
    purpose:
      "Consolidar la revisión sistemática sobre didáctica STEM, deserción y gamificación.",
  },
  {
    id: "entrevista-semiestructurada",
    name: "Entrevista semiestructurada",
    audience: "Docentes del APIT",
    purpose:
      "Caracterizar estrategias metodológicas actuales y percepciones sobre factores de reprobación.",
  },
  {
    id: "rubrica-validacion-expertos",
    name: "Rúbrica de validación por juicio de expertos",
    audience:
      "Panel de expertos (mín. 3, con maestría o doctorado y 3+ años de docencia universitaria)",
    purpose:
      "Evaluar coherencia, viabilidad técnica y pertinencia didáctica del modelo (escala Likert 1-5).",
  },
  {
    id: "guia-grupo-focal",
    name: "Guía de grupo focal",
    audience: "Estudiantes de APIT",
    purpose:
      "Indagar motivación potencial, claridad de las rutas propuestas y percepción de reducción de frustración.",
  },
];
