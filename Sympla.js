const http = require('https');
const readlineSync = require('readline-sync');
const rafflex = require('raffle-x');

(async () => {
    var token = readlineSync.question('Informe o token: ');

    const events = await getEventsByToken(token).catch(err => console.log('Não foi possível carregar os eventos a partir do token.'));

    events.forEach((element, index) => {
        console.log('[' + (index + 1) + '] ' + element.name);
    });

    var selectedEvent = parseInt(readlineSync.question('Escolha um evento: '));
    var QtdSorteados = parseInt(readlineSync.question('Digite a quantidade de sorteados: '));


    if (selectedEvent <= 0 || selectedEvent > events.length) console.log('Evento inválido.');
    else {
        const selectedEventParticipants = await getEventParticipantsByEventId(token, events[selectedEvent - 1].id).catch(err => console.log('Não foi possível carregar os participantes a partir do id do evento.'));
        const selectedEventHasCheckinParticipants = selectedEventParticipants.filter(obj => obj.checkin[0].check_in);

        const Sorteados = rafflex.raffle(selectedEventHasCheckinParticipants, 'id', QtdSorteados, false)

        Sorteados.forEach(element => {
          console.log(JSON.stringify ("NOME: " + element.first_name +" " + element.last_name));
           
        });
        
    }

    


})();

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
        console.log(error);
    }
}

async function getEventParticipantsByEventId(token, eventId) {
    try {
        const eventParticipantsResponse = await getEventParticipantsPromise(token, eventId);
        return Array.from(eventParticipantsResponse.data);
    } catch (error) {
        console.log(error);
    }
}