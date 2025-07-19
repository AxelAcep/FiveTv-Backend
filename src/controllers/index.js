const userControllers = require('./user.controller');
const kelasControllers = require('./admin.controller');
const recapControllers = require('./content.controller');

module.exports = {
  ...userControllers,
  ...kelasControllers,
  ...recapControllers,
};