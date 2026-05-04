/**
 * Swim Academy — Shared Navigation Component
 * Inject <div id="nav-root"></div> anywhere before <script src="nav.js">
 * The script auto-detects the current page and marks the active link.
 */
(function () {
  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', href: '../dashboard/index.html' },
    { id: 'calendar',  label: 'Schedule',  icon: 'calendar', href: '../calendar/index.html'  },
    { id: 'invoice',   label: 'Invoices',  icon: 'file-text', href: '../invoice/index.html'   },
    { id: 'coaches',   label: 'Coaches',   icon: 'user-check', href: '../coaches/index.html'   },
    { id: 'students',  label: 'Students',  icon: 'users', href: '../students/index.html'  },
  ];

  // Detect active page from URL path
  const path = window.location.pathname;
  const activeItem = NAV_ITEMS.find(item => {
    if (item.id === 'invoice' && path.includes('/create-invoice/')) return true;
    return path.includes('/' + item.id + '/');
  }) || { id: '', icon: 'layout-dashboard' }; // Fallback
  const activeId = activeItem.id;

  function itemHref(item) {
    return item.href;
  }

  function desktopItem(item) {
    if (item.id === activeId) return ''; // Hide active page link
    return `
      <li class="w-full">
        <a href="${itemHref(item)}" class="flex items-center h-14 rounded-2xl text-gray-400 hover:bg-primary-50 hover:text-primary-600 transition-all overflow-hidden">
          <span class="w-16 h-14 flex items-center justify-center flex-shrink-0 text-xl"><i data-lucide="${item.icon}"></i></span>
          <span class="font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">${item.label}</span>
        </a>
      </li>`;
  }

  function mobileItem(item) {
    if (item.id === activeId) return ''; // Hide active page link
    return `<li><a href="${itemHref(item)}" class="w-12 h-12 flex items-center justify-center text-xl grayscale opacity-50"><i data-lucide="${item.icon}"></i></a></li>`;
  }

  const logoSrc = '../../assets/img/logo.png';
  const logoFallback = "this.src='https://ui-avatars.com/api/?name=Z1&background=ff7043&color=fff&size=128';";

  // Mobile Header Action (Customizable by page)
  const mobileAction = document.body.dataset.mobileAction || activeItem.icon;
  const mobileActionClick = document.body.dataset.mobileClick || '';
  const isMobileActionEmoji = !NAV_ITEMS.some(item => item.icon === mobileAction);


  const html = `
  <!-- Desktop Expanding Sidebar -->
  <aside class="group hidden md:flex w-24 hover:w-64 flex-col bg-white border-r border-gray-100 items-center py-4 transition-all duration-500 sticky top-0 h-screen z-40 overflow-hidden">
    <!-- Brand Identity (Vertical Layout) -->
    <div class="w-full flex flex-col items-center mb-6 transition-all duration-500">
      <!-- Logo -->
      <div class="w-full h-20 group-hover:h-56 flex items-center justify-center transition-all duration-500 overflow-hidden px-4">
        <img src="${logoSrc}" alt="Logo" class="w-full h-full object-contain transition-all duration-500 group-hover:scale-110" onerror="${logoFallback}">
      </div>
    </div>
    <!-- Nav Links -->
    <nav class="flex-1 w-full">
      <ul class="flex flex-col gap-2 w-full px-4">
        ${NAV_ITEMS.map(desktopItem).join('')}
      </ul>
    </nav>
  </aside>

  <!-- Unified Mobile Header -->
  <header class="md:hidden glass-header sticky top-0 z-30 border-b border-primary-100 flex items-center justify-between px-6 py-2 bg-white">
    <div class="flex items-center gap-3">
      <div class="w-14 h-14 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-100 border border-white overflow-hidden">
        <img src="${logoSrc}" alt="Logo" class="w-10 h-10 object-contain scale-125" onerror="${logoFallback}">
      </div>
    </div>
    <div id="mobile-header-action" onclick="${mobileActionClick}" class="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-white shadow-sm cursor-pointer">
      ${isMobileActionEmoji ? mobileAction : `<i data-lucide="${mobileAction}"></i>`}
    </div>
  </header>

  <!-- Mobile Bottom Navigation -->
  <nav class="glass-nav-bottom fixed bottom-0 left-0 right-0 md:hidden z-30 pb-safe" id="mobile-nav">
    <ul class="flex items-center justify-around w-full h-20 px-6 bg-white border-t border-gray-100">
      ${NAV_ITEMS.map(mobileItem).join('')}
    </ul>
  </nav>
  `;

  // Mount into #nav-root, or auto-prepend to body
  const mountPoint = document.getElementById('nav-root') || document.body;

  if (mountPoint.id === 'nav-root') {
    mountPoint.innerHTML = html;
  } else {
    const div = document.createElement('div');
    div.id = "nav-root";
    div.innerHTML = html;
    mountPoint.prepend(div);
  }

  // Initial Lucide render
  if (window.lucide) {
    lucide.createIcons();
  }
})();


