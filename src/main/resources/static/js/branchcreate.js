
  
  const toast = new bootstrap.Toast(document.getElementById('liveToast'));
  const form = document.getElementById("branchForm");
 

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (form.checkValidity()) {
      toast.show();
      // You can send data via AJAX here if needed
    } else {
      form.reportValidity();
    }
  });

 
  let userData = {};
  
  function populateUserData() {
	   	 userData = JSON.parse(sessionStorage.getItem('user'));
	   	 document.getElementById('userFirstName').textContent = userData.firstName;
	document.getElementById('userLastName').textContent = userData.lastName;
	   	 
	   	 //document.getElementById('userFullName').textContent = userData.firstName+" "+userData.lastName;
	       //document.getElementById('companyLogo').src = userData.companyAndBranchDeatils.companyLogo;
	       //document.getElementById('branchresult').textContent = userData.companyAndBranchDeatils.branchName+"-["+userData.companyAndBranchDeatils.branchType+"]";
	     
	   }
 
	    // Toggle the dropdown visibility
	    function toggleDropdown() {
	        const dropdown = document.getElementById('userDropdownContent');
	        dropdown.style.display = (dropdown.style.display === 'block') ? 'none' : 'block';
	    }

	 

	    // Change Password Form (you can define your logic here)
	    function showChangePasswordForm() {
	       
	    }
	  document.addEventListener("DOMContentLoaded", function() {
	const branchLink = document.getElementById("createBranchLink");

	if (branchLink) {
		branchLink.addEventListener("click", function(event) {
			event.preventDefault(); // Prevent default anchor behavior
			redirectToBranch();
		});
	}
});

