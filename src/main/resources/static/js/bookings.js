let currentOperationStatus = ""; // holds DISPATCHED / RECEIVED / DELIVERED


function safeHide(id) {
	const el = document.getElementById(id);
	if (el) el.style.display = 'none';
}
function hideAllForms() {
	safeHide('bookingReportForm');
	safeHide('bookingFormContainer');
	safeHide('CreateBranchContainer');
	safeHide('createEmployeeFormContainer');
	document.getElementById("bookingSummaryContainer").innerHTML = "";
	safeHide('lrSearchResultContainer');
	safeHide('changePasswordForm');
	safeHide('overlay');
	safeHide('globalSearchFormContainer');
	safeHide("operationSearchForm");
	safeHide("bookingopsSummaryContainer");
	safeHide('vehicleManageContainer');
	const summary1 = document.getElementById("bookingSummaryContainer");
	const summary2 = document.getElementById("bookingopsSummaryContainer");
	if (summary1) summary1.innerHTML = "";
	if (summary2) {
		summary2.innerHTML = "";
		summary2.style.display = "none";
	}

}

function showBookingForm() {
	hideAllForms();
	document.getElementById('bookingFormContainer').style.display = 'block';
	// first time or refresh case → fetch from API
	const currentBranch = userData?.companyAndBranchDeatils?.branchCode || null;
	if (!currentBranch) {
		console.error("Branch code not found in userData:", userData);
		return;
	}
	if (!globalNextLr) {
		initNextLr(currentBranch);
	} else if (globalNextLr) {
		// already available → directly update UI
		document.getElementById("nextLrDisplay").textContent = "LR No: " + globalNextLr;
	}

}

function initNextLr(branchCode) {
	fetch(`/nextLr/${branchCode}`)
		.then(resp => resp.text())
		.then(data => {
			document.getElementById("nextLrDisplay").textContent = "LR No: " + data;
		})
		.catch(err => console.error("Error fetching initial LR:", err));
}
function showCreateBranchForm() {
	hideAllForms();

	document.getElementById('CreateBranchContainer').style.display = 'block';
}


function showOperationSearchForm(status) {
	hideAllForms();
	document.getElementById("operationSearchForm").style.display = "block";
	currentOperationStatus = status;

	const titleMap = {
		DISPATCHED: "Dispatch Filter",
		RECEIVED: "Receive Filter",
		DELIVERED: "Delivery Filter"
	};
	document.getElementById("operationFormTitle").innerText = titleMap[status] || "Operation Search";

	clearUnifiedFilters();
	loadOperationDropdowns();

	// ✅ Clear previous table and summary
	document.getElementById("operationResultContainer").innerHTML = "";
	const summaryBox = document.getElementById("bookingopsSummaryContainer");
	if (summaryBox) {
		summaryBox.innerHTML = "";
		summaryBox.style.display = "none";
	}
}

