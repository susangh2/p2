import express from 'express';
import { readInvitations } from '../database/pending-matches-db';

const router = express.Router();

router.get('/', async (req, res) => {
  const userId = Number(req.session['user_id']);
  try {
    let dataFromDB = await readInvitations(userId);
    res.json(dataFromDB);
  } catch (e) {
    res.status(500).json('Error: failed to parse data');
  }
});

export default router;
