function setCookie(name, value,minutes=86400000) {
    const date = new Date();
    date.setTime(date.getTime() +minutes ); // 24 hours 
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
  }
  
  function getCookie(name) {
    const nameEQ = name + "=";
    const cookiesArray = document.cookie.split(';');
    for (let i = 0; i < cookiesArray.length; i++) {
        let cookie = cookiesArray[i];
        while (cookie.charAt(0) === ' ') cookie = cookie.substring(1, cookie.length);
        if (cookie.indexOf(nameEQ) === 0) return cookie.substring(nameEQ.length, cookie.length);
    }
    return null;
  }
  
  function deleteCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }

  // Validation functions
function validateRegistrationForm(email, password, name, phone, address, state) {
  const errors = [];

  if (!email || !password || !name || !phone || !address || !state) {
      errors.push('All fields are required.');
  }

  if (!validateEmail(email)) {
      errors.push('Invalid email format.');
  }

  if (password.length < 6) {
      errors.push('Password must be at least 6 characters long.');
  }

  if (!/^\d{10}$/.test(phone)) {
      errors.push('Phone number must be exactly 10 digits.');
  }

  return errors;
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

function validateLoginForm(email, password) {
  const errors = [];

  if (!email || !password) {
      errors.push('All fields are required.');
  }

  if (!validateEmail(email)) {
      errors.push('Invalid email format.');
  }

  return errors;
}

function validupdate(name, phone, address, state) {
  const errors = [];

  if (!name || !phone || !address || !state) {
      errors.push('All fields are required.');
  }

  if (!/^[a-zA-Z\s]+$/.test(name)) {
      errors.push('Name must contain only letters and spaces.');
  }

  if (!/^\d{10}$/.test(phone)) {
      errors.push('Phone number must be a 10-digit number.');
  }

  return errors;
}