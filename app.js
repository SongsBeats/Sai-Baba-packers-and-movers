const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#main-nav");
function closeMenu() {
  navigation.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
}
menuToggle.addEventListener("click", () => {
  const open = menuToggle.getAttribute("aria-expanded") !== "true";
  navigation.classList.toggle("is-open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute(
    "aria-label",
    open ? "Close navigation" : "Open navigation",
  );
});
navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".header-inner")) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    menuToggle.getAttribute("aria-expanded") === "true"
  ) {
    closeMenu();
    menuToggle.focus();
  }
});
window.matchMedia("(min-width: 1101px)").addEventListener("change", closeMenu);

document.querySelectorAll("[data-service]").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelector("#move-service").value = link.dataset.service;
  });
});

const dateInput = document.querySelector("#move-date");
const today = new Date();
const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
dateInput.min = localDate;
document.querySelector("#current-year").textContent = today.getFullYear();

const form = document.querySelector("#quote-form");
const phoneInput = document.querySelector("#customer-phone");
const phoneError = document.querySelector("#phone-error");
function validatePhone() {
  let digits = phoneInput.value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  const valid = /^[6-9]\d{9}$/.test(digits);
  phoneInput.setCustomValidity(
    valid || !phoneInput.value
      ? ""
      : "Enter a valid 10-digit Indian mobile number.",
  );
  phoneError.hidden = valid || !phoneInput.value;
  phoneInput.setAttribute("aria-invalid", String(!valid && !!phoneInput.value));
  if (!valid && phoneInput.value)
    phoneInput.setAttribute("aria-describedby", "phone-error");
  else phoneInput.removeAttribute("aria-describedby");
  return valid;
}
phoneInput.addEventListener("input", validatePhone);
form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!validatePhone() || !form.reportValidity()) return;
  const data = new FormData(form);
  const name = String(data.get("customerName")).trim();
  const from = String(data.get("from")).trim();
  const to = String(data.get("to")).trim();
  if (!name || !from || !to) {
    const emptyInput = [...form.querySelectorAll("input[required]")].find(
      (input) => !input.value.trim(),
    );
    emptyInput?.setCustomValidity("Please fill in this detail.");
    emptyInput?.reportValidity();
    return;
  }
  const date = data.get("date");
  const dateLabel = date
    ? new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "To be discussed";
  const message = [
    "Hello Sai Baba Packers and Movers,",
    "",
    "I would like to discuss a move.",
    `Name: ${name}`,
    `Phone: ${String(data.get("phone")).trim()}`,
    `Moving from: ${from}`,
    `Moving to: ${to}`,
    `Preferred date: ${dateLabel}`,
    `Service: ${data.get("service")}`,
    "",
    "Please let me know the availability and quote details.",
  ].join("\n");
  const url = `https://wa.me/917799451430?text=${encodeURIComponent(message)}`;
  document.querySelector("#whatsapp-fallback").href = url;
  document.querySelector("#form-status").hidden = false;
  window.open(url, "_blank", "noopener,noreferrer");
});
form.querySelectorAll('input[required]:not([type="tel"])').forEach((input) => {
  input.addEventListener("input", () => input.setCustomValidity(""));
});

const gallery = [
  {
    src: "assets/images/two-moving-trucks.webp",
    alt: "Two orange moving trucks ready for household transport",
    caption: "Ready for the road",
  },
  {
    src: "assets/images/packed-household-load.webp",
    alt: "Household furniture wrapped and arranged inside a moving vehicle",
    caption: "Every piece, protected",
  },
  {
    src: "assets/images/wrapped-bed-headboard.webp",
    alt: "A wooden bed headboard covered in protective wrapping",
    caption: "Packed with attention",
  },
  {
    src: "assets/images/loaded-moving-truck.webp",
    alt: "A moving truck loaded with household belongings, seen from above",
    caption: "A place for everything",
  },
];
const galleryDialog = document.querySelector("#gallery-dialog");
let galleryIndex = 0;
function showPhoto(index) {
  galleryIndex = (index + gallery.length) % gallery.length;
  const photo = gallery[galleryIndex];
  const image = document.querySelector("#gallery-image");
  image.src = photo.src;
  image.alt = photo.alt;
  document.querySelector("#gallery-caption").textContent = photo.caption;
  document.querySelector("#gallery-counter").textContent =
    `${galleryIndex + 1} / ${gallery.length}`;
}
document.querySelectorAll("[data-gallery]").forEach((button) => {
  button.addEventListener("click", () => {
    showPhoto(Number(button.dataset.gallery));
    galleryDialog.showModal();
  });
});
document
  .querySelector("[data-gallery-prev]")
  .addEventListener("click", () => showPhoto(galleryIndex - 1));
document
  .querySelector("[data-gallery-next]")
  .addEventListener("click", () => showPhoto(galleryIndex + 1));
document
  .querySelector("[data-close-gallery]")
  .addEventListener("click", () => galleryDialog.close());
galleryDialog.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    event.preventDefault();
    showPhoto(galleryIndex + 1);
  }
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    showPhoto(galleryIndex - 1);
  }
});
const privacyDialog = document.querySelector("#privacy-dialog");
document
  .querySelector(".privacy-trigger")
  .addEventListener("click", () => privacyDialog.showModal());
document
  .querySelector("[data-close-privacy]")
  .addEventListener("click", () => privacyDialog.close());
[galleryDialog, privacyDialog].forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      dialog.close();
  });
});
