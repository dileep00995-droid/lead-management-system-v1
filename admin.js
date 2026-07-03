// =============================
// Configuration
// =============================

const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbxSrTngCSq8H7qitmGlAEck-M9Ny0IIT9pjgeZXD5x9gEjX_f60iTXxscvxKc9tMh-d5w/exec";
const OWNER_NAME = "Himank";
// =============================
// WhatsApp Number
// =============================

const phoneInput = document.querySelector("#phone");
const submitBtn = document.querySelector(".submit-btn");

const iti = window.intlTelInput(phoneInput, {
  initialCountry: "in",
  preferredCountries: ["in", "us", "gb"],
  separateDialCode: true,
  strictMode: true,
  loadUtils: () =>
    import("https://cdn.jsdelivr.net/npm/intl-tel-input@25.3.0/build/js/utils.js"),
});

// =============================
// Country Dropdown
// =============================

async function loadCountries() {
  const response = await fetch("data/countries.json");
  const countries = await response.json();

  countries.sort((a, b) => a.name.localeCompare(b.name));

  const country = document.getElementById("country");

  country.innerHTML = "";

  countries.forEach((c) => {
    const option = document.createElement("option");

    option.value = c.name;
    option.textContent = `${c.emoji} ${c.name}`;

    country.appendChild(option);
  });

  new TomSelect("#country", {
    create: false,
    placeholder: "Search Country...",
  });
}

loadCountries();
function showError(id, message) {
  document.getElementById(id + "Error").textContent = message;

  document.getElementById(id).classList.add("input-error");
}

function clearError(id) {
  document.getElementById(id + "Error").textContent = "";

  document.getElementById(id).classList.remove("input-error");
}

// =============================
// Submit Form
// =============================

document
  .getElementById("leadForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    let isValid = true;

    clearError("fullName");

    const fullNameInput = document.getElementById("fullName");
    const fullName = fullNameInput.value.trim();

    if (fullName === "") {
      showError("fullName", "Full Name is required.");

      isValid = false;
    } else {
      clearError("fullName");
    }
    clearError("email");

    const email = document.getElementById("email").value.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email === "") {
      showError("email", "Email is required.");

      isValid = false;
    } else if (!emailRegex.test(email)) {
      showError("email", "Enter a valid email address.");

      isValid = false;
    } else {
      clearError("email");
    }
    clearError("country");

    const country = document.getElementById("country").value;

    if (country === "") {
      showError("country", "Please select a country.");

      isValid = false;
    } else {
      clearError("country");
    }
    // WhatsApp Validation

    clearError("phone");

    const phone = phoneInput.value.trim();

    if (phone === "") {

    showError("phone", "WhatsApp Number is required.");

    isValid = false;

} else if (phone.length < 8) {

    showError("phone", "Please enter a valid WhatsApp Number.");

    isValid = false;

} else {

    clearError("phone");

}
    // Certification Validation

    clearError("certification");

    const certification = document.getElementById("certification").value;

    if (certification === "") {
      showError("certification", "Please select a certification.");

      isValid = false;
    } else {
      clearError("certification");
    }
    // Other Certification Validation

clearError("otherCertification");

if (certification === "Other") {

    const otherCertification = document
        .getElementById("otherCertification")
        .value
        .trim();

    if (otherCertification === "") {

        showError(
            "otherCertification",
            "Please enter certification name."
        );

        isValid = false;

    } else {

        clearError("otherCertification");

    }

}
    if (!isValid) return;



submitBtn.disabled = true;
submitBtn.innerHTML =
    '<span class="spinner"></span>Submitting...';
    const data = {
  fullName: document.getElementById("fullName").value,

  email: document.getElementById("email").value,

  country: document.getElementById("country").value,

  whatsapp:
    "'" +
    "+" +
    iti.getSelectedCountryData().dialCode +
    phoneInput.value.replace(/\s/g, ""),

  certification:
    document.getElementById("certification").value === "Other"
      ? document.getElementById("otherCertification").value
      : document.getElementById("certification").value,

  chatTime: document.getElementById("chatTime").value,

  comments: document.getElementById("comments").value,

  owner: OWNER_NAME
};

    try {
        console.log("OWNER_NAME:", OWNER_NAME);
console.log("Data being sent:", data);
      const response = await fetch(WEB_APP_URL, {
        method: "POST",

        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {

    document.getElementById("leadForm").style.display = "none";

document.getElementById("thankYouScreen").style.display = "block";

    document.getElementById("leadForm").reset();

    document.getElementById("otherCertificationGroup").style.display = "none";

    document.getElementById("otherCertification").value = "";

    document.getElementById("country").tomselect.clear(true);

    submitBtn.disabled = false;

    submitBtn.textContent = "Submit";

} else {

    submitBtn.disabled = false;

    submitBtn.textContent = "Submit";

    alert(result.message);

}
    } catch (error) {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit";

    console.error(error);

    alert(error.message);
}
  });
const certification = document.getElementById("certification");
const otherCertificationGroup = document.getElementById(
  "otherCertificationGroup",
);

certification.addEventListener("change", function () {
  if (this.value === "Other") {
    otherCertificationGroup.style.display = "block";
  } else {
    otherCertificationGroup.style.display = "none";

    document.getElementById("otherCertification").value = "";
  }
});
document
    .getElementById("newResponseBtn")
    .addEventListener("click", function () {

        document.getElementById("thankYouScreen").style.display = "none";

        document.getElementById("leadForm").style.display = "block";

        document.getElementById("leadForm").reset();

        document.getElementById("country").tomselect.clear(true);

        document.getElementById("otherCertificationGroup").style.display = "none";
        submitBtn.disabled = false;
submitBtn.textContent = "Submit";

    });
