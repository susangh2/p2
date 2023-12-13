import { client } from "./database";

export async function readMatchedUsername(userId: number) {
  try {
    let username = await client.query(
      /* sql */
      `SELECT username
      FROM users
      WHERE id = $1`,
      [userId]
    );
    return username;
  } catch (e) {
    console.error("Error reading username from db: ", e);
    throw e;
  }
}

// Updates status as rejected / matched for pending-matches.html
export async function updateMatchStatus(obj: statusObj, session_id: number) {
  console.log(obj, session_id);

  try {
    await client.query(
      /* sql */
      `UPDATE match_records
      SET status = $1 
      WHERE user1_id = $2 AND user2_id = $3`,
      [obj.status, session_id, obj.user2_id]
    );

    // For successful matches
    if (obj.status == "matched") {
      // Updates status as matched for both users
      let checkRecord = await client.query(
        /* sql */ `SELECT * FROM match_records WHERE user1_id = $1 AND user2_id = $2`,
        [obj.user2_id, session_id]
      );
      if (checkRecord.rows.length == 0) {
        await client.query(
          /* sql */
          `INSERT INTO match_records (user1_id, user2_id, status, status_date) VALUES ($1, $2, $3, $4)`,
          [obj.user2_id, session_id, obj.status, getCurrentDate()]
        );
      } else {
        await client.query(
          /* sql */
          `UPDATE match_records SET status = $1 WHERE user1_id = $2 AND user2_id = $3`,
          [obj.status, obj.user2_id, session_id]
        );
      }

      // Update private_chatrm table
      let matchIdFromDB = await client.query(
        /* sql */ `SELECT id FROM match_records WHERE user1_id = $1 AND user2_id = $2`,
        [session_id, obj.user2_id]
      );
      let matchId = matchIdFromDB.rows[0].id;
      console.log("matchId: ", matchId);

      await client.query(
        /* sql */
        `INSERT INTO private_chatrm (match_id) VALUES ($1)`,
        [matchId]
      );
    }

    console.log("Successfully updated match records");
  } catch (e) {
    console.error("Error updating status as matched: ", e);
    throw e;
  }
}

type statusObj = {
  user1_id: number;
  user2_id: number;
  status: string;
};

function getCurrentDate() {
  const currDate = new Date();
  const year = currDate.getFullYear();
  let month = currDate.getMonth() + 1;
  if (month < 10) {
    month = Number(`0${month}`);
  }
  const day = currDate.getDate();
  return `${year}-${month}-${day}`;
}
