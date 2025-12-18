/**
 * Configuration Manager - Centralized app configuration
 * Handles settings, feature flags, and environment-specific config
 */

// ============================================
// CLINICAL CONTEXT FILTERS
// ============================================

// Specialty configurations with specific vocabulary and analysis focus
export const SPECIALTIES = {
    ent: {
        id: 'ent',
        name: 'ENT (Ear, Nose, Throat)',
        icon: '👂',
        reportTypes: ['audiometry', 'tympanometry', 'laryngoscopy', 'nasendoscopy', 'ct_sinus', 'ct_temporal', 'mri_iac', 'sleep_study'],
        focusAreas: ['ear', 'nose', 'throat', 'sinus', 'larynx', 'pharynx', 'tympanic', 'cochlea', 'vestibular']
    },
    dental: {
        id: 'dental',
        name: 'Dental / Oral Health',
        icon: '🦷',
        reportTypes: ['panoramic_xray', 'periapical_xray', 'cbct', 'periodontal_chart', 'intraoral_photo', 'dental_exam'],
        focusAreas: ['teeth', 'gums', 'jaw', 'mandible', 'maxilla', 'tmj', 'occlusion', 'periodontal']
    },
    dermatology: {
        id: 'dermatology',
        name: 'Dermatology / Skin',
        icon: '🔬',
        reportTypes: ['dermoscopy', 'skin_biopsy', 'patch_test', 'skin_photo', 'wound_assessment', 'mole_mapping'],
        focusAreas: ['skin', 'lesion', 'rash', 'melanoma', 'nevus', 'dermatitis', 'wound', 'ulcer']
    },
    pediatrics: {
        id: 'pediatrics',
        name: 'Pediatrics (Head-to-Toe)',
        icon: '👶',
        reportTypes: ['well_child_exam', 'growth_chart', 'developmental_screen', 'immunization_record', 'newborn_exam', 'school_physical'],
        focusAreas: ['growth', 'development', 'milestones', 'vaccination', 'fontanelle', 'reflexes', 'feeding', 'behavior'],
        subSystems: {
            head: ['fontanelle', 'skull_shape', 'head_circumference', 'craniosynostosis', 'plagiocephaly', 'scalp'],
            eyes: ['red_reflex', 'strabismus', 'nystagmus', 'conjunctivitis', 'blocked_tear_duct', 'pupil_response'],
            ears: ['otitis_media', 'ear_canal', 'hearing_screen', 'ear_position', 'preauricular_pit', 'cerumen'],
            nose: ['nasal_patency', 'nasal_discharge', 'choanal_atresia', 'congestion'],
            mouth: ['cleft_lip', 'cleft_palate', 'tongue_tie', 'thrush', 'teething', 'tooth_decay', 'tonsils'],
            neck: ['torticollis', 'lymphadenopathy', 'thyroid', 'cystic_hygroma', 'branchial_cleft'],
            chest: ['heart_murmur', 'breath_sounds', 'chest_shape', 'retractions', 'wheezing', 'stridor'],
            abdomen: ['umbilical_hernia', 'inguinal_hernia', 'hepatomegaly', 'splenomegaly', 'constipation', 'colic'],
            genitourinary: ['hypospadias', 'cryptorchidism', 'hydrocele', 'labial_adhesion', 'diaper_rash', 'phimosis'],
            spine: ['sacral_dimple', 'scoliosis', 'kyphosis', 'spina_bifida', 'tethered_cord'],
            extremities: ['hip_dysplasia', 'clubfoot', 'polydactyly', 'syndactyly', 'limb_length', 'gait'],
            skin: ['birthmarks', 'hemangioma', 'mongolian_spot', 'eczema', 'diaper_dermatitis', 'jaundice', 'milia'],
            neuro: ['tone', 'reflexes', 'moro_reflex', 'grasp_reflex', 'developmental_delay', 'seizures', 'head_lag']
        }
    },
    womens_health: {
        id: 'womens_health',
        name: "Women's Health & Fertility",
        icon: '🩷',
        reportTypes: ['pelvic_exam', 'pap_smear', 'mammogram', 'pelvic_ultrasound', 'transvaginal_ultrasound', 'hsg', 'fertility_labs', 'prenatal_visit'],
        focusAreas: ['gynecology', 'obstetrics', 'fertility', 'menstrual', 'pregnancy', 'breast', 'ovarian', 'uterine'],
        subCategories: {
            gynecology: ['pelvic_exam', 'pap_smear', 'colposcopy', 'cervical', 'vaginal', 'vulvar', 'sti_screening'],
            breast_health: ['mammogram', 'breast_ultrasound', 'breast_exam', 'lump', 'nipple_discharge', 'mastalgia'],
            menstrual: ['dysmenorrhea', 'amenorrhea', 'menorrhagia', 'oligomenorrhea', 'pms', 'pmdd', 'cycle_tracking'],
            fertility: ['ovulation', 'amh', 'fsh', 'lh', 'estradiol', 'progesterone', 'sperm_analysis', 'hsg', 'ivf', 'iui', 'egg_reserve'],
            pregnancy: ['prenatal', 'trimester', 'fetal_heart', 'ultrasound', 'gestational_age', 'fundal_height', 'fetal_movement'],
            menopause: ['perimenopause', 'hot_flashes', 'hrt', 'bone_density', 'vaginal_atrophy', 'hormone_levels'],
            conditions: ['pcos', 'endometriosis', 'fibroids', 'ovarian_cyst', 'pid', 'vaginitis', 'cervicitis', 'prolapse']
        }
    },
    vitals: {
        id: 'vitals',
        name: 'Vitals & General',
        icon: '💓',
        reportTypes: ['vital_signs', 'ecg', 'blood_pressure', 'pulse_oximetry', 'temperature', 'bmi_assessment'],
        focusAreas: ['heart_rate', 'blood_pressure', 'temperature', 'respiratory_rate', 'oxygen', 'weight', 'bmi']
    },
    cardiology: {
        id: 'cardiology',
        name: 'Cardiology',
        icon: '❤️',
        reportTypes: ['ecg_12lead', 'echocardiogram', 'holter', 'stress_test', 'ct_angio', 'cardiac_mri'],
        focusAreas: ['heart', 'cardiac', 'arrhythmia', 'murmur', 'valve', 'coronary', 'ejection_fraction']
    },
    radiology: {
        id: 'radiology',
        name: 'Radiology / Imaging',
        icon: '📷',
        reportTypes: ['xray', 'ct_scan', 'mri', 'ultrasound', 'pet_scan', 'mammogram', 'dexa_scan'],
        focusAreas: ['opacity', 'mass', 'fracture', 'lesion', 'nodule', 'effusion', 'consolidation']
    },
    gastro: {
        id: 'gastro',
        name: 'Gastroenterology',
        icon: '🔍',
        reportTypes: ['endoscopy', 'colonoscopy', 'ultrasound_abdomen', 'ct_abdomen', 'liver_function', 'h_pylori'],
        focusAreas: ['stomach', 'intestine', 'liver', 'pancreas', 'gallbladder', 'colon', 'esophagus']
    }
};