function showVehicleManageForm() {
	hideAllForms();
	document.getElementById("vehicleManageContainer").style.display = "block";
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
		branchPhone: document.getElementById("phone").value,
		branchPhoneAlt: document.getElementById("phone2").value, // optional
		branchEmail: document.getElementById("email").value,
		gstIn: document.getElementById("gstin").value,
		contactPersonName: document.getElementById("contactperson").value,
		companyCode: userData.companyAndBranchDeatils.companyCode,
		branchAddress: {
			areaOrStreetline: document.getElementById("AddressStreet").value,
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

		if (postalData.Status !== "Success") {
			document.getElementById("postalCodeError").innerText = "Invalid Postal Code. Please try again.";
			/*const cityList = postalData.PostOffice;
			const state = postalData.PostOffice[0].State;
			let citiesHtml = '';`

			// If there are multiple cities, show them as a dropdown
			cityList.forEach(city => {
				citiesHtml += `<div class="city-item" onclick="selectCity('${city.Name}')">${city.Name}</div>`;
			});

			document.getElementById("state").value = state;
			const cityDropdown = document.getElementById("cityDropdown");
			if (citiesHtml) {
				cityDropdown.innerHTML = citiesHtml;
				cityDropdown.style.display = 'block';
			}*/
		} /*else {
			document.getElementById("postalCodeError").innerText = "Invalid Postal Code.";
			document.getElementById("state").value = '';
			document.getElementById("city").value = '';
			document.getElementById("cityDropdown").style.display = 'none';
		}*/
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
	hideAllForms();

	// Reset state to make sure report reloads correctly
	reportData = [];
	reportPages = [];
	currentPage = 0;
	lastSeenBookingId = null;

	document.getElementById("bookingReportForm").style.display = 'block';

	let status = "";
	let headingText = "";

	switch (reportType) {
		case "booking":
			status = "BOOKED";
			headingText = "Booking Report";
			break;
		case "dispatched":
			status = "DISPATCHED";
			headingText = "Dispatch Report";
			break;
		case "received":
			status = "RECEIVED";
			headingText = "Receive Report";
			break;
		case "delivered":
			status = "DELIVERED";
			headingText = "Delivery Report";
			break;
	}

	document.getElementById("reportStatusHidden").value = status;
	document.querySelector("#bookingReportForm h3").textContent = headingText;

	// Optional: clear previous table
	document.getElementById("reportTableContainer").innerHTML = '';
	document.getElementById("paginationControls").style.display = 'none';
	document.getElementById("reportActions").style.display = 'none';
	document.getElementById("reportMessage").style.display = 'none';
}
function resetReportView() {
	document.getElementById("reportTableContainer").innerHTML = "";
	document.getElementById("bookingSummaryContainer").innerHTML = "";
	document.getElementById("reportMessage").style.display = "none";
	document.getElementById("reportActions").style.display = "none";
	document.getElementById("paginationControls").style.display = "none";

	reportData = [];
	reportPages = [];
	currentPage = 0;
	lastSeenBookingId = null;
}



let reportData = [];              // for download
let reportPages = [];             // paginated cache
let currentPage = 0;              // page index
let lastSeenBookingId = null;     // for next page fetch
let fromDateGlobal = "";
let toDateGlobal = "";
let currentReportStatus = "";


function generateBookingReport() {
	const fromDateRaw = document.getElementById('fromDate').value;
	const toDateRaw = document.getElementById('toDate').value;

	if (!fromDateRaw || !toDateRaw) {

		showCustomAlert("Please select both From and To dates.");
		return;
	}

	// Reset state
	reportData = [];
	reportPages = [];
	currentPage = 0;
	lastSeenBookingId = null;

	fromDateGlobal = `${fromDateRaw}T00:00:00`;
	toDateGlobal = `${toDateRaw}T23:59:59`;
	currentReportStatus = document.getElementById('reportStatusHidden').value;

	document.getElementById("reportTableContainer").innerHTML = '';
	document.getElementById("reportMessage").style.display = 'none';
	document.getElementById("reportActions").style.display = 'none';
	document.getElementById("paginationControls").style.display = 'none';



	// 🚀 Always fetch first page fresh
	loadPage(0);
}


function loadPage(pageIndex) {
	if (reportPages[pageIndex]) {
		// ✅ Cached page
		currentPage = pageIndex;
		displayReportData(reportPages[currentPage]);
		updatePageDisplay();
		document.getElementById("nextPageButton").disabled = reportPages.length <= currentPage + 1;
		document.getElementById("prevPageButton").disabled = currentPage === 0;
		return;
	}

	// 🚀 If not cached, fetch from server
	const branchCode = userData.companyAndBranchDeatils.branchCode;
	let apiUrl = `/api/bookings/report?fromDate=${fromDateGlobal}&toDate=${toDateGlobal}&status=${currentReportStatus}`;

	if (lastSeenBookingId) {
		apiUrl += `&lastId=${lastSeenBookingId}`;
	}
	if (branchCode) {
		apiUrl += `&branchCode=${branchCode}`;
	}

	fetch(apiUrl)
		.then(response => response.json())
		.then(data => {
			if (data.content && data.content.length > 0) {
				// Save for later use
				lastSeenBookingId = data.content[data.content.length - 1].loadingReciept;
				reportPages.push(data.content);
				currentPage = reportPages.length - 1;

				displayReportData(data.content);
				updatePageDisplay();

				document.getElementById("paginationControls").style.display = "block";
				document.getElementById("reportActions").style.display = "block";
				document.getElementById("nextPageButton").disabled = false;
				document.getElementById("prevPageButton").disabled = currentPage === 0;
			} else {
				document.getElementById("nextPageButton").disabled = true;
				if (reportData.length === 0) {
					document.getElementById("reportMessage").textContent = "No Records Found";
					document.getElementById("reportMessage").style.display = "block";
				}
			}
		})
		.catch(error => {
			console.error("Error fetching report data:", error);
			document.getElementById("reportMessage").textContent = "Error fetching report data.";
			document.getElementById("reportMessage").style.display = "block";
		});
}

function loadNextPage() {
	loadPage(currentPage + 1);
}

function goToPreviousPage() {
	if (currentPage > 0) {
		loadPage(currentPage - 1);
	}
}


function displayReportData(data) {
	const container = document.getElementById('reportTableContainer');

	let table = container.querySelector("table");
	let tbody;

	if (table) {
		tbody = table.querySelector("tbody");
		tbody.innerHTML = '';
	} else {
		table = document.createElement('table');
		table.className = 'table table-bordered';
		table.innerHTML = `
			<thead>
			<tr>
				<th>S.No</th>
				<th>LoadingReciept</th>
				<th>Consignor Name</th>
				<th>Consignor Mobile</th>
				<th>Consignee Name</th>
				<th>Consignee Mobile</th>
				<th>Freight</th>
				<th>SGST</th>
				<th>CGST</th>
				<th>IGST</th>		
				<th>Loading Charges</th>
				<th>ConsignStatus</th>
				<th>Booking Date</th>
			</tr>
			</thead>
			<tbody></tbody>`;
		container.appendChild(table);
		tbody = table.querySelector("tbody");
	}

	data.forEach((booking, index) => {
		const loadingCharges = Number(booking.loading || 0) + Number(booking.loadingCharge || 0);

		const row = document.createElement("tr");
		row.innerHTML = `
			<td>${index + 1}</td>
			<td>${booking.loadingReciept}</td>
			<td>${booking.consignorName}</td>
			<td>${booking.consignorMobile}</td>
			<td>${booking.consigneeName}</td>
			<td>${booking.consigneeMobile}</td>
			<td>${booking.freight}</td>
			<td>${booking.sgst}</td>
			<td>${booking.cgst}</td>
			<td>${booking.igst}</td>
			<td>${loadingCharges}</td>
			<td>${booking.consignStatus}</td>
			<td>${new Date(booking.bookingDate).toLocaleDateString()}</td>
		`;
		tbody.appendChild(row);
	});

	reportData = [...reportData, ...data];

	// ✅ Add this to always show current page summary
	if (currentPage === reportPages.length - 1 || reportPages.length === 1) {
		displayBookingSummary(data);
	}
}


function displayBookingSummary(dataArray) {
	const container = document.getElementById("bookingSummaryContainer");
	if (!container) return;
	container.innerHTML = "";

	const summary = {
		auto: { freight: 0, gst: 0, grandTotal: 0 },
		manual: { freight: 0, gst: 0, grandTotal: 0 },
		total: { freight: 0, gst: 0, grandTotal: 0 }
	};

	dataArray.forEach(row => {
		const type = row.type?.toLowerCase() === "manual" ? "manual" : "auto";
		const freight = Number(row.freight || 0);
		const sgst = Number(row.sgst || 0);
		const cgst = Number(row.cgst || 0);
		const igst = Number(row.igst || 0);
		const gst = sgst + cgst + igst;
		const grandTotal = freight + gst;

		summary[type].freight += freight;
		summary[type].gst += gst;
		summary[type].grandTotal += grandTotal;

		summary.total.freight += freight;
		summary.total.gst += gst;
		summary.total.grandTotal += grandTotal;
	});

	const html = `
		<div class="mt-4">
			<h5 class="text-center text-success">BOOKING SUMMARY</h5>
			<table class="table table-bordered text-center">
				<thead class="table-light">
					<tr>
						<th>Type</th>
						<th>Total Freight</th>
						<th>GST (SGST+CGST+IGST)</th>
						<th>Grand Total</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Auto</td>
						<td>${summary.auto.freight.toFixed(2)}</td>
						<td>${summary.auto.gst.toFixed(2)}</td>
						<td>${summary.auto.grandTotal.toFixed(2)}</td>
					</tr>
					<tr>
						<td>Manual</td>
						<td>${summary.manual.freight.toFixed(2)}</td>
						<td>${summary.manual.gst.toFixed(2)}</td>
						<td>${summary.manual.grandTotal.toFixed(2)}</td>
					</tr>
					<tr class="table-danger fw-bold">
						<td>Total</td>
						<td>${summary.total.freight.toFixed(2)}</td>
						<td>${summary.total.gst.toFixed(2)}</td>
						<td>${summary.total.grandTotal.toFixed(2)}</td>
					</tr>
				</tbody>
			</table>
		</div>
	`;

	container.innerHTML = html;
}


function updatePageDisplay() {
	const totalPages = reportPages.length;
	const display = `Page ${currentPage + 1} of ${totalPages}`;
	document.getElementById("pageNumberDisplay").textContent = display;
}



function toggleAllCheckboxes(source) {
	const checkboxes = document.querySelectorAll('.bookingCheckbox');
	checkboxes.forEach(cb => cb.checked = source.checked);
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

// ---------- Defaults you can change ----------
const DEFAULT_LOADING_PERCENT = 0.0; // 2% of freight (auto default)
const DEFAULT_LR_FLAT = 0.0;        // Rs. 50 flat (auto default)
// ------------------------------------------------

// call this once on page load (or after DOM ready)
document.addEventListener("DOMContentLoaded", () => {
	document.getElementById("loadingCharge").addEventListener("input", calculateCharges);
	document.getElementById("lrCharge").addEventListener("input", calculateCharges);
});


function initChargesListeners() {
	const loadingEl = document.getElementById("loadingCharge");
	const lrEl = document.getElementById("lrCharge");

	if (loadingEl) {
		loadingEl.addEventListener("input", function() {
			// mark as manually edited so autos don't overwrite
			this.dataset.manual = "true";
			calculateChargesBooking();
		});
		// optional: clear manual flag on double-click
		loadingEl.addEventListener("dblclick", function() {
			delete this.dataset.manual;
			calculateChargesBooking();
		});
	}

	if (lrEl) {
		lrEl.addEventListener("input", function() {
			this.dataset.manual = "true";
			calculateChargesBooking();
		});
		lrEl.addEventListener("dblclick", function() {
			delete this.dataset.manual;
			calculateCharges();
		});
	}
}

// Ensure listeners set up after DOM loaded
document.addEventListener("DOMContentLoaded", initChargesListeners);

// ----------------- Add Article (mark inserted rows) -----------------
function addArticlebooking() {
	let tableBody = document.querySelector("#bookingForm table tbody");
	let newRow = tableBody.insertRow(-1);

	let articleCell = newRow.insertCell();
	let artQtyCell = newRow.insertCell();
	let artTypeCell = newRow.insertCell();
	let saidToContainCell = newRow.insertCell();
	let artAmtCell = newRow.insertCell();
	let totalCell = newRow.insertCell();
	let actionCell = newRow.insertCell();

	const qty = parseFloat(document.getElementById("artQuantity").value) || 0;
	const amt = parseFloat(document.getElementById("artAmount").value) || 0;
	const total = qty * amt;

	articleCell.textContent = document.getElementById("article").value;
	artQtyCell.textContent = qty;
	artTypeCell.textContent = document.getElementById("artType").value;
	saidToContainCell.textContent = document.getElementById("saidToContain").value;
	artAmtCell.textContent = amt.toFixed(2);
	totalCell.textContent = total.toFixed(2);

	let deleteButton = document.createElement("button");
	deleteButton.className = "btn btn-danger btn-sm";
	deleteButton.textContent = "Delete";
	deleteButton.onclick = function() {
		deleteRow(this);
	};
	actionCell.appendChild(deleteButton);

	// mark the row as an 'added' article so updateFreight sums it
	newRow.dataset.added = "true";

	// Clear input fields (keep initial input row intact)
	document.getElementById("article").value = "Article";
	document.getElementById("artQuantity").value = "0";
	document.getElementById("artType").selectedIndex = 0;
	document.getElementById("saidToContain").selectedIndex = 0;
	document.getElementById("artAmount").value = "0";
	document.getElementById("totalAmount").textContent = "0";

	// Show Charges panel and recalculate
	document.getElementById("chargesPanel").style.display = "block";
	updateFreight();
}

// ----------------- Delete Row -----------------
function deleteRow(btn) {
	let row = btn.closest("tr");
	if (row) row.remove();

	// always recalc after deletion
	updateFreight();

	// DO NOT hide chargesPanel even if no rows
	// Only reset freight, GSTs, etc., but keep panel visible
	const addedRows = document.querySelectorAll("#bookingForm table tbody tr[data-added='true']");
	if (addedRows.length === 0) {
		safeAssign("freight", 0);
		safeAssign("sgst", 0);
		safeAssign("cgst", 0);
		safeAssign("igst", 0);
		calculateCharges(); // recalc with 0 freight but keep user charges
	}
}


// small helper to set input safely if element exists
function safeAssign(id, val) {
	const el = document.getElementById(id);
	if (el) el.value = (typeof val === 'number') ? val.toFixed(2) : val;
}

// ----------------- Update Freight (sums added rows only) -----------------
function updateFreight() {
	let totalFreight = 0;
	// only sum rows we marked with data-added="true"
	const rows = document.querySelectorAll("#bookingForm table tbody tr[data-added='true']");
	rows.forEach(row => {
		const totalCell = row.querySelector("td:nth-child(6)");
		if (totalCell) {
			totalFreight += parseFloat(totalCell.textContent) || 0;
		}
	});

	// set freight (2 decimals)
	const freightEl = document.getElementById("freight");
	if (freightEl) freightEl.value = totalFreight.toFixed(2);


	// Recalculate charges after freight update
	calculateChargesBooking();
}

// ----------------- Calculate Charges for Booking Form -----------------
function calculateChargesBooking() {
	const freight = parseFloat(document.getElementById("freight").value) || 0;
	const loadingCharge = parseFloat(document.getElementById("loadingCharge").value) || 0;
	const lrCharge = parseFloat(document.getElementById("lrCharge").value) || 0;

	const consignorGST = (document.getElementById("consignorGST")?.value || "").trim();
	const consigneeGST = (document.getElementById("consigneeGST")?.value || "").trim();

	let sgst = 0, cgst = 0, igst = 0;
	if (freight > 0) {

		// GST calculation only based on GST inputs
		if (consignorGST && consigneeGST) {
			const consignorState = consignorGST.substring(0, 2);
			const consigneeState = consigneeGST.substring(0, 2);

			if (consignorState === consigneeState) {
				// Same state → SGST + CGST
				sgst = +(freight * 0.025).toFixed(2);
				cgst = +(freight * 0.025).toFixed(2);
				igst = 0; // 🚨 explicitly reset IGST
			} else {
				// Different state → IGST
				igst = +(freight * 0.05).toFixed(2);
				sgst = 0; // 🚨 reset SGST
				cgst = 0; // 🚨 reset CGST
			}
		} else if (consignorGST || consigneeGST) {
			// Only one GST → IGST
			igst = +(freight * 0.05).toFixed(2);
			sgst = 0; // 🚨 reset SGST
			cgst = 0; // 🚨 reset CGST
		} else {
			// No GST → all 0
			sgst = 0;
			cgst = 0;
			igst = 0;
		}
	}
	const grandTotal = (freight + loadingCharge + lrCharge + sgst + cgst + igst).toFixed(2);


	safeAssign("sgst", sgst);
	safeAssign("cgst", cgst);
	safeAssign("igst", igst);
	safeAssign("grandTotal", parseFloat(grandTotal));
	document.getElementById("chargesPanel").style.display = "block";
}

// ----------------- Reset Booking Form must clear manual flags -----------------
function resetBookingForm() {
	// existing resets...
	const form = document.getElementById("bookingForm");
	if (form) form.reset();

	// Reset specific fields
	["freight", "loadingCharge", "lrCharge", "sgst", "cgst", "igst", "grandTotal"].forEach(id => {
		const el = document.getElementById(id);
		if (el) el.value = id === "freight" ? "0.00" : "0";
		if (el && el.dataset) delete el.dataset.manual;
	});

	// Clear article rows, hide charges
	const tableBody = document.getElementById("articleTableBody");
	if (tableBody) tableBody.innerHTML = ""; // if you use this body id
	const addedRows = document.querySelectorAll("#bookingForm table tbody tr[data-added='true']");
	addedRows.forEach(r => r.remove());
	document.getElementById("chargesPanel").style.display = "none";

	// Scroll to top optionally
	window.scrollTo({ top: 0, behavior: 'smooth' });
}



function printBookingReceipt(booking) {
	const printWindow = window.open('', '', 'width=900,height=700');

	const gst = (parseFloat(booking.sgst || 0) + parseFloat(booking.cgst || 0) + parseFloat(booking.igst || 0));
	const freight = parseFloat(booking.freight || 0);
	const loading = parseFloat(booking.loading || 0);
	const loadingCharge = parseFloat(booking.loadingCharge || 0);

	const total = (freight + gst + loading + loadingCharge).toFixed(2);
	const invValue = booking.invoiceValue || 0;
	const paymentMode = booking.billType || '-';


	// Quantity & Description
	let totalQty = 0;
	let description = "-";
	if (booking.articleList && booking.articleList.length > 0) {
		booking.articleList.forEach(a => totalQty += (parseInt(a.noOfArticles) || 0));
		description = `${booking.articleList[0].articleDesc || ''} - Said to contain`;
	}

	const contentBlock = () => `
		<div class="receipt">
			<div class="header">
			
				<div class="company-name"><strong>${userData.companyAndBranchDeatils.companyName}</strong></div>
    <div class="branch-name">${userData.companyAndBranchDeatils.branchName}</div>
			</div>

			<table class="excel-table">
				<tr>
					<td><strong>Date:</strong> ${new Date(booking.bookingDate).toLocaleDateString()}</td>
					<td><strong>LR No:</strong> ${booking.loadingReciept}</td>
					<td class="charges-box" rowspan="6">
						<div><strong>PaymentMode:</strong> ${paymentMode}</div>
						<hr>
						<div><strong>CHARGES</strong></div>
						<div>Freight: ₹${freight}</div>
						<div>GST: ₹${gst}</div>
						<div>Loading: ₹${loading}</div>
						<div>Load Charges: ₹${loadingCharge}</div>
						<hr>
						<div class="charges-total"><strong>Total: ₹${total}</strong></div>
					</td>
				</tr>
				<tr>
					<td>
						<strong>FROM:</strong> ${userData.companyAndBranchDeatils.branchName} (${booking.branchCode})<br>
						<strong>Consignor:</strong> ${booking.consignorName}<br>
						<strong>Address:</strong> ${booking.consignorAddress}<br>
						<strong>Mobile:</strong> ${booking.consignorMobile}
					</td>
					<td>
						<strong>TO:</strong> ${booking.destinationBranchCode}<br>
						<strong>Consignee:</strong> ${booking.consigneeName}<br>
						<strong>Address:</strong> ${booking.consigneeAddress}<br>
						<strong>Mobile:</strong> ${booking.consigneeMobile}
					</td>
				</tr>
				<tr>
					<td><strong>Quantity:</strong> ${totalQty}</td>
				</tr>
				<tr>
					<td>
						<strong>Invoice No:</strong> ${booking.invoiceNumber || '-'}<br>
						<strong>Invoice Value:</strong> ₹${invValue}<br>
						<strong>E-Way Bill:</strong> ${booking.eWayBillNumber || '-'}
					</td>
					<td>
						<strong>Wt:</strong> ${booking.actualWeight || '-'} / ${booking.chargedWeight || '-'}<br>
						<strong>Delivery At:</strong> ${booking.deliveryType || 'Godown'}
					</td>
				</tr>
				<tr>
					<td colspan="2"><strong>Remarks:</strong></td>
				</tr>
				<tr>
					<td colspan="2" class="sign">Signature: ____________________________</td>
				</tr>
			</table>
		</div>
	`;

	const styles = `
		<style>
			body { font-family: 'Courier New', monospace; margin: 0; padding: 10px; font-size: 13px; }
			.receipt { border: 1px solid #000; padding: 10px; margin-bottom: 20px; }
			.header { text-align: center; margin-bottom: 10px; font-size: 15px; font-weight: bold; }
			.excel-table {
				width: 100%;
				border-collapse: collapse;
			}
			.excel-table td {
				border: 1px solid #000;
				vertical-align: top;
				padding: 5px;
			}
			.charges-box {
    width: 30%;
    text-align: left;
    font-weight: bold;
    vertical-align: bottom;   /* ✅ Align bottom */
}
			.charges-box hr {
				border: none;
				border-top: 1px dashed #000;
				margin: 6px 0;
			}
			.charges-total {
    font-size: 14px;
    font-weight: bold;
    margin-top: 40px;        /* ✅ Push down to align with signature */
}

			.note {
				text-align: center;
				font-size: 12px;
				padding: 5px;
			}
			.sign {
				padding-top: 20px;
				height: 40px;
			}
			.footer-info {
				text-align: right;
				font-size: 11px;
				line-height: 1.2;
			}
			@media print {
				body { margin: 0; }
			}.print-id {
	position: absolute;
	top: 10px;
	left: 10px;
	font-size: 14px;
	font-weight: bold;
}
@media print {
	@page {
		margin-top: 40px;
		margin-left: 10px;
		margin-right: 10px;
		margin-bottom: 10px;
	}
}
.header {
    text-align: center;
    margin-bottom: 10px;
}

.company-name {
    font-size: 1.8rem; /* bigger */
    font-weight: bold;
}

.branch-name {
    font-size: 0.9rem; /* smaller */
    color: #555;
}
				
		</style>
	`;

	const fullHTML = `
		<html>
		<head><title>Print LR</title>${styles}</head>
		<body>
			${contentBlock()}
			${contentBlock()}
			${contentBlock()}
			<script>
				window.onload = function() {
					window.print();
					setTimeout(() => window.close(), 3000);
				}
			</script>
		</body>
		</html>
	`;

	printWindow.document.write(fullHTML);
	printWindow.document.close();
}

let globalNextLr = null;

document.getElementById("bookingForm").addEventListener("submit", async function(event) {
	event.preventDefault();

	const deliveryInput = document.getElementById("deliveryDestination").value;
	if (!deliveryInput) {
		await showCustomAlert("Please select a Delivery Destination.");
		return;
	}
	const match = deliveryInput.match(/\(([^)]+)\)/); // Extract code from "(CODE)" 
	const selectedBranchCode = match ? match[1] : null;

	const currentBranchCode = userData?.companyAndBranchDeatils?.branchCode;
	const paymentMode = document.getElementById("paymentMode").value;

	if (selectedBranchCode && selectedBranchCode === currentBranchCode) {
		showCustomAlert("Destination branch cannot be the same as your current branch.");
		return;
	}

	if (!document.getElementById("consignorName").value.trim()) {
		await showCustomAlert("Please enter Consignor Name.");
		return;
	}

	const consignorMobile = document.getElementById("consignorMobile").value.trim();
	if (!/^\d{10}$/.test(consignorMobile)) {
		await showCustomAlert("Consignor Mobile must be 10 digits.");
		return;
	}

	if (!document.getElementById("consignorAddress").value.trim()) {
		await showCustomAlert("Please enter Consignor Address.");
		return;
	}

	// GST is optional, but if entered, validate format
	const consignorGST = document.getElementById("consignorGST").value.trim();
	if (consignorGST && !/^[0-9A-Z]{15}$/.test(consignorGST)) {
		await showCustomAlert("Invalid Consignor GST format.");
		return;
	}

	// --- CONSIGNEE VALIDATION ---
	if (!document.getElementById("consigneeName").value.trim()) {
		await showCustomAlert("Please enter Consignee Name.");
		return;
	}

	const consigneeMobile = document.getElementById("consigneeMobile").value.trim();
	if (!/^\d{10}$/.test(consigneeMobile)) {
		await showCustomAlert("Consignee Mobile must be 10 digits.");
		return;
	}

	if (!document.getElementById("consigneeAddress").value.trim()) {
		await showCustomAlert("Please enter Consignee Address.");
		return;
	}

	const consigneeGST = document.getElementById("consigneeGST").value.trim();
	if (consigneeGST && !/^[0-9A-Z]{15}$/.test(consigneeGST)) {
		await showCustomAlert("Invalid Consignee GST format.");
		return;
	}
	const freightValue = parseFloat(document.getElementById("freight").value) || 0;
	if (freightValue <= 0) {
		await showCustomAlert("Freight value must be greater than 0.");
		return;
	}

	// --- Invoice Validation ---
	const invoiceNo = document.getElementById("invoiceNo").value.trim();
	const invoiceValue = document.getElementById("Invoicevalue").value.trim();

	if (invoiceNo && !invoiceValue) {
		await showCustomAlert("Please enter Invoice Value when Invoice Number is provided.");
		return;
	}
	if (invoiceValue && !/^\d+(\.\d{1,2})?$/.test(invoiceValue)) {
		await showCustomAlert("Invoice Value must be a valid number (up to 2 decimals).");
		return;
	}

	// --- E-Way Bill Validation ---
	const ewayBill = document.getElementById("ewayBill").value.trim();
	if (ewayBill && !/^\d{12}$/.test(ewayBill)) {
		await showCustomAlert("E-Way Bill must be exactly 12 digits numeric.");
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
			companyCode: userData.companyAndBranchDeatils.companyCode,
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
		companyCode: userData.companyAndBranchDeatils.companyCode,
		branchCode: userData.companyAndBranchDeatils.branchCode,
		destinationBranchCode: document.getElementById("deliveryDestination").value,
		billType: paymentMode,

		invoiceNumber: document.getElementById("invoiceNo").value,
		invoiceValue: document.getElementById("Invoicevalue").value,
		eWayBillNumber: document.getElementById("ewayBill").value,
		loading: document.getElementById("loadingCharge").value,
		loadingCharge: document.getElementById("lrCharge").value
	};
	await showCustomAlert("Your booking grand total is: " + document.getElementById("grandTotal").value);

	let url = "/api/bookings/bookLoad";
	let method = "POST";

	try {
		let response = await fetch(url, {
			method: method,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data)
		});
		let result = await response.json();

		await showCustomAlert("Booking saved successfully!");

		// update next LR badge
		if (result.nextLr) {
			globalNextLr = result.nextLr;
		}

		document.getElementById("bookingForm").reset();

		// Reset Select2 dropdown
		$('#deliveryDestination').val('').trigger('change');

		// Optionally clear the article table as well
		const articleTableRows = document.querySelectorAll("#bookingForm table tr:not(:first-child)");

		articleTableRows.forEach(row => row.remove());
		resetPaymentModeUI();

		updateFreight();

		printBookingReceipt(result);
	} catch (error) {
		console.error("Error saving booking:", error);
		showCustomAlert("Failed to save booking.");
	}
});

