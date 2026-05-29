document.addEventListener("DOMContentLoaded", () => {
    // 1. Preloader Logic
    const preloader = document.getElementById("preloader");
    
    // Simulate loading time for visual effect (remove in production if not needed)
    setTimeout(() => {
        preloader.style.opacity = "0";
        setTimeout(() => {
            preloader.style.display = "none";
        }, 500); // Wait for transition to finish
    }, 1000);

    // 2. Navbar Scroll Effect
    const navbar = document.getElementById("navbar");
    
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });

    // 3. Smooth Scrolling for Navigation Links
    const navLinks = document.querySelectorAll(".nav-links a");
    
    navLinks.forEach(link => {
        link.addEventListener("click", function(e) {
            // Prevent default only if it's a hash link
            if (this.getAttribute("href").startsWith("#")) {
                e.preventDefault();
                
                const targetId = this.getAttribute("href");
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    // Remove active class from all
                    navLinks.forEach(nav => nav.classList.remove("active"));
                    // Add active class to clicked
                    this.classList.add("active");
                    
                    window.scrollTo({
                        top: targetSection.offsetTop - 70, // Adjust for fixed navbar
                        behavior: "smooth"
                    });
                }
            }
        });
    });

    // 4. Update Active Link on Scroll
    const sections = document.querySelectorAll("section");
    
    window.addEventListener("scroll", () => {
        let current = "";
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute("id");
            }
        });

        navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${current}`) {
                link.classList.add("active");
            }
        });
    });
});
