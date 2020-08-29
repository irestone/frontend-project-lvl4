import React from 'react';
import ReactDOM from 'react-dom';
import gon from 'gon';

console.log(gon);

const Chat = () => (
  <ul>
    {gon.channels.map((channel) => (
      <li>{channel.name}</li>
    ))}
  </ul>
);

ReactDOM.render(
  <Chat />,
  document.getElementById('chat'),
);
