const benefitBoxes = document.getElementById("benefits-section");
const timelineSection = document.getElementById("timeline");
const groceryForm = document.getElementById("grocery-form");
const groceryOutput = document.getElementById("grocery-output");
const groceryStatusTag = document.getElementById("grocery-status-tag");
const generateGroceryBtn = document.getElementById("generate-grocery-btn");
const workoutForm = document.getElementById("workout-form");
const workoutOutput = document.getElementById("workout-output");
const workoutTargetLabel = document.getElementById("workout-target-label");
const viewPanels = document.querySelectorAll('.view-panel');
const logBtn = document.getElementById("log-workout-btn");
const openLogModalBtn = document.getElementById("open-log-modal-btn");
const closeLogModalBtn = document.getElementById("close-log-modal-btn");
const logModal = document.getElementById("log-modal");
const dashboardWorkoutsCount = document.getElementById("dashboard-workouts-count");
const dashboardWorkoutSummary = document.getElementById("dashboard-workout-summary");
const dashboardPlannedMeals = document.getElementById("dashboard-planned-meals");
const dashboardMealGoalSummary = document.getElementById("dashboard-meal-goal-summary");
const dashboardCaloriesProgress = document.getElementById("dashboard-calories-progress");
const dashboardProteinProgress = document.getElementById("dashboard-protein-progress");
const dashboardCarbsProgress = document.getElementById("dashboard-carbs-progress");
const dashboardFatProgress = document.getElementById("dashboard-fat-progress");
const dashboardCaloriesBar = document.getElementById("dashboard-calories-bar");
const dashboardProteinBar = document.getElementById("dashboard-protein-bar");
const dashboardCarbsBar = document.getElementById("dashboard-carbs-bar");
const dashboardFatBar = document.getElementById("dashboard-fat-bar");
const dashboardGroceryProgress = document.getElementById("dashboard-grocery-progress");
const dashboardGroceryProgressDetail = document.getElementById("dashboard-grocery-progress-detail");
const dashboardMealUsage = document.getElementById("dashboard-meal-usage");
const dashboardMealUsageDetail = document.getElementById("dashboard-meal-usage-detail");
const dashboardScannerConfidence = document.getElementById("dashboard-scanner-confidence");
const dashboardScannerConfidenceDetail = document.getElementById("dashboard-scanner-confidence-detail");
const quickDevWorkoutBtn = document.getElementById("dev-quick-add-btn");
const devModal = document.getElementById("dev-modal");
const closeDevModalBtn = document.getElementById("close-dev-modal-btn");
const devWorkoutForm = document.getElementById("dev-workout-form");
const workoutHistoryList = document.getElementById("workout-history-list");
const mealSurveyModal = document.getElementById("meal-survey-modal");
const mealSurveyForm = document.getElementById("meal-survey-form");
const mealModal = document.getElementById("meal-modal");
const mealHistoryModal = document.getElementById("meal-history-modal");
const devMealModal = document.getElementById("dev-meal-modal");
const mealForm = document.getElementById("meal-form");
const mealHistoryList = document.getElementById("meal-history-list");
const mealPresetSelect = document.getElementById("meal-preset");
const mealPresetList = document.getElementById("meal-preset-list");
const mealDailyCalories = document.getElementById("meal-daily-calories");
const mealDailyCaloriesGoal = document.getElementById("meal-daily-calories-goal");
const mealDailyProtein = document.getElementById("meal-daily-protein");
const mealDailyProteinGoal = document.getElementById("meal-daily-protein-goal");
const mealDailyCarbs = document.getElementById("meal-daily-carbs");
const mealDailyCarbsGoal = document.getElementById("meal-daily-carbs-goal");
const mealDailyFat = document.getElementById("meal-daily-fat");
const mealDailyFatGoal = document.getElementById("meal-daily-fat-goal");
const mealDailySummary = document.getElementById("meal-daily-summary");
const mealYearlySummary = document.getElementById("meal-yearly-summary");
const foodImageInput = document.getElementById("food-image-input");
const scanFoodBtn = document.getElementById("scanner-submit");
const foodScanOutput = document.getElementById("food-scan-output");
const addScannedMealBtn = document.getElementById("add-scanned-meal-btn");
const popup = document.getElementById("meal-added-popup");


const openMealModalBtn = document.getElementById("open-meal-modal-btn");
const openMealHistoryBtn = document.getElementById("open-meal-history-btn");
const openDevMealModalBtn = document.getElementById("open-dev-meal-modal-btn");
const closeMealModalBtn = document.getElementById("close-meal-modal-btn");
const closeMealHistoryBtn = document.getElementById("close-meal-history-btn");
const closeDevMealModalBtn = document.getElementById("close-dev-meal-modal-btn");
const devMealForm = document.getElementById("dev-meal-form");

const mbMenuToggle = document.getElementById("mbmenu");
const mobileSidemenu = document.getElementById("mobile-sidemenu");
const dashboardShell = document.getElementById("dashboard-shell");
const topNav = document.querySelector("nav.site-nav");


function updateDashboardNavOnScroll() {
    if (!topNav) return;

    const currentScrollTop = window.scrollY || window.pageYOffset || 0;
    if (currentScrollTop < 20) {
        topNav.classList.remove("nav-hidden");
        topNav.classList.add("nav-visible");
    } else if (currentScrollTop > 80) {
        topNav.classList.add("nav-hidden");
        topNav.classList.remove("nav-visible");
    }
}

