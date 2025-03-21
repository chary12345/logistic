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

    // Basic validation: Check if any field is empty
    if (!username || !password || !group || !captchaInput) {
        errorMsg.textContent = "All fields are required!";
        return;
    }

    // Validate the captcha input
    if (captchaInput !== captchaText) {
        errorMsg.textContent = "Invalid Captcha!";
        return;
    }

    // Clear any previous error messages
    errorMsg.textContent = "";

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
            alert("Login Successful!");
            window.location.href = "bookings"; // Adjust the URL to your bookings page
        } else {
            // If the login failed, display the server's error message
            errorMsg.textContent = data.message || "Login failed. Please try again.";
           window.location.href = "/"; // Adjust the URL to your bookings page
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
