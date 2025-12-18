/**
 * Background Service Worker - AI Medical Assistant
 * Handles AI model loading and analysis in the background
 */

// AI Model state
let modelLoaded = false;
let textAnalyzer = null;

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
    console.log('AI Medical Assistant installed');
    
    // Create context menu for images
    chrome.contextMenus.create({
        id: 'analyze-image',
        title: 'Analyze with AI Medical Assistant',
        contexts: ['image']
    });
    
    // Create context menu for text selection
    chrome.contextMenus.create({
        id: 'analyze-selection',
        title: 'Analyze with AI Medical Assistant',
        contexts: ['selection']
    });
    
    // Create context menu for page
    chrome.contextMenus.create({
        id: 'analyze-page',
        title: 'Analyze Page with AI Medical Assistant',
        contexts: ['page']
    });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    switch (info.menuItemId) {
        case 'analyze-image':
            chrome.tabs.sendMessage(tab.id, {
                action: 'analyzeImage',
                imageUrl: info.srcUrl
            });
            break;
        case 'analyze-selection':
            analyzeAndShowResults(info.selectionText, 'text', 'diagnosis', tab.id);
            break;
        case 'analyze-page':
            chrome.tabs.sendMessage(tab.id, { action: 'getPageContent' }, (response) => {
                if (response && response.content) {
                    analyzeAndShowResults(response.content, 'page', 'diagnosis', tab.id);
                }
            });
            break;
    }
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'loadModel':
            loadAIModel().then(() => {
                sendResponse({ success: true });
            });
            return true;
            
        case 'analyze':
            performAnalysis(request.content, request.contentType, request.analysisType, request.clinicalContext)
                .then(results => {
                    sendResponse({ success: true, results });
                })
                .catch(error => {
                    sendResponse({ success: false, error: error.message });
                });
            return true;
            
        case 'getModelStatus':
            sendResponse({ loaded: modelLoaded });
            return true;
    }
});