// Age group configurations for age-appropriate analysis
export const AGE_GROUPS = {
    neonate: {
        id: 'neonate',
        name: 'Neonate (0-28 days)',
        range: [0, 0.08], // years
        considerations: ['neonatal_vitals', 'congenital', 'birth_related', 'feeding']
    },
    infant: {
        id: 'infant',
        name: 'Infant (1-12 months)',
        range: [0.08, 1],
        considerations: ['developmental_milestones', 'vaccination', 'growth', 'feeding']
    },
    toddler: {
        id: 'toddler',
        name: 'Toddler (1-3 years)',
        range: [1, 3],
        considerations: ['developmental', 'behavioral', 'growth', 'immunization']
    },
    child: {
        id: 'child',
        name: 'Child (3-12 years)',
        range: [3, 12],
        considerations: ['growth', 'school_health', 'behavioral', 'dental_development']
    },
    adolescent: {
        id: 'adolescent',
        name: 'Adolescent (12-18 years)',
        range: [12, 18],
        considerations: ['puberty', 'mental_health', 'sports_injuries', 'acne']
    },
    adult: {
        id: 'adult',
        name: 'Adult (18-65 years)',
        range: [18, 65],
        considerations: ['lifestyle', 'chronic_disease', 'screening', 'occupational']
    },
    elderly: {
        id: 'elderly',
        name: 'Elderly (65+ years)',
        range: [65, 150],
        considerations: ['geriatric', 'polypharmacy', 'fall_risk', 'cognitive', 'hearing_loss']
    }
};

