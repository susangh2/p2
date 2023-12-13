$(document).ready(function () {
  var current_fs, next_fs, previous_fs; //fieldsets
  var opacity;
  var current = 1;
  var steps = $("fieldset").length;

  setProgressBar(current);

  $(".next").click(function () {
    current_fs = $(this).parent();
    next_fs = $(this).parent().next();

    //Add Class Active
    $("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");

    //show the next fieldset
    next_fs.show();
    //hide the current fieldset with style
    current_fs.animate(
      { opacity: 0 },
      {
        step: function (now) {
          // for making fielset appear animation
          opacity = 1 - now;

          current_fs.css({
            display: "none",
            position: "relative",
          });
          next_fs.css({ opacity: opacity });
        },
        duration: 500,
      }
    );
    setProgressBar(++current);
  });

  $(".previous").click(function () {
    current_fs = $(this).parent();
    previous_fs = $(this).parent().prev();

    //Remove class active
    $("#progressbar li")
      .eq($("fieldset").index(current_fs))
      .removeClass("active");

    //show the previous fieldset
    previous_fs.show();

    //hide the current fieldset with style
    current_fs.animate(
      { opacity: 0 },
      {
        step: function (now) {
          // for making fielset appear animation
          opacity = 1 - now;

          current_fs.css({
            display: "none",
            position: "relative",
          });
          previous_fs.css({ opacity: opacity });
        },
        duration: 500,
      }
    );
    setProgressBar(--current);
  });

  function setProgressBar(curStep) {
    var percent = parseFloat(100 / steps) * curStep;
    percent = percent.toFixed();
    $(".progress-bar").css("width", percent + "%");
  }

  // $(".submit").click(function () {
  //   return false;
  // });
});

// In your Javascript (external .js resource or <script> tag)
$(document).ready(function () {
  $(".js-example-basic-single").select2();
});

//--------submit logic-----------------
async function submitRegForm(event) {
  event.preventDefault();
  let form = event.target;
  let res = await fetch(form.action, {
    method: form.method,
    body: new FormData(form),
  });
  let json = await res.json();
  if (json.error) {
    Swal.fire("Failed to submit", json.error, "error");
    event.stopImmediatePropagation();
    return;
  }
  console.log("submit success");

  window.setTimeout(function () {
    window.location.href = "http://localhost:8080/public/login.html";
  }, 2000);
  console.log(form.location.value.length);
}

//------load options--------------
let mealBudget = document.querySelector("select[name=mealBudget]");
let cuisineCountry = document.querySelector("select[name=cuisineCountry]");
let districtLocation = document.querySelector("select[name=districtLocation]");
loadOptions();

async function loadOptions() {
  let res = await fetch("/regnistration");
  let json = await res.json();

  console.log(json.districts[0].id);
  if (json.error) {
    Swal.fire("Failed to load budgets and cuisines", json.error, "error");
    return;
  }
  for (let budget of json.budgets) {
    let opt = document.createElement("option");
    opt.value = budget.price_range;
    opt.textContent = budget.price_range;
    mealBudget.appendChild(opt);
  }

  // for (let cuisine of json.cuisines) {
  //   let opt = document.createElement("option");
  //   opt.value = cuisine.country;
  //   opt.textContent = cuisine.country;
  //   cuisineCountry.appendChild(opt);
  // }

  VirtualSelect.init({
    ele: "#cuisineCountry",
    placeholder: "Cuisine",
    multiple: true,
    minValues: 1,
    maxValues: 5,
    showValueAsTags: true,
    options: json.cuisines.map((cuisine) => ({
      label: cuisine.country,
      value: cuisine.id,
    })),
  });

  VirtualSelect.init({
    ele: "#location",
    placeholder: "Avaliable location",
    multiple: true,
    showValueAsTags: true,
    minValues: 1,
    maxValues: 5,
    options: json.districts.map((district) => ({
      label: district.district,
      value: district.id,
    })),
  });

  // for (let district of json.districts) {
  //   let opt = document.createElement("option");
  //   opt.value = district.district;
  //   opt.textContent = district.district;
  //   districtLocation.appendChild(opt);
  // }
}

// options.push({ label: "hi", value: "hi" });

//-------------------validate the input value-----

function validatInputAccount(event) {
  validateEmail(event);
  validateUsername(event);
  validatePassword(event);
}

