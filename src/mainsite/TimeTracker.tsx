import React, { useEffect, useState } from "react";
import { Button, Col, Container, ListGroup, ModalTitle, Row } from "react-bootstrap";
import User from "../User";
import firebase from "firebase/compat";

const TimeTracker = () => {
    const [time, setTime] = useState("00:00:00");
    const [user, setUser] = useState<User>();
    const [currentTask, setCurrentTask] = useState<{
        name?: string;
        isPause: boolean;
    }>();

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
        const currentTask = user?.activities[user?.activities.length - 1];
        if (currentTask) {
            const lastPause = currentTask.pauses[currentTask?.pauses.length - 1];
            if (currentTask.finished) {
                setCurrentTask(undefined);
                clearInterval(intervalState!);
                setIntervalState(undefined);
                setTime("00:00:00");
            } else if (lastPause?.finished) {
                clearInterval(intervalState!);
                setCurrentTask({
                    isPause: false,
                    name: lastPause.task,
                });
                setIntervalState(
                    setInterval(
                        () => setTime(formatTime(new Date().getTime() - new Date(lastPause.start).getTime())),
                        1000
                    )
                );
            } else if (!lastPause?.finished && lastPause?.start) {
                clearInterval(intervalState!);
                setCurrentTask({
                    isPause: true,
                    name: lastPause?.task,
                });
                setIntervalState(setInterval(() => {}, 1000));
            } else if (!currentTask?.finished && currentTask?.start) {
                setIntervalState(
                    setInterval(
                        () => setTime(formatTime(new Date().getTime() - new Date(currentTask.start).getTime())),
                        1000
                    )
                );
            }
        }
    }, [user?.activities[user?.activities.length - 1]]);

    return (
        <Container>
            <ModalTitle>Zeit tracken</ModalTitle>
            <Row>
                <Col>
                    <Row>
                        <h1>{time}</h1>
                    </Row>
                    {currentTask && (
                        <Row>
                            <p>Aktueller Task: {currentTask.name || "Pause"}</p>
                        </Row>
                    )}
                </Col>
            </Row>
            <Row>
                <Col>
                    <Button variant={"success"}>Starten</Button>
                </Col>
                <Col>
                    {!currentTask?.isPause ? (
                        <Button variant={"secondary"}>Pause</Button>
                    ) : (
                        <Button variant={"secondary"}>Pause beenden</Button>
                    )}
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
    `${formatString(Math.floor(time / HOURS_IN_MS))}:${formatString(Math.floor(time / MINUTES_IN_MS))}:${formatString(
        Math.floor(time / SECONDS_IN_MS)
    )}`;

const formatString = (time: number) => `0${time}`.slice(-2);

export default TimeTracker;
