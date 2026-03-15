/* ================================
   GUINNESS BET TRACKER - APP LOGIC
   Connected to Supabase Backend
   ================================ */

// ================================
// SUPABASE CONFIGURATION
// ================================
const SUPABASE_URL = 'https://fuolifxojezvplkquniy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1b2xpZnhvamV6dnBsa3F1bml5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3ODcyODcsImV4cCI6MjA3NjM2MzI4N30.TK4kh8BCX2kP2xORrhzp531lgVrybd0wV-7v8HpNLS8';

// Initialize Supabase client
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('✅ Supabase client initialized');

// ================================
// AUTHENTICATION FUNCTIONS
// ================================

/**
 * Check if user is authenticated as landlord/admin
 * @returns {boolean} - True if authenticated
 */
function isLandlord() {
    const authData = localStorage.getItem('guinness_landlord');

    if (!authData) return false;

    try {
        const data = JSON.parse(authData);
        const now = new Date();
        const expiry = new Date(data.expiry);

        // Check if authenticated and not expired
        if (data.authenticated && now < expiry) {
            return true;
        } else {
            // Expired, clear it
            localStorage.removeItem('guinness_landlord');
            return false;
        }
    } catch (e) {
        // Invalid data, clear it
        localStorage.removeItem('guinness_landlord');
        return false;
    }
}

/**
 * Logout - clear authentication
 */
function logout() {
    localStorage.removeItem('guinness_landlord');
    window.location.reload();
}

/**
 * Show/hide elements based on landlord status
 */
function updateUIForAuth() {
    const landlord = isLandlord();

    // Hide/show landlord-only buttons
    const landlordOnlyElements = document.querySelectorAll('.landlord-only');
    landlordOnlyElements.forEach(el => {
        el.style.display = landlord ? 'block' : 'none';
    });

    // Toggle between Landlord Mode link and Logout button
    const landlordLink = document.getElementById('landlordModeLink');
    const logoutBtn = document.getElementById('logoutBtn');

    if (landlordLink && logoutBtn) {
        if (landlord) {
            // Logged in - show logout, hide landlord mode link
            landlordLink.style.display = 'none';
            logoutBtn.style.display = 'inline-block';
        } else {
            // Not logged in - show landlord mode link, hide logout
            landlordLink.style.display = 'inline-block';
            logoutBtn.style.display = 'none';
        }
    }
}

// ================================
// CALENDAR INTEGRATION FUNCTIONS
// ================================

/**
 * Generate .ics calendar file content for a bet
 * @param {Object} bet - The bet object
 * @returns {string} - .ics file content
 */
function generateCalendarEvent(bet) {
    // Format date for .ics (YYYYMMDD for all-day events)
    const dueDate = bet.due_date.replace(/-/g, '');

    // Create unique ID
    const uid = `bet-${bet.id || Date.now()}@guinessbets.netlify.app`;

    // Format timestamp for DTSTAMP
    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    // Build description with stakes and notes (use literal \n for .ics format)
    let description = `Bet Stakes:\n`;
    description += `Dylan: ${bet.dylan_side ? 'TRUE' : 'FALSE'} for ${bet.dylan_pints} pint${bet.dylan_pints !== 1 ? 's' : ''}\n`;
    description += `Poppet: ${bet.poppet_side ? 'TRUE' : 'FALSE'} for ${bet.poppet_pints} pint${bet.poppet_pints !== 1 ? 's' : ''}`;

    if (bet.notes) {
        description += `\n\nNotes: ${bet.notes}`;
    }

    // Escape special characters for .ics format
    const summary = `Bet Due: ${bet.condition}`.replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n');
    description = description.replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n');

    // Build .ics content
    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Guinness Bets//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${now}`,
        `DTSTART;VALUE=DATE:${dueDate}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        'STATUS:CONFIRMED',
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        'DESCRIPTION:Bet is due today!',
        'TRIGGER:-PT0H',
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    return icsContent;
}

/**
 * Download calendar event for a bet
 * @param {Object} bet - The bet object
 */
function downloadCalendarEvent(bet) {
    const icsContent = generateCalendarEvent(bet);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    // Create temporary download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `bet-${bet.id || 'new'}.ics`;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);

    console.log('📅 Calendar event downloaded for bet:', bet.condition);
}

/**
 * Generate Google Calendar URL for a bet
 * @param {Object} bet - The bet object
 * @returns {string} - Google Calendar URL
 */
function generateGoogleCalendarUrl(bet) {
    // Format date for Google Calendar (YYYYMMDD)
    const dueDate = bet.due_date.replace(/-/g, '');

    // Google Calendar expects end date to be next day for all-day events
    const endDate = new Date(bet.due_date);
    endDate.setDate(endDate.getDate() + 1);
    const endDateStr = endDate.toISOString().split('T')[0].replace(/-/g, '');

    // Build description
    let description = `Bet Stakes:\n`;
    description += `Dylan: ${bet.dylan_side ? 'TRUE' : 'FALSE'} for ${bet.dylan_pints} pint${bet.dylan_pints !== 1 ? 's' : ''}\n`;
    description += `Poppet: ${bet.poppet_side ? 'TRUE' : 'FALSE'} for ${bet.poppet_pints} pint${bet.poppet_pints !== 1 ? 's' : ''}`;

    if (bet.notes) {
        description += `\n\nNotes: ${bet.notes}`;
    }

    // URL encode parameters
    const title = encodeURIComponent(`Bet Due: ${bet.condition}`);
    const details = encodeURIComponent(description);
    const dates = `${dueDate}/${endDateStr}`;

    // Build Google Calendar URL
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}`;
}