let userFitnessData = {
    hasCompletedSurvey: false,
    primaryGoal: "Weight Loss",
    timeGoal: 150,
    timeLogged: 0,
    calorieGoal: 2000,
    caloriesBurned: 0,
    daysTarget: 5,
    daysLogged: 0,
    workoutCount: 0,
    streak: 0,
    weeklyStreak: 0,
    lastWorkoutDate: null,
    lastWorkoutSummary: "No workouts logged yet.",
    workoutHistory: [],
    hasCompletedMealSurvey: false,
    mealCalorieGoal: 2000,
    mealProteinGoal: 180,
    mealCarbGoal: 220,
    mealFatGoal: 70,
    meals: [],
    mealHistory: []
};

let activeMealId = null;

let lastScannedMeal = null;

const mealPresets = [
    { name: "Greek Yogurt Bowl", calories: 380, protein: 28, carbs: 42, fat: 14, notes: "High protein breakfast" },
    { name: "Turkey Wrap", calories: 420, protein: 32, carbs: 41, fat: 16, notes: "Balanced lunch" },
    { name: "Salmon Quinoa Plate", calories: 520, protein: 35, carbs: 40, fat: 22, notes: "Protein-rich dinner" },
    { name: "Protein Smoothie", calories: 310, protein: 24, carbs: 35, fat: 9, notes: "Quick snack" },
    { name: "Chicken Rice Bowl", calories: 480, protein: 37, carbs: 48, fat: 15, notes: "Great post-workout meal" },
    { name: "Avocado Toast", calories: 340, protein: 12, carbs: 30, fat: 18, notes: "Light breakfast" }
];

function normalizeDate(d) {
    let dateObj;

    if (d instanceof Date) {
        dateObj = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    } else if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
        const [year, month, day] = d.split("-").map(Number);
        dateObj = new Date(year, month - 1, day);
    } else {
        dateObj = new Date(d);
    }

    const y = dateObj.getFullYear();
    let m = String(dateObj.getMonth() + 1);
    if (m.length < 2) m = "0" + m;
    let day = String(dateObj.getDate());
    if (day.length < 2) day = "0" + day;
    return y + "-" + m + "-" + day;
}

function formatDate(dateKey) {
    const parts = dateKey.split("-");
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const dateObj = new Date(y, m, d);
    return dateObj.toLocaleDateString();
}

if (mbMenuToggle && mobileSidemenu) {
    mbMenuToggle.addEventListener("click", function() {
        mobileSidemenu.classList.toggle("hidden");
    });
}

if (groceryForm) {
    groceryForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const nutrients = document.getElementById("grocery-nutrients").value.trim();
        const goals = document.getElementById("grocery-goals").value.trim();

        if (!nutrients || !goals) return;

        if (generateGroceryBtn) generateGroceryBtn.disabled = true;
        if (groceryStatusTag) groceryStatusTag.textContent = "Generating...";
        if (groceryOutput) {
            groceryOutput.innerHTML = '<p><em>Generating tailored grocery list...</em></p>';
        }

        try {
            const response = await fetch(getApiUrl("/api/generate-grocery"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nutrients: nutrients,
                    goals: goals
                })
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.error || data.details || `Server returned status ${response.status}`);
            }

            const resultText = data.text || "No response text received.";

            if (groceryOutput) {
                groceryOutput.innerHTML = resultText
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/^\s*[-*]\s+(.*$)/gim, '• $1')
                    .replace(/\n/g, '<br>');
            }

            if (groceryStatusTag) groceryStatusTag.textContent = "Generated";
        } catch (err) {
            console.error("Error generating grocery list:", err);
            if (groceryOutput) {
                groceryOutput.innerHTML = `<p style="color:red;">${err.message || "Failed to generate grocery list."}</p>`;
            }
            if (groceryStatusTag) groceryStatusTag.textContent = "Error";
        } finally {
            if (generateGroceryBtn) generateGroceryBtn.disabled = false;
        }
    });
}

function getStreakMetrics() {
    const uniqueDates = [];
    for (let i = 0; i < userFitnessData.workoutHistory.length; i++) {
        const dt = userFitnessData.workoutHistory[i].dateKey;
        if (uniqueDates.indexOf(dt) === -1) {
            uniqueDates.push(dt);
        }
    }
    uniqueDates.sort();

    const today = new Date();
    let dailyStreak = 0;
    const cursor = new Date(today);

    while (true) {
        const key = normalizeDate(cursor);
        let found = false;
        for (let i = 0; i < uniqueDates.length; i++) {
            if (uniqueDates[i] === key) {
                found = true;
                break;
            }
        }
        if (found) {
            dailyStreak = dailyStreak + 1;
            cursor.setDate(cursor.getDate() - 1);
        } else {
            break;
        }
    }

    let weeklyStreak = 0;
    const weekCursor = new Date(today);
    while (true) {
        const startOfWeek = new Date(weekCursor);
        const dayOffset = startOfWeek.getDay() === 0 ? 6 : startOfWeek.getDay() - 1;
        startOfWeek.setDate(startOfWeek.getDate() - dayOffset);
        
        let sm = String(startOfWeek.getMonth() + 1);
        if (sm.length < 2) sm = "0" + sm;
        let sd = String(startOfWeek.getDate());
        if (sd.length < 2) sd = "0" + sd;
        const weekKey = startOfWeek.getFullYear() + "-" + sm + "-" + sd;

        let weekWorkoutsCount = 0;
        for (let i = 0; i < uniqueDates.length; i++) {
            if (uniqueDates[i] >= weekKey && uniqueDates[i] <= normalizeDate(weekCursor)) {
                weekWorkoutsCount++;
            }
        }

        if (weekWorkoutsCount > 0) {
            weeklyStreak++;
            weekCursor.setDate(weekCursor.getDate() - 7);
        } else {
            break;
        }
    }

    return { dailyStreak: dailyStreak, weeklyStreak: weeklyStreak };
}

