/**
 * Лендинг «Системы водоподготовки BWT для резиденций»
 *
 * Своего кода здесь минимум: карусель — Slick, лайтбокс — Magnific Popup,
 * маска телефона — inputmask; все три уже подключены на bwt.ru.
 * С нуля написаны только аккордеон FAQ (готового на сайте нет) и степпер этапов.
 */
(function () {
    'use strict';

    var $ = window.jQuery;

    /* ───────────── FAQ-аккордеон ─────────────
     * Все пункты закрыты по умолчанию, раскрываются по клику.
     * Несколько пунктов могут быть открыты одновременно.
     * Высоту не меряем: панель анимируется через grid-template-rows,
     * поэтому вёрстка не ломается при ресайзе и смене шрифта.
     */
    function initAccordion(root) {
        var triggers = root.querySelectorAll('.js-accordion-trigger');

        Array.prototype.forEach.call(triggers, function (trigger) {
            trigger.addEventListener('click', function () {
                var panel = document.getElementById(trigger.getAttribute('aria-controls'));
                if (!panel) return;

                var isOpen = trigger.getAttribute('aria-expanded') === 'true';

                if (isOpen) {
                    trigger.setAttribute('aria-expanded', 'false');
                    panel.classList.remove('is-open');
                    // hidden ставим после анимации, иначе схлопывание не видно
                    window.setTimeout(function () {
                        if (trigger.getAttribute('aria-expanded') === 'false') {
                            panel.hidden = true;
                        }
                    }, 300);
                } else {
                    panel.hidden = false;
                    // принудительный reflow, чтобы транзишн стартовал с 0fr
                    void panel.offsetHeight;
                    trigger.setAttribute('aria-expanded', 'true');
                    panel.classList.add('is-open');
                }
            });
        });
    }

    /* ───────────── Степпер этапов 01–07 ───────────── */
    function initStepper(root) {
        var dots = root.querySelectorAll('.js-stepper-dot');
        var label = root.querySelector('.js-stepper-label');
        var prev = root.querySelector('.js-stepper-prev');
        var next = root.querySelector('.js-stepper-next');
        var dataEl = root.querySelector('.js-stepper-data');

        if (!dots.length || !label || !dataEl) return;

        var labels;
        try {
            labels = JSON.parse(dataEl.textContent);
        } catch (e) {
            return;
        }

        var current = 0;

        function render() {
            Array.prototype.forEach.call(dots, function (dot, i) {
                var active = i === current;
                dot.classList.toggle('is-active', active);
                dot.setAttribute('aria-selected', active ? 'true' : 'false');
            });
            label.textContent = labels[current] || '';
            if (prev) prev.disabled = current === 0;
            if (next) next.disabled = current === dots.length - 1;
        }

        Array.prototype.forEach.call(dots, function (dot, i) {
            dot.addEventListener('click', function () {
                current = i;
                render();
            });
        });

        if (prev) prev.addEventListener('click', function () {
            if (current > 0) { current--; render(); }
        });

        if (next) next.addEventListener('click', function () {
            if (current < dots.length - 1) { current++; render(); }
        });

        render();
    }

    /* ───────────── Мобильный дропдаун «Разделы» ───────────── */
    function initNavDropdown() {
        var toggle = document.querySelector('.js-nav-toggle');
        if (!toggle) return;

        var drop = document.getElementById(toggle.getAttribute('aria-controls'));
        if (!drop) return;

        function close() {
            toggle.setAttribute('aria-expanded', 'false');
            drop.hidden = true;
        }

        toggle.addEventListener('click', function (e) {
            e.stopPropagation();
            var isOpen = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
            drop.hidden = isOpen;
        });

        document.addEventListener('click', function (e) {
            if (!drop.hidden && !drop.contains(e.target)) close();
        });

        drop.addEventListener('click', function (e) {
            if (e.target.tagName === 'A') close();
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') close();
        });
    }

    /* ───────────── Плавный скролл по якорям ─────────────
     * На боевом сайте этим занимается pagescroll2id (классы _mPS2id-*),
     * поэтому свой обработчик вешаем только если плагина нет —
     * иначе получим двойную прокрутку.
     */
    function initSmoothScroll() {
        if ($ && $.fn && $.fn.mPageScroll2id) return;
        if (!('scrollBehavior' in document.documentElement.style)) return;

        document.addEventListener('click', function (e) {
            var link = e.target.closest ? e.target.closest('.js-scroll-down') : null;
            if (!link) return;

            var href = link.getAttribute('href') || '';
            if (href.charAt(0) !== '#' || href.length < 2) return;

            var target = document.getElementById(href.slice(1));
            if (!target) return;

            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    /* ───────────── Видео кейса ─────────────
     * Постер заменяется на iframe только по клику: не тянем плеер,
     * пока пользователь не попросил. data-video принимает ссылку
     * на VK Video — так же, как на /business/pools/wooden-pools/.
     */
    function initVideo() {
        var block = document.querySelector('.js-video');
        if (!block) return;

        var btn = block.querySelector('.residence__pool-play');
        if (!btn) return;

        btn.addEventListener('click', function () {
            var src = block.getAttribute('data-video');
            if (!src) return; // ссылка ещё не проставлена — оставляем постер

            var iframe = document.createElement('iframe');
            iframe.setAttribute('src', src);
            iframe.setAttribute('allow', 'autoplay; encrypted-media; fullscreen; picture-in-picture');
            iframe.setAttribute('allowfullscreen', '');
            iframe.setAttribute('frameborder', '0');
            block.innerHTML = '';
            block.appendChild(iframe);
        });
    }

    /* ───────────── Плагины на jQuery ───────────── */
    function initJqueryPlugins() {
        if (!$) return;

        // Карусель пространств
        if ($.fn.slick) {
            $('.js-zones').slick({
                slidesToShow: 1,
                arrows: true,
                dots: false,
                infinite: true,
                speed: 400,
                adaptiveHeight: false
            });
        }

        // Лайтбокс галереи бассейна
        if ($.fn.magnificPopup) {
            $('.js-gallery').magnificPopup({
                delegate: 'a',
                type: 'image',
                gallery: { enabled: true },
                image: { titleSrc: function (item) { return item.el.find('img').attr('alt') || ''; } }
            });
        }

        // Маска телефона — тот же формат, что в формах на сайте
        if ($.fn.inputmask) {
            $('.js-input-phone').inputmask({ mask: '+7 (999) 999-99-99', showMaskOnHover: false });
        }
    }

    /* ───────────── Запуск ───────────── */
    function init() {
        var accordion = document.querySelector('.js-accordion');
        if (accordion) initAccordion(accordion);

        var stepper = document.querySelector('.js-stepper');
        if (stepper) initStepper(stepper.closest('.residence__stages-card') || stepper.parentNode);

        initNavDropdown();
        initSmoothScroll();
        initVideo();
        initJqueryPlugins();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
