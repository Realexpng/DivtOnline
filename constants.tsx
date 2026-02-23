
import React from 'react';

export const COLORS = {
  primary: '#1a365d', // Глибокий синій (Морський)
  secondary: '#2c5282', // Океанський
  accent: '#3182ce', // Блакитний
  danger: '#e53e3e',
  success: '#38a169',
};

// Логотип згідно із запитом
export const LOGO_PLACEHOLDER = "https://img.icons8.com/fluency/240/anchor.png";

// SVG Sailor Icons
const SailorMaleSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <circle cx="50" cy="40" r="25" fill="#FFD1B3" />
    <path d="M25 40 Q25 25 50 25 Q75 25 75 40" fill="#fff" stroke="#1a365d" strokeWidth="2" />
    <rect x="35" y="20" width="30" height="8" rx="2" fill="#1a365d" />
    <path d="M42 22 L58 22" stroke="#fff" strokeWidth="1" />
    <path d="M20 75 Q50 65 80 75 L80 95 L20 95 Z" fill="#1a365d" />
    <path d="M35 75 L35 95 M65 75 L65 95" stroke="#fff" strokeWidth="2" strokeDasharray="4 2" />
    <circle cx="42" cy="38" r="2" fill="#333" />
    <circle cx="58" cy="38" r="2" fill="#333" />
    <path d="M45 50 Q50 53 55 50" stroke="#333" fill="none" strokeWidth="1.5" />
  </svg>
);

const SailorFemaleSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <path d="M25 40 Q25 80 50 85 Q75 80 75 40" fill="#4A3728" />
    <circle cx="50" cy="40" r="23" fill="#FFD1B3" />
    <path d="M28 35 Q28 20 50 20 Q72 20 72 35" fill="#fff" stroke="#1a365d" strokeWidth="2" />
    <rect x="38" y="15" width="24" height="6" rx="2" fill="#1a365d" />
    <path d="M20 75 Q50 65 80 75 L80 95 L20 95 Z" fill="#1a365d" />
    <path d="M35 75 L35 95 M65 75 L65 95" stroke="#fff" strokeWidth="2" strokeDasharray="4 2" />
    <circle cx="42" cy="38" r="2" fill="#333" />
    <circle cx="58" cy="38" r="2" fill="#333" />
    <path d="M45 50 Q50 53 55 50" stroke="#333" fill="none" strokeWidth="1.5" />
  </svg>
);

export const AVATARS = {
  male: <SailorMaleSVG />,
  female: <SailorFemaleSVG />
};

export const LOCALE = {
  uk: {
    nav: {
      profile: "Мій Профіль",
      certificates: "Замовити довідку",
      chat: "Задати питання",
      logout: "Вихід",
      admin: "Адмін-панель",
      settings: "Налаштування профілю"
    },
    auth: {
      login: "Вхід",
      register: "Реєстрація",
      submit: "Увійти",
      signup: "Створити акаунт",
      username: "Логін",
      pib: "ПІБ",
      email: "Електронна пошта",
      phone: "Телефон (+380...)",
      password: "Пароль",
      confirmPassword: "Підтвердьте пароль",
      rememberMe: "Запам'ятати мене",
      noAccount: "Немає акаунту? Реєстрація",
      alreadyHasAccount: "Вже маєте акаунт? Увійти",
      successRegister: "Реєстрація успішна! Тепер ви можете увійти.",
      errorLogin: "Користувача не знайдено або пароль невірний.",
      errorPassMismatch: "Паролі не збігаються",
      errorPhoneFormat: "Телефон має бути у форматі +380XXXXXXXXX",
      errorRegister: "Помилка реєстрації",
      portalName: "ВСП «ДІВТ НТУ» • Академічний портал"
    },
    dashboard: {
      welcome: "Ласкаво просимо,",
      editProfile: "Редагувати профіль",
      gender: "Стать",
      save: "Зберегти зміни",
      certStudy: "Довідка з місця навчання",
      certEdbo: "Довідка з ЄДЕБО",
      certSuccess: "Заявка успішно подана, зможете забрати у Четвер з 9:00 до 14:00",
      edboWarning: "Дата створення не пізніше 1 тижня тому. Формат: .pdf",
      uploadPrompt: "Завантажте Свіжий Витяг з додатку Резерв+",
      male: "Чоловіча",
      female: "Жіноча",
      confirmOrder: "Ви впевнені, що хочете замовити цю довідку?",
      btnOrder: "Замовити",
      btnCancel: "Скасувати"
    },
    chat: {
      title: "Чат з адміністрацією",
      welcome: "Добрий день! Чим ми можемо допомогти?",
      placeholder: "Ваше повідомлення...",
      endChat: "Завершити чат",
      chatEnded: "Чат завершено адміністратором"
    }
  },
  en: {
    nav: {
      profile: "My Profile",
      certificates: "Request Certificate",
      chat: "Support Chat",
      logout: "Logout",
      admin: "Admin Panel",
      settings: "Profile Settings"
    },
    auth: {
      login: "Login",
      register: "Register",
      submit: "Login",
      signup: "Create Account",
      username: "Login",
      pib: "Full Name",
      email: "Email",
      phone: "Phone (+380...)",
      password: "Password",
      confirmPassword: "Confirm Password",
      rememberMe: "Remember Me",
      noAccount: "No account? Register",
      alreadyHasAccount: "Already have an account? Login",
      successRegister: "Registration successful! You can now login.",
      errorLogin: "User not found or password incorrect.",
      errorPassMismatch: "Passwords do not match",
      errorPhoneFormat: "Phone must be in format +380XXXXXXXXX",
      errorRegister: "Registration error",
      portalName: "DIWT NTU • Academic Portal"
    },
    dashboard: {
      welcome: "Welcome,",
      editProfile: "Edit Profile",
      gender: "Gender",
      save: "Save Changes",
      certStudy: "Certificate of Study",
      certEdbo: "EDBO Certificate",
      certSuccess: "Application submitted successfully. Pickup on Thursday from 9:00 to 14:00",
      edboWarning: "Issue date no older than 1 week. Format: .pdf",
      uploadPrompt: "Upload fresh excerpt from Rezerv+ app",
      male: "Male",
      female: "Female",
      confirmOrder: "Are you sure you want to order this certificate?",
      btnOrder: "Order",
      btnCancel: "Cancel"
    },
    chat: {
      title: "Chat with Admin",
      welcome: "Hello! How can we help you?",
      placeholder: "Your message...",
      endChat: "End Chat",
      chatEnded: "Chat ended by administrator"
    }
  }
};