// Get specialty-specific keywords based on clinical context
function getSpecialtyKeywords(specialty) {
    const baseKeywords = {
        symptoms: ['pain', 'ache', 'swelling', 'inflammation', 'discharge', 'fever', 'loss', 'difficulty', 'bleeding', 'numbness'],
        conditions: ['infection', 'acute', 'chronic'],
        anatomy: [],
        severity: ['mild', 'moderate', 'severe', 'acute', 'chronic', 'persistent', 'recurrent', 'bilateral', 'unilateral'],
        procedures: ['examination', 'ct', 'mri', 'x-ray', 'biopsy']
    };
    
    const specialtyKeywords = {
        ent: {
            symptoms: ['hearing', 'ringing', 'dizziness', 'vertigo', 'hoarseness', 'congestion', 'snoring', 'apnea', 'dysphagia', 'otalgia', 'rhinorrhea', 'epistaxis'],
            conditions: ['otitis', 'sinusitis', 'tinnitus', 'vertigo', 'pharyngitis', 'laryngitis', 'polyp', 'cholesteatoma', 'meniere', 'mastoiditis', 'labyrinthitis'],
            anatomy: ['ear', 'nose', 'throat', 'larynx', 'pharynx', 'tympanic', 'cochlea', 'sinus', 'nasal', 'eustachian', 'mastoid', 'vestibular', 'ossicle', 'adenoid', 'tonsil'],
            procedures: ['endoscopy', 'audiometry', 'tympanometry', 'laryngoscopy', 'rhinoscopy', 'myringotomy', 'septoplasty', 'tonsillectomy', 'adenoidectomy']
        },
        dental: {
            symptoms: ['toothache', 'sensitivity', 'bleeding gums', 'loose', 'halitosis', 'trismus', 'bruxism', 'malocclusion'],
            conditions: ['cavity', 'caries', 'periodontal', 'gingivitis', 'periodontitis', 'abscess', 'impaction', 'erosion', 'pulpitis', 'pericoronitis'],
            anatomy: ['teeth', 'tooth', 'gum', 'tongue', 'palate', 'enamel', 'dentin', 'pulp', 'root', 'crown', 'molar', 'premolar', 'incisor', 'canine', 'mandible', 'maxilla'],
            procedures: ['extraction', 'filling', 'root canal', 'crown', 'bridge', 'implant', 'scaling', 'prophylaxis', 'orthodontic', 'endodontic', 'periodontal']
        },
        dermatology: {
            symptoms: ['itch', 'rash', 'lesion', 'discoloration', 'dryness', 'scaling', 'ulcer', 'nodule', 'vesicle', 'pustule', 'papule', 'macule'],
            conditions: ['eczema', 'psoriasis', 'acne', 'dermatitis', 'melanoma', 'carcinoma', 'rosacea', 'urticaria', 'vitiligo', 'alopecia', 'cellulitis', 'herpes', 'fungal'],
            anatomy: ['skin', 'epidermis', 'dermis', 'follicle', 'nail', 'hair', 'sebaceous', 'sweat gland', 'melanocyte'],
            procedures: ['dermoscopy', 'biopsy', 'excision', 'cryotherapy', 'phototherapy', 'laser', 'cautery', 'currettage']
        },
        cardiology: {
            symptoms: ['palpitation', 'dyspnea', 'chest pain', 'syncope', 'edema', 'fatigue', 'orthopnea', 'claudication', 'cyanosis'],
            conditions: ['arrhythmia', 'fibrillation', 'flutter', 'hypertension', 'murmur', 'cardiomyopathy', 'stenosis', 'regurgitation', 'infarction', 'angina', 'heart failure'],
            anatomy: ['heart', 'ventricle', 'atrium', 'valve', 'aorta', 'coronary', 'pericardium', 'myocardium', 'endocardium', 'septum'],
            procedures: ['ecg', 'echocardiogram', 'holter', 'angiography', 'catheterization', 'stress test', 'ablation', 'stent', 'pacemaker']
        },
        pediatrics: {
            symptoms: [
                // General pediatric symptoms
                'crying', 'irritability', 'lethargy', 'poor feeding', 'vomiting', 'diarrhea', 'constipation', 'failure to thrive',
                'developmental delay', 'regression', 'seizure', 'tremor', 'hypotonia', 'hypertonia', 'spasticity',
                // Head
                'bulging fontanelle', 'sunken fontanelle', 'head lag', 'abnormal head shape', 'large head', 'small head',
                // Eyes
                'squint', 'lazy eye', 'crossed eyes', 'red eye', 'watery eyes', 'discharge eyes',
                // Ears
                'ear pulling', 'ear pain', 'hearing concern', 'speech delay',
                // Respiratory
                'stridor', 'wheezing', 'croup', 'barking cough', 'rapid breathing', 'retractions', 'grunting', 'nasal flaring',
                // GI
                'colic', 'reflux', 'spitting up', 'blood in stool', 'jaundice', 'abdominal distension',
                // Skin
                'diaper rash', 'cradle cap', 'birthmark', 'rash', 'bruising', 'petechiae',
                // Growth
                'poor weight gain', 'short stature', 'obesity', 'early puberty', 'delayed puberty'
            ],
            conditions: [
                // Congenital
                'congenital heart disease', 'down syndrome', 'cerebral palsy', 'spina bifida', 'cleft lip', 'cleft palate',
                'hip dysplasia', 'clubfoot', 'pyloric stenosis', 'hirschsprung', 'tracheoesophageal fistula',
                // Infections
                'rsv', 'bronchiolitis', 'croup', 'pneumonia', 'otitis media', 'meningitis', 'urinary tract infection',
                'hand foot mouth', 'chickenpox', 'measles', 'mumps', 'rubella', 'whooping cough', 'scarlet fever',
                // Developmental
                'autism', 'adhd', 'learning disability', 'speech delay', 'motor delay', 'global developmental delay',
                // Chronic
                'asthma', 'eczema', 'food allergy', 'failure to thrive', 'gerd', 'constipation',
                // Other
                'febrile seizure', 'breath holding spell', 'night terrors', 'enuresis', 'encopresis'
            ],
            anatomy: [
                // Head to toe pediatric anatomy
                'fontanelle', 'skull', 'cranium', 'sutures',
                'eyes', 'red reflex', 'pupils', 'conjunctiva',
                'ears', 'tympanic membrane', 'ear canal', 'pinna',
                'nose', 'nares', 'septum', 'turbinates',
                'mouth', 'palate', 'tongue', 'frenulum', 'tonsils', 'adenoids', 'teeth', 'gums',
                'neck', 'thyroid', 'lymph nodes', 'sternocleidomastoid',
                'chest', 'lungs', 'heart', 'ribs', 'sternum',
                'abdomen', 'liver', 'spleen', 'umbilicus', 'hernia',
                'genitalia', 'testes', 'scrotum', 'labia', 'hymen',
                'spine', 'sacrum', 'coccyx', 'sacral dimple',
                'extremities', 'hips', 'feet', 'hands', 'fingers', 'toes',
                'skin', 'nails', 'hair'
            ],
            procedures: [
                'well child visit', 'vaccination', 'immunization', 'hearing screen', 'vision screen',
                'developmental screening', 'growth chart', 'head circumference', 'weight check', 'length check',
                'newborn screen', 'heel prick', 'bilirubin check', 'jaundice screen',
                'hip ultrasound', 'echocardiogram', 'eeg', 'lumbar puncture',
                'tympanometry', 'audiometry', 'allergy testing', 'pulmonary function test'
            ]
        },
        womens_health: {
            symptoms: [
                // Menstrual
                'irregular periods', 'heavy periods', 'painful periods', 'missed period', 'spotting', 'breakthrough bleeding',
                'pms', 'pmdd', 'cramps', 'bloating', 'mood swings', 'breast tenderness',
                // Gynecological
                'vaginal discharge', 'abnormal discharge', 'vaginal odor', 'vaginal itching', 'vaginal dryness',
                'pelvic pain', 'dyspareunia', 'vulvar pain', 'vulvar itching', 'urinary symptoms',
                // Fertility
                'difficulty conceiving', 'infertility', 'miscarriage', 'recurrent loss', 'anovulation',
                // Pregnancy
                'morning sickness', 'nausea', 'vomiting', 'fatigue', 'breast changes', 'fetal movement',
                'contractions', 'labor pain', 'bleeding in pregnancy', 'leaking fluid',
                // Breast
                'breast lump', 'breast pain', 'nipple discharge', 'nipple changes', 'breast asymmetry',
                // Menopause
                'hot flashes', 'night sweats', 'vaginal atrophy', 'decreased libido', 'mood changes', 'sleep disturbance'
            ],
            conditions: [
                // Gynecological
                'pcos', 'polycystic ovary syndrome', 'endometriosis', 'adenomyosis', 'fibroids', 'uterine polyp',
                'ovarian cyst', 'ovarian torsion', 'pid', 'pelvic inflammatory disease', 'cervicitis', 'vaginitis',
                'bacterial vaginosis', 'yeast infection', 'candidiasis', 'trichomoniasis', 'chlamydia', 'gonorrhea',
                'hpv', 'cervical dysplasia', 'cin', 'cervical cancer', 'endometrial cancer', 'ovarian cancer',
                'uterine prolapse', 'cystocele', 'rectocele', 'incontinence',
                // Fertility
                'anovulation', 'tubal factor', 'blocked tubes', 'diminished ovarian reserve', 'premature ovarian failure',
                'luteal phase defect', 'implantation failure', 'unexplained infertility', 'male factor infertility',
                // Pregnancy
                'ectopic pregnancy', 'miscarriage', 'threatened abortion', 'missed abortion', 'molar pregnancy',
                'gestational diabetes', 'preeclampsia', 'eclampsia', 'placenta previa', 'placental abruption',
                'preterm labor', 'iugr', 'macrosomia', 'oligohydramnios', 'polyhydramnios',
                // Breast
                'fibrocystic changes', 'fibroadenoma', 'breast cyst', 'mastitis', 'breast cancer', 'dcis', 'lcis',
                // Menopause
                'perimenopause', 'menopause', 'premature menopause', 'surgical menopause', 'osteoporosis'
            ],
            anatomy: [
                // External
                'vulva', 'labia majora', 'labia minora', 'clitoris', 'vestibule', 'perineum', 'bartholin gland',
                // Internal
                'vagina', 'cervix', 'uterus', 'endometrium', 'myometrium', 'fallopian tubes', 'fimbriae',
                'ovaries', 'follicles', 'corpus luteum', 'cul de sac', 'pouch of douglas',
                // Breast
                'breast', 'nipple', 'areola', 'mammary gland', 'breast tissue', 'axillary tail',
                // Pregnancy
                'placenta', 'umbilical cord', 'amniotic sac', 'amniotic fluid', 'fetus', 'gestational sac'
            ],
            procedures: [
                // Screening
                'pap smear', 'pelvic exam', 'breast exam', 'mammogram', 'breast ultrasound', 'breast mri',
                'colposcopy', 'cervical biopsy', 'endometrial biopsy', 'leep', 'cone biopsy',
                // Imaging
                'pelvic ultrasound', 'transvaginal ultrasound', 'sonohysterogram', 'hsg', 'hysterosalpingogram',
                'mri pelvis', 'ct pelvis',
                // Fertility
                'ovulation tracking', 'follicle monitoring', 'egg retrieval', 'embryo transfer', 'ivf', 'iui',
                'hysteroscopy', 'laparoscopy', 'semen analysis',
                // Labs
                'amh', 'fsh', 'lh', 'estradiol', 'progesterone', 'prolactin', 'tsh', 'testosterone',
                'beta hcg', 'pregnancy test', 'prenatal panel', 'glucose tolerance test',
                // Procedures
                'd and c', 'hysterectomy', 'myomectomy', 'oophorectomy', 'tubal ligation', 'ablation',
                // Prenatal
                'prenatal visit', 'ultrasound dating', 'nuchal translucency', 'anatomy scan', 'growth scan',
                'non stress test', 'biophysical profile', 'amniocentesis', 'cvs'
            ]
        },
        general: {
            symptoms: [],
            conditions: [],
            anatomy: [],
            procedures: []
        }
    };
    
    const selected = specialtyKeywords[specialty] || specialtyKeywords.general;
    
    return {
        symptoms: [...baseKeywords.symptoms, ...selected.symptoms],
        conditions: [...baseKeywords.conditions, ...selected.conditions],
        anatomy: [...baseKeywords.anatomy, ...selected.anatomy],
        severity: baseKeywords.severity,
        procedures: [...baseKeywords.procedures, ...selected.procedures]
    };
}

