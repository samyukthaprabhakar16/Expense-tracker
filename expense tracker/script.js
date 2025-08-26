document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default for the date picker
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('expense-date').value = today;
    
    // Load expenses from localStorage or initialize empty array
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    
    // DOM elements
    const expenseForm = document.getElementById('expense-form');
    const expenseList = document.getElementById('expense-list');
    const totalAmountElement = document.getElementById('total-amount');
    const monthAmountElement = document.getElementById('month-amount');
    const topCategoryElement = document.getElementById('top-category');
    const categoryChart = document.getElementById('category-chart');
    
    // Format currency in INR
    function formatINR(amount) {
        return '₹' + amount.toLocaleString('en-IN');
    }
    
    // Add expense event
    expenseForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('expense-name').value;
        const amount = parseFloat(document.getElementById('expense-amount').value);
        const category = document.getElementById('expense-category').value;
        const date = document.getElementById('expense-date').value;
        
        if (name && !isNaN(amount) && amount > 0 && category && date) {
            const expense = {
                id: Date.now(),
                name,
                amount,
                category,
                date
            };
            
            expenses.push(expense);
            saveExpenses();
            renderExpenses();
            updateSummary();
            renderChart();
            
            // Reset form
            expenseForm.reset();
            document.getElementById('expense-date').value = today;
        }
    });
    
    // Save expenses to localStorage
    function saveExpenses() {
        localStorage.setItem('expenses', JSON.stringify(expenses));
    }
    
    // Render expenses list
    function renderExpenses() {
        expenseList.innerHTML = '';
        
        if (expenses.length === 0) {
            expenseList.innerHTML = '<p class="no-expenses">No expenses added yet.</p>';
            return;
        }
        
        // Sort expenses by date (newest first)
        expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        expenses.forEach(expense => {
            const expenseItem = document.createElement('div');
            expenseItem.className = 'expense-item';
            expenseItem.innerHTML = `
                <div class="expense-details">
                    <div class="expense-title">${expense.name}</div>
                    <div class="expense-category">${expense.category} • ${formatDate(expense.date)}</div>
                </div>
                <div class="expense-amount">${formatINR(expense.amount)}</div>
                <button class="delete-btn" data-id="${expense.id}"><i class="fas fa-trash"></i></button>
            `;
            expenseList.appendChild(expenseItem);
        });
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                expenses = expenses.filter(expense => expense.id !== id);
                saveExpenses();
                renderExpenses();
                updateSummary();
                renderChart();
            });
        });
    }
    
    // Update summary information
    function updateSummary() {
        // Calculate total amount
        const totalAmount = expenses.reduce((total, expense) => total + expense.amount, 0);
        totalAmountElement.textContent = formatINR(totalAmount);
        
        // Calculate this month's amount
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        const monthAmount = expenses.reduce((total, expense) => {
            const expenseDate = new Date(expense.date);
            if (expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear) {
                return total + expense.amount;
            }
            return total;
        }, 0);
        
        monthAmountElement.textContent = formatINR(monthAmount);
        
        // Find top category
        const categoryTotals = {};
        expenses.forEach(expense => {
            if (categoryTotals[expense.category]) {
                categoryTotals[expense.category] += expense.amount;
            } else {
                categoryTotals[expense.category] = expense.amount;
            }
        });
        
        let topCategory = '-';
        let maxAmount = 0;
        
        for (const category in categoryTotals) {
            if (categoryTotals[category] > maxAmount) {
                maxAmount = categoryTotals[category];
                topCategory = category;
            }
        }
        
        topCategoryElement.textContent = topCategory;
    }
    
    // Render category chart
    function renderChart() {
        categoryChart.innerHTML = '';
        
        // Calculate totals by category
        const categoryTotals = {};
        const categories = ['Food', 'Shopping', 'Transport', 'Entertainment', 'Bills', 'Other'];
        
        // Initialize all categories to 0
        categories.forEach(category => {
            categoryTotals[category] = 0;
        });
        
        // Add actual values
        expenses.forEach(expense => {
            if (categoryTotals.hasOwnProperty(expense.category)) {
                categoryTotals[expense.category] += expense.amount;
            } else {
                categoryTotals[expense.category] = expense.amount;
            }
        });
        
        // Find the maximum value for scaling
        const maxValue = Math.max(...Object.values(categoryTotals));
        const scale = maxValue > 0 ? 180 / maxValue : 1;
        
        // Create bars for each category
        categories.forEach(category => {
            const barHeight = categoryTotals[category] * scale;
            const bar = document.createElement('div');
            bar.className = 'chart-bar';
            bar.style.height = `${barHeight}px`;
            bar.innerHTML = `<div class="chart-label">${category}</div>`;
            
            // Add value on top of bar if there's data
            if (categoryTotals[category] > 0) {
                const valueLabel = document.createElement('div');
                valueLabel.style.position = 'absolute';
                valueLabel.style.top = '-25px';
                valueLabel.style.left = '0';
                valueLabel.style.right = '0';
                valueLabel.style.textAlign = 'center';
                valueLabel.style.color = '#b33971';
                valueLabel.style.fontWeight = '500';
                valueLabel.textContent = formatINR(categoryTotals[category]);
                bar.appendChild(valueLabel);
            }
            
            categoryChart.appendChild(bar);
        });
    }
    
    // Helper function to format date
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-IN', options);
    }
    
    // Initial render
    renderExpenses();
    updateSummary();
    renderChart();
});