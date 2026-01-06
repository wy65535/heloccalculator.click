// HELOC Calculator Main Functions

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Format percentage
function formatPercent(value) {
    return value.toFixed(2) + '%';
}

// Main HELOC Calculator
function calculateHELOC() {
    // Get input values
    const homeValue = parseFloat(document.getElementById('homeValue').value) || 0;
    const mortgageBalance = parseFloat(document.getElementById('mortgageBalance').value) || 0;
    const creditLimit = parseFloat(document.getElementById('creditLimit').value) || 0;
    const drawAmount = parseFloat(document.getElementById('drawAmount').value) || 0;
    const interestRate = parseFloat(document.getElementById('interestRate').value) || 0;
    const drawPeriod = parseInt(document.getElementById('drawPeriod').value) || 0;
    const repaymentPeriod = parseInt(document.getElementById('repaymentPeriod').value) || 0;
    const paymentType = document.getElementById('paymentType').value;

    // Validation
    if (homeValue <= 0 || drawAmount <= 0 || interestRate <= 0) {
        alert('Please enter valid positive values for all required fields.');
        return;
    }

    if (drawAmount > creditLimit) {
        alert('Draw amount cannot exceed credit limit.');
        return;
    }

    if (mortgageBalance > homeValue) {
        alert('Mortgage balance cannot exceed home value.');
        return;
    }

    // Calculate equity
    const equity = homeValue - mortgageBalance;
    const equityPercent = (equity / homeValue) * 100;
    const ltvRatio = ((mortgageBalance + creditLimit) / homeValue) * 100;

    // Monthly interest rate
    const monthlyRate = interestRate / 100 / 12;

    // Calculate draw period payment
    let drawPeriodPayment;
    if (paymentType === 'interest-only') {
        drawPeriodPayment = drawAmount * monthlyRate;
    } else {
        // Principal + Interest during draw period
        const drawMonths = drawPeriod * 12;
        if (monthlyRate === 0) {
            drawPeriodPayment = drawAmount / drawMonths;
        } else {
            drawPeriodPayment = drawAmount * (monthlyRate * Math.pow(1 + monthlyRate, drawMonths)) / 
                              (Math.pow(1 + monthlyRate, drawMonths) - 1);
        }
    }

    // Calculate repayment period payment
    const repaymentMonths = repaymentPeriod * 12;
    let repaymentPayment;
    let remainingBalance = drawAmount;

    if (paymentType === 'principal-interest') {
        // If paying principal during draw, balance may be lower
        const drawMonths = drawPeriod * 12;
        const principalPaidDuringDraw = (drawPeriodPayment - drawAmount * monthlyRate) * drawMonths;
        remainingBalance = Math.max(0, drawAmount - principalPaidDuringDraw);
    }

    if (monthlyRate === 0) {
        repaymentPayment = remainingBalance / repaymentMonths;
    } else {
        repaymentPayment = remainingBalance * (monthlyRate * Math.pow(1 + monthlyRate, repaymentMonths)) / 
                          (Math.pow(1 + monthlyRate, repaymentMonths) - 1);
    }

    // Calculate total costs
    const drawPeriodTotal = drawPeriodPayment * drawPeriod * 12;
    const repaymentPeriodTotal = repaymentPayment * repaymentMonths;
    const totalPaid = drawPeriodTotal + repaymentPeriodTotal;
    const totalInterest = totalPaid - drawAmount;

    // Calculate available additional borrowing
    const maxLoan = homeValue * 0.85; // Typical 85% LTV
    const totalDebt = mortgageBalance + creditLimit;
    const additionalAvailable = Math.max(0, maxLoan - totalDebt);

    // Display results
    displayResults({
        homeValue,
        mortgageBalance,
        equity,
        equityPercent,
        creditLimit,
        drawAmount,
        ltvRatio,
        interestRate,
        drawPeriod,
        repaymentPeriod,
        drawPeriodPayment,
        repaymentPayment,
        drawPeriodTotal,
        repaymentPeriodTotal,
        totalPaid,
        totalInterest,
        additionalAvailable,
        paymentType,
        remainingBalance
    });
}

