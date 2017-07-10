'use strict';

const functions = require('firebase-functions');

exports.helloFromKing = functions.https.onRequest((request, response) => {
 response.send("Hello from King David Martins!. The Recurse center is AWESOME!!! WHOOP WHOOP!!");
});
