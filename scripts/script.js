async function fetchAndDisplayItems() {
  try {
    const response = await fetch('/api/items');
    if (!response.ok) throw new Error('Failed to fetch items');

    const items = await response.json();
    displayItems(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    displayError();
  }
}

function displayItems(items) {
  const root = document.getElementById('items-root');
  root.innerHTML = ''; // ONLY clear items area

  if (items.length === 0) {
  root.innerHTML = `
    <div style="text-align:center; padding:40px; color:#666; font-size:18px;">
      No items posted yet.
    </div>
  `;
  return;
}

  // Filters
  const filterContainer = document.createElement('div');
  filterContainer.className = 'filter-container';
  filterContainer.innerHTML = `
    <button class="filter-btn active" data-filter="all">All Items</button>
    <button class="filter-btn" data-filter="lost">Lost Items</button>
    <button class="filter-btn" data-filter="found">Found Items</button>
  `;
  root.appendChild(filterContainer);

  // Items container
  const itemsContainer = document.createElement('div');
  itemsContainer.className = 'items-container';

  items.forEach(item => {
    itemsContainer.appendChild(createItemCard(item));
  });

  root.appendChild(itemsContainer);
  setupFilters();
}

function createItemCard(item) {
  const loggedInUser = localStorage.getItem("Username");
  const isOwner = loggedInUser && item.rollno === loggedInUser;

  const card = document.createElement('div');
  card.dataset.id = item._id;
  card.className = `item-card ${item.itemType}`;
  card.dataset.type = item.itemType;
  const dateLost = new Date(item.dateLost).toLocaleDateString();
  const datePosted = new Date(item.datePosted).toLocaleDateString();

  card.innerHTML = `
    <div class="item-badge ${item.itemType}">
      ${item.itemType === 'lost' ? '🔍 Lost' : '📢 Found'}
    </div>

    ${item.imageUrl ? `
      <div class="item-image">
        <img src="${item.imageUrl}" alt="${item.itemName}">
      </div>` : ''}

    <div class="item-content">
      <h2>Roll No: ${escapeHtml(item.rollno)}</h2>
      <h3>${escapeHtml(item.itemName)}</h3>
      <p>${escapeHtml(item.description)}</p>

      <p>📅 ${dateLost}</p>
      <p>📍 ${escapeHtml(item.hostelandroomNo)}</p>
      <p>📞 ${escapeHtml(item.contact)}</p>
      <p>🕒 ${datePosted}</p>

      ${isOwner ? `
          ${isOwner && item.itemType === 'lost' ? `
            <button class="item-found-btn"
              onclick="markAsFound('${item._id}')">
              ✅ Mark as Found
            </button>
          ` : ''}
        ` : ''}
    </div>
  `;

  return card;
}

function setupFilters() {
  const buttons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.item-card');

  buttons.forEach(btn => {
    btn.onclick = () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      cards.forEach(card => {
        card.style.display =
          filter === 'all' || card.dataset.type === filter
            ? 'block'
            : 'none';
      });
    };
  });
}

async function toggleItemType(id) {
  try {
    await fetch(`/api/items/${id}/toggle`, { method: 'PATCH' });
    fetchAndDisplayItems(); // NO layout destruction
  } catch {
    alert("Failed to update item");
  }
}

function escapeHtml(text) {
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}

function displayError() {
  document.getElementById('items-root').innerHTML =
    `<p>Error loading items.</p>`;
}

async function markAsFound(id) {
  const confirmAction = confirm(
    "Are you sure you want to mark this item as FOUND?\nThis will permanently remove the post."
  );

  if (!confirmAction) return;

  try {
    const res = await fetch(`/api/items/${id}`, {
      method: 'DELETE'
    });

    if (!res.ok) {
      throw new Error("Delete failed");
    }

    fetchAndDisplayItems(); // refresh without breaking layout
  } catch (err) {
    alert("Failed to mark item as found");
    console.error(err);
  }
}


document.addEventListener('DOMContentLoaded', fetchAndDisplayItems);