document.addEventListener("DOMContentLoaded", function() {
	$('#deliveryDestination').select2({
		placeholder: "search for destination branch here..",
		allowClear: true,
		width: '100%'
	});
});

// Invoice Value: allow only digits and dot
document.getElementById("Invoicevalue").addEventListener("input", function() {
	this.value = this.value.replace(/[^0-9.]/g, "");
});

// E-Way Bill: allow only digits (max 12)
document.getElementById("ewayBill").addEventListener("input", function() {
	this.value = this.value.replace(/\D/g, ""); // remove non-digits
	if (this.value.length > 12) {
		this.value = this.value.slice(0, 12); // trim to 12 digits
	}
});


function resetPaymentModeUI() {
	const hiddenInput = document.getElementById("paymentMode");
	const displayBox = document.getElementById("selectedPaymentModeDisplay");
	const label = document.getElementById("selectedModeLabel");

	// 1️⃣ Clear values
	if (hiddenInput) hiddenInput.value = "";

	// 2️⃣ Hide display box
	if (displayBox) displayBox.style.display = "none";

	// 3️⃣ Clear old highlights
	document.querySelectorAll(".key-box").forEach(btn => btn.classList.remove("selected-mode"));

	// 4️⃣ Reset default to "TO PAY"
	setPaymentMode("TO PAY");
}


function resetBookingForm() {
	// Reset form fields
	const form = document.getElementById("bookingForm");
	if (form) form.reset();

	// Clear individual known fields if any were missed
	const fieldsToClear = [
		"consignorName", "consignorMobile", "consignorAddress",
		"consigneeName", "consigneeMobile", "consigneeAddress",
		"invoiceNo", "Invoicevalue", "ewayBill", "deliveryDestination",
		"freight", "sgst", "cgst", "igst", "grandTotal"
	];
	fieldsToClear.forEach(id => {
		const el = document.getElementById(id);
		if (el) el.value = "";
	});

	// Clear select dropdowns
	const selectIds = ["article", "artType", "saidToContain"];
	selectIds.forEach(id => {
		const el = document.getElementById(id);
		if (el) el.selectedIndex = 0;
	});

	// Clear article input row values
	safeAssign("artQuantity", 0);
	safeAssign("artAmount", 0);
	const totalSpan = document.getElementById("totalAmount");
	if (totalSpan) totalSpan.textContent = "0";

	// Clear article table rows
	const tableBody = document.getElementById("articleTableBody");
	if (tableBody) tableBody.innerHTML = "";

	// Hide charges panel
	const chargesPanel = document.getElementById("chargesPanel");
	if (chargesPanel) chargesPanel.style.display = "none";

	// Clear session info


	// Optional: scroll to top
	window.scrollTo({ top: 0, behavior: 'smooth' });
}


window.onload = function() {

	populateUserData()
	loadBranchDestinations();
	showBookingForm(); // 🔁 show only if logged in

};

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

	// AES encryption key and IV (must match backend)
	const key = CryptoJS.enc.Utf8.parse("1234567890123456");
	const iv = CryptoJS.enc.Utf8.parse("abcdefghijklmnop");

	// Encrypt the newPassword
	const encryptedNewPassword = CryptoJS.AES.encrypt(newPassword, key, {
		iv: iv,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7
	}).toString();

	// Encrypt the currentPassword
	const encryptedCurrentPassword = CryptoJS.AES.encrypt(currentPassword, key, {
		iv: iv,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7
	}).toString();

	fetch('/api/change-password', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ username: username, currentPassword: encryptedCurrentPassword, newPassword: encryptedNewPassword })
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
	document.getElementById('branchresult').textContent = userData.companyAndBranchDeatils.branchName + "-[" + userData.companyAndBranchDeatils.branchType + "]";

	const logoImg = document.getElementById("companyLogo");
	const companyCode = userData.companyAndBranchDeatils.companyCode; // get company code from session
	const companyName = userData.companyAndBranchDeatils.companyName;
	const logoContainer = document.getElementById("logoContainer");

	// Try fetching logo from backend
	fetch(`/company/logo/${companyCode}`)
		.then(response => {
			if (!response.ok) throw new Error("Logo not found");
			return response.blob();
		})
		.then(blob => {
			const url = URL.createObjectURL(blob);
			logoImg.src = url;
		})
		.catch(error => {
			console.warn("Logo not available:", error);
			// Replace image with red company name
			logoContainer.innerHTML = `
  <span style="
    color: white;
    font-weight: 600;
    font-size: 14px;
    line-height: 40px;
    display: inline-block;
  ">${companyName}</span>`;


		});
	//document.getElementById('userPhone').textContent = userData.phone;
	//document.getElementById('userEmail').textContent = userData.email;
	//document.getElementById('userRole').textContent = userData.role;
	return true;
}

calculateCharges();
showBookingForm();

async function loadBranchDestinations() {
	const companyCode = userData?.companyAndBranchDeatils?.companyCode;
	const myBranch = userData.companyAndBranchDeatils.branchCode;
	if (!companyCode) return;

	try {
		const response = await fetch(`/BranchesByCompanyCode/${companyCode}`);
		if (!response.ok) throw new Error("Failed to fetch branches");

		const result = await response.json();


		const dropdown = document.getElementById("deliveryDestination");
		dropdown.innerHTML = '<option value="">-- Select Destination --</option>';

		if (result.status === "SUCCESS" && Array.isArray(result.data)) {
			result.data.forEach(branch => {
				if (branch.branchCode !== myBranch) {
					const option = document.createElement("option");
					option.value = `${branch.branchName} (${branch.branchCode})`;
					option.textContent = `${branch.branchName} (${branch.branchCode})`;
					dropdown.appendChild(option);
				}
			});
		}
	} catch (error) {
		console.error("Error loading branch destinations:", error);
	}
}


