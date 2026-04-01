/**
 * Parcours Patrouille 4 — déblocages séquentiels (copie logique patrouille 1).
 * Modifiez CONFIG et les cartes dans patrouille-4.html.
 */
(function() {
    if (document.body.getAttribute('data-parcours') !== 'patrouille-4') return;

    /** Cartes / iframes : éditer `patrouille-4.html`. Similitude (4 photos) : `objetCle`, `messagesObjetAcceptes` + images point 6 dans le HTML. */
    var CONFIG = {
        /** Nombre de sections #section-etape-1 … #section-etape-N (hors intro / participants). À ajuster si vous ajoutez ou retirez des étapes. */
        nombrePoints: 8,
        /** Réponse attendue à l’énigme chimie (concentration molaire, ex. 0,2 mol/L). */
        reponseChimie: '0.2',
        objetCle: 'dague',
        vueRestaurant: 'lac',
        messagesObjetAcceptes: ['dague', 'la dague', 'une dague'],
        /**
         * Fichier absent, 404, format refusé, durée invalide : délai avant passage auto (ms).
         */
        missingVideoMs: 5000,
        /**
         * Autoplay bloqué (NotAllowedError) : si l’utilisateur ne lance pas la lecture, passage après (ms).
         */
        noLaunchMs: 1000
    };

    /**
     * Lecture OK : suite à « ended ».
     * Média manquant / erreur : suite après missingVideoMs.
     * Autoplay refusé uniquement : noLaunchMs si personne ne clique sur lecture.
     */
    function waitForVideoEndOrFallback(video, onComplete) {
        var miss = CONFIG.missingVideoMs;
        var nlaunch = CONFIG.noLaunchMs;
        var done = false;
        var sawPlaying = false;
        var noLaunchTimer = null;
        var missingTimer = null;

        function clearTimers() {
            if (noLaunchTimer) {
                clearTimeout(noLaunchTimer);
                noLaunchTimer = null;
            }
            if (missingTimer) {
                clearTimeout(missingTimer);
                missingTimer = null;
            }
        }

        function finish() {
            if (done) return;
            done = true;
            clearTimers();
            onComplete();
        }

        function scheduleMissingMedia() {
            clearTimers();
            missingTimer = setTimeout(finish, miss);
        }

        function armNoLaunchIfStillIdle() {
            if (noLaunchTimer) clearTimeout(noLaunchTimer);
            noLaunchTimer = setTimeout(function() {
                if (!done && !sawPlaying) finish();
            }, nlaunch);
        }

        if (!video) {
            scheduleMissingMedia();
            return;
        }

        video.addEventListener('playing', function() {
            sawPlaying = true;
            clearTimers();
        });

        video.addEventListener('ended', finish);

        video.addEventListener('error', function() {
            scheduleMissingMedia();
        });

        video.addEventListener('loadedmetadata', function() {
            var d = video.duration;
            if (!d || !isFinite(d) || d <= 0) {
                scheduleMissingMedia();
            }
        });

        var p = video.play();
        if (p !== undefined && typeof p.then === 'function') {
            p.then(function() {
                sawPlaying = true;
                clearTimers();
            }).catch(function(err) {
                if (video.error) {
                    scheduleMissingMedia();
                } else if (err && err.name === 'NotAllowedError') {
                    armNoLaunchIfStillIdle();
                } else {
                    scheduleMissingMedia();
                }
            });
        } else {
            armNoLaunchIfStillIdle();
        }
    }

    function reveal(section) {
        if (!section) return;
        section.classList.add('section-visible');
        section.setAttribute('aria-hidden', 'false');
        if (section.classList.contains('section-map')) section.classList.add('map-reveal');
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function showInner(id) {
        var el = document.getElementById(id);
        if (!el) return;
        el.classList.add('parcours-show');
        el.removeAttribute('aria-hidden');
    }

    function norm(s) {
        return String(s || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();
    }

    /** Compare une saisie numérique (0.2 ou 0,2, espaces) à CONFIG.reponseChimie. */
    function reponseChimieOk(val) {
        var expected = parseFloat(String(CONFIG.reponseChimie).replace(',', '.'));
        if (isNaN(expected)) return norm(val) === norm(CONFIG.reponseChimie);
        var raw = String(val || '').trim().replace(/\s/g, '').replace(',', '.');
        var num = parseFloat(raw);
        return !isNaN(num) && Math.abs(num - expected) < 1e-9;
    }

    var videoIntro = document.getElementById('video-intro-patrouille');
    var sectionParticipants = document.getElementById('section-participants');
    var formParticipants = document.getElementById('form-participants');
    var introSkip = false;

    if (formParticipants) {
        formParticipants.addEventListener('submit', function(e) {
            e.preventDefault();
            var inputs = document.querySelectorAll('#form-participants .participant-totem');
            window.participantsPatrouille = [];
            for (var i = 0; i < inputs.length; i++) {
                window.participantsPatrouille.push(inputs[i].value.trim());
            }
            if (sectionParticipants) sectionParticipants.classList.remove('section-visible');
            var secIntro = document.getElementById('section-intro-video');
            reveal(secIntro);
            introSkip = false;
            waitForVideoEndOrFallback(videoIntro, function() {
                if (introSkip) return;
                reveal(document.getElementById('section-etape-1'));
            });
        });
    }

    document.getElementById('btn-skip-intro') && document.getElementById('btn-skip-intro').addEventListener('click', function() {
        introSkip = true;
        if (videoIntro) {
            try {
                videoIntro.pause();
            } catch (err) {}
        }
        reveal(document.getElementById('section-etape-1'));
    });

    document.getElementById('btn-cockpit-trouve') && document.getElementById('btn-cockpit-trouve').addEventListener('click', function() {
        showInner('bloc-apres-cockpit');
    });

    document.getElementById('btn-vers-etape-2') && document.getElementById('btn-vers-etape-2').addEventListener('click', function() {
        reveal(document.getElementById('section-etape-2'));
        var v = document.getElementById('video-pilotes');
        waitForVideoEndOrFallback(v, function() {
            showInner('bloc-info-apres-pilotes');
        });
    });

    document.getElementById('btn-suite-apres-pilotes') && document.getElementById('btn-suite-apres-pilotes').addEventListener('click', function() {
        showInner('bloc-info-apres-pilotes');
    });

    document.getElementById('btn-vers-etape-3') && document.getElementById('btn-vers-etape-3').addEventListener('click', function() {
        reveal(document.getElementById('section-etape-3'));
    });

    document.getElementById('btn-suite-chimistes') && document.getElementById('btn-suite-chimistes').addEventListener('click', function() {
        showInner('bloc-exo-chimie');
    });

    document.getElementById('form-exo-chimie') && document.getElementById('form-exo-chimie').addEventListener('submit', function(e) {
        e.preventDefault();
        var inp = document.getElementById('input-exo-chimie');
        var err = document.getElementById('err-exo-chimie');
        var ok = inp && reponseChimieOk(inp.value);
        if (!ok) {
            if (err) err.hidden = false;
            return;
        }
        if (err) err.hidden = true;
        showInner('bloc-coords-point3');
    });

    document.getElementById('btn-vers-etape-4') && document.getElementById('btn-vers-etape-4').addEventListener('click', function() {
        reveal(document.getElementById('section-etape-4'));
    });

    document.getElementById('btn-sur-place-p4') && document.getElementById('btn-sur-place-p4').addEventListener('click', function() {
        var avant = document.getElementById('parcours-avant-video-p4');
        if (avant) avant.hidden = true;
        showInner('bloc-video-ingenieurs');
        var v = document.getElementById('video-ingenieurs');
        waitForVideoEndOrFallback(v, function() {
            showInner('bloc-form-gps');
        });
    });

    document.getElementById('btn-suite-ingenieurs') && document.getElementById('btn-suite-ingenieurs').addEventListener('click', function() {
        showInner('bloc-form-gps');
    });

    function allerVisioEtape5() {
        reveal(document.getElementById('section-etape-5'));
        var v4 = document.getElementById('video-visio-p4');
        waitForVideoEndOrFallback(v4, function() {
            showInner('bloc-btn-etape-6');
        });
    }

    document.getElementById('form-gps-etape3') && document.getElementById('form-gps-etape3').addEventListener('submit', function(e) {
        e.preventDefault();
        var err = document.getElementById('err-gps');
        if (err) err.hidden = true;
        showInner('bloc-itineraire-p4');
        var blocIti = document.getElementById('bloc-itineraire-p4');
        if (blocIti) blocIti.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    document.getElementById('btn-gps-vers-etape-5') && document.getElementById('btn-gps-vers-etape-5').addEventListener('click', function() {
        allerVisioEtape5();
    });

    document.getElementById('btn-vers-etape-6-indices') && document.getElementById('btn-vers-etape-6-indices').addEventListener('click', function() {
        reveal(document.getElementById('section-etape-6'));
    });

    document.getElementById('btn-suite-visio') && document.getElementById('btn-suite-visio').addEventListener('click', function() {
        showInner('bloc-btn-etape-6');
    });

    document.getElementById('form-objet-totem') && document.getElementById('form-objet-totem').addEventListener('submit', function(e) {
        e.preventDefault();
        var val = norm(document.getElementById('input-objet').value);
        var err = document.getElementById('err-objet');
        var accept = CONFIG.messagesObjetAcceptes.map(norm);
        var ok = accept.indexOf(val) >= 0;
        if (!ok) {
            if (err) err.hidden = false;
            return;
        }
        if (err) err.hidden = true;
        showInner('bloc-carte-point5');
        showInner('bloc-vers-etape-7');
        var carte = document.getElementById('bloc-carte-point5');
        if (carte) carte.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    document.getElementById('btn-vers-etape-7-adieu') && document.getElementById('btn-vers-etape-7-adieu').addEventListener('click', function() {
        reveal(document.getElementById('section-etape-7'));
        var v6 = document.getElementById('video-adieu');
        waitForVideoEndOrFallback(v6, function() {
            showInner('bloc-form-vue-restaurant');
        });
    });

    document.getElementById('btn-suite-adieu') && document.getElementById('btn-suite-adieu').addEventListener('click', function() {
        showInner('bloc-form-vue-restaurant');
    });

    document.getElementById('form-vue-restaurant') && document.getElementById('form-vue-restaurant').addEventListener('submit', function(e) {
        e.preventDefault();
        var val = norm(document.getElementById('input-vue-restaurant').value);
        var err = document.getElementById('err-vue');
        if (val !== norm(CONFIG.vueRestaurant)) {
            if (err) err.hidden = false;
            return;
        }
        if (err) err.hidden = true;
        reveal(document.getElementById('section-etape-8'));
        reveal(document.getElementById('footer-parcours'));
        finMission();
    });

    function finMission() {
        if (typeof window.stopPatrouilleExfilCountdown === 'function') {
            window.stopPatrouilleExfilCountdown('MISSION TERMINÉE');
        } else {
            var el = document.getElementById('countdown');
            if (el) {
                el.textContent = 'MISSION TERMINÉE';
                el.classList.add('countdown-ended');
            }
        }
    }

    window.PARCOURS_PATROUILLE_4 = {
        nombrePoints: CONFIG.nombrePoints,
        config: CONFIG
    };
})();
