import { TopicKeywords, NewsLanguage } from '../types'

/**
 * Multi-language keyword translations for all supported topics
 * Languages supported: ar, de, en, es, fr, he, it, nl, no, pt, ru, sv, ud, zh
 * 
 * Note: Translations are professionally sourced where possible.
 * For languages not yet fully translated, English fallback keywords are used.
 */

export const MULTI_LANGUAGE_TOPICS: TopicKeywords[] = [
  {
    topic: 'Climate Change',
    keywords: [], // Legacy - kept for compatibility
    multiLanguageKeywords: {
      'en': [
        'climate change', 'global warming', 'carbon emissions', 'renewable energy',
        'fossil fuels', 'greenhouse gas', 'carbon footprint', 'sustainability',
        'environmental policy', 'clean energy', 'solar power', 'wind energy',
        'carbon tax', 'paris agreement', 'sea level rise', 'extreme weather',
        'deforestation', 'electric vehicles', 'green technology', 'climate crisis'
      ],
      'es': [
        'cambio climático', 'calentamiento global', 'emisiones de carbono', 'energía renovable',
        'combustibles fósiles', 'gases de efecto invernadero', 'huella de carbono', 'sostenibilidad',
        'política ambiental', 'energía limpia', 'energía solar', 'energía eólica',
        'impuesto al carbono', 'acuerdo de parís', 'aumento del nivel del mar', 'clima extremo',
        'deforestación', 'vehículos eléctricos', 'tecnología verde', 'crisis climática'
      ],
      'fr': [
        'changement climatique', 'réchauffement climatique', 'émissions de carbone', 'énergie renouvelable',
        'combustibles fossiles', 'gaz à effet de serre', 'empreinte carbone', 'durabilité',
        'politique environnementale', 'énergie propre', 'énergie solaire', 'énergie éolienne',
        'taxe carbone', 'accord de paris', 'montée du niveau de la mer', 'climat extrême',
        'déforestation', 'véhicules électriques', 'technologie verte', 'crise climatique'
      ],
      'de': [
        'klimawandel', 'globale erwärmung', 'kohlenstoffemissionen', 'erneuerbare energie',
        'fossile brennstoffe', 'treibhausgas', 'kohlenstoff-fußabdruck', 'nachhaltigkeit',
        'umweltpolitik', 'saubere energie', 'solarenergie', 'windenergie',
        'kohlenstoffsteuer', 'pariser abkommen', 'meeresspiegelanstieg', 'extremwetter',
        'entwaldung', 'elektrofahrzeuge', 'grüne technologie', 'klimakrise'
      ],
      'it': [
        'cambiamento climatico', 'riscaldamento globale', 'emissioni di carbonio', 'energia rinnovabile',
        'combustibili fossili', 'gas serra', 'impronta di carbonio', 'sostenibilità',
        'politica ambientale', 'energia pulita', 'energia solare', 'energia eolica',
        'tassa sul carbonio', 'accordo di parigi', 'innalzamento del livello del mare', 'clima estremo',
        'deforestazione', 'veicoli elettrici', 'tecnologia verde', 'crisi climatica'
      ],
      'pt': [
        'mudança climática', 'aquecimento global', 'emissões de carbono', 'energia renovável',
        'combustíveis fósseis', 'gases do efeito estufa', 'pegada de carbono', 'sustentabilidade',
        'política ambiental', 'energia limpa', 'energia solar', 'energia eólica',
        'imposto sobre carbono', 'acordo de paris', 'elevação do nível do mar', 'clima extremo',
        'desmatamento', 'veículos elétricos', 'tecnologia verde', 'crise climática'
      ],
      'ru': [
        'изменение климата', 'глобальное потепление', 'выбросы углерода', 'возобновляемая энергия',
        'ископаемое топливо', 'парниковый газ', 'углеродный след', 'устойчивость',
        'экологическая политика', 'чистая энергия', 'солнечная энергия', 'ветровая энергия',
        'углеродный налог', 'парижское соглашение', 'повышение уровня моря', 'экстремальная погода',
        'вырубка лесов', 'электромобили', 'зеленые технологии', 'климатический кризис'
      ],
      'zh': [
        '气候变化', '全球变暖', '碳排放', '可再生能源',
        '化石燃料', '温室气体', '碳足迹', '可持续性',
        '环境政策', '清洁能源', '太阳能', '风能',
        '碳税', '巴黎协定', '海平面上升', '极端天气',
        '森林砍伐', '电动汽车', '绿色技术', '气候危机'
      ],
      'ar': [
        'تغير المناخ', 'الاحترار العالمي', 'انبعاثات الكربون', 'الطاقة المتجددة',
        'الوقود الأحفوري', 'غازات الدفيئة', 'البصمة الكربونية', 'الاستدامة',
        'السياسة البيئية', 'الطاقة النظيفة', 'الطاقة الشمسية', 'طاقة الرياح',
        'ضريبة الكربون', 'اتفاقية باريس', 'ارتفاع مستوى سطح البحر', 'الطقس المتطرف',
        'إزالة الغابات', 'المركبات الكهربائية', 'التكنولوجيا الخضراء', 'أزمة المناخ'
      ],
      'he': [
        'שינוי אקלים', 'התחממות כדור הארץ', 'פליטות פחמן', 'אנרגיה מתחדשת',
        'דלקים מאובנים', 'גזי חממה', 'טביעת רגל פחמנית', 'קיימות',
        'מדיניות סביבתית', 'אנרגיה נקייה', 'אנרגיה סולארית', 'אנרגיית רוח',
        'מס פחמן', 'הסכם פריז', 'עליית פני הים', 'מזג אוויר קיצוני',
        'כריתת יערות', 'כלי רכב חשמליים', 'טכנולוגיה ירוקה', 'משבר האקלים'
      ],
      'nl': [
        'klimaatverandering', 'opwarming van de aarde', 'koolstofemissies', 'hernieuwbare energie',
        'fossiele brandstoffen', 'broeikasgassen', 'koolstofvoetafdruk', 'duurzaamheid',
        'milieubeleid', 'schone energie', 'zonne-energie', 'windenergie',
        'koolstofbelasting', 'akkoord van parijs', 'zeespiegelstijging', 'extreem weer',
        'ontbossing', 'elektrische voertuigen', 'groene technologie', 'klimaatcrisis'
      ],
      'no': [
        'klimaendringer', 'global oppvarming', 'karbonutslipp', 'fornybar energi',
        'fossilt brensel', 'drivhusgasser', 'karbonavtrykk', 'bærekraft',
        'miljøpolitikk', 'ren energi', 'solenergi', 'vindkraft',
        'karbonavgift', 'parisavtalen', 'havnivåstigning', 'ekstremvær',
        'avskoging', 'elektriske kjøretøy', 'grønn teknologi', 'klimakrise'
      ],
      'sv': [
        'klimatförändring', 'global uppvärmning', 'koldioxidutsläpp', 'förnybar energi',
        'fossila bränslen', 'växthusgaser', 'koldioxidavtryck', 'hållbarhet',
        'miljöpolitik', 'ren energi', 'solenergi', 'vindkraft',
        'koldioxidskatt', 'parisavtalet', 'havsnivåhöjning', 'extremväder',
        'avskogning', 'elfordon', 'grön teknik', 'klimatkris'
      ],
      'ud': [
        // Urdu translations
        'موسمیاتی تبدیلی', 'عالمی حدت', 'کاربن کا اخراج', 'قابل تجدید توانائی',
        'فوسل فیول', 'گرین ہاؤس گیسیں', 'کاربن فوٹ پرنٹ', 'پائیداری',
        'ماحولیاتی پالیسی', 'صاف توانائی', 'شمسی توانائی', 'ہوا کی توانائی',
        'کاربن ٹیکس', 'پیرس معاہدہ', 'سمندری سطح کا اضافہ', 'انتہائی موسم',
        'جنگلات کی کٹائی', 'بجلی گاڑیاں', 'سبز ٹیکنالوجی', 'موسمیاتی بحران'
      ]
    },
    fallbackKeywords: [
      'climate change', 'global warming', 'carbon emissions', 'renewable energy',
      'fossil fuels', 'greenhouse gas', 'carbon footprint', 'sustainability'
    ]
  },
  {
    topic: 'Healthcare',
    keywords: [], // Legacy - kept for compatibility
    multiLanguageKeywords: {
      'en': [
        'healthcare', 'health insurance', 'medicare', 'medicaid', 'prescription drugs',
        'medical costs', 'health policy', 'public health', 'mental health', 'healthcare reform',
        'health coverage', 'medical bills', 'hospital', 'pharmaceutical', 'drug prices',
        'health services', 'medical research', 'pandemic', 'vaccination', 'healthcare access'
      ],
      'es': [
        'atención médica', 'seguro de salud', 'medicare', 'medicaid', 'medicamentos recetados',
        'costos médicos', 'política de salud', 'salud pública', 'salud mental', 'reforma de salud',
        'cobertura de salud', 'facturas médicas', 'hospital', 'farmacéutica', 'precios de medicamentos',
        'servicios de salud', 'investigación médica', 'pandemia', 'vacunación', 'acceso a la salud'
      ],
      'fr': [
        'soins de santé', 'assurance maladie', 'medicare', 'medicaid', 'médicaments sur ordonnance',
        'coûts médicaux', 'politique de santé', 'santé publique', 'santé mentale', 'réforme de la santé',
        'couverture santé', 'factures médicales', 'hôpital', 'pharmaceutique', 'prix des médicaments',
        'services de santé', 'recherche médicale', 'pandémie', 'vaccination', 'accès aux soins'
      ],
      'de': [
        'gesundheitswesen', 'krankenversicherung', 'medicare', 'medicaid', 'verschreibungspflichtige medikamente',
        'medizinische kosten', 'gesundheitspolitik', 'öffentliche gesundheit', 'geistige gesundheit', 'gesundheitsreform',
        'krankenversicherung', 'arztrechnungen', 'krankenhaus', 'pharmazeutisch', 'medikamentenpreise',
        'gesundheitsdienste', 'medizinische forschung', 'pandemie', 'impfung', 'gesundheitszugang'
      ],
      'it': [
        'assistenza sanitaria', 'assicurazione sanitaria', 'medicare', 'medicaid', 'farmaci da prescrizione',
        'costi medici', 'politica sanitaria', 'salute pubblica', 'salute mentale', 'riforma sanitaria',
        'copertura sanitaria', 'fatture mediche', 'ospedale', 'farmaceutico', 'prezzi dei farmaci',
        'servizi sanitari', 'ricerca medica', 'pandemia', 'vaccinazione', 'accesso sanitario'
      ],
      'pt': [
        'cuidados de saúde', 'seguro de saúde', 'medicare', 'medicaid', 'medicamentos prescritos',
        'custos médicos', 'política de saúde', 'saúde pública', 'saúde mental', 'reforma da saúde',
        'cobertura de saúde', 'contas médicas', 'hospital', 'farmacêutico', 'preços de medicamentos',
        'serviços de saúde', 'pesquisa médica', 'pandemia', 'vacinação', 'acesso à saúde'
      ],
      'ru': [
        'здравоохранение', 'медицинское страхование', 'медикэр', 'медикэйд', 'рецептурные лекарства',
        'медицинские расходы', 'политика здравоохранения', 'общественное здоровье', 'психическое здоровье', 'реформа здравоохранения',
        'медицинское покрытие', 'медицинские счета', 'больница', 'фармацевтический', 'цены на лекарства',
        'медицинские услуги', 'медицинские исследования', 'пандемия', 'вакцинация', 'доступ к здравоохранению'
      ],
      'zh': [
        '医疗保健', '健康保险', '医疗保险', '医疗补助', '处方药',
        '医疗费用', '卫生政策', '公共卫生', '心理健康', '医疗改革',
        '健康覆盖', '医疗账单', '医院', '制药', '药品价格',
        '医疗服务', '医学研究', '大流行', '疫苗接种', '医疗准入'
      ],
      'ar': [
        'الرعاية الصحية', 'التأمين الصحي', 'الرعاية الطبية', 'المساعدة الطبية', 'الأدوية الموصوفة',
        'التكاليف الطبية', 'السياسة الصحية', 'الصحة العامة', 'الصحة النفسية', 'إصلاح الرعاية الصحية',
        'التغطية الصحية', 'الفواتير الطبية', 'المستشفى', 'الصيدلانية', 'أسعار الأدوية',
        'الخدمات الصحية', 'البحث الطبي', 'الوباء', 'التطعيم', 'الوصول للرعاية الصحية'
      ],
      'he': [
        'בריאות', 'ביטוח בריאות', 'מדיקר', 'מדיקייד', 'תרופות מרשם',
        'עלויות רפואיות', 'מדיניות בריאות', 'בריאות הציבור', 'בריאות נפש', 'רפורמה בבריאות',
        'כיסוי בריאותי', 'חשבונות רפואיים', 'בית חולים', 'פרמצבטי', 'מחירי תרופות',
        'שירותי בריאות', 'מחקר רפואי', 'מגפה', 'חיסון', 'גישה לבריאות'
      ],
      'nl': [
        'gezondheidszorg', 'zorgverzekering', 'medicare', 'medicaid', 'voorgeschreven geneesmiddelen',
        'medische kosten', 'gezondheidsbeleid', 'volksgezondheid', 'geestelijke gezondheid', 'zorghervorming',
        'zorgdekking', 'medische rekeningen', 'ziekenhuis', 'farmaceutisch', 'medicijnprijzen',
        'gezondheidsdiensten', 'medisch onderzoek', 'pandemie', 'vaccinatie', 'toegang tot zorg'
      ],
      'no': [
        'helsevesen', 'helseforsikring', 'medicare', 'medicaid', 'reseptbelagte legemidler',
        'medisinske kostnader', 'helsepolitikk', 'folkehelse', 'mental helse', 'helsereform',
        'helsedekning', 'medisinske regninger', 'sykehus', 'farmasøytisk', 'legemiddelpriser',
        'helsetjenester', 'medisinsk forskning', 'pandemi', 'vaksinasjon', 'helsetilgang'
      ],
      'sv': [
        'sjukvård', 'sjukförsäkring', 'medicare', 'medicaid', 'receptbelagda läkemedel',
        'medicinska kostnader', 'hälsopolitik', 'folkhälsa', 'mental hälsa', 'vårdreform',
        'vårdtäckning', 'medicinska räkningar', 'sjukhus', 'farmaceutisk', 'läkemedelspriser',
        'hälsotjänster', 'medicinsk forskning', 'pandemi', 'vaccination', 'vårdtillgång'
      ],
      'ud': [
        'صحت کی دیکھ بھال', 'صحت کا بیمہ', 'میڈیکیئر', 'میڈیکیئیڈ', 'نسخے کی دوائیں',
        'طبی اخراجات', 'صحت کی پالیسی', 'عوامی صحت', 'ذہنی صحت', 'صحت کی اصلاحات',
        'صحت کا احاطہ', 'طبی بل', 'ہسپتال', 'دواساز', 'دوا کی قیمتیں',
        'صحت کی خدمات', 'طبی تحقیق', 'وبا', 'ویکسینیشن', 'صحت تک رسائی'
      ]
    },
    fallbackKeywords: [
      'healthcare', 'health insurance', 'medicare', 'medicaid', 'prescription drugs',
      'medical costs', 'health policy', 'public health'
    ]
  },
  {
    topic: 'Immigration',
    keywords: [], // Legacy - kept for compatibility
    multiLanguageKeywords: {
      'en': [
        'immigration', 'border security', 'asylum seekers', 'visa policy',
        'refugee crisis', 'migrant workers', 'deportation', 'immigration reform',
        'border wall', 'legal immigration', 'undocumented immigrants', 'citizenship',
        'green card', 'sanctuary cities', 'immigration enforcement', 'refugee resettlement',
        'asylum claims', 'border patrol', 'immigration law', 'family separation'
      ],
      'es': [
        'inmigración', 'seguridad fronteriza', 'solicitantes de asilo', 'política de visas',
        'crisis de refugiados', 'trabajadores migrantes', 'deportación', 'reforma migratoria',
        'muro fronterizo', 'inmigración legal', 'inmigrantes indocumentados', 'ciudadanía',
        'tarjeta verde', 'ciudades santuario', 'aplicación de inmigración', 'reasentamiento de refugiados',
        'solicitudes de asilo', 'patrulla fronteriza', 'ley de inmigración', 'separación familiar'
      ],
      'fr': [
        'immigration', 'sécurité frontalière', 'demandeurs dasile', 'politique de visa',
        'crise des réfugiés', 'travailleurs migrants', 'expulsion', 'réforme de limmigration',
        'mur frontalier', 'immigration légale', 'immigrants sans papiers', 'citoyenneté',
        'carte verte', 'villes sanctuaires', 'application de limmigration', 'réinstallation des réfugiés',
        'demandes dasile', 'patrouille frontalière', 'droit de limmigration', 'séparation familiale'
      ],
      'de': [
        'einwanderung', 'grenzsicherheit', 'asylsuchende', 'visa-politik',
        'flüchtlingskrise', 'wanderarbeitnehmer', 'abschiebung', 'einwanderungsreform',
        'grenzmauer', 'legale einwanderung', 'illegale einwanderer', 'staatsbürgerschaft',
        'green card', 'sanctuary cities', 'einwanderungsdurchsetzung', 'flüchtlingsansiedlung',
        'asylanträge', 'grenzpatrouille', 'einwanderungsrecht', 'familientrennung'
      ],
      'it': [
        'immigrazione', 'sicurezza delle frontiere', 'richiedenti asilo', 'politica dei visti',
        'crisi dei rifugiati', 'lavoratori migranti', 'deportazione', 'riforma dellimmigrazione',
        'muro di confine', 'immigrazione legale', 'immigrati clandestini', 'cittadinanza',
        'carta verde', 'città santuario', 'applicazione dellimmigrazione', 'reinsediamento rifugiati',
        'richieste di asilo', 'pattuglia di frontiera', 'legge sullimmigrazione', 'separazione familiare'
      ],
      'pt': [
        'imigração', 'segurança da fronteira', 'requerentes de asilo', 'política de vistos',
        'crise de refugiados', 'trabalhadores migrantes', 'deportação', 'reforma da imigração',
        'muro da fronteira', 'imigração legal', 'imigrantes indocumentados', 'cidadania',
        'cartão verde', 'cidades santuário', 'aplicação da imigração', 'reassentamento de refugiados',
        'pedidos de asilo', 'patrulha da fronteira', 'lei de imigração', 'separação familiar'
      ],
      'ru': [
        'иммиграция', 'пограничная безопасность', 'просители убежища', 'визовая политика',
        'кризис беженцев', 'трудящиеся-мигранты', 'депортация', 'иммиграционная реформа',
        'пограничная стена', 'легальная иммиграция', 'нелегальные иммигранты', 'гражданство',
        'грин-карта', 'города-убежища', 'иммиграционное право', 'расселение беженцев',
        'заявления о предоставлении убежища', 'пограничный патруль', 'иммиграционное законодательство', 'разлучение семей'
      ],
      'zh': [
        '移民', '边境安全', '寻求庇护者', '签证政策',
        '难民危机', '移民工人', '驱逐出境', '移民改革',
        '边界墙', '合法移民', '无证移民', '公民身份',
        '绿卡', '庇护城市', '移民执法', '难民安置',
        '庇护申请', '边境巡逻', '移民法', '家庭分离'
      ],
      'ar': [
        'الهجرة', 'أمن الحدود', 'طالبي اللجوء', 'سياسة التأشيرات',
        'أزمة اللاجئين', 'العمال المهاجرين', 'الترحيل', 'إصلاح الهجرة',
        'جدار الحدود', 'الهجرة القانونية', 'المهاجرين غير الموثقين', 'المواطنة',
        'البطاقة الخضراء', 'المدن الملاذ', 'إنفاذ الهجرة', 'إعادة توطين اللاجئين',
        'طلبات اللجوء', 'دورية الحدود', 'قانون الهجرة', 'فصل الأسر'
      ],
      'he': [
        'הגירה', 'ביטחון גבולות', 'מבקשי מקלט', 'מדיניות ויזה',
        'משבר פליטים', 'עובדים זרים', 'גירוש', 'רפורמה בהגירה',
        'חומת גבול', 'הגירה חוקית', 'מהגרים לא חוקיים', 'אזרחות',
        'גרין קארד', 'ערי מקלט', 'אכיפת הגירה', 'יישוב פליטים',
        'בקשות מקלט', 'סיור גבול', 'חוק הגירה', 'הפרדת משפחות'
      ],
      'nl': [
        'immigratie', 'grensbeveiliging', 'asielzoekers', 'visumbeleid',
        'vluchtelingencrisis', 'migrantenwerknemers', 'deportatie', 'immigratiehervorming',
        'grensmuur', 'legale immigratie', 'illegale immigranten', 'burgerschap',
        'green card', 'sanctuary steden', 'immigratiehandhaving', 'hervestiging vluchtelingen',
        'asielaanvragen', 'grenspatrouille', 'immigratierecht', 'gezinsscheiding'
      ],
      'no': [
        'immigrasjon', 'grensetrygghet', 'asylsøkere', 'visumpolitikk',
        'flyktningkrise', 'migrantarbeidere', 'deportasjon', 'innvandringsreform',
        'grensemur', 'legal innvandring', 'udokumenterte innvandrere', 'statsborgerskap',
        'green card', 'sanctuary byer', 'innvandringshåndhevelse', 'flyktningbosetting',
        'asylsøknader', 'grensepatrulje', 'innvandringslov', 'familieskillelse'
      ],
      'sv': [
        'invandring', 'gränssäkerhet', 'asylsökande', 'visumpolitik',
        'flyktingkris', 'migrantarbetare', 'deportation', 'invandrarreform',
        'gränsmur', 'legal invandring', 'papperslösa invandrare', 'medborgarskap',
        'green card', 'sanctuary städer', 'invandrarlagstiftning', 'flyktingbosättning',
        'asylansökningar', 'gränspatrull', 'invandringslag', 'familjeseparation'
      ],
      'ud': [
        'امیگریشن', 'سرحدی سیکیورٹی', 'پناہ گزین', 'ویزا پالیسی',
        'مہاجرین کا بحران', 'مہاجر مزدور', 'ملک بدری', 'امیگریشن اصلاحات',
        'سرحدی دیوار', 'قانونی امیگریشن', 'غیر دستاویزی مہاجرین', 'شہریت',
        'گرین کارڈ', 'محفوظ شہر', 'امیگریشن نافذی', 'مہاجرین کی آبادکاری',
        'پناہ کی درخواستیں', 'سرحدی گشت', 'امیگریشن قانون', 'خاندانی علیحدگی'
      ]
    },
    fallbackKeywords: [
      'immigration', 'border security', 'asylum seekers', 'visa policy',
      'refugee crisis', 'migrant workers', 'deportation', 'immigration reform'
    ]
  },
  {
    topic: 'Economy',
    keywords: [], // Legacy - kept for compatibility
    multiLanguageKeywords: {
      'en': [
        'economy', 'economic growth', 'inflation', 'unemployment', 'job market',
        'gdp', 'recession', 'interest rates', 'federal reserve', 'stock market',
        'economic policy', 'trade war', 'tariffs', 'minimum wage', 'economic recovery',
        'fiscal policy', 'monetary policy', 'consumer spending', 'housing market', 'economic inequality'
      ],
      'es': [
        'economía', 'crecimiento económico', 'inflación', 'desempleo', 'mercado laboral',
        'pib', 'recesión', 'tasas de interés', 'reserva federal', 'mercado de valores',
        'política económica', 'guerra comercial', 'aranceles', 'salario mínimo', 'recuperación económica',
        'política fiscal', 'política monetaria', 'gasto del consumidor', 'mercado inmobiliario', 'desigualdad económica'
      ],
      'fr': [
        'économie', 'croissance économique', 'inflation', 'chômage', 'marché du travail',
        'pib', 'récession', 'taux dintérêt', 'réserve fédérale', 'marché boursier',
        'politique économique', 'guerre commerciale', 'tarifs', 'salaire minimum', 'reprise économique',
        'politique fiscale', 'politique monétaire', 'dépenses des consommateurs', 'marché immobilier', 'inégalité économique'
      ],
      'de': [
        'wirtschaft', 'wirtschaftswachstum', 'inflation', 'arbeitslosigkeit', 'arbeitsmarkt',
        'bip', 'rezession', 'zinssätze', 'federal reserve', 'aktienmarkt',
        'wirtschaftspolitik', 'handelskrieg', 'zölle', 'mindestlohn', 'wirtschaftserholung',
        'fiskalpolitik', 'geldpolitik', 'verbraucherausgaben', 'wohnungsmarkt', 'wirtschaftliche ungleichheit'
      ],
      'it': [
        'economia', 'crescita economica', 'inflazione', 'disoccupazione', 'mercato del lavoro',
        'pil', 'recessione', 'tassi di interesse', 'federal reserve', 'mercato azionario',
        'politica economica', 'guerra commerciale', 'tariffe', 'salario minimo', 'ripresa economica',
        'politica fiscale', 'politica monetaria', 'spesa dei consumatori', 'mercato immobiliare', 'disuguaglianza economica'
      ],
      'pt': [
        'economia', 'crescimento económico', 'inflação', 'desemprego', 'mercado de trabalho',
        'pib', 'recessão', 'taxas de juros', 'reserva federal', 'mercado de ações',
        'política económica', 'guerra comercial', 'tarifas', 'salário mínimo', 'recuperação económica',
        'política fiscal', 'política monetária', 'gastos do consumidor', 'mercado imobiliário', 'desigualdade económica'
      ],
      'ru': [
        'экономика', 'экономический рост', 'инфляция', 'безработица', 'рынок труда',
        'ввп', 'рецессия', 'процентные ставки', 'федеральная резервная система', 'фондовый рынок',
        'экономическая политика', 'торговая война', 'тарифы', 'минимальная заработная плата', 'восстановление экономики',
        'фискальная политика', 'денежно-кредитная политика', 'потребительские расходы', 'рынок недвижимости', 'экономическое неравенство'
      ],
      'zh': [
        '经济', '经济增长', '通胀', '失业', '就业市场',
        '国内生产总值', '衰退', '利率', '美联储', '股市',
        '经济政策', '贸易战', '关税', '最低工资', '经济复苏',
        '财政政策', '货币政策', '消费者支出', '房地产市场', '经济不平等'
      ],
      'ar': [
        'الاقتصاد', 'النمو الاقتصادي', 'التضخم', 'البطالة', 'سوق العمل',
        'الناتج المحلي الإجمالي', 'الركود', 'أسعار الفائدة', 'الاحتياطي الفيدرالي', 'سوق الأسهم',
        'السياسة الاقتصادية', 'الحرب التجارية', 'التعريفات', 'الحد الأدنى للأجور', 'الانتعاش الاقتصادي',
        'السياسة المالية', 'السياسة النقدية', 'الإنفاق الاستهلاكي', 'سوق الإسكان', 'عدم المساواة الاقتصادية'
      ],
      'he': [
        'כלכלה', 'צמיחה כלכלית', 'אינפלציה', 'אבטלה', 'שוק העבודה',
        'תמ"ג', 'מיתון', 'ריבית', 'הבנק המרכזי', 'בורסה',
        'מדיניות כלכלית', 'מלחמת סחר', 'מכסים', 'שכר מינימום', 'התאוששות כלכלית',
        'מדיניות פיסקלית', 'מדיניות מוניטרית', 'הוצאות צרכנים', 'שוק הנדלן', 'אי-שוויון כלכלי'
      ],
      'nl': [
        'economie', 'economische groei', 'inflatie', 'werkloosheid', 'arbeidsmarkt',
        'bbp', 'recessie', 'rentetarieven', 'federal reserve', 'aandelenmarkt',
        'economisch beleid', 'handelsoorlog', 'tarieven', 'minimumloon', 'economisch herstel',
        'fiscaal beleid', 'monetair beleid', 'consumentenuitgaven', 'woningmarkt', 'economische ongelijkheid'
      ],
      'no': [
        'økonomi', 'økonomisk vekst', 'inflasjon', 'arbeidsledighet', 'arbeidsmarked',
        'bnp', 'resesjon', 'renter', 'sentralbank', 'aksjemarked',
        'økonomisk politikk', 'handelskrig', 'toll', 'minstelønn', 'økonomisk oppgang',
        'finanspolitikk', 'pengepolitikk', 'forbruk', 'boligmarked', 'økonomisk ulikhet'
      ],
      'sv': [
        'ekonomi', 'ekonomisk tillväxt', 'inflation', 'arbetslöshet', 'arbetsmarknad',
        'bnp', 'recession', 'räntor', 'centralbank', 'aktiemarknad',
        'ekonomisk politik', 'handelskrig', 'tullar', 'minimilön', 'ekonomisk återhämtning',
        'finanspolitik', 'penningpolitik', 'konsumtion', 'bostadsmarknad', 'ekonomisk ojämlikhet'
      ],
      'ud': [
        'معیشت', 'اقتصادی ترقی', 'مہنگائی', 'بے روزگاری', 'ملازمت کی منڈی',
        'جی ڈی پی', 'کساد بازاری', 'سود کی شرح', 'وفاقی ریزرو', 'اسٹاک مارکیٹ',
        'اقتصادی پالیسی', 'تجارتی جنگ', 'محصولات', 'کم سے کم اجرت', 'اقتصادی بحالی',
        'مالیاتی پالیسی', 'مالیاتی پالیسی', 'صارفین کے اخراجات', 'مکانات کی منڈی', 'اقتصادی عدم مساوات'
      ]
    },
    fallbackKeywords: [
      'economy', 'economic growth', 'inflation', 'unemployment', 'job market',
      'gdp', 'recession', 'interest rates'
    ]
  },
  {
    topic: 'Technology',
    keywords: [], // Legacy - kept for compatibility
    multiLanguageKeywords: {
      'en': [
        'technology', 'artificial intelligence', 'AI', 'machine learning', 'data privacy',
        'cybersecurity', 'digital privacy', 'tech regulation', 'social media', 'big tech',
        'data protection', 'internet privacy', 'cryptocurrency', 'blockchain', 'automation',
        'digital transformation', 'tech innovation', 'surveillance technology', 'algorithm bias', 'tech monopoly'
      ],
      'es': [
        'tecnología', 'inteligencia artificial', 'IA', 'aprendizaje automático', 'privacidad de datos',
        'ciberseguridad', 'privacidad digital', 'regulación tecnológica', 'redes sociales', 'grandes tecnológicas',
        'protección de datos', 'privacidad de internet', 'criptomoneda', 'blockchain', 'automatización',
        'transformación digital', 'innovación tecnológica', 'tecnología de vigilancia', 'sesgo algorítmico', 'monopolio tecnológico'
      ],
      'fr': [
        'technologie', 'intelligence artificielle', 'IA', 'apprentissage automatique', 'confidentialité des données',
        'cybersécurité', 'confidentialité numérique', 'réglementation technologique', 'réseaux sociaux', 'grandes technologies',
        'protection des données', 'confidentialité internet', 'cryptomonnaie', 'blockchain', 'automatisation',
        'transformation numérique', 'innovation technologique', 'technologie de surveillance', 'biais algorithmique', 'monopole technologique'
      ],
      'de': [
        'technologie', 'künstliche intelligenz', 'ki', 'maschinelles lernen', 'datenschutz',
        'cybersicherheit', 'digitaler datenschutz', 'tech-regulierung', 'soziale medien', 'big tech',
        'datenschutz', 'internet-privatsphäre', 'kryptowährung', 'blockchain', 'automatisierung',
        'digitale transformation', 'tech-innovation', 'überwachungstechnologie', 'algorithmus-bias', 'tech-monopol'
      ],
      'it': [
        'tecnologia', 'intelligenza artificiale', 'IA', 'apprendimento automatico', 'privacy dei dati',
        'sicurezza informatica', 'privacy digitale', 'regolamentazione tecnologica', 'social media', 'big tech',
        'protezione dati', 'privacy internet', 'criptovaluta', 'blockchain', 'automazione',
        'trasformazione digitale', 'innovazione tecnologica', 'tecnologia di sorveglianza', 'bias algoritmico', 'monopolio tecnologico'
      ],
      'pt': [
        'tecnologia', 'inteligência artificial', 'IA', 'aprendizado de máquina', 'privacidade de dados',
        'cibersegurança', 'privacidade digital', 'regulação tecnológica', 'mídias sociais', 'big tech',
        'proteção de dados', 'privacidade na internet', 'criptomoeda', 'blockchain', 'automação',
        'transformação digital', 'inovação tecnológica', 'tecnologia de vigilância', 'viés algorítmico', 'monopólio tecnológico'
      ],
      'ru': [
        'технологии', 'искусственный интеллект', 'ИИ', 'машинное обучение', 'конфиденциальность данных',
        'кибербезопасность', 'цифровая приватность', 'технологическое регулирование', 'социальные сети', 'большие технологии',
        'защита данных', 'интернет-конфиденциальность', 'криптовалюта', 'блокчейн', 'автоматизация',
        'цифровая трансформация', 'технологические инновации', 'технология слежения', 'алгоритмическое предвзятость', 'технологическая монополия'
      ],
      'zh': [
        '技术', '人工智能', 'AI', '机器学习', '数据隐私',
        '网络安全', '数字隐私', '技术监管', '社交媒体', '大科技',
        '数据保护', '互联网隐私', '加密货币', '区块链', '自动化',
        '数字化转型', '技术创新', '监控技术', '算法偏见', '技术垄断'
      ],
      'ar': [
        'التكنولوجيا', 'الذكاء الاصطناعي', 'الذكاء الاصطناعي', 'التعلم الآلي', 'خصوصية البيانات',
        'الأمن السيبراني', 'الخصوصية الرقمية', 'تنظيم التكنولوجيا', 'وسائل التواصل الاجتماعي', 'التكنولوجيا الكبرى',
        'حماية البيانات', 'خصوصية الإنترنت', 'العملة المشفرة', 'البلوك تشين', 'الأتمتة',
        'التحول الرقمي', 'الابتكار التكنولوجي', 'تكنولوجيا المراقبة', 'تحيز الخوارزمية', 'احتكار التكنولوجيا'
      ],
      'he': [
        'טכנולוגיה', 'בינה מלאכותית', 'בינה מלאכותית', 'למידת מכונה', 'פרטיות נתונים',
        'אבטחת סייבר', 'פרטיות דיגיטלית', 'רגולציה טכנולוגית', 'מדיה חברתית', 'טק גדול',
        'הגנת נתונים', 'פרטיות באינטרנט', 'מטבע דיגיטלי', 'בלוקצ׳יין', 'אוטומציה',
        'טרנספורמציה דיגיטלית', 'חדשנות טכנולוגית', 'טכנולוגיית מעקב', 'הטיה אלגוריתמית', 'מונופול טכנולוגי'
      ],
      'nl': [
        'technologie', 'kunstmatige intelligentie', 'AI', 'machine learning', 'gegevensprivacy',
        'cyberbeveiliging', 'digitale privacy', 'tech-regulatie', 'sociale media', 'big tech',
        'gegevensbescherming', 'internetprivacy', 'cryptocurrency', 'blockchain', 'automatisering',
        'digitale transformatie', 'tech-innovatie', 'surveillancetechnologie', 'algoritme-bias', 'tech-monopolie'
      ],
      'no': [
        'teknologi', 'kunstig intelligens', 'AI', 'maskinlæring', 'datapersonvern',
        'cybersikkerhet', 'digitalt personvern', 'teknologiregulering', 'sosiale medier', 'big tech',
        'databeskyttelse', 'internett personvern', 'kryptovaluta', 'blockchain', 'automatisering',
        'digital transformasjon', 'teknologisk innovasjon', 'overvåkningsteknologi', 'algoritme-skjevhet', 'teknologi-monopol'
      ],
      'sv': [
        'teknik', 'artificiell intelligens', 'AI', 'maskininlärning', 'datasekretess',
        'cybersäkerhet', 'digital integritet', 'teknikreglering', 'sociala medier', 'big tech',
        'dataskydd', 'internetintegritet', 'kryptovaluta', 'blockchain', 'automatisering',
        'digital transformation', 'teknisk innovation', 'övervakningsteknik', 'algoritm-bias', 'teknikmonopol'
      ],
      'ud': [
        'ٹیکنالوجی', 'مصنوعی ذہانت', 'اے آئی', 'مشین لرننگ', 'ڈیٹا کی رازداری',
        'سائبر سیکیورٹی', 'ڈیجیٹل رازداری', 'ٹیک ریگولیشن', 'سوشل میڈیا', 'بڑی ٹیک',
        'ڈیٹا کا تحفظ', 'انٹرنیٹ کی رازداری', 'کرپٹو کرنسی', 'بلاک چین', 'آٹومیشن',
        'ڈیجیٹل تبدیلی', 'ٹیک انوویشن', 'نگرانی ٹیکنالوجی', 'الگورتھم بائس', 'ٹیک اجارہ داری'
      ]
    },
    fallbackKeywords: [
      'technology', 'artificial intelligence', 'AI', 'machine learning', 'data privacy',
      'cybersecurity', 'digital privacy', 'tech regulation'
    ]
  }
  // Additional topics (Politics & Government, Education, Crime & Safety, Sports, Entertainment & Culture, 
  // International Affairs, Science & Research) will be added as needed
]

/**
 * Helper function to get keywords for a specific topic and language
 * Falls back to English if the requested language is not available
 */
export function getKeywordsForLanguage(
  topic: string, 
  language: NewsLanguage
): string[] {
  const topicData = MULTI_LANGUAGE_TOPICS.find(t => t.topic === topic)
  if (!topicData?.multiLanguageKeywords) {
    return []
  }
  
  // Try requested language first
  const languageKeywords = topicData.multiLanguageKeywords[language]
  if (languageKeywords && languageKeywords.length > 0) {
    return languageKeywords
  }
  
  // Fallback to English
  const englishKeywords = topicData.multiLanguageKeywords['en']
  if (englishKeywords && englishKeywords.length > 0) {
    return englishKeywords
  }
  
  // Final fallback to fallback keywords
  return topicData.fallbackKeywords || []
}

/**
 * Helper function to get all available languages for a topic
 */
export function getAvailableLanguagesForTopic(topic: string): NewsLanguage[] {
  const topicData = MULTI_LANGUAGE_TOPICS.find(t => t.topic === topic)
  if (!topicData?.multiLanguageKeywords) {
    return ['en'] // Default to English
  }
  
  return Object.keys(topicData.multiLanguageKeywords) as NewsLanguage[]
}