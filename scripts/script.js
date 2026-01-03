async function fetchAndDisplayItems() {
  try {
    const response = await fetch('/api/items');
    
    if (!response.ok) {
      throw new Error('Failed to fetch items');
    }
    
    const items = await response.json();
    displayItems(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    displayError();
  }
}

function displayItems(items) {
  const mainContent = document.querySelector('.main-content');
  
  if (items.length === 0) {
    mainContent.innerHTML += `
      <div class="no-items">
        <p>No items have been posted yet.</p>
      </div>
    `;
    return;
  }
  
  const filterContainer = document.createElement('div');
  filterContainer.className = 'filter-container';
  filterContainer.innerHTML = `
    <button class="filter-btn active" data-filter="all">All Items</button>
    <button class="filter-btn" data-filter="lost">Lost Items</button>
    <button class="filter-btn" data-filter="found">Found Items</button>
  `;
  mainContent.appendChild(filterContainer);
  
  const itemsContainer = document.createElement('div');
  itemsContainer.className = 'items-container';
  
  items.forEach(item => {
    const itemCard = createItemCard(item);
    itemsContainer.appendChild(itemCard);
  });
  
  mainContent.appendChild(itemsContainer);
  
  setupFilters();
}

function createItemCard(item) {
  const card = document.createElement('div');
  card.className = `item-card ${item.itemType}`;
  card.setAttribute('data-type', item.itemType);
  
  const datePosted = new Date(item.datePosted).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  const dateLost = new Date(item.dateLost).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  card.innerHTML = `
    <div class="item-badge ${item.itemType}">
      ${item.itemType === 'lost' ? '🔍 Lost' : '📢 Found'}
    </div>
    
    ${item.imageUrl ? `
      <div class="item-image">
        <img src="${item.imageUrl}" alt="${item.itemName}" loading="lazy">
      </div>
    ` : ''}
    
    <div class="item-content">
      <h2 class="item-rollno">Roll No: ${escapeHtml(item.rollno)}</h2>
      <h3 class="item-name">${escapeHtml(item.itemName)}</h3>
      <p class="item-description">${escapeHtml(item.description)}</p>
      
      <div class="item-details">
        <div class="detail-row">
          <span class="detail-label">📅 Date ${item.itemType === 'lost' ? 'Lost' : 'Found'}:</span>
          <span class="detail-value">${dateLost}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">📍 Location:</span>
          <span class="detail-value">Room ${escapeHtml(item.roomNo)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">📞 Contact:</span>
          <span class="detail-value">${escapeHtml(item.contact)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">🕒 Posted:</span>
          <span class="detail-value">${datePosted}</span>
        </div>
      </div>
    </div>
  `;
  
  return card;
}

function setupFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const itemCards = document.querySelectorAll('.item-card');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      const filter = button.getAttribute('data-filter');
      
      itemCards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-type') === filter) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

function displayError() {
  const mainContent = document.querySelector('.main-content');
  mainContent.innerHTML += `
    <div class="error-message">
      <p>⚠️ Unable to load items. Please try again later.</p>
    </div>
  `;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', fetchAndDisplayItems);