function renderWorkoutHistory() {
    if (!workoutHistoryList) return;

    if (userFitnessData.workoutHistory.length === 0) {
        workoutHistoryList.innerHTML = '<li class="history-empty">No past workouts yet. Use the dev panel or log modal to add sessions.</li>';
        return;
    }

    let htmlStr = "";
    for (let i = 0; i < userFitnessData.workoutHistory.length; i++) {
        const item = userFitnessData.workoutHistory[i];
        let notesText = item.notes || "No notes added.";
        htmlStr += '<li class="history-item"><div><strong>' + item.name + '</strong><span> • ' + item.type + ' • ' + item.duration + ' min • ' + item.calories + ' kcal</span><p>' + notesText + '</p></div><span>' + formatDate(item.dateKey) + '</span></li>';
    }
    workoutHistoryList.innerHTML = htmlStr;
}

function updateActiveNavState(viewName) {
    if (!dashboardShell) return;
    const targetView = viewName || "dashboard";
    document.querySelectorAll('[data-view]').forEach(function(trigger) {
        const triggerView = trigger.getAttribute("data-view") || "dashboard";
        trigger.classList.toggle("active-nav-link", triggerView === targetView);
    });
}

function showView(viewName) {
    if (!dashboardShell) return;
    updateActiveNavState(viewName);

    for (let i = 0; i < viewPanels.length; i++) {
        const panel = viewPanels[i];
        const isActive = panel.id === "view-" + viewName;
        if (isActive) {
            panel.classList.remove("hidden");
            panel.setAttribute("aria-hidden", "false");
        } else {
            panel.classList.add("hidden");
            panel.setAttribute("aria-hidden", "true");
        }
    }

    if (mobileSidemenu) {
        mobileSidemenu.classList.add("hidden");
    }

    if (viewName === "dashboard" || viewName === "meals") {
        refreshMealAndDashboardUI();
    }

    if (viewName === "workout" && !userFitnessData.hasCompletedSurvey) {
        const sModal = document.getElementById("survey-modal");
        if (sModal) sModal.classList.remove("hidden");
    }

    if (viewName === "meals" && !userFitnessData.hasCompletedMealSurvey) {
        if (mealSurveyModal) mealSurveyModal.classList.remove("hidden");
    }
}

function renderWorkoutSummary() {
    if (dashboardWorkoutsCount) {
        dashboardWorkoutsCount.textContent = userFitnessData.workoutCount;
    }
    if (dashboardWorkoutSummary) {
        dashboardWorkoutSummary.textContent = userFitnessData.lastWorkoutSummary || "No workouts logged yet.";
    }
}

function getTodaysMealTotals() {
    const todayKey = normalizeDate(new Date());
    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    for (let i = 0; i < userFitnessData.meals.length; i++) {
        const entry = userFitnessData.meals[i];
        if (entry.dateKey === todayKey) {
            totals.calories += entry.calories;
            totals.protein += entry.protein;
            totals.carbs += entry.carbs;
            totals.fat += entry.fat;
        }
    }
    return totals;
}

function getYearlyMealTotals() {
    const currentYear = new Date().getFullYear();
    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    for (let i = 0; i < userFitnessData.meals.length; i++) {
        const entry = userFitnessData.meals[i];
        if (entry.dateKey.indexOf(currentYear + "-") === 0) {
            totals.calories += entry.calories;
            totals.protein += entry.protein;
            totals.carbs += entry.carbs;
            totals.fat += entry.fat;
        }
    }
    return totals;
}

function applyPresetToMealForm(preset) {
    const nameField = document.getElementById("meal-name");
    const caloriesField = document.getElementById("meal-calories");
    const proteinField = document.getElementById("meal-protein");
    const carbsField = document.getElementById("meal-carbs");
    const fatField = document.getElementById("meal-fat");

    if (!preset) {
        if (nameField) nameField.value = "";
        if (caloriesField) caloriesField.value = "";
        if (proteinField) proteinField.value = "";
        if (carbsField) carbsField.value = "";
        if (fatField) fatField.value = "";
        return;
    }

    if (nameField) nameField.value = preset.name;
    if (caloriesField) caloriesField.value = preset.calories;
    if (proteinField) proteinField.value = preset.protein;
    if (carbsField) carbsField.value = preset.carbs;
    if (fatField) fatField.value = preset.fat;
}

function refreshMealAndDashboardUI() {
    renderMealPresets();
    renderMealHistory();
    renderMealDashboard();
    renderDashboardSummaryCards();
    updateDashboardStats();
}

function renderMealPresets() {
    if (!mealPresetSelect && !mealPresetList) return;

    if (mealPresetSelect && mealPresetSelect.options.length <= 1) {
        let opts = '<option value="">Select a preset</option>';
        for (let i = 0; i < mealPresets.length; i++) {
            opts += '<option value="' + mealPresets[i].name + '">' + mealPresets[i].name + '</option>';
        }
        mealPresetSelect.innerHTML = opts;
        mealPresetSelect.addEventListener("change", function() {
            const selectedPresetName = mealPresetSelect.value;
            let preset = null;
            for (let i = 0; i < mealPresets.length; i++) {
                if (mealPresets[i].name === selectedPresetName) {
                    preset = mealPresets[i];
                    break;
                }
            }
            applyPresetToMealForm(preset);
        });
    }

    if (mealPresetList) {
        let listHtml = "";
        for (let i = 0; i < mealPresets.length; i++) {
            const p = mealPresets[i];
            listHtml += '<li class="history-item"><div><strong>' + p.name + '</strong><p>' + p.notes + '</p></div><span>' + p.calories + ' kcal • ' + p.protein + 'g protein</span></li>';
        }
        mealPresetList.innerHTML = listHtml;
    }
}

