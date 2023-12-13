async function getThemessage() {
  let res = await fetch("/profile");
  let json = await res.json();
  console.log("fetch the data");
  if (json.error) {
    Swal.fire("Failed to access to profile page", json.error, "error");
    window.setTimeout(function () {
      window.location.href = "http://localhost:8080/public/login.html";
    }, 1700);
    return;
  }

  let { meal_budget, gender, avatar, ...profile } = json.user;

  console.log(meal_budget);
  console.log(json.budgets);

  //-----insert user's icon----
  let img = document.querySelector("#profile-pic");
  img.src = "/uploads/" + avatar;

  document.querySelector("#usernamee").textContent =
    "Hi! " + profile.username + " :)";
  //   let container = document.querySelector("input[name=username]");
  //   container.remove();
  //   let node = container.cloneNode(false);
  //   node.value = user.username;

  //   let username = document.querySelector(".username").textContent;
  //   console.log(username);
  //   username = user.username;

  VirtualSelect.init({
    ele: "#gender",
    selectedValue: gender,
    required: true,
    options: [
      { label: "M", value: "male" },
      { label: "F", value: "female" },
    ],
  });

  VirtualSelect.init({
    ele: "#sample-select",
    selectedValue: meal_budget,
    options: json.budgets.map((budget) => ({
      label: budget.price_range,
      value: budget.price_range,
    })),
  });

  for (let key in profile) {
    let node = inputTemplate.content.cloneNode(true);
    node.querySelector("label").textContent = key.replace(/_/g, " ");
    let input = node.querySelector("input");
    input.name = key;
    input.value = profile[key];
    inputList.appendChild(node);
    // document.querySelector(`input[name=${key}]`).value = user[key];
  }

  // locationList.textContent = json.selected_location_ids;
  let locationBtnGroup = locationList.querySelector(".btn-group");
  let locationBtnGroupItems = [];
  for (let location of json.locations) {
    let node = selectOptionTemplate.content.cloneNode(true);

    let id = "location-" + location.id;
    let label = node.querySelector("label");
    label.textContent = location.district;

    let input = node.querySelector("input");
    input.name = "location";
    input.value = location.id;

    input.id = id;
    label.htmlFor = id;

    let toggleLocation = function (selected) {
      if (selected) {
        label.classList.remove("btn-outline-primary");
        label.classList.add("btn-primary");
        input.checked = true;
      } else {
        label.classList.add("btn-outline-primary");
        label.classList.remove("btn-primary");
        input.checked = false;
      }
      checkLocations();
    };

    toggleLocation(json.selected_location_ids.includes(location.id));

    input.addEventListener("input", (e) => {
      toggleLocation(input.checked);
    });

    locationBtnGroup.appendChild(node);

    locationBtnGroupItems.push({ input, label, location });
    // document.querySelector(`input[name=${key}]`).value = user[key];
  }

  function checkLocations() {
    let count = 0;
    for (let { input } of locationBtnGroupItems) {
      if (input.checked) {
        count++;
      }
    }
    if (count >= 5) {
      for (let { input, label } of locationBtnGroupItems) {
        if (!input.checked) {
          input.disabled = true;
          label.classList.remove("btn-outline-primary");
          label.classList.add("btn-outline-secondary");
        }
      }
    } else {
      for (let { input, label } of locationBtnGroupItems) {
        input.disabled = false;
        label.classList.remove("btn-outline-secondary");
        if (!input.checked) {
          label.classList.add("btn-outline-primary");
        }
      }
    }
  }

  checkLocations();

  let cuisineBtnGroup = cuisineList.querySelector(".btn-group");
  let cuisineBtnGroupItems = [];
  for (let cuisine of json.cuisines) {
    let node = selectOptionTemplate.content.cloneNode(true);
    console.log(cuisine);
    let id = "cuisine-" + cuisine.id;
    let label = node.querySelector("label");
    label.textContent = cuisine.country;

    let input = node.querySelector("input");
    input.name = "cuisine";
    input.value = cuisine.id;

    input.id = id;
    label.htmlFor = id;

    let toggleCuisine = function (selected) {
      if (selected) {
        label.classList.remove("btn-outline-primary");
        label.classList.add("btn-primary");
        input.checked = true;
      } else {
        label.classList.add("btn-outline-primary");
        label.classList.remove("btn-primary");
        input.checked = false;
      }
      checkCuisines();
    };

    toggleCuisine(json.selected_cuisine_ids.includes(cuisine.id));

    input.addEventListener("input", (e) => {
      toggleCuisine(input.checked);
    });

    cuisineBtnGroup.appendChild(node);

    cuisineBtnGroupItems.push({ input, label, location });
    // document.querySelector(`input[name=${key}]`).value = user[key];
  }

  function checkCuisines() {
    let count = 0;
    for (let { input } of cuisineBtnGroupItems) {
      if (input.checked) {
        count++;
      }
    }
    if (count >= 5) {
      for (let { input, label } of cuisineBtnGroupItems) {
        if (!input.checked) {
          input.disabled = true;
          label.classList.remove("btn-outline-primary");
          label.classList.add("btn-outline-secondary");
        }
      }
    } else {
      for (let { input, label } of cuisineBtnGroupItems) {
        input.disabled = false;
        label.classList.remove("btn-outline-secondary");
        if (!input.checked) {
          label.classList.add("btn-outline-primary");
        }
      }
    }
  }
  checkCuisines();
}

getThemessage();

let newPersonalInfoForm = document.querySelector("#changeform");
async function changeInformation(event) {
  event.preventDefault();
  let form = newPersonalInfoForm;
  let res = await fetch(form.action, {
    method: form.method,
    body: new FormData(form),
  });
  let json = await res.json();
  if (json.error) {
    Swal.fire("Failed to change the personal information", json.error, "error");
    return;
  }
  Swal.fire("Your profile has been changed!", ":):):):):!", "success");
  console.log(json);
}

async function changeProfilePic() {
  const { value: file } = await Swal.fire({
    title: "Select image",
    input: "file",
    inputAttributes: {
      accept: "image/*",
      "aria-label": "Upload your profile picture",
    },
  });

  let formData = new FormData();
  formData.set("image", file);
  let res = await fetch("/user/avatar", {
    method: "PATCH",
    body: formData,
  });
  let json = await res.json();
  if (json.error) {
    Swal.fire("Failed to upload image:", json.error, "error");
    return;
  }

  document.querySelector("#profile-pic").src = "/uploads/" + json.filename;

  // if (file) {
  //   const reader = new FileReader();
  //   reader.onload = (e) => {
  //     Swal.fire({
  //       title: "Your uploaded picture",
  //       imageUrl: e.target.result,
  //       imageAlt: "The uploaded picture",
  //     });
  //   };
  //   reader.readAsDataURL(file);
  // }
}

async function logOut(event) {
  event.preventDefault();
  console.log("triggered");
  let form = event.target;
  let res = await fetch("/logout", { method: "POST" });
  let json = await res.json();
  Swal.fire("Log out success!", "You are logging out!", "success");
  window.setTimeout(function () {
    window.location.href = "http://localhost:8080/public/login.html";
  }, 1700);
  console.log("logout result", json);
}