// Report type configurations with specific analysis parameters
export const REPORT_TYPES = {
    // ENT Reports
    audiometry: { name: 'Audiometry', specialty: 'ent', dataType: 'waveform', icon: '📊' },
    tympanometry: { name: 'Tympanometry', specialty: 'ent', dataType: 'waveform', icon: '📈' },
    laryngoscopy: { name: 'Laryngoscopy', specialty: 'ent', dataType: 'video', icon: '🎥' },
    nasendoscopy: { name: 'Nasendoscopy', specialty: 'ent', dataType: 'video', icon: '🎥' },
    ct_sinus: { name: 'CT Sinus', specialty: 'ent', dataType: 'image', icon: '🖼️' },
    ct_temporal: { name: 'CT Temporal Bone', specialty: 'ent', dataType: 'image', icon: '🖼️' },
    
    // Dental Reports
    panoramic_xray: { name: 'Panoramic X-Ray (OPG)', specialty: 'dental', dataType: 'image', icon: '🖼️' },
    periapical_xray: { name: 'Periapical X-Ray', specialty: 'dental', dataType: 'image', icon: '🖼️' },
    cbct: { name: 'CBCT (3D Dental)', specialty: 'dental', dataType: 'image', icon: '🖼️' },
    periodontal_chart: { name: 'Periodontal Chart', specialty: 'dental', dataType: 'structured', icon: '📋' },
    intraoral_photo: { name: 'Intraoral Photo', specialty: 'dental', dataType: 'image', icon: '📸' },
    
    // Dermatology Reports
    dermoscopy: { name: 'Dermoscopy', specialty: 'dermatology', dataType: 'image', icon: '🔬' },
    skin_biopsy: { name: 'Skin Biopsy Report', specialty: 'dermatology', dataType: 'text', icon: '📄' },
    skin_photo: { name: 'Clinical Skin Photo', specialty: 'dermatology', dataType: 'image', icon: '📸' },
    wound_assessment: { name: 'Wound Assessment', specialty: 'dermatology', dataType: 'combined', icon: '🩹' },
    
    // Vitals Reports
    vital_signs: { name: 'Vital Signs', specialty: 'vitals', dataType: 'structured', icon: '💓' },
    ecg: { name: 'ECG/EKG', specialty: 'vitals', dataType: 'waveform', icon: '📈' },
    blood_pressure: { name: 'Blood Pressure Log', specialty: 'vitals', dataType: 'structured', icon: '🩺' },
    
    // Cardiology Reports
    ecg_12lead: { name: '12-Lead ECG', specialty: 'cardiology', dataType: 'waveform', icon: '📈' },
    echocardiogram: { name: 'Echocardiogram', specialty: 'cardiology', dataType: 'video', icon: '🎥' },
    holter: { name: 'Holter Monitor', specialty: 'cardiology', dataType: 'waveform', icon: '📊' },
    
    // Radiology Reports
    xray: { name: 'X-Ray', specialty: 'radiology', dataType: 'image', icon: '🖼️' },
    ct_scan: { name: 'CT Scan', specialty: 'radiology', dataType: 'image', icon: '🖼️' },
    mri: { name: 'MRI', specialty: 'radiology', dataType: 'image', icon: '🖼️' },
    ultrasound: { name: 'Ultrasound', specialty: 'radiology', dataType: 'image', icon: '🖼️' },
    ultrasound_abdomen: { name: 'Ultrasound Abdomen', specialty: 'gastro', dataType: 'image', icon: '🖼️' },
    
    // Gastro Reports
    endoscopy: { name: 'Endoscopy', specialty: 'gastro', dataType: 'video', icon: '🎥' },
    colonoscopy: { name: 'Colonoscopy', specialty: 'gastro', dataType: 'video', icon: '🎥' },
    
    // Pediatric Reports
    well_child_exam: { name: 'Well Child Exam', specialty: 'pediatrics', dataType: 'text', icon: '👶' },
    growth_chart: { name: 'Growth Chart', specialty: 'pediatrics', dataType: 'structured', icon: '📈' },
    developmental_screen: { name: 'Developmental Screening', specialty: 'pediatrics', dataType: 'structured', icon: '🧩' },
    immunization_record: { name: 'Immunization Record', specialty: 'pediatrics', dataType: 'structured', icon: '💉' },
    newborn_exam: { name: 'Newborn Examination', specialty: 'pediatrics', dataType: 'text', icon: '🍼' },
    school_physical: { name: 'School Physical', specialty: 'pediatrics', dataType: 'text', icon: '🏫' },
    pediatric_neuro: { name: 'Pediatric Neuro Exam', specialty: 'pediatrics', dataType: 'text', icon: '🧠' },
    
    // Women's Health Reports
    pelvic_exam: { name: 'Pelvic Examination', specialty: 'womens_health', dataType: 'text', icon: '🩷' },
    pap_smear: { name: 'Pap Smear / Cervical Screen', specialty: 'womens_health', dataType: 'text', icon: '🔬' },
    mammogram: { name: 'Mammogram', specialty: 'womens_health', dataType: 'image', icon: '🖼️' },
    pelvic_ultrasound: { name: 'Pelvic Ultrasound', specialty: 'womens_health', dataType: 'image', icon: '📷' },
    transvaginal_ultrasound: { name: 'Transvaginal Ultrasound', specialty: 'womens_health', dataType: 'image', icon: '📷' },
    hsg: { name: 'HSG (Hysterosalpingogram)', specialty: 'womens_health', dataType: 'image', icon: '🖼️' },
    fertility_labs: { name: 'Fertility Lab Results', specialty: 'womens_health', dataType: 'structured', icon: '🧪' },
    prenatal_visit: { name: 'Prenatal Visit', specialty: 'womens_health', dataType: 'text', icon: '🤰' },
    fetal_ultrasound: { name: 'Fetal Ultrasound', specialty: 'womens_health', dataType: 'image', icon: '👶' },
    breast_ultrasound: { name: 'Breast Ultrasound', specialty: 'womens_health', dataType: 'image', icon: '📷' },
    colposcopy: { name: 'Colposcopy', specialty: 'womens_health', dataType: 'image', icon: '🔬' },
    
    // General
    clinical_notes: { name: 'Clinical Notes', specialty: 'general', dataType: 'text', icon: '📝' },
    lab_results: { name: 'Lab Results', specialty: 'general', dataType: 'structured', icon: '🧪' },
    prescription: { name: 'Prescription', specialty: 'general', dataType: 'text', icon: '💊' }
};

