const question = document.getElementById("question");
const submitBtn = document.getElementById("submitBtn");
const answer = document.getElementById("answer");

// BUTTON CLICK
submitBtn.addEventListener("click", async () => {

    // Get question from input
    const userQuestion = question.value.trim();

    // Validate input
    if (!userQuestion) {
        answer.innerText = "Please enter a question.";
        question.focus();
        return;
    }

    // Show loading message
    answer.innerText = "Thinking...";
    submitBtn.disabled = true;

    try {
        // Send request to Express backend
        const response = await fetch("/ask", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                question: userQuestion
            })
        });

        // Read backend response
        const data = await response.json();

        console.log("Backend response:", data);

        // Handle backend errors
        if (!response.ok) {
            throw new Error(
                data.error || "Something went wrong."
            );
        }

        // Display Gemini answer
        answer.innerText = data.answer || "No answer received.";

    } catch (error) {
        console.error("Frontend error:", error);

        answer.innerText =
            error instanceof SyntaxError
                ? "Invalid response from server. Check your backend."
                : error.message === "Failed to fetch"
                    ? "Cannot connect to backend. Check the server and CORS configuration."
                    : error.message;

    } finally {
        // Enable button again
        submitBtn.disabled = false;
    }
});
