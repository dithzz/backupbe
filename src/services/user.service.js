const httpStatus = require('http-status');
const { User, Store } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return User.create(userBody);
};

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUserWithPhone = async (phone) => {
  if (await User.isPhoneTaken(phone)) {
    return null;
  }

  // Create a new store with the initial name "John Doe"
  const store = new Store({ name: 'John Doe' });
  await store.save();

  // Create the user with the provided phone and associate the store
  return User.create({ phone, store: store._id });
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id)
    .populate('followers')
    .populate('following')
    .populate('followingStores')
    .populate('likedPosts')
    .populate('authoredPosts')
    .populate('comments')
    .populate('store'); // Populate the 'store' field;
};

const getUserByUsername = async (username) => {
  const user = await User.findOne({ username });
  console.log(user, 'user');
  return user;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserByPhone = async (phone) => {
  return User.findOne({ phone });
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
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
  await user.remove();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const updateuserProfile = async (userId, body) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Calculate profile progress
  let count = 0;
  Object.values(body).forEach((el) => {
    if (el) count++;
  });
  const profileProgress = Math.round(100 - ((14 - count) / 14) * 100);

  // Update user's store name and other profile fields
  if (body.name && (body.name.firstName || body.name.lastName)) {
    // Calculate and set the new store name
    const storeName = `${body.name.firstName || user.name.firstName} ${body.name.lastName || user.name.lastName}`;
    body.storeName = storeName;

    // Find the associated store and update its name
    const store = await Store.findById(user.store);
    if (store) {
      store.name = storeName;
      store.owner = user._id; // Set the owner's ID
      await store.save();
    }
  }

  await User.findByIdAndUpdate(userId, { ...body, profileProgress });

  // Fetch the updated user data from the database
  const updatedUser = await getUserById(userId);

  // Create a new object with the desired fields
  const userData = {
    id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    phone: updatedUser.phone,
    username: updatedUser.username,
    address: updatedUser.address,
  };

  return userData;
};

const softUpdateuserProfile = async (userId, body) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Check if the new username is unique
  if (body.username && body.username !== user.username) {
    const existingUserWithUsername = await getUserByUsername(body.username);
    if (existingUserWithUsername) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Username is already taken');
    }
  }

  // Calculate profile progress
  let count = 0;
  Object.values(body).forEach((el) => {
    if (el) count++;
  });
  const profileProgress = Math.round(100 - ((14 - count) / 14) * 100);

  if (body.name && (body.name.firstName || body.name.lastName)) {
    // Calculate and set the new store name
    const storeName = `${body.name.firstName || user.name.firstName} ${body.name.lastName || user.name.lastName}`;
    body.storeName = storeName;

    // Find the associated store and update its name
    const store = await Store.findById(user.store);
    if (store) {
      store.name = storeName;
      await store.save();
    }
  }

  await User.findByIdAndUpdate(userId, { ...body, profileProgress });

  // Fetch the updated user data from the database
  const updatedUser = await getUserById(userId);

  // Create a new object with the desired fields
  const userData = {
    name: updatedUser.name,
    email: updatedUser.email,
    phone: updatedUser.phone,
    username: updatedUser.username,
    address: updatedUser.address,
  };

  return userData;
};

/**
 * Follow a user
 * @param {ObjectId} followerId - The ID of the user initiating the follow action
 * @param {ObjectId} userIdToFollow - The ID of the user to be followed
 * @returns {Promise<User>}
 */
const followUser = async (followerId, userIdToFollow) => {
  const follower = await getUserById(followerId);
  const userToFollow = await getUserById(userIdToFollow);
  console.log(follower, userToFollow);

  if (!follower || !userToFollow) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (follower.following.includes(userToFollow._id) || userToFollow.followers.includes(follower._id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You are already following this user');
  }

  follower.following.push(userToFollow._id);
  userToFollow.followers.push(follower._id);

  await Promise.all([follower.save(), userToFollow.save()]);
  return follower;
};

/**
 * Unfollow a user
 * @param {ObjectId} followerId - The ID of the user initiating the unfollow action
 * @param {ObjectId} userIdToUnfollow - The ID of the user to be unfollowed
 * @returns {Promise<User>}
 */
const unfollowUser = async (followerId, userIdToUnfollow) => {
  const follower = await getUserById(followerId);
  const userToUnfollow = await getUserById(userIdToUnfollow);

  console.log(
    !follower.following.includes(userToUnfollow._id),
    !userToUnfollow.followers.includes(follower._id),
    'dwqdwqdwqdwqd'
  );

  if (!follower || !userToUnfollow) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (follower.following.includes(userToUnfollow._id) || userToUnfollow.followers.includes(follower._id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You are not following this user');
  }

  follower.following.pull(userToUnfollow._id);
  userToUnfollow.followers.pull(follower._id);

  await Promise.all([follower.save(), userToUnfollow.save()]);
  return follower;
};

const getUserFollowers = async (userId) => {
  const user = await User.findById(userId).populate('followers', 'username name profilePic');
  if (!user) {
    throw new Error('User not found');
  }
  return user.followers;
};

const getUserFollowing = async (userId) => {
  const user = await User.findById(userId).populate('following', 'name profilePic username');
  if (!user) {
    throw new Error('User not found');
  }
  return user.following;
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByPhone,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  updateuserProfile,
  createUserWithPhone,
  softUpdateuserProfile,
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing,
};
