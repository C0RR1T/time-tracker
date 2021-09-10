import React, { useEffect, useState } from 'react';
import { Button, Dropdown, Modal } from 'react-bootstrap';
import firebase from 'firebase/compat';
import User from '../User';

type Props = {
    onSelect: (task?: string) => void;
    onClose: () => void;
    show: boolean;
    allowUndefined: boolean;
};

const SelectTaskPopUp = ({
    onSelect,
    onClose,
    show,
    allowUndefined = false,
}: Props) => {
    const [user, setUser] = useState<User>();
    const [selectedTask, setSelectedTask] = useState<string>();

    useEffect(
        () =>
            firebase
                .app()
                .firestore()
                .collection('users')
                .doc(firebase.app().auth().currentUser!.uid)
                .onSnapshot(snapshot => setUser(snapshot.data() as User)),
        []
    );

    const handleSubmit = () => {
        if (selectedTask || allowUndefined) {
            onSelect(selectedTask);
            onClose();
        }
    };

    return (
        <Modal show={show}>
            <Modal.Header>
                <Modal.Title>Aktivität starten</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Dropdown onSelect={task => setSelectedTask(task || undefined)}>
                    <Dropdown.Toggle>Aktivität aussuchen</Dropdown.Toggle>
                    <Dropdown.Menu>
                        {user?.tasks.map(val => (
                            <Dropdown.Item key={val} eventKey={val}>
                                {val}
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>
            </Modal.Body>
            <Modal.Footer>
                <Button variant={'danger'} onClick={onClose}>
                    Abbrechen
                </Button>
                <Button variant={'success'} onClick={handleSubmit}>
                    Aktivität starten
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default SelectTaskPopUp;
