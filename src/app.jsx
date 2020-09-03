// @ts-check

import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React from 'react';
import { render } from 'react-dom';
import { Provider as StoreProvider } from 'react-redux';
import gon from 'gon';
import faker from 'faker';

import '../assets/application.scss';

import store, { setupState } from './store';
import App from './App';

const run = () => {

  if (process.env.NODE_ENV !== 'production') {
    localStorage.debug = 'chat:*';
  }

  const username = localStorage.getItem('username') || faker.name.findName();
  localStorage.setItem('username', username);

  store.dispatch(setupState({ ...gon, username }));

  render(
    <StoreProvider store={store}>
      <App />
    </StoreProvider>,
    document.getElementById('chat'),
  );

};

export default run;