// Display calculation results
function displayResults(data) {
    const resultsDiv = document.getElementById('results');
    
    const html = `
        <div class="result-card">
            <h3>💰 Your HELOC Payment Breakdown</h3>
            
            <div class="result-highlight">
                <h4>Draw Period Monthly Payment</h4>
                <div class="big-number">${formatCurrency(data.drawPeriodPayment)}/month</div>
                <p style="margin-top: 0.5rem; opacity: 0.9;">For ${data.drawPeriod} years (${data.paymentType === 'interest-only' ? 'Interest Only' : 'Principal + Interest'})</p>
            </div>

            <div class="result-highlight">
                <h4>Repayment Period Monthly Payment</h4>
                <div class="big-number">${formatCurrency(data.repaymentPayment)}/month</div>
                <p style="margin-top: 0.5rem; opacity: 0.9;">For ${data.repaymentPeriod} years (Principal + Interest)</p>
            </div>

            <div class="result-breakdown">
                <h4>Loan Details</h4>
                <div class="result-item">
                    <span class="result-label">Home Value</span>
                    <span class="result-value">${formatCurrency(data.homeValue)}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Current Mortgage</span>
                    <span class="result-value">${formatCurrency(data.mortgageBalance)}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Available Equity</span>
                    <span class="result-value">${formatCurrency(data.equity)} (${formatPercent(data.equityPercent)})</span>
                </div>
                <div class="result-item">
                    <span class="result-label">HELOC Credit Limit</span>
                    <span class="result-value">${formatCurrency(data.creditLimit)}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Amount Drawing</span>
                    <span class="result-value">${formatCurrency(data.drawAmount)}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Remaining Available Credit</span>
                    <span class="result-value">${formatCurrency(data.creditLimit - data.drawAmount)}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Combined LTV Ratio</span>
                    <span class="result-value">${formatPercent(data.ltvRatio)}</span>
                </div>
            </div>

            <div class="result-breakdown">
                <h4>Cost Analysis</h4>
                <div class="result-item">
                    <span class="result-label">Interest Rate</span>
                    <span class="result-value">${formatPercent(data.interestRate)}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Total Paid (Draw Period)</span>
                    <span class="result-value">${formatCurrency(data.drawPeriodTotal)}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Total Paid (Repayment Period)</span>
                    <span class="result-value">${formatCurrency(data.repaymentPeriodTotal)}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Total Amount Paid</span>
                    <span class="result-value">${formatCurrency(data.totalPaid)}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Total Interest Paid</span>
                    <span class="result-value">${formatCurrency(data.totalInterest)}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Loan Term</span>
                    <span class="result-value">${data.drawPeriod + data.repaymentPeriod} years</span>
                </div>
            </div>

            <div class="payment-phase">
                <h5>📊 Payment Timeline</h5>
                <p><strong>Years 1-${data.drawPeriod}:</strong> Draw Period - ${formatCurrency(data.drawPeriodPayment)}/month</p>
                <p><strong>Years ${data.drawPeriod + 1}-${data.drawPeriod + data.repaymentPeriod}:</strong> Repayment Period - ${formatCurrency(data.repaymentPayment)}/month</p>
            </div>

            ${data.additionalAvailable > 0 ? `
            <div class="result-item" style="background-color: #d1fae5; border-left-color: #10b981;">
                <span class="result-label">💡 Additional Borrowing Capacity</span>
                <span class="result-value" style="color: #10b981;">${formatCurrency(data.additionalAvailable)}</span>
            </div>
            ` : ''}
        </div>
    `;
    
    resultsDiv.innerHTML = html;
}

