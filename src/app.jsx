// @ts-check

import React from 'react';
import { render } from 'react-dom';
import { Provider as StoreProvider } from 'react-redux';
import gon from 'gon';
import faker from 'faker';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import store, { setupState } from './store';
import Context from './Context';
import { en, ru } from './locales';

import App from './app/App';

const run = () => {

  store.dispatch(setupState(gon));

  const username = localStorage.getItem('username') || faker.name.findName();
  localStorage.setItem('username', username);

  const context = { username };

  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: { en, ru },
      fallbackLng: 'ru',
      interpolation: { escapeValue: false },
      debug: true,
    });

  render(
    <StoreProvider store={store}>
      <Context.Provider value={context}>
        <App />
      </Context.Provider>
    </StoreProvider>,
    document.getElementById('chat'),
  );

};

export default run;
