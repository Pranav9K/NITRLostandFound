document.addEventListener('DOMContentLoaded', function() {
  const SHEET_URL = "https://opensheet.elk.sh/16MHESnMAm-A5EGbX2rflhj6ndF8nGm3HAF3G8sHTZnU/Form%20Responses%201";
  const itemsGrid = document.getElementById('itemsGrid');
  let allItems = [];

function convertDriveLink(url) {
  if (!url) return "";
  const match = url.match(/[-\w]{25,}/);
  if (match && match[0]) {
    const fileId = match[0];
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  }
  return "";
}

  async function loadItems() {
    try {
      const res = await fetch(SHEET_URL);
      const data = await res.json();
      allItems = data.map(entry => ({
        timestamp: entry["Timestamp"] || "",
        type: (entry["Are you reporting a lost item or a found item?"] || "").toLowerCase(),
        itemName: entry["Item Name"] || "Unnamed Item",
        description: entry["Item Description"] || "No description available.",
        room: entry["Room No:"] || "Not specified",
        contact: entry["Contact Information (Phone No and Name):"] || "Not provided",
        photo: convertDriveLink(entry["Item Photo"]) || ""
      }));
      renderItems(allItems.slice().reverse());
    } catch(err) {
      itemsGrid.innerHTML = "<p class='no-items'>⚠️ Unable to load items. Please try again later.</p>";
      console.error(err);
    }
  }

  function renderItems(items) {
    itemsGrid.innerHTML = "";
    if (!items.length) {
      itemsGrid.innerHTML = "<p class='no-items'>No items found.</p>";
      return;
    }

    items.forEach(item => {
      const card = document.createElement("div");
      card.className = "item-card";

      let imageHTML = item.photo 
        ? `<div class="item-image-container">
             <img src="${item.photo}" alt="${item.itemName}" class="item-photo" loading="lazy" onerror="this.style.display='none';">
           </div>`
        : `<div class="item-photo-placeholder">No image available</div>`;

      card.innerHTML = `
        <span class="item-type ${item.type}">${item.type}</span>
        <h3>${item.itemName}</h3>
        <p><b>Description:</b> ${item.description}</p>
        <p><b>Room No:</b> ${item.room}</p>
        <p><b>Contact:</b> ${item.contact}</p>
        ${imageHTML}
        <p class="timestamp">${new Date(item.timestamp).toLocaleString()}</p>
      `;
      itemsGrid.appendChild(card);
    });
  }

  function applyFiltersAndSort() {
    const searchQuery = document.getElementById("searchInput").value.toLowerCase();
    const typeFilter = document.getElementById("typeFilter").value;
    const sortOrder = document.getElementById("sortFilter").value;

    let filteredItems = allItems.filter(item => {
      const matchesType = (typeFilter==='all') || (item.type===typeFilter);
      const matchesSearch = item.itemName.toLowerCase().includes(searchQuery) ||
                            item.description.toLowerCase().includes(searchQuery) ||
                            item.room.toLowerCase().includes(searchQuery);
      return matchesType && matchesSearch;
    });

    switch(sortOrder) {
      case 'newest': filteredItems.sort((a,b)=> new Date(b.timestamp)-new Date(a.timestamp)); break;
      case 'oldest': filteredItems.sort((a,b)=> new Date(a.timestamp)-new Date(b.timestamp)); break;
      case 'name': filteredItems.sort((a,b)=> a.itemName.localeCompare(b.itemName)); break;
    }

    renderItems(filteredItems);
  }

  window.searchItems = applyFiltersAndSort;
  window.filterItems = applyFiltersAndSort;
  window.sortItems = applyFiltersAndSort;

  // Modal functionality
  const modal = document.getElementById("imageModal");
  const modalImage = document.getElementById("modalImage");
  const modalCloseBtn = document.getElementById("modalCloseBtn");

  itemsGrid.addEventListener('click', function(e){
    const photo = e.target.closest('.item-photo');
    if(photo){
      modalImage.src = photo.src;
      modal.classList.add('active');
    }
  });

  modalCloseBtn.addEventListener('click', ()=> modal.classList.remove('active'));
  modal.addEventListener('click', e => { if(e.target===modal) modal.classList.remove('active'); });

  loadItems();
});