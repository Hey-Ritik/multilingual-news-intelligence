import re
import uuid
from typing import List, Dict, Optional, Tuple
from app.schemas.framing import (
    FramingEvidence,
    FramingCategory,
    FramingAnalysisResult,
    BiasVerdict,
    AttributionType,
    PortrayalDirection,
    EntityPortrayalImpact,
    PsychologicalMechanism,
    NeutralityCheck
)
from app.schemas.nlp import NamedEntity, EntityType
from app.utils.unicode_utils import (
    validate_offset_slice,
    split_into_sentences_with_offsets,
    count_words_and_tokens
)

# ---------------------------------------------------------------------------
# Multilingual Cue Dictionaries across English, Hindi, Kannada, Telugu, Tamil
# ---------------------------------------------------------------------------

LOADED_AND_PEJORATIVE_WORDS = {
    "en": [
        ("ruthless", "High-intensity derogatory adjective characterizing an actor as without pity or compassion", "high", PortrayalDirection.NEGATIVE),
        ("draconian", "Pejorative label framing a policy or judicial action as excessively harsh and autocratic", "high", PortrayalDirection.NEGATIVE),
        ("catastrophic", "Hyperbolic evaluation emphasizing disaster over objective impact", "high", PortrayalDirection.NEGATIVE),
        ("spectacular", "Excessively laudatory framing boosting achievement beyond factual measure", "medium", PortrayalDirection.POSITIVE),
        ("shameful", "Moralizing judgmental term steering reader condemnation", "high", PortrayalDirection.NEGATIVE),
        ("heroic", "Romanticized laudatory portrayal elevating an actor above journalistic neutrality", "medium", PortrayalDirection.POSITIVE),
        ("puppet", "Dehumanizing epithet invalidating an actor's independence and agency", "high", PortrayalDirection.NEGATIVE),
        ("radical", "Polarizing political label framing an entity as outside acceptable norms", "medium", PortrayalDirection.NEGATIVE),
        ("arrogant", "Attributive character judgment without empirical factual evidence", "medium", PortrayalDirection.NEGATIVE),
        ("devastating", "Affective modifier emphasizing crushing impact rather than measured consequence", "high", PortrayalDirection.NEGATIVE),
        ("tyrannical", "Extreme authoritarian label framing governance as illegitimate and cruel", "high", PortrayalDirection.NEGATIVE),
        ("authoritarian", "Evaluative political label asserting anti-democratic control", "medium", PortrayalDirection.NEGATIVE),
        ("brutal", "High-intensity violent modifier characterizing police or institutional action", "high", PortrayalDirection.NEGATIVE),
        ("sinister", "Affective term imputing covert malicious intent", "high", PortrayalDirection.NEGATIVE),
        ("crushing", "Hyperbolic descriptor amplifying destruction or defeat", "medium", PortrayalDirection.NEGATIVE),
        ("corrupt", "Direct moral condemnation asserting ethical and legal depravity", "high", PortrayalDirection.NEGATIVE),
        ("mastermind", "Sensationalized criminal agency framing implying deliberate conspiracy", "medium", PortrayalDirection.NEGATIVE)
    ],
    "hi": [
        ("क्रूर", "कठोर और नकारात्मक रूप से किसी पात्र को चित्रित करने वाला शब्द", "high", PortrayalDirection.NEGATIVE),
        ("तानाशाही", "सत्तावादी और असंवैधानिक व्यवस्था दर्शाने वाला शब्द", "high", PortrayalDirection.NEGATIVE),
        ("विनाशकारी", "अत्यधिक नकारात्मक और नाटकीय प्रभाव पैदा करने वाला शब्द", "high", PortrayalDirection.NEGATIVE),
        ("शर्मनाक", "नैतिक रूप से निंदा करने वाला विशेषण", "high", PortrayalDirection.NEGATIVE),
        ("कठपुतली", "स्वतंत्रता और स्वायत्तता को नकारने वाला शब्द", "high", PortrayalDirection.NEGATIVE),
        ("दमनकारी", "सत्ता द्वारा जनता या विपक्ष को दबाने का आरोप लगाने वाला शब्द", "high", PortrayalDirection.NEGATIVE),
        ("बर्बर", "अमानवीय और हिंसक कार्रवाई का आरोप लगाने वाला शब्द", "high", PortrayalDirection.NEGATIVE),
        ("ऐतिहासिक विजय", "अतिशयोक्तिपूर्ण प्रशंसात्मक चित्रण", "medium", PortrayalDirection.POSITIVE),
        ("भयंकर", "गंभीर भय और संकट उत्पन्न करने वाला विशेषण", "medium", PortrayalDirection.NEGATIVE),
        ("असंवैधानिक", "कानूनी वैधता को खारिज करने वाला आरोप", "high", PortrayalDirection.NEGATIVE),
        ("फर्जी", "किसी प्रक्रिया या दावे को पूरी तरह झूठा ठहराने वाला शब्द", "high", PortrayalDirection.NEGATIVE)
    ],
    "kn": [
        ("ಕ್ರೂರ", "ನಕಾರಾತ್ಮಕ ಮತ್ತು ಕಠಿಣ ಚಿತ್ರಣ ನೀಡುವ ಪದ", "high", PortrayalDirection.NEGATIVE),
        ("ಸರ್ವಾಧಿಕಾರಿ", "ಪ್ರಜಾಪ್ರಭುತ್ವ ವಿರೋಧಿ ಎಂದು ಬಿಂಬಿಸುವ ಲೇಬಲ್", "high", PortrayalDirection.NEGATIVE),
        ("ನಾಚಿಕೆಗೇಡು", "ನೈತಿಕ ಖಂಡನೆಯನ್ನು ಪ್ರಚೋದಿಸುವ ಪದ", "high", PortrayalDirection.NEGATIVE),
        ("ವಿನಾಶಕಾರಿ", "ತೀವ್ರ ಹಾನಿಯನ್ನು ಬಿಂಬಿಸುವ ಅತಿಶಯೋಕ್ತಿ", "high", PortrayalDirection.NEGATIVE),
        ("ದಬ್ಬಾಳಿಕೆ", "ಅಧಿಕಾರ ದುರುಪಯೋಗವನ್ನು ಬಿಂಬಿಸುವ ಪದ", "high", PortrayalDirection.NEGATIVE),
        ("ಅಸಂವಿಧಾನಿಕ", "ಕಾನೂನು ಬಾಹಿರವೆಂದು ಪ್ರತಿಪಾದಿಸುವ ಆರೋಪ", "high", PortrayalDirection.NEGATIVE)
    ],
    "te": [
        ("క్రూరమైన", "తీవ్రమైన వ్యతిరేక భావనను కలిగించే పదం", "high", PortrayalDirection.NEGATIVE),
        ("నిరంకుశ", "అధికార దుర్వినియోగాన్ని సూచించే పదం", "high", PortrayalDirection.NEGATIVE),
        ("సిగ్గుచేటు", "నైతిక విమర్శను రేకెత్తించే పదం", "high", PortrayalDirection.NEGATIVE),
        ("వినాశకరమైన", "తీవ్ర నష్టాన్ని సూచించే భావోద్వేగ పదం", "high", PortrayalDirection.NEGATIVE),
        ("అణచివేత", "రాజకీయ వేధింపులను సూచించే పదం", "high", PortrayalDirection.NEGATIVE),
        ("దౌర్జన్యం", "ప్రభుత్వ చర్యలను అన్యాయంగా వర్ణించే పదం", "high", PortrayalDirection.NEGATIVE)
    ],
    "ta": [
        ("கொடூரமான", "கடும் எதிர்மறை சித்தரிப்பு தரும் சொல்", "high", PortrayalDirection.NEGATIVE),
        ("சர்வாதிகார", "ஜனநாயக விரோத முத்திரை குத்தும் சொல்", "high", PortrayalDirection.NEGATIVE),
        ("வெட்கக்கேடான", "தார்மீக கண்டனம் தூண்டும் சொல்", "high", PortrayalDirection.NEGATIVE),
        ("பேரழிவு", "கடும் அழிவை மிகைப்படுத்தும் சொல்", "high", PortrayalDirection.NEGATIVE),
        ("அடக்குமுறை", "அதிகார அத்துமீறலை குறிக்கும் சொல்", "high", PortrayalDirection.NEGATIVE),
        ("அராஜக", "சட்ட விரோத செயலாக சித்தரிக்கும் சொல்", "high", PortrayalDirection.NEGATIVE)
    ]
}

