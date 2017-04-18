var restify = require('restify');
var builder = require('botbuilder');
// Get secrets from server environment
var botConnectorOptions = {
    appId: process.env.BOTFRAMEWORK_APPID,
    appPassword: process.env.BOTFRAMEWORK_APPSECRET
};
// Create bot
var connector = new builder.ChatConnector(botConnectorOptions);
// Setup Restify Server
var server = restify.createServer();
// Handle Bot Framework messages
server.post('/api/messages', connector.listen());

server.listen(process.env.port || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

var bot = new builder.UniversalBot(connector, function (session) {
  session.send('Sorry, I did not understand \'%s\'. Type \'help\' if you need assistance.', session.message.text);
});
var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/b8ac99e4-3e42-4bb4-8fa3-eec10e4de189?subscription-key=88ec7ba1fb364eb590fdb5764bf73f7f&timezoneOffset=0.0&verbose=true&q=');
bot.recognizer(recognizer);

bot.dialog('help', function (session) {
    session.send('Hi!');
    var action = createRootMenu(session);

    var msg = new builder.Message(session).addAttachment(action);
    session.endDialog(msg);
}).triggerAction({
    matches: 'help'
});

bot.dialog('domain', [
  // functions
]).triggerAction({
    matches: 'domain'
});

bot.dialog('Buy', [
  // functions
]).triggerAction({
    matches: 'Buy',
    onInterrupted: function (session) {
        session.send('Please provide a destination');
    }
});

// helpers
function createRootMenu(session) {
  const card = new builder.ThumbnailCard(session);
  card.buttons([
      new builder.CardAction(session).title('Buy service').value('Buy').type('imBack'),
      new builder.CardAction(session).title('Support').value('Support').type('imBack'),
      new builder.CardAction(session).title('Call').value('Call').type('imBack'),
      new builder.CardAction(session).title(session.message.user.id).value('Buy').type('imBack'),
  ]).text(`What would you like to do?`);

  return card;
}