document.getElementById("deliveryDestination").addEventListener("focus", loadBranchDestinations);



// Proper GST format validation (15-character format)
function validateGST(gstInputId) {
	const gstInput = document.getElementById(gstInputId);
	const gstValue = gstInput.value.trim().toUpperCase(); // Normalize to uppercase

	const gstPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

	if (gstValue && !gstPattern.test(gstValue)) {
		showCustomAlert("Invalid GST number format.");
		gstInput.value = "";
		gstInput.focus();
		return false;
	}
	return true;
}

// Add event listeners to the GST input fields
document.getElementById("consignorGST").addEventListener("blur", function() {
	validateGST("consignorGST");
});

document.getElementById("consigneeGST").addEventListener("blur", function() {
	validateGST("consigneeGST");
});
function dispatchSelected(vehicleDetails = {}) {
	const selected = Array.from(document.querySelectorAll('.bookingCheckbox:checked'))
		.map(cb => cb.value);

	if (selected.length === 0) {
		showCustomAlert("Please select at least one booking.");
		return;
	}

	const payload = {
		selectedLRs: selected,
		vehicleDetails: vehicleDetails
	};

	fetch('/api/bookings/dispatchLoad', {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload)
	})
		.then(res => res.json())
		.then(data => {
			showCustomAlert("Dispatch successful!");

			const dispatchedBookings = Array.isArray(data) ? data : (data.data || []);

			generateBookingReport();
			openPrintWindow(dispatchedBookings);
		})
		.catch(err => {
			console.error("Dispatch error:", err);
			showCustomAlert("Error dispatching bookings.");
		});
}

