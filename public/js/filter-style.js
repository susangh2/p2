//  Filter Sidebar
/* Set the width of the sidebar to 250px (show it) */
function openNav() {
  document.getElementById("filterSidepanel").style.width = "100%";
}

/* Set the width of the sidebar to 0 (hide it) */
function closeNav() {
  document.getElementById("filterSidepanel").style.width = "0";
}

// Age Range Scroller --------------------------------------------------------------------------------
let rangeMin = 1;
const range = document.querySelector(".range-selected");
const rangeInput = document.querySelectorAll(".range-input input");
const rangePrice = document.querySelectorAll(".range-price input");

rangeInput.forEach((input) => {
  input.addEventListener("input", (e) => {
    let minRange = parseInt(rangeInput[0].value);
    let maxRange = parseInt(rangeInput[1].value);
    if (maxRange - minRange < rangeMin) {
      if (e.target.className === "min") {
        rangeInput[0].value = maxRange - rangeMin;
      } else {
        rangeInput[1].value = minRange + rangeMin;
      }
    } else {
      rangePrice[0].value = minRange;
      rangePrice[1].value = maxRange;
      range.style.left = (minRange / rangeInput[0].max) * 100 + "%";
      range.style.right = 100 - (maxRange / rangeInput[1].max) * 100 + "%";
    }
  });
});

rangePrice.forEach((input) => {
  input.addEventListener("input", (e) => {
    let minPrice = rangePrice[0].value;
    let maxPrice = rangePrice[1].value;
    if (maxPrice - minPrice >= rangeMin && maxPrice <= rangeInput[1].max) {
      if (e.target.className === "min") {
        rangeInput[0].value = minPrice;
        range.style.left = (minPrice / rangeInput[0].max) * 100 + "%";
      } else {
        rangeInput[1].value = maxPrice;
        range.style.right = 100 - (maxPrice / rangeInput[1].max) * 100 + "%";
      }
    }
  });
});

// Location Checkboxes ---------------------------------------------------------------------------------------

const districts = [
  "Islands",
  "Kwai Tsing",
  "North",
  "Sai Kung",
  "Sha Tin",
  "Tai Po",
  "Tsuen Wan",
  "Tuen Mun",
  "Yuen Long",
  "Kowloon City",
  "Kwun Tong",
  "Sham Shui Po",
  "Wong Tai Sin",
  "Yau Tsim Mong",
  "Central and Western",
  "Eastern",
  "Southern",
  "Wan Chai",
];

const cuisines = [
  "Chinese",
  "Cantonese",
  "Taiwanese",
  "Japanese",
  "Korean",
  "Thai",
  "Indonesian",
  "Indian",
  "Vietnamese",
  "American",
  "Italian",
  "French",
  "British",
  "Spanish",
  "German",
  "Belgian",
  "Portuguese",
  "Latin American",
  "Middle Eastern / Mediterranean",
];

function insertLabelInput(arr, containerName, labelName, inputName) {
  let container = document.querySelector(containerName);
  for (let i = 0; i < arr.length; i++) {
    let label = document.createElement("label");
    label.classList.add(labelName);
    let input = document.createElement("input");
    input.setAttribute("type", "checkbox");
    input.setAttribute("name", inputName);
    input.setAttribute("value", i + 1);
    label.appendChild(input);
    const space = document.createTextNode(String.fromCharCode(160));
    label.appendChild(space);
    label.appendChild(document.createTextNode(arr[i]));
    container.appendChild(label);
  }
}

insertLabelInput(cuisines, ".cuisine-container", "cuisine-label", "cuisine");
insertLabelInput(
  districts,
  ".location-container",
  "district-label",
  "location",
);

// Availability --------------------------------------------------------------------------------------------------------

// Availability Meal Filter

Array.prototype.search = function (elem) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == elem) return i;
  }

  return -1;
};

var Multiselect = function (selector) {
  if (!$(selector)) {
    console.error("ERROR: Element %s does not exist.", selector);
    return;
  }

  this.selector = selector;
  this.selections = [];

  (function (that) {
    that.events();
  })(this);
};

Multiselect.prototype = {
  open: function (that) {
    var target = $(that).parent().attr("data-target");

    // If we are not keeping track of this one's entries, then
    // start doing so.
    if (!this.selections) {
      this.selections = [];
    }

    $(this.selector + ".multiselect").toggleClass("active");
  },

  close: function () {
    $(this.selector + ".multiselect").removeClass("active");
  },

  events: function () {
    var that = this;

    $(document).on(
      "click",
      that.selector + ".multiselect > .title",
      function (e) {
        if (e.target.className.indexOf("close-icon") < 0) {
          that.open();
        }
      },
    );

    $(document).on(
      "click",
      that.selector + ".multiselect option",
      function (e) {
        var selection = $(this).attr("value");
        var target = $(this).parent().parent().attr("data-target");

        var io = that.selections.search(selection);

        if (io < 0) that.selections.push(selection);
        else that.selections.splice(io, 1);

        that.selectionStatus();
        that.setSelectionsString();
      },
    );

    $(document).on(
      "click",
      that.selector + ".multiselect > .title > .close-icon",
      function (e) {
        that.clearSelections();
      },
    );

    $(document).click(function (e) {
      const classString = e.target.className.toString();
      if (classString.indexOf("title") < 0) {
        if (classString.indexOf("text") < 0) {
          if (classString.indexOf("-icon") < 0) {
            if (
              classString.indexOf("selected") < 0 ||
              e.target.localName != "option"
            ) {
              that.close();
            }
          }
        }
      }
    });
  },

  selectionStatus: function () {
    var obj = $(this.selector + ".multiselect");

    if (this.selections.length) obj.addClass("selection");
    else obj.removeClass("selection");
  },

  clearSelections: function () {
    this.selections = [];
    this.selectionStatus();
    this.setSelectionsString();
  },

  getSelections: function () {
    return this.selections;
  },

  setSelectionsString: function () {
    var selects = this.getSelectionsString().split(", ");
    $(this.selector + ".multiselect > .title").attr("title", selects);

    var opts = $(this.selector + ".multiselect option");

    if (selects.length > 6) {
      var _selects = this.getSelectionsString().split(", ");
      _selects = _selects.splice(0, 6);
      $(this.selector + ".multiselect > .title > .text").text(
        _selects + " [...]",
      );
    } else {
      $(this.selector + ".multiselect > .title > .text").text(selects);
    }

    for (var i = 0; i < opts.length; i++) {
      $(opts[i]).removeClass("selected");
    }

    for (var j = 0; j < selects.length; j++) {
      var select = selects[j];

      for (var i = 0; i < opts.length; i++) {
        if ($(opts[i]).attr("value") == select) {
          $(opts[i]).addClass("selected");
          break;
        }
      }
    }
  },

  getSelectionsString: function () {
    if (this.selections.length > 0) return this.selections.join(", ");
    else return "Select Meal";
  },

  setSelections: function (arr) {
    if (!arr[0]) {
      error("ERROR: This does not look like an array.");
      return;
    }

    this.selections = arr;
    this.selectionStatus();
    this.setSelectionsString();
  },
};

$(document).ready(function () {
  var multi = new Multiselect("#meals");
});