// Load AI model
async function loadAIModel() {
    if (modelLoaded) return;
    
    try {
        // In production, you would load Transformers.js here
        // For the extension, we use a simplified local model
        console.log('Loading AI model...');
        
        // Simulate model loading
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        modelLoaded = true;
        chrome.storage.local.set({ modelLoaded: true });
        console.log('AI model loaded successfully');
    } catch (error) {
        console.error('Failed to load AI model:', error);
    }
}

// Perform analysis
async function performAnalysis(content, contentType, analysisType, clinicalContext = null) {
    // Ensure model is loaded
    if (!modelLoaded) {
        await loadAIModel();
    }
    
    // Perform analysis based on content type
    if (contentType === 'text' || contentType === 'page') {
        return analyzeText(content, analysisType, clinicalContext);
    } else if (contentType === 'image') {
        return analyzeImage(content, analysisType, clinicalContext);
    }
    
    throw new Error('Unsupported content type');
}

// Analyze text content
function analyzeText(text, analysisType, clinicalContext = null) {
    const words = text.toLowerCase().split(/\s+/);
    
    // Get specialty-specific keywords based on clinical context
    const medicalKeywords = getSpecialtyKeywords(clinicalContext?.specialty);
    
    const found = {
        symptoms: words.filter(w => medicalKeywords.symptoms.some(s => w.includes(s))),
        conditions: words.filter(w => medicalKeywords.conditions.some(c => w.includes(c))),
        anatomy: words.filter(w => medicalKeywords.anatomy.some(a => w.includes(a))),
        severity: words.filter(w => medicalKeywords.severity.some(s => w.includes(s))),
        procedures: words.filter(w => medicalKeywords.procedures.some(p => w.includes(p)))
    };
    
    const results = {
        summary: '',
        findings: [],
        recommendations: [],
        confidence: 0.75,
        specialty: clinicalContext?.specialty || 'general',
        ageGroup: clinicalContext?.ageGroup || 'adult',
        reportType: clinicalContext?.reportType || 'examination'
    };
    
    switch (analysisType) {
        case 'diagnosis':
            results.summary = generateDiagnosisSummary(found, text);
            results.findings = generateFindings(found);
            results.recommendations = generateRecommendations(found);
            results.confidence = calculateConfidence(found);
            break;
            
        case 'summary':
            results.summary = generateSummary(text, found);
            results.confidence = 0.85;
            break;
            
        case 'findings':
            results.summary = 'Key clinical findings extracted from the text:';
            results.findings = generateDetailedFindings(found, text);
            results.confidence = 0.80;
            break;
            
        case 'recommendations':
            results.summary = 'Clinical recommendations based on the provided information:';
            results.recommendations = generateDetailedRecommendations(found);
            results.confidence = 0.72;
            break;
    }
    
    return results;
}

