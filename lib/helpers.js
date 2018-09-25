/*
 * Helpers for various tasks
 *
 */

// Dependencies
const config = require('./config');
const crypto = require('crypto');
const https = require('https');
const querystring = require('querystring');

// Container for all the helpers
const helpers = {};

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJSONToObject = (str) => {
  try {
    const obj = JSON.parse(str);
    return obj;

  } catch(e) {
    return {};
  }
};

// Create a SHA256 hash
helpers.hash = async (str) => {
  if(typeof(str) == 'string' && str.length > 0){
    let hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
};

// Create a string of random alphanumeric characters, of a given length
helpers.createRandomString = async (strLength) => {
  strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
  if(strLength){
    // Define all the possible characters that could go into a string
    let possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    // Start the final string
    let str = '';
    for(i = 1; i <= strLength; i++) {
        // Get a random charactert from the possibleCharacters string
        let randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
        // Append this character to the string
        str+=randomCharacter;
    }
    // Return the final string
    return str;
  } else {
    return false;
  }
};

// Verify Email
helpers.verifyEmail = async (email) => {
  if(typeof(email) == 'string'
      && email.trim().length > 0
      && /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)) {
    return email;
  } else {
    return false
  }
};

// Function for send SMS whit Twilio
helpers.sendTwilioSms = (phone,msg) => {
  // Validate parameters
  // phone = typeof(phone) == 'string' && phone.trim().length == 10 ? phone.trim() : false;
  // msg = typeof(msg) == 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false;
  return new Promise((resolve) => {
    const phone = '971826466';
    const msg = 'Pedido de Pizza';

    // Configure the request payload
    const payload = {
      'From' : config.twilio.fromPhone,
      'To' : config.twilio.fromPhone,
      'Body' : msg
    };

    const stringPayload = querystring.stringify(payload);

    // Configure the request details
    const requestOptions = {
      'protocol' : 'https:',
      'hostname' : 'api.twilio.com',
      'method' : 'POST',
      'path' : '/2010-04-01/Accounts/'+config.twilio.accountSid+'/Messages.json',
      'auth' : config.twilio.accountSid+':'+config.twilio.authToken,
      'headers' : {
        'Content-Type' : 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(stringPayload)
      }
    };
      // Create request object
    req = https.request(requestOptions, res => {

      if(res.statusCode == 200 || res.statusCode == 201){
        //resolve(false)
        let body = [];
        res.on('data', chunk => {
          body.push(chunk);
        });

        res.on('end', () => {
          try {
            body = JSON.parse(Buffer.concat(body).toString());
          } catch(e) {
            resolve(e);
          }
          // console.log(body);
          resolve(true);
        });

      } else {
        console.log(`Status code returned from Twilo.com is ${res.statusCode}`);
        resolve(false);
      }
    });

    // Capture errors during request sending
    req.on('error', err => {
      console.log(err);
      resolve(false);
    });

    // Send the payload of the request
    if (postData) {
      req.write(postData);
    }
    // Finalize the request
    req.end();
  });
};


// Function for Checkout in Stripe API
helpers.createChargeStripe = (requestData) => {
  return new Promise((resolve) => {
    const postData = querystring.stringify(requestData);
    // Populate request options object
    const requestOptions = {
      'protocol' : 'https:',
      'method': 'POST',
      'hostname': 'api.stripe.com',
      'path': '/v1/charges',
      'auth': config.stripe.secret_key + ':'+ config.stripe.publishable_key,
      'headers': {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
      // Create request object
    req = https.request(requestOptions, res => {

      if(res.statusCode == 200 || res.statusCode == 201){
        //resolve(false)
        let body = [];
        res.on('data', chunk => {
          body.push(chunk);
        });

        res.on('end', () => {
          try {
            body = JSON.parse(Buffer.concat(body).toString());
          } catch(e) {
            resolve(e);
          }
          console.log(body);
          resolve(true);
        });

      } else {
        console.log(`Status code returned from Stripe.com is ${res.statusCode}`);
        resolve(false);
      }
    });

    // Capture errors during request sending
    req.on('error', err => {
      console.log(err);
      resolve(false);
    });

    // Send the payload of the request
    if (postData) {
      req.write(postData);
    }
    // Finalize the request
    req.end();
  });
};


// Send email to customer
helpers.sendMailReceipt = (email, messageText) => {
  return new Promise((resolve) => {
    // Pack request data into a query string
    email = 'orutrax@gmail.com';
    const postData = querystring.stringify({
      'from': `Pizza Delivery <mailgun@${config.mailgun.domain}>`,
      'to': `${email}`,
      'subject': 'Order Receipt',
      'html': messageText
    });

    // Populate request options object
    const requestOptions = {
    'hostname': 'api.mailgun.net',
    'method': 'POST',
    'path': `/v3/${config.mailgun.domain}/messages`,
    'auth': `api:${config.mailgun.apiKey}`,
    'headers': {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
      }
    };

    // Create request object
    req = https.request(requestOptions, res => {
      if(res.statusCode == 200 || res.statusCode == 201){
        //resolve(false)
        let body = [];
        res.on('data', chunk => {
            body.push(chunk);
        });

        res.on('end', () => {
          try {
            body = JSON.parse(Buffer.concat(body).toString());
          } catch(e) {
            resolve(e);
          }
          console.log(body);
          resolve(true);
        });

      } else {
        console.log(`Status code returned from Mailgun.com is ${res.statusCode}`);
        resolve(false);
      }
    });

    // Capture errors during request sending
    req.on('error', err => {
      console.log(err);
      resolve(false);
    });

    // Send the payload of the request
    if (postData) {
      req.write(postData);
    }
    // Finalize the request
    req.end();
  });
};

// Export the module
module.exports = helpers;
