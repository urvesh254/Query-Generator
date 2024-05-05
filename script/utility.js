const REGEX_PLACEHOLDER = /{[a-zA-Z0-9_]+}/gm;
const REGEX_VALID_PLACEHOLDER = /^{[a-zA-Z0-9_]+}$/;
const NO_PLACEHOLDER_FOUND = `<tr><td colspan="3" style="text-align: center;">No placeholder found</td></tr>`;
const MAX_OUTPUT_SIZE_IN_MB = 3; //

function generateId() {
  return (
    Math.random().toString(36).substring(2) + new Date().getTime().toString(36)
  );
}

function showToast(message, delay = 2500) {
  if (message == "") return;

  // Create a new toast element
  const toastElement = document.createElement("div");
  toastElement.classList.add("toast");
  toastElement.innerHTML = message;

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
    }, delay);
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
  document.getElementById("closeAlert").focus();
}

function closeAlert() {
  const overlay = document.getElementById("customAlertOverlay");
  const alertBox = document.getElementById("customAlert");
  overlay.style.display = "none";
  alertBox.style.display = "none";
  document.body.style.overflow = "";
}

function getStringSizeInMB(str) {
  // Get the byte length of the string
  const byteLength = new Blob([str]).size;

  // Convert bytes to megabytes
  const megabytes = byteLength / (1024 * 1024);

  return megabytes;
}

function downloadFile(content, filename = "output.txt") {
  const blob = new Blob([content], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename || "output.txt";
  link.click();

  URL.revokeObjectURL(link.href);
}

function showLoading(message = "Output Generating...") {
  const loadingOverlay = document.querySelector(".loading-overlay");
  loadingOverlay.querySelector(".loading-text").innerHTML = message;
  loadingOverlay.classList.add("loading");
  document.body.style.overflow = "hidden";
}

function hideLoading() {
  const loadingOverlay = document.querySelector(".loading-overlay");
  loadingOverlay.classList.remove("loading");
  document.body.style.overflow = "";
}
