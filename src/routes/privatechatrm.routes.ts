import { Router } from "express";
import { client } from "../database/database";
import { io } from "../socketio/socket";
import { userOnlyAPI } from "../utils/guard";

export let pmRouter = Router();

// pmRouter.get("/loadmsg", userOnlyAPI, async (req, res, next) => {
//   try {
//     let result = await client.query(
//       /*sql*/ `select private_msg.message, private_msg.id, created_at from private_msg where is_deleted = false`
//     );
//     let messageHistories = result.rows;
//     console.log(messageHistories);
//     res.json({ messageHistories });
//   } catch (error) {
//     error;
//   }
// });

pmRouter.post("/chatsent", userOnlyAPI, async (req, res, next) => {
  try {
    let { message, room_id } = req.body;
    let sender_id = req.session["user_id"];

    let usernameresult = await client.query(
      /*sql*/ `select username from users where id = $1`,
      [sender_id]
    );
    // console.log(usernameresult)
    console.log("ROWS" + usernameresult.rows[0].username);
    let username = usernameresult.rows[0].username;
    // let username = req.session["user_id"]
    let created_at = new Date();
    io.to("room:" + room_id).emit("new-message", {
      message,
      created_at,
      username,
    });

    // console.log(message,usernameresult);
    // console.log("msg body: ", req.body);
    // console.log(message,usernameresult);
    // console.log("msg body: ", req.body);
    if (!message) {
      res.status(400);
      res.json({ error: "missing message" });
      return;
    }
    // res.json({msgsumbited: JSON.stringify(msgsumbited)})
    let result = await client.query(
      /*sql*/ `insert into private_msg (sender_id, room_id, message) values ($1, $2, $3) returning id, created_at`,
      [sender_id, room_id, message]
    );
    let row = result.rows[0];
    res.json({
      messageHistory: { message, id: row.id, created_at: row.created_at },
    });
    // res.send('finished')
  } catch (error) {
    next(error);
  }
});

pmRouter.get("/loadmsg2", userOnlyAPI, async (req, res, next) => {
  try {
    let chatrmid = +req.query!.id!;

    if (!chatrmid || chatrmid == undefined) {
      console.log("No id", req.query.id);
      return;
    }

    let result = await client.query(
      /*sql*/
      `select private_msg.id, private_msg.sender_id, private_msg.message, private_msg.created_at, users.username from private_msg inner join users on private_msg.sender_id = users.id where private_msg.room_id = $1 and is_deleted = false`,
      [chatrmid]
    );
    let messageRecords = result.rows;
    res.json({ messageRecords });
    // console.log(messageRecords)
  } catch (error) {
    next(error);
  }
});

pmRouter.delete("/msgdelete/:id", userOnlyAPI, async (req, res, next) => {
  try {
    let messageId = +req.params.id;
    console.log({ messageId });

    if (!messageId) {
      res.status(404);
      res.json({ error: "msg not found" });
      return;
    }
    let result = await client.query(
      /*sql*/
      `update private_msg set is_deleted = true where id = $1`,
      [messageId]
    );
    res.json({ deleted: result.rowCount, messageId });
  } catch (error) {
    next(error);
  }
});

pmRouter.get("/chatcontact", userOnlyAPI, async (req, res, next) => {
  // let currentId = 1; //req.session.user.id
  let currentId = req.session["user_id"];
  console.log(req.session["user_id"]);

  let result = await client.query(
    /*sql*/
    `WITH room AS (
    SELECT private_chatrm.id AS room_id,
        match_records.user2_id AS user_id
    FROM match_records
    LEFT JOIN private_chatrm ON private_chatrm.match_id = match_records.id
    WHERE match_records.user1_id = $1
        AND match_records.status = 'matched'
      )
      SELECT room.room_id,
    (
        select message
        from private_msg
        where room_id = room.room_id
        order by id desc
        LIMIT 1
    ) as last_message,
    (
        select created_at
        from private_msg
        where room_id = room.room_id
        order by id desc
        LIMIT 1
    ) as last_message_time,
    room.user_id,
    users.username
    FROM room
    inner join users on users.id = room.user_id
    ORDER BY room.room_id asc`,

    [currentId]
  );

  res.json(result.rows);
});

pmRouter.patch(
  "/rooms/:id/status/reject",
  userOnlyAPI,
  async (req, res, next) => {
    try {
      let roomid = req.params.id;
      console.log({ roomid });

      let result = await client.query(
        /*sql*/
        `UPDATE match_records
        SET status = 'rejected'
        FROM private_chatrm
        WHERE match_records.id = private_chatrm.match_id
        AND private_chatrm.id = $1`,
        [roomid]
      );

      res.json({ deleted: result.rowCount });
    } catch (e) {
      next(e);
    }
  }
);

// `update private_chatrm set room_status = rejected where private_chatrm.id = $1`,
// pmRouter.delete("/leaverm", async (req, res, next) => {
//   try {
//     let roomid = req.query.id;
//     let result = await client.query(
//       /*sql*/
//       `update private_chatrm set room_status = false where private_chatrm.id = $1`,
//       [roomid],
//     );
//     res.json({ deleted: result.rowCount });
//   } catch (e) {
//     next(e);
//   }
// });
// `update private_chatrm set room_status = rejected where private_chatrm.id = $1`,

// pmRouter.get('/reviewInChat'), async (req, res, next) => {
//   let username = req.query.name
//   let result = await client.query (
//     /*sql*/ `Select  from `
//   )
// }
