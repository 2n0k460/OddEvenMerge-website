// script.js
document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('header'); // header要素を取得
    const mainNav = document.getElementById('main-nav');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    let navHeight = header ? header.offsetHeight : 60; // ヘッダー全体の高さを基準に

    function updateNavHeight() {
        navHeight = header ? header.offsetHeight : 60;
    }
    window.addEventListener('resize', throttle(() => {
        updateNavHeight();
        changeNavActiveState();
    }, 100));
    updateNavHeight(); // 初期ロード時

    const sections = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('#main-nav ul li a[href^="#"]');

    // --- ハンバーガーメニューの制御 ---
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            const isExpanded = navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', isExpanded.toString());
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768 && navMenu.classList.contains('active')) { // スマホ表示時のみ
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                    navToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }

    // --- ナビゲーションのアクティブ状態 (スクロール連動) ---
    function changeNavActiveState() {
        let currentSectionId = '';
        const scrollPosition = window.pageYOffset;
        const viewportHeight = window.innerHeight;
        const viewportCenter = scrollPosition + viewportHeight / 2;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - navHeight; // ヘッダー分を考慮
            const sectionBottom = sectionTop + section.offsetHeight;

            // セクションがビューポート内にあり、かつビューポートの中心に最も近いものを探す
            if (scrollPosition < sectionBottom && scrollPosition + viewportHeight > sectionTop) {
                const sectionCenter = sectionTop + section.offsetHeight / 2;
                const distanceToCenter = Math.abs(viewportCenter - sectionCenter);

                if (currentSectionId === '' || distanceToCenter < document.getElementById(currentSectionId)._distanceToCenter) {
                    currentSectionId = section.getAttribute('id');
                    section._distanceToCenter = distanceToCenter; // 一時的に距離を格納
                }
            }
        });
        
        // ページ最上部の場合は最初のセクションをアクティブに
        if (scrollPosition < sections[0].offsetTop - navHeight + sections[0].offsetHeight / 3 ) {
            currentSectionId = sections[0].getAttribute('id');
        }
        // ページ最下部までスクロールしきった場合、最後のセクションをアクティブに
        if ((window.innerHeight + scrollPosition) >= document.body.offsetHeight - 50) { // 50pxはフッターなどの余裕
            currentSectionId = sections[sections.length - 1].getAttribute('id');
        }


        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    }

    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    window.addEventListener('scroll', throttle(changeNavActiveState, 100));
    changeNavActiveState(); // 初期ロード

    // --- FAQアコーディオン ---
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const isActive = question.classList.contains('active');
            question.setAttribute('aria-expanded', !isActive);
            question.classList.toggle('active');

            if (!isActive) {
                answer.style.paddingTop = '20px';
                answer.style.paddingBottom = '20px';
                answer.style.maxHeight = answer.scrollHeight + "px";
            } else {
                answer.style.maxHeight = '0px';
                answer.addEventListener('transitionend', function handler() {
                    if (!question.classList.contains('active')) {
                        answer.style.paddingTop = '0px';
                        answer.style.paddingBottom = '0px';
                    }
                    answer.removeEventListener('transitionend', handler);
                }, { once: true });
            }
        });
    });

    // --- スムーススクロール (ナビゲーションリンク用) ---
    navLinks.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#') && href.length > 1) {
                e.preventDefault();
                const targetId = href;
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const targetPosition = targetElement.offsetTop - navHeight + 1;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // --- スクロールに応じたフェードイン要素 ---
    const fadeElements = document.querySelectorAll('.fade-in-element');
    if ("IntersectionObserver" in window) {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -50px 0px', // ビューポートの下端から50px手前で反応開始
            threshold: 0.1 // 10%見えたら
        };
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        fadeElements.forEach(el => {
            observer.observe(el);
        });
    } else {
        fadeElements.forEach(el => {
            el.classList.add('is-visible');
        });
    }
});