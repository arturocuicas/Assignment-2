/*
 * Arturo Cuicas
 * 29/07/2018
 * Create and export configuration variables
 */

// Container for all environments
let environments = {};

// Staging (default) environment
environments.staging = {
  'httpPort': 3000,
  'httpsPort': 3001,
  'envName': 'staging',
  'hashingSecret' : 'thisIsAlsoASecret',
  'maxChecks' : 5,
  'twilio' : {
    'accountSid' : 'ACee2eb8e9485415de0a10aa29adfc182f',
    'authToken' : '2801dfee64318eef105ae32cb3c8289d',
    'fromPhone' : '+56971826466'
  }
};

// Production environment
environments.production = {
  'httpPort': 5000,
  'httpsPort': 5001,
  'envName': 'production',
  'hashingSecret' : 'thisIsAlsoASecret',
  'maxChecks' : 5,
  'twilio' : {
    'accountSid' : 'ACee2eb8e9485415de0a10aa29adfc182f',
    'authToken' : '2801dfee64318eef105ae32cb3c8289d',
    'fromPhone' : '+56971826466'
  }
}

// Determine which environments was passed as a command-line argument
let currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current environment is one of environments above, if not, default Staging
let environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

module.exports = environmentToExport;