function renderMealHistory() {
    if (!mealHistoryList) return;

    if (userFitnessData.mealHistory.length === 0) {
        mealHistoryList.innerHTML = '<li class="history-empty">No meals logged yet.</li>';
        return;
    }

    let htmlStr = "";
    for (let i = 0; i < userFitnessData.mealHistory.length; i++) {
        const entry = userFitnessData.mealHistory[i];
        let notesText = entry.notes || "No notes added.";

        htmlStr += '<li class="history-item"><div><strong>' + entry.name + '</strong><span> • ' + entry.calories + ' kcal • ' + entry.protein + 'g protein</span><p>' + notesText + '</p></div><div><button class="ghost-button" type="button" data-edit-meal-id="' + entry.id + '">Edit</button><span>' + formatDate(entry.dateKey) + '</span></div></li>';
    }
    mealHistoryList.innerHTML = htmlStr;

    const editBtns = document.querySelectorAll('[data-edit-meal-id]');
    for (let i = 0; i < editBtns.length; i++) {
        editBtns[i].addEventListener("click", function() {
            const mealId = Number(this.getAttribute("data-edit-meal-id"));
            let entry = userFitnessData.mealHistory.find(j => j.id === mealId);
            if (!entry) return;
            activeMealId = mealId;
            
            const modalTitle = document.getElementById("meal-modal-title");
            if (modalTitle) modalTitle.textContent = "Edit Meal";
            
            document.getElementById("meal-name").value = entry.name;
            document.getElementById("meal-calories").value = entry.calories;
            document.getElementById("meal-protein").value = entry.protein;
            document.getElementById("meal-carbs").value = entry.carbs;
            document.getElementById("meal-fat").value = entry.fat;
            document.getElementById("meal-notes").value = entry.notes || "";
            document.getElementById("meal-date").value = entry.dateKey;
            if (document.getElementById("meal-preset")) document.getElementById("meal-preset").value = entry.name;
            
            closeMealHistoryModal();
            openMealModal();
        });
    }
}

function getMealsForCurrentWeek() {
    const today = new Date();
    const startOfWeek = new Date(today);
    const dayOffset = startOfWeek.getDay() === 0 ? -6 : 1 - startOfWeek.getDay();
    startOfWeek.setDate(today.getDate() + dayOffset);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const result = [];
    for (let i = 0; i < userFitnessData.meals.length; i++) {
        const entry = userFitnessData.meals[i];
        const entryDate = new Date(entry.dateKey + "T00:00:00");
        if (entryDate >= startOfWeek && entryDate <= endOfWeek) {
            result.push(entry);
        }
    }
    return result;
}

function renderDashboardSummaryCards() {
    const weekMeals = getMealsForCurrentWeek();
    const weeklyTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    for (let i = 0; i < weekMeals.length; i++) {
        weeklyTotals.calories += weekMeals[i].calories;
        weeklyTotals.protein += weekMeals[i].protein;
        weeklyTotals.carbs += weekMeals[i].carbs;
        weeklyTotals.fat += weekMeals[i].fat;
    }

    const nutrientTargets = [
        { metric: "calories", total: weeklyTotals.calories, goal: Math.max(1, userFitnessData.mealCalorieGoal * 7) },
        { metric: "protein", total: weeklyTotals.protein, goal: Math.max(1, userFitnessData.mealProteinGoal * 7) },
        { metric: "carbs", total: weeklyTotals.carbs, goal: Math.max(1, userFitnessData.mealCarbGoal * 7) },
        { metric: "fat", total: weeklyTotals.fat, goal: Math.max(1, userFitnessData.mealFatGoal * 7) }
    ];

    let metTargets = 0;
    for (let i = 0; i < nutrientTargets.length; i++) {
        if (nutrientTargets[i].total >= nutrientTargets[i].goal) {
            metTargets++;
        }
    }

    const progressPercent = weekMeals.length > 0 ? Math.round((metTargets / nutrientTargets.length) * 100) : 0;

    if (dashboardGroceryProgress) dashboardGroceryProgress.textContent = progressPercent + "%";
    if (dashboardGroceryProgressDetail) {
        dashboardGroceryProgressDetail.textContent = weekMeals.length > 0 ? metTargets + " of 4 nutrition targets met this week" : "No meal data yet.";
    }

    if (dashboardMealUsage) {
        const count = weekMeals.length;
        dashboardMealUsage.textContent = count + " meal" + (count === 1 ? "" : "s");
    }

    if (dashboardMealUsageDetail) {
        const count = weekMeals.length;
        dashboardMealUsageDetail.textContent = count > 0 ? count + " meal" + (count === 1 ? "" : "s") + " logged this week" : "No meals logged this week";
    }

    if (dashboardScannerConfidence) {
        dashboardScannerConfidence.textContent = weekMeals.length > 0 ? "Ready" : "No scan data";
    }

    if (dashboardScannerConfidenceDetail) {
        dashboardScannerConfidenceDetail.textContent = weekMeals.length > 0 ? "Meal intake is being tracked" : "Scanner data will appear here";
    }
}

