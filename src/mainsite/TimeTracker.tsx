import React, { useEffect, useState } from "react";
import { Button, Col, Container, ListGroup, ModalTitle, Row } from "react-bootstrap";
import User from "../User";
import firebase from "firebase/compat";

const TimeTracker = () => {
    const [time, setTime] = useState("00:00:00");
    const [user, setUser] = useState<User>();

    const [intervalState, setIntervalState] = useState<NodeJS.Timeout>();

    useEffect(() => {
        firebase
            .app()
            .firestore()
            .collection("users")
            .doc(firebase.app().auth().currentUser!.uid)
            .onSnapshot((snapshot) => setUser(snapshot.data() as User));
    }, []);

    useEffect(() => {
        if (user?.activities[user?.activities.length - 1].finished) {
            clearInterval(intervalState!);
            setIntervalState(undefined);
            setTime("00:00:00");
        } else {
            if (user?.activities[user?.activities.length - 1].start) {
                setIntervalState(
                    setInterval(() => {
                        const currentDate = new Date().getTime();
                        const startDate = new Date(user?.activities[user?.activities.length - 1].start).getTime();
                        setTime(formatTime(currentDate - startDate));
                    }, 1000)
                );
            }
        }
    }, [user?.activities[user?.activities.length - 1].finished]);

    return (
        <Container>
            <ModalTitle>Zeit tracken</ModalTitle>
            <Row>
                <Col>
                    <h1>{time}</h1>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Button variant={"success"}>Starten</Button>
                </Col>
                <Col>
                    <Button variant={"secondary"}>Pause</Button>
                </Col>
                <Col>
                    <Button variant={"danger"}>Stopp</Button>
                </Col>
            </Row>
            <br />
            <h1>Schnell-Start</h1>
            <Row>
                <ListGroup>
                    {user?.fastTasks.map((val) => (
                        <ListGroup.Item>{val}</ListGroup.Item>
                    ))}
                </ListGroup>
            </Row>
        </Container>
    );
};

const SECONDS_IN_MS = 1000;
const MINUTES_IN_MS = 60 * SECONDS_IN_MS;
const HOURS_IN_MS = 60 * MINUTES_IN_MS;

const formatTime = (time: number) =>
    `${Math.floor(time / HOURS_IN_MS)}:${Math.floor(time / MINUTES_IN_MS)}:${Math.floor(time / SECONDS_IN_MS)}`;

export default TimeTracker;