SENSATIONALISM_WORDS = {
    "en": [
        ("shocking", "Sensationalized adjective priming reader disbelief", "medium"),
        ("bombshell", "Metaphorical noun exaggerating revelation severity", "high"),
        ("bloodbath", "Violent hyperbole describing political or financial losses", "high"),
        ("explosive revelation", "Dramatized framing elevating routine findings", "high"),
        ("massive scandal", "Unqualified scalar amplification", "medium"),
        ("historic meltdown", "Catastrophic hyperbole", "high")
    ],
    "hi": [
        ("सनसनीखेज", "पाठकों में अत्यधिक उत्तेजना पैदा करने वाला शब्द", "medium"),
        ("महाघोटाला", "घोटाले के आकार को नाटकीय रूप से बढ़ाने वाला शब्द", "high"),
        ("विस्फोटक", "नाटकीय और अप्रत्याशित प्रभाव दर्शाने वाला रूपक", "high"),
        ("भूचाल", "राजनीतिक या सामाजिक संकट का अतिरंजित रूपक", "medium"),
        ("तहलका", "उत्तेजना और अशांति पैदा करने वाला शब्द", "medium")
    ],
    "kn": [
        ("ಸಂಚಲನ", "ಅತಿಯಾದ ಕುತೂಹಲ ಕೆರಳಿಸುವ ಸಂವೇದನಾಶೀಲ ಪದ", "medium"),
        ("ಮಹಾ ಹಗರಣ", "ಘಟನೆಯ ತೀವ್ರತೆಯನ್ನು ಅತಿಯಾಗಿ ವರ್ಣಿಸುವ ಪದ", "high"),
        ("ಸ್ಫೋಟಕ", "ಅನಿರೀಕ್ಷಿತ ಆಘಾತಕಾರಿ ಪರಿಣಾಮವನ್ನು ಬಿಂಬಿಸುವ ಪದ", "high")
    ],
    "te": [
        ("సంచలన", "తీవ్ర ఉత్కంఠను రేకెత్తించే పదజాలం", "medium"),
        ("మహా కుంభకోణం", "అతిశయోక్తితో కూడిన ఆరోపణ", "high"),
        ("పేలుడు", "నాటకీయ ప్రభావాన్ని కలిగించే రూపకం", "high")
    ],
    "ta": [
        ("அதிரடி", "பரபரப்பை தூண்டும் சொல்", "medium"),
        ("மெகா ஊழல்", "அளவை மிகைப்படுத்தி கூறும் சொல்", "high"),
        ("வெடிக்குண்டாக", "அதிர்ச்சி தரும் தகவலாக நாடகமாக்கும் சொல்", "high")
    ]
}

GENERALIZATION_WORDS = {
    "en": ["always", "never", "everyone", "nobody", "all citizens", "completely", "without doubt", "unquestionably", "every single", "universally"],
    "hi": ["हमेशा", "कभी नहीं", "हर कोई", "कोई नहीं", "सभी नागरिक", "पूरी तरह", "निःसंदेह", "शत-प्रतिशत"],
    "kn": ["ಯಾವಾಗಲೂ", "ಎಂದಿಗೂ", "ಎಲ್ಲರೂ", "ಯಾರೂ ಇಲ್ಲ", "ಸಂಪೂರ್ಣವಾಗಿ", "ನಿಸ್ಸಂದೇಹವಾಗಿ"],
    "te": ["ఎల్లప్పుడూ", "ఎప్పుడూ", "అందరూ", "ఎవరూ లేరు", "పూర్తిగా", "నిస్సందేహంగా"],
    "ta": ["எப்போதும்", "ஒருபோதும்", "அனைவரும்", "யாரும் இல்லை", "முற்றிலும்", "சந்தேகமின்றி"]
}

FEAR_AND_THREAT_APPEALS = {
    "en": [
        ("grave threat", "Amplifies existential peril to induce reader anxiety", "high"),
        ("looming catastrophe", "Catastrophizing impending disaster", "high"),
        ("existential danger", "Heightens perceived vulnerability", "high"),
        ("dark days ahead", "Ominous temporal metaphor triggering helplessness", "medium"),
        ("attack on democracy", "Frames legal or political dispute as systemic existential crisis", "high")
    ],
    "hi": [
        ("भयानक खतरा", "गंभीर भय और असुरक्षा पैदा करने वाला वाक्यांश", "high"),
        ("अस्तित्व का संकट", "अत्यधिक खतरे की भावना पैदा करने वाला दावा", "high"),
        ("लोकतंत्र पर हमला", "कानूनी कार्रवाई को व्यवस्थागत संकट के रूप में पेश करना", "high"),
        ("काला साया", "अशुभ भविष्य की चेतावनी देने वाला रूपक", "medium")
    ],
    "kn": [
        ("ಗಂಭೀರ ಬೆದರಿಕೆ", "ತೀವ್ರ ಆತಂಕ ಉಂಟುಮಾಡುವ ನುಡಿಗಟ್ಟು", "high"),
        ("ಪ್ರಜಾಪ್ರಭುತ್ವದ ಮೇಲಿನ ದಾಳಿ", "ವ್ಯವಸ್ಥಿತ ಅಸ್ತಿತ್ವದ ಬಿಕ್ಕಟ್ಟನ್ನು ಬಿಂಬಿಸುವ ಆರೋಪ", "high"),
        ("ಕರಾಳ ದಿನಗಳು", "ಭವಿಷ್ಯದ ಭೀತಿಯನ್ನು ಹುಟ್ಟಿಸುವ ರೂಪಕ", "medium")
    ],
    "te": [
        ("తీవ్ర ముప్పు", "భయాందోళనలను రేకెత్తించే పదజాలం", "high"),
        ("ప్రజాస్వామ్యంపై దాడి", "చట్టపరమైన చర్యను వ్యవస్థాగత ముప్పుగా చిత్రీకరించడం", "high"),
        ("అంధకార దినాలు", "భవిಷ್ಯత్తుపై అభద్రతను పెంచే రూపకం", "medium")
    ],
    "ta": [
        ("பயங்கர அச்சுறுத்தல்", "கடும் பயத்தை தூண்டும் சொற்றொடர்", "high"),
        ("ஜனநாயகத்தின் மீதான தாக்குதல்", "சட்ட நடவடிக்கையை பேராபத்தாக சித்தரிக்கும் சொல்", "high"),
        ("இருண்ட காலம்", "எதிர்காலம் பற்றிய அவநம்பிக்கையை தூண்டும் சொல்", "medium")
    ]
}

IN_GROUP_OUT_GROUP_WORDS = {
    "en": [
        ("enemies of the people", "De-legitimizing out-group label inciting public antagonism", "high"),
        ("traitors", "Extreme in-group disloyalty epithet", "high"),
        ("outsiders", "Nativist boundary enforcement marker", "medium"),
        ("anti-national", "Nationalistic out-group delegitimization", "high"),
        ("conspirators", "Imputes organized malicious foreign or internal plotting", "high"),
        ("true patriots", "Moral in-group elevation excluding dissenting citizens", "medium")
    ],
    "hi": [
        ("देशद्रोही", "विपक्ष या आलोचकों को राष्ट्र का शत्रु घोषित करने वाला शब्द", "high"),
        ("गद्दार", "गंभीर विश्वासघात का आरोप लगाने वाला शब्द", "high"),
        ("राष्ट्रविरोधी", "सहानುಭೂತಿहीन आउट-ग्रुप लेबल", "high"),
        ("साजिशकर्ता", "संगठित षड्यंत्र का आरोप लगाने वाला शब्द", "medium"),
        ("सच्चे देशभक्त", "अन्य नागरिकों को देशभक्ति से बाहर करने वाला वाक्यांश", "medium")
    ],
    "kn": [
        ("ದೇಶದ್ರೋಹಿಗಳು", "ತೀವ್ರ ರಾಷ್ಟ್ರೀಯ ನಿಷ್ಠಾಹೀನತೆಯ ಲೇಬಲ್", "high"),
        ("ಪಿತೂರಿಗಾರರು", "ದುರುದ್ದೇಶಪೂರಿತ ಸಂಚುಕೋರರೆಂದು ಬಿಂಬಿಸುವ ಪದ", "medium"),
        ("ನಿಜವಾದ ದೇಶಭಕ್ತರು", "ವಿರೋಧಿಗಳನ್ನು ಹೊರಗಿಡುವ ಪದ", "medium")
    ],
    "te": [
        ("దేశద్రోహులు", "తీవ్రమైన వ్యతిరేక ముద్ర వేసే పదం", "high"),
        ("కుట్రదారులు", "దురుద్దೇಶపూరిత కుట్రగా చిత్రీకరించే పదం", "medium"),
        ("నిజమైన దేశభక్తులు", "ఇతరులను వేరుచేసే స్వభావం గల పదం", "medium")
    ],
    "ta": [
        ("துரோகிகள்", "கடும் விசுவாசமின்மை முத்திரை குத்தும் சொல்", "high"),
        ("சதிகாரர்கள்", "சதித்திட்டம் தீட்டுபவர்களாக சித்தரிக்கும் சொல்", "medium"),
        ("உண்மையான தேசபக்தர்கள்", "மற்றவர்களை அந்நியப்படுத்தும் சொல்", "medium")
    ]
}