function renderMealDashboard() {
    const totals = getTodaysMealTotals();
    
    if (mealDailyCalories) mealDailyCalories.textContent = totals.calories + " kcal";
    if (mealDailyCaloriesGoal) {
        const remaining = Math.max(0, userFitnessData.mealCalorieGoal - totals.calories);
        mealDailyCaloriesGoal.textContent = remaining + " kcal remaining";
    }

    if (mealDailyProtein) mealDailyProtein.textContent = totals.protein + "g";
    if (mealDailyProteinGoal) {
        const remaining = Math.max(0, userFitnessData.mealProteinGoal - totals.protein);
        mealDailyProteinGoal.textContent = remaining + "g remaining";
    }

    if (mealDailyCarbs) mealDailyCarbs.textContent = totals.carbs + "g";
    if (mealDailyCarbsGoal) {
        const remaining = Math.max(0, userFitnessData.mealCarbGoal - totals.carbs);
        mealDailyCarbsGoal.textContent = remaining + "g remaining";
    }

    if (mealDailyFat) mealDailyFat.textContent = totals.fat + "g";
    if (mealDailyFatGoal) {
        const remaining = Math.max(0, userFitnessData.mealFatGoal - totals.fat);
        mealDailyFatGoal.textContent = remaining + "g remaining";
    }

    if (mealDailySummary) {
        mealDailySummary.textContent = totals.calories > 0 ? totals.calories + " kcal • " + totals.protein + "g protein • " + totals.carbs + "g carbs • " + totals.fat + "g fat" : "No meals logged yet.";
    }

    const yearlyTotals = getYearlyMealTotals();
    if (mealYearlySummary) {
        mealYearlySummary.textContent = yearlyTotals.calories + " kcal logged this year.";
    }

    const weekMeals = getMealsForCurrentWeek();
    const weeklyTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    for (let i = 0; i < weekMeals.length; i++) {
        weeklyTotals.calories += weekMeals[i].calories;
        weeklyTotals.protein += weekMeals[i].protein;
        weeklyTotals.carbs += weekMeals[i].carbs;
        weeklyTotals.fat += weekMeals[i].fat;
    }

    const weeklyTargets = {
        calories: Math.max(1, userFitnessData.mealCalorieGoal * 7),
        protein: Math.max(1, userFitnessData.mealProteinGoal * 7),
        carbs: Math.max(1, userFitnessData.mealCarbGoal * 7),
        fat: Math.max(1, userFitnessData.mealFatGoal * 7)
    };

    const progressMap = [
        { goal: weeklyTargets.calories, total: weeklyTotals.calories, label: dashboardCaloriesProgress, bar: dashboardCaloriesBar },
        { goal: weeklyTargets.protein, total: weeklyTotals.protein, label: dashboardProteinProgress, bar: dashboardProteinBar },
        { goal: weeklyTargets.carbs, total: weeklyTotals.carbs, label: dashboardCarbsProgress, bar: dashboardCarbsBar },
        { goal: weeklyTargets.fat, total: weeklyTotals.fat, label: dashboardFatProgress, bar: dashboardFatBar }
    ];

    for (let i = 0; i < progressMap.length; i++) {
        const item = progressMap[i];
        const percent = item.goal > 0 ? Math.min(100, Math.round((item.total / item.goal) * 100)) : 0;
        if (item.label) item.label.textContent = percent + "%";
        if (item.bar) item.bar.style.width = percent + "%";
    }

    if (dashboardPlannedMeals) {
        let plannedHtml = "";
        const limit = mealPresets.length < 3 ? mealPresets.length : 3;
        for (let i = 0; i < limit; i++) {
            plannedHtml += "<li>" + mealPresets[i].name + " • " + mealPresets[i].calories + " kcal</li>";
        }
        dashboardPlannedMeals.innerHTML = plannedHtml;
    }

    if (dashboardMealGoalSummary) {
        dashboardMealGoalSummary.textContent = "This week targets: " + userFitnessData.mealCalorieGoal * 7 + " kcal • " + userFitnessData.mealProteinGoal * 7 + "g protein • " + userFitnessData.mealCarbGoal * 7 + "g carbs • " + userFitnessData.mealFatGoal * 7 + "g fat";
    }

    renderDashboardSummaryCards();
}

function updateDashboardStats() {
    const goalSubtitle = document.getElementById("user-goal-subtitle");
    if (goalSubtitle) {
        goalSubtitle.textContent = "Adjusted for: " + userFitnessData.primaryGoal;
    }

    const timeRemaining = userFitnessData.timeGoal - userFitnessData.timeLogged;
    const timeEl = document.getElementById("stat-time");
    if (timeEl) timeEl.textContent = userFitnessData.timeLogged + " Mins";

    const timeGoalEl = document.getElementById("stat-time-goal");
    if (timeGoalEl) {
        timeGoalEl.textContent = timeRemaining > 0 ? timeRemaining + " mins away from target (" + userFitnessData.timeGoal + "m goal)" : "Goal reached! 🎉";
    }

    const caloriesRemaining = userFitnessData.calorieGoal - userFitnessData.caloriesBurned;
    const caloriesEl = document.getElementById("stat-calories");
    if (caloriesEl) caloriesEl.textContent = userFitnessData.caloriesBurned.toLocaleString() + " kcal";

    const caloriesGoalEl = document.getElementById("stat-calories-goal");
    if (caloriesGoalEl) {
        caloriesGoalEl.textContent = caloriesRemaining > 0 ? caloriesRemaining.toLocaleString() + " kcal away from goal (" + userFitnessData.calorieGoal.toLocaleString() + " target)" : "Goal reached! 🔥";
    }

    const daysEl = document.getElementById("stat-days");
    if (daysEl) daysEl.textContent = userFitnessData.daysLogged + " / " + userFitnessData.daysTarget + " Days";

    const daysGoalEl = document.getElementById("stat-days-goal");
    if (daysGoalEl) {
        const daysRemaining = userFitnessData.daysTarget - userFitnessData.daysLogged;
        daysGoalEl.textContent = daysRemaining > 0 ? daysRemaining + " day" + (daysRemaining === 1 ? "" : "s") + " away from target" : "Goal reached! 🎉";
    }

    const streakMetrics = getStreakMetrics();
    userFitnessData.streak = streakMetrics.dailyStreak;
    userFitnessData.weeklyStreak = streakMetrics.weeklyStreak;

    const streakEl = document.getElementById("stat-streak");
    if (streakEl) streakEl.textContent = userFitnessData.streak + " Days";

    const streakDetailEl = document.getElementById("stat-streak-detail");
    if (streakDetailEl) streakDetailEl.textContent = "Daily streak • weekly streak " + userFitnessData.weeklyStreak;

    renderWorkoutSummary();
    renderWorkoutHistory();
    renderMealDashboard();
}