function openPrintWindow(response) {
	const { bookings, loadingSheet } = response;
	const printWindow = window.open('', '', 'width=1000,height=700');


	const companyName = userData?.companyAndBranchDeatils?.companyName || "";
	const branchName = userData?.companyAndBranchDeatils?.branchName || "";
	const branchCode = userData?.companyAndBranchDeatils?.branchCode || "";

	let html = `
    <html>
    <head>
      <title>Dispatched Booking Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; margin: 0; }
        h2, h3 { text-align: center; margin: 0; }
        .top-header { margin-bottom: 20px; }
        .sheet-box {
          border: 1px solid #000;
          padding: 10px;
          margin: 0 auto 20px auto;
          width: 100%;
          box-sizing: border-box;
        }
        .sheet-box table {
          width: 100%;
          border-collapse: collapse;
        }
        .sheet-box td {
          border: 1px solid #000;
          padding: 6px;
          font-size: 13px;
        }
        .row-no-border td {
          border: none !important;
          padding-bottom: 4px;
        }
        table.bookings-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        table.bookings-table th, table.bookings-table td {
          border: 1px solid #000;
          padding: 8px;
          text-align: left;
          font-size: 13px;
        }
        table.bookings-table th {
          background-color: #f2f2f2;
        }
      </style>
    </head>
    <body>
      <div class="top-header">
<div><strong>${userData.companyAndBranchDeatils.companyName}</strong></div>
				<div>${userData.companyAndBranchDeatils.branchName}</div>
      </div>

      <div class="sheet-box">
        <h3 style="text-align: center; margin-bottom: 10px;">Loading Sheet</h3>
        <table>
          <tr class="row-no-border">
            <td colspan="3"><strong>From:</strong> ${branchName} &nbsp;&nbsp;&nbsp;&nbsp; <strong>To:</strong> ${loadingSheet.destinationBranch}</td>
          </tr>
          <tr>
            <td><strong>LS No:</strong> ${loadingSheet.loadingSheetNumber}</td>
            <td><strong>Vehicle No:</strong> ${loadingSheet.vehicleNumber}</td>
            <td><strong>Vehicle Name:</strong> ${loadingSheet.vehicleName}</td>
          </tr>
          <tr>
            <td><strong>Driver:</strong> ${loadingSheet.driverName}</td>
            <td><strong>Phone:</strong> ${loadingSheet.driverPhone}</td>
            <td><strong>Date:</strong> ${new Date().toLocaleDateString()}</td>
          </tr>
        </table>
      </div>

      <h3 style="margin-top: 40px;">Dispatched Bookings</h3>
      <table class="bookings-table">
        <thead>
          <tr>
            <th>LoadingReciept</th>
            <th>Consignor</th>
            <th>Consignee</th>
            <th>Freight</th>
            <th>Status</th>
            <th>Dispatched Date</th>
			<th>Loading Charges</th>
            <th>Lr Type</th>
          </tr>
        </thead>
        <tbody>`;

	bookings.forEach(booking => {
		const loadingCharges = Number(booking.loading || 0) + Number(booking.loadingCharge || 0);

		html += `
          <tr>
            <td>${booking.loadingReciept}</td>
            <td>${booking.consignorName}</td>
            <td>${booking.consigneeName}</td>
            <td>${booking.freight}</td>
            <td>${booking.consignStatus}</td>
            <td>${booking.dispatchDate ? new Date(booking.dispatchDate).toLocaleString() : ''}</td>
            <td>${loadingCharges}</td>
			<td>${booking.billType}</td>
          </tr>`;
	});

	html += `
        </tbody>
      </table>
      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

	printWindow.document.write(html);
	printWindow.document.close();
}




function showCreateEmployeeForm() {
	hideAllForms();

	document.getElementById('createEmployeeFormContainer').style.display = 'block';

	if (!userData || !userData.companyAndBranchDeatils) {
		userData = JSON.parse(sessionStorage.getItem('user') || "{}");
	}

	if (userData?.companyAndBranchDeatils?.companyCode) {
		loadBranchesByCompanyCode(userData.companyAndBranchDeatils.companyCode);
	} else {
		showCustomAlert("User session not available.");
	}
}

// ✅ Attach event listeners only after DOM is ready
document.addEventListener("DOMContentLoaded", function() {
	const submitBtn = document.getElementById("submitButton");
	if (submitBtn) {
		submitBtn.addEventListener("click", submitEmployeeForm);
	}

	const userInput = document.getElementById("employeeuserName");
	if (userInput) {
		userInput.addEventListener("input", function() {
			const username = this.value.trim();
			if (username) {
				validateUsername(username);
			} else {
				document.getElementById('usernameError').textContent = '';
			}
		});
	}

	const confirmPasswordInput = document.getElementById("employeeconfirmPassword");
	if (confirmPasswordInput) {
		confirmPasswordInput.addEventListener("input", function() {
			const password = document.getElementById("employeepassword").value;
			const confirmPassword = this.value;

			if (confirmPassword !== password) {
				document.getElementById("employeeconfirmPasswordError").textContent = "Passwords do not match!";
			} else {
				document.getElementById("employeeconfirmPasswordError").textContent = "";
			}
		});
	}
});

// Function to validate username on input
async function validateUsername(username) {
	try {
		const CompanyCode = userData.companyAndBranchDeatils.companyCode;

		const response = await fetch('/validate-username', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				username: username,
				companyCode: CompanyCode
			})
		});

		const data = await response.json();
		document.getElementById('usernameError').textContent = data.status;
	} catch (error) {
		document.getElementById('usernameError').textContent = 'Error validating username. Please try again later.';
	}
}
// 🔁 Global function to submit employee form
function submitEmployeeForm() {
	const password = document.getElementById("employeepassword").value;
	const confirmPassword = document.getElementById("employeeconfirmPassword").value;
	const usernameError = document.getElementById("usernameError").textContent.trim();
	// ✅ BLOCK if username already exists
	if (usernameError && usernameError.toLowerCase().includes("already")) {
		return;
	}
	// Password and Confirm Password Validation
	if (password !== confirmPassword) {
		document.getElementById("employeeconfirmPasswordError").textContent = "Passwords do not match!";
		return;
	} else {
		document.getElementById("employeeconfirmPasswordError").textContent = "";
	}

	// AES encryption key and IV (must match backend)
	const key = CryptoJS.enc.Utf8.parse("1234567890123456");
	const iv = CryptoJS.enc.Utf8.parse("abcdefghijklmnop");

	// Encrypt the password
	const encryptedPassword = CryptoJS.AES.encrypt(password, key, {
		iv: iv,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7
	}).toString();

	let masterData = {
		firstName: document.getElementById("employeefirstName").value,
		lastName: document.getElementById("employeelastName").value,
		userName: document.getElementById("employeeuserName").value,
		password: encryptedPassword,
		phone: document.getElementById("employeephone").value,
		email: document.getElementById("employeeemail").value,
		role: document.getElementById("employeerole").value,
		companyDetails: {
			companyCode: userData.companyAndBranchDeatils.companyCode,
			companyBranch: {
				branchCode: document.getElementById("branchSelect").value,
			}
		}
	};

	fetch('addEmployee', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(masterData)
	})
		.then(response => response.json())
		.then(data => {
			if (data.status) {
				/*const toast = document.getElementById('toastNotification');
				const toastMessage = document.getElementById('toastMessage');
				toastMessage.textContent = "Employee Created!";
				toast.style.display = 'block';
	
				setTimeout(() => {
					toast.style.display = 'none';
					window.location.href = "/createEmployee";
				}, 3000);*/
				showCustomAlert("New Employee created successful!");
				resetEmployeeForm();
			} else {
				document.getElementById("formMessage").innerHTML = `<div class='alert alert-danger'>Error: ${data.message}</div>`;
			}
		})
		.catch(error => {
			document.getElementById("formMessage").innerHTML = "<div class='alert alert-danger'>Something went wrong. Please try again.</div>";
		});
}
function resetEmployeeForm() {
	document.getElementById("createEmployeeForm").reset();

	// Clear custom error/spinner messages too
	document.getElementById("employeeconfirmPasswordError").textContent = '';
	document.getElementById("usernameError").textContent = '';
	document.getElementById("formMessage").innerHTML = '';
}

function debounce(func, delay) {
	let timer;
	return function(...args) {
		clearTimeout(timer);
		timer = setTimeout(() => func.apply(this, args), delay);
	};
}

document.addEventListener("DOMContentLoaded", function() {
	const userInput = document.getElementById('employeeUserName');
	if (userInput) {
		userInput.addEventListener('input', debounce(function() {
			const username = this.value.trim();
			if (username) {
				validateUsername(username);
			} else {
				document.getElementById('usernameError').textContent = '';
			}
		}, 300)); // 300ms delay after user stops typing
	}
});

// Password and Confirm Password Match Check
document
	.getElementById("confirmPassword")
	.addEventListener(
		"input",
		function() {
			const password = document
				.getElementById("employeepassword").value;
			const confirmPassword = this.value;

			if (confirmPassword !== password) {
				document.getElementById("employeeconfirmPasswordError").textContent = "Passwords do not match!";
			} else {
				document.getElementById("confirmPasswordError").textContent = "";
			}
		});


function loadBranchesByCompanyCode(companyCode) {
	fetch(`BranchesByCompanyCode/${companyCode}`)
		.then(response => response.json())
		.then(data => {
			const select = document.getElementById("branchSelect");
			select.innerHTML = '<option selected>---- Select Branch ----</option>';

			if (data.status === "SUCCESS" && Array.isArray(data.data)) {
				data.data.forEach(branch => {
					const option = document.createElement("option");
					option.value = branch.branchCode;
					option.textContent = `${branch.branchName} [${branch.branchType}]`;
					select.appendChild(option);
				});
			} else {
				console.error("No branches found.");
			}
		})
		.catch(error => console.error("Error fetching branches:", error));
}


function setPaymentMode(mode) {
	const hiddenInput = document.getElementById("paymentMode");
	const displayBox = document.getElementById("selectedPaymentModeDisplay");
	const label = document.getElementById("selectedModeLabel");

	// Update hidden field
	if (hiddenInput) hiddenInput.value = mode;

	// Show selected mode visually
	if (displayBox && label) {
		displayBox.style.display = "block";
		label.textContent = mode;
	}

	// Reset highlight
	document.querySelectorAll(".key-box").forEach(btn => {
		btn.classList.remove("selected-mode");
	});

	// Highlight the clicked one
	const allKeys = {
		"PAID": ".f7",
		"TO PAY": ".f8",
		"TBB": ".f9"
	};
	const selector = allKeys[mode];
	if (selector) {
		const btn = document.querySelector(selector);
		if (btn) btn.classList.add("selected-mode");
	}

	// Show / hide Paid Via dropdown
	const paidViaContainer = document.getElementById("paidViaContainer");
	if (paidViaContainer) {
		if (mode === "PAID") {
			paidViaContainer.style.display = "block";
		} else {
			paidViaContainer.style.display = "none";
			document.getElementById("paidVia").value = ""; // reset
		}
	}
}

function searchLRByNumber(lrNumber) {
	const container = document.getElementById("lrSearchResultContainer");
	container.innerHTML = ""; // Clear previous

	fetch(`/api/bookings/searchBylr?lr=${encodeURIComponent(lrNumber)}`)
		.then(res => {
			if (!res.ok) throw new Error("No data found");
			return res.json();
		})
		.then(data => {
			window.lastSearchResult = data;

			const gst = (data.sgst || 0) + (data.cgst || 0) + (data.igst || 0);
			const grandTotal = (data.freight || 0) + gst;

			// 🔽 Start article table generation
			let articlesHtml = "";
			if (Array.isArray(data.articleDetails) && data.articleDetails.length > 0) {
				articlesHtml = `
					<hr>
					<h6 class="text-center text-success mt-3">🧾 Article Details</h6>
					<div class="table-responsive">
						<table class="table table-sm table-bordered text-center">
							<thead class="table-light">
								<tr>
									<th>Article</th>
									<th>Qty</th>
									<th>Type</th>
									<th>Said To Contain</th>
									<th>Amount</th>
									<th>Total</th>
								</tr>
							</thead>
							<tbody>`;

				data.articleDetails.forEach(a => {
					articlesHtml += `
						<tr>
							<td>${a.article || '-'}</td>
							<td>${a.artQty || '-'}</td>
							<td>${a.artType || '-'}</td>
							<td>${a.saidToContain || '-'}</td>
							<td>${a.artAmt || '-'}</td>
							<td>${a.total || '-'}</td>
						</tr>`;
				});

				articlesHtml += `
							</tbody>
						</table>
					</div>`;
			}

			// 🔽 Main HTML
			const html = `
				<div class="lr-search-card">
					<h5 class="text-primary mb-3">🔍 Loading Receipt: ${data.loadingReciept}</h5>

					<div class="text-end mt-3">
<button class="btn btn-warning btn-sm" onclick="enableInlineEditMode(window.lastSearchResult)">✏️ Edit</button>
						
						
					</div>

					<div class="row mb-2">
						<div class="col-md-6"><strong>Status:</strong> ${data.consignStatus || 'N/A'}</div>
						<div class="col-md-6"><strong>Booked On:</strong> ${formatDate(data.bookingDate)}</div>
					</div>

					<div class="row mb-2">
						<div class="col-md-6"><strong>From Branch:</strong> ${data.branchCode}</div>
						<div class="col-md-6"><strong>To Branch:</strong> ${data.destinationBranchCode}</div>
					</div>

					<hr>

					<div class="row mb-2">
						<div class="col-md-6"><strong>Consignor:</strong> ${data.consignorName} (${data.consignorMobile})</div>
						<div class="col-md-6"><strong>Consignee:</strong> ${data.consigneeName} (${data.consigneeMobile})</div>
					</div>

					<div class="row mb-2">
						<div class="col-md-6"><strong>Invoice:</strong> ${data.invoiceNumber || '-'} (₹${data.invoiceValue || 0})</div>
						<div class="col-md-6"><strong>E-WayBill:</strong> ${data.eWayBillNumber || '-'}</div>
					</div>

					<hr>

					<div class="row mb-2">
						<div class="col-md-6"><strong>Article Type:</strong> ${data.articleType || 'N/A'}</div>
						<div class="col-md-6"><strong>Weight:</strong> ${data.articleWeight || 0} kg</div>
					</div>

					<div class="row mb-2">
						<div class="col-md-4"><strong>Freight:</strong> ₹${data.freight || 0}</div>
						<div class="col-md-4"><strong>GST:</strong> ₹${gst.toFixed(2)}</div>
						<div class="col-md-4"><strong>Grand Total:</strong> ₹${grandTotal.toFixed(2)}</div>
					</div>

					${articlesHtml}
				</div>
			`;

			hideAllForms(); // custom function to hide other forms
			container.innerHTML = html;
			container.style.display = "block";
			document.getElementById("lrSearchInput").value = "";
			container.scrollIntoView({ behavior: "smooth" });
		})
		.catch(err => {
			console.error(err);
			container.innerHTML = `<div class="alert alert-danger mt-3">No record found for LR: <strong>${lrNumber}</strong></div>`;
			container.style.display = 'block';
		});
}


function formatDate(dt) {
	if (!dt) return '-';
	const date = new Date(dt);
	return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

function safeAssign(id, value) {
	const el = document.getElementById(id);
	if (el) el.value = value != null ? value : "";
}

function setSelectValue(id, value) {
	const select = document.getElementById(id);
	if (!select) return;

	const options = Array.from(select.options);
	const match = options.find(opt => opt.value === value);

	if (match) {
		select.value = value;
	} else {
		// Optional: Add unknown value dynamically (for edit mode)
		const newOption = new Option(value, value, true, true);
		select.appendChild(newOption);
		select.value = value;
	}
}




function setupLRSearch() {

	const searchInput = document.getElementById("lrSearchInput");
	const searchButton = document.getElementById("lrSearchBtn");

	searchButton.addEventListener("click", () => {
		const lrNumber = searchInput.value.trim();
		if (!lrNumber) {
			showCustomAlert("Please enter LR number to search.");
			return;
		}
		searchLRByNumber(lrNumber);
	});

	searchInput.addEventListener("keypress", function(e) {
		if (e.key === "Enter") {
			searchButton.click();
		}
	});
}

function resetArticleInputRow() {
	document.getElementById("article").selectedIndex = 0;
	document.getElementById("artQuantity").value = 0;
	document.getElementById("artType").selectedIndex = 0;
	document.getElementById("saidToContain").selectedIndex = 0;
	document.getElementById("artAmount").value = 0;
}

function addArticle() {
	const articleEl = document.getElementById("article");
	const artQtyEl = document.getElementById("artQuantity");
	const artTypeEl = document.getElementById("artType");
	const saidToContainEl = document.getElementById("saidToContain");
	const artAmtEl = document.getElementById("artAmount");

	const article = articleEl.value;
	const artQty = parseFloat(artQtyEl.value) || 0;
	const artType = artTypeEl.value;
	const saidToContain = saidToContainEl.value;
	const artAmt = parseFloat(artAmtEl.value) || 0;
	const total = artQty * artAmt;

	if (artQty <= 0 || artAmt <= 0) {
		showCustomAlert("Please enter valid article quantity and amount");
		return;
	}

	const tbody = document.getElementById("editArticleTableBody");
	const row = document.createElement("tr");
	row.innerHTML = `
        <td>${article}</td>
        <td>${artQty}</td>
        <td>${artType}</td>
        <td>${saidToContain}</td>
        <td>${artAmt}</td>
        <td>${total.toFixed(2)}</td>
        <td><button type="button" class="btn btn-sm btn-danger" onclick="removeArticle(this)">Remove</button></td>
    `;
	tbody.appendChild(row);

	// Reset the input row
	resetArticleInputRow();

	calculateCharges();
}

function removeArticle(btn) {
	btn.closest("tr").remove();
	calculateCharges();

	// Reset the input row after delete too
	resetArticleInputRow();
}

function calculateCharges() {
	const rows = document.querySelectorAll("#editArticleTableBody tr");
	let freight = 0;

	rows.forEach(row => {
		const totalCell = row.querySelectorAll("td")[5];
		freight += parseFloat(totalCell.textContent) || 0;
	});

	const loadingCharge = parseFloat(document.getElementById("loadingCharge").value) || 0;
	const lrCharge = parseFloat(document.getElementById("lrCharge").value) || 0;

	let sgst = 0, cgst = 0, igst = 0, grandTotal = 0;

	const consignorGST = (document.getElementById("consignorGST") || {}).value || "";
	const consigneeGST = (document.getElementById("consigneeGST") || {}).value || "";

	if (freight > 0) {
		// current behavior: GST calculated on freight only (same as existing logic)
		if (consignorGST.trim() || consigneeGST.trim()) {
			sgst = parseFloat((freight * 0.025).toFixed(2));
			cgst = parseFloat((freight * 0.025).toFixed(2));
			igst = parseFloat((freight * 0.05).toFixed(2));
		}
	}

	grandTotal = freight + loadingCharge + lrCharge + sgst + cgst;

	// Update fields (always show panel even if freight = 0)
	document.getElementById("freight").value = freight.toFixed(2);
	document.getElementById("sgst").value = sgst.toFixed(2);
	document.getElementById("cgst").value = cgst.toFixed(2);
	document.getElementById("igst").value = igst.toFixed(2);
	document.getElementById("grandTotal").value = grandTotal.toFixed(2);

	// Reset to 0 if no articles
	if (rows.length === 0) {
		document.getElementById("freight").value = "0.00";
		document.getElementById("sgst").value = "0.00";
		document.getElementById("cgst").value = "0.00";
		document.getElementById("igst").value = "0.00";
		document.getElementById("grandTotal").value = "0.00";
	}
}




document.addEventListener("DOMContentLoaded", setupLRSearch);

document.getElementById("lrSearchInput").addEventListener("input", (e) => {
	const val = e.target.value.trim();
	if (!val) {
		document.getElementById("lrSearchResultContainer").style.display = "none";
	}
});


document.addEventListener("keydown", function(e) {
	if (e.key === "F7") {
		e.preventDefault();
		setPaymentMode('PAID');
	} else if (e.key === "F8") {
		e.preventDefault();
		setPaymentMode('TO PAY');
	} else if (e.key === "F9") {
		e.preventDefault();
		setPaymentMode('TBB');
	}
});
// Set default to TO PAY when page loads (only if not set already)
window.addEventListener("DOMContentLoaded", () => {
	setPaymentMode("TO PAY");
});
document.getElementById("consignorMobile").addEventListener("input",
	function(e) {
		this.value = this.value.replace(/[^0-9]/g, '');
	});

document.getElementById("consigneeMobile").addEventListener("input",
	function(e) {
		this.value = this.value.replace(/[^0-9]/g, '');
	});

// Set 5-minute idle timeout
let timer;
function resetTimer() {
	clearTimeout(timer);
	timer = setTimeout(() => {
		logout();
	}, 5 * 60 * 1000); // 5 minutes
}
document.onload = resetTimer;
document.onmousemove = resetTimer;
document.onkeypress = resetTimer;

//global search scripts here
function showGlobalSearchForm() {
	hideAllForms();

	document.getElementById("globalSearchFormContainer").style.display = "block";
	loadGlobalRegions();
	resetGlobalSearch();
}

async function loadGlobalRegions() {
	const companyCode = userData.companyAndBranchDeatils.companyCode;
	const res = await fetch(`/region/regions?companyCode=${encodeURIComponent(companyCode)}`);
	const list = await res.json();
	const regionSelect = document.getElementById('gRegion');
	regionSelect.innerHTML = '<option value="">-- Select Region --</option>';
	list.forEach(r => regionSelect.add(new Option(r, r)));
}

document.getElementById('gRegion').addEventListener('change', async (e) => {
	const region = e.target.value;
	document.getElementById('gSubregion').innerHTML = '<option value="">-- Select Sub-region --</option>';
	document.getElementById('gBranch').innerHTML = '<option value="">-- Select Branch --</option>';
	if (region) {
		const res = await fetch(`/region/subregions?region=${encodeURIComponent(region)}`);
		const list = await res.json();
		list.forEach(r => document.getElementById('gSubregion').add(new Option(r, r)));
	}
});

document.getElementById("gSubregion").addEventListener("change", async (e) => {
	const region = document.getElementById("gRegion")?.value?.trim();
	const subregion = e.target.value?.trim();

	// ✅ Check if both selected
	if (!region || !subregion) return;

	try {
		const res = await fetch(`/region/branches?region=${encodeURIComponent(region)}&subRegion=${encodeURIComponent(subregion)}`);
		const data = await res.json();

		// 🔄 Format: "BranchName-CODE" → { text: BranchName, value: CODE }
		const formatted = data.map(item => {
			const [name, code] = item.split("-");
			return {
				text: name.trim(),
				value: code.trim()
			};
		});

		fillBranchSelect("gBranch", formatted);
	} catch (err) {
		console.error("Failed to load branches:", err);
	}
});

function fillBranchSelect(selectId, options) {
	const select = document.getElementById(selectId);
	select.innerHTML = '<option value="">-- Select Branch --</option>';

	options.forEach(opt => {
		const option = document.createElement("option");
		option.textContent = opt.text;
		option.value = opt.value;
		select.appendChild(option);
	});
}

let globalLastSeenBookingId = null;
let globalAllData = [];
let globalHasMore = true;
let globalIsLoading = false;
let snoCounter = 1; // 🔑 Serial number counter

function generateGlobalBookingReport() {
	const from = document.getElementById("gFromDate").value;
	const to = document.getElementById("gToDate").value;
	const state = document.getElementById("gRegion").value;
	const city = document.getElementById("gSubregion")?.value || null;
	const branchCode = document.getElementById("gBranch")?.value || null;

	if (!from || !to) {
		showCustomAlert("Please select From and To dates");
		return;
	}

	globalLastSeenBookingId = null;
	globalAllData = [];
	globalHasMore = true;
	globalIsLoading = false;
	snoCounter = 1; // 🔑 reset S.No

	document.getElementById("globalSearchTableContainer").innerHTML = "";
	document.getElementById("globalBookingSummaryContainer").innerHTML = "";

	loadMoreGlobalData({ from, to, state, city, branchCode });
}

function loadMoreGlobalData(filters) {
	if (!globalHasMore || globalIsLoading) return;
	globalIsLoading = true;
	document.getElementById("globalLoadingIndicator").style.display = "block";

	const payload = {
		fromDate: filters.from + "T00:00:00",
		toDate: filters.to + "T23:59:59",
		state: filters.state,
		city: filters.city,
		branchCode: filters.branchCode,
		lastId: globalLastSeenBookingId
	};

	fetch("/api/bookings/get-Global-Search-Reports", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload)
	})
		.then((res) => res.json())
		.then((response) => {
			const data = response.content || [];
			if (!Array.isArray(data) || data.length === 0) {
				globalHasMore = false;
				if (globalAllData.length > 0) showGlobalSummary(globalAllData);
				return;
			}

			globalLastSeenBookingId = response.lastId || null;
			globalAllData.push(...data);
			appendGlobalUI(data);
		})
		.catch((err) => console.error("Error fetching global data:", err))
		.finally(() => {
			globalIsLoading = false;
			document.getElementById("globalLoadingIndicator").style.display = "none";
		});
}



function appendGlobalUI(data) {
	const container = document.getElementById("globalSearchTableContainer");
	let table = container.querySelector("table");

	if (!table) {
		table = document.createElement("table");
		table.className = "table table-bordered table-striped";
		table.innerHTML = `
      <thead class="table-light">
        <tr>
          <th>S.No</th>
          <th>LR No</th>
          <th>Status</th>
          <th>Booking Date</th>
          <th>Dispatch Date</th>
          <th>Consignor</th>
          <th>Consignee</th>
          <th>From Branch</th>
          <th>To Branch</th>
          <th>Freight</th>
          <th>GST</th>
          <th>Loading Charges</th>
          <th>Total</th>
          
        </tr>
      </thead>
      <tbody></tbody>`;
		container.appendChild(table);
	}

	const tbody = table.querySelector("tbody");

	data.forEach((item) => {
		const gst = Number(item.sgst || 0) + Number(item.cgst || 0) + Number(item.igst || 0);
		const loadingCharges = Number(item.loading || 0) + Number(item.loadingCharge || 0);
		const total = Number(item.freight || 0) + gst + loadingCharges;

		const tr = document.createElement("tr");
		tr.innerHTML = `
      <td>${snoCounter++}</td>
      <td>${item.loadingReciept}</td>
      <td>${item.consignStatus}</td>
      <td>${new Date(item.bookingDate).toLocaleDateString()}</td>
      <td>${item.dispatchDate ? new Date(item.dispatchDate).toLocaleDateString() : "-"}</td>
      <td>${item.consignorName} (${item.consignorMobile || ""})</td>
      <td>${item.consigneeName} (${item.consigneeMobile || ""})</td>
      <td>${item.branchCode}</td>
      <td>${item.destinationBranchCode}</td>
      <td>${item.freight.toFixed(2)}</td>
      <td>${gst.toFixed(2)}</td>
      <td>${loadingCharges.toFixed(2)}</td>
      <td>${total.toFixed(2)}</td>`;
		tbody.appendChild(tr);
	});
}

function showGlobalSummary(data) {
	let totalFreight = 0, totalGST = 0, grandTotal = 0, totalLoadingCharges = 0;
	data.forEach((row) => {
		const freight = Number(row.freight || 0);
		const gst = Number(row.sgst || 0) + Number(row.cgst || 0) + Number(row.igst || 0);
		const loadingCharges = Number(row.loading || 0) + Number(row.loadingCharge || 0);
		totalFreight += freight;
		totalGST += gst;
		totalLoadingCharges += loadingCharges;
		grandTotal += freight + gst + totalLoadingCharges;
	});

	document.getElementById("globalBookingSummaryContainer").innerHTML = `
    <h5 class="text-center text-success">Booking Summary</h5>
    <table class="table table-bordered text-center">
      <thead class="table-light">
        <tr>
          <th>Total Freight</th>
          <th>Total GST</th>
		  <th>Total Loading Charges</th>
          <th>Grand Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${totalFreight.toFixed(2)}</td>
          <td>${totalGST.toFixed(2)}</td>
		  <td>${totalLoadingCharges.toFixed(2)}</td>
          <td>${grandTotal.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>`;
}

document.getElementById("globalSearchTableWrapper").addEventListener("scroll", () => {
	const el = document.getElementById("globalSearchTableWrapper");
	if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10 && globalHasMore && !globalIsLoading) {
		const from = document.getElementById("gFromDate").value;
		const to = document.getElementById("gToDate").value;
		const state = document.getElementById("gRegion").value;
		const city = document.getElementById("gSubregion")?.value || null;
		const branchCode = document.getElementById("gBranch")?.value || null;
		loadMoreGlobalData({ from, to, state, city, branchCode });
	}
});

function resetGlobalSearch() {
	document.getElementById('gFromDate').value = '';
	document.getElementById('gToDate').value = '';
	document.getElementById('gRegion').value = '';
	document.getElementById('gSubregion').innerHTML = '<option value="">-- Select Sub-region --</option>';
	document.getElementById('gBranch').innerHTML = '<option value="">-- Select Branch --</option>';
	document.getElementById('globalSearchTableContainer').innerHTML = '';
	document.getElementById('globalBookingSummaryContainer').innerHTML = '';
	globalAllData = [];
	globalLastSeenBookingId = null;
	globalHasMore = true;
	globalIsLoading = false;
}

// View-Only Mode Upgrade: In-place editing of LR


function enableInlineEditMode(data) {
	const container = document.getElementById("lrSearchResultContainer");
	if (!container) return;

	container.innerHTML = `
    <h5 class="text-primary mb-3">✏️ Edit Booking: ${data.loadingReciept}</h5>

    <div class="row">
      <div class="col-md-6">
        <label><strong>Consignor Name</strong></label>
        <input class="form-control form-control-sm" id="consignorName" value="${data.consignorName || ''}">
        <label><strong>Mobile</strong></label>
        <input class="form-control form-control-sm" id="consignorMobile" value="${data.consignorMobile || ''}">
        <label><strong>Address</strong></label>
        <input class="form-control form-control-sm" id="consignorAddress" value="${data.consignorAddress || ''}">
      </div>
      <div class="col-md-6">
        <label><strong>Consignee Name</strong></label>
        <input class="form-control form-control-sm" id="consigneeName" value="${data.consigneeName || ''}">
        <label><strong>Mobile</strong></label>
        <input class="form-control form-control-sm" id="consigneeMobile" value="${data.consigneeMobile || ''}">
        <label><strong>Address</strong></label>
        <input class="form-control form-control-sm" id="consigneeAddress" value="${data.consigneeAddress || ''}">
      </div>
    </div>

    <hr>
    <h6 class="text-success mt-2">🧾 Article Details</h6>
    <table class="table table-bordered table-sm">
      <thead>
        <tr>
          <th>Article</th><th>Qty</th><th>Type</th><th>Said To Contain</th><th>Amount</th><th>Total</th><th>❌</th>
        </tr>
      </thead>
      <tbody id="editArticleTableBody"></tbody>
    </table>
    <div class="mb-3">
      <button class="btn btn-sm btn-success" onclick="addInlineArticleRow()">➕ Add Article</button>
    </div>

    <hr>
    <h6 class="text-success">💰 Charges</h6>
    <div class="row">
      <div class="col-md-3">
        <label>Freight</label>
        <input class="form-control form-control-sm" id="freight" value="${data.freight || 0}" readonly>
      </div>
      <div class="col-md-3">
        <label>SGST</label>
        <input class="form-control form-control-sm" id="sgst" value="${data.sgst || 0}" readonly>
      </div>
      <div class="col-md-3">
        <label>CGST</label>
        <input class="form-control form-control-sm" id="cgst" value="${data.cgst || 0}" readonly>
      </div>
      <div class="col-md-3">
        <label>IGST</label>
        <input class="form-control form-control-sm" id="igst" value="${data.igst || 0}" readonly>
      </div>
    </div>
    <div class="row mt-2">
      <div class="col-md-4 offset-md-8">
        <label>Grand Total</label>
        <input class="form-control form-control-sm text-success fw-bold" id="grandTotal" value="${(data.freight + data.sgst + data.cgst + data.igst).toFixed(2)}" readonly>
      </div>
    </div>

    <div class="text-end mt-3">
      <button class="btn btn-primary" onclick="submitInlineEdit('${data.loadingReciept}')">🔄 Update Booking</button>
    </div>
  `;

	(data.articleDetails || []).forEach(a => addInlineArticleRow(a));
	recalculateInlineCharges();
}
// Function to update charges panel based on articles table
function updateChargesPanelFromArticles() {
	let totalFreight = 0;

	// Loop through booking articles table rows and sum freight
	document.querySelectorAll("#articlesTable tbody tr").forEach(row => {
		let weight = parseFloat(row.cells[1]?.innerText) || 0;
		let rate = parseFloat(row.cells[2]?.innerText) || 0;
		totalFreight += weight * rate;
	});

	// Update freight
	document.getElementById("freight").value = totalFreight.toFixed(2);

	// User editable values
	let loadingCharge = parseFloat(document.getElementById("loadingCharge").value) || 0;
	let lrCharge = parseFloat(document.getElementById("lrCharge").value) || 0;

	// Tax calculations
	let sgst = totalFreight * 0.025;
	let cgst = totalFreight * 0.025;
	let igst = totalFreight * 0.05;

	document.getElementById("sgst").value = sgst.toFixed(2);
	document.getElementById("cgst").value = cgst.toFixed(2);
	document.getElementById("igst").value = igst.toFixed(2);

	// Grand total
	let grandTotal = totalFreight + loadingCharge + lrCharge + sgst + cgst + igst;
	document.getElementById("grandTotal").value = grandTotal.toFixed(2);
}

// Update charges when loading or LR charge changes
document.getElementById("loadingCharge").addEventListener("input", updateChargesPanelFromArticles);
document.getElementById("lrCharge").addEventListener("input", updateChargesPanelFromArticles);

// Show charges panel on page load
document.getElementById("chargesPanel").style.display = "block";

function addInlineArticleRow(article = {}) {
	const tbody = document.getElementById("editArticleTableBody");
	if (!tbody) return;

	const row = tbody.insertRow();

	row.innerHTML = `
    <td>
      <select class="form-select form-select-sm articleDropdown" onchange="recalculateInlineRow(this)">
        <option value="Article" ${article.article === "Article" ? "selected" : ""}>Article</option>
        <option value="Weight" ${article.article === "Weight" ? "selected" : ""}>Weight</option>
        <option value="Fix" ${article.article === "Fix" ? "selected" : ""}>Fix</option>
      </select>
    </td>
    <td><input type="number" class="form-control form-control-sm qtyInput" value="${article.artQty || 0}" onchange="recalculateInlineRow(this)"></td>
    <td>
      <select class="form-select form-select-sm artTypeDropdown" onchange="recalculateInlineRow(this)">
       <option value="Auto Parts" ${article.saidToContain === "Auto Parts" ? "selected" : ""}>Auto Parts</option>
        <option value="Electronics" ${article.saidToContain === "Electronics" ? "selected" : ""}>Electronics</option>
        <option value="Garments" ${article.saidToContain === "Garments" ? "selected" : ""}>Garments</option>
      </select>
    </td>
    <td>
      <select class="form-select form-select-sm containDropdown" onchange="recalculateInlineRow(this)">
        
        <option value="Spare Parts" ${article.artType === "Spare Parts" ? "selected" : ""}>Spare Parts</option>
        <option value="Components" ${article.artType === "Fragile" ? "selected" : ""}>Components</option>
              <option value="Accessories" ${article.artType === "Accessories" ? "selected" : ""}>Accessories</option>
      
      </select>
    </td>
    <td><input type="number" class="form-control form-control-sm amtInput" value="${article.artAmt || 0}" onchange="recalculateInlineRow(this)"></td>
    <td><input type="number" class="form-control form-control-sm totalInput" value="${(article.artQty || 0) * (article.artAmt || 0)}" readonly></td>
    <td><button class="btn btn-sm btn-danger" onclick="this.closest('tr').remove(); recalculateInlineCharges();">Delete</button></td>
  `;
	updateChargesPanelFromArticles();
}

function recalculateInlineRow(input) {
	const row = input.closest("tr");
	if (!row) return;

	const qty = parseFloat(row.querySelector(".qtyInput")?.value || 0);
	const amt = parseFloat(row.querySelector(".amtInput")?.value || 0);
	const total = qty * amt;
	row.querySelector(".totalInput").value = total.toFixed(2);

	recalculateInlineCharges();
}

function recalculateInlineCharges() {
	const rows = document.querySelectorAll("#editArticleTableBody tr");
	let totalFreight = 0;

	rows.forEach(row => {
		const total = parseFloat(row.querySelector(".totalInput")?.value || 0);
		totalFreight += total;
	});

	document.getElementById("freight").value = totalFreight.toFixed(2);
	const sgst = (totalFreight * 0.025).toFixed(2);
	const cgst = (totalFreight * 0.025).toFixed(2);
	const igst = (totalFreight * 0.05).toFixed(2);
	const grandTotal = (parseFloat(totalFreight) + parseFloat(sgst) + parseFloat(cgst) + parseFloat(igst)).toFixed(2);

	document.getElementById("sgst").value = sgst;
	document.getElementById("cgst").value = cgst;
	document.getElementById("igst").value = igst;
	document.getElementById("grandTotal").value = grandTotal;
}
function submitInlineEdit(lrNumber) {
	const bookingData = {
		consignorName: document.getElementById("consignorName").value,
		consignorMobile: document.getElementById("consignorMobile").value,
		consignorAddress: document.getElementById("consignorAddress").value,
		consigneeName: document.getElementById("consigneeName").value,
		consigneeMobile: document.getElementById("consigneeMobile").value,
		consigneeAddress: document.getElementById("consigneeAddress").value,
		invoiceNumber: document.getElementById("invoiceNo")?.value || "", // if present
		invoiceValue: parseFloat(document.getElementById("Invoicevalue")?.value || 0),
		eWayBillNumber: document.getElementById("ewayBill")?.value || "",
		destinationBranchCode: "", // Optional, fetch from another field if needed
		articleDetails: extractInlineArticleData(), // ✅ NEW version below
		freight: parseFloat(document.getElementById("freight").value || 0),
		sgst: parseFloat(document.getElementById("sgst").value || 0),
		cgst: parseFloat(document.getElementById("cgst").value || 0),
		igst: parseFloat(document.getElementById("igst").value || 0),
		grandTotal: parseFloat(document.getElementById("grandTotal").value || 0)
	};

	fetch(`/api/bookings/bookLoad/${encodeURIComponent(lrNumber)}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(bookingData)
	})
		.then(response => response.json())
		.then(result => {
			if (result && result.loadingReciept) {
				showCustomAlert("Booking updated successfully!");
				searchLRByNumber(lrNumber);
			} else {
				showCustomAlert("Update failed");
			}
		})
		.catch(err => {
			console.error("Error:", err);
			showCustomAlert("Update error occurred");
		});
}
function extractInlineArticleData() {
	const rows = document.querySelectorAll("#editArticleTableBody tr");
	const articles = [];

	rows.forEach(row => {
		const article = row.querySelector(".articleDropdown")?.value;
		const qty = parseFloat(row.querySelector(".qtyInput")?.value || 0);
		const type = row.querySelector(".artTypeDropdown")?.value;
		const contain = row.querySelector(".containDropdown")?.value;
		const amt = parseFloat(row.querySelector(".amtInput")?.value || 0);
		const total = parseFloat(row.querySelector(".totalInput")?.value || 0);

		articles.push({
			article: article,
			artQty: qty,
			artType: contain,
			saidToContain: type,
			artAmt: amt,
			companyCode: userData.companyAndBranchDeatils.companyCode,
			total: total
		});
	});

	return articles;
}


