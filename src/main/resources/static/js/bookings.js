function showBookingForm() {
	document.getElementById('bookingFormContainer').style.display = 'block';
	document.getElementById('bookingReportForm').style.display = 'none';
	document.getElementById('CreateBranchContainer').style.display = 'none';
	hideChangePasswordForm(); // Ensure password form is hidden
}

function showCreateBranchForm() {
	document.getElementById('CreateBranchContainer').style.display = 'block';
	document.getElementById('bookingFormContainer').style.display = 'none';
	document.getElementById('bookingReportForm').style.display = 'none';
	hideChangePasswordForm(); // Hide the change password form if open
}



document.getElementById("branchForm").addEventListener("submit", async function(e) {
	e.preventDefault();

 validateBranchForm();

    if (!formValid) {
      showToast("Please fix all form errors before submitting.", false);
      return;
    }

	const branchData = {
		branchCode: document.getElementById("branchcode").value,
		branchName: document.getElementById("branchname").value,
		branchType: document.getElementById("branchType").value,
		branchOpperations: document.getElementById("opperations").value,
		branchPan: document.getElementById("pan").value,
		branchPhone: document.getElementById("phone").value,
		gstIn: document.getElementById("gstin").value,
		branchEmail: document.getElementById("email").value,
		contactPersonName: document.getElementById("contactperson").value,
		branchCreatedBy: userData.firstName,
		companyCode: userData.companyAndBranchDeatils.companyCode,
		branchAddress: {
			flatOrApartmentNumber: document.getElementById("flatorapartmentNumber").value,
			areaOrStreetline: document.getElementById("AddressStreet").value,
			landMark: document.getElementById("landmark").value,
			city: document.getElementById("city").value,
			state: document.getElementById("state").value,
			postalCode: document.getElementById("postalCode").value,


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
		/*const responseMessage = document.getElementById('responseMessage');*/
		if (response.ok && result.status === 'SUCCESS') {
			/*responseMessage.textContent = 'Branch creation successfully!';
			responseMessage.className = 'response-message success';*/
			showToast('Branch created successfully!');

			document.getElementById('branchForm').reset(); // Optional reset
		} else {
			/*responseMessage.textContent = 'Branch creation failed. Please try again.';
			responseMessage.className = 'response-message failure';*/
			showToast('Branch creation failed. Please try again.', false);
			document.getElementById('branchForm').reset(); // Optional reset
		}
	}
	catch (error) {
		/*document.getElementById('responseMessage').textContent = 'An error occurred. Please try again later.';
		document.getElementById('responseMessage').className = 'response-message failure';
		document.getElementById('responseMessage').style.display = 'block';*/
		showToast('An error occurred. Please try again later.', false);
		document.getElementById('branchForm').reset(); // Optional reset
	}
});

let formValid = false;

  function validateBranchForm() {
    const form = document.getElementById("branchForm");
    const submitBtn = document.getElementById("submitBtn");

    const branchCodeError = document.getElementById("branchCodeError");
    const postalCodeError = document.getElementById("postalCodeError");

    let valid = form.checkValidity();
    let hasCustomErrors =
      (branchCodeError && branchCodeError.textContent.trim() !== "") ||
      (postalCodeError && postalCodeError.textContent.trim() !== "");

    formValid = valid && !hasCustomErrors;
    submitBtn.disabled = !formValid;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("branchForm");
    Array.from(form.elements).forEach((el) => {
      el.addEventListener("input", validateBranchForm);
      el.addEventListener("blur", validateBranchForm);
    });
    validateBranchForm(); // Initial check
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
document.getElementById('branchcode').addEventListener('focus', function() {
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
document.getElementById('branchcode').addEventListener('focus', function() {
	// Only populate branchCode if it's empty (i.e., not manually edited yet)
	if (!this.value) {
		generateBranchCode();
	}
});

document.getElementById("branchcode").addEventListener("input", function() {
	const errorDiv = document.getElementById("branchCodeError");
	errorDiv.textContent = "";
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
document.getElementById('postalCode').addEventListener('blur', function() {
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
document.getElementById('city').addEventListener('focus', function() {
	const postalCode = document.getElementById('postalCode').value.trim();
	if (postalCode) {
		fetchCityState(postalCode);
	}
});

function showReportForm(reportType) {
	if (reportType === 'booking') {
		document.getElementById('bookingReportForm').style.display = 'block';
		document.getElementById('bookingFormContainer').style.display = 'none';
		document.getElementById('CreateBranchContainer').style.display = 'none';
		document.getElementById('reportActions').style.display = 'none'; // Initially hide the download buttons
		document.getElementById('reportTableContainer').innerHTML = ''; // Clear previous report
		document.getElementById('reportMessage').style.display = 'none';
		hideChangePasswordForm(); // Ensure password form is hidden
	}
}

let reportData = []; // Store the fetched report data globally

function generateBookingReport() {
	const fromDateRaw = document.getElementById('fromDate').value;
	const toDateRaw = document.getElementById('toDate').value;
	const reportMessage = document.getElementById('reportMessage');
	const reportTableContainer = document.getElementById('reportTableContainer');
	const reportActions = document.getElementById('reportActions');

if (!fromDateRaw || !toDateRaw) {
  alert("Please select both From and To dates.");
  return;
}

// Manually add time portion
const fromDate = `${fromDateRaw}T00:00:00`;
const toDate = `${toDateRaw}T23:59:59`;
	// Clear previous report data and table
	reportData = [];
	reportTableContainer.innerHTML = '';
	reportMessage.style.display = 'none';
	reportActions.style.display = 'none'; // Hide buttons before new report

	// Fetch data from the API
	fetch(`/api/bookings/report?fromDate=${fromDate}&toDate=${toDate}`)
		.then(response => response.json())
		.then(data => {
			if (data.content && data.content.length > 0) {
				reportData = data.content; // Store the fetched data
				displayReportData(data.content);
				reportMessage.style.display = 'none';
				reportActions.style.display = 'block'; // Show buttons after report is generated
			} else {
				reportMessage.textContent = "No Records Found";
				reportMessage.style.display = 'block';
				reportActions.style.display = 'none';
			}
		})
		.catch(error => {
			console.error("Error fetching report data:", error);
			reportMessage.textContent = "Error fetching report data.";
			reportMessage.style.display = 'block';
			reportActions.style.display = 'none';
		});
}

function displayReportData(data) {
	let reportTable = document.createElement('table');
	reportTable.innerHTML = `
            <tr>
                <th>LoadingReciept</th>
                <th>Consignor Name</th>
                <th>Consignor Mobile</th>
                <th>Consignee Name</th>
                <th>Consignee Mobile</th>
                <th>Article Type</th>
                <th>Article Weight</th>
                <th>Freight</th>
                <th>SGST</th>
                <th>CGST</th>
                <th>IGST</th>
                <th>ConsignStatus</th>
                <th>Booking Date</th>
            </tr>
        `;

	data.forEach(booking => {
		let row = reportTable.insertRow();
		row.innerHTML = `
                <td>${booking.loadingReciept}</td>
                <td>${booking.consignorName}</td>
                <td>${booking.consignorMobile}</td>
                <td>${booking.consigneeName}</td>
                <td>${booking.consigneeMobile}</td>
                <td>${booking.articleType}</td>
                <td>${booking.articleWeight}</td>
                <td>${booking.freight}</td>
                <td>${booking.sgst}</td>
                <td>${booking.cgst}</td>
                <td>${booking.igst}</td>
                 <td>${booking.consignStatus}</td>
                <td>${new Date(booking.bookingDate).toLocaleDateString()}</td>
            `;
	});

	const reportContainer = document.getElementById('reportTableContainer');
	reportContainer.appendChild(reportTable);
}

function downloadBookingReport() {
	if (reportData.length === 0) {
		// No alert here
		return;
	}

	const { jsPDF } = window.jspdf;
	const pdf = new jsPDF('landscape');

	// Explicitly register the autoTable plugin (if it's not automatically registered)
	if (pdf.autoTable === undefined || typeof pdf.autoTable !== 'function') {
		console.error("jsPDF-AutoTable plugin is not correctly loaded.");
		// No alert here
		return;
	}

	const columns = [
		{ header: 'ID', dataKey: 'id' },
		{ header: 'Consignor Name', dataKey: 'consignorName' },
		{ header: 'Consignor Mobile', dataKey: 'consignorMobile' },
		{ header: 'Consignee Name', dataKey: 'consigneeName' },
		{ header: 'Consignee Mobile', dataKey: 'consigneeMobile' },
		{ header: 'Article Type', dataKey: 'articleType' },
		{ header: 'Article Weight', dataKey: 'articleWeight' },
		{ header: 'Freight', dataKey: 'freight' },
		{ header: 'SGST', dataKey: 'sgst' },
		{ header: 'CGST', dataKey: 'cgst' },
		{ header: 'IGST', dataKey: 'igst' },
		{ header: 'Booking Date', dataKey: 'bookingDate' }
	];

	const formattedData = reportData.map(item => ({
		...item,
		bookingDate: new Date(item.bookingDate).toLocaleDateString()
	}));

	pdf.autoTable({
		columns: columns,
		body: formattedData,
		margin: { top: 20, left: 10, right: 10, bottom: 10 },
		bodyStyles: { fontSize: 8 },
		columnStyles: {
			id: { cellWidth: 10 },
			consignorMobile: { cellWidth: 25 },
			consigneeMobile: { cellWidth: 25 },
			bookingDate: { cellWidth: 20 }
		},
		didParseCell: function(data) {
			if (data.column.dataKey === 'articleWeight') {
				if (data.row.raw.articleDetails && Array.isArray(data.row.raw.articleDetails)) {
					data.cell.text = data.row.raw.articleDetails.reduce((sum, detail) => sum + parseInt(detail.artQty), 0);
				} else {
					data.cell.text = 'N/A'; // Or some other appropriate default value
				}
			}
		},
		didDrawPage: function(data) {
			pdf.setFontSize(12);
			pdf.setTextColor(40);
			pdf.text("Booking Report", data.settings.margin.left, 10);
		}
	});

	pdf.save(`booking_report_${new Date().toISOString().slice(0, 10)}.pdf`);
}

function downloadBookingReportExcel() {
	if (reportData.length === 0) {
		// No alert here
		return;
	}

	// Prepare data for Excel
	const excelData = reportData.map(item => ({
		ID: item.id,
		'Consignor Name': item.consignorName,
		'Consignor Mobile': item.consignorMobile,
		'Consignee Name': item.consigneeName,
		'Consignee Mobile': item.consigneeMobile,
		'Article Type': item.articleType,
		'Article Weight': item.articleDetails ? item.articleDetails.reduce((sum, detail) => sum + parseInt(detail.artQty), 0) : 'N/A',
		Freight: item.freight,
		SGST: item.sgst,
		CGST: item.cgst,
		IGST: item.igst,
		'Booking Date': new Date(item.bookingDate).toLocaleDateString()
	}));

	// Create a new workbook
	const wb = XLSX.utils.book_new();
	const ws = XLSX.utils.json_to_sheet(excelData);

	// Add the worksheet to the workbook
	XLSX.utils.book_append_sheet(wb, ws, 'Booking Report');

	// Save the workbook as an Excel file
	XLSX.writeFile(wb, `booking_report_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

function calculateCharges() {
	let freight = parseFloat(document.getElementById("freight").value) || 0;
	let sgst = (freight * 0.025).toFixed(2);
	let cgst = (freight * 0.025).toFixed(2);
	let igst = (freight * 0.05).toFixed(2);
	let grandTotal = (freight + parseFloat(sgst) + parseFloat(cgst) + parseFloat(igst)).toFixed(2);

	document.getElementById("sgst").value = sgst;
	document.getElementById("cgst").value = cgst;
	document.getElementById("igst").value = igst;
	document.getElementById("grandTotal").value = grandTotal;
}

function addArticle() {
	let tableBody = document.querySelector("#bookingForm table tbody");
	let newRow = tableBody.insertRow(-1); // Insert at the end of the tbody

	let articleCell = newRow.insertCell();
	let artQtyCell = newRow.insertCell();
	let artTypeCell = newRow.insertCell();
	let saidToContainCell = newRow.insertCell();
	let artAmtCell = newRow.insertCell();
	let totalCell = newRow.insertCell();
	let actionCell = newRow.insertCell();

	articleCell.textContent = document.getElementById("article").value;
	artQtyCell.textContent = document.getElementById("artQuantity").value;
	artTypeCell.textContent = document.getElementById("artType").value;
	saidToContainCell.textContent = document.getElementById("saidToContain").value;
	artAmtCell.textContent = document.getElementById("artAmount").value;
	totalCell.textContent = parseInt(document.getElementById("artQuantity").value) * parseInt(document.getElementById("artAmount").value);

	let deleteButton = document.createElement("button");
	deleteButton.type = "button";
	deleteButton.textContent = "Delete";
	deleteButton.onclick = function() {
		deleteRow(this);
	};
	actionCell.appendChild(deleteButton);

	// Clear the input fields in the *first* row (the template row)
	document.getElementById("article").value = "";
	document.getElementById("artQuantity").value = "0";
	document.getElementById("artType").selectedIndex = 0;
	document.getElementById("saidToContain").selectedIndex = 0;
	document.getElementById("artAmount").value = "0";
	document.getElementById("totalAmount").textContent = "0";
	const chargesSection = document.querySelector('.charges');
	if (chargesSection && document.querySelector("#bookingForm table tbody").rows.length > 0) {
		chargesSection.style.display = 'flex';
		updateFreight();
	}
}

function deleteRow(btn) {
	let row = btn.parentNode.parentNode;
	row.parentNode.removeChild(row);
	let tableBody = document.querySelector("#bookingForm table tbody");
	if (tableBody.rows.length <= 1) {
		hideChargesSection();
	} else {
		updateFreight();
	}
}

function updateFreight() {
	let totalFreight = 0;
	let rows = document.querySelectorAll("table tr:not(:first-child)");
	rows.forEach(row => {
		let totalCell = row.querySelector("td:nth-child(6)");
		if (totalCell) {
			totalFreight += parseInt(totalCell.textContent) || 0;
		}
	});
	document.getElementById("freight").value = totalFreight;
	calculateCharges();
}

document.getElementById("bookingForm").addEventListener("submit", async function(event) {
	event.preventDefault();

	const deliveryInput = document.getElementById("deliveryDestination").value;
	const match = deliveryInput.match(/\(([^)]+)\)/); // Extract code from "(CODE)"
	const selectedBranchCode = match ? match[1] : null;

	const currentBranchCode = userData?.companyAndBranchDeatils?.branchCode;

	if (selectedBranchCode && selectedBranchCode === currentBranchCode) {
		alert("Destination branch cannot be the same as your current branch.");
		return;
	}


	let articleDetails = [];
	let rows = document.querySelectorAll("table tr:not(:first-child)");
	rows.forEach(row => {
		let cells = row.querySelectorAll("td");
		articleDetails.push({
			article: cells[0].textContent,
			artQty: cells[1].textContent,
			artType: cells[2].textContent,
			saidToContain: cells[3].textContent,
			artAmt: cells[4].textContent,
			total: cells[5].textContent,
		});
	});

	let data = {
		consignorName: document.getElementById("consignorName").value,
		consignorMobile: document.getElementById("consignorMobile").value,
		consigneeName: document.getElementById("consigneeName").value,
		consigneeMobile: document.getElementById("consigneeMobile").value,
		consignorGST: document.getElementById("consignorGST").value,
		consignorAddress: document.getElementById("consignorAddress").value,
		consigneeGST: document.getElementById("consigneeGST").value,
		consigneeAddress: document.getElementById("consigneeAddress").value,
		articleDetails: articleDetails,
		freight: document.getElementById("freight").value,
		sgst: document.getElementById("sgst").value,
		cgst: document.getElementById("cgst").value,
		igst: document.getElementById("igst").value,
		grandTotal: document.getElementById("grandTotal").value,
		 companyCode:userData.companyAndBranchDeatils.companyCode,
    branchCode:userData.companyAndBranchDeatils.branchCode,
	};

	try {
		let response = await fetch("http://localhost:8080/api/bookings/bookLoad", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data)
		});
		let result = await response.json();
		alert("Booking saved successfully!");
		document.getElementById("bookingForm").reset();
		// Optionally clear the article table as well
		const articleTableRows = document.querySelectorAll("#bookingForm table tr:not(:first-child)");
		articleTableRows.forEach(row => row.remove());
		updateFreight();
	} catch (error) {
		console.error("Error saving booking:", error);
		alert("Failed to save booking.");
	}
});


function hideChargesSection() {
	const chargesSection = document.querySelector('.charges');
	if (chargesSection) {
		chargesSection.style.display = 'none';
		// Optionally reset the charges values if needed
		document.getElementById("freight").value = "0";
		document.getElementById("sgst").value = "0";
		document.getElementById("cgst").value = "0";
		document.getElementById("igst").value = "0";
		document.getElementById("grandTotal").value = "0";
	}
}
// Initially hide the charges section
document.addEventListener('DOMContentLoaded', function() {
	hideChargesSection();
});

// Logout Function
function logout() {
	sessionStorage.removeItem('user');  // Remove the stored user object from sessionStorage
	window.location.href = '/'; // Redirect to logout route
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
function showChangePasswordForm() {
	document.getElementById('changePasswordForm').style.display = 'block';
	document.getElementById('overlay').style.display = 'block';
	setTimeout(() => {
		document.addEventListener('click', handleOutsideClick);
	}, 100);
}

function hideChangePasswordForm() {
	document.getElementById('changePasswordForm').style.display = 'none';
	document.getElementById('overlay').style.display = 'none';
	document.removeEventListener('click', handleOutsideClick);
}

function handleOutsideClick(event) {
	const changePasswordForm = document.getElementById('changePasswordForm');
	const userDropdown = document.querySelector('.user-dropdown');

	if (changePasswordForm && !changePasswordForm.contains(event.target) && userDropdown && !userDropdown.contains(event.target)) {
		hideChangePasswordForm();
	}
}

function changePassword() {
	console.log('Session Storage Contents:', sessionStorage);
	const userData = JSON.parse(sessionStorage.getItem('user'));
	console.log('Retrieved userData:', userData);

	if (!userData || !userData.userName) { // Changed userData.username to userData.userName
		console.log('Error: Username not found in userData:', userData);
		passwordMessage.textContent = "Username not found. Please log in again.";
		passwordMessage.style.display = 'block';
		return;
	}
	const username = userData.userName; // Changed userData.username to userData.userName

	const currentPassword = document.getElementById('currentPassword').value;
	const newPassword = document.getElementById('newPassword').value;
	const confirmPassword = document.getElementById('confirmPassword').value;
	const passwordMessage = document.getElementById('passwordMessage');

	if (!currentPassword) {
		passwordMessage.textContent = "Please enter your current password.";
		passwordMessage.style.display = 'block';
		return;
	}

	if (!newPassword) {
		passwordMessage.textContent = "Please enter a new password.";
		passwordMessage.style.display = 'block';
		return;
	}

	if (newPassword !== confirmPassword) {
		passwordMessage.textContent = "New password and confirm password do not match.";
		passwordMessage.style.display = 'block';
		return;
	}

	fetch('/api/change-password', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ username: username, currentPassword: currentPassword, newPassword: newPassword })
	})
		.then(response => response.json())
		.then(data => {
			if (data.success) {
				passwordMessage.textContent = "Password changed successfully!";
				passwordMessage.style.color = 'green';
				passwordMessage.style.display = 'block';
				setTimeout(hideChangePasswordForm, 2000);
			} else {
				passwordMessage.textContent = data.message || "Failed to change password.";
				passwordMessage.style.color = 'red';
				passwordMessage.style.display = 'block';
			}
		})
		.catch(error => {
			console.error('Error changing password:', error);
			passwordMessage.textContent = "An error occurred while changing password.";
			passwordMessage.style.color = 'red';
			passwordMessage.style.display = 'block';
		});
}
let userData = {};
function populateUserData() {
	userData = JSON.parse(sessionStorage.getItem('user'));

	document.getElementById('userFirstName').textContent = userData.firstName;
	document.getElementById('userLastName').textContent = userData.lastName;
	//document.getElementById('userPhone').textContent = userData.phone;
	//document.getElementById('userEmail').textContent = userData.email;
	//document.getElementById('userRole').textContent = userData.role;
}

calculateCharges();
showBookingForm();

async function loadBranchDestinations() {
	const companyCode = userData?.companyAndBranchDeatils?.companyCode;
	console.log("Company code:", companyCode); // debug

	if (!companyCode) return;

	try {
		const response = await fetch(`/BranchesByCompanyCode/${companyCode}`);
		if (!response.ok) throw new Error("Failed to fetch branches");

		const result = await response.json();

		if (result.status === "SUCCESS" && Array.isArray(result.data)) {
			const destinationList = document.getElementById("destinationList");
			destinationList.innerHTML = "";

			result.data.forEach(branch => {
				const option = document.createElement("option");
				option.value = `${branch.branchName} (${branch.branchCode})`;
				destinationList.appendChild(option);
			});
		} else {
			console.warn("No branch data returned.");
		}
	} catch (error) {
		console.error("Error loading branch destinations:", error);
	}
}

document.getElementById("deliveryDestination").addEventListener("focus", loadBranchDestinations);



// Function to validate GST number
function validateGST(gstInputId) {
	const gstInput = document.getElementById(gstInputId);
	const gstValue = gstInput.value.trim(); // Trim whitespace
	const gstPattern = /^[0-9]{10}$/; // Correct regular expression for 10 digits

	if (!gstPattern.test(gstValue)) {
		alert("Invalid GST number.");
		gstInput.value = ""; // Clear the invalid input
		return false; // Indicate validation failure
	}
	return true; // Indicate validation success
}

// Add event listeners to the GST input fields
document.getElementById("consignorGST").addEventListener("blur", function() {
	validateGST("consignorGST");
});

document.getElementById("consigneeGST").addEventListener("blur", function() {
	validateGST("consigneeGST");
});
