import React from 'react';

const Chat = ({ channels }) => (
  <ul>
    {channels.map(({ id, name }) => (
      <li key={id}>{name}</li>
    ))}
  </ul>
);

export default Chat;