// Gender options for demographic context
export const GENDER_OPTIONS = {
    male: { id: 'male', name: 'Male', icon: '♂️' },
    female: { id: 'female', name: 'Female', icon: '♀️' },
    other: { id: 'other', name: 'Other', icon: '⚧️' },
    not_specified: { id: 'not_specified', name: 'Not Specified', icon: '👤' }
};

// ============================================
// MODEL CONFIGURATIONS
// ============================================

// Model configurations with metadata
export const MODELS = {
    textClassification: {
        id: 'Xenova/distilbert-base-uncased-finetuned-sst-2-english',
        name: 'Text Classifier',
        task: 'sentiment-analysis',
        size: 250 * 1024 * 1024, // 250MB
        description: 'General text classification and sentiment analysis',
        priority: 1, // Load first
        required: true
    },
    medicalNER: {
        id: 'Xenova/bert-base-NER',
        name: 'Medical NER',
        task: 'token-classification',
        size: 420 * 1024 * 1024, // 420MB
        description: 'Named entity recognition for medical terms',
        priority: 2,
        required: false
    },
    textGeneration: {
        id: 'Xenova/flan-t5-small',
        name: 'Text Generator',
        task: 'text2text-generation',
        size: 300 * 1024 * 1024, // 300MB
        description: 'Generate medical summaries and insights',
        priority: 3,
        required: false
    },
    imageClassification: {
        id: 'Xenova/vit-base-patch16-224',
        name: 'Image Classifier',
        task: 'image-classification',
        size: 350 * 1024 * 1024, // 350MB
        description: 'Analyze medical images',
        priority: 4,
        required: false
    }
};

