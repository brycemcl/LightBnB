const properties = require('./json/properties.json');
const users = require('./json/users.json');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'username',
  password: 'password',
  host: 'postgres',
  database: 'lightbnb'
});
/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {
  const parameters = [email];
  const databasePromise = pool.query(`
  SELECT * 
  FROM "users" 
  WHERE "email" = $1;
  `, parameters)
    .then(res => {
      return res.rows.length ? res.rows[0] : null;
    })
    .catch(err => console.error('query error', err.stack));
  return Promise.resolve(databasePromise);
};
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {
  const parameters = [id];
  const databasePromise = pool.query(`
  SELECT * 
  FROM "users" 
  WHERE "id" = $1;
  `, parameters)
    .then(res => {
      return res.rows.length ? res.rows[0] : null;
    })
    .catch(err => console.error('query error', err.stack));
  return Promise.resolve(databasePromise);
};
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  const { name, password, email } = user;
  const parameters = [name, email, password];
  const databasePromise = pool.query(`
  INSERT INTO users (
    name,
    email,
    password
    )
    VALUES
    (
    $1,
    $2,
    $3
    )
    RETURNING *;
  `, parameters)
    .then(res => res.rows)
    .catch(err => console.error('query error', err.stack));
  return Promise.resolve(databasePromise);



  // const userId = Object.keys(users).length + 1;
  // user.id = userId;
  // users[userId] = user;
  // return Promise.resolve(user);
};
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {
  const parameters = [guest_id, limit];
  const databasePromise = pool.query(`
  SELECT properties.*, reservations.*, avg(rating) as average_rating
  FROM reservations
  JOIN properties ON reservations.property_id = properties.id
  JOIN property_reviews ON properties.id = property_reviews.property_id 
  WHERE reservations.guest_id = $1
  AND reservations.end_date < now()::date
  GROUP BY properties.id, reservations.id
  ORDER BY reservations.start_date
  LIMIT $2;
`, parameters)
    .then(res => {
      return res.rows.length ? res.rows : null;
    })
    .catch(err => console.error('query error', err.stack));
  return Promise.resolve(databasePromise);
};
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function (options, limit = 10) {
  console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
  const parameters = [limit];
  const {
    city = null,
    owner_id = null,
    minimum_price_per_night = null,
    maximum_price_per_night = null,
    minimum_rating = null
  } = options;
  let query = `
SELECT properties.*, avg(property_reviews.rating) as average_rating
FROM properties
JOIN property_reviews ON properties.id = property_id`;
  if (city || owner_id || minimum_price_per_night || maximum_price_per_night) {
    query += "\n" + `WHERE`;
  }
  if (city) {
    parameters.push(`%${city}%`);
    query += "\n" + `(properties.city LIKE $${parameters.length}) AND `;
  }
  if (owner_id) {
    parameters.push(`${owner_id}`);
    query += "\n" + `(properties.owner_id = $${parameters.length}) AND `;
  }
  if (minimum_price_per_night) {
    parameters.push(`${minimum_price_per_night}`);
    query += "\n" + `(properties.cost_per_night > $${parameters.length}) AND `;
  }
  if (maximum_price_per_night) {
    parameters.push(`${maximum_price_per_night}`);
    query += "\n" + `(properties.cost_per_night < $${parameters.length}) AND `;
  }
  if (city || owner_id || minimum_price_per_night || maximum_price_per_night) {
    query = query.slice(0, query.lastIndexOf("AND"));
  }
  query += "\n" + `GROUP BY properties.id`;
  if (minimum_rating) {
    parameters.push(`${minimum_rating}`);
    query += "\n" + `HAVING avg(property_reviews.rating) >= $${parameters.length} `;
  }
  query += "\n" + `LIMIT $1`;
  const databasePromise = pool.query(query, parameters)
    .then(res => res.rows)
    .catch(err => console.error('query error', err.stack));
  return Promise.resolve(databasePromise);
};
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
};
exports.addProperty = addProperty;
