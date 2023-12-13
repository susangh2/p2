import express from 'express';
import { getAvgRating, postReply, readReview } from '../database/review-db';

const router = express.Router();

router.get('/user-rating', async (req, res) => {
  const userId = Number(req.query.id);

  try {
    let dataFromDB = await getAvgRating(userId);
    res.json(dataFromDB);
  } catch (e) {
    console.error('Failed: ', e);
  }
});

router.get(`/user-reviews`, async (req, res) => {
  // Get the 'id' query parameter
  let id;
  if (req.query.id) {
    id = Number(req.query.id);
  } else {
    id = Number(req.session['user_id']);
  }

  try {
    let dataFromDB = await readReview(id);
    let transformedDate = dataFromDB.rows.map((row) => ({
      username: row.reviewer_username,
      username2: row.reviewee_username,
      username_id: row.reviewer_id,
      username2_id: row.reviewee_id,
      rating: row.rating,
      comment: row.comment,
      rating_date: row.rating_date.slice(0, 10),
      avg_rating: row.rounded_avg_rating,
      review_count: row.review_count,
    }));
    res.json(transformedDate);
  } catch (e) {
    console.error('Failed: ', e);
    res.status(500).json('Error: Failed to parse data');
  }
});

router.post('/review-reply', async (req, res) => {
  let replyObj = req.body;
  try {
    await postReply(replyObj);
    res.end();
  } catch (e) {
    console.error('Error sending reply to db: ', e);
  }
});

export default router;