// ============================================
// SPECIALTY-SPECIFIC MEDICAL VOCABULARY
// ============================================

// Medical vocabulary for enhanced analysis
export const MEDICAL_VOCABULARY = {
    ent: [
        'sinusitis', 'rhinitis', 'otitis', 'tonsillitis', 'pharyngitis',
        'laryngitis', 'adenoid', 'polyp', 'septum', 'deviated', 'turbinate',
        'eustachian', 'tympanic', 'cochlea', 'vestibular', 'vertigo',
        'tinnitus', 'hearing loss', 'audiometry', 'endoscopy', 'laryngoscopy',
        'sensorineural', 'conductive', 'mixed hearing loss', 'cholesteatoma',
        'mastoiditis', 'labyrinthitis', 'meniere', 'acoustic neuroma'
    ],
    dental: [
        'cavity', 'caries', 'enamel', 'dentin', 'pulp', 'root canal',
        'periodontal', 'gingivitis', 'periodontitis', 'plaque', 'tartar',
        'crown', 'bridge', 'implant', 'extraction', 'filling', 'amalgam',
        'composite', 'veneer', 'orthodontic', 'malocclusion', 'bruxism',
        'tmj', 'temporomandibular', 'occlusion', 'bite', 'mandible', 'maxilla',
        'abscess', 'impacted', 'wisdom tooth', 'endodontic', 'prosthodontic'
    ],
    dermatology: [
        'melanoma', 'nevus', 'mole', 'lesion', 'papule', 'macule', 'nodule',
        'vesicle', 'pustule', 'plaque', 'dermatitis', 'eczema', 'psoriasis',
        'urticaria', 'hives', 'rash', 'erythema', 'pigmentation', 'acne',
        'rosacea', 'alopecia', 'vitiligo', 'cellulitis', 'abscess', 'ulcer',
        'wound', 'laceration', 'abrasion', 'burn', 'scar', 'keloid',
        'basal cell', 'squamous cell', 'keratosis', 'dermoscopy', 'biopsy'
    ],
    vitals: [
        'blood pressure', 'systolic', 'diastolic', 'hypertension', 'hypotension',
        'heart rate', 'pulse', 'bradycardia', 'tachycardia', 'arrhythmia',
        'temperature', 'fever', 'hypothermia', 'hyperthermia',
        'respiratory rate', 'tachypnea', 'bradypnea', 'dyspnea',
        'oxygen saturation', 'spo2', 'hypoxia', 'cyanosis',
        'bmi', 'weight', 'height', 'obesity', 'underweight', 'malnutrition'
    ],
    cardiology: [
        'ecg', 'ekg', 'electrocardiogram', 'qrs', 'st segment', 'p wave', 't wave',
        'atrial fibrillation', 'afib', 'flutter', 'pvc', 'pac',
        'murmur', 'systolic', 'diastolic', 'regurgitation', 'stenosis',
        'ejection fraction', 'lvef', 'cardiomyopathy', 'heart failure',
        'coronary', 'angina', 'infarction', 'mi', 'stemi', 'nstemi',
        'pericarditis', 'endocarditis', 'valve', 'mitral', 'aortic', 'tricuspid'
    ],
    general: [
        'inflammation', 'infection', 'lesion', 'tumor', 'cyst', 'abscess',
        'edema', 'erythema', 'necrosis', 'biopsy', 'pathology', 'diagnosis',
        'prognosis', 'acute', 'chronic', 'benign', 'malignant', 'metastasis',
        'bilateral', 'unilateral', 'proximal', 'distal', 'anterior', 'posterior'
    ]
};

// ============================================
// ANALYSIS CONTEXT BUILDER
// ============================================

/**
 * Build analysis context from user-selected filters
 * This context is passed to the AI for more accurate analysis
 */
