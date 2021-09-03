import React, { useEffect, useState } from "react";
import { Dropdown, Modal } from "react-bootstrap";
import firebase from "firebase/compat";
import User from "../User";

type Props = { onSelect: (task: string) => void; onClose: () => void; show: boolean };

const SelectTaskPopUp = ({ onSelect, onClose, show }: Props) => {
    const [user, setUser] = useState<User>();

    useEffect(
        () =>
            firebase
                .app()
                .firestore()
                .collection("users")
                .doc(firebase.app().auth().currentUser!.uid)
                .onSnapshot((snapshot) => setUser(snapshot.data() as User)),
        []
    );

    return (
        <Modal show={show}>
            <Modal.Title>Aktivität starten</Modal.Title>
            <Modal.Body>
                <Dropdown>
                    <Dropdown.Toggle>Aktivität aussuchen</Dropdown.Toggle>
                    <Dropdown.Menu>
                        {user?.tasks.map((val) => (
                            <Dropdown.Item>{val}</Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>
            </Modal.Body>
        </Modal>
    );
};

export default SelectTaskPopUp;
