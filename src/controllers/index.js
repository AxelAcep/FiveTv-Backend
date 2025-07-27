const userControllers = require('./user.controller');
const adminController = require('./admin.controller');

module.exports = {
  ...userControllers,
  ...adminController,
};