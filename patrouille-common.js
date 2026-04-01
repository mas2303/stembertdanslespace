(function() {
    var DELAY_ENTRE_SECTIONS = 5000;
    /** Parcours détaillé (patrouille-1.js …) : pas de handler formulaire « ancien » common. */
    var dataParcours = document.body.getAttribute('data-parcours') || '';
    var isParcoursPatrouilleDetail = /^patrouille-[1-4]$/.test(dataParcours);
    var sections = document.querySelectorAll('#suite-site .suite-section');
    var video = document.getElementById('video-exfiltration');
    var mapSection = document.getElementById('section-map');
    var sectionParticipants = document.getElementById('section-participants');

    function revealSection(section) {
        if (!section) return;
        section.classList.add('section-visible');
        if (section.classList.contains('section-map')) {
            section.classList.add('map-reveal');
        }
        section.setAttribute('aria-hidden', 'false');
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    var btnExfil = document.getElementById('btn-exfiltration');
    if (btnExfil) {
        btnExfil.addEventListener('click', function() {
            document.body.classList.add('exfiltration-reveal');
            var suite = document.getElementById('suite-site');
            suite.setAttribute('aria-hidden', 'false');
            suite.focus({ preventScroll: true });
            if (sectionParticipants) {
                sectionParticipants.classList.add('section-visible');
                sectionParticipants.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    var btnAjouter = document.getElementById('btn-ajouter-participant');
    if (btnAjouter) {
        btnAjouter.addEventListener('click', function() {
            var liste = document.getElementById('liste-participants');
            var rows = liste.querySelectorAll('.participant-row');
            var n = rows.length + 1;
            var div = document.createElement('div');
            div.className = 'participant-row';
            div.innerHTML = '<label class="participant-label">Participant ' + n + '</label><input type="text" class="participant-totem" placeholder="TOTEM / IDENTITÉ" required>';
            liste.appendChild(div);
        });
    }

    var formParticipants = document.getElementById('form-participants');
    if (formParticipants && !isParcoursPatrouilleDetail) {
        formParticipants.addEventListener('submit', function(e) {
            e.preventDefault();
            var inputs = document.querySelectorAll('#form-participants .participant-totem');
            window.participantsPatrouille = [];
            for (var i = 0; i < inputs.length; i++) {
                window.participantsPatrouille.push(inputs[i].value.trim());
            }
            if (sectionParticipants) sectionParticipants.classList.remove('section-visible');
            if (video) video.play().catch(function() {});
            revealSection(sections[0]);
            for (var i = 1; i < sections.length; i++) {
                (function(idx) {
                    setTimeout(function() { revealSection(sections[idx]); }, idx * DELAY_ENTRE_SECTIONS);
                })(i);
            }
        });
    }

    document.querySelectorAll('.chemin-carte').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var sectionMapChoix = document.getElementById('section-map-choix');
            if (sectionMapChoix) {
                sectionMapChoix.classList.add('map-reveal');
                sectionMapChoix.setAttribute('aria-hidden', 'false');
                sectionMapChoix.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    if (video && mapSection && !isParcoursPatrouilleDetail) {
        video.addEventListener('ended', function() {
            var idx = Array.prototype.indexOf.call(sections, mapSection);
            if (idx >= 0) {
                for (var i = 0; i <= idx; i++) {
                    sections[i].classList.add('section-visible');
                    if (sections[i].classList.contains('section-map')) sections[i].classList.add('map-reveal');
                    sections[i].setAttribute('aria-hidden', 'false');
                }
                mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    var navToggle = document.querySelector('.nav-toggle');
    var navLinks = document.querySelector('.nav-links');
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            navLinks.classList.toggle('open');
            this.classList.toggle('active');
            document.body.classList.toggle('nav-menu-open', navLinks.classList.contains('open'));
        });
        document.addEventListener('click', function(e) {
            if (!navLinks.classList.contains('open')) return;
            if (navToggle.contains(e.target) || navLinks.contains(e.target)) return;
            navLinks.classList.remove('open');
            navToggle.classList.remove('active');
            document.body.classList.remove('nav-menu-open');
        });
        document.addEventListener('keydown', function(e) {
            if (e.key !== 'Escape') return;
            if (!navLinks.classList.contains('open')) return;
            navLinks.classList.remove('open');
            navToggle.classList.remove('active');
            document.body.classList.remove('nav-menu-open');
        });
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                navLinks.classList.remove('open');
                navToggle.classList.remove('active');
                document.body.classList.remove('nav-menu-open');
            }
        });
    }

    var observerOptions = { threshold: 0.15, rootMargin: '0px 0px -50px 0px' };
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, observerOptions);
    document.querySelectorAll('.carte-militaire').forEach(function(el, i) {
        el.style.transitionDelay = (i * 0.1) + 's';
        observer.observe(el);
    });

    var end = new Date();
    if (end.getMonth() >= 3) end.setFullYear(end.getFullYear() + 1);
    end.setMonth(3);
    end.setDate(30);
    end.setHours(17, 0, 0, 0);
    function updateCountdown() {
        var now = new Date();
        var diff = end - now;
        var el = document.getElementById('countdown');
        if (!el) return;
        if (diff <= 0) {
            el.textContent = 'TERMINÉ';
            el.classList.add('countdown-ended');
            return;
        }
        var h = Math.floor(diff / 3600000);
        var m = Math.floor((diff % 3600000) / 60000);
        var s = Math.floor((diff % 60000) / 1000);
        el.textContent = h + 'h ' + m + 'm ' + s + 's';
    }
    updateCountdown();
    var countdownIntervalId = setInterval(updateCountdown, 1000);

    window.stopPatrouilleExfilCountdown = function(label) {
        clearInterval(countdownIntervalId);
        var el = document.getElementById('countdown');
        if (el) {
            el.textContent = label || 'TERMINÉ';
            el.classList.add('countdown-ended');
        }
    };
})();
