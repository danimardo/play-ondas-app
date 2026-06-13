import type { WaveCategory } from '../schemas/waveSchema';

export const WAVE_CATEGORIES: WaveCategory[] = [
  {
    id: 'gamma',
    name: 'Gamma',
    frequency: '30–100 Hz',
    color: '#D98A2B',
    shortDescription: 'Las ondas gamma suelen asociarse con estados de alta actividad cognitiva, integración de información y procesamiento mental intenso.',
    recommendedFor: 'Puede utilizarse como sonido de acompañamiento en sesiones de estudio exigente, lectura técnica o tareas que requieran atención sostenida.',
    caution: 'No se aseguran mejoras cognitivas. Su efecto puede variar mucho entre personas.',
  },
  {
    id: 'beta',
    name: 'Beta',
    frequency: '13–30 Hz',
    color: '#CB6A4A',
    shortDescription: 'Las ondas beta suelen relacionarse con estados de alerta, concentración activa y actividad mental orientada a tareas.',
    recommendedFor: 'Puede usarse como apoyo ambiental durante trabajo, estudio, programación, escritura o tareas donde se desee mantener un nivel de activación moderado.',
    caution: 'En algunas personas, sonidos muy estimulantes pueden resultar incómodos o aumentar la sensación de tensión.',
  },
  {
    id: 'alfa',
    name: 'Alfa',
    frequency: '8–12 Hz',
    color: '#8C9A56',
    shortDescription: 'Las ondas alfa suelen asociarse con relajación despierta, calma y estados de atención suave.',
    recommendedFor: 'Puede acompañar lectura ligera, descanso breve, organización de ideas o momentos de concentración tranquila.',
    caution: 'Si el usuario está somnoliento, este tipo de sonido podría favorecer aún más la relajación.',
  },
  {
    id: 'theta-delta',
    name: 'Theta · Delta',
    frequency: '< 8 Hz',
    color: '#6E6CA8',
    shortDescription: 'Las ondas theta y delta se asocian habitualmente con estados de relajación profunda, meditación, somnolencia y sueño.',
    recommendedFor: 'Puede utilizarse como sonido ambiental para relajación profunda, desconexión o preparación para dormir.',
    caution: 'No se recomienda como sonido principal para estudiar o trabajar si el objetivo es mantenerse alerta.',
  },
  {
    id: 'brown-noise',
    name: 'Ruido marrón',
    frequency: '—',
    color: '#9A6B45',
    shortDescription: 'El ruido marrón es un tipo de ruido con mayor presencia de frecuencias graves. Suele percibirse como un sonido profundo y estable.',
    recommendedFor: 'Puede ayudar a algunas personas a enmascarar sonidos externos o reducir la percepción del diálogo interno durante tareas de concentración.',
    caution: 'No tiene un efecto universal. Algunas personas pueden encontrarlo relajante y otras molesto.',
  },
];
