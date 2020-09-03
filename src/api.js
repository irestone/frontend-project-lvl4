// @ts-check

import axios from 'axios';
import openSocket from 'socket.io-client';

import routes from './routes';

// section #####################################################################
//  API
// #############################################################################

// part ================================
//  CHANNELS
// =====================================

const createChannel = (attributes) => {
  const route = routes.channelsPath();
  const data = { data: { attributes } };
  return axios.post(route, data);
};

const renameChannel = (id, attributes) => {
  const route = routes.channelPath(id);
  const data = { data: { attributes } };
  return axios.patch(route, data);
};

const removeChannel = (id) => {
  const route = routes.channelPath(id);
  return axios.delete(route);
};

// part ================================
//  MESSAGES
// =====================================

const sendMessage = (channelId, attributes) => {
  const route = routes.channelMessagesPath(channelId);
  const data = { data: { attributes } };
  return axios.post(route, data);
};

// section #####################################################################
//  EXPORT
// #############################################################################

const api = {
  channels: {
    create: createChannel,
    rename: renameChannel,
    remove: removeChannel,
  },
  messages: {
    send: sendMessage,
  },
};

const socket = openSocket();

export { socket };
export default api;