SYMPATHY_AND_VICTIMHOOD_WORDS = {
    "en": [
        ("targeted victimization", "Frames judicial process as intentional political persecution", "high"),
        ("witch hunt", "Historic metaphor delegitimizing official investigation", "high"),
        ("helpless victims", "Diminishes agency to evoke emotional protective sympathy", "medium"),
        ("political vendetta", "Alleges institutional instruments are weaponized for vengeance", "high")
    ],
    "hi": [
        ("राजनीतिक शिकार", "कानूनी कार्रवाई को पक्षपातपूर्ण उत्पीड़न बताने वाला दावा", "high"),
        ("बलि का बकरा", "व्यक्तिगत दोषारोपण से बचाने के लिए प्रयुक्त रूपक", "high"),
        ("राजनीतिक प्रतिशोध", "संस्थानों के दुरुपयोग का सीधा आरोप", "high")
    ],
    "kn": [
        ("ರಾಜಕೀಯ ಸೇಡು", "ತನಿಖಾ ಸಂಸ್ಥೆಗಳ ಕ್ರಮವನ್ನು ಸೇಡು ಎಂದು ಬಿಂಬಿಸುವ ಪದ", "high"),
        ("ಬಲಿಪಶು", "ನ್ಯಾಯಾಂಗ ಪ್ರಕ್ರಿಯೆಯನ್ನು ಕಿರುಕುಳ ಎಂದು ಕರೆಯುವ ಪದ", "high")
    ],
    "te": [
        ("రాజకీయ కక్ష", "చట్టబద్ధమైన చర్యలను కక్ష సాధింపుగా వర్ణించడం", "high"),
        ("బలిపశువు", "బాధిత ముద్ర వేసే ప్రయత్నం", "high")
    ],
    "ta": [
        ("பழிவாங்கும் நடவடிக்கை", "அரசு அமைப்புகளை பழிவாங்கும் கருவியாக சித்தரித்தல்", "high"),
        ("பலிஆடு", "பாதிக்கப்பட்டவராக காட்டும் சொல்லாடல்", "high")
    ]
}

HEDGING_TERMS = {
    "en": [
        ("allegedly", "Reports claim second-hand without affirming empirical validity"),
        ("reportedly", "Cites unverified external accounts to limit publisher liability"),
        ("purportedly", "Signals epistemic distance regarding stated veracity"),
        ("claimed", "Identifies statement as a contested assertion rather than established fact"),
        ("sources suggest", "Unidentified source attribution introducing informational uncertainty"),
        ("it is believed", "Passive epistemic hedge obscuring the asserting agent")
    ],
    "hi": [
        ("कथित तौर पर", "बिना सत्यापन के दावे को रिपोर्ट करने वाला वाक्यांश"),
        ("बताया जा रहा है", "अप्रत्यक्ष स्रोत का हवाला देकर विश्वसनीयता को सीमित करना"),
        ("दावा किया गया", "कथन को निर्विवाद तथ्य के बजाय पक्ष का दावा बताना"),
        ("सूत्रों के मुताबिक", "अनाम स्रोतों का सहारा लेकर अनिश्चितता दर्ज करना")
    ],
    "kn": [
        ("ವರದಿಗಳ ಪ್ರಕಾರ", "ದೃಢೀಕರಿಸದ ಬಾಹ್ಯ ಮೂಲಗಳನ್ನು ಉಲ್ಲೇಖಿಸುವ ಮಾತು"),
        ("ಆರೋಪಿಸಲಾಗಿದೆ", "ವಿವಾದಾತ್ಮಕ ಆರೋಪವೆಂದು ಸ್ಪಷ್ಟಪಡಿಸುವ ಪದ"),
        ("ತಿಳಿದುಬಂದಿದೆ", "ನೇರ ಸಾಕ್ಷ್ಯವಿಲ್ಲದೆ ವರದಿ ಮಾಡುವ ಶೈಲಿ")
    ],
    "te": [
        ("సమాచారం ప్రకారం", "ధృవీకరించని మూలాలను ఉదహరించే పదం"),
        ("ఆరోపించబడింది", "వాదనను వివాదాస్పదంగా చూపించే పదం"),
        ("తెలుస్తోంది", "ప్రత్యక్ష రుజువు లేకుండా పేర్కొనే తీరు")
    ],
    "ta": [
        ("கூறப்படுகிறது", "உறுதிப்படுத்தப்படாத தகவலை வெளிப்படுத்தும் சொல்"),
        ("தகவல்கள் தெரிவிக்கின்றன", "நேரடி ஆதாரமில்லாத செய்தியிடல் முறை"),
        ("குற்றம் சாட்டப்பட்டுள்ளது", "வழக்கை வெறும் குற்றச்சாட்டாக குறிக்கும் சொல்")
    ]
}

# ---------------------------------------------------------------------------
# Helper Functions
# ---------------------------------------------------------------------------

QUOTE_REGEX = re.compile(r'["“«]([^"”»]+)["”»]', re.UNICODE)

def extract_quote_spans(text: str) -> List[Tuple[int, int, str]]:
    """Returns (start_char, end_char, quote_content) for all enclosed quotes."""
    return [(m.start(), m.end(), m.group(1)) for m in QUOTE_REGEX.finditer(text)]

def determine_attribution(
    span_start: int,
    span_end: int,
    quote_spans: List[Tuple[int, int, str]],
    sentence_text: str
) -> Tuple[AttributionType, str]:
    """
    Classifies statement provenance into JOURNALIST_NARRATION, QUOTED_SPEAKER,
    or IDENTIFIED_SOURCE.
    """
    for q_start, q_end, _ in quote_spans:
        if q_start <= span_start and span_end <= q_end:
            return (
                AttributionType.QUOTED_SPEAKER,
                "Quoted direct speech enclosed in quotation marks. Reflects the quoted speaker's stance, not the journalist's narration."
            )

    attribution_verbs = [
        "said", "stated", "claimed", "alleged", "declared", "asserted",
        "according to", "argued", "added", "spokesperson", "officials",
        "कहा", "बताया", "दावा किया", "के अनुसार",
        "ಹೇಳಿದರು", "ತಿಳಿಸಿದರು", "ಪ್ರಕಾರ",
        "చెప్పారు", "తెలిపారు", "ప్రకారం",
        "கூறினார்", "தெரிவித்தார்", "படி"
    ]
    if any(verb in sentence_text.lower() for verb in attribution_verbs):
        return (
            AttributionType.IDENTIFIED_SOURCE,
            "Indirect reported attribution referencing an identified source or institutional statement."
        )

    return (
        AttributionType.JOURNALIST_NARRATION,
        "Direct journalistic narration without explicit quotation or attribution delimiters."
    )

def split_paragraphs_with_offsets(text: str) -> List[Dict[str, any]]:
    """Splits article into paragraphs with character offsets."""
    paragraphs = []
    # Match double line breaks or single line breaks with trailing whitespace
    pattern = re.compile(r'[^\n]+(?:\n{1,2}|$)', re.UNICODE)
    p_idx = 0
    for match in pattern.finditer(text):
        raw = match.group(0)
        p_text = raw.strip()
        if not p_text:
            continue
        lead_spaces = len(raw) - len(raw.lstrip())
        start = match.start() + lead_spaces
        end = start + len(p_text)
        paragraphs.append({
            "index": p_idx,
            "text": p_text,
            "start_offset": start,
            "end_offset": end
        })
        p_idx += 1
    return paragraphs

