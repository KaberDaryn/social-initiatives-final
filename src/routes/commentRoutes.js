const express = require('express');
const { validate } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const commentController = require('../controllers/commentController');
const { createCommentSchema, listUpdateCommentsSchema, commentIdSchema } = require('../validators/commentSchemas');

const router = express.Router();

router.get('/update/:updateId', validate(listUpdateCommentsSchema), commentController.listComments);
router.post('/', requireAuth, validate(createCommentSchema), commentController.createComment);
router.delete('/:id', requireAuth, validate(commentIdSchema), commentController.deleteComment);

module.exports = { commentRouter: router };
