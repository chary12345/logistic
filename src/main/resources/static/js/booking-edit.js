/*
// booking-edit.js

function hardLock(id) {
    const el = document.getElementById(id);
    if (!el) return;

    el.readOnly = true;
    el.style.backgroundColor = "#e9ecef";

    // 🔥 STRONG LOCK
    el.addEventListener("focus", () => el.blur());
    el.addEventListener("keydown", (e) => e.preventDefault());
}

function enableInlineEditMode(data) {

    document.getElementById("bookingFormContainer").style.display = "block";
    document.getElementById("lrSearchResultContainer").style.display = "none";

    document.getElementById("lrNumber").value = data.loadingReciept || "";

    // Populate fields
    document.getElementById("deliveryDestination").value = data.destinationBranchCode || "";

    document.getElementById("consignorName").value = data.consignorName || "";
    document.getElementById("consignorMobile").value = data.consignorMobile || "";
    document.getElementById("consignorGST").value = data.consignorGST || "";
    document.getElementById("consignorAddress").value = data.consignorAddress || "";

    document.getElementById("consigneeName").value = data.consigneeName || "";
    document.getElementById("consigneeMobile").value = data.consigneeMobile || "";
    document.getElementById("consigneeGST").value = data.consigneeGST || "";
    document.getElementById("consigneeAddress").value = data.consigneeAddress || "";

    document.getElementById("invoiceNo").value = data.invoiceNumber || "";
    document.getElementById("Invoicevalue").value = data.invoiceValue || "";
    document.getElementById("ewayBill").value = data.eWayBillNumber || "";

    // Charges
    document.getElementById("freight").value = data.freight || 0;
    document.getElementById("loadingCharge").value = data.loading || 0;
    document.getElementById("lrCharge").value = data.loadingCharge || 0;

    document.getElementById("sgst").value = data.sgst || 0;
    document.getElementById("cgst").value = data.cgst || 0;
    document.getElementById("igst").value = data.igst || 0;
    document.getElementById("grandTotal").value = data.grandTotal || 0;

    // Articles
    const tbody = document.getElementById("editArticleTableBody");
    tbody.innerHTML = "";

    if (data.articleDetails) {
        data.articleDetails.forEach(a => {
            let row = `
            <tr>
                <td>${a.article}</td>
                <td>${a.artQty}</td>
                <td>${a.artType}</td>
                <td>${a.saidToContain}</td>
                <td>${a.artAmt}</td>
                <td>${a.total}</td>
                <td>
                    <button class="btn btn-danger btn-sm"
                        onclick="this.closest('tr').remove(); calculateChargesBooking();">
                        Delete
                    </button>
                </td>
            </tr>`;
            tbody.innerHTML += row;
        });
    }

    // 🔁 Recalculate once before locking
    calculateChargesBooking();

    // 🔒 APPLY LOCKS (VERY IMPORTANT - LAST)
    hardLock("freight");
    hardLock("lrCharge");
    hardLock("sgst");
    hardLock("cgst");
    hardLock("igst");
    hardLock("grandTotal");

    hardLock("consignorGST");
    hardLock("consigneeGST");

    // Dropdown lock
    document.getElementById("deliveryDestination").disabled = true;

    // ✅ ONLY loading editable
    const loading = document.getElementById("loadingCharge");
    if (loading) {
        loading.readOnly = false;
        loading.style.backgroundColor = "";
    }

    // Loading change recalc
    document.getElementById("loadingCharge").addEventListener("input", function () {
        calculateChargesBooking();
    });

    document.querySelector("button[type='submit']").innerText = "Update Booking";
}*/