function redirectToBranch() {
	// Redirect to Java backend endpoint
	window.location.href = "/branchcreate"; // Change to your actual endpoint path
}
	    function redirectToHome() {
	    	window.location.href = "/home";
	    }
	    
	    function createEmployee() {
			window.location.href = "/createEmployee";
		}
	    // Logout Function (you can define your logic here)
	    function logout() {
	    	sessionStorage.removeItem('user');  // Remove the stored user object from sessionStorage
	    	window.location.href = "/";
	    }
	    document.getElementById("branchForm").addEventListener("submit", async function (e) {
	        e.preventDefault();

	       
	        const branchData = {
	          branchCode:  document.getElementById("branchcode").value,
	          branchName:  document.getElementById("branchname").value,
	          branchType:  document.getElementById("branchType").value,
	          branchOpperations:  document.getElementById("opperations").value,
	          branchPan:  document.getElementById("pan").value,
	          branchPhone:  document.getElementById("phone").value,
	          gstIn:  document.getElementById("gstin").value,
	          branchEmail:  document.getElementById("email").value,
	          contactPersonName:  document.getElementById("contactperson").value,
	          branchCreatedBy:  userData.firstName,
	          companyCode:  userData.companyAndBranchDeatils.companyCode,
	          branchAddress: {
	            flatOrApartmentNumber:  document.getElementById("flatorapartmentNumber").value,
	            areaOrStreetline:  document.getElementById("AddressStreet").value,
	            landMark:  document.getElementById("landmark").value,
	            city:  document.getElementById("city").value,
	            state: document.getElementById("state").value,
	            postalCode:  document.getElementById("postalCode").value,
	          

	          }
	        };
	        try {
	        const response = await fetch("/createBranch", {
	          method: "POST",
	          headers: {
	            "Content-Type": "application/json"
	          },
	          body: JSON.stringify(branchData)
	        });
	        const result = await response.json();
            const responseMessage = document.getElementById('responseMessage');
            if (response.ok && result.status === 'SUCCESS') {
                responseMessage.textContent = 'Branch creation successfully!';
                responseMessage.className = 'response-message success';
                showToast('Branch created successfully!');
               
                window.location.reload();
            } else {
                responseMessage.textContent = 'Branch creation failed. Please try again.';
                responseMessage.className = 'response-message failure';
                showToast('Branch creation failed. Please try again.', false);
               
            }
	        }
	     catch (error) {
            document.getElementById('responseMessage').textContent = 'An error occurred. Please try again later.';
            document.getElementById('responseMessage').className = 'response-message failure';
            document.getElementById('responseMessage').style.display = 'block';
            showToast('An error occurred. Please try again later.', false);
            window.location.reload();
        }
	    });
	    
	    function showToast(message, isSuccess = true) {
	        const toastElement = document.getElementById('liveToast');
	        const toastBody = toastElement.querySelector('.toast-body');
	        const toastHeader = toastElement.querySelector('.toast-header strong');

	        toastBody.textContent = message;
	        toastHeader.textContent = isSuccess ? 'Success' : 'Error';
	        toastElement.classList.remove('bg-danger', 'bg-success');
	        toastElement.classList.add(isSuccess ? 'bg-success' : 'bg-danger');

	        const toast = new bootstrap.Toast(toastElement);
	        toast.show();
	    }
	    
	  //Function to validate branch code
	    async function validateBranchCode(branchCode) {
	        try {
	            // Send API request to validate branch code
	            
	             const response = await fetch('/validate-branch-code?branchCode=' + branchCode, {
	                method: 'GET',
	            });
	              const data = await response.json();      
	            document.getElementById('branchCodeError').textContent = data.status;
	        } catch (error) {
	            document.getElementById('branchCodeError').textContent = 'Error validating branch code. Please try again later.';
	            document.getElementById('branchCodeError').style.color = 'red';
	        }
	    }

	    // Event listener to trigger validation on branch code input
	    document.getElementById('branchcode').addEventListener('focus', function () {
	        const branchCode = this.value.trim();
	        if (branchCode) {
	            validateBranchCode(branchCode);
	        }
	    });
	    
	  //Function to generate branch code based on company code and branch name
	   async function generateBranchCode() {
	        const branchName = document.getElementById("branchname").value.trim();
	        const companyCode = userData.companyAndBranchDeatils.companyCode;

	        // Check if both companyCode and branchName are entered
	        if (branchName && companyCode) {
	            // Take first two letters of the branch name and combine with company code
	            const branchCode = branchName.substring(0, 2).toUpperCase() + companyCode.toUpperCase();
	            document.getElementById("branchcode").value = branchCode;
	        } else {
	            // Clear the branch code if either of the fields are empty
	            document.getElementById("branchcode").value = "";
	        }
	    }

	    // Event listener for branchCode input box to populate automatically when clicked
	    document.getElementById('branchcode').addEventListener('focus', function () {
	        // Only populate branchCode if it's empty (i.e., not manually edited yet)
	        if (!this.value) {
	            generateBranchCode();
	        }
	    });
	    
	  //Function to fetch city and state based on postal code
	    async function fetchCityState(postalCode) {
	        try {
	            const response = await fetch(`https://api.postalpincode.in/pincode/${postalCode}`);
	            const data = await response.json();
	            const postalData = data[0];
	            
	            if (postalData.Status === "Success") {
	                const cityList = postalData.PostOffice;
	                const state = postalData.PostOffice[0].State;
	                let citiesHtml = '';

	                // If there are multiple cities, show them as a dropdown
	                cityList.forEach(city => {
	                    citiesHtml += `<div class="city-item" onclick="selectCity('${city.Name}')">${city.Name}</div>`;
	                });

	                document.getElementById("state").value = state;
	                const cityDropdown = document.getElementById("cityDropdown");
	                if (citiesHtml) {
	                    cityDropdown.innerHTML = citiesHtml;
	                    cityDropdown.style.display = 'block';
	           }
	            } else {
	                document.getElementById("postalCodeError").innerText = "Invalid Postal Code. Please try again.";
	              document.getElementById("state").value = '';
	                document.getElementById("city").value = '';
	              document.getElementById("cityDropdown").style.display = 'none';
	           }
	        } catch (error) {
	            document.getElementById("postalCodeError").innerText = "Error fetching postal code details.";
	            document.getElementById("cityDropdown").style.display = 'none';
	        }
	    }

	    // Event listener for postal code input
	    document.getElementById('postalCode').addEventListener('blur', function () {
	        const postalCode = this.value.trim();
	        if (postalCode) {
	            fetchCityState(postalCode);
	        }
	    });

	    // Function to select a city from the dropdown
	    function selectCity(cityName) {
	        document.getElementById('city').value = cityName;
	        document.getElementById('cityDropdown').style.display = 'none';
	    }

	    // Event listener for city input to toggle the dropdown visibility
	    document.getElementById('city').addEventListener('focus', function () {
	        const postalCode = document.getElementById('postalCode').value.trim();
	        if (postalCode) {
	            fetchCityState(postalCode);
	        }
	    });