//operation tab logic

let isResetting = false;


async function loadOperationDropdowns() {
	const companyCode = userData?.companyAndBranchDeatils?.companyCode;
	if (!companyCode) return;

	try {
		const regionsRes = await fetch(`/region/regions?companyCode=${companyCode}`);
		const regions = await regionsRes.json();

		fillSelect("opRegion", regions);
		fillSelect("opSubregion", []);
		fillSelect("opBranch", []);

	} catch (e) {
		console.error("Dropdowns load error:", e);
	}
}

document.getElementById("opRegion").addEventListener("change", async (e) => {
	const region = e.target.value;
	fillSelect("opSubregion", []);
	fillSelect("opBranch", []);
	if (!region) return;
	const res = await fetch(`/region/subregions?region=${region}`);
	const data = await res.json();
	fillSelect("opSubregion", data);
});

document.getElementById("opSubregion").addEventListener("change", async (e) => {
	const region = document.getElementById("opRegion").value;
	const sub = e.target.value;
	if (!region || !sub) return;
	const res = await fetch(`/region/branches?region=${region}&subRegion=${sub}`);
	const data = await res.json();
	const formatted = data.map(item => {
		const [name, code] = item.split("-");
		return { text: name, value: code };
	});

	fillSelect("opBranch", formatted);
});
function fillSelect(id, list) {
	const el = document.getElementById(id);
	el.innerHTML = `<option value="">-- Select --</option>`;
	list.forEach(item => {
		const val = item.code || item.value || item;
		const text = item.name || item.text || item;
		el.innerHTML += `<option value="${val}">${text}</option>`;
	});
}
async function findOperationBookings() {
	const from = document.getElementById("opFromDate").value;
	const to = document.getElementById("opToDate").value;
	const region = document.getElementById("opRegion").value;
	const sub = document.getElementById("opSubregion").value;
	const branch = document.getElementById("opBranch").value;
	const emp = document.getElementById("opEmployee").value;

	let url = `/api/bookings/report?fromDate=${from}T00:00:00&toDate=${to}T23:59:59&status=${currentOperationStatus}`;
	if (region) url += `&region=${region}`;
	if (sub) url += `&subregion=${sub}`;
	if (branch) url += `&branch=${branch}`;
	if (emp) url += `&employee=${emp}`;

	const res = await fetch(url);
	const data = await res.json();
	renderOperationResults(data.content || []);
}



