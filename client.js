// --- 1. COMMON UI LOGIC (Run on all pages) ---

// Cursor Animation (Desktop Only)
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

if(window.matchMedia("(pointer: fine)").matches && cursorDot) {
    window.addEventListener('mousemove', (e) => {
        cursorDot.style.left = `${e.clientX}px`;
        cursorDot.style.top = `${e.clientY}px`;
        
        cursorOutline.animate({
            left: `${e.clientX}px`,
            top: `${e.clientY}px`
        }, { duration: 500, fill: "forwards" });
    });
}

// Scroll Reveal Animation
function reveal() {
    var reveals = document.querySelectorAll('.reveal');
    for (var i = 0; i < reveals.length; i++) {
        var windowheight = window.innerHeight;
        var revealtop = reveals[i].getBoundingClientRect().top;
        var revealpoint = 150;
        if (revealtop < windowheight - revealpoint) {
            reveals[i].classList.add('active');
        }
    }
}
window.addEventListener('scroll', reveal);
reveal(); // Trigger once on load

// Star Background Generator
const starContainer = document.getElementById('star-container');
if(starContainer) {
    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.style.position = 'absolute';
        star.style.width = '2px';
        star.style.height = '2px';
        star.style.background = 'white';
        star.style.borderRadius = '50%';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.opacity = Math.random();
        starContainer.appendChild(star);
    }
}


// --- 2. INDEX PAGE LOGIC (Form Handling) ---
const astroForm = document.getElementById('astroForm');

