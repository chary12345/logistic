// Generate captcha text when the page is loaded
function generateCaptcha() {
    const captchaText = Math.random().toString(36).substring(2, 8).toUpperCase();
    document.getElementById("captcha-text").textContent = captchaText;
}

// Validate the login form and send data to the server via fetch API
async function validateLogin() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let group = document.getElementById("group").value;
    let captchaInput = document.getElementById("captcha-input").value;
    let captchaText = document.getElementById("captcha-text").textContent;
    let errorMsg = document.getElementById("error-msg");
    let usernameError = document.getElementById("username-error");
    let passwordError = document.getElementById("password-error");
    let groupError = document.getElementById("group-error");
    let captchaError = document.getElementById("captcha-error");

    // Reset error messages
    errorMsg.textContent = "";
    usernameError.style.display = "none";
    passwordError.style.display = "none";
    groupError.style.display = "none";
    captchaError.style.display = "none";

    let isValid = true;

    // Basic client side validation: Check if any field is empty
    if (!username) {
        usernameError.style.display = "block";
        isValid = false;
    }
    if (!password) {
        passwordError.style.display = "block";
        isValid = false;
    }
    if (!group) {
        groupError.style.display = "block";
        isValid = false;
    }
    if (captchaInput !== captchaText) {
        captchaError.style.display = "block";
        isValid = false;
    }

    if (!isValid) {
        return; // Stop if client-side validation fails
    }

    // Create the login data object
    let loginData = {
        username: username,
        password: password,
        group: group,
        captcha: captchaInput
    };

    try {
        // Send the login data to the server using fetch API
        let response = await fetch("http://localhost:8080/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(loginData)
        });

        // Parse the response from the server
        let data = await response.json();

        // Check if the login was successful
        if (response.ok) {
              
            if (data.userData) {
                    sessionStorage.setItem('user', JSON.stringify(data.userData));
                    window.location.href = "bookings";
                } else {
                    alert('Error: User data not found');
                    window.location.href = "/";
                }
            window.location.href = "bookings"; // Adjust the URL to your bookings page
        } else {
            // If the login failed, display the server's error message
            errorMsg.textContent = data.message || "Login failed. Please try again.";
        }
    } catch (error) {
        // Handle any network errors
        console.error("Error:", error);
        errorMsg.textContent = "An error occurred. Please try again later.";
    }
}

// Add the event listener to generate the captcha when the page loads
document.addEventListener("DOMContentLoaded", function() {
    generateCaptcha();  // Call this to generate the captcha when the page loads
});