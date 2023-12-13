export function updateRatingCircle() {
  const ratings = document.querySelectorAll(".rating");
  // Iterate over all rating items
  ratings.forEach((rating) => {
    // Get content and get score as a float
    const ratingContent = rating.innerHTML;
    const ratingScore = parseFloat(ratingContent);

    // Convert score to a percentage out of 5 (maximum score)
    const percentageOutOf5 = (ratingScore / 5) * 100;

    // Define if the score is good, meh or bad according to its value
    rating.className = "";
    rating.classList.add("rating");
    let scoreClass =
      percentageOutOf5 < 50 ? "bad" : percentageOutOf5 < 70 ? "meh" : "good";

    // Add score class to the rating
    rating.classList.add(scoreClass);
    rating.style.background = "";

    // After adding the class, get its color
    const ratingColor = window.getComputedStyle(rating).backgroundColor;

    // Set the gradient as the rating background
    rating.style.background = `conic-gradient(${ratingColor} ${percentageOutOf5}%, transparent 0deg, transparent 100%)`;

    // Wrap the content in a tag to show it above the pseudo element that masks the bar
    rating.innerHTML = `<span>${ratingScore.toFixed(1)} ${
      ratingContent.indexOf("%") >= 0 ? "<small>%</small>" : ""
    }</span>`;
  });
}
