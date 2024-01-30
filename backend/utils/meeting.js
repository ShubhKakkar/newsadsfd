const { google } = require("googleapis");
const { OAuth2 } = google.auth;

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_SECRET_ID;

async function meet(options) {
  //setting details
  let oAuth2Client = new OAuth2(clientId, clientSecret);

  oAuth2Client.setCredentials({
    refresh_token: options.refreshToken,
  });

  // Create a new calender instance.
  let calendar = google.calendar({ version: "v3", auth: oAuth2Client });

  //   var date1 = options.date + "T" + options.time.split(":")[0] + ":00" + ":30";
  //   var date2 = options.date + "T" + options.time.split(":")[0] + ":45" + ":30";

  //   var x = new Date(
  //     options.date + "T" + options.time.split(":")[0] + ":00" + ":30"
  //   );
  //   var y = new Date(
  //     options.date + "T" + options.time.split(":")[0] + ":45" + ":30"
  //   );

  //   var end1 =
  //     options.date +
  //     "T" +
  //     x.getUTCHours() +
  //     ":" +
  //     x.getUTCMinutes() +
  //     ":00" +
  //     ".000Z";
  //   var end2 =
  //     options.date +
  //     "T" +
  //     y.getUTCHours() +
  //     ":" +
  //     y.getUTCMinutes() +
  //     ":00" +
  //     ".000Z";

  //checking whether teacher is busy or not
  //   let result = await calendar.events.list({
  //     calendarId: "primary",
  //     timeMin: end1,
  //     timeMax: end2,
  //     maxResults: 1,
  //     singleEvents: true,
  //     orderBy: "startTime",
  //   });

  //   let events = result.data.items;
  //   if (events.length) {
  //     console.log("you are busy for this time slot !");
  //     return null;
  //   }

  // Create a new event start date instance for teacher in their calendar.
  //   const eventStartTime = new Date();
  //   eventStartTime.setDate(options.date.split("-")[2]);
  //   const eventEndTime = new Date();
  //   eventEndTime.setDate(options.date.split("-")[2]);
  //   eventEndTime.setMinutes(eventStartTime.getMinutes() + 45);

  // Create a dummy event for temp users in our calendar
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

  let link = await calendar.events.insert({
    calendarId: "primary",
    conferenceDataVersion: "1",
    resource: event,
  });

  return { link: link.data.hangoutLink, id: link.data.id };
}

module.exports.meet = meet;

//https://github.com/sumitjangir123/meet-api

/*
{
  kind: 'calendar#event',
  etag: '"3297436573328000"',
  id: 'o1p62odvv0j9rt5a15ae7c7spo',
  status: 'confirmed',
  htmlLink: 'https://www.google.com/calendar/event?eid=bzFwNjJvZHZ2MGo5cnQ1YTE1YWU3YzdzcG8gY2hpcGVycm9ja0Bt',
  created: '2022-03-31T09:18:06.000Z',
  updated: '2022-03-31T09:18:06.664Z',
  summary: 'ww',
  description: 'sd',
  location: 'Jaipur',
  colorId: '1',
  creator: { email: 'chiperrock@gmail.com', self: true },
  organizer: { email: 'chiperrock@gmail.com', self: true },
  start: { dateTime: '2022-04-08T08:30:40Z', timeZone: 'America/Chicago' },
  end: { dateTime: '2022-04-08T09:00:40Z', timeZone: 'America/Chicago' },
  iCalUID: 'o1p62odvv0j9rt5a15ae7c7spo@google.com',
  sequence: 0,
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