// ================================
// CALENDAR MODAL STATE
// ================================
let currentCalendarBetId = null;

/**
 * Add active bet to calendar by ID - opens modal
 * @param {number} betId - The bet ID
 */
async function addBetToCalendar(betId) {
    const bet = await getBetById(betId);
    if (!bet) {
        alert('Could not find bet to add to calendar');
        return;
    }

    // Store current bet ID
    currentCalendarBetId = betId;

    // Populate modal
    document.getElementById('calendarModalCondition').textContent = bet.condition;

    // Show modal
    document.getElementById('calendarModal').classList.remove('hidden');
}

/**
 * Confirm calendar choice from modal
 * @param {string} type - 'ics' or 'google'
 */
async function confirmCalendarChoice(type) {
    const bet = await getBetById(currentCalendarBetId);
    if (!bet) return;

    if (type === 'ics') {
        // Download .ics file
        downloadCalendarEvent(bet);
    } else if (type === 'google') {
        // Open Google Calendar
        const googleUrl = generateGoogleCalendarUrl(bet);
        window.open(googleUrl, '_blank');
    }

    // Close modal
    closeCalendarModal();
}

/**
 * Close calendar modal
 * @param {boolean} fromAddForm - If called from add form, redirect to home
 */
function closeCalendarModal(fromAddForm = false) {
    document.getElementById('calendarModal').classList.add('hidden');
    currentCalendarBetId = null;

    // If called from add form, redirect to home page
    if (fromAddForm || document.getElementById('addBetForm')) {
        window.location.href = 'index.html';
    }
}

// ================================
// UTILITY FUNCTIONS
// ================================

// Calculate days until due date
function daysUntilDue(dueDate) {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// Format date to readable string
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

// ================================
// LOAD BETS FROM SUPABASE
// ================================
async function loadActiveBets() {
    const { data, error } = await db
        .from('bets')
        .select('*')
        .eq('status', 'active')
        .order('due_date', { ascending: true });

    if (error) {
        console.error('Error loading active bets:', error);
        throw error;
    }

    return data || [];
}

async function loadResolvedBets() {
    const { data, error } = await db
        .from('bets')
        .select('*')
        .eq('status', 'resolved')
        .order('resolution_date', { ascending: false });

    if (error) {
        console.error('Error loading resolved bets:', error);
        return [];
    }

    return data || [];
}

async function getBetById(id) {
    const { data, error } = await db
        .from('bets')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error loading bet:', error);
        return null;
    }

    return data;
}