function validatInputPersonal(event) {
  validateAge(event);
  validateLocation(event);
  validateCuisine(event);
  validateOptional(event);
}

async function checkUsername(event) {
  let input = event.target;
  console.log(input.value);
  let params = new URLSearchParams();
  params.set("username", input.value);

  usernameMessage.textContent = "Checking username...";
  usernameMessage.style.color = "orange";

  let res = await fetch("/registration/search?" + params, {
    headers: {
      Accept: "application/json",
    },
  });
  let json = await res.json();
  console.log(json.error);
  if (json.error) {
    usernameMessage.textContent = json.error;
    usernameMessage.style.color = "red";
    return;
  }
  if (json.count == 0) {
    usernameMessage.textContent = "This username is available";
    usernameMessage.style.color = "green";
  } else {
    usernameMessage.textContent = "This username is already used";
    usernameMessage.style.color = "red";
  }
}

function validateEmail(event) {
  let mail = document.querySelector("input[name=email]").value;
  let validRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

  if (!mail.match(validRegex)) {
    event.stopImmediatePropagation();
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "You mail format is not correcct",
    });
    return;
  }
  return;
}

async function validateUsername(event) {
  let username = document.querySelector("input[name=username]").value;
  let res = await fetch("/registration");
  let json = res.json();
  console.log(json.error);
  console.log("validate username");
  if (username === "") {
    event.stopImmediatePropagation();
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "username is missing",
    });
    return;
  }
  if (username.length > 25) {
    event.stopImmediatePropagation();
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "username's length is beyonds limitation, it should be less than 25",
    });
  }
  return;
}

function validatePassword(event) {
  let password = document.querySelector("input[name=password]").value;
  let confirmPassword = document.querySelector(
    "input[name=confirmPassword]"
  ).value;

  if (password === "") {
    event.stopImmediatePropagation(event);
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Password can not be empty",
    });
  }

  if (password != confirmPassword) {
    event.stopImmediatePropagation(event);
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Your password is not matched",
    });
    return;
  }
  return;
}

//-------validation on Personal page

function validateAge(event) {
  let age = document.querySelector("input[name=age]").value;
  if (!parseInt(age)) {
    event.stopImmediatePropagation();
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "age must be number",
    });
    return;
  }

  if (age == "") {
    event.stopImmediatePropagation();
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "age cannot be empty",
    });
    return;
  }

  if (age.includes(".")) {
    event.stopImmediatePropagation();
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "age should be a integer without decimal",
    });
    return;
  }

  if (parseInt(age) < 12 || parseInt(age) > 100) {
    event.stopImmediatePropagation();
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Invalid age, it should be between 12 and 100",
    });
    return;
  }
  return;
}

function validateLocation(event) {
  let location = document.querySelector("div[name=location]").value;
  if (location == "") {
    event.stopImmediatePropagation();
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Avaliable location is missing",
    });
    return;
  }
  return;
}

function validateCuisine(event) {
  let location = document.querySelector("div[name=cuisineCountry]").value;
  if (location == "") {
    event.stopImmediatePropagation();
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Cuisine is missing",
    });
    return;
  }
  return;
}

function validateOptional(event) {
  let favFood = document.querySelector("input[name=favFood]").value;
  let disFood = document.querySelector("input[name=disFood]").value;
  let restaurant = document.querySelector("input[name=restaurant]").value;
  let interested = document.querySelector("input[name=interested]").value;
  console.log(favFood);
  console.log(typeof favFood.length);
  if (favFood.length > 255) {
    event.stopImmediatePropagation();
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Fav_food beyond word limitation, it should be less than 255 including any symbols",
    });
    return;
  }
  if (disFood.length > 255) {
    event.stopImmediatePropagation();
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Dislike_food beyond word limitation, it should be less than 255 including any symbols",
    });
    return;
  }
  if (restaurant.length > 255) {
    event.stopImmediatePropagation();
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Restaurant beyond word limitation, it should be less than 255 including any symbols",
    });
    return;
  }
  if (interested.length > 255) {
    event.stopImmediatePropagation();
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "interested beyond word limitation, it should be less than 255 including any symbols",
    });
    return;
  }
  return;
}

function validateFile(event) {
  let file = document.querySelector("input[name=image]").value;
  console.log(file);
  console.log(typeof file);
  if (file == "") {
    event.stopImmediatePropagation();
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "You must upload photo for your profile pic",
    });
    return;
  }
  return;
}
