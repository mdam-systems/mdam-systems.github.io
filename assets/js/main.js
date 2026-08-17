/* ==========================================================
   MDAM Systems - Scripts del sitio
   ========================================================== */
(function () {
  'use strict';

  /* --- Menú móvil --- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // Cerrar al hacer clic en un enlace
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('is-open');
        toggle.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Cerrar con Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        toggle.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* --- Animación de entrada al hacer scroll --- */
  var items = document.querySelectorAll('.reveal');

  if (items.length) {
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

      items.forEach(function (el, i) {
        el.style.transitionDelay = (i % 4) * 70 + 'ms';
        obs.observe(el);
      });
    } else {
      items.forEach(function (el) { el.classList.add('is-visible'); });
    }
  }

  /* --- Año actual en el pie de página --- */
  var year = document.querySelectorAll('[data-year]');
  year.forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* --- Formulario de contacto (sin backend: abre el correo) --- */
  var form = document.querySelector('[data-contact-form]');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var asunto = 'Consulta desde el sitio web - ' + (data.get('producto') || 'General');
      var cuerpo = [
        'Nombre: ' + (data.get('nombre') || ''),
        'Empresa: ' + (data.get('empresa') || ''),
        'Correo: ' + (data.get('correo') || ''),
        'Telefono: ' + (data.get('telefono') || ''),
        'Producto de interes: ' + (data.get('producto') || ''),
        '',
        'Mensaje:',
        (data.get('mensaje') || '')
      ].join('\n');

      var destino = form.getAttribute('data-mailto') || 'contacto@mdam.com';
      window.location.href = 'mailto:' + destino +
        '?subject=' + encodeURIComponent(asunto) +
        '&body=' + encodeURIComponent(cuerpo);
    });
  }
})();
