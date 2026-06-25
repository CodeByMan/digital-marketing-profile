document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#contact-form");
  const status = document.querySelector("#contact-form-status");

  if (!form || !status) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      status.textContent = "Please complete all required fields.";
      return;
    }

    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const subject = String(formData.get("subject") || "").trim();
    const message = String(formData.get("message") || "").trim();

    const emailSubject = encodeURIComponent(`Portfolio enquiry: ${subject}`);
    const emailBody = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    );

    status.textContent = "Opening your email application…";

    window.location.href =
      `mailto:muhammadalinawaz.dev@gmail.com` +
      `?subject=${emailSubject}&body=${emailBody}`;
  });
});
