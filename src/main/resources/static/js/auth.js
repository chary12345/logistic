
function protectPage() {
  const userData = sessionStorage.getItem("user");
  if (!userData) {
    document.body.innerHTML = "";
    alert("You're not signed in. Please log in to access this page.");
    sessionStorage.clear();
    window.location.href = "/";
    return false;
  }
  return true;
}
