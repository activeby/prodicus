var restify = require('restify');
var builder = require('botbuilder');
var Store = require('./localhost');

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

function isAuth(session){
  return session.message.user.id != 'default-user'
}

bot.dialog('help', function (session) {
    if(isAuth(session)){
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

bot.dialog('Support', [
  function (session, args, next) {
    var domain = builder.EntityRecognizer.findEntity(args.intent.entities, 'domain');
    var hosting = builder.EntityRecognizer.findEntity(args.intent.entities, 'hosting');
    var cloud = builder.EntityRecognizer.findEntity(args.intent.entities, 'cloud');

    if(cloud){
      session.send('Oh, i understand u have problem with clouds')
      session.endDialog();
      session.beginDialog('cloudchannel', cloud)
    } else if (hosting) {
      session.send('Oh, i understand u have problem with hosting')
      session.endDialog();
      session.beginDialog('hostingchannel', hosting)
    } else if (domain) {
      session.send('Oh, i understand u have problem with domains')
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
    session.send('I have been broken.');
  }
});

bot.dialog('cloudchannel', [
  function(session, args, next){
    session.send('This is Cloud support channel');
    let action = buildEntMenu(session);
    let msg = new builder.Message(session).addAttachment(action);
    session.send(msg);

    builder.Prompts.text(session, 'Describe your problem or follow buttons: ');
  },
  function(session, results){
    let link = 'http://www.active.by/ru-by/it-consulting/sla.html'
    session.endDialog('Now i am not so smart, follow the link %s', link)
  }
]);

bot.dialog('hostingchannel', [
  function(session, args, next){
    session.send('This is hosting support channel');
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
    session.send('This is Domain support channel.');
    let action = buildEntMenu(session);
    let msg = new builder.Message(session).addAttachment(action);
    session.send(msg);
    builder.Prompts.text(session, 'Describe your problem: ');
  },
  function(session, results){
    let link = 'http://www.active.by/ru-by/services/domains/'
    session.endDialog('Now i am not so smart, follow the link %s', link)
  }
]);

bot.dialog('mailbox', [
  function(session, args, next){
    if(isAuth(session)){
      session.endDialog('To change your mailbox size or do some other manipulations follow the link, %s', 'http://localhost:3000/accounts/1/subscriptions/2017');
    } else {
      session.endDialog('Please, authorize.')
    }
  }
]).triggerAction({
  matches: 'mailbox',
  onInterrupted: function (session) {
    session.send('I have been broken.');
  }
});

bot.dialog('profile', [
  function(session, args, next){
    if(isAuth(session)){
      session.endDialog('To make manipulations with profile or user, follow link %s', 'http://localhost:3000/profile');
    } else {
      session.endDialog('You need to be authorized to perform this action.')
    }
  }
]).triggerAction({
  matches: 'profile',
  onInterrupted: function (session) {
    session.send('I have benn broken');
  }
});

bot.dialog('Buy', [
  function (session, args, next) {
    if (args.intent.entities.length != 0) {
      var domain = builder.EntityRecognizer.findEntity(args.intent.entities, 'domain');
      var mail = builder.EntityRecognizer.findEntity(args.intent.entities, 'mail');
      var hosting = builder.EntityRecognizer.findEntity(args.intent.entities, 'hosting');

      if (domain) {
        session.endDialog();
        session.beginDialog('Domain', args);
      } else if (mail) {
        session.endDialog();
        session.beginDialog('Mail', args);
      } else if (hosting) {
        session.endDialog();
        session.beginDialog('Hosting', args);
      } else {
        var action = createServiceMenu(session);
        var msg = new builder.Message(session).addAttachment(action);

        session.send(session, 'Sorry, I don\'t understand. We have only domain, hosting, mail. What you want buy?');
        session.endDialog(msg);
      }
    } else {
      var action = createServiceMenu(session);
      var msg = new builder.Message(session).addAttachment(action);

      session.endDialog(msg);
    };
  }
]).triggerAction({
    matches: 'Buy',
    onInterrupted: function (session) {
      session.send('Please provide a destination');
    }
});

bot.dialog('Domain', [
  function (session, args, next) {
    domainStep(session, args);
  },
]);

bot.dialog('Hosting', [
  function (session, args) {
    builder.Prompts.number(session, 'How much people use it?');
  },
  function (session, response) {
    session.dialogData.people_count = response.response
    builder.Prompts.number(session, 'How much plans do you show?');
  },
  function (session, response) {
    session.dialogData.limit = response.response
    Store
      .getPlans(session.dialogData.limit)
      .then(function (plans) {
        session.send('I found %d plans:', plans.length);
        var message = new builder.Message()
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments(plans.map(planAsAttachment));
        session.endDialog(message);
      });
  }
])

bot.dialog('Mail', [
  function (session, response) {
    builder.Prompts.number(session, 'Please, add limit plan count');
  },
  function (session, response) {
    session.dialogData.cost = response.response
    session.endDialog('We have some subscriptions for you!!!')
  }
]);

bot.dialog('call', [
  function(session){
    if(isAuth(session)){
      session.endDialog('Okay, %s. We call to you as soon as possible. Thanks!')
    } else {
      builder.Prompts.number(session, 'Enter your phone number');
    }
  },
  function(session, results){
    session.endDialog('We call to %s as soon as possible. Thanks!', results.response)
  }
]).triggerAction({
  matches: 'call',
  onInterrupted: function (session) {
    session.send('I have benn broken');
  }
});
// helpers
function planAsAttachment(plan) {
  return new builder.HeroCard()
      .title(plan.name)
      .subtitle('Plan period %s. Recurring fee %s', plan.plan_period_name, plan.price)
      .buttons([
          new builder.CardAction()
              .title('Order')
              .type('openUrl')
              .value(plan.shopping_cart_url)
      ]);
}
function createServiceMenu(session) {
  const card = new builder.ThumbnailCard(session);
  card.buttons([
      new builder.CardAction(session).title('Hosting').value('Buy hosting').type('imBack'),
      new builder.CardAction(session).title('Domain').value('Buy domain').type('imBack'),
      new builder.CardAction(session).title('Mail').value('Buy mail').type('imBack'),
  ]).text(`What kind of service you want?`);

  return card;
}

function domainStep(session, args) {
  var com = builder.EntityRecognizer.findEntity(args.intent.entities, 'com');
  var us = builder.EntityRecognizer.findEntity(args.intent.entities, 'us');
  if (com) {
    session.send('Please go to link')
    session.endDialog('[AP](http://localhost:3000/external_dispatcher/settle?shopping_cart_items%5B%5D%5Btype%5D=domain&shopping_cart_items%5B%5D%5Bname%5D=domain12312312.com/&shopping_cart_items%5B%5D%5Bplan_id%5D=14&shopping_cart_items%5B%5D%5Bplan_period_id%5D=27&skip_all_steps=1)')
  } else if (us) {
    session.endDialog('You buy us domain');
  } else {
    var action = createDomainMenu(session);
    var msg = new builder.Message(session).addAttachment(action);

    session.endDialog(msg);
  }
}

function createDomainMenu(session) {
  const card = new builder.ThumbnailCard(session);
  card.buttons([
      new builder.CardAction(session).title('Us').value('Buy domain us').type('imBack'),
      new builder.CardAction(session).title('Com').value('Buy domain com').type('imBack'),
  ]).text(`What kind of domain?`);

  return card;
}

function buildSupportMenu(session){
  const card = new builder.ThumbnailCard(session);
    card.buttons([
        new builder.CardAction(session).title('Hosting support').value('Hosting support').type('imBack'),
        new builder.CardAction(session).title('Domain support').value('Domain support').type('imBack'),
        new builder.CardAction(session).title('Cloud support').value('Cloud support').type('imBack'),
    ]).text(`Which type of help do you need?`);

  return card;
}

function buildEntMenu(session){
  const card = new builder.ThumbnailCard(session);
    card.buttons([
        new builder.CardAction(session).title('It doesnt work').value('It doesnt work').type('imBack'),
        new builder.CardAction(session).title('I have problems with payment').value('I have problems with payment').type('imBack'),
        new builder.CardAction(session).title('I have additional questions').value('I have additional questions').type('imBack')
    ]).text(`Which type of help do you need?`);

  return card;
}

function createRootMenu(session) {
  const card = new builder.ThumbnailCard(session);
  card.buttons([
      new builder.CardAction(session).title('Buy service').value('Buy').type('imBack'),
      new builder.CardAction(session).title('Support').value('Support').type('imBack'),
      new builder.CardAction(session).title('I want a call').value('call').type('imBack'),
  ]).text(`What would you like to do?`);

  return card;
}