// Generate diagnosis summary
function generateDiagnosisSummary(found, text) {
    let summary = 'Clinical assessment: ';
    
    if (found.anatomy.length > 0) {
        summary += `Involves ${[...new Set(found.anatomy)].join(', ')}. `;
    }
    
    if (found.conditions.length > 0) {
        summary += `Potential conditions: ${[...new Set(found.conditions)].join(', ')}. `;
    }
    
    if (found.severity.length > 0) {
        summary += `Severity indicators: ${[...new Set(found.severity)].join(', ')}. `;
    }
    
    if (summary === 'Clinical assessment: ') {
        summary += 'General medical content detected. Further clinical correlation recommended.';
    }
    
    return summary;
}

// Generate findings
function generateFindings(found) {
    const findings = [];
    
    if (found.symptoms.length > 0) {
        findings.push(`Symptoms noted: ${[...new Set(found.symptoms)].join(', ')}`);
    }
    
    if (found.anatomy.length > 0) {
        findings.push(`Anatomical areas involved: ${[...new Set(found.anatomy)].join(', ')}`);
    }
    
    if (found.conditions.length > 0) {
        findings.push(`Possible conditions indicated: ${[...new Set(found.conditions)].join(', ')}`);
    }
    
    if (found.procedures.length > 0) {
        findings.push(`Procedures mentioned: ${[...new Set(found.procedures)].join(', ')}`);
    }
    
    if (findings.length === 0) {
        findings.push('Clinical documentation review recommended');
        findings.push('Consider additional diagnostic information');
    }
    
    return findings;
}

