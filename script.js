// Global functions for Lost & Found application

// Sample data for demonstration
const sampleItems = [
  {
    id: 1,
    type: 'lost',
    name: 'MacBook Pro 13"',
    description: 'Silver MacBook Pro with Touch Bar, lost near the library. Has a sticker of "NITR" on the back. Contains important project files.',
    roomNo: 'A-101',
    contactInfo: '9876543210',
    image: 'https://via.placeholder.com/300x200/ff6b35/ffffff?text=Laptop',
    datePosted: '2 days ago',
    timestamp: Date.now() - 172800000
  },
  {
    id: 2,
    type: 'lost',
    name: 'iPhone 12 Pro',
    description: 'Space Gray iPhone 12 Pro with a black case. Lost in the cafeteria during lunch break. Please contact if found.',
    roomNo: 'B-205',
    contactInfo: '9876543211',
    image: 'https://via.placeholder.com/300x200/ff6b35/ffffff?text=Phone',
    datePosted: '1 day ago',
    timestamp: Date.now() - 86400000
  },
  {
    id: 3,
    type: 'found',
    name: 'Steel Water Bottle',
    description: 'Blue steel water bottle with NITR logo. Found in the library study area. Please contact if this belongs to you.',
    roomNo: 'C-301',
    contactInfo: '9876543212',
    image: 'https://via.placeholder.com/300x200/4CAF50/ffffff?text=Water+Bottle',
    datePosted: '1 day ago',
    timestamp: Date.now() - 86400000
  },
  {
    id: 4,
    type: 'found',
    name: 'Black Backpack',
    description: 'Black backpack with multiple compartments. Found near the cafeteria entrance. Contains some books and stationery.',
    roomNo: 'D-102',
    contactInfo: '9876543213',
    image: 'https://via.placeholder.com/300x200/4CAF50/ffffff?text=Backpack',
    datePosted: '2 days ago',
    timestamp: Date.now() - 172800000
  }
];

// Navigation functions
function toggleMenu() {
  const navLinks = document.getElementById('navLinks');
  const hamburger = document.querySelector('.hamburger');
  
  if (navLinks && hamburger) {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
  }
}

// Image handling functions
function previewImage(event) {
  const file = event.target.files[0];
  const preview = document.getElementById('preview');
  
  if (file && preview) {
    const reader = new FileReader();
    reader.onload = function(e) {
      preview.src = e.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  } else if (preview) {
    preview.style.display = 'none';
  }
}

// Word limit checking
function checkWordLimit(textarea) {
  const text = textarea.value.trim();
  const words = text ? text.split(/\s+/).filter(word => word.length > 0) : [];
  const wordCount = words.length;
  const wordCountDisplay = document.getElementById('wordCount');
  
  if (wordCountDisplay) {
    wordCountDisplay.textContent = `${wordCount}/20 words`;
    
    if (wordCount > 20) {
      wordCountDisplay.style.color = '#ff6b35';
      textarea.value = words.slice(0, 20).join(' ');
      wordCountDisplay.textContent = '20/20 words (truncated)';
    } else if (wordCount > 15) {
      wordCountDisplay.style.color = '#ffa726';
    } else {
      wordCountDisplay.style.color = 'rgba(255, 255, 255, 0.6)';
    }
  }
}

// Form submission
function submitForm(event) {
  event.preventDefault();
  
  const description = document.getElementById('description').value.trim();
  const wordCount = description ? description.split(/\s+/).filter(word => word.length > 0).length : 0;
  
  if (wordCount > 20) {
    alert('Description must be 20 words or less. Please shorten your description.');
    return;
  }
  
  const submitBtn = document.getElementById('submitBtn');
  const originalText = submitBtn ? submitBtn.textContent : 'Post Item';
  
  // Disable button and show loading
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Posting...';
  }
  
  // Get form data
  const formData = new FormData(document.getElementById('postItemForm'));
  const imageFile = formData.get('itemImage');
  
  // Handle image conversion to base64
  if (imageFile && imageFile.size > 0) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const itemData = {
        id: Date.now(),
        type: formData.get('postType'),
        name: formData.get('itemName'),
        description: formData.get('description'),
        roomNo: formData.get('roomNo'),
        contactInfo: formData.get('contactInfo'),
        image: e.target.result, // Base64 data URL
        datePosted: new Date().toLocaleDateString(),
        timestamp: Date.now()
      };
      
      saveItem(itemData);
    };
    reader.readAsDataURL(imageFile);
  } else {
    const itemData = {
      id: Date.now(),
      type: formData.get('postType'),
      name: formData.get('itemName'),
      description: formData.get('description'),
      roomNo: formData.get('roomNo'),
      contactInfo: formData.get('contactInfo'),
      image: null,
      datePosted: new Date().toLocaleDateString(),
      timestamp: Date.now()
    };
    
    saveItem(itemData);
  }
  
  function saveItem(itemData) {
    // Save to localStorage
    const existingItems = JSON.parse(localStorage.getItem('lostFoundItems') || '[]');
    existingItems.push(itemData);
    localStorage.setItem('lostFoundItems', JSON.stringify(existingItems));
    
    setTimeout(() => {
      alert('Item posted successfully! Your item will be visible to other users shortly.');
      
      // Reset form
      const form = document.getElementById('postItemForm');
      const preview = document.getElementById('preview');
      const wordCountDisplay = document.getElementById('wordCount');
      
      if (form) form.reset();
      if (preview) preview.style.display = 'none';
      if (wordCountDisplay) {
        wordCountDisplay.textContent = '0/20 words';
        wordCountDisplay.style.color = 'rgba(255, 255, 255, 0.6)';
      }
      
      // Re-enable button
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }, 1000);
  }
}

