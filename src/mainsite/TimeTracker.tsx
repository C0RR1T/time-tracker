import React, { useEffect, useState } from 'react';
import {
    Button,
    Col,
    Container,
    ListGroup,
    ModalTitle,
    Row,
} from 'react-bootstrap';
import User, { Activity } from '../User';
import firebase from 'firebase/compat/app';
import SelectTaskPopUp from './SelectTaskPopUp';

const TimeTracker = () => {
    const [time, setTime] = useState('00:00:00');
    const [user, setUser] = useState<User>();
    const [currentTask, setCurrentTask] = useState<{
        name?: string;
        isPause: boolean;
    }>();
    const [showPopUp, setShowPopUp] = useState(false);

    const [intervalState, setIntervalState] = useState<NodeJS.Timeout>();

    useEffect(() => {
        firebase
            .app()
            .firestore()
            .collection('users')
            .doc(firebase.app().auth().currentUser!.uid)
            .onSnapshot(snapshot => setUser(snapshot.data() as User));
    }, []);

    useEffect(() => {
        const currentTask = user?.activities[user?.activities.length - 1];
        if (currentTask) {
            const timeWasted = currentTask.pauses
                .filter(a => a.finished)
                .reduce((a, b) => a + (b.finished! - b.start), 0);
            const lastPause = getLastPause(user);
            if (!!currentTask.finished && !!currentTask.start) {
                setTime('00:00:00');
                clearInterval(intervalState!);
                setCurrentTask(undefined);
                setIntervalState(undefined);
            } else if (lastPause?.finished) {
                clearInterval(intervalState!);
                setIntervalState(undefined);
                setCurrentTask({
                    isPause: false,
                    name: currentTask.task,
                });
                setIntervalState(
                    setInterval(
                        () =>
                            setTime(
                                formatTime(
                                    Date.now() - currentTask.start - timeWasted
                                )
                            ),
                        1000
                    )
                );
            } else if (!lastPause?.finished && lastPause?.start) {
                clearInterval(intervalState!);
                setTime('00:00:00');
                setCurrentTask({
                    isPause: true,
                    name: lastPause?.task,
                });
                setIntervalState(
                    setInterval(
                        () => setTime(formatTime(Date.now() - lastPause.start)),
                        1000
                    )
                );
            } else if (!currentTask.finished && currentTask.start) {
                clearInterval(intervalState!);
                setTime('00:00:00');
                setIntervalState(
                    setInterval(
                        () =>
                            setTime(
                                formatTime(
                                    Date.now() - currentTask.start - timeWasted
                                )
                            ),
                        1000
                    )
                );
                setCurrentTask({
                    isPause: false,
                    name: currentTask.task,
                });
            }
        }
    }, [user?.activities[user?.activities.length - 1]]);

    const startTask = (task?: string) => {
        if (task) {
            firebase
                .firestore()
                .collection('users')
                .doc(firebase.auth().currentUser!.uid)
                .update({
                    activities: [
                        ...user!.activities,
                        {
                            start: Date.now(),
                            task,
                            pauses: [],
                        },
                    ],
                });
        }
    };

    const stopTask = () => {
        const currentActivity = user!.activities[user!.activities.length - 1];
        if (currentTask!.isPause) {
            firebase
                .firestore()
                .collection('users')
                .doc(firebase.auth().currentUser!.uid)
                .update({
                    activities: [
                        ...(user!.activities.length > 1
                            ? user!.activities.slice(-1)
                            : []),
                        {
                            ...currentActivity,
                            pauses: [
                                ...(currentActivity.pauses.length > 1
                                    ? currentActivity.pauses.slice(-1)
                                    : []),
                                {
                                    ...getLastPause(user!),
                                    finished: Date.now(),
                                },
                            ],
                        },
                    ],
                });
        } else {
            firebase
                .firestore()
                .collection('users')
                .doc(firebase.auth().currentUser!.uid)
                .update({
                    activities: [
                        ...(user!.activities.length > 1
                            ? user!.activities.slice(-1)
                            : []),
                        {
                            ...currentActivity,
                            finished: Date.now(),
                        },
                    ],
                });
        }
    };

    const startPause = (task?: string) => {
        const currentActivity = user!.activities[user!.activities.length - 1];

        firebase
            .firestore()
            .collection('users')
            .doc(firebase.auth().currentUser!.uid)
            .update({
                activities: [
                    ...(user!.activities.length > 1
                        ? user!.activities.slice(-1)
                        : []),
                    {
                        ...currentActivity,
                        pauses: [
                            ...currentActivity.pauses,
                            {
                                start: Date.now(),
                                ...(task ? { task } : {}),
                            },
                        ],
                    },
                ],
            });
    };

    return (
        <Container>
            <SelectTaskPopUp
                allowUndefined={!!currentTask}
                currentTask={currentTask}
                onSelect={currentTask ? startPause : startTask}
                onClose={() => setShowPopUp(false)}
                show={showPopUp}
            />
            <ModalTitle>Zeit tracken</ModalTitle>
            <Row>
                <Col>
                    <Row>
                        <h1>{time}</h1>
                    </Row>
                    {!!currentTask && (
                        <Row>
                            <p>Aktueller Task: {currentTask.name || 'Pause'}</p>
                        </Row>
                    )}
                </Col>
            </Row>
            <Row>
                <Col>
                    <Button
                        variant={'success'}
                        onClick={() => setShowPopUp(true)}
                        disabled={!!currentTask}>
                        Starten
                    </Button>
                </Col>
                <Col>
                    <Button
                        variant={'secondary'}
                        disabled={!currentTask || currentTask?.isPause}
                        onClick={() => setShowPopUp(true)}>
                        Pause
                    </Button>
                </Col>
                <Col>
                    <Button
                        variant={'danger'}
                        disabled={!currentTask}
                        onClick={stopTask}>
                        {currentTask?.isPause ? 'Pause beenden' : 'Beenden'}
                    </Button>
                </Col>
            </Row>
            <br />
            <h1>Schnell-Start</h1>
            <Row>
                <ListGroup>
                    {user?.fastTasks.map(val => (
                        <ListGroup.Item
                            disabled={
                                currentTask?.name === val ||
                                currentTask?.isPause
                            }
                            action
                            onClick={() =>
                                currentTask ? startPause(val) : startTask(val)
                            }
                            key={val}>
                            {val}
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </Row>
        </Container>
    );
};

const SECONDS_IN_MS = 1000;
const MINUTES_IN_MS = 60 * SECONDS_IN_MS;
const HOURS_IN_MS = 60 * MINUTES_IN_MS;

const getLastPause = (user?: User): Activity | undefined => {
    const lastPause =
        user?.activities[user.activities.length - 1]?.pauses[
            user?.activities[user.activities.length - 1]?.pauses.length - 1
        ];
    if (lastPause) {
        return lastPause;
    }
};

const formatTime = (time: number) =>
    `${formatString(Math.floor(time / HOURS_IN_MS))}:${formatString(
        Math.floor((time % HOURS_IN_MS) / MINUTES_IN_MS)
    )}:${formatString(Math.floor((time % MINUTES_IN_MS) / SECONDS_IN_MS))}`;

const formatString = (time: number) => `0${time}`.slice(-2);

export default TimeTracker;
