document.addEventListener('DOMContentLoaded', getReview());

//  Back Button
const backBtn = document.querySelector('.backbtn-container');
backBtn.addEventListener('click', async () => {
  window.location.href = './matching-profiles.html';
});

showReview();

// Get Reviews
async function getReview() {
  try {
    let res = await fetch(`/reviews/user-reviews`);
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

    document.querySelector('.reviewee').innerText = `My Reviews`;
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

      const replyBtn = document.createElement('button');
      replyBtn.classList.add('replyBtn');
      replyBtn.dataset.username = review.username;
      replyBtn.dataset.rated_user_id = review.username_id;
      replyBtn.dataset.rated_by_user_id = review.username2_id;
      replyBtn.innerHTML = `<i class="fa-solid fa-reply"></i> Reply`;
      reviewContainer.appendChild(replyBtn);

      reviewsList.appendChild(reviewContainer);
    }
    // SweetAlert for Reply Msg
    document.querySelectorAll('.replyBtn').forEach((button) => {
      button.addEventListener('click', function () {
        const username = button.dataset.username;
        const rated_user_id = button.dataset.rated_user_id;
        const rated_by_user_id = button.dataset.rated_by_user_id;
        replyReviewSA(username, rated_user_id, rated_by_user_id);
      });
    });
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

async function replyReviewSA(username, rated_user_id, rated_by_user_id) {
  const { value: text } = await Swal.fire({
    input: 'textarea',
    inputLabel: `Reply to ${username}`,
    inputPlaceholder: 'Type your reply here...',
    inputAttributes: {
      'aria-label': 'Type your message here',
    },
    showCancelButton: true,
  });

  if (text) {
    try {
      fetch('/reviews/review-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rated_user_id: rated_user_id,
          rated_by_user_id: rated_by_user_id,
          reply: text,
          reply_date: '2023-08-15',
        }),
      });
    } catch (e) {
      console.error('Error sending post request to server', e);
    }
  }
}
