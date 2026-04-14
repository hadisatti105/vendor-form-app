document.getElementById("form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const phoneNumber = document.getElementById("phoneNumber").value.trim();
  const stateCode = document.getElementById("stateCode").value.trim();

  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "Checking...";

  try {
    const response = await fetch("/api/check-availability", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ phoneNumber, stateCode })
    });

    const result = await response.json();

    const apiData = result.raw?.data;

    if (apiData?.agentAvailable) {
      resultDiv.innerHTML = `
        ✅ Agent Available<br>
        📞 Transfer Target: ${apiData.transferTarget}<br>
        👥 Agents Available: ${apiData.agentCount}<br>
        🕒 Time: ${apiData.timestamp}
      `;
    } else {
      resultDiv.innerHTML = "❌ No agents available";
    }

  } catch (error) {
    console.error(error);
    resultDiv.innerHTML = "❌ Error occurred";
  }
});