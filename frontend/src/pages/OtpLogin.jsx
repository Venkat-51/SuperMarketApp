import React, { useState } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../firebase/firebase";

const OtpLogin = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loading, setLoading] = useState(false);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "normal",
          callback: () => {
            console.log("reCAPTCHA solved");
          },
          "expired-callback": () => {
            console.log("reCAPTCHA expired");
          },
        }
      );
    }
  };

  const sendOtp = async () => {
    if (!phone || phone.length !== 10) {
      alert("Enter a valid 10-digit mobile number");
      return;
    }

    try {
      setLoading(true);
      setupRecaptcha();

      const appVerifier = window.recaptchaVerifier;
      const fullPhone = `+91${phone}`;

      const result = await signInWithPhoneNumber(auth, fullPhone, appVerifier);

      setConfirmationResult(result);
      setShowOtpInput(true);
      alert("OTP sent successfully");
    } catch (error) {
      console.error("Send OTP error:", error);
      alert(error.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      alert("Enter OTP");
      return;
    }

    if (!confirmationResult) {
      alert("Please send OTP first");
      return;
    }

    try {
      setLoading(true);
      const result = await confirmationResult.confirm(otp);

      console.log("Login success:", result.user);
      alert("OTP verified successfully");

      // Example:
      // localStorage.setItem("userPhone", result.user.phoneNumber);
      // localStorage.setItem("uid", result.user.uid);
      // window.location.href = "/";
    } catch (error) {
      console.error("Verify OTP error:", error);
      alert("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
      <h2>Mobile OTP Login</h2>

      <input
        type="text"
        placeholder="Enter mobile number"
        value={phone}
        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
        maxLength={10}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "10px",
          fontSize: "16px",
        }}
      />

      <button
        onClick={sendOtp}
        disabled={loading}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "15px",
          cursor: "pointer",
        }}
      >
        {loading ? "Sending..." : "Send OTP"}
      </button>

      {showOtpInput && (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
              fontSize: "16px",
            }}
          />

          <button
            onClick={verifyOtp}
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px",
              cursor: "pointer",
            }}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </>
      )}

      <div id="recaptcha-container" style={{ marginTop: "20px" }}></div>
    </div>
  );
};

export default OtpLogin;