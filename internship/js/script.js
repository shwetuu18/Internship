/* =========================================================
   FITLIFE — script.js  (SHARED — used by ALL pages)
   =========================================================
   Includes:
   - Back to top button
   - Navbar auto-active link
   - Cart count (localStorage)
   - Session check (logged-in state)
   - Newsletter form → PHP
   - Membership form → PHP
   - Trainer booking form → PHP
   - Class booking form → PHP
   - Class schedule fetch → PHP (with local fallback)
   - Contact / service form → PHP
   - Scroll reveal animation
   - Number counters
   - Smooth scroll for in-page anchors
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       API BASE PATH
    ===================================================== */
    const API = "api";


    /* =====================================================
       1) BACK TO TOP BUTTON
    ===================================================== */
    const topBtn = document.getElementById("topBtn");
    if (topBtn) {
        window.addEventListener("scroll", () => {
            topBtn.style.display = window.scrollY > 300 ? "block" : "none";
        });
        topBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }


    /* =====================================================
       2) NAVBAR — AUTO ACTIVE LINK
    ===================================================== */
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".navbar-nav .nav-link").forEach((link) => {
        const href = link.getAttribute("href");
        if (href && href === currentPage) {
            link.classList.add("active");
        }
    });


    /* =====================================================
       3) CART COUNT (localStorage)
    ===================================================== */
    const cartCount = document.getElementById("cartCount");
    if (cartCount) {
        try {
            const cart = JSON.parse(localStorage.getItem("fitlife_cart") || "[]");
            const total = cart.reduce((s, i) => s + (i.qty || 0), 0);
            cartCount.textContent = total;
        } catch (e) {}
    }


    /* =====================================================
       4) SESSION CHECK (logged-in state)
    ===================================================== */
    (async () => {
        const signinLink = document.getElementById("signinLink");
        const signupLink = document.getElementById("signupLink");

        if (!signinLink && !signupLink) return;

        try {
            const res  = await fetch(`${API}/session_check.php`, { credentials: "same-origin" });
            const data = await res.json();

            if (data.success && data.user) {
                if (signinLink) {
                    signinLink.href  = "#";
                    signinLink.title = "Hi, " + data.user.name + " (click to logout)";
                    signinLink.innerHTML = '<i class="bi bi-person-check-fill"></i>';
                    signinLink.classList.add("logged-in");
                    signinLink.addEventListener("click", (e) => {
                        e.preventDefault();
                        if (confirm("Logout?")) {
                            fetch(`${API}/logout.php`, { credentials: "same-origin" })
                                .then(() => window.location.reload());
                        }
                    });
                }
                if (signupLink) signupLink.style.display = "none";
            }
        } catch (e) {
            // Not logged in — silent fail
        }
    })();


    /* =====================================================
       5) NEWSLETTER — POST to PHP
    ===================================================== */
    document.querySelectorAll("#newsletterForm").forEach((form) => {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const emailInput = form.querySelector("input[type=email]");
            if (!emailInput || !emailInput.value.trim()) return;

            const btn = form.querySelector("button");
            const oldText = btn ? btn.textContent : "";
            if (btn) { btn.disabled = true; btn.textContent = "..."; }

            const fd = new FormData();
            fd.append("email", emailInput.value.trim());

            try {
                const res  = await fetch(`${API}/newsletter.php`, { method: "POST", body: fd });
                const data = await res.json();
                alert(data.message || "Subscribed!");
                if (data.success) form.reset();
            } catch (err) {
                alert("Subscribed! Thank you for joining FitLife newsletter.");
                form.reset();
            } finally {
                if (btn) { btn.disabled = false; btn.textContent = oldText; }
            }
        });
    });


    /* =====================================================
       6) MEMBERSHIP FORM
    ===================================================== */
    const membershipForm = document.getElementById("membershipForm");
    if (membershipForm) {
        membershipForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const btn = membershipForm.querySelector("button[type=submit]");
            const oldText = btn ? btn.textContent : "";
            if (btn) { btn.disabled = true; btn.textContent = "Sending..."; }

            const fd = new FormData(membershipForm);

            try {
                const res  = await fetch(`${API}/membership.php`, { method: "POST", body: fd });
                const data = await res.json();

                if (data.success) {
                    membershipForm.style.display = "none";
                    const ok = document.getElementById("membershipSuccess");
                    if (ok) ok.style.display = "block";
                } else {
                    alert(data.message || "Something went wrong.");
                    if (btn) { btn.disabled = false; btn.textContent = oldText; }
                }
            } catch (err) {
                // Fallback — no backend
                membershipForm.style.display = "none";
                const ok = document.getElementById("membershipSuccess");
                if (ok) ok.style.display = "block";
            }
        });

        // Plan buttons preselect
        document.querySelectorAll(".plan-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                const planSelect = document.getElementById("planSelect");
                if (planSelect && btn.dataset.plan) planSelect.value = btn.dataset.plan;
                const joinSec = document.getElementById("join");
                if (joinSec) joinSec.scrollIntoView({ behavior: "smooth" });
            });
        });
    }


    /* =====================================================
       7) TRAINER BOOKING FORM
    ===================================================== */
    const trainerForm = document.getElementById("trainerBookingForm");
    if (trainerForm) {
        trainerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const btn = trainerForm.querySelector("button[type=submit]");
            const oldText = btn ? btn.textContent : "";
            if (btn) { btn.disabled = true; }

            const fd = new FormData(trainerForm);

            try {
                const res  = await fetch(`${API}/trainer_booking.php`, { method: "POST", body: fd });
                const data = await res.json();

                if (data.success) {
                    showTrainerSuccess();
                } else {
                    alert(data.message || "Something went wrong.");
                    if (btn) btn.disabled = false;
                }
            } catch (err) {
                // No backend fallback
                showTrainerSuccess();
            }

            function showTrainerSuccess() {
                const successModal = document.getElementById("trainerBookingSuccess");
                const successPage  = document.getElementById("trainerSuccess");
                if (successModal) {
                    trainerForm.style.display = "none";
                    successModal.style.display = "block";
                } else if (successPage) {
                    trainerForm.style.display = "none";
                    successPage.style.display = "block";
                } else {
                    alert("Booking submitted!");
                }
            }
        });
    }

    // Trainer profile "BOOK SESSION" → preselect + scroll
    document.querySelectorAll(".book-trainer-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const trainerSelect = document.getElementById("trainerSelect");
            if (trainerSelect && btn.dataset.trainer) trainerSelect.value = btn.dataset.trainer;
            const bookSec = document.getElementById("book");
            if (bookSec) bookSec.scrollIntoView({ behavior: "smooth" });
        });
    });


    /* =====================================================
       8) CLASS BOOKING FORM
    ===================================================== */
    const classForm = document.getElementById("classBookingForm");
    if (classForm) {
        classForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const btn = classForm.querySelector("button[type=submit]");
            if (btn) btn.disabled = true;

            const fd = new FormData(classForm);

            try {
                const res  = await fetch(`${API}/class_booking.php`, { method: "POST", body: fd });
                const data = await res.json();

                if (data.success) {
                    showClassSuccess();
                } else {
                    alert(data.message || "Something went wrong.");
                    if (btn) btn.disabled = false;
                }
            } catch (err) {
                // No backend fallback
                showClassSuccess();
            }

            function showClassSuccess() {
                const successModal = document.getElementById("classBookingSuccess");
                const successPage  = document.getElementById("classSuccess");
                if (successModal) {
                    classForm.style.display = "none";
                    successModal.style.display = "block";
                } else if (successPage) {
                    classForm.style.display = "none";
                    successPage.style.display = "block";
                } else {
                    alert("Booking submitted!");
                }
            }
        });
    }


    /* =====================================================
       9) CLASS SCHEDULE — fetch from PHP (fallback to local)
    ===================================================== */
    const classSelect  = document.getElementById("classSelect");
    const daySelect    = document.getElementById("daySelect");
    const scheduleList = document.getElementById("scheduleList");

    // Local fallback data
    const SCHEDULE_FALLBACK = [
        { class_name: "Tabata",            day: "Monday",    time_slot: "06:00 AM - 07:00 AM", trainer: "Trainer 1" },
        { class_name: "HIIT",              day: "Monday",    time_slot: "07:00 AM - 08:00 AM", trainer: "Trainer 2" },
        { class_name: "Spin Class",        day: "Tuesday",   time_slot: "06:00 PM - 07:00 PM", trainer: "Trainer 3" },
        { class_name: "Yoga",              day: "Wednesday", time_slot: "07:00 AM - 08:00 AM", trainer: "Trainer 4" },
        { class_name: "Zumba",             day: "Thursday",  time_slot: "06:00 PM - 07:00 PM", trainer: "Trainer 5" },
        { class_name: "Strength Training", day: "Friday",    time_slot: "05:00 PM - 06:00 PM", trainer: "Trainer 1" },
        { class_name: "Tabata",            day: "Saturday",  time_slot: "08:00 AM - 09:00 AM", trainer: "Trainer 2" },
        { class_name: "HIIT",              day: "Sunday",    time_slot: "07:00 AM - 08:00 AM", trainer: "Trainer 3" }
    ];

    function renderSchedule(rows) {
        if (!scheduleList) return;
        if (!rows.length) {
            scheduleList.innerHTML = "<p style='color:#999;padding:20px;'>No classes found.</p>";
            return;
        }
        scheduleList.innerHTML = rows.map((row) => `
            <div class="schedule-row">
                <div><strong>${row.class_name}</strong></div>
                <div>${row.day}</div>
                <div>${row.time_slot}</div>
                <div>${row.trainer || "-"}</div>
            </div>
        `).join("");
    }

    async function loadSchedule() {
        if (!scheduleList) return;
        scheduleList.innerHTML = "<p style='color:#999;padding:20px;'>Loading...</p>";

        const cls = classSelect ? classSelect.value : "all";
        const day = daySelect   ? daySelect.value   : "all";

        try {
            const res  = await fetch(`${API}/get_schedule.php?class=${cls}&day=${day}`);
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                renderSchedule(data.data);
            } else {
                renderScheduleFiltered(SCHEDULE_FALLBACK, cls, day);
            }
        } catch (err) {
            renderScheduleFiltered(SCHEDULE_FALLBACK, cls, day);
        }
    }

    function renderScheduleFiltered(data, cls, day) {
        const filtered = data.filter((row) => {
            const matchClass = cls === "all" || row.class_name.toLowerCase().includes(cls.toLowerCase());
            const matchDay   = day === "all" || row.day.toLowerCase() === day.toLowerCase();
            return matchClass && matchDay;
        });
        renderSchedule(filtered);
    }

    if (classSelect) classSelect.addEventListener("change", loadSchedule);
    if (daySelect)   daySelect.addEventListener("change", loadSchedule);

    const scheduleModal = document.getElementById("classScheduleModal");
    if (scheduleModal) {
        scheduleModal.addEventListener("shown.bs.modal", loadSchedule);
    }


    /* =====================================================
       10) CONTACT / SERVICE FORM
    ===================================================== */
    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        contactForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const btn = contactForm.querySelector("button[type=submit]");
            const oldText = btn ? btn.textContent : "";
            if (btn) { btn.disabled = true; btn.textContent = "Sending..."; }

            const fd = new FormData(contactForm);

            try {
                const res  = await fetch(`${API}/contact.php`, { method: "POST", body: fd });
                const data = await res.json();

                if (data.success) {
                    showContactSuccess();
                } else {
                    alert(data.message || "Something went wrong.");
                    if (btn) { btn.disabled = false; btn.textContent = oldText; }
                }
            } catch (err) {
                showContactSuccess();
            }

            function showContactSuccess() {
                contactForm.style.display = "none";
                const ok =
                    document.getElementById("serviceSuccess") ||
                    document.getElementById("contactSuccess");
                if (ok) ok.style.display = "block";
                else alert("Message sent!");
            }
        });
    }


    /* =====================================================
       11) SCROLL REVEAL ANIMATION
    ===================================================== */
    const revealEls = document.querySelectorAll(".reveal, .reveal-left, .reveal-right");
    if (revealEls.length) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("active");
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        revealEls.forEach((el) => revealObserver.observe(el));
    }


    /* =====================================================
       12) NUMBER COUNTERS
    ===================================================== */
    const counters = document.querySelectorAll(".counter");
    if (counters.length) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                const el = entry.target;
                const target = parseInt(el.dataset.target, 10) || 0;
                let current = 0;
                const step = Math.max(1, Math.ceil(target / 60));

                const tick = () => {
                    current += step;
                    if (current >= target) {
                        el.textContent = target;
                        return;
                    }
                    el.textContent = current;
                    requestAnimationFrame(tick);
                };

                tick();
                counterObserver.unobserve(el);
            });
        }, { threshold: 0.5 });

        counters.forEach((c) => counterObserver.observe(c));
    }


    /* =====================================================
       13) SMOOTH SCROLL FOR IN-PAGE ANCHORS (#id)
    ===================================================== */
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
        a.addEventListener("click", (e) => {
            const id = a.getAttribute("href");
            if (id === "#" || id.length < 2) return;

            const target = document.querySelector(id);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: "smooth" });
            }
        });
    });

});