// Available Equity Calculator
function calculateAvailableEquity() {
    const homeValue = parseFloat(document.getElementById('equityHomeValue').value) || 0;
    const mortgage = parseFloat(document.getElementById('equityMortgage').value) || 0;
    const maxLTV = parseFloat(document.getElementById('equityLTV').value) || 85;

    if (homeValue <= 0) {
        alert('Please enter a valid home value.');
        return;
    }

    const maxLoan = homeValue * (maxLTV / 100);
    const availableEquity = maxLoan - mortgage;
    const currentEquity = homeValue - mortgage;
    const currentLTV = (mortgage / homeValue) * 100;

    const resultDiv = document.getElementById('equityResult');
    resultDiv.innerHTML = `
        <strong>Available to Borrow:</strong> ${formatCurrency(Math.max(0, availableEquity))}<br>
        <strong>Current Equity:</strong> ${formatCurrency(currentEquity)}<br>
        <strong>Current LTV:</strong> ${formatPercent(currentLTV)}<br>
        <strong>Max LTV:</strong> ${formatPercent(maxLTV)}
    `;
}

// Interest Cost Calculator
function calculateInterestCost() {
    const principal = parseFloat(document.getElementById('costPrincipal').value) || 0;
    const rate = parseFloat(document.getElementById('costRate').value) || 0;
    const years = parseFloat(document.getElementById('costYears').value) || 0;

    if (principal <= 0 || rate <= 0 || years <= 0) {
        alert('Please enter valid values.');
        return;
    }

    const monthlyRate = rate / 100 / 12;
    const months = years * 12;
    
    let monthlyPayment;
    if (monthlyRate === 0) {
        monthlyPayment = principal / months;
    } else {
        monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                        (Math.pow(1 + monthlyRate, months) - 1);
    }

    const totalPaid = monthlyPayment * months;
    const totalInterest = totalPaid - principal;
    const interestPercent = (totalInterest / principal) * 100;

    const resultDiv = document.getElementById('costResult');
    resultDiv.innerHTML = `
        <strong>Monthly Payment:</strong> ${formatCurrency(monthlyPayment)}<br>
        <strong>Total Interest:</strong> ${formatCurrency(totalInterest)}<br>
        <strong>Total Paid:</strong> ${formatCurrency(totalPaid)}<br>
        <strong>Interest as % of Loan:</strong> ${formatPercent(interestPercent)}
    `;
}

// Compare HELOC vs Loan
function compareOptions() {
    const amount = parseFloat(document.getElementById('compAmount').value) || 0;
    const helocRate = parseFloat(document.getElementById('compHelocRate').value) || 0;
    const loanRate = parseFloat(document.getElementById('compLoanRate').value) || 0;
    const term = parseFloat(document.getElementById('compTerm').value) || 0;

    if (amount <= 0 || helocRate <= 0 || loanRate <= 0 || term <= 0) {
        alert('Please enter valid values.');
        return;
    }

    const months = term * 12;

    // HELOC calculation (interest-only for 10 years, then full repayment)
    const helocMonthlyRate = helocRate / 100 / 12;
    const helocInterestOnly = amount * helocMonthlyRate;
    const helocDrawPeriod = Math.min(10, term);
    const helocRepaymentYears = term - helocDrawPeriod;
    
    let helocRepaymentPayment = 0;
    if (helocRepaymentYears > 0) {
        const repayMonths = helocRepaymentYears * 12;
        helocRepaymentPayment = amount * (helocMonthlyRate * Math.pow(1 + helocMonthlyRate, repayMonths)) / 
                               (Math.pow(1 + helocMonthlyRate, repayMonths) - 1);
    }
    
    const helocTotalPaid = (helocInterestOnly * helocDrawPeriod * 12) + 
                          (helocRepaymentPayment * helocRepaymentYears * 12);
    const helocInterest = helocTotalPaid - amount;

    // Home Equity Loan calculation
    const loanMonthlyRate = loanRate / 100 / 12;
    const loanPayment = amount * (loanMonthlyRate * Math.pow(1 + loanMonthlyRate, months)) / 
                       (Math.pow(1 + loanMonthlyRate, months) - 1);
    const loanTotalPaid = loanPayment * months;
    const loanInterest = loanTotalPaid - amount;

    const savings = loanTotalPaid - helocTotalPaid;
    const betterOption = savings > 0 ? 'HELOC' : 'Home Equity Loan';

    const resultDiv = document.getElementById('compResult');
    resultDiv.innerHTML = `
        <div style="margin-bottom: 1rem;">
            <strong>HELOC:</strong><br>
            Draw Period: ${formatCurrency(helocInterestOnly)}/mo<br>
            Repayment: ${formatCurrency(helocRepaymentPayment)}/mo<br>
            Total Interest: ${formatCurrency(helocInterest)}
        </div>
        <div style="margin-bottom: 1rem;">
            <strong>Home Equity Loan:</strong><br>
            Monthly Payment: ${formatCurrency(loanPayment)}<br>
            Total Interest: ${formatCurrency(loanInterest)}
        </div>
        <div style="background: #dbeafe; padding: 0.75rem; border-radius: 4px;">
            <strong>Best Option:</strong> ${betterOption}<br>
            <strong>Savings:</strong> ${formatCurrency(Math.abs(savings))}
        </div>
    `;
}