function renderOperationResults(list) {
	const div = document.getElementById("operationResultsContainer");
	if (!list.length) {
		div.innerHTML = `<div class="text-danger">No bookings found.</div>`;
		return;
	}

	let html = `<table class="table table-bordered table-sm"><thead>
  <tr><th>LR No</th><th>Consignor</th><th>Consignee</th><th>Freight</th><th>Status</th><th>Date</th></tr>
  </thead><tbody>`;

	list.forEach(b => {
		html += `<tr>
      <td>${b.loadingReciept}</td>
      <td>${b.consignorName}</td>
      <td>${b.consigneeName}</td>
      <td>${b.freight}</td>
      <td>${b.consignStatus}</td>
      <td>${new Date(b.bookingDate).toLocaleDateString()}</td>
    </tr>`;
	});

	html += `</tbody></table>`;
	div.innerHTML = html;
}
function resetOperationFilters() {
	["opFromDate", "opToDate", "opRegion", "opSubregion", "opBranch", "opEmployee"].forEach(id => {
		const el = document.getElementById(id);
		if (el) el.value = "";
	});
	document.getElementById("operationResultContainer").innerHTML = "";
}


//search operation tabs
async function submitOperationReport() {

	const region = document.getElementById("opRegion").value;
	const subregion = document.getElementById("opSubregion").value;
	const branch = document.getElementById("opBranch").value;
	//const employee = document.getElementById("opEmployee").value;
	const status = currentOperationStatus;



	const payload = {

		region,
		subregion,
		branchCode: branch,
		//employeeName: employee,
		status
	};

	try {
		const res = await fetch("/operation/bookingList", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload)
		});
		const data = await res.json();

		isResetting = false;
		renderOperationReportTable(data || []);

		// ✅ Dispatch button shown only if data exists
		const dispatchBar = document.getElementById("dispatchActionBar");
		dispatchBar.style.display = (data?.length) ? "block" : "none";

		// ✅ Summary shown below
		if (data?.length) {
			displayopsBookingSummary(data);
		}
		updateDispatchButtonState();
	} catch (err) {
		console.error("Operation report error:", err);
		document.getElementById("operationResultContainer").innerHTML = "<div class='text-danger'>Error loading report</div>";
	}
}



function renderOperationReportTable(bookings) {
	const container = document.getElementById('operationResultContainer');
	//const dispatchBar = document.getElementById('dispatchActionBar');

	// 🔁 Reset result container
	container.innerHTML = '';

	// 🔁 Hide dispatch button if no data
	if (!bookings || bookings.length === 0) {
		if (dispatchBar) dispatchBar.style.display = "none";
		container.innerHTML = "<div class='text-muted'>No bookings found.</div>";
		return;
	}

	/*// ✅ Show Dispatch Button
	if (dispatchBar) dispatchBar.style.display = "block";*/

	// 🧱 Build table
	const table = document.createElement('table');
	table.className = 'table table-bordered table-sm table-hover mb-0';
	table.innerHTML = `
		<thead class="table-light">
			<tr>
				<th><input type="checkbox" id="selectAll" onclick="toggleAllCheckboxes(this)"></th>
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
				<th>Loading</th>
				<th>Loading Charges</th>
				<th>ConsignStatus</th>
				<th>Booking Date</th>
			</tr>
		</thead>
		<tbody></tbody>
	`;

	const tbody = table.querySelector("tbody");

	bookings.forEach(booking => {
		const row = document.createElement("tr");
		row.innerHTML = `
			<td><input type="checkbox" class="bookingCheckbox" value="${booking.loadingReciept}"></td>
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
			<td>${booking.loading}</td>
			<td>${booking.loadingCharge}</td>
			<td>${booking.consignStatus}</td>
			<td>${new Date(booking.bookingDate).toLocaleDateString()}</td>
		`;
		tbody.appendChild(row);
	});
	const dispatchBar = document.getElementById("dispatchActionBar");

	// Reset button initially
	if (dispatchBar) {
		dispatchBar.style.display = "none";
		//dispatchBar.disabled = true;
	}

	const checkboxes = document.querySelectorAll(".bookingCheckbox");
	checkboxes.forEach(cb => {
		cb.addEventListener("change", () => {
			const anyChecked = document.querySelectorAll(".bookingCheckbox:checked").length > 0;
			if (dispatchBar) {
				dispatchBar.style.display = anyChecked ? "inline-block" : "none";
				//dispatchBar.disabled = !anyChecked;
			}
		});
	});


	container.appendChild(table);

	// ✅ Finally show summary
	displayopsBookingSummary(bookings);
}

function toggleAllCheckboxes(source) {
	const checkboxes = document.querySelectorAll('.bookingCheckbox');
	checkboxes.forEach(cb => cb.checked = source.checked);

	const dispatchBar = document.getElementById("dispatchActionBar");
	if (dispatchBar) {
		dispatchBar.style.display = source.checked ? "inline-block" : "none";
		dispatchBar.disabled = !source.checked;
	}
}