function openLogModal() {
    if (logModal) logModal.classList.remove("hidden");
    const nameField = document.getElementById("log-name");
    if (nameField) nameField.focus();
}

function openDevModal() {
    if (devModal) devModal.classList.remove("hidden");
    const nameField = document.getElementById("dev-name");
    if (nameField) nameField.focus();
}

function closeLogModal() {
    if (logModal) logModal.classList.add("hidden");
    const lForm = document.getElementById("log-workout-form");
    if (lForm) lForm.reset();
}

function openMealModal() {
    if (mealModal) mealModal.classList.remove("hidden");
    const dateInput = document.getElementById("meal-date");
    if (dateInput && !dateInput.value) {
        dateInput.value = normalizeDate(new Date());
    }
    const nameField = document.getElementById("meal-name");
    if (nameField) nameField.focus();
}

function closeMealModal() {
    if (mealModal) mealModal.classList.add("hidden");
    if (mealForm) mealForm.reset();
    activeMealId = null;
    const modalTitle = document.getElementById("meal-modal-title");
    if (modalTitle) modalTitle.textContent = "Log a Meal";
}

function openMealHistoryModal() {
    if (mealHistoryModal) mealHistoryModal.classList.remove("hidden");
    renderMealHistory();
}

function closeMealHistoryModal() {
    if (mealHistoryModal) mealHistoryModal.classList.add("hidden");
}

function openDevMealModal() {
    if (devMealModal) devMealModal.classList.remove("hidden");
    const devDateInput = document.getElementById("dev-meal-date");
    if (devDateInput && !devDateInput.value) {
        devDateInput.value = normalizeDate(new Date());
    }
    const nameField = document.getElementById("dev-meal-name");
    if (nameField) nameField.focus();
}

function closeDevMealModal() {
    if (devMealModal) devMealModal.classList.add("hidden");
    const devMealFormEl = document.getElementById("dev-meal-form");
    if (devMealFormEl) devMealFormEl.reset();
}

function closeDevModal() {
    if (devModal) devModal.classList.add("hidden");
    if (devWorkoutForm) devWorkoutForm.reset();
}

function addMealEntry(mealObj) {
    const id = activeMealId ? activeMealId : Date.now();
    const name = mealObj.name || "Custom Meal";
    const calories = parseInt(mealObj.calories, 10) || 0;
    const protein = parseInt(mealObj.protein, 10) || 0;
    const carbs = parseInt(mealObj.carbs, 10) || 0;
    const fat = parseInt(mealObj.fat, 10) || 0;
    
    const rawDate = mealObj.dateKey || mealObj.date || new Date();
    const dateKey = normalizeDate(rawDate);
    const notes = mealObj.notes || "";

    const entry = { id, name, calories, protein, carbs, fat, dateKey, notes };

    if (activeMealId) {
        const index = userFitnessData.mealHistory.findIndex(m => m.id === activeMealId);
        if (index !== -1) userFitnessData.mealHistory[index] = entry;
        const mealIndex = userFitnessData.meals.findIndex(m => m.id === activeMealId);
        if (mealIndex !== -1) userFitnessData.meals[mealIndex] = entry;
    } else {
        userFitnessData.mealHistory.unshift(entry);
        userFitnessData.meals.unshift(entry);
    }

    activeMealId = null;
    refreshMealAndDashboardUI();
}

function resetWorkoutTracking() {
    userFitnessData.timeLogged = 0;
    userFitnessData.caloriesBurned = 0;
    userFitnessData.daysLogged = 0;
    userFitnessData.workoutCount = 0;
    userFitnessData.streak = 0;
    userFitnessData.weeklyStreak = 0;
    userFitnessData.lastWorkoutDate = null;
    userFitnessData.lastWorkoutSummary = "No workouts logged yet.";
    userFitnessData.workoutHistory = [];
}

function addWorkoutEntry(dataObj) {
    const name = dataObj.name;
    const type = dataObj.type;
    const duration = dataObj.duration;
    const calories = dataObj.calories;
    const intensity = dataObj.intensity;
    const notes = dataObj.notes;
    const dateKey = dataObj.dateKey;
    let source = dataObj.source || "manual";

    const normalizedDateKey = normalizeDate(dateKey || new Date());
    const entry = {
        name: name,
        type: type,
        duration: duration,
        calories: calories,
        intensity: intensity,
        notes: notes,
        dateKey: normalizedDateKey,
        source: source
    };

    userFitnessData.workoutHistory.unshift(entry);
    userFitnessData.workoutCount += 1;
    userFitnessData.timeLogged += duration;
    userFitnessData.caloriesBurned += calories;

    const tempDates = [];
    for (let i = 0; i < userFitnessData.workoutHistory.length; i++) {
        const dk = userFitnessData.workoutHistory[i].dateKey;
        if (tempDates.indexOf(dk) === -1) {
            tempDates.push(dk);
        }
    }
    userFitnessData.daysLogged = tempDates.length;
    userFitnessData.lastWorkoutDate = normalizedDateKey;
    userFitnessData.lastWorkoutSummary = name + " • " + duration + "m • " + calories + " kcal • " + intensity;

    updateDashboardStats();
}

document.addEventListener("click", function(event) {
    const trigger = event.target.closest("[data-view]");
    if (!trigger) return;

    const viewName = trigger.getAttribute("data-view");
    if (!viewName) return;

    event.preventDefault();
    showView(viewName);
});

