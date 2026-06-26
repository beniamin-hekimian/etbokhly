import express from 'express'
import {createUser} from '../controllers/userControllers'
const router = express.Router();
router.post('/', createUser);
module.exports=router;