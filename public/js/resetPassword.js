var password = document.getElementById("password"),
  confirm_password = document.getElementById("confirmPassword");

document.getElementById("signupLogo").src =
  "https://www.afoodieworld.com/wp-content/uploads/2023/04/FOODIE-LOGO_om5o5g.png";
enableSubmitButton();

function validatePassword() {
  if (password.value != confirm_password.value) {
    confirm_password.setCustomValidity("Passwords Don't Match");
    return false;
  } else {
    confirm_password.setCustomValidity("");
    return true;
  }
}

password.onchange = validatePassword;
confirm_password.onkeyup = validatePassword;

function enableSubmitButton() {
  document.getElementById("submitButton").disabled = false;
  document.getElementById("loader").style.display = "none";
}

function disableSubmitButton() {
  document.getElementById("submitButton").disabled = true;
  document.getElementById("loader").style.display = "unset";
}

function validateSignupForm() {
  var form = document.getElementById("signupForm");

  for (var i = 0; i < form.elements.length; i++) {
    if (
      form.elements[i].value === "" &&
      form.elements[i].hasAttribute("required")
    ) {
      console.log("There are some required fields!");
      return false;
    }
  }

  if (!validatePassword()) {
    return false;
  }

  onSignup();
}

function onSignup() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    disableSubmitButton();

    if (this.readyState == 4 && this.status == 200) {
      enableSubmitButton();
    } else {
      console.log("AJAX call failed!");
      setTimeout(function () {
        enableSubmitButton();
      }, 1000);
    }
  };

  xhttp.open("GET", "ajax_info.txt", true);
  xhttp.send();
}

async function resetPassword(event) {
  event.preventDefault();
  let query = new URLSearchParams(location.search);
  let code = query.get("code");
  const res = await fetch("/resetpassword/confirm", {
    method: "POST", // Specify your HTTP method "GET", "DELETE", "PUT" ...
    headers: {
      // Specify any HTTP Headers Here
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({ code, password: password.value }), // Specify the Request Body
  });

  let json = await res.json();

  if (json.error) {
    Swal.fire("your code is not match", json.error, "error");
  }

  Swal.fire("you password has been modified!", ":):):):)!", "success");

  const content = await res.text();
}
