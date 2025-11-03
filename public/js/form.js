// ===============================
// Property Manager Form Handling
// ===============================

// Global callback for when a form is submitted successfully
let formsubmitcallback;

// Ensure DOM is ready before event bindings
document.addEventListener("DOMContentLoaded", async function () {

  // Attach close functionality to all Cancel buttons
  const closeelements = document.querySelectorAll(".close");
  closeelements.forEach(element => {
    element.addEventListener("click", (e) => {
      e.preventDefault();
      closallforms();
    });
  });

  // Handle all form submissions
  const formelements = document.querySelectorAll("form");
  formelements.forEach(element => {
    element.addEventListener("submit", (e) => {
      e.preventDefault();

      // Close the overlay correctly (hide modal + overlay)
      const overlay = element.closest(".modal-overlay");
      if (overlay) overlay.style.display = "none";

      // Show main content again
      document.getElementById("content").style.display = "block";

      // Execute callback if defined
      if (formsubmitcallback) formsubmitcallback();

      // Clear the form after submission
      element.reset();
    });
  });
});

// ====================================
// Utility Functions
// ====================================

/**
 * Hide all open modals and restore main content
 */
function closallforms() {
  document.querySelectorAll(".modal-overlay").forEach((element) => {
    element.style.display = "none";
  });
  document.getElementById("content").style.display = "block";
}

/**
 * Show a specific form modal by its ID
 * @param {string} formid - The HTML id of the form overlay div
 * @param {Function} onsubmit - Callback to execute after successful form submission
 */
export function showform(formid, onsubmit) {
  // Hide main content
  document.getElementById("content").style.display = "none";

  // Show specific modal overlay
  const form = document.getElementById(formid);
  if (form) {
    form.style.display = "flex"; // ensures center alignment via flexbox
  }

  // Set the global callback for when this form is submitted
  formsubmitcallback = onsubmit;
}

/**
 * Get the current value of an input field or textarea
 * @param {string} formitemid
 * @returns {string}
 */
export function getformfieldvalue(formitemid) {
  const field = document.getElementById(formitemid);
  return field ? field.value : "";
}

/**
 * Set a value for an input field or textarea
 * @param {string} formitemid
 * @param {string} value
 */
export function setformfieldvalue(formitemid, value) {
  const field = document.getElementById(formitemid);
  if (field) field.value = value;
}

/**
 * Clear all input and textarea fields inside a given form
 * @param {string} formid
 */
export function clearform(formid) {
  const form = document.getElementById(formid);
  if (!form) return;

  form.querySelectorAll("input").forEach(input => input.value = "");
  form.querySelectorAll("textarea").forEach(input => input.value = "");
}

/**
 * Get the <tbody> element of a table
 * @param {string} formid
 * @returns {HTMLTableSectionElement|null}
 */
export function gettablebody(formid) {
  const table = document.getElementById(formid);
  return table ? table.getElementsByTagName("tbody")[0] : null;
}

/**
 * Clear all table rows (except header)
 * @param {string} formid
 */
export function cleartablerows(formid) {
  const table = document.getElementById(formid);
  if (!table) return;

  const rows = table.getElementsByTagName("tr");
  for (let i = rows.length - 1; i > 0; i--) {
    table.deleteRow(i);
  }
}

function fadeOutModal(overlay) {
  overlay.style.transition = "opacity 0.25s ease";
  overlay.style.opacity = "0";
  setTimeout(() => {
    overlay.style.display = "none";
    overlay.style.opacity = "1";
  }, 250);
}
