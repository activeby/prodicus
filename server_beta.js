var restify = require('restify');
var builder = require('botbuilder');

// Get secrets from server environment
var botConnectorOptions = {
    appId: process.env.BOTFRAMEWORK_APPID,
    appPassword: process.env.BOTFRAMEWORK_APPSECRET
};

// Create bot
var connector = new builder.ChatConnector(botConnectorOptions);
// var bot = new builder.UniversalBot(connector);

// bot.dialog('/', function (session) {

//     //respond with user's message
//     session.send("You said " + session.message.text);
// });

// Setup Restify Server
var server = restify.createServer();

// Handle Bot Framework messages
server.post('/api/messages', connector.listen());

// // Serve a static web page
// server.get(/.*/, restify.serveStatic({
//  'directory': '.',
//  'default': 'index.html'
// }));

server.listen(process.env.port || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});





var bot = new builder.UniversalBot(connector, [
   function (session) {
        session.send("Hello... I'm a decision bot.");
        session.send("You said: '%s'. Try asking for 'help'.", session.message.text);
    },
    function (session, results) {
        session.endConversation("Goodbye until next time...");
    }
]);

bot.dialog('rootMenu', [
  function (session) {
    var action = createRootMenu(session);

    var msg = new builder.Message(session).addAttachment(action);
    session.send(msg);
  }
]).triggerAction({matches: /^help$/i});

bot.dialog('Call', [
  function (session) {
    builder.Prompts.text(session, "Please add your phone number");
  },
  function (session, results) {
    var a = results.response
    // some actions
    session.endDialog("We are call to you");
  }
]).triggerAction({matches: /^call$/i});

bot.dialog('Buy', [
  function (session) {
    var action = serviceList(session);

    var msg = new builder.Message(session).addAttachment(action);
    session.send(msg);
  },
]).triggerAction({matches: /^buy/i});

bot.dialog('Support', [
  function (session) {
    builder.Prompts.text(session, "What is your question?");
  }
]).triggerAction({matches: /^support$/i});

// Buy
DomainServices = ['By', 'RU', "Com"];
bot.dialog('Domain', [
  function (session) {
    builder.Prompts.text(session, "dfsdfdsfnfmbsdfhdkslfjhkjdshjfkh");
  }
]).triggerAction({matches: /^domain/i});


function createRootMenu(session) {
  const card = new builder.ThumbnailCard(session);
  card.buttons([
      new builder.CardAction(session).title('Buy service').value('Buy').type('imBack'),
      new builder.CardAction(session).title('Support').value('Support').type('imBack'),
      new builder.CardAction(session).title('Call').value('Call').type('imBack'),
  ]).text(`What would you like to do?`);

  return card;
}

function serviceList(session) {
  const card = new builder.ThumbnailCard(session);
  card.buttons([
      new builder.CardAction(session).title('Hosting').value('Hosting').type('imBack'),
      new builder.CardAction(session).title('Domain').value('Domain').type('imBack'),
      new builder.CardAction(session).title('Mail').value('Mail').type('imBack'),
  ]).text(`What would you like to buy?`);

  return card;
}

var model = process.env.model || 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/b8ac99e4-3e42-4bb4-8fa3-eec10e4de189?subscription-key=88ec7ba1fb364eb590fdb5764bf73f7f&timezoneOffset=0.0&verbose=true&q=';
var recognizer = new builder.LuisRecognizer(model);
var intents = new builder.IntentDialog({ recognizers: [recognizer] });
intents.onDefault(builder.DialogAction.send("I'm sorry. I didn't understand."));
// bot.dialog('/', intents);

intents.matches('buy', [
    function (session, args, next) {
      debugger;
        var e = builder.EntityRecognizer.findEntity(args.entities, 'hosting');
        if (!e) {
            builder.Prompts.text(session, "Which hosting do you want?");
        } else {
            next({ response: e.entity });
        }
    },
    function (session, results) {
        if (results.response) {
            // ... save task
            session.send("ok, there is list of %s", results.response);
        } else {
            session.send("no response");
        }
    }
]);
