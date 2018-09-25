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
    'accountSid' : 'AC3f72a6462d6ae91312f05820af73990d',
    'authToken' : '56daeb70a3360a5fa1c31f5075021999',
    'fromPhone' : '0056971826466'
  },
  'stripe': {
    'publishable_key': 'pk_test_fy3vinjdYekd0KPmpzIWZW2H',
    'secret_key': 'sk_test_u5m31HSzOQsMBk8rPWgKYaYW',
    'stripeTestToken': 'tok_visa',
  }, 
  'mailgun': {
    'domain':'sandbox3388e2653ffe4aa8a73ca052af429745.mailgun.org',
    'apiKey': '67fde5a1746aad5aff7ab4ec58deb588-6b60e603-44082319',
    'apiPass': '5b8f7615a2d088e3af47ee8f02cca64b-6b60e603-e53bcf2d'
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
  },
  'stripe' : {
    'publishable_key' : 'pk_test_fy3vinjdYekd0KPmpzIWZW2H',
    'secret_key': 'sk_test_u5m31HSzOQsMBk8rPWgKYaYW',
    'stripeTestToken': 'tok_visa',
  }
}

// Determine which environments was passed as a command-line argument
let currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current environment is one of environments above, if not, default Staging
let environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

module.exports = environmentToExport;
