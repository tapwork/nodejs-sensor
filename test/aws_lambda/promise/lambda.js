'use strict';

const instana = require('../../..');

const fetch = require('node-fetch');

exports.handler = instana.awsLambda.wrap((event, context) => {
  console.log('in actual handler');
  return fetch('https://example.com').then(() => {
    if (event.error) {
      throw new Error('Boom!');
    }
    return {
      message: 'Stan says hi!'
    };
  });
});
