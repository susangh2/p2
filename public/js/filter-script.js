import { showProfile, showAvatar, showRating, showMatchRate } from './matching-profiles-script.js';

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('#filterForm').addEventListener('submit', (event) => filterMatch(event));
});

async function filterMatch(event) {
  event.preventDefault();
  dateInputs.style.display = 'none';
  closeNav();
  const form = event.target;

  const formObj = {
    gender: form.gender.value,
    age_min: form.min.value,
    age_max: form.max.value,
    location: [],
    cuisine: [],
    meal_budget: form.budget.value,
    availability_type: form.date.value,
  };

  // Get selected locations
  const checkedLocationBoxes = document.querySelectorAll('.location-container input[type="checkbox"]:checked');
  const checkedLocations = Array.from(checkedLocationBoxes).map((checkbox) => checkbox.value);
  formObj.location = checkedLocations;

  // Get selected cuisines
  const checkedCuisineBoxes = document.querySelectorAll('.cuisine-container input[type="checkbox"]:checked');
  const checkedCuisines = Array.from(checkedCuisineBoxes).map((checkbox) => checkbox.value);
  formObj.cuisine = checkedCuisines;

  // Checks if date & meal are chosen
  if (form.date.value == 'chosenDate') {
    // checkDate();
    formObj['availability_day'] = getDayOfWeek(form.chosenDate.value);
    const checkedMeals = document.querySelector('.text');
    formObj['availability_meal'] = checkedMeals.innerText;
  }
  try {
    const res = await fetch(form.action, {
      method: form.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formObj), // Convert FormData to JSON object
    });
    const json = await res.json();
    let userObj = json.rows[0];
    showProfile(userObj);
    showAvatar(userObj.id);
    showRating(userObj.id);
    showMatchRate(userObj.id);
  } catch (e) {
    console.log(e);
  }
}

// Hides date options when any is selected
const anyRadio = document.querySelector('.chosen-any-radio');
const dateRadio = document.querySelector('.chosen-date-radio');
const dateInputs = document.querySelector('.chosen-date-input');

anyRadio.addEventListener('click', toggleDateSelection);
dateRadio.addEventListener('click', toggleDateSelection);

function toggleDateSelection() {
  dateInputs.style.display = dateRadio.checked ? 'block' : 'none';
}

// Reminds user that date must be chosen
const dateInput = document.querySelector('.chosenDate');
dateRadio.addEventListener('click', () => {
  let reminder = document.querySelector('.date-error-message');

  dateInput.addEventListener('input', () => {
    if (dateInput.value === '') {
      reminder.style.display = 'block';
    } else {
      reminder.style.display = 'none';
    }
  });
});

function getDayOfWeek(date) {
  let dateObj = new Date(date);
  let dayOfWeek = dateObj.getDay();
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let dayOfWeekString = daysOfWeek[dayOfWeek];
  return dayOfWeekString;
}