def compile_framing_pattern(word: str, lang: str) -> re.Pattern:
    """
    Compiles regex pattern for framing term matching.
    For English, uses word boundaries \b to avoid matching substrings inside other words.
    For Indic scripts (hi, kn, te, ta), \b fails due to Brahmic script Unicode classifications
    and adjacent punctuation/quotes. Direct escaped pattern matches native word stems accurately.
    """
    escaped = re.escape(word)
    if lang == "en":
        return re.compile(rf'\b{escaped}\b', re.IGNORECASE)
    return re.compile(escaped)

def associate_target_entity(
    sentence_text: str,
    entities: List[NamedEntity],
    category: FramingCategory
) -> Tuple[Optional[str], Optional[str]]:
    """
    Determines the most plausible target entity and affected group in the sentence.
    Matches named entities (including last names / acronyms), institutional keywords,
    and falls back to primary article subjects when available.
    """
    s_lower = sentence_text.lower()

    # 1. Direct or partial match against extracted named entities
    for ent in entities:
        ent_clean = ent.text.strip()
        if ent_clean.lower() in s_lower:
            group = ent.label.value if hasattr(ent.label, "value") else str(ent.label)
            return ent_clean, group
        tokens = [t for t in re.split(r'\s+', ent_clean) if len(t) > 3 and t.lower() not in {"delhi", "minister", "chief", "the", "state"}]
        for token in tokens:
            if re.search(rf'\b{re.escape(token)}\b', sentence_text, re.IGNORECASE):
                group = ent.label.value if hasattr(ent.label, "value") else str(ent.label)
                return ent_clean, group

    # 2. Check for common political / institutional acronyms & names
    org_keywords = [
        (r'\b(?:ed|enforcement directorate)\b', "Enforcement Directorate", "ORGANIZATION"),
        (r'\b(?:aap|aam aadmi party)\b', "Aam Aadmi Party (AAP)", "POLITICAL_PARTY"),
        (r'\b(?:bjp|bharatiya janata party)\b', "Bharatiya Janata Party (BJP)", "POLITICAL_PARTY"),
        (r'\b(?:congress|inc)\b', "Indian National Congress", "POLITICAL_PARTY"),
        (r'\b(?:cbi|police|court|judiciary|agencies)\b', "Law Enforcement & Judiciary", "INSTITUTION"),
        (r'\b(?:government|ministry|administration|govt)\b', "Government / State Institutions", "INSTITUTION"),
        (r'(?:ಸರ್ಕಾರ|ಜಾರಿ ನಿರ್ದೇಶನಾಲಯ|ಪೊಲೀಸ್|ನ್ಯಾಯಾಲಯ)', "Government / State Institutions", "INSTITUTION"),
        (r'(?:ప్రభుత్వం|ఈడీ|పోలీసులు|కోర్టు)', "Government / State Institutions", "INSTITUTION"),
        (r'(?:அரசு|அமலாக்கத்துறை|காவல்துறை|நீதிமன்றம்)', "Government / State Institutions", "INSTITUTION"),
        (r'(?:सरकार|प्रवर्तन निदेशालय|पुलिस|अदालत)', "Government / State Institutions", "INSTITUTION"),
    ]
    for pattern, org_name, org_group in org_keywords:
        if re.search(pattern, sentence_text, re.IGNORECASE):
            return org_name, org_group

    # 3. Contextual public / democratic institution fallbacks
    pub_terms = ["democracy", "citizens", "people", "public", "जनता", "ಜನರು", "ಪ್ರಜಾಪ್ರಭುತ್ವ", "ప్రజలు", "ప్రజాస్వామ్యం", "மக்கள்", "ஜனநாயகம்"]
    if any(term in s_lower for term in pub_terms):
        return "Democratic Process / General Public", "PUBLIC_DOMAIN"

    # 4. If category is sympathy or victimhood, default to accused party if known
    if category in (FramingCategory.SYMPATHY_APPEAL, FramingCategory.FEAR_APPEAL):
        for ent in entities:
            if (hasattr(ent.label, "value") and ent.label.value == "PERSON") or str(ent.label) == "PERSON":
                return ent.text, "PERSON"

    return None, None

def calculate_finding_confidence(
    strength: str,
    attribution: AttributionType,
    has_target: bool,
    lang: str
) -> Tuple[float, List[str]]:
    """
    Calculates a transparent, uncalibrated confidence score (0.40 - 0.95)
    with documented contributing factors.
    """
    factors = []
    base_scores = {"high": 0.85, "medium": 0.70, "low": 0.55}
    score = base_scores.get(strength, 0.65)
    factors.append(f"Base linguistic cue intensity: {strength} (Score: {score:.2f})")

    if attribution == AttributionType.JOURNALIST_NARRATION:
        score += 0.05
        factors.append("Direct editorial narration (+0.05 confidence)")
    elif attribution == AttributionType.QUOTED_SPEAKER:
        score -= 0.08
        factors.append("Quoted source attribution (-0.08: reflects speaker stance rather than unprompted editorial bias)")
    elif attribution == AttributionType.IDENTIFIED_SOURCE:
        score -= 0.03
        factors.append("Indirect attribution to named source (-0.03)")

    if has_target:
        score += 0.05
        factors.append("Corroborated target entity within sentence span (+0.05)")

    if lang == "en":
        factors.append("Validated high-coverage English lexical profile")
    else:
        score -= 0.02
        factors.append(f"Native script match ({lang.upper()}) with Indic lexical morphology (-0.02 adjustment)")

    final_score = round(max(0.40, min(0.95, score)), 2)
    return final_score, factors

# ---------------------------------------------------------------------------
# Main Analysis Function
# ---------------------------------------------------------------------------

