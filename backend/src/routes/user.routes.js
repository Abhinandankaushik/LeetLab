import express from 'express';
import getProfile from '../controllers/profile.controller.js';
const user = express.Router();

user.get('/:id',getProfile);


export default user;