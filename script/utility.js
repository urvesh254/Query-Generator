const REGEX_PLACEHOLDER = /{.*?}/gm;
const REGEX_VALID_PLACEHOLDER = /^{[a-zA-Z0-9_]+}$/;
const NO_PLACEHOLDER_FOUND = `<tr><td colspan="2" style="text-align: center;">No placeholder found</td></tr>`;

function generateId() {
  return (
    Math.random().toString(36).substring(2) + new Date().getTime().toString(36)
  );
}

function showToast(message) {
  if (message == "") return;

  // Create a new toast element
  const toastElement = document.createElement("div");
  toastElement.classList.add("toast");
  toastElement.textContent = message;

  // Add the toast to the container
  const container = document.getElementById("toastContainer");
  container.appendChild(toastElement);

  // Show the toast
  setTimeout(() => {
    toastElement.classList.add("show");

    // Hide the toast after 3 seconds
    setTimeout(() => {
      toastElement.classList.remove("show");
      // Remove the toast from the DOM after transition ends
      toastElement.addEventListener("transitionend", () => {
        container.removeChild(toastElement);
      });
    }, 2500);
  }, 100);
}

function showAlert(message) {
  if (!message) return;
  document.getElementById("alertMessage").innerHTML = message;
  openAlert();
}

function addEvent(id, eventName, callback) {
  document.getElementById(id).addEventListener(eventName, callback);
}

function openAlert() {
  const overlay = document.getElementById("customAlertOverlay");
  const alertBox = document.getElementById("customAlert");
  overlay.style.display = "block";
  alertBox.style.display = "block";
  document.body.style.overflow = "hidden";
}

function closeAlert() {
  const overlay = document.getElementById("customAlertOverlay");
  const alertBox = document.getElementById("customAlert");
  overlay.style.display = "none";
  alertBox.style.display = "none";
  document.body.style.overflow = "";
}
