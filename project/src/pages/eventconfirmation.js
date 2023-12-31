import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import NavBar from './components/navbar';
import { getEvent } from './components/dbHelper.js';
import './eventconfirmation.css';

function EventConfirmation() {
    const { eventId } = useParams();
    const [eventData, setEventData] = useState(null);

    useEffect(() => {
        getEvent(eventId)
            .then((eventData) => {
                if (eventData) {
                    setEventData(eventData);
                }
            })
            .catch((error) => {
                console.error('Error fetching event data:', error);
                // Handle the error appropriately
            });
    }, [eventId]);

    const formatTimeToAMPM = (timeString) => {
        const time = new Date(`1970-01-01T${timeString}`);
        return time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    };

    if (!eventData) {
        return <div className="EC loading-message">Loading event details...</div>;
    }

    return (
        <div className="EC">
            <NavBar />
            <main>
                <section className="event-details">
                    <h2>{eventData.name}</h2>
                    <p className="event-organization">
                        <b>Organization:</b> {eventData.organization}
                    </p>
                    <p className="event-date">
                        <b>Date:</b> {eventData.startDate}
                    </p>
                    <p className="event-time">
                        <b>Start Time:</b> {formatTimeToAMPM(eventData.startTime)}
                    </p>
                    <p className="event-end-time">
                        <b>End Time:</b> {formatTimeToAMPM(eventData.endTime)}
                    </p>
                    <p className="event-location">
                        <b>Location:</b> {eventData.location}
                    </p>
                    <p className="event-description">
                        <b>Event Description:</b> {eventData.description}
                    </p>
                    {/* You can add more event details here if available */}
                </section>
            </main>
        </div>
    );
}

export default EventConfirmation;