// Real-time input updates
document.addEventListener('DOMContentLoaded', function() {
    // Add input event listeners for auto-formatting
    const numberInputs = document.querySelectorAll('input[type="number"]');
    numberInputs.forEach(input => {
        input.addEventListener('input', function() {
            // Prevent negative numbers
            if (this.value < 0) {
                this.value = 0;
            }
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter to calculate
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            const activeElement = document.activeElement;
            if (activeElement.closest('.calculator-inputs')) {
                calculateHELOC();
            }
        }
    });

    // Lazy loading for performance
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1
        });

        document.querySelectorAll('.tool-card, .faq-item, .step').forEach(el => {
            observer.observe(el);
        });
    }

    // Update current year in footer if needed
    const currentYear = new Date().getFullYear();
    const yearElements = document.querySelectorAll('.current-year');
    yearElements.forEach(el => {
        el.textContent = currentYear;
    });
});

// Add some visual feedback for calculations
function showCalculating() {
    const btn = document.querySelector('.calculate-btn');
    const originalText = btn.textContent;
    btn.textContent = 'Calculating...';
    btn.disabled = true;
    
    setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
    }, 500);
}

// Export calculation data (for advanced users)
function exportResults() {
    const results = {
        timestamp: new Date().toISOString(),
        inputs: {
            homeValue: document.getElementById('homeValue').value,
            mortgageBalance: document.getElementById('mortgageBalance').value,
            creditLimit: document.getElementById('creditLimit').value,
            drawAmount: document.getElementById('drawAmount').value,
            interestRate: document.getElementById('interestRate').value,
            drawPeriod: document.getElementById('drawPeriod').value,
            repaymentPeriod: document.getElementById('repaymentPeriod').value
        }
    };
    
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'heloc-calculation.json';
    link.click();
}

// Print results
function printResults() {
    window.print();
}

// Share functionality
async function shareResults() {
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'HELOC Calculator Results',
                text: 'Check out my HELOC calculation results',
                url: window.location.href
            });
        } catch (err) {
            console.log('Error sharing:', err);
        }
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    }
}

// Analytics tracking (placeholder for Google Analytics)
function trackCalculation() {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'calculate', {
            'event_category': 'HELOC Calculator',
            'event_label': 'Main Calculator'
        });
    }
}

// Add to the calculate function
const originalCalculate = calculateHELOC;
calculateHELOC = function() {
    showCalculating();
    trackCalculation();
    setTimeout(originalCalculate, 100);
};
