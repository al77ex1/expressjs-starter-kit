const httpStatus = require('http-status');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.count({ where: { email: userBody.email } }))
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');

  const user = await User.create(userBody);
  await user.privateFields(['password', 'createdAt', 'updatedAt']);
  return user;
};

/**
 * Query for users
 * @param {Object} filter
 * @param {Object} options - Query options
 * @param {string} [options.order] - Order option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.offset] - Current offset (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const parameters = options;
  if (parameters.order) {
    parameters.order = parameters.order.split(',');
    parameters.order = parameters.order.map((item) => {
      const order = item.split(':');
      order[1] = order[1].toUpperCase();
      return order;
    });
  }
  const users = await User.findAndCountAll({
    attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
    where: filter,
    ...parameters,
  });
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findByPk(id, { attributes: { exclude: ['password', 'createdAt', 'updatedAt'] } });
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ where: { email } });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  let user = await getUserById(userId);
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  if (updateBody.email && (await User.count({ where: { email: updateBody.email } })))
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  await User.update(updateBody, { where: { id: userId } });
  user = await getUserById(userId);
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.destroy({ where: { id: userId } });
  return user;
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
};
