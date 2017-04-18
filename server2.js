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
    if(session.message.user.id != 'default-user'){
      session.send('Hi, %s', session.message.user.name)
    } else {
      session.send('Hi!');
    }

    var action = createRootMenu(session);

    var msg = new builder.Message(session).addAttachment(action);
    session.endDialog(msg);
}).triggerAction({
    matches: 'help'
});

bot.dialog('Buy', [
  function (session, args, next) {
    var domain = builder.EntityRecognizer.findEntity(args.intent.entities, 'domain');
    var mail = builder.EntityRecognizer.findEntity(args.intent.entities, 'mail');
    if (domain) {
      session.send('Domain: \'%s\'', session.message.text);
    } else if (mail) {
      session.send('Mail: \'%s\'', session.message.text);
    } else {
      session.send('Welcome to the Store! We are analyzing your message: \'%s\'', session.message.text);
    }
  },
]).triggerAction({
    matches: 'Buy',
    onInterrupted: function (session) {
        session.send('Please provide a destination');
    }
});

bot.dialog('Support', [
  function (session, args, next) {
    var domain = builder.EntityRecognizer.findEntity(args.intent.entities, 'domain');
    var hosting = builder.EntityRecognizer.findEntity(args.intent.entities, 'hosting');
    var cloud = builder.EntityRecognizer.findEntity(args.intent.entities, 'cloud');

    if(cloud){
      session.send('Oh, i see u have problem with clouds')
      session.endDialog();
      session.beginDialog('cloudchannel', cloud)
    } else if (hosting) {
      session.send('Oh, i see u have problem with hosting')
      session.endDialog();
      session.beginDialog('hostingchannel', hosting)
    } else if (domain) {
      session.send('Oh, i see u have problem with domains')
      session.endDialog();
      session.beginDialog('domainchannel', domain)
    } else {
      let action = buildSupportMenu(session);

      let msg = new builder.Message(session).addAttachment(action);
      session.endDialog(msg);
    }

  }
]).triggerAction({
  matches: 'Support',
  onInterrupted: function (session) {
    session.send('something went wrong');
  }
});

bot.dialog('cloudchannel', [
  function(session, args, next){
    session.send('there is cloud support channel');
    let action = buildEntMenu(session);
    let msg = new builder.Message(session).addAttachment(action);
    session.send(msg);

    builder.Prompts.text(session, 'Describe your problem or follow buttons');
  },
  function(session, results){
    let link = 'http://www.active.by/ru-by/it-consulting/sla.html'
    session.endDialog('Now i am not so smart, follow the link %s', link)
  }
]);

bot.dialog('hostingchannel', [
  function(session, args, next){
    session.send('there is hosting support channel');
    let action = buildEntMenu(session);
    let msg = new builder.Message(session).addAttachment(action);
    session.send(msg);
    builder.Prompts.text(session, 'Describe your problem');
  },
  function(session, results){
    let link = 'http://www.active.by/ru-by/services/bitrixhost/'
    session.endDialog('Now i am not so smart, follow the link %s', link)
  }
]);
bot.dialog('domainchannel', [
  function(session, args, next){
    session.send('there is domain support channel');
    let action = buildEntMenu(session);
    let msg = new builder.Message(session).addAttachment(action);
    session.send(msg);
    builder.Prompts.text(session, 'Describe your problem');
  },
  function(session, results){
    let link = 'http://www.active.by/ru-by/services/domains/'
    session.endDialog('Now i am not so smart, follow the link %s', link)
  }
]);

bot.dialog('mailbox', [
  function(session, args, next){
    session.endDialog('To change ur mailbox size or other manipulations follow the link, %s', 'https://link_to_mailbox.com');
  }
]).triggerAction({
  matches: 'mailbox',
  onInterrupted: function (session) {
    session.send('something went wrong');
  }
});

bot.dialog('profile', [
  function(session, args, next){
    session.endDialog('To make manipulations with profile or user, follow link %s', 'https://profile_edit.com');
  }
]).triggerAction({
  matches: 'profile',
  onInterrupted: function (session) {
    session.send('something went wrong');
  }
});

// helpers
function buildSupportMenu(session){
  const card = new builder.ThumbnailCard(session);
    card.buttons([
        new builder.CardAction(session).title('support hosting').value('support hosting').type('imBack'),
        new builder.CardAction(session).title('support domain').value('support domain').type('imBack'),
        new builder.CardAction(session).title('support cloud').value('support cloud').type('imBack'),
    ]).text(`Which type of help do you need?`);

  return card;
}

function buildEntMenu(session){
  const card = new builder.ThumbnailCard(session);
    card.buttons([
        new builder.CardAction(session).title('doesnt work').value('doesnt work').type('imBack'),
        new builder.CardAction(session).title('cant buy').value('cant buy').type('imBack'),
        new builder.CardAction(session).title('additional').value('additional').type('imBack')
    ]).text(`Which type of help do you need?`);

  return card;
}

function createRootMenu(session) {
  const card = new builder.ThumbnailCard(session);
  card.buttons([
      new builder.CardAction(session).title('Buy service').value('Buy').type('imBack'),
      new builder.CardAction(session).title('Support').value('Support').type('imBack'),
      new builder.CardAction(session).title('Call').value('Call').type('imBack'),
  ]).text(`What would you like to do?`);

  return card;
}
