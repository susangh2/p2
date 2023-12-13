document.addEventListener("DOMContentLoaded", showMatchingRequests());

async function getMatchingRequest() {
  try {
    let res = await fetch(`/pending-matches`);
    let json = await res.json();
    return json.rows;
  } catch (e) {
    console.error("Error getting match requests", e);
  }
}

async function showMatchingRequests() {
  try {
    const requestList = await getMatchingRequest();
    const requestListContainer = document.querySelector(".match-request-list");
    for (const request of requestList) {
      const container = document.createElement("div");
      container.className = "request-container";

      const info = document.createElement("div");
      info.className = "request-info";
      info.innerHTML =
        /* html */
        `<span class="request-user">${request.username}</span>
        <span class="request-date">${formatDate(request.status_date)}</span>`;

      const requestBtns = document.createElement("div");
      requestBtns.className = "request-btns";
      requestBtns.innerHTML =
        /* html */
        `<button class="request-accept"><i class="fa-solid fa-utensils fa-xl"></i> Accept</button>
        <button class="request-decline"><i class="fa-solid fa-trash-can fa-xl"></i> Decline</button>`;

      container.appendChild(info);
      container.appendChild(requestBtns);
      requestListContainer.appendChild(container);
      // Accepts request
      acceptRequest(container, request.user2_id);
      // Declines request
      declineRequest(container, request.user2_id);
      // Show profile info
      showProfileInfo(container, request);
    }
  } catch (e) {
    console.error("Error showing match requests", e);
  }
}

function acceptRequest(container, id2) {
  container.querySelector(".request-accept").addEventListener("click", () => {
    window.location.href = `/public/matched.html?id=${id2}`;
  });
}

async function declineRequest(container, id2) {
  // Hides request upon decline
  const declineButton = container.querySelector(".request-decline");
  declineButton.addEventListener("click", async () => {
    container.style.display = "none";
    // Update match status in database as rejected
    try {
      let res = await fetch("/matched", {
        method: "put",
        body: JSON.stringify({
          user2_id: id2,
          status: "rejected",
        }),
        headers: { "Content-type": "application/json" },
      });
      if (!res.ok) {
        console.error("Failed to update status as rejected");
      }
    } catch (e) {
      console.error(
        "Failed to request server to update status as rejected: ",
        e
      );
    }
  });
}

// Get profile for sweet alert
async function getProfile(id) {
  let res = await fetch(`/matching-profiles/profile?id=${id}`);
  let json = await res.json();
  let profileObj = json.rows[0];
  return profileObj;
}

// Show profile in sweet alert
function showProfileInfo(container, request) {
  const userBtn = container.querySelector(".request-user");
  userBtn.addEventListener("click", async () => {
    let profileObj = await getProfile(request.user2_id);
    // Get gender icon
    let genderIcon;
    if (profileObj.gender == "male") {
      genderIcon = `<i class="fa-solid fa-mars"></i>`;
    } else {
      genderIcon = `<i class="fa-solid fa-venus"></i>`;
    }
    Swal.fire(
      `${profileObj.username} ${genderIcon}`,
      `Age:<br>${profileObj.age}<br>Fav Food:<br>${
        profileObj.fav_food
      }<br>Disliked Food:<br>${profileObj.disliked_food}<br>Meal Budget:<br>${
        profileObj.meal_budget
      }<br>Restaurant:<br>${
        profileObj.restaurants
      }<br>Cuisines:<br>${profileObj.selected_cuisines
        .split(",")
        .join(", ")}<br>Interests:<br>${
        profileObj.interests
      }<br>Locations:<br>${profileObj.selected_districts.split(",").join(", ")}`
    );
  });
}

// Date Formatter
function formatDate(inputDate) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const date = new Date(inputDate);
  date.setDate(date.getDate() + 1); // Add one day

  const month = months[date.getMonth()];
  const day = days[date.getUTCDay()];
  const dayOfMonth = date.getUTCDate();

  return `${month} ${dayOfMonth} ${day}`;
}
