function show() {
  var p = document.getElementById("pwd");
  p.setAttribute("type", "text");
}

function hide() {
  var p = document.getElementById("pwd");
  p.setAttribute("type", "password");
}

var pwShown = 0;

document.getElementById("eye").addEventListener(
  "click",
  function () {
    if (pwShown == 0) {
      pwShown = 1;
      show();
    } else {
      pwShown = 0;
      hide();
    }
  },
  false
);

//-----pass data to server side---
let form = document.querySelector("#login");
async function userLogin(event) {
  event.preventDefault();
  let username = form.username.value;
  let password = form.password.value;
  console.log(username, password);
  let res = await fetch(form.action, {
    method: form.method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });
  let json = await res.json();
  console.log(json);
  if (json.error) {
    Swal.fire("Failed to login", json.error, "error");
    return;
  }

  Swal.fire({
    icon: "success",
    title: "Congratulation",
    text: "Log in success!",
    footer: '<a href="/">Go to home page</a>',
  });

  window.setTimeout(function () {
    window.location.href = "http://localhost:8080/public/profile.html";
  }, 1700);
}

async function forgetPassword() {
  const { value: email } = await Swal.fire({
    title: "Input email address",
    input: "email",
    inputLabel: "Your email address",
    inputPlaceholder: "Enter your email address",
  });

  let params = new URLSearchParams();
  params.set("email", email);

  let res = await fetch("/sendmail/search?" + params, {
    headers: {
      Accept: "application/json",
    },
  });

  let json = await res.json();
  console.log(json);
  console.log(json.error);

  if (json.error) {
    Swal.fire("Invalid email", json.error, "error");
  } else {
    Swal.fire({
      icon: "success",
      title: "Please reset your password via your email",
      showConfirmButton: false,
      timer: 2000,
    });
  }
}
