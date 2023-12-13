// Bottom Nav Bar

const html = [
  "/public/index.html",
  "/public/matching-profiles.html",
  "/public/pending-matches.html",
  "/public/contact.html",
  "/public/profile.html",
];

const navButtons = document.querySelectorAll(".nav-btn");

navButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    window.location.href = html[index];
  });
});

async function checkIfUser() {
  let res = await fetch("/index");
  let json = await res.json();

  if (json.error) {
    Swal.fire("Login to use the app", json.error, "error");
    window.setTimeout(function () {
      window.location.href = "http://localhost:8080/public/login.html";
    }, 1700);
    return;
  }
}

checkIfUser();
