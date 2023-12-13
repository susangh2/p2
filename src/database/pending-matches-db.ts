import { client } from './database';

// Get Invitations
export async function readInvitations(userId: number) {
  try {
    let invitations = await client.query(
      /* sql */
      `SELECT mr.user1_id,
        mr.user2_id,
        u.username,
        u2.username,
        mr.status_date
      FROM match_records mr
      JOIN users u ON mr.user1_id = u.id
      JOIN users u2 ON mr.user2_id = u2.id
      WHERE mr.user1_id = $1
        AND mr.status = 'invited'
      ORDER by mr.status_date DESC`,
      [userId]
    );
    return invitations;
  } catch (e) {
    console.error('Error reading invitations from db: ', e);
    throw e;
  }
}
