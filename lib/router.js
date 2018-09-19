// Dependencies
const handlers = require('./handlers');

// Instantiate Container
const router = {};

router.router = {
    'ping': handlers.ping,
    'hello': handlers.hello,
    'users': handlers.users,
    'tokens': handlers.tokens,
    'checks': handlers.checks,
    'menu': handlers.menus,
    'cart': handlers.cart,
    'checkout': handlers.checkout
  };

module.exports = router;