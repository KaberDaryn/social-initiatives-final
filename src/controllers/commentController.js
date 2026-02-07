const { asyncHandler } = require('../utils/asyncHandler');
const { ok, created } = require('../utils/response');
const commentService = require('../services/commentService');

const createComment = asyncHandler(async (req, res) => {
  const payload = req.validated.body;
  const comment = await commentService.createComment(payload, req.user);
  return created(res, comment);
});

const listComments = asyncHandler(async (req, res) => {
  const { updateId } = req.validated.params;
  const comments = await commentService.listComments(updateId);
  return ok(res, comments);
});

const deleteComment = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const result = await commentService.deleteComment(id, req.user);
  return ok(res, result);
});

module.exports = { createComment, listComments, deleteComment };
