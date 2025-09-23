const navToggle = document.getElementById('nav-toggle');
const nav = document.getElementById('nav');
const scrollTopButton = document.getElementById('scroll-top');
const announcement = document.getElementById('announcement');
const yearSpan = document.getElementById('ano-atual');

const contactForm = document.getElementById('contact-form');
const newsletterForm = document.getElementById('newsletter-form');
const formSuccess = document.getElementById('form-success');
const newsletterSuccess = document.getElementById('newsletter-success');

const NAV_ACTIVE_CLASS = 'is-open';
const LINK_ACTIVE_CLASS = 'is-active';

function toggleNav() {
  const expanded = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!expanded));
  nav.classList.toggle(NAV_ACTIVE_CLASS);
}

function closeNav() {
  navToggle.setAttribute('aria-expanded', 'false');
  nav.classList.remove(NAV_ACTIVE_CLASS);
}

if (navToggle) {
  navToggle.addEventListener('click', toggleNav);
}

nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    closeNav();
  });
});

/* Destaca item do menu conforme seção visível */
const sections = Array.from(document.querySelectorAll('main section[id]'));
const navLinks = Array.from(nav.querySelectorAll('a[href^="#"]'));

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            link.classList.toggle(LINK_ACTIVE_CLASS, link.getAttribute('href') === `#${id}`);
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach((section) => observer.observe(section));
}

/* Animação dos indicadores */
const metrics = document.querySelectorAll('.metric__value');

function animateValue(element, target) {
  const duration = 1400;
  const start = performance.now();
  const isDecimal = !Number.isInteger(Number(target));
  const endValue = Number(target);

  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
    const current = eased * endValue;
    element.textContent = isDecimal ? current.toFixed(1) : Math.round(current);
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

if (metrics.length && 'IntersectionObserver' in window) {
  const metricsObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const { target } = entry;
          const value = target.getAttribute('data-target');
          animateValue(target, value);
          observer.unobserve(target);
        }
      });
    },
    { threshold: 0.5 }
  );

  metrics.forEach((metric) => metricsObserver.observe(metric));
}

/* Botão de voltar ao topo */
window.addEventListener('scroll', () => {
  const showButton = window.scrollY > 480;
  scrollTopButton.classList.toggle('is-visible', showButton);
});

scrollTopButton.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* Atualiza ano corrente */
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

/* Funções utilitárias de formulário */
function setAnnouncement(message) {
  if (!announcement) return;
  announcement.textContent = message;
  if (message) {
    window.setTimeout(() => {
      announcement.textContent = '';
    }, 4000);
  }
}

function validateField(input, errorElement, message) {
  if (!input) return false;

  if (!input.value.trim()) {
    errorElement.textContent = message;
    return false;
  }

  if (input.type === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!emailRegex.test(input.value)) {
      errorElement.textContent = 'Digite um e-mail válido.';
      return false;
    }
  }

  errorElement.textContent = '';
  return true;
}

function handleContactSubmit(event) {
  event.preventDefault();

  const fields = [
    { input: contactForm.nome, error: document.getElementById('erro-nome'), message: 'Informe seu nome.' },
    { input: contactForm.email, error: document.getElementById('erro-email'), message: 'Informe seu e-mail.' },
    { input: contactForm.empresa, error: document.getElementById('erro-empresa'), message: 'Informe sua empresa.' },
    {
      input: contactForm.mensagem,
      error: document.getElementById('erro-mensagem'),
      message: 'Conte como podemos ajudar.',
    },
  ];

  let isValid = true;
  fields.forEach(({ input, error, message }) => {
    const fieldValid = validateField(input, error, message);
    if (!fieldValid) {
      isValid = false;
    }
  });

  if (!isValid) {
    formSuccess.textContent = '';
    setAnnouncement('Revise os campos destacados e tente novamente.');
    return;
  }

  formSuccess.textContent = 'Mensagem enviada! Em breve nossa equipe entrará em contato.';
  setAnnouncement('Mensagem enviada com sucesso.');
  contactForm.reset();
}

if (contactForm) {
  contactForm.addEventListener('submit', handleContactSubmit);
}

function handleNewsletterSubmit(event) {
  event.preventDefault();
  const emailInput = newsletterForm['newsletter-email'];
  const isValid = validateField(emailInput, newsletterSuccess, 'Informe seu e-mail.');
  if (!isValid) {
    setAnnouncement('Não foi possível assinar a newsletter. Verifique o e-mail informado.');
    return;
  }

  newsletterSuccess.textContent = 'Inscrição realizada! Você receberá novidades em breve.';
  setAnnouncement('Inscrição na newsletter concluída.');
  newsletterForm.reset();
}

if (newsletterForm) {
  newsletterForm.addEventListener('submit', handleNewsletterSubmit);
}

/* Acessibilidade: fecha menu com tecla Escape */
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && nav.classList.contains(NAV_ACTIVE_CLASS)) {
    closeNav();
    navToggle.focus();
  }
});
