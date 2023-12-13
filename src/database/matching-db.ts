import { client } from './database';

export async function getRandomProfile(session_id: number) {
  try {
    let profileData = await client.query(
      /* sql */
      `SELECT 
      u.id, 
      u.username,
      u.age,
      u.gender, 
      u.fav_food,
      u.disliked_food,
      u.restaurants,
      u.meal_budget,
      string_agg(DISTINCT c.country::text, ',') AS selected_cuisines,
      u.interests,
      string_agg(DISTINCT l.district::text, ',') AS selected_districts
      FROM users u 
      JOIN users_location ul on u.id = ul.user_id
      JOIN location l on ul.location_id = l.id
      JOIN users_cuisine uc on u.id = uc.user_id
      JOIN cuisine c on uc.cuisine_id = c.id
      GROUP BY u.id
      ORDER BY RANDOM() LIMIT 1`
    );

    // Checks if the user has initiated a match record
    let userCheck1 = profileData.rows[0].id;
    let userCheck2 = session_id;

    let checkData = await client.query(
      /* sql */ `SELECT user1_id, user2_id, status FROM match_records WHERE user1_id = $1 AND user2_id = $2`,
      [userCheck1, userCheck2]
    );

    // TODO
    // Checks if there are any profiles left
    let i = 0;
    while (i < 100) {
      // Makes sure user has not initiated a match record & isn't user's own profile
      if (checkData.rows[0] != undefined || profileData.rows[0]['id'] == session_id) {
        i++;
        return getRandomProfile(session_id);
      }
      return profileData;
    }
    console.log(profileData.rows);

    console.log('no profiles');

    return { noProfiles: true };
  } catch (e) {
    console.error('Error getting random profile from db: ', e);
    throw e;
  }
}

export async function getAvatar(id: number) {
  try {
    let avatarPath = client.query(/* sql */ `SELECT avatar FROM users WHERE id = $1`, [id]);
    return avatarPath;
  } catch (e) {
    console.error('Error getting avatar path from db: ', e);
    throw e;
  }
}

// Declare type for getting filtered profile
type FilerRequirements = {
  id: number;
  gender: string;
  age_min: string;
  age_max: string;
  location: string[];
  cuisine: string[];
  meal_budget: string;
  availability_type: string;
  availability_day?: string;
  availability_meal?: string[];
};

export async function getFilteredProfile(filterRequirements: FilerRequirements, session_id: Number) {
  let filterQuery =
    /* sql */
    `SELECT
  u.id,
  u.username,
  u.age,
  u.gender,
  u.fav_food,
  u.disliked_food,
  u.restaurants,
  u.meal_budget,
  string_agg(DISTINCT c.country::text, ',') AS selected_cuisines,
  u.interests,
  string_agg(DISTINCT l.district::text, ',') AS selected_districts
FROM users u
JOIN users_cuisine uc ON u.id = uc.user_id
JOIN cuisine c ON uc.cuisine_id = c.id
JOIN users_location ul ON u.id = ul.user_id
JOIN location l ON ul.location_id = l.id
JOIN users_available_day uad ON uad.user_id = u.id
WHERE
  ($1 = 'any' OR u.gender = $1::gender_enum)
  AND u.age BETWEEN $2 AND $3
  AND (uc.cuisine_id = ANY($4) OR $4 = '{}'::int[])
  AND (ul.location_id = ANY($5) OR $5 = '{}'::int[])
  AND (
    ($6 = 'below $50' AND u.meal_budget = 'below $50')
    OR ($6 = 'below $100' AND (u.meal_budget = 'below $50' OR u.meal_budget = 'below $100'))
    OR ($6 = 'below $200' AND (u.meal_budget = 'below $50' OR u.meal_budget = 'below $100' OR u.meal_budget = 'below $200'))
    OR ($6 = 'below $400' AND (u.meal_budget = 'below $50' OR u.meal_budget = 'below $100' OR u.meal_budget = 'below $200' OR u.meal_budget = 'below $400'))
    OR ($6 = 'below $800' AND (u.meal_budget = 'below $50' OR u.meal_budget = 'below $100' OR u.meal_budget = 'below $200' OR u.meal_budget = 'below $400' OR u.meal_budget = 'below $800'))
    OR ($6 = 'any' AND (u.meal_budget = 'below $50' OR u.meal_budget = 'below $100' OR u.meal_budget = 'below $200' OR u.meal_budget = 'below $400' OR u.meal_budget = 'below $800' OR u.meal_budget = 'any'))
  )
  AND (
    $7 = 'anyDate'
    OR (
      ($7 = 'chosenDate'
      AND EXISTS (
        SELECT 1
        FROM users_available_day uad
        WHERE uad.user_id = u.id
        AND uad.day = $8
        AND (
          ($9 LIKE '%breakfast%' AND uad.breakfast) OR
          ($9 LIKE '%brunch%' AND uad.brunch) OR
          ($9 LIKE '%lunch%' AND uad.lunch) OR
          ($9 LIKE '%tea%' AND uad.tea) OR
          ($9 LIKE '%dinner%' AND uad.dinner) OR
          ($9 LIKE '%lateNight%' AND uad."lateNight")
        )
      ))
    )
  )
GROUP BY u.id
ORDER BY RANDOM()`;

  try {
    let profileData = await client.query(filterQuery, [
      filterRequirements.gender,
      filterRequirements.age_min,
      filterRequirements.age_max,
      filterRequirements.cuisine,
      filterRequirements.location,
      filterRequirements.meal_budget,
      filterRequirements.availability_type,
      filterRequirements.availability_day,
      filterRequirements.availability_meal,
    ]);

    let userCheck1 = profileData.rows[0].id;
    let userCheck2 = session_id;

    let checkData = await client.query(
      /* sql */ `SELECT user1_id, user2_id, status FROM match_records WHERE user1_id = $1 AND user2_id = $2`,
      [userCheck1, userCheck2]
    );

    if (checkData.rows[0] != undefined || profileData.rows[0]['id'] == session_id) {
      getFilteredProfile(filterRequirements, session_id);
    }
    return profileData;
  } catch (e) {
    console.error('Error getting filtered profile from db: ', e);
    throw e;
  }
}

