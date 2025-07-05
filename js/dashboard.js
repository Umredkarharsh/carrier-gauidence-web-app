import {
  auth,
  db,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit
} from './firebase.js';
import {
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';

// DOM Elements
const userNameElement = document.getElementById('userName');
const greetingNameElement = document.getElementById('greetingName');
const userAvatarElement = document.getElementById('userAvatar');
const logoutBtn = document.getElementById('logoutBtn');
const recommendedCountElement = document.getElementById('recommendedCount');
const applicationsCountElement = document.getElementById('applicationsCount');
const testScoreElement = document.getElementById('testScore');
const recommendedCollegesElement = document.getElementById('recommendedColleges');

// Auth State Listener
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  loadUserData(user);
  loadDashboardStats(user.uid);
});

// Load user data
async function loadUserData(user) {
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));

    if (userDoc.exists()) {
      const userData = userDoc.data();
      userNameElement.textContent = userData.name || user.email;
      greetingNameElement.textContent = userData.name || 'Student';

      if (userData.photoURL) {
        userAvatarElement.src = userData.photoURL;
      }
    }
  } catch (error) {
    console.error("Failed to load user data:", error);
  }
}

// Load dashboard statistics
async function loadDashboardStats(userId) {
  try {
    // Recommended Colleges
    const recommendedQuery = query(
      collection(db, 'colleges'),
      where('eligibility.minCGPA', '<=', 3.5)
    );
    const recommendedSnapshot = await getDocs(recommendedQuery);
    recommendedCountElement.textContent = recommendedSnapshot.size;

    // Applications Count
    const applicationsQuery = query(
      collection(db, 'applications'),
      where('userId', '==', userId)
    );
    const applicationsSnapshot = await getDocs(applicationsQuery);
    applicationsCountElement.textContent = applicationsSnapshot.size;

    // Test Score
    const testQuery = query(
      collection(db, 'testResults'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(1)
    );
    const testSnapshot = await getDocs(testQuery);
    
    if (!testSnapshot.empty) {
      const testData = testSnapshot.docs[0].data();
      testScoreElement.textContent = `${testData.totalScore || 0}/${testData.maxScore || 100}`;
    }

    loadRecommendedColleges(recommendedSnapshot);
  } catch (error) {
    console.error("Failed to load dashboard stats:", error);
  }
}

// Render recommended colleges
function loadRecommendedColleges(snapshot) {
  recommendedCollegesElement.innerHTML = '';

  snapshot.forEach(doc => {
    const college = doc.data();
    const card = document.createElement('div');
    card.className = 'college-card';
    card.innerHTML = `
      <div class="college-img">
        <i class="fas fa-university fa-3x"></i>
      </div>
      <div class="college-body">
        <h3 class="college-name">${college.name || 'Unknown College'}</h3>
        <p class="college-location">${college.location || 'Location not specified'}</p>
        <div class="college-footer">
          <span class="college-fees">$${college.fees ? college.fees.toLocaleString() : 'N/A'}/yr</span>
          <button class="view-btn" data-id="${doc.id}">View</button>
        </div>
      </div>
    `;
    recommendedCollegesElement.appendChild(card);
  });

  // View button logic
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const collegeId = e.target.getAttribute('data-id');
      window.location.href = `college-details.html?id=${collegeId}`;
    });
  });
}

// Logout
logoutBtn.addEventListener('click', async () => {
  try {
    await signOut(auth);
    window.location.href = 'login.html';
  } catch (err) {
    console.error("Logout failed:", err);
    alert("Logout failed. Please try again.");
  }
});