function displayopsBookingSummary(bookings) {
	if (isResetting || !bookings || bookings.length === 0) return;

	const container = document.getElementById("bookingopsSummaryContainer");
	if (!container) return;

	container.innerHTML = "";
	container.style.display = "block";

	const summary = {
		auto: { freight: 0, gst: 0, grandTotal: 0, },
		manual: { freight: 0, gst: 0, grandTotal: 0 },
		total: { freight: 0, gst: 0, grandTotal: 0 },
		//totalLoadingCharges: { loading: 0, loadingCharge: 0 }
	};

	bookings.forEach(row => {
		const type = (row.type || "").toLowerCase() === "manual" ? "manual" : "auto";
		const freight = Number(row.freight || 0);
		const sgst = Number(row.sgst || 0);
		const cgst = Number(row.cgst || 0);
		const igst = Number(row.igst || 0);
		const gst = sgst + cgst + igst;
		//const loadcharges = Number(row.loading || 0) + Number(row.loadingCharge || 0);
		const grandTotal = freight + gst /*+ totalLoadingCharges*/;
		//totalLoadingCharges += loadcharges;
		summary[type].freight += freight;
		summary[type].gst += gst;
		summary[type].grandTotal += grandTotal;

		summary.total.freight += freight;
		summary.total.gst += gst;
		summary.total.grandTotal += grandTotal;
	});

	const html = `
		<div class="mt-4">
			<h5 class="text-center text-success">BOOKING SUMMARY</h5>
			<table class="table table-bordered text-center">
				<thead class="table-light">
					<tr>
						<th>Type</th>
						<th>Total Freight</th>
						<th>GST (SGST+CGST+IGST)</th>
						<th>Grand Total</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Auto</td>
						<td>${summary.auto.freight.toFixed(2)}</td>
						<td>${summary.auto.gst.toFixed(2)}</td>
						<td>${summary.auto.grandTotal.toFixed(2)}</td>
					</tr>
					<tr>
						<td>Manual</td>
						<td>${summary.manual.freight.toFixed(2)}</td>
						<td>${summary.manual.gst.toFixed(2)}</td>
						<td>${summary.manual.grandTotal.toFixed(2)}</td>
					</tr>
					<tr class="table-danger fw-bold">
						<td>Total</td>
						<td>${summary.total.freight.toFixed(2)}</td>
						<td>${summary.total.gst.toFixed(2)}</td>
						<td>${summary.total.grandTotal.toFixed(2)}</td>
					</tr>
				</tbody>
			</table>
		</div>
	`;

	container.innerHTML = html;
}


function clearUnifiedFilters() {
	isResetting = true;

	const ids = ["opFromDate", "opToDate", "opRegion", "opSubregion", "opBranch"];
	ids.forEach(id => {
		const el = document.getElementById(id);
		if (el) {
			if (el.tagName === "SELECT") {
				el.selectedIndex = 0;
			} else {
				el.value = "";
			}
		}
	});

	const resultContainer = document.getElementById("operationResultContainer");
	if (resultContainer) resultContainer.innerHTML = "";

	const dispatchBar = document.getElementById("dispatchActionBar");
	if (dispatchBar) dispatchBar.style.display = "none";

	const summaryBox = document.getElementById("bookingopsSummaryContainer");
	if (summaryBox) {
		summaryBox.innerHTML = "";
		summaryBox.style.display = "none";
	}
}


function updateDispatchButtonState() {
	const checkboxes = document.querySelectorAll(".bookingCheckbox:checked");
	selectedLrNumbers = Array.from(checkboxes).map(cb => cb.value); // ✅ Always update global

	const dispatchBtn = document.getElementById("dispatchActionBar");
	if (dispatchBtn) {
		dispatchBtn.style.display = selectedLrNumbers.length > 0 ? "inline-block" : "none";
	}
}


document.addEventListener("change", function(e) {
	if (e.target.classList.contains("bookingCheckbox") || e.target.id === "selectAll") {
		updateDispatchButtonState();
	}
});

// ✅ Global variable to track selected LRs
let selectedLrNumbers = [];

/*// ✅ Dispatch Selected button click handler
function dispatchSelected() {
	const checkboxes = document.querySelectorAll(".bookingCheckbox:checked");
	selectedLrNumbers = Array.from(checkboxes).map(cb => cb.value);

	if (selectedLrNumbers.length === 0) {
		showCustomAlert("Please select at least one booking.");
		return;
	}

	showAssociateVehicleModal();
}
*/
// ✅ Open the vehicle info modal
function showAssociateVehicleModal() {
	const checkboxes = document.querySelectorAll(".bookingCheckbox:checked");
	selectedLrNumbers = Array.from(checkboxes).map(cb => cb.value);
	if (!selectedLrNumbers || selectedLrNumbers.length === 0) {
		showCustomAlert("Please select at least one booking.");
		return;
	}

	loadVehicleDropdown();
	loadBranchesDropdown();

	const modal = new bootstrap.Modal(document.getElementById("associateVehicleModal"));
	modal.show();
}

// ✅ Handle vehicle form submission and dispatch
function submitDispatchAlongWithVehicleDetails() {
	if (!selectedLrNumbers || selectedLrNumbers.length === 0) {
		showCustomAlert("No bookings selected for dispatch.");
		return;
	}

	const vehicleNumber = document.getElementById("truckNumber").value.trim();
	const vehicleName = document.getElementById("vehicleName").value.trim();
	const driverName = document.getElementById("driverName").value.trim();
	const driverPhone = document.getElementById("driverPhone").value.trim();
	const destinationBranch = document.getElementById("destinationBranchInput").value.trim();

	if (!vehicleNumber || !driverName || !driverPhone || !destinationBranch) {
		showCustomAlert("Please fill all vehicle & driver details.");
		return;
	}

	const payload = {
		vehicleNumber,
		vehicleName,
		destinationBranch,
		driverName,
		driverPhone,
		lrIds: selectedLrNumbers
	};

	fetch("/api/bookings/dispatchLoad", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload)
	})
		.then(async res => {
			if (!res.ok) throw new Error(await res.text());
			const data = await res.json();

			if (!data || !Array.isArray(data.bookings) || data.bookings.length === 0) {
				showCustomAlert("Dispatch failed: No bookings dispatched.");
				return;
			}

			openPrintWindow(data); // includes bookings + loadingSheet
			bootstrap.Modal.getInstance(document.getElementById("associateVehicleModal")).hide();
			document.getElementById("associateVehicleForm").reset();
			submitOperationReport();
		})

		.catch(err => {
			console.error("Dispatch error:", err);
			showCustomAlert("Error dispatching bookings.");
		});
}



//manage vehicle section 
function submitVehicleForm(event) {
	event.preventDefault();

	const user = userData || {};
	const companyCode = user?.companyAndBranchDeatils?.companyCode || "DEFAULT";

	const payload = {
		companyCode: companyCode,
		truckNumber: document.getElementById("vehicleTruckNumber").value.trim(),
		vehicleName: document.getElementById("vehicleVehicleName").value.trim(),
		capacity: parseFloat(document.getElementById("capacity").value),
		ownerName: document.getElementById("ownerName").value.trim(),
		vehicleType: document.getElementById("vehicleType").value,
		branchCode: userData.companyAndBranchDeatils.branchCode,
		rcNumber: document.getElementById("rcNumber").value.trim(),
		isActive: document.getElementById("isActive").value === "true"
	};

	fetch("/vehicles/associate", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload)
	})
		.then(async res => {
			if (res.status === 200) {
				showCustomAlert("Vehicle saved successfully!");
				document.getElementById("vehicleForm").reset();
			} else {
				const msg = await res.text();
				showCustomAlert("Error: " + msg);
			}
		})
		.catch(err => {
			console.error("Vehicle save failed:", err);
			showCustomAlert("Failed to save vehicle. Try again.");
		});
}



async function loadVehicleDropdown() {
	const branchCode = userData?.companyAndBranchDeatils?.branchCode;
	const truckSelect = document.getElementById("truckNumber");
	truckSelect.innerHTML = '<option value="">-- Select Truck --</option>';

	try {
		const res = await fetch(`/vehicles/active?branchCode=${branchCode}`);
		const trucks = await res.json();
		availableVehicles = trucks;

		trucks.forEach(v => {
			const opt = document.createElement("option");
			opt.value = v.truckNumber;
			opt.textContent = `${v.truckNumber} - ${v.vehicleName}`;
			truckSelect.appendChild(opt);
		});
	} catch (err) {
		console.error("Failed to load trucks", err);
	}
}

async function loadBranchesDropdown() {
	const companyCode = userData?.companyAndBranchDeatils?.companyCode;
	const myBranch = userData?.companyAndBranchDeatils?.branchCode;
	const datalist = document.getElementById("destinationBranchList");
	datalist.innerHTML = '';

	try {
		const response = await fetch(`BranchesByCompanyCode/${companyCode}`);
		const data = await response.json();

		if (data.status === "SUCCESS" && Array.isArray(data.data)) {
			data.data.forEach(branch => {
				if (branch.branchCode !== myBranch) {
					const option = document.createElement("option");
					option.value = `${branch.branchName} [${branch.branchType}] (${branch.branchCode})`;
					datalist.appendChild(option);
				}
			});
		}
	} catch (err) {
		console.error("Error loading branches:", err);
	}
}


function getSelectedBranchCode() {
	const inputVal = document.getElementById("destinationBranchInput").value;
	const match = inputVal.match(/\((.*?)\)$/); // extract branch code in (CODE)
	return match ? match[1] : null;
}




document.addEventListener("DOMContentLoaded", () => {
	const truckDropdown = document.getElementById("truckNumber");
	if (truckDropdown) {
		truckDropdown.addEventListener("change", () => {
			const selectedTruck = truckDropdown.value;
			const found = availableVehicles.find(v => v.truckNumber === selectedTruck);
			if (found) {
				document.getElementById("vehicleName").value = found.vehicleName || "";
			} else {
				document.getElementById("vehicleName").value = "";
			}
		});
	}
});
document.addEventListener("DOMContentLoaded", () => {
	const form = document.getElementById("vehicleForm");
	if (form) {
		form.addEventListener("submit", submitVehicleForm);
	}
});




//custom alert form
function showCustomAlert(message) {
	return new Promise((resolve) => {
		const modal = document.getElementById("customAlert");
		document.getElementById("customAlertMessage").textContent = message;

		modal.querySelector(".btn-ok").onclick = function() {
			bootstrap.Modal.getInstance(modal).hide();
			resolve();
		};

		new bootstrap.Modal(modal).show();
	});
}

function closeCustomAlert() {
	document.getElementById("customAlert").style.display = "none";
}


//get populatestates
function populateStates() {
	const states = [
		"Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
		"Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
		"Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
		"Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
		"Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
		"Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
		"Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
	];

	const datalist = document.getElementById("stateList");
	states.forEach(state => {
		const option = document.createElement("option");
		option.value = state;
		datalist.appendChild(option);
	});
}

// Call this on page load
document.addEventListener("DOMContentLoaded", populateStates);


//endpoints protection
function protectPage() {
	const userData = sessionStorage.getItem("userData");
	if (!userData) {
		// Clear any leftovers and redirect
		sessionStorage.clear();
		window.location.href = "/login.html"; // or your login route
	}
}

window.addEventListener('DOMContentLoaded', () => {
	const today = new Date().toISOString().split('T')[0];
	document.getElementById('gFromDate').setAttribute('max', today);
	document.getElementById('gToDate').setAttribute('max', today);
});

document.addEventListener("DOMContentLoaded", () => {
	const select = $('#saidToContain');

	// Default static values
	const defaultValues = [
		{ id: 'Spare Parts', text: 'Spare Parts' },
		{ id: 'Accessories', text: 'Accessories' },
		{ id: 'Components', text: 'Components' }
	];

	select.select2({
		placeholder: "Enter said to contain",
		allowClear: true,
		tags: true, // user can add custom values
		data: defaultValues, // show default values initially
		ajax: {
			transport: function(params, success, failure) {
				const companyCode = userData.companyAndBranchDeatils.companyCode;

				// If no companyCode, fallback to default values
				if (!companyCode) {
					console.error("empty comp[anycode",);
					success({ results: defaultValues });
					return;
				}

				fetch(`/api/bookings/Get-ditinct-saidtocontains/${encodeURIComponent(companyCode)}`)
					.then(res => {
						if (!res.ok) throw new Error("Failed to fetch");
						return res.json();
					})
					.then(data => {
						// Merge API data with default values, avoiding duplicates
						const merged = [...defaultValues];
						data.forEach(item => {
							if (!merged.some(d => d.id === item)) {
								merged.push({ id: item, text: item });
							}
						});
						success({ results: merged });
					})
					.catch(err => {
						console.error("Error loading saidToContains:", err);
						success({ results: defaultValues });
					});
			},
			delay: 250
		},
		minimumInputLength: 0
	});
});

