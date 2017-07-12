'use strict';

process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').ApiAiApp;
const functions = require('firebase-functions');

// API.AI actions
const UNRECOGNIZED_DEEP_LINK = 'deeplink.unknown';
const TELL_FACT = 'tell.fact';

// API.AI parameter names
const CATEGORY_ARGUMENT = 'fact-category';

const FACT_TYPE = {
  HISTORY: 'history',
  CULTURE: 'culture'
};

const HISTORY_FACTS = new Set([
  'master wayne sir. Did you know on September 23, 2006 RC founder\'s Nick and Dave met for the first time during their signals and systems class? ok. It wasn\'t on September 23. It was actually Fall 2006. I was close enough though .',
  'master wayne sir. Did you know in the summer of 2007 RC founder\'s Nick and Sonali met at shakespeare in the park. I\'m just here forever alone. sigh no one wants to meet me',
  'master wayne sir. Did you know in the spring of 2008 RC founder\'s Nick and Dave began having business meetings after work to discuss starting a company. And by company I mean me. RC. In case you were wondering. Even though you probably weren\'t. I just want to feel special.'
]);

const CULTURE_FACTS = new Set([
  'master wayne sir. Did you know that RC is the place of dreams and butterflies. A place where everyone loves each other.',
  'master wayne sir. Did you know that RC is the place of dreams and butterflies. A place where everyone loves each other.',
  'master wayne sir. Did you know that RC is the place of dreams and butterflies. A place where everyone loves each other.',
  'master wayne sir. Did you know that RC is the place of dreams and butterflies. A place where everyone loves each other.',
  'master wayne sir. Did you know that RC is the place of dreams and butterflies. A place where everyone loves each other.',
  'master wayne sir. Did you know that RC is the place of dreams and butterflies. A place where everyone loves each other.',
  'master wayne sir. Did you know uh huh. Hold on give me a second. Batman needs my assistance. Sorry duty calls'
]);

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

          app.ask(app.buildRichResponse()
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
            .addSuggestions(CONFIRMATION_SUGGESTIONS)

        );
      } else {
        app.ask(factPrefix + fact + NEXT_FACT_DIRECTIVE, NO_INPUTS);
      }
      return;
    } else if (factCategory === FACT_TYPE.CULTURE) {
      let fact = getRandomFact(cultureFacts);
      if (fact === null) {
        if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
          let suggestions = ['History'];
          app.ask(app.buildRichResponse()
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
        app.ask(app.buildRichResponse()
          .addSimpleResponse(`Sorry, I didn't understand. I can tell you about \
RC's history, or its  culture. Which one do you want to \
hear about?`)
          .addSuggestions(['History', 'Culture']));
      } else {
        app.ask(`Sorry, I didn't understand. I can tell you about \
RC's history, or its culture. Which one do you want to \
hear about?`, NO_INPUTS);
      }
    }
  }

  let actionMap = new Map();
  actionMap.set(TELL_FACT, tellFact);

  app.handleRequest(actionMap);
});
