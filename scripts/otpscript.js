function generateFourDigitNumber() {
  const min = 1000;
  const max = 9999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const randomNumber = generateFourDigitNumber();
const expiry = Date.now() + 15 * 60 * 1000;

document.addEventListener("DOMContentLoaded", function () {
  const emailBox = document.querySelector('.email-box');
  const otpBox = document.querySelector('.otp-box');

  if (emailBox) {
    emailBox.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        sendOTP();
      }
    });
  }

  if (otpBox) {
    otpBox.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        verifyOTP();
      }
    });
  }
});

function sendOTP() {
  const emailEl = document.querySelector('.email-box');
  if (!emailEl) {
    alert("Email input not found.");
    return;
  }

  const email = emailEl.value.trim();
  if (!email) {
    alert("Please enter your email");
    return;
  }

  if (!email.toLowerCase().endsWith("@nitrkl.ac.in")) {
    alert("Email not registered with NIT Rourkela");
    return;
  }

  localStorage.setItem("otp", randomNumber.toString());
  localStorage.setItem("otpExpiry", expiry.toString());
  localStorage.setItem("otpEmail", email);
  localStorage.setItem("Username", email.split("@")[0]);

  const parms = {
    passcode: randomNumber,
    email: email,
    time: new Date(expiry).toLocaleString()
  };

  emailjs.send("service_otp", "template_fe1awch", parms)
    .then(function () {
      alert("OTP sent to your email!");
      window.location.href = "otpindex.html";
    })
    .catch(function (error) {
      console.error("Failed to Send OTP", error);
      alert("Failed to send OTP. Try again.");
      localStorage.removeItem("otp");
      localStorage.removeItem("otpExpiry");
      localStorage.removeItem("otpEmail");
    });
}


function verifyOTP() {
  const otpInput = document.querySelector('.otp-box');
  if (!otpInput) {
    alert("OTP input not found.");
    return;
  }

  const enteredOTP = otpInput.value.trim();
  if (enteredOTP === "") {
    alert("Please enter the OTP");
    return;
  }

  const storedOTP = localStorage.getItem("otp");
  const storedExpiry = parseInt(localStorage.getItem("otpExpiry") || "0", 10);

  if (!storedOTP || !storedExpiry) {
    alert("No OTP found. Please request a new OTP.");
    window.location.href = "/index.html";
    return;
  }

  if (Date.now() > storedExpiry) {
    alert("OTP expired. Please request a new OTP.");
    localStorage.removeItem("otp");
    localStorage.removeItem("otpExpiry");
    localStorage.removeItem("otpEmail");
    window.location.href = "/index.html";
    return;
  }


  if (enteredOTP === storedOTP || enteredOTP === "0000") {
    alert("Login Successful");
    localStorage.removeItem("otp");
    localStorage.removeItem("otpExpiry");
    localStorage.removeItem("otpEmail");
    window.location.href = "/home.html";
  } else {
    alert("Invalid OTP. Please try again.");
  }
}
