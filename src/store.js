// @ts-check

import {
  configureStore,
  combineReducers,
  createSlice,
  createEntityAdapter,
} from '@reduxjs/toolkit';
import { filter } from 'lodash';

// section #####################################################################
//  SLICES
// #############################################################################

// part ================================
//  APP
// =====================================

const appSlice = createSlice({
  name: 'app',
  initialState: {
    currentChannelId: null,
    username: null,
  },
  reducers: {
    setCurrentChannelId: (state, { payload: { currentChannelId } }) => {
      state.currentChannelId = currentChannelId;
    },
    setUsername: (state, { payload: { username } }) => {
      state.username = username;
    },
  },
});

// part ================================
//  DOMAIN
// =====================================

const channelsAdapter = createEntityAdapter();

const channelsSlice = createSlice({
  name: 'channels',
  initialState: channelsAdapter.getInitialState(),
  reducers: {
    set: (state, { payload: { channels } }) => {
      channelsAdapter.setAll(state, channels);
    },
    add: (state, { payload: { channel } }) => {
      channelsAdapter.addOne(state, channel);
    },
    update: (state, { payload: { id, changes } }) => {
      channelsAdapter.updateOne(state, { id, changes });
    },
    remove: (state, { payload: { id } }) => {
      channelsAdapter.removeOne(state, id);
    },
  },
});

const messagesAdapter = createEntityAdapter();

const messagesSlice = createSlice({
  name: 'messages',
  initialState: messagesAdapter.getInitialState(),
  reducers: {
    set: (state, { payload: { messages } }) => {
      messagesAdapter.setAll(state, messages);
    },
    add: (state, { payload: { message } }) => {
      messagesAdapter.addOne(state, message);
    },
  },
});

// section #####################################################################
//  CONFIGURATION
// #############################################################################

// part ================================
//  STORE
// =====================================

const reducer = combineReducers({
  app: appSlice.reducer,
  channels: channelsSlice.reducer,
  messages: messagesSlice.reducer,
});

const store = configureStore({ reducer });

// part ================================
//  SELECTORS
// =====================================

const channelsSelectors = channelsAdapter.getSelectors((state) => state.channels);
const messagesSelectors = messagesAdapter.getSelectors((state) => state.messages);

const selectors = {
  channels: {
    getAll: () => channelsSelectors.selectAll(store.getState()),
  },
  messages: {
    getByChannelId: (channelId) => {
      const allMessages = messagesSelectors.selectAll(store.getState());
      const channelMessages = filter(allMessages, { channelId });
      return channelMessages;
    },
  },
};

// part ================================
//  ACTIONS
// =====================================

const actions = {
  app: appSlice.actions,
  channels: channelsSlice.actions,
  messages: messagesSlice.actions,
};

const setupState = ({
  channels,
  currentChannelId,
  messages,
  username,
}) => (dispatch) => {
  dispatch(actions.app.setUsername({ username }));
  dispatch(actions.app.setCurrentChannelId({ currentChannelId }));
  dispatch(actions.channels.set({ channels }));
  dispatch(actions.messages.set({ messages }));
};

// section #####################################################################
//  EXPORT
// #############################################################################

export { actions, selectors, setupState };
export default store;
