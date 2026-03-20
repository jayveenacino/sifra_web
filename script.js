// Bug-fixed JavaScript for Sifra Landing Page

// Check if device supports hover (non-touch)
const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const isTouchDevice = !supportsHover || 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// Custom Cursor - Only initialize on non-touch devices
if (!isTouchDevice && supportsHover) {
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    
    if (cursorDot && cursorOutline) {
        let mouseX = 0;
        let mouseY = 0;
        let outlineX = 0;
        let outlineY = 0;
        
        // Use requestAnimationFrame for smooth cursor movement
        const animateCursor = () => {
            // Smooth follow for outline
            outlineX += (mouseX - outlineX) * 0.15;
            outlineY += (mouseY - outlineY) * 0.15;
            
            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;
            cursorOutline.style.left = `${outlineX}px`;
            cursorOutline.style.top = `${outlineY}px`;
            
            requestAnimationFrame(animateCursor);
        };
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        }, { passive: true });
        
        animateCursor();
        
        // Hover effects for cursor
        const hoverElements = document.querySelectorAll('a, button, .bento-card, .phone-group, .nav-cta, .btn-primary, .btn-secondary');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorOutline.style.width = '60px';
                cursorOutline.style.height = '60px';
                cursorOutline.style.backgroundColor = 'rgba(255,255,255,0.1)';
            }, { passive: true });
            
            el.addEventListener('mouseleave', () => {
                cursorOutline.style.width = '20px';
                cursorOutline.style.height = '20px';
                cursorOutline.style.backgroundColor = 'transparent';
            }, { passive: true });
        });
    }
} else {
    // Hide cursor elements on touch devices
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    if (cursorDot) cursorDot.style.display = 'none';
    if (cursorOutline) cursorOutline.style.display = 'none';
}

// Navigation scroll effect with throttling
const nav = document.querySelector('.nav-bar');
let lastScrollY = 0;
let ticking = false;

const updateNav = () => {
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
    ticking = false;
};

window.addEventListener('scroll', () => {
    lastScrollY = window.scrollY;
    if (!ticking) {
        requestAnimationFrame(updateNav);
        ticking = true;
    }
}, { passive: true });

// Bento card spotlight effect with debouncing
const cards = document.querySelectorAll('.bento-card');

cards.forEach(card => {
    // Skip if touch device for performance
    if (isTouchDevice) return;
    
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        card.style.setProperty('--mouse-x', `${x}%`);
        card.style.setProperty('--mouse-y', `${y}%`);
    }, { passive: true });
});

// 3D Tilt effect for cards - disabled on mobile for performance
if (!isTouchDevice) {
    const tiltCards = document.querySelectorAll('[data-tilt]');
    
    tiltCards.forEach(card => {
        let rafId = null;
        let isHovering = false;
        
        card.addEventListener('mouseenter', () => {
            isHovering = true;
        }, { passive: true });
        
        card.addEventListener('mousemove', (e) => {
            if (!isHovering) return;
            
            if (rafId) cancelAnimationFrame(rafId);
            
            rafId = requestAnimationFrame(() => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
            });
        }, { passive: true });
        
        card.addEventListener('mouseleave', () => {
            isHovering = false;
            if (rafId) cancelAnimationFrame(rafId);
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        }, { passive: true });
    });
}

// Intersection Observer for scroll animations - Fixed implementation
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observerCallback = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Add visible class for CSS transition
            entry.target.classList.add('visible');
            
            // Unobserve after animation triggers (prevents re-triggering)
            observer.unobserve(entry.target);
        }
    });
};

const observer = new IntersectionObserver(observerCallback, observerOptions);

// Observe elements with proper cleanup
document.querySelectorAll('.bento-card, .section-header').forEach(el => {
    observer.observe(el);
});

// Parallax effect for hero orbs - throttled
const orb1 = document.querySelector('.orb-1');
const orb2 = document.querySelector('.orb-2');

if (orb1 && orb2 && !isTouchDevice) {
    let parallaxTicking = false;
    
    window.addEventListener('scroll', () => {
        if (!parallaxTicking) {
            requestAnimationFrame(() => {
                const scrolled = window.pageYOffset;
                orb1.style.transform = `translateY(${scrolled * 0.2}px)`;
                orb2.style.transform = `translateY(${scrolled * 0.3}px)`;
                parallaxTicking = false;
            });
            parallaxTicking = true;
        }
    }, { passive: true });
}

// Smooth scroll for nav links with fallback
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Text scramble effect for hero title - Fixed
class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.update = this.update.bind(this);
        this.frame = 0;
        this.queue = [];
        this.frameRequest = null;
        this.isAnimating = false;
    }
    
    setText(newText) {
        if (this.isAnimating) {
            cancelAnimationFrame(this.frameRequest);
        }
        
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        
        this.queue = [];
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 40);
            this.queue.push({ from, to, start, end, char: null });
        }
        
        this.frame = 0;
        this.isAnimating = true;
        this.update();
        
        return new Promise((resolve) => {
            this.resolve = resolve;
        });
    }
    
    update() {
        let output = '';
        let complete = 0;
        
        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];
            
            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.randomChar();
                    this.queue[i].char = char;
                }
                output += `<span class="scramble-char" style="opacity: 0.7;">${char}</span>`;
            } else {
                output += from;
            }
        }
        
        this.el.innerHTML = output;
        
        if (complete === this.queue.length) {
            this.isAnimating = false;
            if (this.resolve) this.resolve();
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }
    
    randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
}

// Initialize scramble on load with error handling
window.addEventListener('load', () => {
    try {
        const title = document.querySelector('.title-line:not(.outline)');
        if (title && !isTouchDevice) {
            const fx = new TextScramble(title);
            setTimeout(() => {
                fx.setText('PRECISION').catch(console.error);
            }, 500);
        }
    } catch (error) {
        console.error('Text scramble initialization failed:', error);
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    observer.disconnect();
});

// Handle visibility change to pause animations when tab is hidden
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause expensive animations
        document.body.classList.add('animations-paused');
    } else {
        document.body.classList.remove('animations-paused');
    }
});