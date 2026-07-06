const API_URL =
  "https://script.google.com/macros/s/AKfycbxSrTngCSq8H7qitmGlAEck-M9Ny0IIT9pjgeZXD5x9gEjX_f60iTXxscvxKc9tMh-d5w/exec";

let allLeads = [];
const loggedInUser = localStorage.getItem("loggedInUser");
const sessionToken = localStorage.getItem("sessionToken");
const userRole = localStorage.getItem("userRole");
document.addEventListener("DOMContentLoaded", () => {
  const title = document.getElementById("dashboardTitle");

if (title) {

    if (userRole === "Admin") {
        title.textContent = "Admin Dashboard";
    } else {
        title.textContent = `Welcome, ${loggedInUser}`;
    }

}
});
document.addEventListener("DOMContentLoaded", () => {

    const ownerFilter = document.getElementById("ownerFilter");
    const myLeadsCard = document.getElementById("myLeadsCard");

    if (userRole === "Admin") {

        if (myLeadsCard) {
            myLeadsCard.style.display = "none";
        }

    } else {

        if (ownerFilter) {
            ownerFilter.style.display = "none";
        }

    }

});

if (!loggedInUser || !sessionToken) {
  window.location.href = "login.html";
}
async function validateSession() {
  const response = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "validateSession",
      username: loggedInUser,
      token: sessionToken,
    }),
  });

  const result = await response.json();

  if (!result.success) {
    localStorage.clear();

    window.location.href = "login.html";
  }
}
// Load Leads
async function loadLeads() {
  const refreshBtn = document.getElementById("refreshBtn");

  refreshBtn.disabled = true;
  refreshBtn.innerHTML = `
        <i data-lucide="loader-circle"></i>
        <span>Loading...</span>
    `;

  lucide.createIcons();

  try {
    const response = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
        action: "getUserLeads",
        username: loggedInUser,
        token: sessionToken
    })
});

const result = await response.json();

if (!result.success) {

    localStorage.clear();
    window.location.href = "login.html";
    return;

}

allLeads = result.leads;

allLeads.reverse();

renderTable(allLeads);
  } catch (error) {
    alert("Unable to load leads.");

    console.error(error);
  }

  refreshBtn.disabled = false;

  refreshBtn.innerHTML = `
        <i data-lucide="refresh-cw"></i>
        <span>Refresh</span>
    `;

  lucide.createIcons();
}

