// js/i18n/i18n.js
import cs from './cs.js';
import en from './en.js';

const translations = { cs, en };

export function getTranslation() {
    // Get the list of preferred browser languages, falling back to 'en' if none are available
    const browserLanguages = navigator.languages || [navigator.language || 'en'];

    // Determine if at least one of the preferred languages starts with 'cs'
    const isCzech = browserLanguages.some(lang => lang && lang.toLowerCase().startsWith('cs'));

    const langKey = isCzech ? 'cs' : 'en';
    return translations[langKey];
}