if (dashboardShell) {
    showView("dashboard");
}

const surveyForm = document.getElementById("survey-form");
if (surveyForm) {
    surveyForm.addEventListener("submit", function(event) {
        event.preventDefault();
        userFitnessData.hasCompletedSurvey = true;
        userFitnessData.primaryGoal = document.getElementById("survey-primary-goal").value;
        userFitnessData.timeGoal = parseInt(document.getElementById("survey-time-target").value, 10);
        userFitnessData.calorieGoal = parseInt(document.getElementById("survey-calorie-target").value, 10);
        resetWorkoutTracking();

        const sModal = document.getElementById("survey-modal");
        if (sModal) sModal.classList.add("hidden");

        updateDashboardStats();
        showView("workout");
    });
}

if (mealSurveyForm) {
    mealSurveyForm.addEventListener("submit", function(event) {
        event.preventDefault();
        userFitnessData.hasCompletedMealSurvey = true;
        userFitnessData.mealCalorieGoal = parseInt(document.getElementById("meal-survey-calories").value, 10) || 2000;
        userFitnessData.mealProteinGoal = parseInt(document.getElementById("meal-survey-protein").value, 10) || 180;
        userFitnessData.mealCarbGoal = parseInt(document.getElementById("meal-survey-carbs").value, 10) || 220;
        userFitnessData.mealFatGoal = parseInt(document.getElementById("meal-survey-fat").value, 10) || 70;

        if (mealSurveyModal) mealSurveyModal.classList.add("hidden");

        refreshMealAndDashboardUI();
        showView("meals");
    });
}

if (workoutForm) {
    workoutForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const description = document.getElementById("workout-description").value.trim();
        const generateWorkoutBtn = document.getElementById("generate-workout-btn");

        if (!description) return;

        if (generateWorkoutBtn) generateWorkoutBtn.disabled = true;
        if (workoutOutput) {
            workoutOutput.innerHTML = '<p><em>Generating tailored AI workout...</em></p>';
        }

        try {
            const response = await fetch(getApiUrl("/api/generate-workout"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    fitnessLevel: userFitnessData.primaryGoal || "General Fitness",
                    goals: description,
                    description: description
                })
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.error || data.details || `Server returned status ${response.status}`);
            }

            const resultText = data.text || "No response text received.";

            if (workoutOutput) {
                const simpleText = (resultText || "")
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/^\s*[-*]\s+(.*$)/gim, '<li>$1</li>')
                    .replace(/\n/g, '');

                workoutOutput.innerHTML = '<ul class="feature-output-list">' + simpleText + '</ul>';
            }
        } catch (err) {
            console.error("Error generating workout:", err);
            if (workoutOutput) {
                workoutOutput.innerHTML = `<p style="color:red;">${err.message || "Failed to generate workout."}</p>`;
            }
        } finally {
            if (generateWorkoutBtn) generateWorkoutBtn.disabled = false;
        }
    });
}

const logWorkoutForm = document.getElementById("log-workout-form");

if (openLogModalBtn) {
    openLogModalBtn.addEventListener("click", function(event) {
        event.preventDefault();
        openLogModal();
    });
}

if (logBtn) {
    logBtn.addEventListener("click", function(event) {
        event.preventDefault();
        openLogModal();
    });
}

if (closeLogModalBtn) {
    closeLogModalBtn.addEventListener("click", function(event) {
        event.preventDefault();
        closeLogModal();
    });
}

if (logModal) {
    logModal.addEventListener("click", function(event) {
        if (event.target === logModal) closeLogModal();
    });
}

if (quickDevWorkoutBtn) {
    quickDevWorkoutBtn.addEventListener("click", function(event) {
        event.preventDefault();
        openDevModal();
    });
}

if (closeDevModalBtn) {
    closeDevModalBtn.addEventListener("click", function(event) {
        event.preventDefault();
        closeDevModal();
    });
}

if (devModal) {
    devModal.addEventListener("click", function(event) {
        if (event.target === devModal) closeDevModal();
    });
}

if (devWorkoutForm) {
    devWorkoutForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const dateVal = document.getElementById("dev-date").value;
        const nameVal = document.getElementById("dev-name").value.trim() || "Test Workout";
        const durationVal = parseInt(document.getElementById("dev-duration").value, 10) || 30;
        const caloriesVal = parseInt(document.getElementById("dev-calories").value, 10) || 200;

        addWorkoutEntry({
            name: nameVal,
            type: "Test Routine",
            duration: durationVal,
            calories: caloriesVal,
            intensity: "Moderate",
            notes: "Developer test session",
            dateKey: dateVal,
            source: "dev-modal"
        });

        closeDevModal();
    });
}

if (logWorkoutForm) {
    logWorkoutForm.addEventListener("submit", function(event) {
        event.preventDefault();

        let workoutName = document.getElementById("log-name").value.trim() || "Workout";
        const workoutType = document.getElementById("log-type").value;
        const durationInput = parseInt(document.getElementById("log-duration").value, 10);
        const caloriesInput = parseInt(document.getElementById("log-calories").value, 10);
        const intensity = document.getElementById("log-intensity").value;
        const notes = document.getElementById("log-notes").value.trim();
        const dateInput = document.getElementById("log-date").value;

        addWorkoutEntry({
            name: workoutName,
            type: workoutType,
            duration: isNaN(durationInput) ? 0 : durationInput,
            calories: isNaN(caloriesInput) ? 0 : caloriesInput,
            intensity: intensity,
            notes: notes,
            dateKey: dateInput,
            source: "log-modal"
        });

        closeLogModal();
    });
}

