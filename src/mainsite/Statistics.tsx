import React, { useEffect, useState } from 'react';
import firebase from 'firebase/compat';
import User from '../User';
import { Button, Col, Container, Row, Table } from 'react-bootstrap';

type Filter = 'day' | 'week' | 'month' | 'year' | 'allTime';

const Statistics = () => {
    const [filter, setFilter] = useState<Filter>('allTime');
    const [activities, setActivities] = useState<
        Array<{
            name: string;
            time: number;
        }>
    >([]);

    useEffect(() => {
        firebase
            .firestore()
            .collection('users')
            .doc(firebase.auth().currentUser!.uid)
            .onSnapshot(snapshot => {
                const newUser = snapshot.data() as User;

                setActivities(
                    newUser.tasks.map(val => {
                        const inTimeFrame = newUser.activities.filter(
                            act =>
                                act.start > getFilterLength(filter) &&
                                act.finished
                        );
                        let time = inTimeFrame
                            .filter(a => a.task === val)
                            .reduce(
                                (a, b) =>
                                    a +
                                    (b.finished! -
                                        b.start -
                                        b.pauses
                                            .filter(val => val.finished)
                                            .reduce(
                                                (a, b) =>
                                                    a + (b.finished! - b.start),
                                                0
                                            )),
                                0
                            );

                        time += inTimeFrame.reduce(
                            (a, b) =>
                                a +
                                b.pauses
                                    .filter(
                                        pause =>
                                            pause.task === val && pause.finished
                                    )
                                    .reduce(
                                        (acc, b) =>
                                            acc + (b.finished! - b.start),
                                        0
                                    ),
                            0
                        );

                        return {
                            name: val,
                            time,
                        };
                    })
                );
            });
    }, [filter]);

    return (
        <Container>
            <h1>Statistiken</h1>
            <br />
            <h4>Filter</h4>
            <Row>
                <Col>
                    <Button onClick={() => setFilter('allTime')}>Gesamt</Button>
                </Col>
                <Col>
                    <Button onClick={() => setFilter('year')}>Jahr</Button>
                </Col>
                <Col>
                    <Button onClick={() => setFilter('month')}>Monat</Button>
                </Col>
                <Col>
                    <Button onClick={() => setFilter('week')}>Woche</Button>
                </Col>
                <Col>
                    <Button onClick={() => setFilter('day')}>Tag</Button>
                </Col>
            </Row>
            <br />
            <Row>
                <p>
                    Aktueller Filter: <b>{getFilterFormatted(filter)}</b>
                </p>
            </Row>
            <Row>
                <Table>
                    <thead>
                        <th>Name der Aktivität</th>
                        <th>Verbrauchte Zeit</th>
                    </thead>
                    <tbody>
                        {activities.map(val => (
                            <tr>
                                <td>{val.name}</td>
                                <td>{formatTime(val.time)}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Row>
        </Container>
    );
};

const getFilterLength = (filter: Filter): number => {
    const filterLengths: { [val in Filter]: number } = {
        day: new Date().setHours(0, 0, 0),
        month: new Date().setMonth(new Date().getMonth(), 1),
        year: new Date().setFullYear(new Date().getFullYear(), 1, 1),
        allTime: 0,
        week: getMonday(new Date()).getTime(),
    };

    return filterLengths[filter];
};

function getMonday(d: Date) {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
}

const format = {
    allTime: 'Gesamt',
    year: 'Jahr',
    month: 'Monat',
    week: 'Woche',
    day: 'Tag',
};

const getFilterFormatted = (filter: Filter) => format[filter];

const SECONDS_IN_MS = 1000;
const MINUTES_IN_MS = 60 * SECONDS_IN_MS;
const HOURS_IN_MS = 60 * MINUTES_IN_MS;

const formatTime = (time: number) =>
    `${Math.floor(time / HOURS_IN_MS)} Stunden ${Math.floor(
        (time % HOURS_IN_MS) / MINUTES_IN_MS
    )} Minuten ${Math.floor((time % MINUTES_IN_MS) / SECONDS_IN_MS)} Sekunden`;

export default Statistics;
