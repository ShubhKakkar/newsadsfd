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

  let link = await calendar.events.delete({
    calendarId: "primary",
    eventId: options.eventId,
  });

  // console.log(link);

  // console.log(link.data);

  return link.data;
}

module.exports.meet = meet;

//https://github.com/sumitjangir123/meet-api
