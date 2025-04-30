  function showBookingForm()
    {
        document.getElementById('bookingFormContainer').style.display = 'block';
        document.getElementById('bookingReportForm').style.display = 'none';
        hideChangePasswordForm(); // Ensure password form is hidden
    }

    function showCreateBranchForm() {
        document.getElementById('createBranchForm').style.display = 'block';
        document.getElementById('bookingFormContainer').style.display = 'none';
        document.getElementById('bookingReportForm').style.display = 'none';
        hideChangePasswordForm();
    }

    function hideCreateBranchForm() {
        document.getElementById('createBranchForm').style.display = 'none';
    }

    function showReportForm(reportType) {
        if (reportType === 'booking') {
            document.getElementById('bookingReportForm').style.display = 'block';
            document.getElementById('bookingFormContainer').style.display = 'none';
            document.getElementById('reportActions').style.display = 'none'; // Initially hide the download buttons
            document.getElementById('reportTableContainer').innerHTML = ''; // Clear previous report
            document.getElementById('reportMessage').style.display = 'none';
            hideChangePasswordForm(); // Ensure password form is hidden
        }
    }

    let reportData = []; // Store the fetched report data globally

    function generateBookingReport() {
        const fromDate = document.getElementById('fromDate').value;
        const toDate = document.getElementById('toDate').value;
        const reportMessage = document.getElementById('reportMessage');
        const reportTableContainer = document.getElementById('reportTableContainer');
        const reportActions = document.getElementById('reportActions');

        // Clear previous report data and table
        reportData = [];
        reportTableContainer.innerHTML = '';
        reportMessage.style.display = 'none';
        reportActions.style.display = 'none'; // Hide buttons before new report

        // Fetch data from the API
        fetch(`/api/bookings/report?fromDate=${fromDate}&toDate=${toDate}`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    reportData = data; // Store the fetched data
                    displayReportData(data);
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
                <th>ID</th>
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
                <th>Booking Date</th>
            </tr>
        `;

        data.forEach(booking => {
            let row = reportTable.insertRow();
            row.innerHTML = `
                <td>${booking.id}</td>
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

     document.getElementById("branchForm").addEventListener("submit", async function(event) {
        event.preventDefault();

        const branchData = {
            branchName: document.getElementById("branchName").value,
            branchCode: document.getElementById("branchCode").value,
            operations: document.getElementById("branchOperations").value,
            address: document.getElementById("branchAddress").value
        };

        try {
            const response = await fetch("/api/branches/create", { // Replace with your actual API endpoint
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(branchData)
            });

            const result = await response.json();

            if (response.ok) {
                alert("Branch created successfully!");
                document.getElementById("branchForm").reset();
                hideCreateBranchForm();
            } else {
                alert(`Failed to create branch: ${result.message || 'Unknown error'}`);
            }

        } catch (error) {
            console.error("Error creating branch:", error);
            alert("An error occurred while creating the branch.");
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
    function populateUserData() {
    	 const userData = JSON.parse(sessionStorage.getItem('user'));

        document.getElementById('userFirstName').textContent = userData.firstName;
        document.getElementById('userLastName').textContent = userData.lastName;
        document.getElementById('userPhone').textContent = userData.phone;
        document.getElementById('userEmail').textContent = userData.email;
        document.getElementById('userRole').textContent = userData.role;
    }

    calculateCharges();
    showBookingForm();

    // Sample destination data (replace with your actual data source)
    const destinationOptions = [
        "New York",
        "Los Angeles",
        "Chicago",
        "Houston",
        "Phoenix",
        "Philadelphia",
        "San Antonio",
        "San Diego",
        "Dallas",
        "San Jose"
    ];

    // Function to populate the datalist
    function populateDestinations() {
        const datalist = document.getElementById("destinations");
        destinationOptions.forEach(destination => {
            const option = document.createElement("option");
            option.value = destination;
            datalist.appendChild(option);
        });
    }

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
    document.addEventListener('DOMContentLoaded', populateDestinations);