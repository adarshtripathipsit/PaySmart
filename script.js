let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

let totalBalance = localStorage.getItem("totalBalance");

if (totalBalance === null) {
    totalBalance = 50000;
    localStorage.setItem("totalBalance", totalBalance);
} else {
    totalBalance = Number(totalBalance);
}


function saveData() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
    localStorage.setItem("totalBalance", totalBalance);
}




function sendMessage() {

    let input = document.getElementById("userInput");
    let message = input.value.trim();

    if (message === "") {
        alert("Please enter a message!");
        return;
    }

    let chat = document.getElementById("chat");

    let userMessage = document.createElement("p");
    userMessage.className = "user";
    userMessage.textContent = message;
    chat.appendChild(userMessage);

    let response = "";
    let text = message.toLowerCase();

    if (text.includes("hello") || text.includes("hi")) {
        response = "Hello! Welcome to PaySmart. How can I help you?";
    }
    else if (text.includes("help")) {
        response = "I can help you with payment preparation, transaction history and UPI assistance.";
    }
    else if (text.includes("pay")) {
        response = "Sure! Please provide the recipient name and payment amount.";
    }
    else if (text.includes("history")) {
        response = "You can view your transactions in the Recent Transactions section.";
    }
    else if (text.includes("balance")) {
        response = "Your current demo balance is ₹" +
            totalBalance.toLocaleString("en-IN");
    }
    else {
        response = "Sorry, I didn't understand that. Please type Help to see available commands.";
    }

    let botMessage = document.createElement("p");
    botMessage.className = "bot";
    botMessage.textContent = response;
    chat.appendChild(botMessage);

    chat.scrollTop = chat.scrollHeight;
    input.value = "";
}




function makePayment() {

    let recipient = document.getElementById("recipient").value.trim();
    let upiId = document.getElementById("upiId").value.trim();
    let amount = Number(document.getElementById("amount").value);

    let result = document.getElementById("paymentResult");

    if (
        recipient === "" ||
        upiId === "" ||
        amount <= 0 ||
        !Number.isFinite(amount)
    ) {
        result.style.color = "red";
        result.textContent = "Please enter valid payment details!";
        return;
    }

    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(upiId)) {
        result.style.color = "red";
        result.textContent = "Please enter a valid demo UPI ID!";
        return;
    }

    if (amount > totalBalance) {
        result.style.color = "red";
        result.textContent = "Insufficient demo balance!";
        return;
    }

    let confirmPay = confirm(
        "Confirm Demo Payment\n\nRecipient: " + recipient +
        "\nUPI ID: " + upiId +
        "\nAmount: ₹" + amount
    );

    if (!confirmPay) {
        return;
    }

    
    let transaction = {
        name: recipient,
        upi: upiId,
        amount: amount,
        date: new Date().toLocaleString()
    };

    
    totalBalance = totalBalance - amount;

    transactions.push(transaction);

    
    saveData();
    displayTransactions();
    updateDashboardStats();

    result.style.color = "green";
    result.textContent =
        "Demo Payment Successful! ₹" +
        amount + " paid to " + recipient +
        ". No real money was transferred.";

    
    document.getElementById("recipient").value = "";
    document.getElementById("upiId").value = "";
    document.getElementById("amount").value = "";
}




function displayTransactions() {

    let list = document.getElementById("transactionList");

    list.innerHTML = "";

    if (transactions.length === 0) {
        list.textContent = "No transactions yet.";
        return;
    }

    transactions.slice().reverse().forEach(function(tx) {

        let item = document.createElement("div");

        item.className = "transaction-item";

        item.textContent =
            tx.name + " | ₹" + Number(tx.amount).toLocaleString("en-IN") +
            " | " + tx.date +
            " | SIMULATED";

        list.appendChild(item);
    });
}




function updateDashboardStats() {

    let total = transactions.length;
    let totalAmount = 0;

    transactions.forEach(function(tx) {
        totalAmount += Number(tx.amount);
    });

    document.getElementById("totalTransactions").textContent = total;

    document.getElementById("totalPayments").textContent =
        "₹" + totalAmount.toLocaleString("en-IN");

    document.getElementById("totalBalance").textContent =
        "₹" + totalBalance.toLocaleString("en-IN");
}




function startVoice() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert("Voice recognition is not supported. Please use Chrome.");
        return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = function() {
        alert("Listening... Speak your command!");
    };

    recognition.onresult = function(event) {

        let spokenText = event.results[0][0].transcript;

        document.getElementById("userInput").value = spokenText;

        sendMessage();
    };

    recognition.onerror = function() {
        alert("Voice recognition failed. Please try again.");
    };

    recognition.start();
}



function toggleTheme() {

    document.body.classList.toggle("dark");

    let button = document.getElementById("themeToggle");

    if (document.body.classList.contains("dark")) {
        button.textContent = "☀️ Light Mode";
    } else {
        button.textContent = "🌙 Dark Mode";
    }
}



displayTransactions();
updateDashboardStats();

// ===============================
// PAYSMART UPI RECEIVE PAYMENT
// ===============================

const myUPI = "9455020590@sbi";

// Generate Dynamic UPI QR
function generateUPIQR() {
    const amount = Number(document.getElementById("receiveAmount").value);
    const qrContainer = document.getElementById("upiQR");
    const qrResult = document.getElementById("qrResult");

    qrContainer.innerHTML = "";
    qrResult.innerText = "";

    if (!amount || amount <= 0) {
        qrResult.innerText = "Please enter a valid amount.";
        return;
    }

    const upiLink =
        `upi://pay?pa=${encodeURIComponent(myUPI)}` +
        `&pn=${encodeURIComponent("PaySmart")}` +
        `&am=${amount.toFixed(2)}&cu=INR`;

    new QRCode(qrContainer, {
        text: upiLink,
        width: 200,
        height: 200
    });

    qrResult.innerText =
        "Scan this QR code using any supported UPI app.";
}

// Copy UPI ID
function copyMyUPI() {
    navigator.clipboard.writeText(myUPI)
        .then(() => {
            alert("UPI ID copied: " + myUPI);
        })
        .catch(() => {
            alert("Please copy your UPI ID manually: " + myUPI);
        });
}

// Open UPI App
function payUsingUPI() {
    const amount = Number(document.getElementById("receiveAmount").value);

    if (!amount || amount <= 0) {
        alert("Please enter a valid amount first.");
        return;
    }

    const upiLink =
        `upi://pay?pa=${encodeURIComponent(myUPI)}` +
        `&pn=${encodeURIComponent("PaySmart")}` +
        `&am=${amount.toFixed(2)}&cu=INR`;

    window.location.href = upiLink;
}
