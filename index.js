const http = require('https');
const express = require('express'),
        app = express();

app.get('/events', async function(req, res){
    try {
        const token = req.headers.token;
        const events = await getEventsByToken(token);
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error });
    }
});

app.get('/events/:eventId/participants', async function(req, res){
    try {
        const token = req.headers.token;
        const participants = await getEventParticipantsByEventId(token, req.params.eventId);
        res.json(participants);
    } catch (error) {
        res.status(500).json({ error: error });
    }
});

var server = app.listen(3000);
console.log('Servidor Express iniciado na porta %s', server.address().port);

function getEventsPromise(token) {
    const options = {
        headers: {
            's_token': token,
            'Accept': '*/*'
        }
    }

    return new Promise((resolve, reject) => {
        http.get('https://api.sympla.com.br/public/v3/events', options, response => {
            let rawData = '';

            response.on('data', d => rawData += d);
            response.on('end', () => {
                const parsedData = JSON.parse(rawData);
                resolve(parsedData);
            })
            response.on('error', error => reject(error));
        })
    });
}

function getEventParticipantsPromise(token, eventId) {
    const options = {
        headers: {
            's_token': token,
            'Accept': '*/*'
        }
    }

    return new Promise((resolve, reject) => {
        http.get(`https://api.sympla.com.br/public/v3/events/${eventId}/participants`, options, response => {
            let rawData = '';

            response.on('data', d => rawData += d);
            response.on('end', () => {
                const parsedData = JSON.parse(rawData);
                resolve(parsedData);
            })
            response.on('error', error => reject(error));
        })
    });
}

async function getEventsByToken(token) {
    try {
        const eventsResponse = await getEventsPromise(token);
        return Array.from(eventsResponse.data);
    } catch (error) {
        throw error;
    }
}

async function getEventParticipantsByEventId(token, eventId) {
    try {
        const eventParticipantsResponse = await getEventParticipantsPromise(token, eventId);
        return Array.from(eventParticipantsResponse.data);
    } catch (error) {
        throw error;
    }
}