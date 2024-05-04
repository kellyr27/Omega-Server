//TODO: Decide what to do here

const mongoose = require('mongoose');

module.exports = function createModels (db) {
  const UserSchema = new mongoose.Schema({
    // Define your schema here
  });
  const User = db.model('User', UserSchema);

  const AscentSchema = new mongoose.Schema({
    // Define your schema here
  });
  const Ascent = db.model('Ascent', AscentSchema);

  const RouteSchema = new mongoose.Schema({
    // Define your schema here
  });
  const Route = db.model('Route', RouteSchema);

  return { User, Ascent, Route };
};