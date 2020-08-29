import React from 'react';
import ReactDOM from 'react-dom';

import Chat from './Chat';

const app = (props, rootElement) => {
  ReactDOM.render(<Chat {...props} />, rootElement);
};

export default app;