if (astroForm) {
    // Payment Slip Upload Handler
    const paymentSlipInput = document.getElementById('paymentSlip');
    const fileUploadBox = document.querySelector('.file-upload-box label');
    const uploadText = document.getElementById('uploadText');
    const uploadFile = document.getElementById('uploadFile');
    const fileName = document.getElementById('fileName');
    const errorMessage = document.getElementById('errorMessage');

    if (paymentSlipInput) {
        fileUploadBox.addEventListener('click', () => {
            paymentSlipInput.click();
        });

        paymentSlipInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                fileName.textContent = file.name;
                uploadText.style.display = 'none';
                uploadFile.style.display = 'block';
                errorMessage.style.display = 'none';
            }
        });
    }

    // Horoscope Image Upload Handler
    const horoscopeInput = document.getElementById('horoscopeImage');
    const horoscopeLabel = document.querySelector('label[for="horoscopeImage"]');
    const horoscopeUploadText = document.getElementById('horoscopeUploadText');
    const horoscopeUploadFile = document.getElementById('horoscopeUploadFile');
    const horoscopeFileName = document.getElementById('horoscopeFileName');

    if (horoscopeInput && horoscopeLabel) {
        horoscopeLabel.addEventListener('click', () => {
            horoscopeInput.click();
        });

        horoscopeInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                horoscopeFileName.textContent = file.name;
                horoscopeUploadText.style.display = 'none';
                horoscopeUploadFile.style.display = 'block';
            }
        });
    }

    // Stats Counter Animation
    const counters = document.querySelectorAll('.counter');
    let hasCounted = false;
    window.addEventListener('scroll', () => {
        const statsSection = document.querySelector('.stats-grid');
        if(!hasCounted && statsSection && statsSection.getBoundingClientRect().top < window.innerHeight / 1.3) {
            counters.forEach(counter => {
                counter.innerText = '0';
                const target = +counter.getAttribute('data-target');
                const increment = target / 50;
                const updateCounter = () => {
                    const c = +counter.innerText;
                    if (c < target) {
                        counter.innerText = Math.ceil(c + increment);
                        setTimeout(updateCounter, 30);
                    } else { counter.innerText = target; }
                };
                updateCounter();
            });
            hasCounted = true;
        }
    });

    // Helper function to compress and convert image to base64
    function compressAndConvertImage(file) {
        return new Promise((resolve, reject) => {
            // Check file size
            const maxSizeMB = 5;
            if (file.size > maxSizeMB * 1024 * 1024) {
                console.warn(`File ${file.name} is ${(file.size / 1024 / 1024).toFixed(2)}MB, compressing...`);
            }

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Calculate new dimensions (max 1200 width)
                    if (width > 1200) {
                        height = Math.round(height * (1200 / width));
                        width = 1200;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert to base64 with compression
                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.75);
                    console.log(`Image compressed: ${(file.size / 1024).toFixed(2)}KB → ${(compressedBase64.length / 1024).toFixed(2)}KB`);
                    resolve(compressedBase64);
                };
                img.onerror = () => reject(new Error('Failed to compress image'));
            };
            reader.onerror = error => reject(error);
        });
    }

    // Form Submit Listener
    astroForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Check if payment slip is uploaded
        if (!paymentSlipInput.files || !paymentSlipInput.files[0]) {
            errorMessage.style.display = 'block';
            errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            return;
        }

        // Show loading state
        const btn = document.getElementById('submitBtn');
        btn.innerText = "Processing...";
        btn.disabled = true;

        try {
            console.log('📝 Starting booking submission...');
            
            // Convert payment slip to compressed base64
            let paymentSlipData = '';
            if (paymentSlipInput.files && paymentSlipInput.files[0]) {
                console.log('💳 Compressing payment slip...');
                paymentSlipData = await compressAndConvertImage(paymentSlipInput.files[0]);
            }

            // Convert horoscope image to compressed base64
            let horoscopeData = '';
            if (horoscopeInput.files && horoscopeInput.files[0]) {
                console.log('🔮 Compressing horoscope image...');
                horoscopeData = await compressAndConvertImage(horoscopeInput.files[0]);
            }

            // Collect Data
            const bookingId = 'BK-' + Math.floor(10000 + Math.random() * 90000);
            const bookingData = {
                id: bookingId,
                fullName: document.getElementById('fullName').value,
                whatsapp: document.getElementById('whatsapp').value,
                dob: document.getElementById('dob').value,
                tob: document.getElementById('tob').value,
                pob: document.getElementById('pob').value,
                service: document.getElementById('serviceType').value,
                question: document.getElementById('clientQuestion').value,
                paymentSlipData: paymentSlipData,
                horoscopeData: horoscopeData
            };

            console.log('📤 Sending booking data to server...', { 
                id: bookingId, 
                fullName: bookingData.fullName,
                payloadSize: `${(JSON.stringify(bookingData).length / 1024 / 1024).toFixed(2)}MB`
            });

            // Try to save to backend
            let backendSuccess = false;
            try {
                const response = await fetch('/api/bookings', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(bookingData),
                    timeout: 30000
                });

                const responseData = await response.json();
                console.log('Response from server:', response.status, responseData);

                if (response.ok) {
                    console.log('✅ Booking saved successfully to backend!');
                    backendSuccess = true;
                } else {
                    console.error('❌ Backend rejected booking:', responseData);
                    if (response.status === 413) {
                        throw new Error('Payload too large - please use smaller images');
                    }
                }
            } catch (backendError) {
                // If backend fails, continue anyway (user can still get ticket)
                console.warn('⚠️  Backend save failed (continuing with ticket):', backendError.message);
                console.warn('This might be because: 1) Server not running (npm start), 2) Port 3000 in use, 3) Payload too large');
            }

            // Pass data via URL for PDF generation
            const params = new URLSearchParams({
                id: bookingData.id,
                fullName: bookingData.fullName,
                whatsapp: bookingData.whatsapp,
                dob: bookingData.dob,
                tob: bookingData.tob,
                pob: bookingData.pob,
                service: bookingData.service,
                question: bookingData.question
            }).toString();
            
            // Store images in sessionStorage as backup
            sessionStorage.setItem('paymentSlipData', paymentSlipData);
            sessionStorage.setItem('horoscopeData', horoscopeData);
            
            console.log('🎫 Generating ticket and redirecting...');
            setTimeout(() => {
                window.location.href = `ticket.html?${params}`;
            }, 1000);

        } catch (error) {
            console.error('❌ Error in form submission:', error);
            btn.innerText = "Confirm & Generate Ticket";
            btn.disabled = false;
            errorMessage.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${error.message || 'Error processing booking. Check browser console (F12) for details.'}`;
            errorMessage.style.display = 'block';
            errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });
}


// --- 3. TICKET PAGE LOGIC (Premium PDF Gen) ---
if (window.location.pathname.includes('ticket.html')) {
    
    // Retrieve Data from URL
    const params = new URLSearchParams(window.location.search);
    const data = {
        id: params.get('id'),
        fullName: params.get('fullName'),
        whatsapp: params.get('whatsapp'),
        dob: params.get('dob'),
        tob: params.get('tob'),
        pob: params.get('pob'),
        service: params.get('service'),
        question: params.get('question')
    };

    const { jsPDF } = window.jspdf;

    if (data.fullName && jsPDF) {
        
        // --- A. GENERATE PREMIUM TICKET PDF ---
        
        // 1. Custom Ticket Size (100mm x 160mm)
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: [100, 160] 
        });

        // Colors
        const gold = [212, 175, 55];
        const dark = [10, 10, 10];
        const white = [255, 255, 255];
        const grey = [80, 80, 80];

        // 2. Background & Border
        doc.setFillColor(...white);
        doc.rect(0, 0, 100, 160, 'F'); 
        
        // Gold Borders
        doc.setDrawColor(...gold);
        doc.setLineWidth(1);
        doc.rect(5, 5, 90, 150); // Outer
        doc.setLineWidth(0.3);
        doc.rect(7, 7, 86, 146); // Inner

        // 3. Header Section (Black Block)
        doc.setFillColor(...dark);
        doc.rect(5, 5, 90, 35, 'F');
        
        // Title
        doc.setTextColor(...gold);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("SAMITHA SALGADO", 50, 18, null, null, "center");
        
        doc.setFontSize(8);
        doc.setTextColor(...white);
        doc.setFont("helvetica", "normal");
        doc.text("PROFESSIONAL VEDIC ASTROLOGY", 50, 26, null, null, "center");
        
        doc.setDrawColor(...gold);
        doc.line(25, 30, 75, 30); // Underline

        // 4. Ticket Details
        let y = 50;
        
        // Booking ID
        doc.setTextColor(...dark);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("BOOKING REFERENCE:", 50, y, null, null, "center");
        y += 6;
        doc.setFontSize(12);
        doc.setFont("courier", "bold"); 
        doc.text(`${data.id}`, 50, y, null, null, "center");
        y += 15;

        // Helper function for rows
        const addRow = (label, value) => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            doc.setTextColor(...gold);
            doc.text(label.toUpperCase(), 15, y);
            
            y += 5;
            
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text(value, 15, y);
            
            y += 9; // Spacing
        };

        addRow("Client Name", data.fullName);
        addRow("Service Type", data.service);
        addRow("WhatsApp", data.whatsapp);
        
        // Birth Details (Side by Side)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...gold);
        doc.text("DOB", 15, y);
        doc.text("TIME", 65, y);
        y += 5;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        doc.text(data.dob, 15, y);
        doc.text(data.tob, 65, y);
        y += 12;

        // 5. Tear-Off Line
        doc.setDrawColor(200, 200, 200);
        doc.setLineDash([2, 2], 0);
        doc.line(5, 135, 95, 135);
        doc.setLineDash([]); // Reset
        
        // 6. Bottom Note
        doc.setFontSize(7);
        doc.setTextColor(...grey);
        doc.text("Submit this ticket with your payment slip.", 50, 142, null, null, "center");
        
        doc.setFillColor(...gold);
        doc.rect(30, 146, 40, 6, 'F');
        doc.setTextColor(...dark);
        doc.setFontSize(6);
        doc.setFont("helvetica", "bold");
        doc.text("WAITING FOR VERIFICATION", 50, 150, null, null, "center");

        // Save PDF
        doc.save(`Ticket_${data.fullName}.pdf`);


        // --- B. SETUP WHATSAPP BUTTON ---
        const myNumber = "94752582482";
        const msg = `Hello Samitha, here is my booking.%0a%0a` +
                    `*Ref:* ${data.id}%0a` +
                    `*Name:* ${data.fullName}%0a` +
                    `I have attached the *PDF Ticket* below. 👇`;
        
        document.getElementById('whatsappBtn').href = `https://wa.me/${myNumber}?text=${msg}`;

    } else {
        alert("No booking data found. Please fill the form first.");
        window.location.href = 'index.html';
    }
}