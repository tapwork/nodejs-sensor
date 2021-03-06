/* eslint-env mocha */

'use strict';

const spawn = require('child_process').spawn;
const Promise = require('bluebird');
const path = require('path');

const config = require('../../../../../core/test/config');
const agentPort = require('../../../apps/agentStubControls').agentPort;

let app;

exports.registerTestHooks = opts => {
  beforeEach(() => {
    opts = opts || {};

    const env = Object.create(process.env);
    env.AGENT_PORT = agentPort;
    env.TRACING_ENABLED = opts.enableTracing !== false;

    app = spawn('node', [path.join(__dirname, `consumer${opts.apiType}.js`)], {
      stdio: config.getAppStdio(),
      env
    });

    return Promise.delay(1500);
  });

  afterEach(() => {
    app.kill();
  });
};

exports.getPid = () => app.pid;