// ================================
// RENDER ACTIVE BETS (index.html)
// ================================
async function renderActiveBets() {
    const container = document.getElementById('activeBetsList');
    const emptyState = document.getElementById('emptyState');

    if (!container) return; // Not on index.html page

    // Show loading state
    container.innerHTML = '<div style="text-align: center; color: var(--cream);">Loading bets...</div>';

    let activeBets;
    try {
        activeBets = await loadActiveBets();
    } catch (error) {
        container.innerHTML = `<div style="text-align: center; color: var(--cream); padding: 2rem;">
            <p style="font-weight: 700; margin-bottom: 0.5rem;">Failed to load bets.</p>
            <p style="font-size: 0.875rem; opacity: 0.7;">${error.message || 'Unknown error — check the console for details.'}</p>
        </div>`;
        return;
    }

    if (activeBets.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    container.style.display = 'flex';
    emptyState.style.display = 'none';

    container.innerHTML = activeBets.map(bet => {
        const daysLeft = daysUntilDue(bet.due_date);
        const daysText = daysLeft > 0
            ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`
            : daysLeft === 0
            ? 'Due today!'
            : `${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? 's' : ''} overdue`;

        const daysClass = daysLeft < 0 ? 'overdue' : daysLeft < 7 ? 'warning' : '';

        return `
            <div class="bet-card">
                <div class="bet-condition">${bet.condition}</div>
                ${bet.notes ? `<div class="bet-notes">${bet.notes}</div>` : ''}

                <div class="bet-details">
                    <div class="bet-detail">
                        <span class="bet-label">Due Date</span>
                        <span class="bet-value">${formatDate(bet.due_date)}</span>
                    </div>
                    <div class="bet-detail">
                        <span class="bet-label">Time Left</span>
                        <span class="bet-value ${daysClass}">${daysText}</span>
                    </div>
                </div>

                <div class="bet-stakes">
                    <div class="stake">
                        <div class="stake-name">Dylan</div>
                        <div class="stake-pints">${bet.dylan_pints} 🍺</div>
                        <div class="stake-side">${bet.dylan_side ? 'TRUE' : 'FALSE'}</div>
                    </div>
                    <div class="stake">
                        <div class="stake-name">Poppet</div>
                        <div class="stake-pints">${bet.poppet_pints} 🍺</div>
                        <div class="stake-side">${bet.poppet_side ? 'TRUE' : 'FALSE'}</div>
                    </div>
                </div>

                <div class="bet-actions landlord-only">
                    <button class="btn btn-primary btn-full" onclick="resolveBet(${bet.id})">
                        Resolve Bet
                    </button>
                </div>

                <div class="bet-actions" style="margin-top: 0.5rem;">
                    <button class="btn btn-secondary btn-full" onclick="addBetToCalendar(${bet.id})">
                        📅 Add to Calendar
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// ================================
// RENDER RESOLVED BETS (history.html)
// ================================
async function renderResolvedBets() {
    const container = document.getElementById('resolvedBetsList');
    const emptyState = document.getElementById('emptyStateHistory');

    if (!container) return; // Not on history.html page

    // Show loading state
    container.innerHTML = '<div style="text-align: center; color: var(--cream);">Loading history...</div>';

    const resolvedBets = await loadResolvedBets();

    if (resolvedBets.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    container.style.display = 'flex';
    emptyState.style.display = 'none';

    container.innerHTML = resolvedBets.map(bet => {
        const remaining = bet.pints_owed - bet.pints_paid;
        const isPaid = remaining <= 0;
        const isPartial = bet.pints_paid > 0 && !isPaid;

        let statusBadge = '';
        if (isPaid) {
            statusBadge = '<span class="badge badge-paid">Fully Paid</span>';
        } else if (isPartial) {
            statusBadge = '<span class="badge badge-unpaid">Partially Paid</span>';
        } else {
            statusBadge = '<span class="badge badge-unpaid">Unpaid</span>';
        }

        return `
            <div class="bet-card">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <div class="bet-condition" style="margin-bottom: 0;">${bet.condition}</div>
                    ${statusBadge}
                </div>
                ${bet.notes ? `<div class="bet-notes">${bet.notes}</div>` : ''}

                <div class="bet-details">
                    <div class="bet-detail">
                        <span class="bet-label">Resolved</span>
                        <span class="bet-value">${formatDate(bet.resolution_date)}</span>
                    </div>
                    <div class="bet-detail">
                        <span class="bet-label">Winner</span>
                        <span class="bet-value">${bet.winner}</span>
                    </div>
                    <div class="bet-detail">
                        <span class="bet-label">Outcome</span>
                        <span class="bet-value">${bet.outcome ? 'TRUE' : 'FALSE'}</span>
                    </div>
                    <div class="bet-detail">
                        <span class="bet-label">Pints Owed</span>
                        <span class="bet-value">${bet.pints_owed} 🍺</span>
                    </div>
                </div>

                <div class="bet-details" style="margin-top: 1rem;">
                    <div class="bet-detail">
                        <span class="bet-label">Paid So Far</span>
                        <span class="bet-value">${bet.pints_paid} 🍺</span>
                    </div>
                    <div class="bet-detail">
                        <span class="bet-label">Remaining</span>
                        <span class="bet-value">${Math.max(0, remaining).toFixed(1)} 🍺</span>
                    </div>
                </div>

                ${!isPaid ? `
                    <div class="bet-actions landlord-only" style="margin-top: 1rem;">
                        <button class="btn btn-primary btn-full" onclick="recordPayment(${bet.id})">
                            Record Payment
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// ================================
// RESOLVE BET MODAL STATE
// ================================
let currentResolveBetId = null;

// ================================
// RESOLVE BET (Open Modal)
// ================================
async function resolveBet(betId) {
    const bet = await getBetById(betId);
    if (!bet) return;

    // Set current bet
    currentResolveBetId = betId;

    // Populate modal with bet details
    document.getElementById('resolveModalCondition').textContent = bet.condition;

    // Show notes if they exist
    const notesEl = document.getElementById('resolveModalNotes');
    if (bet.notes) {
        notesEl.textContent = bet.notes;
        notesEl.style.display = 'block';
    } else {
        notesEl.style.display = 'none';
    }

    // Calculate who wins in each scenario
    let trueWinner, falseWinner, truePints, falsePints;

    if (bet.dylan_side === true) {
        trueWinner = 'Dylan';
        truePints = bet.dylan_pints;
        falseWinner = 'Poppet';
        falsePints = bet.poppet_pints;
    } else {
        trueWinner = 'Poppet';
        truePints = bet.poppet_pints;
        falseWinner = 'Dylan';
        falsePints = bet.dylan_pints;
    }

    // Show who wins in each scenario
    document.getElementById('resolveWinnerTrue').textContent = `${trueWinner} wins ${truePints} 🍺`;
    document.getElementById('resolveWinnerFalse').textContent = `${falseWinner} wins ${falsePints} 🍺`;

    // Show modal
    document.getElementById('resolveModal').classList.remove('hidden');
}

// ================================
// CONFIRM RESOLVE
// ================================
async function confirmResolve(outcome) {
    const bet = await getBetById(currentResolveBetId);
    if (!bet) return;

    // Determine winner based on outcome and who took which side
    let winner;
    let pintsOwed;

    if (outcome === true) {
        // Outcome is TRUE
        if (bet.dylan_side === true) {
            winner = 'Dylan';
            pintsOwed = bet.dylan_pints;
        } else {
            winner = 'Poppet';
            pintsOwed = bet.poppet_pints;
        }
    } else {
        // Outcome is FALSE
        if (bet.dylan_side === false) {
            winner = 'Dylan';
            pintsOwed = bet.dylan_pints;
        } else {
            winner = 'Poppet';
            pintsOwed = bet.poppet_pints;
        }
    }

    // Update bet in Supabase
    const { error } = await db
        .from('bets')
        .update({
            status: 'resolved',
            resolution_date: new Date().toISOString().split('T')[0],
            outcome: outcome,
            winner: winner,
            pints_owed: pintsOwed,
            pints_paid: 0
        })
        .eq('id', currentResolveBetId);

    if (error) {
        console.error('Error resolving bet:', error);
        alert('Error resolving bet. Please try again.');
        return;
    }

    // Close modal
    closeResolveModal();

    // Show success message
    alert(`Bet resolved! ${winner} wins ${pintsOwed} pints! 🍺`);

    // Refresh the view
    await renderActiveBets();
    updateUIForAuth();
}

// ================================
// CLOSE RESOLVE MODAL
// ================================
function closeResolveModal() {
    document.getElementById('resolveModal').classList.add('hidden');
    currentResolveBetId = null;
}

// ================================
// PAYMENT MODAL STATE
// ================================
let currentPaymentBetId = null;
let currentPaymentAmount = 0;

// ================================
// RECORD PAYMENT (Open Modal)
// ================================
async function recordPayment(betId) {
    const bet = await getBetById(betId);
    if (!bet) return;

    // Set current bet
    currentPaymentBetId = betId;
    currentPaymentAmount = 0;

    // Populate modal with bet details
    const remaining = bet.pints_owed - bet.pints_paid;
    document.getElementById('modalBetCondition').textContent = bet.condition;
    document.getElementById('modalPintsOwed').textContent = `${bet.pints_owed} 🍺`;
    document.getElementById('modalPintsPaid').textContent = `${bet.pints_paid} 🍺`;
    document.getElementById('modalPintsRemaining').textContent = `${remaining.toFixed(1)} 🍺`;
    document.getElementById('paymentAmount').textContent = '0.0 🍺';

    // Show modal
    document.getElementById('paymentModal').classList.remove('hidden');
}

// ================================
// ADJUST PAYMENT AMOUNT
// ================================
function adjustPayment(amount) {
    currentPaymentAmount += amount;

    // Don't allow negative payments
    if (currentPaymentAmount < 0) {
        currentPaymentAmount = 0;
    }

    // Update display
    document.getElementById('paymentAmount').textContent = `${currentPaymentAmount.toFixed(1)} 🍺`;
}

// ================================
// RESET PAYMENT AMOUNT
// ================================
function resetPayment() {
    currentPaymentAmount = 0;
    document.getElementById('paymentAmount').textContent = '0.0 🍺';
}

// ================================
// CONFIRM PAYMENT
// ================================
async function confirmPayment() {
    if (currentPaymentAmount <= 0) {
        alert('Please enter a payment amount greater than 0');
        return;
    }

    const bet = await getBetById(currentPaymentBetId);
    if (!bet) return;

    // Calculate new payment total
    const newPintsPaid = bet.pints_paid + currentPaymentAmount;

    // Update bet in Supabase
    const { error } = await db
        .from('bets')
        .update({
            pints_paid: newPintsPaid
        })
        .eq('id', currentPaymentBetId);

    if (error) {
        console.error('Error recording payment:', error);
        alert('Error recording payment. Please try again.');
        return;
    }

    const newRemaining = bet.pints_owed - newPintsPaid;

    // Close modal
    closePaymentModal();

    // Show success message
    if (newRemaining <= 0) {
        alert(`Payment recorded! Bet is now fully paid! 🍺`);
    } else {
        alert(`Payment of ${currentPaymentAmount.toFixed(1)} pints recorded!\n${newRemaining.toFixed(1)} pints remaining.`);
    }

    // Refresh the view
    await renderResolvedBets();
    updateUIForAuth();
}

// ================================
// CLOSE PAYMENT MODAL
// ================================
function closePaymentModal() {
    document.getElementById('paymentModal').classList.add('hidden');
    currentPaymentBetId = null;
    currentPaymentAmount = 0;
}

// ================================
// ADD NEW BET (add.html)
// ================================
function handleAddBetForm() {
    const form = document.getElementById('addBetForm');
    if (!form) return; // Not on add.html page

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Get form values
        const condition = document.getElementById('condition').value.trim();
        const notes = document.getElementById('notes').value.trim();
        const dueDate = document.getElementById('due_date').value;
        const dylanSide = document.querySelector('input[name="dylan_side"]:checked').value === 'true';
        const dylanPints = parseFloat(document.getElementById('dylan_pints').value);
        const poppetPints = parseFloat(document.getElementById('poppet_pints').value);

        // Validation
        if (!condition || !dueDate || !dylanPints || !poppetPints) {
            alert('Please fill in all fields');
            return;
        }

        if (dylanPints <= 0 || poppetPints <= 0) {
            alert('Pints must be greater than 0');
            return;
        }

        // Create new bet object
        const newBet = {
            condition: condition,
            notes: notes || null,
            due_date: dueDate,
            dylan_side: dylanSide,
            poppet_side: !dylanSide, // Opposite side
            dylan_pints: dylanPints,
            poppet_pints: poppetPints,
            created_date: new Date().toISOString().split('T')[0],
            status: 'active'
        };

        // Insert into Supabase
        const { data, error } = await db
            .from('bets')
            .insert([newBet])
            .select();

        if (error) {
            console.error('Error adding bet:', error);
            alert('Error adding bet. Please try again.');
            return;
        }

        // Bet created successfully
        const createdBet = data[0];

        // Ask if user wants to add to calendar
        const addToCalendar = confirm('Bet added! 🍺\n\nWould you like to add this to your calendar?');

        if (addToCalendar && createdBet) {
            // Store the bet temporarily
            currentCalendarBetId = createdBet.id;

            // Populate modal
            document.getElementById('calendarModalCondition').textContent = createdBet.condition;

            // Show modal
            document.getElementById('calendarModal').classList.remove('hidden');

            // Don't redirect yet - user needs to interact with modal
        } else {
            // No calendar, just redirect
            form.reset();
            window.location.href = 'index.html';
        }
    });
}

// ================================
// INITIALIZE ON PAGE LOAD
// ================================
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🍺 Guinness Bet Tracker loading...');

    // Render appropriate view based on current page
    await renderActiveBets();
    await renderResolvedBets();
    handleAddBetForm();

    // Update UI based on auth status — called after rendering so that
    // dynamically generated landlord-only elements are also processed.
    updateUIForAuth();

    console.log('✅ App ready!');
});