if (scanFoodBtn) {
    scanFoodBtn.addEventListener("click", async function (event) {
        event.preventDefault(); 
        
        const file = foodImageInput?.files?.[0];
        
        if (!file) {
            foodScanOutput.innerHTML = "<p style='color:red;'>Please select an image file to scan.</p>";
            return;
        }

        scanFoodBtn.disabled = true;
        foodScanOutput.innerHTML = "<p><em>Scanning food...</em></p>";
        const formData = new FormData();
        formData.append("image", file);

        try {
            const response = await fetch(getApiUrl("/api/scan-food"), {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Server returned status ${response.status}`);
            }

            const data = await response.json();
            foodScanOutput.innerHTML = [
                `<strong>Food:</strong> ${data.food}<br>`,
                `<strong>Confidence:</strong> ${(data.confidence * 100).toFixed(1)}%<br>`,
                `<strong>Calories:</strong> ${data.nutrition.calories} kcal<br>`,
                `<strong>Protein:</strong> ${data.nutrition.protein}g<br>`,
                `<strong>Carbs:</strong> ${data.nutrition.carbs}g<br>`,
                `<strong>Fat:</strong> ${data.nutrition.fat}g`
            ].join("");

            lastScannedMeal = data;
            addScannedMealBtn.classList.remove("hidden");

        } catch (err) {
            console.error("Food scan error:", err);
            foodScanOutput.innerHTML = "<p style='color:red;'>Failed to scan food image. Make sure backend is running on port 3000.</p>";
        } finally {
            scanFoodBtn.disabled = false;
        }
    });
}

if (openMealModalBtn) openMealModalBtn.addEventListener("click", openMealModal);
if (openMealHistoryBtn) openMealHistoryBtn.addEventListener("click", openMealHistoryModal);
if (openDevMealModalBtn) openDevMealModalBtn.addEventListener("click", openDevMealModal);
if (closeMealModalBtn) closeMealModalBtn.addEventListener("click", closeMealModal);
if (closeMealHistoryBtn) closeMealHistoryBtn.addEventListener("click", closeMealHistoryModal);
if (closeDevMealModalBtn) closeDevMealModalBtn.addEventListener("click", closeDevMealModal);

function showMealAddedPopup() {
    if (!popup) return;

    popup.classList.remove("hidden");
    popup.classList.add("show");

    if (popup.hideTimeoutId) {
        clearTimeout(popup.hideTimeoutId);
    }

    popup.hideTimeoutId = setTimeout(() => {
        popup.classList.remove("show");
        popup.classList.add("hidden");
    }, 2500);
}


if (addScannedMealBtn) {
    addScannedMealBtn.addEventListener("click", function () {
        if (!lastScannedMeal) return;
        const newMeal = {
            id: Date.now(),
            name: lastScannedMeal.food,
            calories: lastScannedMeal.nutrition.calories,
            protein: lastScannedMeal.nutrition.protein,
            carbs: lastScannedMeal.nutrition.carbs,
            fat: lastScannedMeal.nutrition.fat,
            notes: "Scanned meal",
            dateKey: normalizeDate(new Date())
        }
        userFitnessData.meals.push(newMeal)
        userFitnessData.mealHistory.push(newMeal)

        renderMealDashboard()
        renderMealHistory()
        renderDashboardSummaryCards()
        updateDashboardStats()
        showMealAddedPopup();

   
        addScannedMealBtn.classList.add("hidden");
        lastScannedMeal = null;
    })

}

if (mealModal) {
    mealModal.addEventListener("click", function(event) {
        if (event.target === mealModal) closeMealModal();
    });
}

if (mealHistoryModal) {
    mealHistoryModal.addEventListener("click", function(event) {
        if (event.target === mealHistoryModal) closeMealHistoryModal();
    });
}

if (devMealModal) {
    devMealModal.addEventListener("click", function(event) {
        if (event.target === devMealModal) closeDevMealModal();
    });
}

if (mealForm) {
    mealForm.addEventListener("submit", function(event) {
        event.preventDefault();
        addMealEntry({
            name: document.getElementById("meal-name").value.trim(),
            calories: document.getElementById("meal-calories").value,
            protein: document.getElementById("meal-protein").value,
            carbs: document.getElementById("meal-carbs").value,
            fat: document.getElementById("meal-fat").value,
            dateKey: document.getElementById("meal-date").value,
            notes: document.getElementById("meal-notes").value.trim()
        });
        closeMealModal();
    });
}

if (devMealForm) {
    devMealForm.addEventListener("submit", function(event) {
        event.preventDefault();
        addMealEntry({
            name: document.getElementById("dev-meal-name").value.trim(),
            calories: document.getElementById("dev-meal-calories").value,
            protein: document.getElementById("dev-meal-protein").value,
            carbs: document.getElementById("dev-meal-carbs").value,
            fat: document.getElementById("dev-meal-fat").value,
            dateKey: document.getElementById("dev-meal-date").value,
            notes: "Test meal entry"
        });
        closeDevMealModal();
    });
}

function checkScrollAnimations() {
    if (benefitBoxes) {
        const topPos = benefitBoxes.getBoundingClientRect().top;
        if (topPos < window.innerHeight - 50) {
            benefitBoxes.classList.add("scroll-activated");
        }
    }
    if (timelineSection) {
        const topPos = timelineSection.getBoundingClientRect().top;
        if (topPos < window.innerHeight - 50) {
            timelineSection.classList.add("scroll-activated");
        }
    }
}

window.addEventListener("scroll", checkScrollAnimations);
window.addEventListener("scroll", updateDashboardNavOnScroll);
window.addEventListener("DOMContentLoaded", function() {
    checkScrollAnimations();
    updateDashboardNavOnScroll();
});