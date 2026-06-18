// ===== Loading Screen =====
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.classList.add('hidden');
        setTimeout(() => loader.remove(), 600);
    }
});

// ===== Dark/Light Mode Toggle =====
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle?.querySelector('i');
const currentTheme = localStorage.getItem('theme') || 'light';

if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (themeIcon) {
        themeIcon.className = 'fas fa-sun';
    }
}

themeToggle?.addEventListener('click', () => {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';

    if (isDark) {
        html.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        if (themeIcon) themeIcon.className = 'fas fa-moon';
    } else {
        html.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        if (themeIcon) themeIcon.className = 'fas fa-sun';
    }
});

// ===== Sticky Navbar =====
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 80) {
        navbar?.classList.add('scrolled');
    } else {
        navbar?.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
});

// ===== Hamburger Menu =====
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks?.classList.toggle('open');
});

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger?.classList.remove('active');
        navLinks?.classList.remove('open');
    });
});

// ===== Smooth Scroll for Nav Links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ===== Active Nav Link on Scroll =====
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

function updateActiveLink() {
    let current = '';
    sections.forEach(section => {
        const top = section.offsetTop - 150;
        if (window.pageYOffset >= top) {
            current = section.getAttribute('id');
        }
    });

    navAnchors.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', updateActiveLink);

// ===== Scroll Reveal =====
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
    entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
);

revealElements.forEach(el => revealObserver.observe(el));

// ===== Animated Counters =====
const counterElements = document.querySelectorAll('[data-count]');

const counterObserver = new IntersectionObserver(
    entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.getAttribute('data-count'));
                const duration = 2000;
                const step = Math.max(1, Math.floor(target / 60));
                let current = 0;

                const timer = setInterval(() => {
                    current += step;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    el.textContent = current + (el.getAttribute('data-suffix') || '');
                }, duration / 60);

                counterObserver.unobserve(el);
            }
        });
    },
    { threshold: 0.5 }
);

counterElements.forEach(el => counterObserver.observe(el));

// ===== Animated Skill Bars =====
const skillBars = document.querySelectorAll('.skill-progress');

const skillObserver = new IntersectionObserver(
    entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const width = bar.getAttribute('data-width') || '0%';
                bar.style.width = width;
                skillObserver.unobserve(bar);
            }
        });
    },
    { threshold: 0.3 }
);

skillBars.forEach(bar => skillObserver.observe(bar));

// ===== Portfolio Filter =====
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        portfolioItems.forEach(item => {
            if (filter === 'all' || item.getAttribute('data-category') === filter) {
                item.style.display = 'block';
                item.style.opacity = '0';
                setTimeout(() => {
                    item.style.opacity = '1';
                }, 50);
            } else {
                item.style.display = 'none';
            }
        });
    });
});

// ===== Portfolio Modal =====
const modal = document.getElementById('portfolio-modal');
const modalClose = modal?.querySelector('.modal-close');
const modalTitle = modal?.querySelector('.modal-title');
const modalCategory = modal?.querySelector('.modal-category');
const modalDesc = modal?.querySelector('.modal-description');
const modalLinks = modal?.querySelector('.modal-links');

document.querySelectorAll('.portfolio-item').forEach(item => {
    item.addEventListener('click', function () {
        const title = this.getAttribute('data-title') || 'Project Title';
        const category = this.getAttribute('data-category') || 'web';
        const description = this.getAttribute('data-description') || 'Project description here.';
        const liveLink = this.getAttribute('data-live') || '#';
        const githubLink = this.getAttribute('data-github') || '#';

        if (modalTitle) modalTitle.textContent = title;
        if (modalCategory) modalCategory.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        if (modalDesc) modalDesc.textContent = description;

        if (modalLinks) {
            modalLinks.innerHTML = `
                <a href="${liveLink}" target="_blank" class="btn btn-primary btn-sm">
                    <i class="fas fa-external-link-alt"></i> Live Demo
                </a>
                <a href="${githubLink}" target="_blank" class="btn btn-outline btn-sm">
                    <i class="fab fa-github"></i> GitHub
                </a>
            `;
        }

        modal?.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
});

modalClose?.addEventListener('click', () => {
    modal?.classList.remove('active');
    document.body.style.overflow = '';
});

modal?.addEventListener('click', e => {
    if (e.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// ===== Testimonial Slider =====
const slides = document.querySelectorAll('.testimonial-slide');
const dots = document.querySelectorAll('.testimonial-dots .dot');
let currentSlide = 0;

function showSlide(index) {
    slides.forEach((slide, i) => {
        slide.style.display = i === index ? 'block' : 'none';
    });

    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
}

if (slides.length) {
    showSlide(0);

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const index = parseInt(dot.getAttribute('data-index'));
            currentSlide = index;
            showSlide(index);
        });
    });

    setInterval(() => {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }, 5000);
}

// ===== Back to Top =====
const backToTop = document.querySelector('.back-to-top');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 400) {
        backToTop?.classList.add('show');
    } else {
        backToTop?.classList.remove('show');
    }
});

backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== Contact Form (AJAX) =====
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

contactForm?.addEventListener('submit', async e => {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn?.innerHTML;

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    }

    try {
        const response = await fetch('includes/contact_process.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            formStatus.className = 'form-status success';
            formStatus.innerHTML = `<i class="fas fa-check-circle"></i> ${data.message}`;
            contactForm.reset();
        } else {
            const errors = data.errors?.map(err => `<li>${err}</li>`).join('');
            formStatus.className = 'form-status error';
            formStatus.innerHTML = `
                <i class="fas fa-exclamation-circle"></i> Please fix the following errors:
                <ul>${errors}</ul>
            `;
        }
    } catch (err) {
        formStatus.className = 'form-status error';
        formStatus.innerHTML = '<i class="fas fa-exclamation-circle"></i> Network error. Please try again.';
    }

    formStatus.style.display = 'block';

    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }

    setTimeout(() => {
        formStatus.style.display = 'none';
    }, 6000);
});

// ===== Typing Effect for Hero =====
function initTypingEffect() {
    const element = document.getElementById('typed-text');
    if (!element) return;

    const words = [
        'Full-Stack Developer',
        'Graphic Designer',
        'UI/UX Enthusiast',
        'Problem Solver',
        'Creative Thinker'
    ];

    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isPaused = false;

    function type() {
        const currentWord = words[wordIndex];

        if (isPaused) {
            setTimeout(type, 2000);
            isPaused = false;
            isDeleting = true;
            return;
        }

        if (isDeleting) {
            element.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;

            if (charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                setTimeout(type, 500);
                return;
            }

            setTimeout(type, 40);
        } else {
            element.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;

            if (charIndex === currentWord.length) {
                isPaused = true;
                setTimeout(type, 2000);
                return;
            }

            setTimeout(type, 80);
        }
    }

    type();
}

initTypingEffect();
