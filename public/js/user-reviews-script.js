document.addEventListener('DOMContentLoaded', getReview());

//  Back Button
const backBtn = document.querySelector('.backbtn-container');
backBtn.addEventListener('click', async () => {
  window.location.href = './matching-profiles.html';
});

//  My Review Button
const reviewBtn = document.querySelector('.my-review-container');
reviewBtn.addEventListener('click', async () => {
  window.location.href = './personal-reviews.html';
});

showReview();

// Get Reviews
async function getReview() {
  // Get id param of url
  const queryStr = window.location.search;
  const params = new URLSearchParams(queryStr);
  const id = params.get('id');
  try {
    let res = await fetch(`/reviews/user-reviews?id=${id}`);
    let json = await res.json();
    return json;
  } catch (e) {
    console.error('Error getting review: ', e);
  }
}

// Data-Template for Reviews
async function showReview() {
  try {
    const reviews = await getReview();
    const reviewsList = document.querySelector('#reviewsList');

    document.querySelector('.reviewee').innerText = `${reviews[0].username2}'s Reviews`;
    document.querySelector('.average-rating').innerText = `${reviews[0].avg_rating} |`;
    document.querySelector('.review-count').innerText = `${reviews[0].review_count} Reviews`;

    for (const review of reviews) {
      const reviewContainer = document.createElement('div');
      reviewContainer.className = 'review-container';

      const elements = [
        { className: 'reviewer-username', text: review.username },
        { className: 'reviewer-rating', text: showRatingStar(review.rating) },
        { className: 'reviewer-comment', text: review.comment },
        {
          className: 'reviewer-date',
          text: `${review.rating_date} ${genRandomMeal()}`,
        },
      ];

      elements.forEach(({ className, text }) => {
        const element = document.createElement('div');
        element.className = className;
        element.innerHTML = text;
        reviewContainer.appendChild(element);
      });

      reviewsList.appendChild(reviewContainer);
    }
  } catch (error) {
    console.error(error);
  }
}

function showRatingStar(starCount) {
  const starsHTML = Array.from({ length: starCount }, () => '<i class="fa-solid fa-star fa-2xs"></i>').join('');
  return starsHTML;
}

function genRandomMeal() {
  const meals = ['Breakfast', 'Brunch', 'Lunch', 'Tea', 'Dinner', 'Late Night Snack'];
  const randomIndex = Math.floor(Math.random() * meals.length);
  return meals[randomIndex];
}
