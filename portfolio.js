// =========================================
// Portfolio – Amir Koné : interactions
// =========================================

document.addEventListener("DOMContentLoaded", function () {

  // ---------- 1. Mode clair / sombre ----------
  var root = document.documentElement;
  var themeBtn = document.getElementById("theme-toggle");

  function isDark() {
    var forced = root.getAttribute("data-theme");
    if (forced) return forced === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function updateThemeIcon() {
    themeBtn.textContent = isDark() ? "☀" : "☾";
    themeBtn.setAttribute("aria-label", isDark() ? "Passer en mode clair" : "Passer en mode sombre");
  }

  // On reprend le thème choisi lors de la dernière visite
  try {
    var saved = localStorage.getItem("theme");
    if (saved) root.setAttribute("data-theme", saved);
  } catch (e) { /* stockage indisponible : on ignore */ }
  updateThemeIcon();

  themeBtn.addEventListener("click", function () {
    var next = isDark() ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
    updateThemeIcon();
  });


  // ---------- 2. Menu burger (mobile) ----------
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");

  function closeMenu() {
    nav.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Ouvrir le menu");
  }

  burger.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
  });

  // On ferme le menu quand on clique sur un lien ou qu'on appuie sur Échap
  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });


  // ---------- 3. Boutons « copier » ----------
  document.querySelectorAll(".copy").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      var done = function () {
        btn.textContent = "copié ✓";
        setTimeout(function () { btn.textContent = "copier"; }, 1500);
      };
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(done, function () { selectText(btn); });
      } else {
        selectText(btn);
      }
    });
  });

  // Si la copie automatique ne marche pas, on sélectionne le texte
  function selectText(btn) {
    var target = btn.previousElementSibling;
    var range = document.createRange();
    range.selectNodeContents(target);
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }


  // ---------- 4. Validation du formulaire de contact ----------
  var form = document.getElementById("contact-form");
  var okMsg = document.getElementById("form-ok");
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setError(id, message) {
    var input = document.getElementById(id);
    document.getElementById(id + "-error").textContent = message;
    input.parentElement.classList.toggle("is-invalid", message !== "");
    input.setAttribute("aria-invalid", message !== "" ? "true" : "false");
  }

  function validate() {
    var name = form.elements.name.value.trim();
    var email = form.elements.email.value.trim();
    var message = form.elements.message.value.trim();
    var valid = true;

    if (name.length < 2) {
      setError("name", "Merci d'indiquer votre nom (2 caractères minimum).");
      valid = false;
    } else setError("name", "");

    if (!emailRegex.test(email)) {
      setError("email", "Merci d'indiquer un email valide (ex. : nom@gmail.com).");
      valid = false;
    } else setError("email", "");

    if (message.length < 10) {
      setError("message", "Votre message doit faire au moins 10 caractères.");
      valid = false;
    } else setError("message", "");

    return valid;
  }

  // On revérifie un champ dès qu'on le quitte
  ["name", "email", "message"].forEach(function (id) {
    document.getElementById(id).addEventListener("blur", function () {
      if (this.value.trim() !== "") validate();
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    okMsg.textContent = "";

    if (!validate()) {
      form.querySelectorAll(".field.is-invalid").forEach(function (f) {
        f.classList.remove("shake");
        void f.offsetWidth;          // relance l'animation
        f.classList.add("shake");
      });
      form.querySelector(".is-invalid input, .is-invalid textarea").focus();
      return;
    }

    // Site statique : pas de serveur, on ouvre la messagerie de l'utilisateur
    var subject = "Contact portfolio – " + form.elements.name.value.trim();
    var body = form.elements.message.value.trim() + "\n\n" + form.elements.name.value.trim() + " (" + form.elements.email.value.trim() + ")";
    window.location.href = "mailto:koneabdelamir@gmail.com"
      + "?subject=" + encodeURIComponent(subject)
      + "&body=" + encodeURIComponent(body);

    okMsg.textContent = "Merci ! Votre messagerie va s'ouvrir avec le message prêt à envoyer.";
    form.reset();
  });


  // ---------- 5. Bouton « retour en haut » ----------
  var toTop = document.getElementById("to-top");
  window.addEventListener("scroll", function () {
    toTop.classList.toggle("is-visible", window.scrollY > 600);
  });
  toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });


  // ---------- 6. Apparition des sections au défilement ----------
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { observer.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }


  // =========================================
  // ANIMATIONS
  // =========================================
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- 8. Barre de progression de lecture ----------
  var progress = document.getElementById("progress");
  function updateProgress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var ratio = max > 0 ? window.scrollY / max : 0;
    progress.style.transform = "scaleX(" + ratio + ")";
  }
  window.addEventListener("scroll", updateProgress);
  updateProgress();

  // ---------- 9. Texte qui s'écrit tout seul sous le nom ----------
  var typed = document.getElementById("typed");
  var words = ["le web", "l'UI / UX", "le design", "la 3D", "apprendre"];
  var wordIndex = 0, charIndex = words[0].length, deleting = true;

  function typeLoop() {
    var word = words[wordIndex];
    if (deleting) {
      charIndex--;
      if (charIndex === 0) { deleting = false; wordIndex = (wordIndex + 1) % words.length; }
    } else {
      charIndex++;
      if (charIndex === words[wordIndex].length) {
        deleting = true;
        typed.textContent = words[wordIndex];
        return setTimeout(typeLoop, 1800);  // pause sur le mot complet
      }
    }
    typed.textContent = words[wordIndex].slice(0, charIndex) || " ";
    setTimeout(typeLoop, deleting ? 50 : 90);
  }
  if (!reduceMotion) setTimeout(typeLoop, 2500);

  // ---------- 10. Apparition en cascade (projets, frise, compétences) ----------
  document.querySelectorAll(".stagger").forEach(function (list) {
    Array.prototype.forEach.call(list.children, function (item, i) {
      item.style.transitionDelay = (i * 0.12) + "s";
    });
  });

  // ---------- 11. Lien de menu actif selon la section affichée ----------
  var navLinks = document.querySelectorAll(".nav a");
  var sections = ["projets", "parcours", "cv", "contact"].map(function (id) {
    return document.getElementById(id);
  });
  function updateActiveLink() {
    var current = "";
    sections.forEach(function (sec) {
      if (sec && sec.getBoundingClientRect().top < window.innerHeight * 0.4) current = sec.id;
    });
    navLinks.forEach(function (link) {
      link.classList.toggle("is-active", link.getAttribute("href") === "#" + current);
    });
  }
  window.addEventListener("scroll", updateActiveLink);
  updateActiveLink();

  // ---------- 12. La photo suit légèrement la souris ----------
  var polaroid = document.querySelector(".polaroid");
  var hero = document.querySelector(".hero");
  if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
    hero.addEventListener("mousemove", function (e) {
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      polaroid.style.transform = "rotate(" + (2.5 + x * 4) + "deg) translate(" + (x * 10) + "px," + (y * 10) + "px)";
    });
    hero.addEventListener("mouseleave", function () { polaroid.style.transform = ""; });
  }

  // ---------- 7. Année automatique dans le pied de page ----------
  document.getElementById("year").textContent = new Date().getFullYear();
});