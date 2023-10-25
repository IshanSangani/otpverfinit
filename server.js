const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');
const twilio = require('twilio');

// Set up Twilio credentials
const accountSid = 'AC0b9312bcf53fe9f793c5925a5bed3f5b';
const authToken = '73a5f1b370d027bd35587b344d55bd18';
const twilioClient = twilio(accountSid, authToken);

// Serve your HTML page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.use(express.static('public'));

io.on('connection', (socket) => {
    socket.on('generateOTP', () => {
        // Generate a random 4-digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000);

        // Replace with your actual phone number where you want to receive the OTP
        const phoneNumber = '+919372880589';

        // Send the OTP via Twilio SMS
        twilioClient.messages.create({
            to: phoneNumber,
            from: '+18583527763',
            body: `Your OTP is: ${otp}`,
        })
        .then(message => {
            console.log(`OTP sent: ${otp}`);
            socket.otp = otp; // Store the OTP in the socket object
            socket.emit('otpGenerated', otp);
        })
        .catch(error => {
            console.error(`Error sending OTP: ${error}`);
            socket.emit('otpSendError');
        });
    });

    socket.on('verifyOTP', (enteredOTP) => {
        // Get the stored OTP from the socket object
        const generatedOTP = socket.otp;

        console.log(`Entered OTP: ${enteredOTP}, Generated OTP: ${generatedOTP}`);

        if (enteredOTP === generatedOTP) {
            // OTP is correct, perform redirection
            socket.emit('redirectToVendor');
        } else {
            socket.emit('otpInvalid');
        }
    });
});

http.listen(4000, () => {
    console.log('Server is running on http://localhost:4000');
});
