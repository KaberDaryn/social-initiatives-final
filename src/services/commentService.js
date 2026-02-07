const { Comment } = require('../models/Comment');
const { Update } = require('../models/Update');
const { Event } = require('../models/Event');
const { ApiError } = require('../utils/ApiError');
const { EVENT_STATUS } = require('../constants/event');
const { ROLES } = require('../constants/roles');

async function createComment({ updateId, text }, author) {
  const update = await Update.findById(updateId);
  if (!update) throw ApiError.notFound('Update not found');

  const event = await Event.findById(update.event);
  if (!event) throw ApiError.notFound('Event not found');
  if (event.status !== EVENT_STATUS.PUBLISHED) throw ApiError.badRequest('Comments are enabled only for published events');

  const comment = await Comment.create({ update: updateId, author: author._id, text });
  return Comment.findById(comment._id).populate('author', 'name email role');
}

async function listComments(updateId) {
  const update = await Update.findById(updateId);
  if (!update) throw ApiError.notFound('Update not found');

  return Comment.find({ update: updateId }).populate('author', 'name email role').sort({ createdAt: -1 });
}

async function deleteComment(commentId, actor) {
  const comment = await Comment.findById(commentId);
  if (!comment) throw ApiError.notFound('Comment not found');

  const isOwner = comment.author.toString() === actor._id.toString();
  const isAdmin = actor.role === ROLES.ADMIN;
  if (!isOwner && !isAdmin) throw ApiError.forbidden();

  await Comment.deleteOne({ _id: commentId });
  return { deleted: true };
}

module.exports = { createComment, listComments, deleteComment };
