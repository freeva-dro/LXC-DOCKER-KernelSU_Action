// ==================== 彩虹云主题交互脚本 ====================

document.addEventListener('DOMContentLoaded', function() {
    // 初始化背景云朵
    initBackgroundClouds();
    
    // 初始化导航栏滚动效果
    initNavbarScroll();
    
    // 初始化移动端菜单
    initMobileMenu();
    
    // 初始化滚动显示动画
    initScrollReveal();
    
    // 初始化导航链接高亮
    initNavActive();
    
    // 初始化表单提交
    initFormSubmit();
});

// ==================== 背景云朵生成 ====================
function initBackgroundClouds() {
    const cloudLayer = document.getElementById('cloudLayer');
    if (!cloudLayer) return;

    const cloudColors = [
        ['#FFD1DC', '#FFB86B'],
        ['#E8D5FF', '#B28DFF'],
        ['#D1E8FF', '#6BCFFF'],
        ['#C8F7DC', '#D1E8FF'],
        ['#FFF3B0', '#FFD1DC']
    ];

    const cloudCount = 8;

    for (let i = 0; i < cloudCount; i++) {
        const cloud = document.createElement('div');
        cloud.className = 'bg-cloud';
        
        const colorPair = cloudColors[i % cloudColors.length];
        const size = 80 + Math.random() * 160;
        const top = Math.random() * 100;
        const duration = 60 + Math.random() * 80;
        const delay = -Math.random() * duration;
        
        cloud.style.width = `${size}px`;
        cloud.style.height = `${size * 0.6}px`;
        cloud.style.top = `${top}%`;
        cloud.style.animationDuration = `${duration}s`;
        cloud.style.animationDelay = `${delay}s`;
        cloud.style.opacity = `${0.15 + Math.random() * 0.25}`;
        
        cloud.innerHTML = `
            <svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="bgCloud${i}" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:${colorPair[0]};stop-opacity:0.8"/>
                        <stop offset="100%" style="stop-color:${colorPair[1]};stop-opacity:0.8"/>
                    </linearGradient>
                </defs>
                <ellipse cx="100" cy="70" rx="80" ry="35" fill="url(#bgCloud${i})"/>
                <ellipse cx="60" cy="55" rx="45" ry="30" fill="url(#bgCloud${i})"/>
                <ellipse cx="140" cy="50" rx="40" ry="28" fill="url(#bgCloud${i})"/>
                <ellipse cx="100" cy="40" rx="35" ry="25" fill="url(#bgCloud${i})"/>
            </svg>
        `;
        
        cloudLayer.appendChild(cloud);
    }
}

// ==================== 导航栏滚动效果 ====================
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    let lastScroll = 0;

    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    }, { passive: true });
}

// ==================== 移动端菜单 ====================
function initMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    if (!menuBtn) return;

    // 创建移动端菜单
    let mobileMenu = document.querySelector('.mobile-menu');
    if (!mobileMenu) {
        mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-menu';
        mobileMenu.innerHTML = `
            <ul>
                <li><a href="#home">首页</a></li>
                <li><a href="#features">特色</a></li>
                <li><a href="#gallery">画廊</a></li>
                <li><a href="#pricing">价格</a></li>
                <li><a href="#contact">联系</a></li>
            </ul>
        `;
        document.body.appendChild(mobileMenu);
    }

    menuBtn.addEventListener('click', function() {
        mobileMenu.classList.toggle('open');
        const spans = menuBtn.querySelectorAll('span');
        if (mobileMenu.classList.contains('open')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -7px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });

    // 点击菜单项关闭
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.remove('open');
            const spans = menuBtn.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });

    // 点击外部关闭
    document.addEventListener('click', function(e) {
        if (!menuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
            mobileMenu.classList.remove('open');
            const spans = menuBtn.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
}

// ==================== 滚动显示动画 ====================
function initScrollReveal() {
    const elements = document.querySelectorAll(
        '.feature-card, .gallery-item, .pricing-card, .section-header, .stat-item'
    );

    elements.forEach(el => {
        el.classList.add('reveal');
    });

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => {
        observer.observe(el);
    });
}

// ==================== 导航链接高亮 ====================
function initNavActive() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!sections.length || !navLinks.length) return;

    window.addEventListener('scroll', function() {
        let current = '';
        const scrollPosition = window.pageYOffset + 200;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }, { passive: true });
}

// ==================== 表单提交处理 ====================
function initFormSubmit() {
    const forms = document.querySelectorAll('.cta-form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const input = form.querySelector('input');
            if (input && input.value) {
                // 模拟提交成功
                const btn = form.querySelector('button');
                const originalText = btn.innerHTML;
                btn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span>注册成功!</span>
                `;
                btn.style.background = 'linear-gradient(135deg, #C8F7DC 0%, #6BCFFF 100%)';
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                    input.value = '';
                }, 3000);
            }
        });
    });
}

// ==================== 平滑滚动增强 ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            const offset = 80;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ==================== 鼠标跟随云朵效果（可选） ====================
let mouseCloudTimeout;
document.addEventListener('mousemove', function(e) {
    clearTimeout(mouseCloudTimeout);
    
    mouseCloudTimeout = setTimeout(() => {
        const heroVisual = document.querySelector('.hero-visual');
        if (heroVisual) {
            const rect = heroVisual.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
            const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
            
            heroVisual.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        }
    }, 16);
});