// Render Table
function renderTable(leads) {
  const table = document.getElementById("leadTable");

  table.innerHTML = "";

  // No Leads Found
  if (leads.length === 0) {
    table.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;padding:40px;">
                    <h3>No Leads Found</h3>
                    <p>Try a different search.</p>
                </td>
            </tr>
        `;

    document.getElementById("totalLeads").textContent = 0;
    document.getElementById("todayLeads").textContent = 0;
    document.getElementById("countryCount").textContent = 0;
    document.getElementById("topCourse").textContent = "-";

    return;
  }

  leads.forEach((lead, index) => {
    table.innerHTML += `
        <tr>
            <td>${new Date(lead.date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}</td>
            <td>${lead.name}</td>
            <td>${lead.email}</td>
            <td>${lead.country}</td>
            <td>${lead.certification}</td>
            <td>${lead.owner || "-"}</td>
            <td>${lead.status || "New"}</td>
            <td>
                <button class="view-btn" onclick="viewLead(${index})">
                    <i data-lucide="eye"></i>
                    <span>View</span>
                </button>
            </td>
        </tr>
        `;
  });

  lucide.createIcons();

  document.getElementById("totalLeads").textContent = leads.length;
  const today = new Date();

  const todayCount = leads.filter((lead) => {
    const leadDate = new Date(lead.date);

    return (
      leadDate.getDate() === today.getDate() &&
      leadDate.getMonth() === today.getMonth() &&
      leadDate.getFullYear() === today.getFullYear()
    );
  }).length;

  document.getElementById("todayLeads").textContent = todayCount;

  document.getElementById("countryCount").textContent = new Set(
    leads.map((lead) => lead.country),
  ).size;

  const certificationCount = {};

  leads.forEach((lead) => {
    certificationCount[lead.certification] =
      (certificationCount[lead.certification] || 0) + 1;
  });

  let topCourse = "-";
  let max = 0;

  for (const cert in certificationCount) {
    if (certificationCount[cert] > max) {
      max = certificationCount[cert];
      topCourse = cert;
    }
  }

  document.getElementById("topCourse").textContent = topCourse;
  const newLeads = leads.filter(
    (lead) => (lead.status || "New") === "New",
  ).length;

  document.getElementById("todayLeads").textContent = newLeads;
  const selectedOwner = document.getElementById("ownerFilter").value;

  if (selectedOwner === "All") {
    document.getElementById("myLeads").textContent = "-";
  } else {
    document.getElementById("myLeads").textContent = leads.length;
  }
}

// Load data when page opens
validateSession().then(() => {
  loadLeads().then(() => {
    document.getElementById("ownerFilter").innerHTML =
      '<option value="All">All Owners</option>';

    [...new Set(allLeads.map((lead) => lead.owner))].sort().forEach((owner) => {
      document.getElementById("ownerFilter").innerHTML +=
        `<option value="${owner}">${owner}</option>`;
    });
  });

  const savedOwner = localStorage.getItem("selectedOwner") || "All";
  document.getElementById("ownerFilter").value = savedOwner;

  if (savedOwner !== "All") {
    const filtered = allLeads.filter((lead) => lead.owner === savedOwner);

    renderTable(filtered);
  }
});

// Search
document.getElementById("search").addEventListener("input", function () {
  const text = this.value.toLowerCase();

  const filtered = allLeads.filter(
    (lead) =>
      lead.name.toLowerCase().includes(text) ||
      lead.email.toLowerCase().includes(text) ||
      lead.country.toLowerCase().includes(text) ||
      lead.certification.toLowerCase().includes(text) ||
      lead.owner.toLowerCase().includes(text),
  );

  renderTable(filtered);
});

document.getElementById("refreshBtn").addEventListener("click", () => {
  loadLeads();
});

function viewLead(index) {
  const lead = allLeads[index];
  window.currentLeadRow = lead.sheetRow;

  document.getElementById("leadDetails").innerHTML = `

        <div class="detail-item">
            <div class="detail-label">
                <i data-lucide="user"></i>
                <span>Full Name</span>
            </div>
            <strong>${lead.name}</strong>
        </div>

        <div class="detail-item">
            <div class="detail-label">
                <i data-lucide="mail"></i>
                <span>Email</span>
            </div>
            <strong>
    <a href="mailto:${lead.email}" class="detail-link">
        ${lead.email}
    </a>
</strong>
        </div>

        <div class="detail-item">
            <div class="detail-label">
                <i data-lucide="phone"></i>
                <span>WhatsApp</span>
            </div>
            <strong>
    <a href="https://wa.me/${lead.whatsapp.replace(/\D/g, "")}"
       target="_blank"
       class="detail-link">
        ${lead.whatsapp}
    </a>
</strong>
        </div>

        <div class="detail-item">
            <div class="detail-label">
                <i data-lucide="globe"></i>
                <span>Country</span>
            </div>
            <strong>${lead.country}</strong>
        </div>

        <div class="detail-item">
            <div class="detail-label">
                <i data-lucide="graduation-cap"></i>
                <span>Certification</span>
            </div>
            <strong>${lead.certification}</strong>
        </div>
        <div class="detail-item">
    <div class="detail-label">
        <i data-lucide="user-check"></i>
        <span>Owner</span>
    </div>
    <strong>${lead.owner || "-"}</strong>
</div>
<div class="detail-item">
    <div class="detail-label">
        <i data-lucide="badge-check"></i>
        <span>Status</span>
    </div>
    <select id="statusSelect">
    <option ${lead.status === "New" ? "selected" : ""}>New</option>
    <option ${lead.status === "Contacted" ? "selected" : ""}>Contacted</option>
    <option ${lead.status === "Follow Up" ? "selected" : ""}>Follow Up</option>
    <option ${lead.status === "Enrolled" ? "selected" : ""}>Enrolled</option>
    <option ${lead.status === "Closed" ? "selected" : ""}>Closed</option>
</select>
</div>
                <div class="detail-item">
            <div class="detail-label">
                <i data-lucide="clock-3"></i>
                <span>Best Time</span>
            </div>
            <strong>${lead.chatTime}</strong>
        </div>

        <div class="detail-item">
            <div class="detail-label">
                <i data-lucide="message-square"></i>
                <span>Comments</span>
            </div>
            <strong>${lead.comments || "No comments provided"}</strong>
        </div>

    `;

  document.getElementById("leadModal").style.display = "flex";

  lucide.createIcons();
}

document.querySelector(".close-btn").addEventListener("click", function () {
  document.getElementById("leadModal").style.display = "none";
});

window.addEventListener("click", function (event) {
  if (event.target.id === "leadModal") {
    document.getElementById("leadModal").style.display = "none";
  }
});

lucide.createIcons();

document.getElementById("exportBtn").addEventListener("click", exportCSV);

function exportCSV() {
  if (allLeads.length === 0) {
    alert("No leads available to export.");
    return;
  }

  let csv =
    "Date,Name,Email,Country,WhatsApp,Certification,Best Time,Comments\n";

  allLeads.forEach((lead) => {
    csv += `"${new Date(lead.date).toLocaleDateString()}","${lead.name}","${lead.email}","${lead.country}","${lead.whatsapp}","${lead.certification}","${lead.chatTime}","${lead.comments || ""}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);

  link.download = `Leads_${new Date().toISOString().slice(0, 10)}.csv`;

  link.click();
}
document.getElementById("ownerFilter").addEventListener("change", function () {
  const owner = this.value;
  localStorage.setItem("selectedOwner", owner);

  if (owner === "All") {
    renderTable(allLeads);
    return;
  }

  const filtered = allLeads.filter((lead) => lead.owner === owner);

  renderTable(filtered);
});
document.addEventListener("change", async function (e) {
  if (e.target.id !== "statusSelect") return;

  const response = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "updateStatus",
      row: window.currentLeadRow,
      status: e.target.value,
    }),
  });

  const result = await response.json();

  if (result.success) {
    const lead = allLeads.find(
    l => l.sheetRow === window.currentLeadRow
);

if (lead) {
    lead.status = e.target.value;
}

renderTable(allLeads);

document.getElementById("leadModal").style.display = "none";
  }
});
document.getElementById("logoutBtn").addEventListener("click", () => {

    if (!confirm("Are you sure you want to logout?")) {
        return;
    }

    localStorage.clear();

    window.location.href = "login.html";

});
