import { Router } from 'express';
import teamRouter from './team.routes.js';

const router = Router();

router.use('/teams', teamRouter);
// router.use('/matches')

export default router;
