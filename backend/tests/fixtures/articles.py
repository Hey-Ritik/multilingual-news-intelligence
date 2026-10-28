"""
Original Multilingual Test Fixtures across English, Hindi, Kannada, Telugu, and Tamil.
Used for deterministic unit and integration tests.
"""

# 1. English: Delhi Excise Policy Case Arrest (Critical / Conflict Reporting)
EN_NEWS_ARREST = """
New Delhi: The Enforcement Directorate on Thursday arrested Delhi Chief Minister Arvind Kejriwal in connection with the excise policy money laundering case. 

According to officials, the arrest was executed following prolonged questioning at his official residence. Meanwhile, AAP leaders furiously condemned the action as a "draconian and ruthless political assault on democracy." A senior party spokesperson asserted: "This is completely illegal and without any evidence whatsoever. Everyone in the country knows this is targeted victimization."

However, opposition leaders claimed that law enforcement agencies were acting strictly according to established judicial mandates, denying any political interference. Mr. Kejriwal is expected to be produced before the special court on Friday.
"""

# 2. Hindi: Same Event (Kejriwal Arrest)
HI_NEWS_ARREST = """
नई दिल्ली: प्रवर्तन निदेशालय ने गुरुवार शाम को दिल्ली के मुख्यमंत्री अरविंद केजरीवाल को आबकारी नीति मामले में गिरफ्तार कर लिया। 

अधिकारियों के अनुसार, लंबी पूछताछ के बाद यह कार्रवाई की गई। आम आदमी पार्टी ने इस गिरफ्तारी की कड़ी निंदा की और इसे लोकतंत्र पर "तानाशाही और क्रूर हमला" करार दिया। पार्टी प्रवक्ता ने कहा: "यह पूरी तरह से असंवैधानिक है। हमारे पास न्यायपालिका पर पूरा भरोसा है।" दूसरी ओर, जांच एजेंसी ने दावा किया कि उनके पास पुख्ता सबूत मौजूद हैं।
"""

# 3. Kannada: Same Event (Kejriwal Arrest)
KN_NEWS_ARREST = """
ನವದೆಹಲಿ: ದೆಹಲಿ ಅಬಕಾರಿ ನೀತಿ ಹಗರಣಕ್ಕೆ ಸಂಬಂಧಿಸಿದಂತೆ ಮುಖ್ಯಮಂತ್ರಿ ಅರವಿಂದ್ ಕೇಜ್ರಿವಾಲ್ ಅವರನ್ನು ಜಾರಿ ನಿರ್ದೇಶನಾಲಯ ಗುರುವಾರ ಬಂಧಿಸಿದೆ.

ಅಧಿಕಾರಿಗಳ ಪ್ರಕಾರ, ದೀರ್ಘ ವಿಚಾರಣೆಯ ನಂತರ ಈ ಬಂಧನ ನಡೆದಿದೆ. ಎಎಪಿ ನಾಯಕರು ಈ ಕ್ರಮವನ್ನು ತೀವ್ರವಾಗಿ ಖಂಡಿಸಿದ್ದು, ಇದು ಪ್ರಜಾಪ್ರಭುತ್ವದ ಮೇಲಿನ "ಸರ್ವಾಧಿಕಾರಿ ದಾಳಿ" ಎಂದು ಕಿಡಿಕಾರಿದ್ದಾರೆ. ಪಕ್ಷದ ವಕ್ತಾರರು ಮಾತನಾಡಿ, "ಇದು ಸಂಪೂರ್ಣ ರಾಜಕೀಯ ಪ್ರೇರಿತ ಕ್ರಮ" ಎಂದು ಆರೋಪಿಸಿದರು.
"""

# 4. Telugu: Same Event (Kejriwal Arrest)
TE_NEWS_ARREST = """
న్యూఢిల్లీ: ఢిల్లీ లిక్కర్ పాలసీ మనీలాండరింగ్ కేసులో ముఖ్యమంత్రి అరవింద్ కేజ్రీవాల్‌ను ఎన్‌ఫోర్స్‌మెంట్ డైరెక్టరేట్ గురువారం అరెస్ట్ చేసింది.

అధికారుల సమాచారం ప్రకారం, ఆయన నివాసంలో సోదాలు నిర్వహించిన అనంతరం అదుపులోకి తీసుకున్నారు. ఆప్ నేతలు ఈ చర్యను తీవ్రంగా ఖండించారు. ఇది ప్రజాస్వామ్యంపై "నిరంకుశ దాడి" అని విమర్శించారు. దర్యాప్తు సంస్థ మాత్రం తమ వద్ద స్పష్టమైన ఆధారాలు ఉన్నాయని పేర్కొంది.
"""

# 5. Tamil: Same Event (Kejriwal Arrest)
TA_NEWS_ARREST = """
புதுடெல்லி: டெல்லி மதுபானக் கொள்கை முறைகேடு வழக்கில் டெல்லி முதலமைச்சர் அரவிந்த் கெஜ்ரிவாலை அமலாக்கத்துறை வியாழக்கிழமை கைது செய்தது.

அதிகாரிகள் தெரிவித்த தகவலின்படி, தீவிர விசாரணைக்குப் பிறகு இந்த நடவடிக்கை எடுக்கப்பட்டது. ஆம் ஆத்மி கட்சித் தலைவர்கள் இந்த கைது நடவடிக்கைக்கு கடும் கண்டனம் தெரிவித்துள்ளனர். இது ஜனநாயகத்தின் மீதான "சர்வாதிகாரத் தாக்குதல்" என்று குற்றம் சாட்டியுள்ளனர்.
"""

# 6. Unrelated Event with SAME Actor (Arvind Kejriwal launches new solar policy in Delhi)
EN_NEWS_SAME_ACTOR_DIFFERENT_EVENT = """
New Delhi: Chief Minister Arvind Kejriwal on Wednesday launched the Delhi Solar Policy 2024 to promote clean energy and reduce electricity bills for residential consumers.

Speaking at the inauguration event in Delhi, Mr. Kejriwal announced that households installing rooftop solar panels would receive zero electricity bills and generation-based financial incentives. Environmental activists welcomed the initiative as a progressive breakthrough for urban sustainable development.
"""

# 7. Neutral Factual Report (ISRO Space Mission)
EN_NEWS_NEUTRAL_FACTUAL = """
Bengaluru: The Indian Space Research Organisation confirmed on Tuesday that the meteorological satellite Insat-3DS has successfully completed its final orbit-raising maneuvers.

According to ISRO, all onboard propulsion systems functioned nominally during the planned apogee burns. The spacecraft has reached its designated geostationary slot at 74 degrees East longitude. Normal operational observations are scheduled to commence next week following payload calibration.
"""

