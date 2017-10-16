'use strict';

process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').ApiAiApp;
const functions = require('firebase-functions');
const fact = require('./rcFactType.js');

// API.AI actions
const UNRECOGNIZED_DEEP_LINK = 'deeplink.unknown';
const TELL_FACT = 'tell.fact';

// API.AI parameter names
const CATEGORY_ARGUMENT = 'fact-category';

const FACT_TYPE = {
  HISTORY: 'history',
  CULTURE: 'culture'
};

const HISTORY_FACTS = new Set(fact.history);

const CULTURE_FACTS = new Set(fact.culture);

const NEXT_FACT_DIRECTIVE = ' Would you like to hear another fact master wayne?';
const CONFIRMATION_SUGGESTIONS = ['Sure', 'Thank you, bye'];

const NO_INPUTS = [
  'I didn\'t hear that.',
  'If you\'re still there, say that again.',
  'We can stop here. See you soon.'
];

function getRandomFact (facts) {

  let randomIndex = (Math.random() * (facts.size - 1)).toFixed();
  let randomFactIndex = parseInt(randomIndex, 10);
  let counter = 0;
  let randomFact = '';
  for (let fact of facts.values()) {
    if (counter === randomFactIndex) {
      randomFact = fact;
      break;
    }
    counter++;
  }
  return randomFact;
}

exports.factsaboutrc = functions.https.onRequest((request, response) => {
  const app = new App({ request, response });

  // uncomment to log request.header & request.body
  // console.log('Request headers: ' + JSON.stringify(request.headers));
  // console.log('Request body: ' + JSON.stringify(request.body));

  // Say a fact
  function tellFact (app) {
    let historyFacts = HISTORY_FACTS;
    let cultureFacts = CULTURE_FACTS;


    let factCategory = app.getArgument(CATEGORY_ARGUMENT);

    if (factCategory === FACT_TYPE.HISTORY) {
      let fact = getRandomFact(historyFacts);
      if (fact === null) {
        if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
          let suggestions = ['Culture'];

          app.ask(
            app
              .buildRichResponse()
              .addSimpleResponse(noFactsLeft(app, factCategory, FACT_TYPE.CULTURE))
              .addSuggestions(suggestions));
        } else {
          app.ask(noFactsLeft(app, factCategory, FACT_TYPE.CULTURE),
            NO_INPUTS);
        }
        return;
      }

      let factPrefix = 'Sure, here\'s a fact about RC\'s history. ';
      if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {

        app.ask(
          app
            .buildRichResponse()
            .addSimpleResponse(factPrefix + fact)
            .addSimpleResponse(NEXT_FACT_DIRECTIVE)
            .addSuggestions(CONFIRMATION_SUGGESTIONS));
      } else {
        app.ask(factPrefix + fact + NEXT_FACT_DIRECTIVE, NO_INPUTS);
      }
      return;
    } else if (factCategory === FACT_TYPE.CULTURE) {
      let fact = getRandomFact(cultureFacts);
      if (fact === null) {
        if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
          let suggestions = ['History'];

          app.ask(
            app
              .buildRichResponse()
              .addSimpleResponse(noFactsLeft(app, factCategory, FACT_TYPE.HISTORY))
              .addSuggestions(suggestions));
        } else {
          app.ask(noFactsLeft(app, factCategory, FACT_TYPE.HISTORY), NO_INPUTS);
        }
        return;
      }

      let factPrefix = 'Okay, here\'s a Fact about RC\'s culture. ';
      if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {

        app.ask(
          app
            .buildRichResponse()
            .addSimpleResponse(factPrefix + fact)
            .addSimpleResponse(NEXT_FACT_DIRECTIVE)
            .addSuggestions(CONFIRMATION_SUGGESTIONS));
      } else {
        app.ask(factPrefix + fact + NEXT_FACT_DIRECTIVE, NO_INPUTS);
      }
      return;
    } else {
      // Conversation repair is handled in API.AI, but this is a safeguard
      if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {

        app.ask(
          app
            .buildRichResponse()
            .addSimpleResponse(`Sorry, I didn't understand. I can tell you about RC's history, or its culture. Which one do you want to hear about?`)
            .addSuggestions(['History', 'Culture']));
      } else {
        app.ask(`Sorry, I didn't understand. I can tell you about RC's history, or its culture. Which one do you want to hear about?`, NO_INPUTS);
      }
    }
  }

  let actionMap = new Map();
  actionMap.set(TELL_FACT, tellFact);

  app.handleRequest(actionMap);
});
