const { google } = require("googleapis");
const { OAuth2 } = google.auth;

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_SECRET_ID;

async function meet(options) {
  let oAuth2Client = new OAuth2(clientId, clientSecret);

  oAuth2Client.setCredentials({
    refresh_token: options.refreshToken,
  });

  let calendar = google.calendar({ version: "v3", auth: oAuth2Client });

  const event = {
    summary: options.summary,
    // location: options.location,
    description: options.description,
    colorId: 1,
    conferenceData: {
      createRequest: {
        requestId: "zzz",
        conferenceSolutionKey: {
          type: "hangoutsMeet",
        },
      },
    },
    start: {
      dateTime: options.startDate,
      timeZone: options.timeZone,
    },
    end: {
      dateTime: options.endDate,
      timeZone: options.timeZone,
    },
  };

  let link = await calendar.events.update({
    calendarId: "primary",
    conferenceDataVersion: "1",
    resource: event,
    eventId: options.eventId,
  });

  return link.data.hangoutLink;
}

module.exports.meet = meet;

//https://github.com/sumitjangir123/meet-api

/*

{
  kind: 'calendar#event',
  etag: '"3297438071634000"',
  id: 'o1p62odvv0j9rt5a15ae7c7spo',
  status: 'confirmed',
  htmlLink: 'https://www.google.com/calendar/event?eid=bzFwNjJvZHZ2MGo5cnQ1YTE1YWU3YzdzcG8gY2hpcGVycm9ja0Bt',
  created: '2022-03-31T09:18:06.000Z',
  updated: '2022-03-31T09:30:35.817Z',
  summary: 'upd',
  description: 'sdsd',
  location: 'Jaipur',
  colorId: '1',
  creator: { email: 'chiperrock@gmail.com', self: true },
  organizer: { email: 'chiperrock@gmail.com', self: true },
  start: { dateTime: '2022-04-05T09:45:10Z', timeZone: 'America/Phoenix' },
  end: { dateTime: '2022-04-05T10:15:10Z', timeZone: 'America/Phoenix' },
  iCalUID: 'o1p62odvv0j9rt5a15ae7c7spo@google.com',
  sequence: 1,
  hangoutLink: 'https://meet.google.com/gwy-xtek-wca',
  conferenceData: {
    createRequest: {
      requestId: 'zzz',
      conferenceSolutionKey: [Object],
      status: [Object]
    },
    entryPoints: [ [Object] ],
    conferenceSolution: {
      key: [Object],
      name: 'Google Meet',
      iconUri: 'https://fonts.gstatic.com/s/i/productlogos/meet_2020q4/v6/web-512dp/logo_meet_2020q4_color_2x_web_512dp.png'
    },
    conferenceId: 'gwy-xtek-wca',
    signature: 'AKpSKUttztkPCGQXxPS1a+iJ5b6H'
  },
  reminders: { useDefault: true },
  eventType: 'default'
}


*/
