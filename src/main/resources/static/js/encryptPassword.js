async function encryptPassword(password) {
  const encoder = new TextEncoder();
  const keyStr = "1234567890123456";   // 16-byte key
  const ivStr = "abcdefghijklmnop";    // 16-byte IV

  const keyData = encoder.encode(keyStr);
  const ivData = encoder.encode(ivStr);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    "AES-CBC",
    false,
    ["encrypt"]
  );

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-CBC", iv: ivData },
    cryptoKey,
    encoder.encode(password)
  );

  // Convert ArrayBuffer to base64
  const uint8Array = new Uint8Array(encryptedBuffer);
  let binary = "";
  uint8Array.forEach((b) => binary += String.fromCharCode(b));
  const base64Encrypted = btoa(binary);

  return base64Encrypted;
}

// Usage Example - encrypt before sending login request
(async () => {
  const plainPassword = "mypassword123";
  const encryptedPassword = await encryptPassword(plainPassword);

  // Send to backend
  fetch('/api/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      username: "user1",
      password: encryptedPassword,  // encrypted password sent
      group: "companyX"
    })
  })
  .then(res => res.json())
  .then(data => console.log(data));
})();
