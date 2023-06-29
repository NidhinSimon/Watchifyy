function validateForm() {
    // Check if all required fields are filled out.
    if (document.getElementById("email").value == "" || document.getElementById("password").value == "") {
      alert("Please fill out all required fields.");
      return false;
    }
  
    // Validate the email address.
    if (!validateEmail(document.getElementById("email").value)) {
      alert("Please enter a valid email address.");
      return false;
    }
  
    // Validate the password.
    if (!validatePassword(document.getElementById("password").value)) {
      alert("Please enter a valid password.");
      return false;
    }
  
    // All fields are valid, so submit the form.
    document.getElementById("form").submit();
  }
  
  function validateEmail(email) {
    // Regular expression to check for a valid email address.
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  
    // Return true if the email address is valid, false otherwise.
    return re.test(email);
  }
  
  function validatePassword(password) {
    // Regular expression to check for a valid password.
    var re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  
    // Return true if the password is valid, false otherwise.
    return re.test(password);
  }