document.getElementById("form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const phoneNumber = document.getElementById("phoneNumber").value.trim();
  const stateCode = document.getElementById("stateCode").value.trim();

  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "Checking...";

  try {
    const res = await fetch("/api/check-availability", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ phoneNumber, stateCode })
    });

    const data = await res.json();

    // ✅ Show BOTH formatted + raw JSON
    if (data.data?.agentAvailable) {
      resultDiv.innerHTML = `
        ✅ Agent Available<br>
        📞 ${data.data.transferTarget}<br><br>
        <b>Full Raw Response:</b>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      `;
    } else {
      resultDiv.innerHTML = `
        ❌ No agents available<br><br>
        <b>Full Raw Response:</b>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      `;
    }

  } catch (err) {
    console.error(err);
    resultDiv.innerHTML = "❌ Error occurred";
  }
});