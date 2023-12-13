import { updateRatingCircle } from './matching-profiles-style.js';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    let res = await fetch('/matching-profiles');
    let json = await res.json();
    let userObj = json.rows[0];
    console.log(userObj);
    showProfile(userObj);
    showAvatar(userObj.id);
    showRating(userObj.id);
    showMatchRate(userObj.id);
  } catch (e) {
    console.error(e);
  }
});

export function showProfile(userObj) {
  const profileList = document.querySelector('.profile-list');
  profileList.innerHTML = '';

  const profileListItems = [
    'Name',
    'Age',
    'Fav Food',
    'Disliked Food',
    'Restaurant',
    'Meal Budget',
    'Cuisine',
    'Interests',
    'Location',
    'Foodie Compatibility Rate',
  ];
  const usersTableColumns = [
    'username',
    'age',
    'fav_food',
    'disliked_food',
    'restaurants',
    'meal_budget',
    'selected_cuisines',
    'interests',
    'selected_districts',
  ];
  const icons = {
    male: '<i class="fa-solid fa-mars fa-sm""></i>',
    female: '<i class="fa-solid fa-venus fa-sm"></i>',
    1: '<i class="fa-solid fa-image-portrait fa-lg"></i>',
    2: '<i class="fa-solid fa-thumbs-up fa-lg"></i>',
    3: '<i class="fa-solid fa-thumbs-down fa-lg"></i>',
    4: '<i class="fa-solid fa-store fa-lg"></i>',
    5: '<i class="fa-solid fa-dollar-sign fa-lg"></i>',
    6: '<i class="fa-solid fa-utensils fa-lg"></i>',
    7: '<i class="fa-solid fa-ghost fa-lg"></i>',
    8: '<i class="fa-solid fa-location-dot fa-lg"></i>',
  };
  for (let i = 0; i < profileListItems.length; i++) {
    const li = document.createElement('li');
    if (i == 1 || i == 2 || i == 3 || i == 4 || i == 5) {
      li.innerHTML = /* html */ `<span class='icon-container'>${icons[i]}</span><span>${
        userObj[usersTableColumns[i]]
      }</span>`;
    } else if (i == 0) {
      if (userObj['gender'] == 'male') {
        li.innerHTML = /* html */ `<span id="username-container" data-userId="${userObj['id']}">${userObj['username']}&nbsp;${icons['male']}</span>`;
      } else {
        li.innerHTML = /* html */ `<span id="username-container" data-userId="${userObj['id']}">${userObj['username']}&nbsp;${icons['female']}</span>`;
      }
    } else if (i == 6 || i == 7 || i == 8) {
      let formattedStr = userObj[usersTableColumns[i]].split(',').join(', ');
      li.innerHTML = /* html */ `<span class='icon-container'>${icons[i]}</span><span class='formatted-str-container'>${formattedStr}</span>`;
    } else if (i == 9) {
      li.innerHTML = /* html */ `<span class='match-rate-title'>Foodie Compatibility Rate:&nbsp;</span><span class="match-rate"></span>`;
      li.classList.add('match-rate-container');
    }
    profileList.appendChild(li);
  }
}

export async function showAvatar(id) {
  let imgA = document.querySelector('.match-profile-container-a');
  let imgB = document.querySelector('.match-profile-container-b');
  let imgC = document.querySelector('.match-profile-container-c');
  try {
    let res = await fetch(`/matching-profiles/avatar?id=${id}`);
    let json = await res.json();
    imgA.src = '/uploads/' + json.rows[0].avatar;
    imgB.src = '/uploads/' + `food (${id * 2 - 1}).JPG`;
    imgC.src = '/uploads/' + `food (${id * 2}).JPG`;
  } catch (e) {
    console.error('Error getting avatar from server: ', e);
  }
}

export async function showRating(userId) {
  console.log(userId);
  try {
    let res = await fetch(`/reviews/user-rating?id=${userId}`);
    let json = await res.json();
    let avgRating = json.rows[0].rounded_avg_rating;
    console.log(avgRating);
    let ratingDiv = document.querySelector('.user-rating');
    ratingDiv.innerText = await Number(avgRating);
    updateRatingCircle();
    // Redirects to user_reviews
    document.querySelector('.rating').addEventListener('click', async () => {
      const userId = document.querySelector('#username-container').dataset.userid;
      window.location.href = `./user-reviews.html?id=${userId}`;
    });
  } catch (e) {
    console.error('Error fetching user rating: ', e);
  }
}

export async function showMatchRate(userId) {
  try {
    let res = await fetch(`/matching-profiles/match-rate?id=${userId}`);
    let matchRate = await res.json();
    console.log(matchRate);
    console.log(typeof matchRate);
    let matchRateSpan = document.querySelector('.match-rate');
    matchRateSpan.innerText = `${Number(matchRate)}%`;
  } catch (e) {
    console.error('Error fetching match rate: ', e);
  }
}

// Matching Buttons
const likeBtn = document.querySelector('.like-btn');
const rejectBtn = document.querySelector('.reject-btn');

likeBtn.addEventListener('click', async () => {
  clickedMatchBtn('invited');
  try {
    let res = await fetch('/matching-profiles');
    let json = await res.json();
    let userObj = json.rows[0];
    showProfile(userObj);
    showAvatar(userObj.id);
    showRating(userObj.id);
    showMatchRate(userObj.id);
  } catch (e) {
    console.error(e);
  }
});

rejectBtn.addEventListener('click', async () => {
  clickedMatchBtn('rejected');
  try {
    let res = await fetch('/matching-profiles');
    let json = await res.json();
    let userObj = json.rows[0];
    showProfile(userObj);
    showAvatar(userObj.id);
    showRating(userObj.id);
    showMatchRate(userObj.id);
  } catch (e) {
    console.error(e);
  }
});

async function clickedMatchBtn(status) {
  const user1_id = document.querySelector('#username-container').dataset.userid;
  // Link id to session
  // const user2_id = req.session.user_id;

  try {
    let res = await fetch(`/matching-profiles/status-update`, {
      method: 'post',
      body: JSON.stringify({
        user1_id: user1_id,
        // user2_id: user2_id,
        status: status,
        status_date: getCurrentDate(),
      }),
      headers: { 'Content-type': 'application/json' },
    });
    if (!res.ok) {
      console.error('Failed to update match');
    }
  } catch (e) {
    console.error('Failed to request server to update match status');
  }
}

function getCurrentDate() {
  const currDate = new Date();
  const year = currDate.getFullYear();
  let month = currDate.getMonth() + 1;
  if (month < 10) {
    month = `0${month}`;
  }
  const day = currDate.getDate();
  return `${year}-${month}-${day}`;
}
