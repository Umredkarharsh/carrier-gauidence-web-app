import {
    auth,
    db,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    doc,
    setDoc
} from './firebase.js';

// DOM References
const loginBtn = document.getElementById("collegeLoginBtn");
const signupBtn = document.getElementById("collegeSignupBtn");

// LOGIN FUNCTIONALITY
if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
        const email = document.getElementById("collegeLoginEmail").value;
        const password = document.getElementById("collegeLoginPassword").value;

        if (!email || !password) {
            alert("Please fill in all fields");
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            alert("Login successful");
            window.location.href = "college-dashboard.html";
        } catch (err) {
            console.error("Login error:", err);
            alert(`Login failed: ${err.message}`);
        }
    });
}

// SIGNUP FUNCTIONALITY
if (signupBtn) {
    signupBtn.addEventListener("click", async () => {
        const name = document.getElementById("collegeName").value;
        const email = document.getElementById("collegeSignupEmail").value;
        const password = document.getElementById("collegeSignupPassword").value;

        if (!name || !email || !password) {
            alert("Please fill in all fields");
            return;
        }

        try {
            const userCred = await createUserWithEmailAndPassword(auth, email, password);
            const uid = userCred.user.uid;

            await setDoc(doc(db, "colleges", uid), {
                name,
                email,
                uid,
                createdAt: new Date(),
                status: "active",
                role: "college",
                profileCompleted: false
            });

            alert("Account created successfully!");
            // Redirect to profile completion page
            window.location.href = "college-profile.html";
        } catch (err) {
            console.error("Signup error:", err);
            alert(`Signup failed: ${err.message}`);
        }
    });
}

// VIEW TOGGLE FUNCTIONS
window.switchToCollegeSignup = () => {
    document.getElementById("collegeLoginBox").classList.add("hidden");
    document.getElementById("collegeSignupBox").classList.remove("hidden");
    window.scrollTo(0, 0);
};

window.switchToCollegeLogin = () => {
    document.getElementById("collegeSignupBox").classList.add("hidden");
    document.getElementById("collegeLoginBox").classList.remove("hidden");
    window.scrollTo(0, 0);
};