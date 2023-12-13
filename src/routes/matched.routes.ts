import express from 'express';
import { readMatchedUsername, updateMatchStatus } from '../database/matched-db';

const router = express.Router();

router.get('/', async (req, res) => {
  const userId = Number(req.query.id);

  try {
    let dataFromDB = await readMatchedUsername(userId);
    res.json(dataFromDB);
  } catch (e) {
    res.status(500).json('Error: failed to parse data');
  }
});

router.put('/', async (req, res) => {
  let session_id = Number(req.session.user_id);

  try {
    await updateMatchStatus(req.body, session_id);
    res.sendStatus(200);
  } catch (e) {
    res.status(500).json('Error: failed to parse data');
  }
});

export default router;
