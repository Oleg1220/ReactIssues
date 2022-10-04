import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import translations from 'locales/translations';
import { initReactI18next } from 'react-i18next';
var defaultlang = (localStorage.getItem('cms_lang')) ? localStorage.getItem('cms_lang') : 'en-GB'
if(!localStorage.getItem('cms_lang')){
  localStorage.setItem('cms_lang',defaultlang);
}
i18n
// .use(Backend)
.use(initReactI18next)
.init({
    fallbackLng: defaultlang,
    lang:defaultlang,
    interpolation: {
      escapeValue: false
    },
    resources: translations
});

export default i18n;