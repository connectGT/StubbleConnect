import re

with open('frontend/src/components/FarmerDashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

state_addition = """  const [toast, setToast] = useState('');
  const [lang, setLang] = useState('en');

  const dict = {
    en: {
      overview: 'Overview',
      fields: 'My Fields',
      payments: 'Payments',
      alerts: 'Alerts',
      welcome: 'Welcome back',
      welcome_title: 'Welcome to StubbleConnect!',
      welcome_desc: 'To start earning, you need to register your first field location and estimated harvest date.',
      register_first: 'Register Your First Field',
      total_biomass_sold: 'Total Biomass Sold',
      total_earnings: 'Total Earnings',
      carbon_credits: 'Carbon Credits Earned',
      biomass_price: 'Current Biomass Price (MSP)',
      active_pickup: 'Active Harvest Pickup',
      recent_transactions: 'Payment History',
      registered_fields: 'registered fields',
      report_harvest: 'Report New Harvest',
      no_fields: 'No Fields Registered'
    },
    pb: {
      overview: 'ਸੰਖੇਪ',
      fields: 'ਮੇਰੇ ਖੇਤ',
      payments: 'ਭੁਗਤਾਨ',
      alerts: 'ਸੂਚਨਾਵਾਂ',
      welcome: 'ਵਾਪਸ ਸੁਆਗਤ ਹੈ',
      welcome_title: 'StubbleConnect ਵਿੱਚ ਸੁਆਗਤ ਹੈ!',
      welcome_desc: 'ਕਮਾਈ ਸ਼ੁਰੂ ਕਰਨ ਲਈ, ਆਪਣੇ ਪਹਿਲੇ ਖੇਤ ਦੀ ਸਥਿਤੀ ਅਤੇ ਅਨੁਮਾਨਿਤ ਵਾਢੀ ਦੀ ਤਾਰੀਖ ਦਰਜ ਕਰੋ।',
      register_first: 'ਆਪਣਾ ਪਹਿਲਾ ਖੇਤ ਰਜਿਸਟਰ ਕਰੋ',
      total_biomass_sold: 'ਕੁੱਲ ਬਾਇਓਮਾਸ ਵੇਚਿਆ',
      total_earnings: 'ਕੁੱਲ ਕਮਾਈ',
      carbon_credits: 'ਕਾਰਬਨ ਕ੍ਰੈਡਿਟ ਕਮਾਏ',
      biomass_price: 'ਮੌਜੂਦਾ ਬਾਇਓਮਾਸ ਕੀਮਤ (MSP)',
      active_pickup: 'ਸਰਗਰਮ ਵਾਢੀ ਪਿਕਅੱਪ',
      recent_transactions: 'ਭੁਗਤਾਨ ਇਤਿਹਾਸ',
      registered_fields: 'ਰਜਿਸਟਰਡ ਖੇਤ',
      report_harvest: 'ਨਵੀਂ ਵਾਢੀ ਰਿਪੋਰਟ ਕਰੋ',
      no_fields: 'ਕੋਈ ਖੇਤ ਰਜਿਸਟਰਡ ਨਹੀਂ'
    },
    hi: {
      overview: 'सारांश',
      fields: 'मेरे खेत',
      payments: 'भुगतान',
      alerts: 'सूचनाएं',
      welcome: 'वापस स्वागत है',
      welcome_title: 'StubbleConnect में स्वागत है!',
      welcome_desc: 'कमाई शुरू करने के लिए, अपने पहले खेत की जगह और अनुमानित कटाई की तारीख दर्ज करें।',
      register_first: 'अपना पहला खेत पंजीकृत करें',
      total_biomass_sold: 'कुल बायोमास बेचा',
      total_earnings: 'कुल कमाई',
      carbon_credits: 'अर्जित कार्बन क्रेडिट',
      biomass_price: 'वर्तमान बायोमास मूल्य (MSP)',
      active_pickup: 'सक्रिय फसल पिकअप',
      recent_transactions: 'भुगतान इतिहास',
      registered_fields: 'पंजीकृत खेत',
      report_harvest: 'नई फसल रिपोर्ट करें',
      no_fields: 'कोई खेत पंजीकृत नहीं'
    }
  };
  const t = (k) => dict[lang] ? (dict[lang][k] || dict.en[k] || k) : (dict.en[k] || k);
"""
content = content.replace("  const [toast, setToast] = useState('');", state_addition)

# Safe UI Replacements
content = content.replace(">Welcome back,", ">{t('welcome')},")
content = content.replace(">Welcome to StubbleConnect!<", ">{t('welcome_title')}<")
content = content.replace(">To start earning, you need to register your first field location and estimated harvest date.<", ">{t('welcome_desc')}<")
content = content.replace(">Register Your First Field", ">{t('register_first')}")
content = content.replace(">Total Biomass Sold<", ">{t('total_biomass_sold')}<")
content = content.replace(">Total Earnings<", ">{t('total_earnings')}<")
content = content.replace(">Carbon Credits Earned<", ">{t('carbon_credits')}<")
content = content.replace(">Current Biomass Price (MSP)<", ">{t('biomass_price')}<")
content = content.replace(">Active Harvest Pickup<", ">{t('active_pickup')}<")
content = content.replace(">Payment History<", ">{t('recent_transactions')}<")
content = content.replace(" registered fields<", " {t('registered_fields')}<")
content = content.replace(">Report New Harvest<", ">{t('report_harvest')}<")
content = content.replace(">No Fields Registered<", ">{t('no_fields')}<")

# Toggle insertion
toggle_ui = """        <div className="flex flex-wrap items-center gap-2">
          <select 
            value={lang} 
            onChange={(e) => setLang(e.target.value)}
            className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-lg cursor-pointer shadow-sm outline-none"
          >
            <option value="en">English</option>
            <option value="pb">ਪੰਜਾਬੀ</option>
            <option value="hi">हिंदी</option>
          </select>"""
content = content.replace('        <div className="flex flex-wrap items-center gap-2">', toggle_ui, 1)

# Tab labels
content = content.replace("{ id: 'overview', label: 'Overview' }", "{ id: 'overview', label: t('overview') }")
content = content.replace("{ id: 'fields', label: 'My Fields' }", "{ id: 'fields', label: t('fields') }")
content = content.replace("{ id: 'payments', label: 'Payments' }", "{ id: 'payments', label: t('payments') }")
content = content.replace("{ id: 'alerts', label: 'Alerts', badge: 2 }", "{ id: 'alerts', label: t('alerts'), badge: 2 }")

with open('frontend/src/components/FarmerDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
