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
helpers.hash = (str) => {
  if(typeof(str) == 'string' && str.length > 0){
    let hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
};

// Create a string of random alphanumeric characters, of a given length
helpers.createRandomString = (strLength) => {
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
helpers.sendTwilioSms = (phone,msg,callback) => {
  // Validate parameters
  phone = typeof(phone) == 'string' && phone.trim().length == 10 ? phone.trim() : false;
  msg = typeof(msg) == 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false;
  if(phone && msg){

    // Configure the request payload
    let payload = {
      'From' : config.twilio.fromPhone,
      'To' : '+56'+phone,
      'Body' : msg
    };

    let stringPayload = querystring.stringify(payload);

    // Configure the request details
    let requestDetails = {
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

    // Instantiate the request object
    let req = https.request(requestDetails,(res) => {
        // Grab the status of the sent request
        let status =  res.statusCode;
        // Callback successfully if the request went through
        if(status == 200 || status == 201){
          callback(false);
        } else {
          callback('Status code returned was '+status);
        }
    });

    // Bind to the error event so it doesn't get thrown
    req.on('error',(e) => {
      callback(e);
    });

    // Add the payload
    req.write(stringPayload);

    // End the request
    req.end();

  } else {
    callback('Given parameters were missing or invalid');
  }
};


// Function for Checkout in Stripe API
helpers.createChargeStripe = async (requestData) => {

  const postData = querystring.stringify(requestData);

  // Populate request options object
	const requestOptions = {
		'method': 'POST',
		'hostname': 'api.stripe.com',
		'path': '/v1/charges',
		'auth': config.publishable_key + ':',
		'headers': {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': Buffer.byteLength(postData)
		}
  };
  
  // Create request object
	req = https.request(requestOptions, res => {
		// Check that response carries success
		if (res.statusCode == 200 || res.statusCode == 201) {
			callback(false);
		} else {
			callback(`Status code returned from Stripe.com is ${res.statusCode}`);
		}
	});

  // Capture errors during request sending
	req.on('error', err => {
		callback(err);
  });
  
  // Send the payload of the request
	req.write(postData);

	// Finalize the request
	req.end();
};


// // Charge credit card
// helpers.stripeTransaction = async (amount, currency, source, email, description) => {
//   // Validate parameters
//   amount = typeof(amount) === 'number' && amount > 0 ? amount : false;
//   currency = typeof(currency) === 'string' ? currency.trim() : false;
//   source = typeof(source) === 'string' ? source.trim() : false;
//   email = typeof(email) === 'string' && email.trim().length > 5 ? email.trim() : false;
//   description = description instanceof Array ? description : false;

//   if(amount && currency && source && email && description) {
//     try {
//       const charge = await stripe.charges.create({
//         amount: Math.round(amount*100),
//         currency: currency,
//         source: source,
//         receipt_email: email,
//         description: JSON.stringify(description)
//       });
//       return charge;
//     } catch(e) {
//       console.log(e);
//       return 'error';
//     };
//   } else {
//     return false;
//   };
// };

// Send email to customer
// helpers.sendEmail = async (toEmail, subject, text) => {
//   toEmail = typeof(toEmail) === 'string' && toEmail.trim().length > 5 ? toEmail.trim() : false;
//   subject = typeof(subject) === 'string' && subject.trim().length > 3 ? subject.trim() : false;
//   text = typeof(text) === 'string' && text.trim().length > 0 ? text.trim() : false;

//   if(toEmail && subject && text) {
//     // Logic to send the email
//     const data = {
//       'from': `test@${config.mailGun.domain}`,
//       'to': toEmail,
//       'subject': subject,
//       'text': text
//     };

//     mailGun.messages().send(data, (err, body) => {
//       if(err) {
//         console.log(err);
//       };
//     });

//   } else {
//     console.log('Send email parameter(s) were not valid');
//   };
// };

// Export the module
module.exports = helpers;
