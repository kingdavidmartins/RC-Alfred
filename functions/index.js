'use strict';

process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').ApiAiApp;
const functions = require('firebase-functions');
const fact = require('./rcFactType.js');

// recurse api
const hackerschool = require('hackerschool-api');
const queryString = require('query-string');
const config = require('./config.js');

// STABLE API.AI actions
const UNRECOGNIZED_DEEP_LINK = 'deeplink.unknown';

const NEXT_FACT_DIRECTIVE = 'Is there anything I can help you with dear friend?';
const CONFIRMATION_SUGGESTIONS = ['Sure', 'Thank you, bye'];

const NO_INPUTS = [
  'I didn\'t hear that.',
  'If you\'re still there, say that again.',
  'We can stop here. See you soon.'
];

// FACT VARIABLES ENDS

// tell_fact API.AI actions
const TELL_FACT = 'tell.fact';

// API.AI parameter names
const CATEGORY_ARGUMENT_FACT = 'fact-category';

const FACT_TYPE = {
  HISTORY: 'history',
  CULTURE: 'culture'
};

const HISTORY_FACTS = new Set(fact.history);
const CULTURE_FACTS = new Set(fact.culture);

// Random fact finder function
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
// FACT VARIABLES ENDS

// CHECK IN VARIABLES starts

// check_in API.AI actions
const CHECK_IN = 'check.in';

// API.AI parameter names
const CATEGORY_ARGUMENT_CHECKIN = 'check-in-category';

const CHECK_IN_TYPE = {
  IN: 'in',
  OUT: 'out'
};

// CHECK IN VARIABLES ENDS

exports.factsaboutrc = functions.https.onRequest((request, response) => {
  const app = new App({ request, response });

  // FACT STARTS
  function tellFact (app) {
    let historyFacts = HISTORY_FACTS;
    let cultureFacts = CULTURE_FACTS;


    let factCategory = app.getArgument(CATEGORY_ARGUMENT_FACT);

    if (factCategory === FACT_TYPE.HISTORY) {

      let fact = getRandomFact(historyFacts);
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
            .addSimpleResponse(`Sorry, I didn't understand. I can tell you about RC's History, it's Culture, Or I can Check You In. Which action do you want me to perform?`)
            .addSuggestions(['History', 'Culture', 'Check Me In']));
      } else {
        app.ask(`Sorry, I didn't understand. I can tell you about RC's History, it's Culture, Or I can Check You In. Which action do you want me to perform?`, NO_INPUTS);
      }
    }
  }
  // FACT ENDS

  // CHECK IN STARTS
  function checkIn (app) {

    let checkInCategory = app.getArgument(CATEGORY_ARGUMENT_CHECKIN);

    if (checkInCategory === CHECK_IN_TYPE.IN) {

      // let checkStatus = 'TRUE  -> YOUR CHECKED IN'
      let checkStatusPrefix = 'OH MY! We love people like you. People who just loves to check in. Even though they are already checked in';

      if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {

        app.ask(
          app
            .buildRichResponse()
            .addSimpleResponse(checkStatusPrefix)
            .addSimpleResponse(NEXT_FACT_DIRECTIVE)
            .addSuggestions(CONFIRMATION_SUGGESTIONS));
      } else {
        app.ask(checkStatusPrefix + NEXT_FACT_DIRECTIVE, NO_INPUTS);
      }
      return;
    } else if (checkInCategory === CHECK_IN_TYPE.OUT) {

      // let checkStatus = 'TRUE  -> YOUR CHECKED OUT'
      let checkStatusPrefix = 'I had the time of my life. And I never felt this way before. And I swear this is true. And I owe it all to you. Hope you were productive and you enjoyed your time at RC';

      if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {

        app.ask(
          app
            .buildRichResponse()
            .addSimpleResponse(checkStatusPrefix)
            .addSimpleResponse(NEXT_FACT_DIRECTIVE)
            .addSuggestions(CONFIRMATION_SUGGESTIONS));
      } else {
        app.ask(checkStatusPrefix + NEXT_FACT_DIRECTIVE, NO_INPUTS);
      }
      return;
    } else {
      // Conversation repair is handled in API.AI, but this is a safeguard
      if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {

        app.ask(
          app
            .buildRichResponse()
            .addSimpleResponse(`Sorry, I didn't understand. I can tell you about RC's History, it's Culture, Or I can Check You In or Out. Which action do you want me to perform?`)
            .addSuggestions(['History', 'Culture', 'Check Me In or Out']));
      } else {
        app.ask(`Sorry, I didn't understand. I can tell you about RC's History, it's Culture, Or I can Check You In or Out. Which action do you want me to perform?`, NO_INPUTS);
      }
    }
  }
  // CHECK IN ENDS

  let actionMap = new Map();
  actionMap.set(TELL_FACT, tellFact);
  actionMap.set(CHECK_IN, checkIn);

  app.handleRequest(actionMap);
});



let client = hackerschool.client();
let auth = hackerschool.auth(config.rcOAuth);

exports.login = functions.https.onRequest((request, response) => {
  // fetch state : STRING from google service
  let stateQuery = `&${queryString.stringify({state : request.query.state})}`

  // attach state : STRING to authUrl
  let authUrl = auth.createAuthUrl().concat(stateQuery);

  // redirect the user to the auth page
  // response.redirect(authUrl);

  // TEST -> view URL parameters
  // response.send(req.query);

  response.send('Setting up login/auth serverless service for RC');
});

// login service ends


// token service starts

exports.token = functions.https.onRequest((request, response) => {
  // post method handler
  if (request.method === 'POST') {

    // grant_type handler [authorization_code] starts
    if (request.query.grant_type === 'authorization_code') {

      let code = request.query.code;

      auth
        .getToken(code)
        .then(function(token) {
          // tells the client instance to use this token for all requests
          client.setToken(token);

          let grantAuthCodeObj = {
            token_type: client.token.token.token_type,
            access_token: client.token.token.access_token,
            refresh_token: client.token.token.refresh_token,
            expires_in: client.token.token.expires_in
          }

          response.json(grantAuthCodeObj)

        }, function(err) {


          response.send('There was an error getting the authorization_code. ' + require('util').inspect(err, { depth: null }) );
        });

    }
    // grant_type handler [authorization_code] ends


    // grant_type handler [refresh_token] starts
    if (request.query.grant_type === 'refresh_token') {

      let code = request.query.refresh_token;

      auth
        .getToken(code)
        .then(function(token) {
          // tells the client instance to use this token for all requests
          client.setToken(token);

          let refreshAuthCodeObj = {
            token_type: client.token.token.token_type,
            access_token: client.token.token.access_token,
            refresh_token: client.token.token.refresh_token,
            expires_in: client.token.token.expires_in
          }

          response.json(refreshAuthCodeObj)

        }, function(err) {


          response.send('There was an error getting the refresh_token. ' + require('util').inspect(err, { depth: null }) );
        });

    }
    // grant_type handler [refresh_token] ends

  }

  // get method handler
  if (request.method === 'GET') {
    response.send('Setting up token/refresh-token serverless service for RC');
  }
});

// token service ends
