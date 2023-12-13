import { client } from "./database";

// Post Review
const createdAt = new Date().toISOString();

export async function postReview(
  rated_user_id: number,
  rated_by_user_id: number,
  comment: string,
) {
  try {
    await client.query(
      /* sql */
      `INSERT INTO review (rated_user_id, rated_by_user_id, rating, comment, rating_date)
      VALUES ($1, $2, $3, $4)`,
      [rated_user_id, rated_by_user_id, comment, createdAt],
    );
  } catch (e) {
    console.error("Error posting new review to db: ", e);
    throw e;
  }
}

// Get Review
export async function readReview(rated_user_id: number) {
  try {
    let reviewData = await client.query(
      /* sql */
      `WITH ReviewCounts AS (
        SELECT
          rated_user_id,
          COUNT(*) AS review_count
        FROM review
        WHERE rated_user_id = $1
        GROUP BY rated_user_id
      )
      SELECT
        u.username AS reviewer_username,
        u2.username AS reviewee_username,
        u.id AS reviewer_id,
        u2.id AS reviewee_id,
        r.rating,
        r.comment,
        r.rating_date,
        ROUND(AVG(r.rating), 1) AS rounded_avg_rating,
        rc.review_count
      FROM review r
      JOIN users u ON r.rated_by_user_id = u.id
      JOIN users u2 ON r.rated_user_id = u2.id
      JOIN ReviewCounts rc ON r.rated_user_id = rc.rated_user_id
      WHERE r.rated_user_id = $1
      GROUP BY u.username, u2.username, u.id, u2.id, r.rating, r.comment, r.rating_date, rc.review_count;
      `,
      [rated_user_id],
    );
    return reviewData;
  } catch (e) {
    console.error("Error reading review from db: ", e);
    throw e;
  }
}

// Get Average Rating
export async function getAvgRating(user_id: number) {
  try {
    let avgRating = await client.query(
      /*sql*/
      `SELECT ROUND(AVG(rating), 1) AS rounded_avg_rating
      FROM review
      WHERE rated_user_id = $1`,
      [user_id],
    );
    return avgRating;
  } catch (e) {
    console.error("Error getting avg rating from db: ", e);
    throw e;
  }
}

// Post reply to review -----------------------------------------------------------------------------------------------------------------------

type ReplyObj = {
  reply: string;
  reply_date: string;
  rated_user_id: number;
  rated_by_user_id: number;
};

export async function postReply(replyObj: ReplyObj) {
  try {
    await client.query(
      /* sql */
      `INSERT INTO review (reply, reply_date) VALUES ($1, $2) 
    WHERE rated_user_id = $3 AND rated_by_user_id = $4`,
      [
        replyObj.reply,
        replyObj.reply_date,
        replyObj.rated_user_id,
        replyObj.rated_by_user_id,
      ],
    );
  } catch (e) {
    console.error("Error posting reply to db: ", e);
  }
}
