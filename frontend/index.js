// Upload hod and coordinator
function loadLeaders() {
    fetch('/api/users/leaders')
        .then(res => res.json())
        .then(users => {
            const hodContainer = document.getElementById("hodSection");
            const coordContainer = document.getElementById("coordinatorSection");
            hodContainer.innerHTML = "";
            coordContainer.innerHTML = "";

            users.forEach(user => {
                const cardHTML = createLeaderCard(user, user.role.toUpperCase());
                if (user.role === "hod") {
                    hodContainer.innerHTML += cardHTML;
                } else if (user.role === "coordinator") {
                    coordContainer.innerHTML += cardHTML;
                }
            });
        })
        .catch(err => console.error("❌ Error fetching leaders:", err));
}

function createLeaderCard(user, label) {
    return `
    <div class="col-md-4 d-flex justify-content-center mb-4">
      <div class="card text-center shadow-sm" style="width: 18rem;">
        <img src="${user.image}" class="card-img-top rounded-circle mx-auto mt-3" style="width: 120px; height: 120px; object-fit: cover;" alt="${user.firstName}">
        <div class="card-body">
          <h5 class="card-title">${user.firstName} ${user.lastName}</h5>
          <p class="card-text mb-1"><strong>${label}</strong></p>
        </div>
      </div>
    </div>
    `;
}

document.addEventListener("DOMContentLoaded", loadLeaders);

// Hod Message
function loadHodMessages() {
    fetch('/api/hod-messages')
        .then(res => res.json())
        .then(messages => {
            const inner = document.getElementById('hodCarouselInner');
            inner.innerHTML = "";

            messages.forEach((msg, index) => {
                const activeClass = index === 0 ? 'active' : '';
                inner.innerHTML += `
                <div class="coor-heading">
                  <h2 class="text-center">HOD Message</h2>
                </div>
                <div class="carousel-item ${activeClass}">
                    <div class="card mx-auto text-center" style="max-width: 500px;">
                    <div class="d-flex justify-content-center">
                    <img src="${msg.image}" class="card-img-top" alt="${msg.author}" style="height: 150px; object-fit: cover;">
                    </div>
                        <div class="card-body">
                            <h5 class="card-title">${msg.title}</h5>
                            <p class="card-text">${msg.description}</p>
                            <p class="text-muted">By ${msg.author} | ${msg.role}</p>
                        </div>
                    </div>
                </div>`;
            });
        })
        .catch(err => {
            console.error("❌ Failed to load HOD messages:", err);
        });
}

document.addEventListener("DOMContentLoaded", loadHodMessages);
