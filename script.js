document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mainMenu = document.querySelector('.main-menu');
    const body = document.body;

    function closeMenu() {
        mobileMenuBtn?.classList.remove('active');
        mainMenu?.classList.remove('active');
        body.classList.remove('menu-open', 'overlay-active');
    }

    mobileMenuBtn?.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent click from immediately closing menu via body listener
        const isActive = mobileMenuBtn.classList.toggle('active');
        mainMenu.classList.toggle('active', isActive);
        body.classList.toggle('menu-open', isActive);
        // Add overlay slightly delayed to allow menu transition
        setTimeout(() => {
            body.classList.toggle('overlay-active', isActive);
        }, 50);
    });

    // Close mobile menu when clicking on the overlay
    body.addEventListener('click', (e) => {
        // Check if the click is on the overlay itself (::after pseudo-element)
        if (body.classList.contains('overlay-active') && e.target === body) {
             // We check if the click is exactly on the body which acts as the overlay trigger area
             // This requires the ::after pseudo-element to have pointer-events: auto
             closeMenu();
        }
    });

    // Dropdown menus (Keep existing logic, but maybe adjust for side menu)
    const dropdowns = document.querySelectorAll('.main-menu .dropdown'); // Target dropdowns inside main menu
    
    dropdowns.forEach(dropdown => {
        const dropdownToggle = dropdown.querySelector('a'); // Assuming the link triggers dropdown
        const dropdownMenu = dropdown.querySelector('.dropdown-menu');

        // Prevent default link behavior only if it has a dropdown
        if (dropdownToggle && dropdownMenu) {
            dropdownToggle.addEventListener('click', (e) => {
                // Only toggle dropdown on mobile/side menu
                if (window.innerWidth <= 992) {
                    e.preventDefault(); 
                    e.stopPropagation(); // Prevent closing the main menu
                    // Simple toggle for side menu dropdowns
                    const currentlyActive = dropdown.classList.contains('submenu-active');
                    // Close other submenus
                    dropdowns.forEach(d => d.classList.remove('submenu-active'));
                    // Toggle current submenu
                    dropdown.classList.toggle('submenu-active', !currentlyActive); 
                }
                // Allow normal link behavior on desktop
            });
        } 
    });

    // Close mobile menu when clicking a link (inside the side menu)
    const menuLinks = document.querySelectorAll('.main-menu a');
    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Only close if it's NOT a dropdown toggle link in mobile view
            const isDropdownToggle = link.parentElement.classList.contains('dropdown');
            if (window.innerWidth <= 992 && !isDropdownToggle) {
                 closeMenu();
            }
            // Allow smooth scroll for anchor links
            const href = link.getAttribute('href');
            if (href && href.startsWith('#') && href.length > 1) {
                const target = document.querySelector(href);
                 if (target) {
                    // Close menu *before* scrolling
                    if (window.innerWidth <= 992) closeMenu(); 
                    // Use timeout to ensure menu close transition finishes before scroll
                    setTimeout(() => {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }, 50); 
                }
            }
        });
    });

    // Close mobile menu when clicking outside (Refined logic)
    // Removed the general body click listener for outside closing,
    // rely on overlay click and link clicks instead for clarity.

    // Handle window resize (Keep existing logic, ensure it closes side menu)
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Reset mobile menu state on window resize if switching to desktop
            if (window.innerWidth > 992) {
                closeMenu(); // Use the closeMenu function
            }

            // ... rest of existing resize logic ...
            // Recalculate graph dimensions if needed
            const graphs = document.querySelectorAll('.graph-grid');
            graphs.forEach(graph => {
                if (graph.dataset.graphsAnimated) {
                    // Reset animation state to allow re-animation with new dimensions
                    graph.dataset.graphsAnimated = 'false';
                    // Trigger intersection observer check
                    animateOnScroll.unobserve(graph);
                    animateOnScroll.observe(graph);
                }
            });
        }, 250); // Debounce resize events
    });

    // Hero slider functionality
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;
    const slideInterval = 5000; // 5 seconds

    function nextSlide() {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }

    // Auto advance slides
    setInterval(nextSlide, slideInterval);

    // Smooth scroll for "Explore More"
    const scrollDownBtn = document.querySelector('.scroll-down');
    scrollDownBtn?.addEventListener('click', () => {
        const businessSection = document.querySelector('.business-section');
        businessSection?.scrollIntoView({ behavior: 'smooth' });
    });

    // Function to animate number count-up
    function animateCountUp(el) {
        const text = el.textContent.trim();
        // Remove non-numeric characters like '+' or 'K' for parsing, handle 'K' for thousands
        let target = 0;
        let suffix = '';
        if (text.endsWith('K+')) {
            target = parseFloat(text.replace('K+', '')) * 1000;
            suffix = 'K+';
        } else if (text.endsWith('+')) {
            target = parseFloat(text.replace('+', ''));
            suffix = '+';
        } else {
            target = parseFloat(text);
        }
        
        if (isNaN(target)) return; // Exit if target is not a number

        el.textContent = '0' + suffix; // Start from 0
        let current = 0;
        const duration = 3000; // Animation duration in ms (Increased from 1500)
        const increment = target / (duration / 16); // Calculate increment per frame (approx 60fps)

        const updateCount = () => {
            current += increment;
            if (current < target) {
                let displayValue = Math.ceil(current);
                // Handle 'K' suffix formatting during animation
                if (suffix === 'K+') {
                    el.textContent = Math.floor(displayValue / 1000) + suffix; // Display in K format
                } else {
                     el.textContent = displayValue + suffix;
                }
                requestAnimationFrame(updateCount);
            } else {
                 // Ensure the final exact value is set
                if (suffix === 'K+') {
                     el.textContent = (target/1000) + suffix; 
                 } else {
                     el.textContent = target + suffix;
                 }
            }
        };
        requestAnimationFrame(updateCount);
    }

    // Intersection Observer for animations
    const animateOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;

                // --- Stat Item Animation --- (Existing)
                if (target.classList.contains('stat-item') && !target.dataset.animated) {
                    const numberEl = target.querySelector('.stat-number');
                    const progressCircle = target.querySelector('.stat-progress');
                    const value = parseFloat(target.dataset.value) || 0;
                    const max = parseFloat(target.dataset.max) || 100;
                    const radius = progressCircle ? progressCircle.r.baseVal.value : 0;
                    const circumference = 2 * Math.PI * radius;
                    const percentage = max > 0 ? (value / max) * 100 : 0;
                    const offset = circumference - (percentage / 100) * circumference;

                    if (numberEl) animateCountUp(numberEl);
                    if (progressCircle) {
                        progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
                        progressCircle.style.strokeDashoffset = circumference;
                        setTimeout(() => { progressCircle.style.strokeDashoffset = offset; }, 100);
                    }
                    target.dataset.animated = 'true';
                }

                // --- Graph Section Animations --- (Bars, Pie, Line)
                if (target.classList.contains('graph-grid') && !target.dataset.graphsAnimated) {
                    // Bar Graph Animation
                    const bars = target.querySelectorAll('.bar');
                    bars.forEach(bar => {
                        const value = bar.dataset.value || '0';
                        bar.style.setProperty('--bar-value', value);
                        bar.style.width = `${value}%`; // Directly set width for immediate animation
                    });

                    // Pie Chart Animation
                    const pieSlices = target.querySelectorAll('.pie-slice');
                    const pieRadius = pieSlices.length > 0 ? pieSlices[0].r.baseVal.value : 0;
                    const pieCircumference = 2 * Math.PI * pieRadius;
                    let cumulativePercent = 0;

                    pieSlices.forEach(slice => {
                        const value = parseFloat(slice.dataset.value) || 0;
                        const slicePercent = value;
                        const sliceLength = (pieCircumference * slicePercent) / 100;
                        const sliceSpace = pieCircumference - sliceLength;
                        const offset = (pieCircumference * cumulativePercent) / 100;

                        slice.style.stroke = slice.dataset.color || 'var(--primary-red)';
                        slice.style.strokeDasharray = `${sliceLength} ${sliceSpace}`;
                        slice.style.strokeDashoffset = offset;
                        
                        cumulativePercent += slicePercent;
                    });

                    // Line Graph Animation
                    const lineData = target.querySelector('.line-data');
                    if (lineData) {
                        const lineLength = lineData.getTotalLength();
                        // Set initial state (hidden)
                        lineData.style.strokeDasharray = `${lineLength}`;
                        lineData.style.strokeDashoffset = lineLength;
                        
                        // Animate the line drawing
                        requestAnimationFrame(() => {
                            lineData.style.transition = 'stroke-dashoffset 1.5s ease-in-out';
                            lineData.style.strokeDashoffset = '0';
                        });
                    }

                    target.dataset.graphsAnimated = 'true';
                }

                // Handle general scroll animations (fade in, etc.)
                const animationType = target.dataset.animation || 'fadeInUp'; // Default animation
                const delay = target.dataset.delay || '0s'; // Default delay
                
                target.style.visibility = 'visible'; // Make element visible before animation
                target.style.animationDelay = delay;
                // Apply Animate.css classes IF it's not a stat item OR if stat items should also fade/slide in
                // Currently, stat items will fade in due to data-animation attribute in HTML
                 target.classList.add('animate__animated', `animate__${animationType}`);
                
                // Unobserve after general animation is applied, unless it's a stat item (which is handled by dataset.animated)
                if (!target.classList.contains('stat-item')) {
                    observer.unobserve(target);
                }
            }
        });
    }, { threshold: 0.2 }); // Increased threshold slightly to ensure more of the item is visible

    // Add animation classes to elements marked with 'scroll-animate'
    const animatedElements = document.querySelectorAll('.scroll-animate'); 
    animatedElements.forEach(el => {
        // Initially hide elements to be animated
        el.style.visibility = 'hidden'; 
        animateOnScroll.observe(el);
    });

    // Tracking number input enhancement
    const trackingInput = document.querySelector('.tracking-input input');
    const trackingButton = document.querySelector('.tracking-input button');

    if (trackingInput && trackingButton) {
        trackingInput.addEventListener('input', (e) => {
            if (e.target.value.trim().length > 0) {
                trackingButton.classList.add('active');
            } else {
                trackingButton.classList.remove('active');
            }
        });

        trackingButton.addEventListener('click', (e) => {
            e.preventDefault();
            const trackingNumber = trackingInput.value.trim();
            if (trackingNumber) {
                // Here you would typically make an API call to track the shipment
                console.log('Tracking shipment:', trackingNumber);
                // For demo purposes, show a loading state
                trackingButton.classList.add('loading');
                setTimeout(() => {
                    trackingButton.classList.remove('loading');
                    // Show a demo message
                    alert('Tracking system integration required');
                }, 1500);
            }
        });
    }

    // Header scroll effect
    let lastScroll = 0;
    const header = document.querySelector('header');

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            header.classList.remove('scroll-up');
            return;
        }
        
        if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
            // Scrolling down
            header.classList.remove('scroll-up');
            header.classList.add('scroll-down');
        } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
            // Scrolling up
            header.classList.remove('scroll-down');
            header.classList.add('scroll-up');
        }
        lastScroll = currentScroll;
    });

    // Network regions interaction
    const networkRegions = document.querySelectorAll('.network-regions span');
    networkRegions.forEach(region => {
        region.addEventListener('click', () => {
            networkRegions.forEach(r => r.classList.remove('active'));
            region.classList.add('active');
            // Here you would typically update the map visualization
            // For demo purposes, we'll just log the selected region
            console.log('Selected region:', region.textContent.trim());
        });
    });

    // Add smooth scroll behavior to all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Language selector
    const languageLinks = document.querySelectorAll('.language-selector a');
    languageLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            languageLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            const lang = link.textContent.trim();
            // Here you would typically handle language change
            console.log('Selected language:', lang);
        });
    });

    // Back to Top Button
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        backToTop.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Cookie Consent
    const cookieConsent = document.querySelector('.cookie-consent');
    const acceptButton = document.querySelector('.btn-accept');
    const rejectButton = document.querySelector('.btn-reject');
    const settingsButton = document.querySelector('.btn-settings');

    // Show cookie consent if not already accepted
    if (cookieConsent && !localStorage.getItem('cookieConsent')) {
        cookieConsent.classList.add('active');
    }

    if (acceptButton) {
        acceptButton.addEventListener('click', function() {
            localStorage.setItem('cookieConsent', 'accepted');
            cookieConsent.classList.remove('active');
        });
    }

    if (rejectButton) {
        rejectButton.addEventListener('click', function() {
            localStorage.setItem('cookieConsent', 'rejected');
            cookieConsent.classList.remove('active');
        });
    }

    if (settingsButton) {
        settingsButton.addEventListener('click', function() {
            // Open cookie settings modal (would be implemented separately)
            alert('Cookie settings would open here');
        });
    }

    // Resize Event Handler
    window.addEventListener('resize', function() {
        // Handle necessary responsive behavior
        if (window.innerWidth <= 768) {
            if (!document.querySelector('.hamburger-menu') && header) {
                header.appendChild(hamburger);
            }
        } else {
            const mainMenu = document.querySelector('.main-menu');
            if (mainMenu) {
                mainMenu.style.display = 'flex';
            }
            const hamburgerMenu = document.querySelector('.hamburger-menu');
            if (hamburgerMenu) {
                hamburgerMenu.remove();
            }
        }
    });

    // --- MAP INITIALIZATION --- 
    const mapContainer = document.getElementById('world-map');
    let map = null;

    if (mapContainer) {
        // Initialize map centered globally
        map = L.map('world-map').setView([20, 0], 2);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18, // Adjusted maxZoom
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    } else {
        console.error('Map container #world-map not found!');
    }
    // --- END MAP INITIALIZATION ---

    // Facility data with coordinates and types (Assuming 'locations' variable exists from previous edits)
    const locations = {
        // ... (keep existing locations data) ...
        "north-america": [
            { lat: 38.9637, lng: -95.7129, type: 'datacenter', name: 'USA Data Center' },
            { lat: 34.0522, lng: -118.2437, type: 'hub', name: 'Los Angeles Hub' },
            { lat: 40.7128, lng: -74.0060, type: 'support', name: 'New York Support' },
            { lat: 45.4215, lng: -75.6972, type: 'hub', name: 'Canada Development Hub' },
        ],
        "asia": [
            { lat: 20.5937, lng: 78.9629, type: 'datacenter', name: 'India Data Center' },
            { lat: 19.0760, lng: 72.8777, type: 'hub', name: 'Mumbai Development Hub' },
            { lat: 28.6139, lng: 77.2090, type: 'support', name: 'Delhi Support Center' },
            { lat: 1.3521, lng: 103.8198, type: 'hub', name: 'Singapore Hub' },
            { lat: -33.8688, lng: 151.2093, type: 'support', name: 'Sydney Support' },
        ],
        "europe": [
            { lat: 51.5074, lng: -0.1278, type: 'datacenter', name: 'UK Data Center' },
            { lat: 52.5200, lng: 13.4050, type: 'hub', name: 'Berlin Hub' },
            { lat: 48.8566, lng: 2.3522, type: 'support', name: 'Paris Support Center' },
        ]
    };
    
    // Store markers globally, keyed by region
    const globalMarkers = {}; 

    // Function to create custom marker (Assuming createCustomMarker function exists)
    function createCustomMarker(facility) {
        // ... (keep existing createCustomMarker function code) ...
        const iconMapping = {
            datacenter: 'fas fa-server',
            hub: 'fas fa-building',
            support: 'fas fa-headset'
        };
        const colorMapping = {
            datacenter: 'var(--primary-red)',
            hub: 'var(--accent-red)',
            support: 'var(--medium-gray)'
        };
        const iconClass = iconMapping[facility.type] || 'fas fa-map-marker-alt';
        const markerColor = colorMapping[facility.type] || 'var(--primary-red)';

        const markerHtml = `
            <div class="custom-marker" style="background-color: ${markerColor}; border-color: ${getComputedStyle(document.documentElement).getPropertyValue('--primary-white') || '#fff'};">
                <i class="${iconClass}"></i>
            </div>
        `;

        return L.divIcon({
            html: markerHtml,
            className: 'custom-marker-wrapper',
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -35]
        });
    }

    function updateMap(region) {
        if (!map) { // Check if map was initialized successfully
            console.error("Map not initialized. Cannot update.");
            return;
        }

        const regionLocations = locations[region];
        if (!regionLocations) {
            console.warn(`No locations found for region: ${region}`);
            // Optionally clear all markers if region is unknown or 'all'
            Object.values(globalMarkers).flat().forEach(marker => marker.remove());
            for (const key in globalMarkers) globalMarkers[key] = [];
            return;
        }

        // Clear previously displayed markers (all markers from all regions)
        Object.values(globalMarkers).flat().forEach(marker => marker.remove());
        for (const key in globalMarkers) globalMarkers[key] = []; // Reset the storage

        // Add new markers for the selected region
        const currentRegionMarkers = [];
        const group = L.featureGroup();

        regionLocations.forEach(loc => {
            const customIcon = createCustomMarker(loc);
            const marker = L.marker([loc.lat, loc.lng], { icon: customIcon })
                          .bindPopup(`<b>${loc.name}</b><br>${loc.type.charAt(0).toUpperCase() + loc.type.slice(1)}`);
            currentRegionMarkers.push(marker);
            group.addLayer(marker);
        });

        globalMarkers[region] = currentRegionMarkers; // Store markers for the current region
        group.addTo(map);

        // Adjust map view to fit markers for the current region
        if (group.getLayers().length > 0) {
            map.fitBounds(group.getBounds().pad(0.5)); // Add padding
        } else {
             map.setView([20, 0], 2); // Reset to global view if no markers
        }
    }

    // Region selection functionality (Update event listeners)
    const regionItems = document.querySelectorAll('.region-item'); // Use the correct selector
    regionItems.forEach(item => {
        item.addEventListener('click', function() {
            regionItems.forEach(ri => ri.classList.remove('active'));
            this.classList.add('active');
            const region = this.dataset.region;
            updateMap(region);
        });
    });

    // Initialize map with the first region's data (or a default)
    const firstRegionItem = document.querySelector('.region-item.active') || document.querySelector('.region-item');
    if (firstRegionItem) {
        const initialRegion = firstRegionItem.dataset.region;
         firstRegionItem.classList.add('active'); // Ensure one is active
        updateMap(initialRegion);
    } else if (map) {
        // Fallback if no region items found, show global view
        map.setView([20, 0], 2);
    }
    
    // Initialize Particles.js
    if (document.getElementById('particles-js')) {
        particlesJS("particles-js", {
            "particles": {
              "number": {
                "value": 80,
                "density": {
                  "enable": true,
                  "value_area": 800
                }
              },
              "color": {
                "value": "#ffffff"
              },
              "shape": {
                "type": "circle",
                "stroke": {
                  "width": 0,
                  "color": "#000000"
                },
                "polygon": {
                  "nb_sides": 5
                }
              },
              "opacity": {
                "value": 0.5,
                "random": false,
                "anim": {
                  "enable": false,
                  "speed": 1,
                  "opacity_min": 0.1,
                  "sync": false
                }
              },
              "size": {
                "value": 3,
                "random": true,
                "anim": {
                  "enable": false,
                  "speed": 40,
                  "size_min": 0.1,
                  "sync": false
                }
              },
              "line_linked": {
                "enable": true,
                "distance": 150,
                "color": "#ffffff",
                "opacity": 0.4,
                "width": 1
              },
              "move": {
                "enable": true,
                "speed": 6,
                "direction": "none",
                "random": false,
                "straight": false,
                "out_mode": "out",
                "bounce": false,
                "attract": {
                  "enable": false,
                  "rotateX": 600,
                  "rotateY": 1200
                }
              }
            },
            "interactivity": {
              "detect_on": "canvas",
              "events": {
                "onhover": {
                  "enable": true,
                  "mode": "repulse"
                },
                "onclick": {
                  "enable": true,
                  "mode": "push"
                },
                "resize": true
              },
              "modes": {
                "grab": {
                  "distance": 400,
                  "line_linked": {
                    "opacity": 1
                  }
                },
                "bubble": {
                  "distance": 400,
                  "size": 40,
                  "duration": 2,
                  "opacity": 8,
                  "speed": 3
                },
                "repulse": {
                  "distance": 200,
                  "duration": 0.4
                },
                "push": {
                  "particles_nb": 4
                },
                "remove": {
                  "particles_nb": 2
                }
              }
            },
            "retina_detect": true
          });
    }

    // Improve touch interaction for mobile devices
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
        
        // Add touch feedback to buttons and links
        const interactiveElements = document.querySelectorAll('button, .btn, .business-card, .service-item');
        interactiveElements.forEach(element => {
            element.addEventListener('touchstart', function() {
                this.classList.add('touch-active');
            });
            
            element.addEventListener('touchend', function() {
                this.classList.remove('touch-active');
            });
            
            element.addEventListener('touchcancel', function() {
                this.classList.remove('touch-active');
            });
        });
    }

    // Optimize scroll performance
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (!document.body.classList.contains('is-scrolling')) {
            document.body.classList.add('is-scrolling');
        }
        
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            document.body.classList.remove('is-scrolling');
        }, 150);
    }, { passive: true });
}); 