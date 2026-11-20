/**
 * VAYUWISE AI - Multilingual Localization Dictionary
 * Supports: English (en), Hindi (hi), Kannada (kn), Arabic (ar - RTL), Spanish (es)
 */

import { SupportedLanguage } from '../types/index.js';

export interface TranslationStrings {
  appName: string;
  tagline: string;
  nav: {
    dashboard: string;
    routine: string;
    commute: string;
    indoorAir: string;
    community: string;
    advisories: string;
    onboarding: string;
    profile: string;
  };
  emergency: {
    title: string;
    severityLabel: string;
    officialDisclaimer: string;
    medicalDisclaimer: string;
    actionStepsTitle: string;
    vulnerableGuidanceTitle: string;
    generateButton: string;
    isGenerating: string;
  };
  aqiLabels: {
    good: string;
    satisfactory: string;
    moderate: string;
    poor: string;
    veryPoor: string;
    severe: string;
  };
}

export const LOCALIZATION_DATA: Record<SupportedLanguage, TranslationStrings> = {
  en: {
    appName: 'VAYUWISE AI',
    tagline: 'Breathe Smarter. Live Safer. Build Cleaner Communities.',
    nav: {
      dashboard: 'Air Intelligence',
      routine: 'AI Daily Routine',
      commute: 'Transit Optimizer',
      indoorAir: 'Indoor Quality & DIY',
      community: 'Collective Impact',
      advisories: 'Emergency Center',
      onboarding: 'Family Setup',
      profile: 'Preferences'
    },
    emergency: {
      title: 'GenAI Winter Smog Emergency Advisory Center',
      severityLabel: 'Current Pollution Severity',
      officialDisclaimer: 'Notice: This advisory contains scientific algorithmic and AI guidance from VAYUWISE AI. It does not replace official statutory government alerts or municipal curfew directives.',
      medicalDisclaimer: 'Medical Disclaimer: If experiencing acute chest tightness, wheezing, or difficulty breathing, seek urgent medical attention immediately.',
      actionStepsTitle: 'Immediate Household Protective Measures',
      vulnerableGuidanceTitle: 'Guidance for High-Risk Individuals (Children, Elderly, Asthmatics)',
      generateButton: 'Generate AI Emergency Briefing',
      isGenerating: 'Analyzing meteorological inversion and generating guidance...'
    },
    aqiLabels: {
      good: 'Good',
      satisfactory: 'Satisfactory',
      moderate: 'Moderate',
      poor: 'Poor',
      veryPoor: 'Very Poor',
      severe: 'Severe'
    }
  },
  hi: {
    appName: 'वायुवाइज़ एआई (VAYUWISE AI)',
    tagline: 'समझदारी से सांस लें। सुरक्षित जिएं। स्वच्छ समुदाय बनाएं।',
    nav: {
      dashboard: 'वायु गुणवत्ता स्थिति',
      routine: 'दैनिक दिनचर्या',
      commute: 'कम-प्रदूषण यात्रा',
      indoorAir: 'घर की हवा और उपाय',
      community: 'सामुदायिक कार्य',
      advisories: 'आपातकालीन केंद्र',
      onboarding: 'परिवार सेटअप',
      profile: 'प्राथमिकताएं'
    },
    emergency: {
      title: 'आपातकालीन शीतकालीन स्मॉग परामर्श केंद्र',
      severityLabel: 'वर्तमान प्रदूषण स्तर',
      officialDisclaimer: 'सूचना: यह परामर्श VAYUWISE AI का वैज्ञानिक मार्गदर्शन है। यह आधिकारिक सरकारी चेतावनियों का विकल्प नहीं है।',
      medicalDisclaimer: 'चिकित्सा चेतावनी: सांस लेने में कठिनाई या सीने में जकड़न होने पर तुरंत डॉक्टर से संपर्क करें।',
      actionStepsTitle: 'तत्काल घरेलू सुरक्षा उपाय',
      vulnerableGuidanceTitle: 'संवेदनशील व्यक्तियों (बच्चे, बुजुर्ग, अस्थमा पीड़ित) हेतु निर्देश',
      generateButton: 'एआई आपातकालीन रिपोर्ट बनाएं',
      isGenerating: 'मौसम और प्रदूषण स्तर का विश्लेषण हो रहा है...'
    },
    aqiLabels: {
      good: 'अच्छा',
      satisfactory: 'संतोषजनक',
      moderate: 'मध्यम',
      poor: 'खराब',
      veryPoor: 'बहुत खराब',
      severe: 'गंभीर'
    }
  },
  kn: {
    appName: 'ವಾಯುವೈಸ್ ಎಐ (VAYUWISE AI)',
    tagline: 'ಉಸಿರಾಡಿ ಜಾಣತನದಿಂದ. ಬಾಳಿ ಸುರಕ್ಷಿತವಾಗಿ. ಕಟ್ಟಿ ಸ್ವಚ್ಛ ಸಮುದಾಯ.',
    nav: {
      dashboard: 'ವಾಯು ಗುಣಮಟ್ಟ',
      routine: 'ದೈನಂದಿನ ವೇಳಾಪಟ್ಟಿ',
      commute: 'ಸುಸ್ಥಿರ ಪ್ರಯಾಣ',
      indoorAir: 'ಮನೆಯ ವಾಯು ಶುದ್ಧತೆ',
      community: 'ಸಮುದಾಯದ ಶಕ್ತಿ',
      advisories: 'ತುರ್ತು ಮಾಹಿತಿ ಕೇಂದ್ರ',
      onboarding: 'ಕುಟುಂಬದ ಸೆಟಪ್',
      profile: 'ಆದ್ಯತೆಗಳು'
    },
    emergency: {
      title: 'ತುರ್ತು ಚಳಿಗಾಲದ ಹೊಗೆ ಮತ್ತು ಮಾಲಿನ್ಯ ಸಲಹಾ ಕೇಂದ್ರ',
      severityLabel: 'ಪ್ರಸ್ತುತ ಮಾಲಿನ್ಯ ತೀವ್ರತೆ',
      officialDisclaimer: 'ಸೂಚನೆ: ಇದು VAYUWISE AI ವೈಜ್ಞಾನಿಕ ಮಾರ್ಗದರ್ಶನವಾಗಿದೆ. ಇದು ಅಧಿಕೃತ ಸರ್ಕಾರಿ ನಿರ್ದೇಶನಗಳ ಬದಲಿಯಾಗಿಲ್ಲ.',
      medicalDisclaimer: 'ವೈದ್ಯಕೀಯ ಎಚ್ಚರಿಕೆ: ಉಸಿರಾಟದ ತೊಂದರೆ ಅಥವಾ ಎದೆ ನೋವು ಉಂಟಾದಲ್ಲಿ ತಕ್ಷಣ ವೈದ್ಯರನ್ನು ಭೇಟಿ ಮಾಡಿ.',
      actionStepsTitle: 'ತಕ್ಷಣದ ಕುಟುಂಬ ರಕ್ಷಣಾ ಕ್ರಮಗಳು',
      vulnerableGuidanceTitle: 'ಮಕ್ಕಳು ಮತ್ತು ವೃದ್ಧರ ರಕ್ಷಣೆಗಾಗಿ ಮಾರ್ಗದರ್ಶನ',
      generateButton: 'ಎಐ ತುರ್ತು ವರದಿ ರಚಿಸಿ',
      isGenerating: 'ಮಾಲಿನ್ಯ ಮಟ್ಟವನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...'
    },
    aqiLabels: {
      good: 'ಉತ್ತಮ',
      satisfactory: 'ತೃಪ್ತಿಕರ',
      moderate: 'ಮಧ್ಯಮ',
      poor: 'ಕಳಪೆ',
      veryPoor: 'ಅತ್ಯಂತ ಕಳಪೆ',
      severe: 'ತೀವ್ರ'
    }
  },
  ar: {
    appName: 'فايو-وايز للذكاء الاصطناعي (VAYUWISE AI)',
    tagline: 'تنفس بذكاء. عش بأمان. ابنِ مجتمعات أنظف.',
    nav: {
      dashboard: 'استخبارات الهواء',
      routine: 'الروتين اليومي الذكي',
      commute: 'مخطط التنقل المستدام',
      indoorAir: 'جودة الهواء الداخلي',
      community: 'العمل المجتمعي المشترك',
      advisories: 'مركز الطوارئ',
      onboarding: 'إعداد الأسرة',
      profile: 'التفضيلات'
    },
    emergency: {
      title: 'مركز استشارات طوارئ الضباب الدخاني الشتوي',
      severityLabel: 'مستوى التلوث الحالي',
      officialDisclaimer: 'تنبيه: تحتوي هذه الاستشارة على إرشادات علمية وخوارزمية من VAYUWISE AI ولا تحل محل البلاغات الحكومية الرسمية.',
      medicalDisclaimer: 'إخلاء مسؤولية طبية: إذا شعرت بضيق في الصدر أو صعوبة في التنفس، فاطلب الرعاية الطبية الفورية.',
      actionStepsTitle: 'تدابير وقائية منزلية فورية',
      vulnerableGuidanceTitle: 'إرشادات للفئات الأكثر عرضة للخطر (الأطفال، كبار السن، مرضى الربو)',
      generateButton: 'إنشاء تقرير طوارئ بالذكاء الاصطناعي',
      isGenerating: 'جارٍ تحليل بيانات الانقلاب الحراري وجودة الهواء...'
    },
    aqiLabels: {
      good: 'جيد',
      satisfactory: 'مرضٍ',
      moderate: 'معتدل',
      poor: 'رديء',
      veryPoor: 'رديء جداً',
      severe: 'خطير'
    }
  },
  es: {
    appName: 'VAYUWISE AI',
    tagline: 'Respira con inteligencia. Vive con seguridad. Crea comunidades limpias.',
    nav: {
      dashboard: 'Inteligencia del Aire',
      routine: 'Rutina Diaria IA',
      commute: 'Optimizador de Trayecto',
      indoorAir: 'Calidad Interior y DIY',
      community: 'Impacto Colectivo',
      advisories: 'Centro de Emergencias',
      onboarding: 'Configuración Familiar',
      profile: 'Preferencias'
    },
    emergency: {
      title: 'Centro de Asesoramiento de Emergencia por Smog Invernal',
      severityLabel: 'Gravedad Actual de la Contaminación',
      officialDisclaimer: 'Aviso: Esta asesoría contiene orientación algorítmica de VAYUWISE AI. No reemplaza las alertas oficiales gubernamentales.',
      medicalDisclaimer: 'Aviso Médico: Si experimenta dificultad para respirar u opresión en el pecho, busque atención médica de inmediato.',
      actionStepsTitle: 'Medidas de Protección Inmediata en el Hogar',
      vulnerableGuidanceTitle: 'Guía para Personas Vulnerables (Niños, Adultos Mayores, Asmáticos)',
      generateButton: 'Generar Informe de Emergencia IA',
      isGenerating: 'Analizando condiciones meteorológicas y niveles de contaminación...'
    },
    aqiLabels: {
      good: 'Bueno',
      satisfactory: 'Satisfactorio',
      moderate: 'Moderado',
      poor: 'Deficiente',
      veryPoor: 'Muy Deficiente',
      severe: 'Peligroso'
    }
  }
};

export function isRTLLanguage(lang: SupportedLanguage): boolean {
  return lang === 'ar';
}
