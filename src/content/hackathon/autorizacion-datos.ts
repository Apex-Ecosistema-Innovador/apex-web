import type { DocumentoLegal } from "./documento-legal";

export const autorizacionesDatos: Record<string, DocumentoLegal> = {
  "1.0": {
    version: "1.0",
    titulo: "Autorización de tratamiento de datos personales",
    borrador: true,
    secciones: [
      {
        titulo: "1. Marco",
        parrafos: [
          "El tratamiento de tus datos personales se rige por la Ley 1581 de 2012 y el Decreto 1074 de 2015 (Habeas Data) de Colombia.",
        ],
      },
      {
        titulo: "2. Responsable",
        parrafos: [
          "Politécnico Colombiano Jaime Isaza Cadavid, a través del proyecto APEX. El canal de contacto para ejercer tus derechos lo definirá el comité organizador antes de abrir las inscripciones.",
        ],
      },
      {
        titulo: "3. Datos que recolectamos",
        parrafos: [
          "Nombre, correo institucional, institución, programa académico y semestre. De forma opcional: usuario de GitHub, perfil de LinkedIn y portafolio.",
          "No solicitamos tu documento de identidad para inscribirte.",
        ],
      },
      {
        titulo: "4. Para qué los usamos",
        parrafos: [
          "Verificar tu correo, gestionar tu inscripción y tu participación, comunicarnos contigo sobre el evento, y evaluar y publicar resultados.",
        ],
      },
      {
        titulo: "5. Publicación de tu imagen",
        parrafos: [
          "La publicación de tu imagen en resultados públicos y redes sociales de APEX es una autorización aparte y opcional. Puedes participar y aparecer en el ranking sin autorizarla.",
        ],
      },
      {
        titulo: "6. Tus derechos",
        parrafos: [
          "Puedes conocer, actualizar, rectificar y solicitar la supresión de tus datos, y revocar esta autorización, escribiendo al canal de contacto del evento.",
        ],
      },
      {
        titulo: "7. Conservación",
        parrafos: [
          "Conservamos los datos del evento durante 3 años después de su cierre, salvo que solicites su supresión antes.",
        ],
      },
    ],
  },
};