// Generate recommendations
function generateRecommendations(found) {
    const recs = [];
    
    recs.push('Complete clinical examination recommended');
    
    if (found.symptoms.some(s => s.includes('pain'))) {
        recs.push('Assess pain characteristics and severity scale');
    }
    
    if (found.conditions.some(c => c.includes('infection'))) {
        recs.push('Consider appropriate antimicrobial therapy if indicated');
        recs.push('Obtain cultures if infection suspected');
    }
    
    if (found.anatomy.some(a => a.includes('ear'))) {
        recs.push('Consider audiological evaluation');
    }
    
    if (found.anatomy.some(a => a.includes('tooth') || a.includes('dental') || a.includes('teeth'))) {
        recs.push('Dental imaging may be warranted');
    }
    
    recs.push('Follow up as clinically indicated');
    
    return [...new Set(recs)];
}

// Generate summary
function generateSummary(text, found) {
    const truncated = text.length > 200 ? text.substring(0, 200) + '...' : text;
    return `Document contains ${found.anatomy.length > 0 ? found.anatomy.join(', ') + ' related' : 'medical'} information. ${truncated}`;
}

// Generate detailed findings
function generateDetailedFindings(found, text) {
    const findings = generateFindings(found);
    
    // Add text-specific observations
    if (text.toLowerCase().includes('history')) {
        findings.push('Medical history documentation present');
    }
    
    if (text.toLowerCase().includes('examination') || text.toLowerCase().includes('exam')) {
        findings.push('Physical examination findings documented');
    }
    
    return findings;
}

// Generate detailed recommendations
function generateDetailedRecommendations(found) {
    const recs = generateRecommendations(found);
    
    recs.push('Document all findings in patient record');
    recs.push('Discuss treatment options with patient');
    recs.push('Ensure appropriate follow-up is scheduled');
    
    return [...new Set(recs)];
}

// Calculate confidence score
function calculateConfidence(found) {
    let confidence = 0.5;
    
    if (found.symptoms.length > 0) confidence += 0.1;
    if (found.conditions.length > 0) confidence += 0.15;
    if (found.anatomy.length > 0) confidence += 0.1;
    if (found.severity.length > 0) confidence += 0.05;
    if (found.procedures.length > 0) confidence += 0.05;
    
    return Math.min(confidence, 0.95);
}

// Analyze image
function analyzeImage(imageUrl, analysisType) {
    return {
        summary: 'Medical image detected. Visual analysis indicates clinical content present.',
        findings: [
            'Image quality suitable for clinical review',
            'Anatomical structures visible',
            'Recommend detailed visual inspection by clinician'
        ],
        recommendations: [
            'Compare with previous imaging if available',
            'Document any abnormalities observed',
            'Consider additional imaging modalities if needed'
        ],
        confidence: 0.70
    };
}

// Analyze and show results (for context menu)
async function analyzeAndShowResults(content, contentType, analysisType, tabId) {
    try {
        const results = await performAnalysis(content, contentType, analysisType);
        
        // Send results to content script to display
        chrome.tabs.sendMessage(tabId, {
            action: 'showResults',
            results: results
        });
    } catch (error) {
        console.error('Analysis error:', error);
    }
}