export async function readProfile(id: number) {
  try {
    let profileData = await client.query(
      /* sql */
      `SELECT u.id,
      u.username,
      u.age,
      u.gender,
      u.fav_food,
      u.disliked_food,
      u.restaurants,
      u.meal_budget,
      string_agg(DISTINCT c.country::text, ',') AS selected_cuisines,
      u.interests,
      string_agg(DISTINCT l.district::text, ',') AS selected_districts
    FROM users u
      JOIN users_location ul on u.id = ul.user_id
      JOIN location l on ul.location_id = l.id
      JOIN users_cuisine uc on u.id = uc.user_id
      JOIN cuisine c on uc.cuisine_id = c.id
    WHERE u.id = $1
    GROUP BY u.id`,
      [id]
    );
    return profileData;
  } catch (e) {
    console.error('Error getting filtered profile from db: ', e);
    throw e;
  }
}

// Declare type for updating like button
type UpdateContent = {
  user1_id: number;
  user2_id: number;
  status: string;
  status_date: string;
};

export async function updateStatus(updateContent: UpdateContent, session_id: number) {
  try {
    await client.query(
      /* sql */ `INSERT INTO match_records (user1_id, user2_id, status, status_date) VALUES ($1, $2, $3, $4)`,
      [updateContent.user1_id, session_id, updateContent.status, updateContent.status_date]
    );
  } catch (e) {
    console.error('Error updating status for match button: ', e);
    throw e;
  }
}

// Matching Rate
export async function getMatchRate(oppId: number, session_id: number) {
  const userId = session_id;
  try {
    let oppUser = await client.query(
      /* sql */ `
    SELECT cuisine_id 
    FROM users_cuisine uc 
      JOIN users u on u.id = uc.user_id
    WHERE u.id = $1`,
      [oppId]
    );
    let oppUserCuisineArr = oppUser.rows.map((row) => {
      return row.cuisine_id;
    });
    let user = await client.query(
      /* sql */ `
    SELECT cuisine_id 
    FROM users_cuisine uc 
      JOIN users u on u.id = uc.user_id
    WHERE u.id = $1`,
      [userId]
    );
    let userCuisineArr = user.rows.map((row) => {
      return row.cuisine_id;
    });
    return calculateMatchRate(oppUserCuisineArr, userCuisineArr);
  } catch (e) {
    console.error('Error getting match rate from db: ', e);
    throw e;
  }
}

function calculateMatchRate(arr1: number[], arr2: number[]) {
  const common = arr1.filter((value) => arr2.includes(value));
  const matchingRate = Math.round((common.length / Math.max(arr1.length, arr2.length)) * 100);
  return matchingRate;
}
