export const PHONE = '+37498969453';
export const PHONE_LABEL = '+374 98 96 94 53';
export const EMAIL = 'afoninwebstudio@gmail.com';
export const TELEGRAM_USER = 'AfoninWebStudio';
export const BEHANCE = 'https://www.behance.net/vladislavafonin';
export const GITHUB = 'https://github.com/TheLustYoung';

const GREETING = {
  ru: 'Здравствуйте! Хочу обсудить проект с Afonin Web Studio.',
  en: 'Hello! I would like to discuss a project with Afonin Web Studio.',
  hy: 'Բարև ձեզ։ Ցանկանում եմ քննարկել նախագիծ Afonin Web Studio-ի հետ։'
};

// Messenger links open the chat with the message already typed in; the visitor only presses Send.
export const greeting = lang => GREETING[lang] || GREETING.ru;
export const telegramLink = text => `https://t.me/${TELEGRAM_USER}?text=${encodeURIComponent(text)}`;
export const whatsappLink = text => `https://wa.me/${PHONE.slice(1)}?text=${encodeURIComponent(text)}`;
export const emailLink = (text, subject = 'Afonin Web Studio') => `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
