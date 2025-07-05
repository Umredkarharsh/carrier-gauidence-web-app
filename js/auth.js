// js/auth.js
import {
  auth,
  db,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  doc,
  setDoc
} from './firebase.js';

// Login
const loginBtn = document.getElementById("loginBtn");
if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        alert("Login successful");
        window.location.href = "dashboard.html";
      })
      .catch((err) => alert("Login failed: " + err.message));
  });
}

// Signup
const signupBtn = document.getElementById("signupBtn");
if (signupBtn) {
  signupBtn.addEventListener("click", async () => {
    const name = document.getElementById("signupName").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;

    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const uid = userCredential.user.uid;
        await setDoc(doc(db, "users", uid), {
          name,
          email,
          uid
        });
        alert("Signup successful");
        window.location.href = "dashboard.html";
      })
      .catch((err) => alert("Signup failed: " + err.message));
  });
}

// Switch Views
window.switchToSignup = () => {
  document.getElementById("authBox").style.display = "none";
  document.getElementById("signupBox").style.display = "block";
};

window.switchToLogin = () => {
  document.getElementById("signupBox").style.display = "none";
  document.getElementById("authBox").style.display = "block";
};
