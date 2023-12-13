// Server script
import express from 'express';
import {
  getAvatar,
  getFilteredProfile,
  getMatchRate,
  getRandomProfile,
  readProfile,
  updateStatus,
} from '../database/matching-db';
import { userOnlyAPI } from '../utils/guard';

const router = express.Router();

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

router.get('/', async (req, res) => {
  try {
    let dataFromDB = await getRandomProfile(Number(req.session['user_id']));
    res.json(dataFromDB);
  } catch (e) {
    console.error('Failed: ', e);
    res.status(500).json('Error: Failed to parse data');
  }
});

router.get('/avatar', async (req, res) => {
  const id = Number(req.query.id);
  try {
    let dataFromDB = await getAvatar(id);
    res.json(dataFromDB);
  } catch (e) {
    console.error('Failed: ', e);
    res.status(500).json('Error: Failed to parse data');
  }
});

router.get(`/profile`, async (req, res) => {
  const id = Number(req.query.id);
  try {
    let dataFromDB = await readProfile(id);
    res.json(dataFromDB);
  } catch (e) {
    console.error('Failed: ', e);
    res.status(500).json('Error: Failed to parse data');
  }
});

router.post('/filter', async (req, res) => {
  try {
    let dataFromDB = await getFilteredProfile(req.body, Number(req.session['user_id']));
    res.json(dataFromDB);
  } catch (e) {
    console.error('Failed: ', e);
    res.status(500).json('Error: Failed to parse data');
  }
});

router.post('/status-update', userOnlyAPI, async (req, res, next) => {
  try {
    let dataFromDB = await updateStatus(req.body, req.session.user_id!);
    res.json(dataFromDB);
  } catch (e) {
    // console.error('Failed: ', e);
    // res.status(500).json('Error: Failed to parse data');
    next(e);
  }
});

router.get('/match-rate', async (req, res) => {
  // Get the 'id' query parameter
  const id = Number(req.query.id);
  const session_id = Number(req.session['user_id']);

  try {
    let dataFromDB = await getMatchRate(id, session_id);
    res.json(dataFromDB);
  } catch (e) {
    console.error('Failed: ', e);
    res.status(500).json('Error: Failed to parse data');
  }
});

export default router;
