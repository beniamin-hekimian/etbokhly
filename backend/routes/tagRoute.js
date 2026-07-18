import express from 'express'
import * as tagController from '../controllers/tagController.js'
const router = express.Router()

router.route('/')
    .get(tagController.getAllTags)
    .post(tagController.createTag)

router.route('/:id')
    .get(tagController.getTag)
    .patch(tagController.updateTag)
    .delete(tagController.deleteTag)

export default router;