// Load items for lost/found pages
function loadItems(type = 'lost') {
  const itemsGrid = document.getElementById('itemsGrid');
  if (!itemsGrid) return;
  
  const storedItems = JSON.parse(localStorage.getItem('lostFoundItems') || '[]');
  const allItems = [...sampleItems, ...storedItems];
  const filteredItems = allItems.filter(item => item.type === type);
  
  if (filteredItems.length === 0) {
    itemsGrid.innerHTML = `
      <div class="no-items">
        <div class="no-items-icon">🔍</div>
        <p>No ${type} items found. Be the first to post a ${type} item!</p>
      </div>
    `;
    return;
  }

  const placeholderColor = type === 'lost' ? 'ff6b35' : '4CAF50';
  const buttonText = type === 'lost' ? 'Contact Owner' : 'Contact Finder';
  const buttonFunction = type === 'lost' ? 'contactOwner' : 'contactFinder';
  
  itemsGrid.innerHTML = filteredItems.map(item => `
    <div class="item-card">
      <img src="${item.image || `https://via.placeholder.com/300x200/${placeholderColor}/ffffff?text=Item`}" 
           alt="${item.name}" 
           class="item-image"
           onerror="this.src='https://via.placeholder.com/300x200/${placeholderColor}/ffffff?text=Image+Not+Found'">
      <h3 class="item-title">${item.name}</h3>
      <p class="item-description">${item.description}</p>
      <div class="item-details">
        <span class="item-location">📍 Room ${item.roomNo}</span>
        <span class="item-date">${item.datePosted}</span>
      </div>
      <button class="contact-btn" onclick="${buttonFunction}('${item.contactInfo}')">${buttonText}</button>
    </div>
  `).join('');
}

// Search functionality
function searchItems() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const items = document.querySelectorAll('.item-card');
  
  items.forEach(item => {
    const title = item.querySelector('.item-title').textContent.toLowerCase();
    const description = item.querySelector('.item-description').textContent.toLowerCase();
    
    if (title.includes(searchTerm) || description.includes(searchTerm)) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}

// Contact owner function
function contactOwner(contactInfo) {
  alert(`Contact Information: ${contactInfo}`);
}

// Contact finder function (for found items)
function contactFinder(contactInfo) {
  alert(`Contact Information: ${contactInfo}`);
}

// Initialize page based on current page
function initializePage() {
  const currentPage = window.location.pathname.split('/').pop();
  
  // Load items for lost/found pages
  if (currentPage === 'lost-items.html') {
    loadItems('lost');
  } else if (currentPage === 'found-items.html') {
    loadItems('found');
  }
  
  // Set up form event listeners for post-item page
  if (currentPage === 'post-item.html') {
    document.querySelectorAll('input[name="postType"]').forEach(radio => {
      radio.addEventListener('change', function() {
        const itemNameLabel = document.querySelector('label[for="itemName"]');
        const itemNameInput = document.getElementById('itemName');
        
        if (this.value === 'lost') {
          if (itemNameLabel) itemNameLabel.textContent = 'Lost Item Name *';
          if (itemNameInput) itemNameInput.placeholder = 'e.g., MacBook Pro, iPhone 12, etc.';
        } else {
          if (itemNameLabel) itemNameLabel.textContent = 'Found Item Name *';
          if (itemNameInput) itemNameInput.placeholder = 'e.g., Black backpack, Blue water bottle, etc.';
        }
      });
    });
  }
  
  // Set up navigation event listeners
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      const navLinks = document.getElementById('navLinks');
      const hamburger = document.querySelector('.hamburger');
      
      if (navLinks) navLinks.classList.remove('active');
      if (hamburger) hamburger.classList.remove('active');
    });
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', (event) => {
    const nav = document.querySelector('nav');
    const navLinks = document.getElementById('navLinks');
    const hamburger = document.querySelector('.hamburger');
    
    if (nav && navLinks && hamburger && 
        !nav.contains(event.target) && navLinks.classList.contains('active')) {
      navLinks.classList.remove('active');
      hamburger.classList.remove('active');
    }
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage);

// Debug function to check localStorage
function debugLocalStorage() {
  const items = JSON.parse(localStorage.getItem('lostFoundItems') || '[]');
  console.log('Items in localStorage:', items);
  return items;
}

// Make debug function available globally
window.debugLocalStorage = debugLocalStorage;