export function buildAnalysisContext(filters) {
    const context = {
        specialty: null,
        ageGroup: null,
        reportType: null,
        gender: null,
        vocabulary: [],
        focusAreas: [],
        considerations: [],
        dataType: 'text'
    };
    
    // Set specialty context
    if (filters.specialty && SPECIALTIES[filters.specialty]) {
        const spec = SPECIALTIES[filters.specialty];
        context.specialty = spec;
        context.focusAreas = spec.focusAreas;
        context.vocabulary = MEDICAL_VOCABULARY[filters.specialty] || MEDICAL_VOCABULARY.general;
    }
    
    // Set age group context
    if (filters.ageGroup && AGE_GROUPS[filters.ageGroup]) {
        const age = AGE_GROUPS[filters.ageGroup];
        context.ageGroup = age;
        context.considerations = age.considerations;
    }
    
    // Set report type context
    if (filters.reportType && REPORT_TYPES[filters.reportType]) {
        const report = REPORT_TYPES[filters.reportType];
        context.reportType = report;
        context.dataType = report.dataType;
    }
    
    // Set gender context
    if (filters.gender && GENDER_OPTIONS[filters.gender]) {
        context.gender = GENDER_OPTIONS[filters.gender];
    }
    
    return context;
}

/**
 * Get relevant vocabulary for the given context
 */
export function getContextVocabulary(context) {
    const vocab = new Set();
    
    // Add specialty vocabulary
    if (context.specialty) {
        const specVocab = MEDICAL_VOCABULARY[context.specialty.id] || [];
        specVocab.forEach(term => vocab.add(term));
    }
    
    // Always include general medical terms
    MEDICAL_VOCABULARY.general.forEach(term => vocab.add(term));
    
    return Array.from(vocab);
}

// ============================================
// APPLICATION CONFIGURATION
// ============================================

// Application configuration
export const CONFIG = {
    app: {
        name: 'Medical AI Assistant',
        version: '1.0.0',
        environment: import.meta.env?.MODE || 'development'
    },
    
    // Model loading settings
    models: {
        downloadTimeout: 5 * 60 * 1000, // 5 minutes
        retryAttempts: 3,
        retryDelay: 2000, // 2 seconds
        cacheExpiration: 30 * 24 * 60 * 60 * 1000, // 30 days
        progressUpdateInterval: 100 // ms
    },
    
    // Analysis settings
    analysis: {
        maxTextLength: 50000, // characters
        maxImageSize: 10 * 1024 * 1024, // 10MB
        maxVideoLength: 300, // 5 minutes in seconds
        defaultConfidenceThreshold: 0.5,
        batchSize: 10
    },
    
    // UI settings
    ui: {
        toastDuration: 3000,
        modalAnimationDuration: 200,
        debounceDelay: 300,
        maxRecentReports: 50
    },
    
    // Storage settings
    storage: {
        dbName: 'MedicalAIAssistant',
        dbVersion: 1,
        maxCacheSize: 2 * 1024 * 1024 * 1024, // 2GB
        quotaWarningThreshold: 0.9 // Warn at 90% capacity
    },
    
    // Feature flags
    features: {
        enableImageAnalysis: true,
        enableVideoAnalysis: true,
        enableScreenCapture: true
    },
    
    // API endpoints (for future cloud integration)
    api: {
        baseUrl: import.meta.env?.VITE_API_URL || '',
        reportSubmissionEndpoint: '/api/reports',
        modelDownloadEndpoint: 'https://huggingface.co'
    }
};

// Get total required model size
export function getTotalModelSize(requiredOnly = false) {
    return Object.values(MODELS)
        .filter(model => !requiredOnly || model.required)
        .reduce((total, model) => total + model.size, 0);
}

// Format bytes to human readable
export function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Check if feature is enabled
export function isFeatureEnabled(featureName) {
    return CONFIG.features[featureName] ?? false;
}

// Get environment-specific value
export function getEnvConfig(key, defaultValue) {
    if (typeof import.meta.env !== 'undefined') {
        return import.meta.env[`VITE_${key}`] || defaultValue;
    }
    return defaultValue;
}

export default CONFIG;
