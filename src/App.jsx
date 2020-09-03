import React, {
  useEffect, useCallback, useState, useMemo,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import {
  Row, Col, Nav, Button, Form, Modal,
} from 'react-bootstrap';
import { find } from 'lodash';

import api, { socket } from './api';
import { selectors, actions } from './store';

// section #####################################################################
//  COMPONENTS: CHANNEL CRUD DIALOGS
// #############################################################################

const CreateChannelDialog = ({ onClose, onSubmit }) => {
  const { register, handleSubmit } = useForm();
  return (
    <Modal show onHide={onClose}>
      <Modal.Header>New channel</Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Form.Control
            type="text"
            name="name"
            placeholder="Channel's name"
            ref={register()}
          />
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleSubmit(onSubmit)}>
          Create
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const RenameChannelDialog = ({ onClose, onSubmit, channel }) => {
  const { register, handleSubmit } = useForm({ defaultValues: channel || {} });
  return (
    <Modal show onHide={onClose}>
      <Modal.Header>Rename the channel</Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Form.Control
            type="text"
            name="name"
            placeholder="Channel's name"
            ref={register()}
          />
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleSubmit(onSubmit)}>
          Save
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const RemoveChannelDialog = ({ onClose, onConfirm, channel }) => (
  <Modal show onHide={onClose}>
    <Modal.Header>Remove the channel</Modal.Header>
    <Modal.Body>
      Are you sure you want to remove
      {' '}
      «
      {channel.name}
      » channel?
    </Modal.Body>
    <Modal.Footer>
      <Button variant="primary" onClick={onConfirm}>
        Remove
      </Button>
      <Button variant="secondary" onClick={onClose}>
        Cancel
      </Button>
    </Modal.Footer>
  </Modal>
);

// section #####################################################################
//  COMPONENT: CHAT FORM
// #############################################################################

const ChatForm = ({ onSubmit }) => {
  const { register, handleSubmit, reset } = useForm();
  const submit = (attributes) => {
    // todo: error handling
    onSubmit(attributes);
    reset();
  };
  return (
    <Form onSubmit={handleSubmit(submit)}>
      <Form.Control type="text" name="body" ref={register()} />
    </Form>
  );
};

// section #####################################################################
//  THE COMPONENT
// #############################################################################

const App = () => {

  const dispatch = useDispatch();

  // part ================================
  //  STATE
  // =====================================

  const currentChannelId = useSelector((state) => state.app.currentChannelId);
  const username = useSelector((state) => state.app.username);

  const channelEntities = useSelector((state) => state.channels.entities);
  const channels = useMemo(() => {
    return selectors.channels.getAll();
  }, [channelEntities]);

  const messageEntities = useSelector((state) => state.messages.entities);
  const messages = useMemo(() => {
    return selectors.messages.getByChannelId(currentChannelId);
  }, [currentChannelId, messageEntities]);

  // part ================================
  //  CONTROLLERS
  // =====================================

  const setCurrentChannelId = (id) => {
    dispatch(actions.app.setCurrentChannelId({ currentChannelId: id }));
  };

  // part ================================
  //  HANDLERS
  // =====================================

  const sendMessage = useCallback((attributes) => {
    api.messages.send(currentChannelId, { ...attributes, username });
  }, [currentChannelId]);

  const createChannel = (attributes) => {
    api.channels.create(attributes);
  };

  const renameChannel = (id, attributes) => {
    api.channels.rename(id, attributes);
  };

  const removeChannel = (id) => {
    api.channels.remove(id);
  };

  // part ================================
  //  DIALOGS
  // =====================================

  // Dialog: 'newChannel' | 'renameChannel' | 'removeChannel'
  const [dialog, setDialog] = useState(null);
  const openDialog = (name, payload) => setDialog({ name, payload });
  const closeDialog = () => setDialog(null);

  // part ================================
  //  SOCKET LISTENERS
  // =====================================

  useEffect(() => {
    socket.addEventListener('newChannel', ({ data: { attributes } }) => {
      dispatch(actions.channels.add({ channel: attributes }));
      setCurrentChannelId(attributes.id);
    });
    socket.addEventListener('renameChannel', ({ data: { id, attributes } }) => {
      dispatch(actions.channels.update({ id, changes: attributes }));
    });
    socket.addEventListener('removeChannel', ({ data: { id } }) => {
      dispatch(actions.channels.remove({ id }));
      if (id === currentChannelId) {
        const generalChannel = find(channels, { name: 'general' });
        setCurrentChannelId(generalChannel.id);
      }
    });
    socket.addEventListener('newMessage', ({ data: { attributes } }) => {
      dispatch(actions.messages.add({ message: attributes }));
    });
    // todo: disconnect in separate effect?
    // as it not working correctly, when there is something in deps
    // return () => socket.disconnect();
  }, [currentChannelId]);

  // part ================================
  //  VIEW
  // =====================================

  return (
    <>
      <Row className="h-100 pb-3">
        <Col xs={3} className="border-right">
          <div className="d-flex mb-2">
            <span>Channels</span>
            <Button
              variant="link"
              className="btn-link p-0 ml-auto"
              onClick={() => openDialog('newChannel')}
            >
              +
            </Button>
          </div>
          <Nav variant="pills" fill className="flex-column">
            {channels.map((channel) => (
              <Nav.Item key={channel.id}>
                <Nav.Link
                  active={channel.id === currentChannelId}
                  onClick={() => setCurrentChannelId(channel.id)}
                >
                  {channel.name}
                </Nav.Link>
                <Button onClick={() => openDialog('renameChannel', channel)}>
                  rename
                </Button>
                {channel.removable && (
                  <Button onClick={() => openDialog('removeChannel', channel)}>
                    remove
                  </Button>
                )}
              </Nav.Item>
            ))}
          </Nav>
        </Col>
        <Col className="h-100">
          <div className="d-flex flex-column h-100">
            <div className="overflow-auto mb-3">
              {messages.map(({ id, username: author, body }) => (
                <div key={id}>
                  <b>
                    {author}
                  </b>
                  :
                  {' '}
                  {body}
                </div>
              ))}
            </div>
            <div className="mt-auto">
              <ChatForm onSubmit={sendMessage} />
            </div>
          </div>
        </Col>
      </Row>
      {dialog && dialog.name === 'newChannel' && (
        <CreateChannelDialog
          onClose={closeDialog}
          onSubmit={(attributes) => {
            createChannel(attributes);
            closeDialog();
          }}
        />
      )}
      {dialog && dialog.name === 'renameChannel' && (
        <RenameChannelDialog
          channel={dialog.payload}
          onClose={closeDialog}
          onSubmit={(attributes) => {
            renameChannel(dialog.payload.id, attributes);
            closeDialog();
          }}
        />
      )}
      {dialog && dialog.name === 'removeChannel' && (
        <RemoveChannelDialog
          channel={dialog.payload}
          onClose={closeDialog}
          onConfirm={() => {
            removeChannel(dialog.payload.id);
            closeDialog();
          }}
        />
      )}
    </>
  );

};

export default App;
