/* ============================================================
   PawHaven — main.js
   Handles: sticky nav, mobile menu, cart, wishlist, toast,
            newsletter form, contact form, smooth interactions
   ============================================================ */

'use strict';

/* ---- Helpers ---- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ---- Toast ---- */
let toastTimer;
function showToast(msg, duration = 3000) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.style.opacity = '1';
  t.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateX(-50%) translateY(80px)';
  }, duration);
}

/* ---- Cart state (session only) ---- */
let cartCount = 0;

function updateCartUI() {
  $$('#cart-count').forEach(el => {
    el.textContent = cartCount;
    el.style.display = cartCount > 0 ? 'flex' : 'none';
  });
  $$('#cart-btn').forEach(btn => {
    btn.setAttribute('aria-label', `Shopping cart, ${cartCount} item${cartCount !== 1 ? 's' : ''}`);
  });
}

function addToCart(btn, productName) {
  cartCount++;
  updateCartUI();

  // Button feedback
  const original = btn.textContent;
  btn.textContent = '✓ Added!';
  btn.disabled = true;
  btn.style.background = 'var(--teal)';

  setTimeout(() => {
    btn.textContent = original;
    btn.disabled = false;
    btn.style.background = '';
  }, 1800);

  showToast(`🛒 "${productName}" added to cart!`);
}

/* ---- Wishlist ---- */
function toggleWishlist(btn, productName) {
  const svg = btn.querySelector('svg');
  const active = btn.dataset.wishlisted === 'true';

  if (active) {
    btn.dataset.wishlisted = 'false';
    btn.style.color = '';
    svg.setAttribute('fill', 'none');
    showToast(`💔 Removed from wishlist`);
  } else {
    btn.dataset.wishlisted = 'true';
    btn.style.color = '#E53E3E';
    svg.setAttribute('fill', '#E53E3E');
    showToast(`❤️ Saved to wishlist!`);
  }
}

/* ---- Sticky Navbar ---- */
function initStickyNav() {
  const nav = $('#navbar');
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ---- Mobile Menu ---- */
function initMobileMenu() {
  const hamburger = $('#hamburger');
  const menu = $('#mobile-menu');
  if (!hamburger || !menu) return;

  hamburger.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on link click
  $$('a', menu).forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!hamburger.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
}

/* ---- Wishlist buttons ---- */
function initWishlistButtons() {
  $$('.product-card__wishlist').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.product-card');
      const name = card ? ($('.product-card__name', card) || {}).textContent : 'item';
      toggleWishlist(btn, name);
    });
  });
}

/* ---- Newsletter form ---- */
function handleNewsletter(e) {
  e.preventDefault();
  const form = e.target;
  const email = form.querySelector('input[type="email"]');
  if (!email || !email.value.includes('@')) {
    showToast('⚠️ Please enter a valid email address.');
    email && email.focus();
    return;
  }
  const btn = form.querySelector('button[type="submit"]');
  if (btn) { btn.textContent = 'Subscribing…'; btn.disabled = true; }

  setTimeout(() => {
    showToast('🎉 Subscribed! Check your inbox for 15% off.');
    form.reset();
    if (btn) { btn.textContent = '✓ Subscribed!'; btn.style.background = 'var(--teal)'; }
  }, 900);
}

/* ---- Contact form ---- */
function handleContactForm(e) {
  e.preventDefault();
  const form = e.target;
  const required = $$('[required]', form);
  let valid = true;

  required.forEach(field => {
    if (!field.value.trim()) {
      field.style.borderColor = '#E53E3E';
      valid = false;
    } else {
      field.style.borderColor = '';
    }
  });

  if (!valid) {
    showToast('⚠️ Please fill in all required fields.');
    return;
  }

  const btn = form.querySelector('button[type="submit"]');
  if (btn) { btn.textContent = 'Sending…'; btn.disabled = true; }

  setTimeout(() => {
    showToast('✅ Message sent! We\'ll reply within 24 hours.');
    form.reset();
    if (btn) {
      btn.innerHTML = '✓ Message Sent!';
      btn.style.background = 'var(--teal)';
      setTimeout(() => {
        btn.innerHTML = 'Send Message <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
        btn.style.background = '';
        btn.disabled = false;
      }, 3000);
    }
  }, 1200);
}

/* ---- Smooth scroll for anchor links ---- */
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.getElementById(a.getAttribute('href').slice(1));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ---- Animate elements on scroll (Intersection Observer) ---- */
function initScrollAnimations() {
  if (!('IntersectionObserver' in window)) return;

  const style = document.createElement('style');
  style.textContent = `
    .fade-in { opacity: 0; transform: translateY(24px); transition: opacity .55s ease, transform .55s ease; }
    .fade-in.visible { opacity: 1; transform: translateY(0); }
  `;
  document.head.appendChild(style);

  const targets = $$('.product-card, .feature-card, .testimonial-card, .category-card, .value-card');
  targets.forEach(el => el.classList.add('fade-in'));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => observer.observe(el));
}

/* ---- Search focus shortcut (press /) ---- */
function initSearchShortcut() {
  document.addEventListener('keydown', e => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      const searchInput = $('.navbar__search input');
      if (searchInput) searchInput.focus();
    }
  });
}

/* ---- Cart button click (placeholder) ---- */
function initCartButton() {
  $$('#cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (cartCount === 0) {
        showToast('🛒 Your cart is empty — start shopping!');
      } else {
        showToast(`🛒 You have ${cartCount} item${cartCount !== 1 ? 's' : ''} in your cart.`);
      }
    });
  });
}

/* ---- Init all ---- */
document.addEventListener('DOMContentLoaded', () => {
  initStickyNav();
  initMobileMenu();
  initWishlistButtons();
  initSmoothScroll();
  initScrollAnimations();
  initSearchShortcut();
  initCartButton();
  updateCartUI();
});

/* Make functions available globally (called inline from HTML) */
window.addToCart        = addToCart;
window.handleNewsletter = handleNewsletter;
window.handleContactForm= handleContactForm;
window.showToast        = showToast;
