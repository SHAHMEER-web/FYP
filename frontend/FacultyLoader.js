document.addEventListener("DOMContentLoaded", () => {
    const department = document.body.getAttribute("data-department"); // from earlier

    if (department) {
        loadLeaders();           // Load HOD and coordinators
        loadFaculty(department); // Load department-specific faculty
    }
});


function loadLeaders() {
    fetch('/api/users/leaders')
        .then(res => res.json())
        .then(users => {
            const container = document.getElementById("hodCoordinatorSection");
            container.innerHTML = "";

            // HOD section
            const hod = users.find(user => user.role === "hod");
            if (hod) {
                container.innerHTML += `
          <div class="row justify-content-center mb-4">
            ${createLeaderCard(hod)}
          </div>
        `;
            }

            // Coordinators section
            const coordinators = users.filter(user => user.role === "coordinator");
            if (coordinators.length > 0) {
                let coordCards = coordinators.map(createLeaderCard).join('');
                container.innerHTML += `
          <div class="row justify-content-center">
            ${coordCards}
          </div>
        `;
            }
        })
        .catch(err => console.error("❌ Error fetching leaders:", err));
}


function createLeaderCard(user) {
    const img = user.image

    return `
    <div class=" d-flex justify-content-center col-md-4 mb-4">
        <div class="card h-100 shadow-sm">
            <div class="card-body d-flex align-items-center">
                <img src="${img}" class="me-3 rounded-circle" width="100" height="100">
                    <div>
                        <h5 class="mb-1">${user.firstName} ${user.lastName}</h5>
                        <p class="mb-0">${user.designation}</p>
                </div>
            </div>
        </div>
    </div>
  `;
}

function loadFaculty(department) {
    fetch(`/api/faculty?department=${department}`)
        .then(res => res.json())
        .then(data => {
            const facultyList = document.getElementById("facultyList");
            facultyList.innerHTML = "";

            if (!data.length) {
                facultyList.innerHTML = "<p>No faculty members found.</p>";
                return;
            }

            // Wrap all cards in a Bootstrap row
            let rowHTML = '<div class="row justify-content-center">';

            data.forEach(member => {
                const img = member.image
                    ? `data:image/jpeg;base64,${member.image}`
                    : "default.jpg";

                rowHTML += `
                    <div class="col-md-4 mb-4 d-flex justify-content-center">
                        <div class="card shadow-sm w-100">
                            <div class="card-body d-flex align-items-center">
                                <img src="${img}" class="me-3 rounded-circle" width="100" height="100" alt="${member.name}">
                                <div>
                                    <h5 class="mb-1">${member.name}</h5>
                                    <p class="mb-0">${member.designation}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });

            rowHTML += '</div>'; // close row
            facultyList.innerHTML = rowHTML;
        })
        .catch(err => {
            console.error("❌ Error loading faculty:", err);
            document.getElementById("facultyList").innerHTML = "<p>Error loading faculty.</p>";
        });
}