def analyze_bias_and_framing(
    text: str,
    language_code: str,
    entities: List[NamedEntity]
) -> FramingAnalysisResult:
    """
    Comprehensive, explainable bias and framing analysis system across 5 target languages.
    Produces one of three prominent verdicts:
    - POTENTIAL BIAS DETECTED
    - NO CLEAR BIAS DETECTED
    - INSUFFICIENT EVIDENCE
    """
    # 1. Check for Insufficient Text
    word_count, token_count = count_words_and_tokens(text)
    sentences = split_into_sentences_with_offsets(text)
    paragraphs = split_paragraphs_with_offsets(text)

    if word_count < 30 or len(sentences) < 2 or len(text.strip()) < 100:
        return FramingAnalysisResult(
            verdict=BiasVerdict.INSUFFICIENT_EVIDENCE,
            verdict_summary="The submitted text contains insufficient content (under 30 words or 2 sentences) to reliably evaluate systematic linguistic framing, source balance, or editorial bias.",
            verdict_confidence=0.90,
            verdict_confidence_label="System confidence score (uncalibrated)",
            verdict_confidence_reasoning="High certainty that article length is inadequate for reliable linguistic sampling.",
            findings=[],
            category_counts={},
            density_per_1000_tokens=0.0,
            article_level_assessment="Text is too brief to substantiate analytical findings or conclude neutral expository reporting.",
            unsupported_conclusions_note="Bias detection requires adequate context and multiple sentence samples to distinguish standard reporting from systematic framing.",
            methodology="Sentence and token length threshold validation. Articles under 30 words are classified as INSUFFICIENT EVIDENCE.",
            entity_impacts=[],
            psychological_framings=[],
            neutrality_checks=[
                NeutralityCheck(
                    check_name="Text Length Sufficiency",
                    status="NOT_ASSESSABLE",
                    description="Requires at least 30 words and 2 complete sentences for reliable contextual evaluation.",
                    result_details=f"Current sample: {word_count} words, {len(sentences)} sentence(s)."
                )
            ],
            what_was_examined=["Article character length", "Word count", "Sentence segmentation count"],
            why_verdict_reached="Text falls below minimum sampling threshold required for explainable linguistic inspection.",
            framing_symmetry_assessment="Symmetry cannot be evaluated on an incomplete or truncated text excerpt.",
            overall_direction="insufficient_text",
            evidence_coverage_percentage=0.0,
            system_limitations=["Short excerpts, headlines alone, and social media snippets cannot be evaluated with high statistical confidence."]
        )

    lang = language_code if language_code in LOADED_AND_PEJORATIVE_WORDS else "en"
    quote_spans = extract_quote_spans(text)
    findings: List[FramingEvidence] = []
    category_counts: Dict[str, int] = {c.value: 0 for c in FramingCategory}

    # Helper to find sentence and paragraph index
    def get_location_info(start: int, end: int) -> Tuple[int, int, str]:
        s_idx = 0
        s_text = ""
        for i, s in enumerate(sentences):
            if s["start_offset"] <= start and end <= s["end_offset"]:
                s_idx = i
                s_text = s["text"]
                break
        p_idx = 0
        for j, p in enumerate(paragraphs):
            if p["start_offset"] <= start and end <= p["end_offset"]:
                p_idx = j
                break
        return s_idx, p_idx, s_text or text[max(0, start-50):min(len(text), end+50)]

    # -----------------------------------------------------------------------
    # Pattern 1: Loaded & Pejorative Language
    # -----------------------------------------------------------------------
    loaded_rules = LOADED_AND_PEJORATIVE_WORDS.get(lang, LOADED_AND_PEJORATIVE_WORDS["en"])
    for word, expl, strength, direction in loaded_rules:
        pattern = compile_framing_pattern(word, lang)
        for match in pattern.finditer(text):
            start, end = match.start(), match.end()
            exact = text[start:end]
            if not validate_offset_slice(text, start, end, exact):
                continue

            s_idx, p_idx, s_text = get_location_info(start, end)
            attribution, attr_details = determine_attribution(start, end, quote_spans, s_text)
            target, group = associate_target_entity(s_text, entities, FramingCategory.LOADED_LANGUAGE)
            conf_score, conf_factors = calculate_finding_confidence(strength, attribution, target is not None, lang)

            # Determine political context if government or opposition is targeted
            cat = FramingCategory.LOADED_LANGUAGE
            label = "Loaded / Evaluative Modifier"
            if target and ("government" in target.lower() or "ed" in target.lower() or "police" in target.lower()):
                label = "Government-Critical Loaded Framing"

            finding = FramingEvidence(
                finding_id=f"frame_{uuid.uuid4().hex[:8]}",
                category=cat,
                label=label,
                exact_text=exact,
                start_offset=start,
                end_offset=end,
                sentence_index=s_idx,
                paragraph_index=p_idx,
                sentence_text=s_text,
                explanation=f"Evaluative vocabulary '{exact}': {expl}.",
                potential_effect="Directs reader emotional sentiment toward negative evaluation rather than objective appraisal.",
                evidence_strength=strength,
                alternative_interpretation="May reflect an accurate eyewitness depiction of severity or a quoted spokesperson's forceful rhetoric.",
                method="Lexical evaluation pattern matching",
                target_entity=target,
                direction=direction,
                affected_group=group,
                attribution=attribution,
                attribution_details=attr_details,
                psychological_mechanism="Negative Emotion & Evaluative Priming: High-valence adjectives trigger immediate affective heuristics.",
                confidence_score=conf_score,
                confidence_factors=conf_factors
            )
            findings.append(finding)
            category_counts[cat.value] = category_counts.get(cat.value, 0) + 1

    # -----------------------------------------------------------------------
    # Pattern 2: Sensationalism & Exaggeration
    # -----------------------------------------------------------------------
    sens_rules = SENSATIONALISM_WORDS.get(lang, SENSATIONALISM_WORDS["en"])
    for word, expl, strength in sens_rules:
        pattern = compile_framing_pattern(word, lang)
        for match in pattern.finditer(text):
            start, end = match.start(), match.end()
            exact = text[start:end]
            if not validate_offset_slice(text, start, end, exact):
                continue

            s_idx, p_idx, s_text = get_location_info(start, end)
            attribution, attr_details = determine_attribution(start, end, quote_spans, s_text)
            target, group = associate_target_entity(s_text, entities, FramingCategory.SENSATIONALISM_EXAGGERATION)
            conf_score, conf_factors = calculate_finding_confidence(strength, attribution, target is not None, lang)

            finding = FramingEvidence(
                finding_id=f"frame_{uuid.uuid4().hex[:8]}",
                category=FramingCategory.SENSATIONALISM_EXAGGERATION,
                label="Sensationalized / Hyperbolic Language",
                exact_text=exact,
                start_offset=start,
                end_offset=end,
                sentence_index=s_idx,
                paragraph_index=p_idx,
                sentence_text=s_text,
                explanation=f"Sensationalist phrasing '{exact}': {expl}.",
                potential_effect="Inflates urgency, perceived drama, and audience alarmism.",
                evidence_strength=strength,
                alternative_interpretation="May be used rhetorically by the author to denote genuine institutional surprise.",
                method="Hyperbole and drama lexicon detection",
                target_entity=target,
                direction=PortrayalDirection.NEGATIVE,
                affected_group=group,
                attribution=attribution,
                attribution_details=attr_details,
                psychological_mechanism="Availability Heuristic: Vivid, shocking phrasing makes rare catastrophic outcomes appear disproportionately frequent.",
                confidence_score=conf_score,
                confidence_factors=conf_factors
            )
            findings.append(finding)
            category_counts[FramingCategory.SENSATIONALISM_EXAGGERATION.value] = category_counts.get(FramingCategory.SENSATIONALISM_EXAGGERATION.value, 0) + 1

    # -----------------------------------------------------------------------
    # Pattern 3: Psychological Fear & Threat Appeals
    # -----------------------------------------------------------------------
    fear_rules = FEAR_AND_THREAT_APPEALS.get(lang, FEAR_AND_THREAT_APPEALS["en"])
    for word, expl, strength in fear_rules:
        pattern = compile_framing_pattern(word, lang)
        for match in pattern.finditer(text):
            start, end = match.start(), match.end()
            exact = text[start:end]
            if not validate_offset_slice(text, start, end, exact):
                continue

            s_idx, p_idx, s_text = get_location_info(start, end)
            attribution, attr_details = determine_attribution(start, end, quote_spans, s_text)
            target, group = associate_target_entity(s_text, entities, FramingCategory.THREAT_FRAMING)
            conf_score, conf_factors = calculate_finding_confidence(strength, attribution, target is not None, lang)

            finding = FramingEvidence(
                finding_id=f"frame_{uuid.uuid4().hex[:8]}",
                category=FramingCategory.THREAT_FRAMING,
                label="Threat & Crisis Framing",
                exact_text=exact,
                start_offset=start,
                end_offset=end,
                sentence_index=s_idx,
                paragraph_index=p_idx,
                sentence_text=s_text,
                explanation=f"Threat-inducing expression '{exact}': {expl}.",
                potential_effect="Induces anxiety, defensiveness, and moral urgency in the reader.",
                evidence_strength=strength,
                alternative_interpretation="Could reflect genuine statutory violations or demonstrable danger to civil institutions.",
                method="Threat and existential crisis taxonomy",
                target_entity=target or "Democratic Institutions",
                direction=PortrayalDirection.NEGATIVE,
                affected_group=group or "STATE_INSTITUTION",
                attribution=attribution,
                attribution_details=attr_details,
                psychological_mechanism="Prospect Theory & Loss Aversion: Framing events as catastrophic losses triggers heightened risk avoidance and defensive cohesion.",
                confidence_score=conf_score,
                confidence_factors=conf_factors
            )
            findings.append(finding)
            category_counts[FramingCategory.THREAT_FRAMING.value] = category_counts.get(FramingCategory.THREAT_FRAMING.value, 0) + 1

    # -----------------------------------------------------------------------
    # Pattern 4: In-Group vs Out-Group / Us vs Them
    # -----------------------------------------------------------------------
    ingroup_rules = IN_GROUP_OUT_GROUP_WORDS.get(lang, IN_GROUP_OUT_GROUP_WORDS["en"])
    for word, expl, strength in ingroup_rules:
        pattern = compile_framing_pattern(word, lang)
        for match in pattern.finditer(text):
            start, end = match.start(), match.end()
            exact = text[start:end]
            if not validate_offset_slice(text, start, end, exact):
                continue

            s_idx, p_idx, s_text = get_location_info(start, end)
            attribution, attr_details = determine_attribution(start, end, quote_spans, s_text)
            target, group = associate_target_entity(s_text, entities, FramingCategory.IN_GROUP_OUT_GROUP)
            conf_score, conf_factors = calculate_finding_confidence(strength, attribution, target is not None, lang)

            finding = FramingEvidence(
                finding_id=f"frame_{uuid.uuid4().hex[:8]}",
                category=FramingCategory.IN_GROUP_OUT_GROUP,
                label="In-Group vs Out-Group Polarizing Language",
                exact_text=exact,
                start_offset=start,
                end_offset=end,
                sentence_index=s_idx,
                paragraph_index=p_idx,
                sentence_text=s_text,
                explanation=f"Polarizing marker '{exact}': {expl}.",
                potential_effect="Erects rigid moral boundaries between 'us' and 'them', stigmatizing opposing viewpoints.",
                evidence_strength=strength,
                alternative_interpretation="May be quoted verbatim from partisan actors expressing political conflict.",
                method="Social identity boundary lexicon",
                target_entity=target or "Opposing Faction",
                direction=PortrayalDirection.NEGATIVE,
                affected_group=group or "POLITICAL_PARTY",
                attribution=attribution,
                attribution_details=attr_details,
                psychological_mechanism="Social Identity Theory: Promotes in-group favoritism while delegitimizing the out-group as untrustworthy or treasonous.",
                confidence_score=conf_score,
                confidence_factors=conf_factors
            )
            findings.append(finding)
            category_counts[FramingCategory.IN_GROUP_OUT_GROUP.value] = category_counts.get(FramingCategory.IN_GROUP_OUT_GROUP.value, 0) + 1

    # -----------------------------------------------------------------------
    # Pattern 5: Appeal to Sympathy & Victimhood
    # -----------------------------------------------------------------------
    symp_rules = SYMPATHY_AND_VICTIMHOOD_WORDS.get(lang, SYMPATHY_AND_VICTIMHOOD_WORDS["en"])
    for word, expl, strength in symp_rules:
        pattern = compile_framing_pattern(word, lang)
        for match in pattern.finditer(text):
            start, end = match.start(), match.end()
            exact = text[start:end]
            if not validate_offset_slice(text, start, end, exact):
                continue

            s_idx, p_idx, s_text = get_location_info(start, end)
            attribution, attr_details = determine_attribution(start, end, quote_spans, s_text)
            target, group = associate_target_entity(s_text, entities, FramingCategory.SYMPATHY_APPEAL)
            conf_score, conf_factors = calculate_finding_confidence(strength, attribution, target is not None, lang)

            finding = FramingEvidence(
                finding_id=f"frame_{uuid.uuid4().hex[:8]}",
                category=FramingCategory.SYMPATHY_APPEAL,
                label="Appeal to Victimhood / Persecution Framing",
                exact_text=exact,
                start_offset=start,
                end_offset=end,
                sentence_index=s_idx,
                paragraph_index=p_idx,
                sentence_text=s_text,
                explanation=f"Persecution phrasing '{exact}': {expl}.",
                potential_effect="Mobilizes public sympathy and deflects substantive investigation by framing actions as personal vendetta.",
                evidence_strength=strength,
                alternative_interpretation="May be a legitimate legal defense claim raised by counsel or spokesperson.",
                method="Victimhood and persecution rhetoric analysis",
                target_entity=target or "Accused Actor",
                direction=PortrayalDirection.POSITIVE,
                affected_group=group or "POLITICAL_PARTY",
                attribution=attribution,
                attribution_details=attr_details,
                psychological_mechanism="Moral Foundations (Harm & Fairness): Appeals to perceived unfair victimization to elicit protective moral indignation.",
                confidence_score=conf_score,
                confidence_factors=conf_factors
            )
            findings.append(finding)
            category_counts[FramingCategory.SYMPATHY_APPEAL.value] = category_counts.get(FramingCategory.SYMPATHY_APPEAL.value, 0) + 1

    # -----------------------------------------------------------------------
    # Pattern 6: Absolutist Generalizations
    # -----------------------------------------------------------------------
    gen_list = GENERALIZATION_WORDS.get(lang, GENERALIZATION_WORDS["en"])
    for word in gen_list:
        pattern = compile_framing_pattern(word, lang)
        for match in pattern.finditer(text):
            start, end = match.start(), match.end()
            exact = text[start:end]
            if not validate_offset_slice(text, start, end, exact):
                continue

            s_idx, p_idx, s_text = get_location_info(start, end)
            attribution, attr_details = determine_attribution(start, end, quote_spans, s_text)
            target, group = associate_target_entity(s_text, entities, FramingCategory.GENERALIZATION)
            conf_score, conf_factors = calculate_finding_confidence("medium", attribution, target is not None, lang)

            finding = FramingEvidence(
                finding_id=f"frame_{uuid.uuid4().hex[:8]}",
                category=FramingCategory.GENERALIZATION,
                label="Absolutist / Universal Claim",
                exact_text=exact,
                start_offset=start,
                end_offset=end,
                sentence_index=s_idx,
                paragraph_index=p_idx,
                sentence_text=s_text,
                explanation=f"Absolutist modifier '{exact}' eliminates nuance and counter-evidence.",
                potential_effect="Manufactures an impression of total unanimity or universal consensus.",
                evidence_strength="medium",
                alternative_interpretation="Could represent rhetorical emphasis by a quoted speaker.",
                method="Universal quantifier analysis",
                target_entity=target or "General Audience",
                direction=PortrayalDirection.NEUTRAL_DESCRIPTIVE,
                affected_group=group,
                attribution=attribution,
                attribution_details=attr_details,
                psychological_mechanism="Confirmation Bias Reinforcement: Broad generalizations discourage critical scrutiny of edge cases.",
                confidence_score=conf_score,
                confidence_factors=conf_factors
            )
            findings.append(finding)
            category_counts[FramingCategory.GENERALIZATION.value] = category_counts.get(FramingCategory.GENERALIZATION.value, 0) + 1

    # -----------------------------------------------------------------------
    # Pattern 7: Epistemic Hedging & Allegation Markers
    # -----------------------------------------------------------------------
    hedge_rules = HEDGING_TERMS.get(lang, HEDGING_TERMS["en"])
    for word, expl in hedge_rules:
        pattern = compile_framing_pattern(word, lang)
        for match in pattern.finditer(text):
            start, end = match.start(), match.end()
            exact = text[start:end]
            if not validate_offset_slice(text, start, end, exact):
                continue

            s_idx, p_idx, s_text = get_location_info(start, end)
            attribution, attr_details = determine_attribution(start, end, quote_spans, s_text)
            target, group = associate_target_entity(s_text, entities, FramingCategory.HEDGING_QUALIFYING)
            conf_score, conf_factors = calculate_finding_confidence("low", attribution, target is not None, lang)

            finding = FramingEvidence(
                finding_id=f"frame_{uuid.uuid4().hex[:8]}",
                category=FramingCategory.HEDGING_QUALIFYING,
                label="Epistemic Hedge / Sourced Qualification",
                exact_text=exact,
                start_offset=start,
                end_offset=end,
                sentence_index=s_idx,
                paragraph_index=p_idx,
                sentence_text=s_text,
                explanation=f"Qualifying term '{exact}': {expl}.",
                potential_effect="Distances the publisher from factual liability while signaling informational uncertainty.",
                evidence_strength="low",
                alternative_interpretation="Standard responsible journalism practice to qualify unproven judicial or investigative allegations.",
                method="Epistemic marker detection",
                target_entity=target or "Reported Allegation",
                direction=PortrayalDirection.NEUTRAL_DESCRIPTIVE,
                affected_group=group,
                attribution=attribution,
                attribution_details=attr_details,
                psychological_mechanism="Epistemic Distance: Signals probability boundaries to avoid overclaiming empirical certainty.",
                confidence_score=conf_score,
                confidence_factors=conf_factors
            )
            findings.append(finding)
            category_counts[FramingCategory.HEDGING_QUALIFYING.value] = category_counts.get(FramingCategory.HEDGING_QUALIFYING.value, 0) + 1

    # Deduplicate findings overlapping identical offsets
    unique_findings: List[FramingEvidence] = []
    seen_offsets = set()
    for f in sorted(findings, key=lambda x: (x.start_offset, -x.confidence_score)):
        key = (f.start_offset, f.end_offset)
        if key not in seen_offsets:
            seen_offsets.add(key)
            unique_findings.append(f)

    # -----------------------------------------------------------------------
    # Entity Portrayal Impact Synthesis
    # -----------------------------------------------------------------------
    entity_impacts: List[EntityPortrayalImpact] = []

    # 1. Collect all target entities from findings
    finding_targets: Set[str] = set()
    for f in unique_findings:
        if f.target_entity:
            finding_targets.add(f.target_entity)

    # 2. Collect prominent named entities from NER (deduplicating substrings)
    ner_entities: Dict[str, str] = {}
    for e in entities:
        if e.label in (EntityType.PERSON, EntityType.ORGANIZATION):
            matched_key = None
            for existing in list(ner_entities.keys()):
                if e.text.lower() in existing.lower() or existing.lower() in e.text.lower():
                    matched_key = existing
                    break
            if matched_key:
                if len(e.text) > len(matched_key):
                    del ner_entities[matched_key]
                    ner_entities[e.text] = e.label.value if hasattr(e.label, "value") else str(e.label)
            else:
                ner_entities[e.text] = e.label.value if hasattr(e.label, "value") else str(e.label)

    # Combine all entities to evaluate
    all_evaluated_entities: List[Tuple[str, str]] = []
    seen_entity_keys = set()

    # First add targets from findings (these carry substantive framing evidence)
    for target in finding_targets:
        k = target.lower()
        if k not in seen_entity_keys:
            seen_entity_keys.add(k)
            sample_f = next((f for f in unique_findings if f.target_entity == target), None)
            grp = sample_f.affected_group if sample_f and sample_f.affected_group else "INSTITUTION / ACTOR"
            all_evaluated_entities.append((target, grp))

    # Then add NER entities not yet covered
    for ent_name, ent_type in ner_entities.items():
        k = ent_name.lower()
        if not any(k in seen_k or seen_k in k for seen_k in seen_entity_keys):
            seen_entity_keys.add(k)
            all_evaluated_entities.append((ent_name, ent_type))

    for ent_name, ent_type in all_evaluated_entities:
        ent_findings = [
            f for f in unique_findings
            if f.target_entity and (ent_name.lower() in f.target_entity.lower() or f.target_entity.lower() in ent_name.lower())
        ]
        if not ent_findings:
            # Check mentions in text neutrally
            mentions = len(re.findall(re.escape(ent_name), text, re.IGNORECASE))
            if mentions > 0:
                entity_impacts.append(EntityPortrayalImpact(
                    entity_name=ent_name,
                    entity_type=ent_type,
                    direction=PortrayalDirection.NEUTRAL_DESCRIPTIVE,
                    findings_count=0,
                    evidence_quotes=[],
                    portrayal_summary=f"Mentioned {mentions} time(s) in factual, non-evaluative news reporting.",
                    favored_interest_analysis="Beneficiary or intended interest cannot be reliably determined from this article alone."
                ))
            continue

        neg_count = sum(1 for f in ent_findings if f.direction == PortrayalDirection.NEGATIVE)
        pos_count = sum(1 for f in ent_findings if f.direction == PortrayalDirection.POSITIVE)

        if neg_count > 0 and pos_count > 0:
            dir_enum = PortrayalDirection.MIXED
            summary = f"Portrayed through mixed framing ({neg_count} critical, {pos_count} laudatory/sympathetic indicators)."
        elif neg_count > 0:
            dir_enum = PortrayalDirection.NEGATIVE
            summary = f"Consistently portrayed in critical or conflict-oriented contexts across {neg_count} indicator(s)."
        elif pos_count > 0:
            dir_enum = PortrayalDirection.POSITIVE
            summary = f"Portrayed favorably or sympathetically across {pos_count} indicator(s)."
        else:
            dir_enum = PortrayalDirection.NEUTRAL_DESCRIPTIVE
            summary = "Mentioned in connection with procedural or qualifying statements."

        quotes = [f'"{f.exact_text}" in: "{f.sentence_text[:80]}..."' for f in ent_findings[:3]]

        # Determine favored interest carefully without guessing
        quoted_sources = [f.attribution_details for f in ent_findings if f.attribution == AttributionType.QUOTED_SPEAKER]
        if quoted_sources:
            favored = "Framing is spoken by quoted sources advocating partisan positions. Beneficiary or intended interest cannot be reliably determined from this article alone."
        else:
            favored = "Beneficiary or intended interest cannot be reliably determined from this article alone."

        entity_impacts.append(EntityPortrayalImpact(
            entity_name=ent_name,
            entity_type=ent_type,
            direction=dir_enum,
            findings_count=len(ent_findings),
            evidence_quotes=quotes,
            portrayal_summary=summary,
            favored_interest_analysis=favored
        ))

    # -----------------------------------------------------------------------
    # Psychological Framing Synthesis
    # -----------------------------------------------------------------------
    psychological_framings: List[PsychologicalMechanism] = []

    # Check for Threat / Loss Aversion
    threat_findings = [f for f in unique_findings if f.category in (FramingCategory.THREAT_FRAMING, FramingCategory.FEAR_APPEAL)]
    if threat_findings:
        sample = threat_findings[0]
        psychological_framings.append(PsychologicalMechanism(
            framework_name="Prospect Theory & Threat Framing (Loss Aversion)",
            concept_description="Prospect Theory demonstrates that human cognition weights potential losses significantly more heavily than equivalent gains. News coverage invoking existential threat or destruction activates systemic risk-aversion.",
            relevance_to_text=f"The text utilizes high-alarm vocabulary ('{sample.exact_text}') framing political actions as systemic crises.",
            evidence_text=sample.sentence_text
        ))

    # Check for In-Group / Out-Group
    ingroup_findings = [f for f in unique_findings if f.category == FramingCategory.IN_GROUP_OUT_GROUP]
    if ingroup_findings:
        sample = ingroup_findings[0]
        psychological_framings.append(PsychologicalMechanism(
            framework_name="Social Identity Theory (In-Group vs. Out-Group Polarizing)",
            concept_description="Social Identity Theory explains how group boundaries are linguistically constructed by exalting in-group virtues and delegitimizing out-groups as hostile or treacherous.",
            relevance_to_text=f"The phrase '{sample.exact_text}' erects a rigid moral distinction delegitimizing opponents.",
            evidence_text=sample.sentence_text
        ))

    # Check for Victimhood / Sympathy
    symp_findings = [f for f in unique_findings if f.category == FramingCategory.SYMPATHY_APPEAL]
    if symp_findings:
        sample = symp_findings[0]
        psychological_framings.append(PsychologicalMechanism(
            framework_name="Moral Foundations Theory (Harm & Fairness Attribution)",
            concept_description="Appeals to victimhood and targeted persecution mobilize protective moral indignation by depicting legal proceedings as arbitrary acts of malice.",
            relevance_to_text=f"The expression '{sample.exact_text}' frames institutional scrutiny as targeted political persecution.",
            evidence_text=sample.sentence_text
        ))

    # Check for Generalization / Confirmation Bias
    gen_findings = [f for f in unique_findings if f.category == FramingCategory.GENERALIZATION]
    if gen_findings:
        sample = gen_findings[0]
        psychological_framings.append(PsychologicalMechanism(
            framework_name="Cognitive Heuristics & Confirmation Bias",
            concept_description="Universal quantifiers ('always', 'never', 'everyone') eliminate cognitive dissonance and empirical complexity, reinforcing preexisting reader presuppositions.",
            relevance_to_text=f"Absolutist word '{sample.exact_text}' implies total consensus without citing empirical statistics.",
            evidence_text=sample.sentence_text
        ))

    # -----------------------------------------------------------------------
    # Neutrality Checks Execution (Explicit Documentation for NO BIAS)
    # -----------------------------------------------------------------------
    neutrality_checks = [
        NeutralityCheck(
            check_name="Loaded & Evaluative Language Screen",
            status="INDICATORS_PRESENT" if any(f.category in (FramingCategory.LOADED_LANGUAGE, FramingCategory.GOVERNMENT_CRITICAL) for f in unique_findings) else "NO_BIAS_INDICATORS_FOUND",
            description="Scans for high-intensity pejorative adjectives, laudatory framing, and derogatory epithets.",
            result_details="Multiple evaluative modifiers detected." if any(f.category in (FramingCategory.LOADED_LANGUAGE, FramingCategory.GOVERNMENT_CRITICAL) for f in unique_findings) else "No loaded or pejorative vocabulary detected in narration."
        ),
        NeutralityCheck(
            check_name="Sensationalism & Hyperbole Filter",
            status="INDICATORS_PRESENT" if any(f.category == FramingCategory.SENSATIONALISM_EXAGGERATION for f in unique_findings) else "NO_BIAS_INDICATORS_FOUND",
            description="Evaluates sensationalist metaphors, crisis inflation, and dramatic hyperbole.",
            result_details="Sensationalist phrasing detected." if any(f.category == FramingCategory.SENSATIONALISM_EXAGGERATION for f in unique_findings) else "Predominantly measured, descriptive vocabulary observed."
        ),
        NeutralityCheck(
            check_name="Threat & Fear Appeal Evaluation",
            status="INDICATORS_PRESENT" if any(f.category == FramingCategory.THREAT_FRAMING for f in unique_findings) else "NO_BIAS_INDICATORS_FOUND",
            description="Examines language evoking existential peril, catastrophic threats, or crisis panic.",
            result_details="Threat framing detected." if any(f.category == FramingCategory.THREAT_FRAMING for f in unique_findings) else "No disproportionate threat or crisis appeals detected."
        ),
        NeutralityCheck(
            check_name="In-Group vs Out-Group Boundary Check",
            status="INDICATORS_PRESENT" if any(f.category == FramingCategory.IN_GROUP_OUT_GROUP for f in unique_findings) else "NO_BIAS_INDICATORS_FOUND",
            description="Scans for polarizing language stigmatizing opposing groups as traitors or enemies.",
            result_details="Polarizing group labels detected." if any(f.category == FramingCategory.IN_GROUP_OUT_GROUP for f in unique_findings) else "No divisive us-versus-them language detected."
        ),
        NeutralityCheck(
            check_name="Attribution De-Nesting Screen",
            status="NO_BIAS_INDICATORS_FOUND" if all(f.attribution in (AttributionType.QUOTED_SPEAKER, AttributionType.IDENTIFIED_SOURCE) for f in unique_findings if f.evidence_strength == "high") else "INDICATORS_PRESENT",
            description="Verifies whether high-valence assertions originate from quoted sources or editorial narration.",
            result_details="Editorial narration maintains factual boundary; evaluative rhetoric is confined to quoted speakers." if all(f.attribution in (AttributionType.QUOTED_SPEAKER, AttributionType.IDENTIFIED_SOURCE) for f in unique_findings if f.evidence_strength == "high") else "Evaluative descriptors appear directly within journalist narration."
        )
    ]

    what_examined = [
        "Linguistic & evaluative modifiers across 5 languages",
        "Sensationalism, hyperbole, and drama indicators",
        "Absolutist universal quantifiers and generalizations",
        "Quotation attribution de-nesting (Speaker vs Journalist)",
        "Psychological threat appeals, loss aversion, and in-group framing",
        "Entity portrayal balance across mentioned political figures"
    ]

    # Calculate evidence coverage & density
    covered_sentences = len(set(f.sentence_index for f in unique_findings))
    coverage_pct = round((covered_sentences / max(1, len(sentences))) * 100, 1)
    density = round((len(unique_findings) / max(1, token_count)) * 1000, 2)

    # -----------------------------------------------------------------------
    # Final Verdict Determination
    # -----------------------------------------------------------------------
    substantive_findings = [f for f in unique_findings if f.evidence_strength in ("high", "medium") and f.category != FramingCategory.HEDGING_QUALIFYING]

    if len(substantive_findings) == 0:
        verdict = BiasVerdict.NO_CLEAR_BIAS_DETECTED
        # Confidence increases with article length and number of checks successfully passed
        verdict_conf = round(min(0.92, 0.65 + (len(sentences) * 0.03)), 2)
        verdict_summary = (
            "The analyzed article does not exhibit significant evidence of systematic loaded language, "
            "asymmetric entity portrayal, emotionally manipulative framing, or unsupported evaluative wording under the current detection framework."
        )
        verdict_reasoning = (
            f"Examined {len(sentences)} sentence(s) across 5 core neutrality dimensions. "
            "The text maintains predominantly descriptive reportage with claims attributed to identified sources and an absence of unverified pejorative rhetoric."
        )
        assessment = (
            "The article maintains predominantly neutral expository framing with minimal evaluative modifiers, "
            "absolutist generalities, or loaded terminology."
        )
        symmetry_assessment = "Balanced expository reporting. No significant asymmetric portrayal of stakeholders detected."
        overall_dir = "neutral_factual"

    else:
        verdict = BiasVerdict.POTENTIAL_BIAS_DETECTED
        # Confidence is weighted by the average confidence of substantive findings and density
        avg_finding_conf = sum(f.confidence_score for f in substantive_findings) / len(substantive_findings)
        verdict_conf = round(min(0.94, avg_finding_conf + (min(5, len(substantive_findings)) * 0.02)), 2)

        top_cats = sorted(category_counts.items(), key=lambda x: x[1], reverse=True)
        top_active = [cat.replace('_', ' ').title() for cat, cnt in top_cats if cnt > 0][:3]

        # Check if the bias is primarily from quoted sources vs journalist
        quoted_count = sum(1 for f in substantive_findings if f.attribution == AttributionType.QUOTED_SPEAKER)
        journalist_count = sum(1 for f in substantive_findings if f.attribution == AttributionType.JOURNALIST_NARRATION)

        attribution_clarification = ""
        if quoted_count > 0 and journalist_count == 0:
            attribution_clarification = " (Note: Potential bias cues occur predominantly within quoted source statements rather than direct editorial narration)."
        elif journalist_count > 0:
            attribution_clarification = " (Includes evaluative descriptors appearing directly within journalist narration)."

        verdict_summary = (
            f"Observable linguistic framing and evaluative patterns were identified in the text, "
            f"primarily within: {', '.join(top_active)}.{attribution_clarification}"
        )
        verdict_reasoning = (
            f"Detected {len(substantive_findings)} supported finding(s) meeting evidence thresholds. "
            f"Evidence density is {density} indicators per 1,000 tokens across {coverage_pct}% of the text."
        )
        assessment = (
            f"The article demonstrates observable linguistic framing patterns primarily in: {', '.join(top_active)}. "
            f"Observed evidence density is {density} indicators per 1,000 tokens."
        )

        # Assess symmetry
        neg_entities = [e.entity_name for e in entity_impacts if e.direction == PortrayalDirection.NEGATIVE]
        pos_entities = [e.entity_name for e in entity_impacts if e.direction == PortrayalDirection.POSITIVE]
        if neg_entities and not pos_entities:
            symmetry_assessment = f"Asymmetric framing emphasizing negative attributes toward {', '.join(neg_entities[:2])} without equivalent critical coverage of other stakeholders."
            overall_dir = "predominantly_critical"
        elif pos_entities and not neg_entities:
            symmetry_assessment = f"Asymmetric favorable framing highlighting accomplishments of {', '.join(pos_entities[:2])}."
            overall_dir = "predominantly_laudatory"
        elif neg_entities and pos_entities:
            symmetry_assessment = "Contrasting portrayals observed: both critical and supportive framings are present across different stakeholders."
            overall_dir = "mixed"
        else:
            symmetry_assessment = "Framing indicators are present but do not form an overtly asymmetric single-actor skew."
            overall_dir = "mixed"

    unsupported_conclusions = (
        "Linguistic framing observations document specific textual choices, quoted rhetoric, and potential reader effects. "
        "They do NOT establish political motivation, editorial bad faith, or intentional misinformation. "
        "Investigative reporting on crime or corruption naturally employs critical vocabulary without constituting unfair bias."
    )

    methodology = (
        "Grounded Unicode offset analysis of evaluative adjectives, epistemic hedges, universal quantifiers, "
        "attribution de-nesting (Speaker vs Journalist), and actor-predicate collocations. Every finding is strictly validated against the source character span."
    )

    system_limitations = [
        "Linguistic framing does not prove conscious journalistic intent, editorial conspiracies, or malicious bias.",
        "The absence of detected indicators does not guarantee absolute neutrality; bias may exist through omitted context, topic selection, or photographic presentation.",
        "Lexical pattern analysis cannot substitute for deep qualitative domain expertise or independent legal fact-checking.",
        "Confidence scores represent transparent heuristic evidence strength, not calibrated frequentist probabilities."
    ]

    return FramingAnalysisResult(
        verdict=verdict,
        verdict_summary=verdict_summary,
        verdict_confidence=verdict_conf,
        verdict_confidence_label="System confidence score (uncalibrated)",
        verdict_confidence_reasoning=verdict_reasoning,
        findings=unique_findings,
        category_counts={k: v for k, v in category_counts.items() if v > 0},
        density_per_1000_tokens=density,
        article_level_assessment=assessment,
        unsupported_conclusions_note=unsupported_conclusions,
        methodology=methodology,
        entity_impacts=entity_impacts,
        psychological_framings=psychological_framings,
        neutrality_checks=neutrality_checks,
        what_was_examined=what_examined,
        why_verdict_reached=verdict_reasoning,
        framing_symmetry_assessment=symmetry_assessment,
        overall_direction=overall_dir,
        evidence_coverage_percentage=coverage_pct,
        system_limitations=system_limitations
    )
