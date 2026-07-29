const benefitBoxes = document.getElementById("benefits-section");
const timelineSection = document.getElementById("timeline");
const groceryForm = document.getElementById("grocery-form");
const groceryOutput = document.getElementById("grocery-output");
const workoutForm = document.getElementById("workout-form");
const workoutOutput = document.getElementById("workout-output");
const workoutTargetLabel = document.getElementById("workout-target-label");
const mealPreviewButton = document.getElementById("meal-preview");
const mealOutput = document.getElementById("meal-output");
const viewTriggers = document.querySelectorAll('[data-view]');
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

const firstDashboardAccessStorageKey = "healthsense-first-dashboard-access";
let isFirstDashboardAccess = false;
try {
    isFirstDashboardAccess = localStorage.getItem(firstDashboardAccessStorageKey) !== "complete";
} catch (e) {
    isFirstDashboardAccess = false;
}

function markFirstDashboardAccessComplete() {
    try {
        localStorage.setItem(firstDashboardAccessStorageKey, "complete");
    } catch (e) {}
}

let activeMealId = null;

const mealPresets = [
    { name: "Greek Yogurt Bowl", calories: 380, protein: 28, carbs: 42, fat: 14, notes: "High protein breakfast" },
    { name: "Turkey Wrap", calories: 420, protein: 32, carbs: 41, fat: 16, notes: "Balanced lunch" },
    { name: "Salmon Quinoa Plate", calories: 520, protein: 35, carbs: 40, fat: 22, notes: "Protein-rich dinner" },
    { name: "Protein Smoothie", calories: 310, protein: 24, carbs: 35, fat: 9, notes: "Quick snack" },
    { name: "Chicken Rice Bowl", calories: 480, protein: 37, carbs: 48, fat: 15, notes: "Great post-workout meal" },
    { name: "Avocado Toast", calories: 340, protein: 12, carbs: 30, fat: 18, notes: "Light breakfast" }
];

function normalizeDate(d) {
    const dateObj = new Date(d);
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

    return {
        dailyStreak: dailyStreak,
        weeklyStreak: weeklyStreak
    };
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
        let notesText = item.notes;
        if (!notesText) {
            notesText = "No notes added.";
        }
        htmlStr += '<li class="history-item"><div><strong>' + item.name + '</strong><span> • ' + item.type + ' • ' + item.duration + ' min • ' + item.calories + ' kcal</span><p>' + notesText + '</p></div><span>' + formatDate(item.dateKey) + '</span></li>';
    }
    workoutHistoryList.innerHTML = htmlStr;
}

function showView(viewName) {
    if (viewName === "workout" && !userFitnessData.hasCompletedSurvey) {
        const sModal = document.getElementById("survey-modal");
        if (sModal) sModal.classList.remove("hidden");
        return;
    }

    if (viewName === "meals" && !userFitnessData.hasCompletedMealSurvey) {
        if (mealSurveyModal) {
            mealSurveyModal.classList.remove("hidden");
        }
        return;
    }

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

    if (viewName === "dashboard" || viewName === "meals") {
        refreshMealAndDashboardUI();
    }
}

function renderWorkoutSummary() {
    if (dashboardWorkoutsCount) {
        dashboardWorkoutsCount.textContent = userFitnessData.workoutCount;
    }

    if (dashboardWorkoutSummary) {
        let summaryText = userFitnessData.lastWorkoutSummary;
        if (!summaryText) {
            summaryText = "No workouts logged yet.";
        }
        dashboardWorkoutSummary.textContent = summaryText;
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

function getMealDataFromForm() {
    let selectedPresetName = "";
    if (mealPresetSelect) selectedPresetName = mealPresetSelect.value;
    
    let preset = null;
    for (let i = 0; i < mealPresets.length; i++) {
        if (mealPresets[i].name === selectedPresetName) {
            preset = mealPresets[i];
            break;
        }
    }

    let nameVal = document.getElementById("meal-name").value.trim();
    if (!nameVal) {
        if (preset) {
            nameVal = preset.name;
        } else {
            nameVal = "Meal";
        }
    }

    let calVal = parseInt(document.getElementById("meal-calories").value, 10);
    if (isNaN(calVal)) calVal = preset ? preset.calories : 0;

    let proVal = parseInt(document.getElementById("meal-protein").value, 10);
    if (isNaN(proVal)) proVal = preset ? preset.protein : 0;

    let carbVal = parseInt(document.getElementById("meal-carbs").value, 10);
    if (isNaN(carbVal)) carbVal = preset ? preset.carbs : 0;

    let fatVal = parseInt(document.getElementById("meal-fat").value, 10);
    if (isNaN(fatVal)) fatVal = preset ? preset.fat : 0;

    const notesVal = document.getElementById("meal-notes").value.trim();
    let dateVal = document.getElementById("meal-date").value;
    if (!dateVal) dateVal = new Date();

    return {
        name: nameVal,
        calories: calVal,
        protein: proVal,
        carbs: carbVal,
        fat: fatVal,
        notes: notesVal,
        dateKey: normalizeDate(dateVal),
        source: "meal-modal"
    };
}

function refreshMealAndDashboardUI() {
    renderMealHistory();
    renderMealDashboard();
    renderDashboardSummaryCards();
    updateDashboardStats();
}

function persistMealEntry(mealData) {
    if (activeMealId) {
        let existingIndex = -1;
        for (let i = 0; i < userFitnessData.meals.length; i++) {
            if (userFitnessData.meals[i].id === activeMealId) {
                existingIndex = i;
                break;
            }
        }

        let existingHistoryIndex = -1;
        for (let i = 0; i < userFitnessData.mealHistory.length; i++) {
            if (userFitnessData.mealHistory[i].id === activeMealId) {
                existingHistoryIndex = i;
                break;
            }
        }

        if (existingIndex >= 0) {
            userFitnessData.meals[existingIndex] = Object.assign({}, userFitnessData.meals[existingIndex], mealData, { id: activeMealId });
        }
        if (existingHistoryIndex >= 0) {
            userFitnessData.mealHistory[existingHistoryIndex] = Object.assign({}, userFitnessData.mealHistory[existingHistoryIndex], mealData, { id: activeMealId });
        }
    } else {
        const newEntry = Object.assign({}, mealData, { id: Date.now() });
        userFitnessData.meals.unshift(newEntry);
        userFitnessData.mealHistory.unshift(newEntry);
    }

    refreshMealAndDashboardUI();
}

function renderMealPresets() {
    if (!mealPresetSelect && !mealPresetList) return;

    if (mealPresetSelect) {
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
        let notesText = entry.notes;
        if (!notesText) notesText = "No notes added.";

        htmlStr += '<li class="history-item"><div><strong>' + entry.name + '</strong><span> • ' + entry.calories + ' kcal • ' + entry.protein + 'g protein</span><p>' + notesText + '</p></div><div><button class="ghost-button" type="button" data-edit-meal-id="' + entry.id + '">Edit</button><span>' + formatDate(entry.dateKey) + '</span></div></li>';
    }
    mealHistoryList.innerHTML = htmlStr;

    const editBtns = document.querySelectorAll('[data-edit-meal-id]');
    for (let i = 0; i < editBtns.length; i++) {
        editBtns[i].addEventListener("click", function() {
            const mealId = Number(this.getAttribute("data-edit-meal-id"));
            let entry = null;
            for (let j = 0; j < userFitnessData.mealHistory.length; j++) {
                if (userFitnessData.mealHistory[j].id === mealId) {
                    entry = userFitnessData.mealHistory[j];
                    break;
                }
            }
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
            document.getElementById("meal-preset").value = entry.name;
            
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

    if (dashboardGroceryProgress) {
        dashboardGroceryProgress.textContent = progressPercent + "%";
    }

    if (dashboardGroceryProgressDetail) {
        if (weekMeals.length > 0) {
            dashboardGroceryProgressDetail.textContent = metTargets + " of 4 nutrition targets met this week";
        } else {
            dashboardGroceryProgressDetail.textContent = "No meal data yet.";
        }
    }

    if (dashboardMealUsage) {
        const count = weekMeals.length;
        const suffix = count === 1 ? "" : "s";
        dashboardMealUsage.textContent = count + " meal" + suffix;
    }

    if (dashboardMealUsageDetail) {
        const count = weekMeals.length;
        if (count > 0) {
            const suffix = count === 1 ? "" : "s";
            dashboardMealUsageDetail.textContent = count + " meal" + suffix + " logged this week";
        } else {
            dashboardMealUsageDetail.textContent = "No meals logged this week";
        }
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
    
    const mealDailyCaloriesEl = document.getElementById("meal-daily-calories");
    const mealDailyCaloriesGoalEl = document.getElementById("meal-daily-calories-goal");
    const mealDailyProteinEl = document.getElementById("meal-daily-protein");
    const mealDailyProteinGoalEl = document.getElementById("meal-daily-protein-goal");
    const mealDailyCarbsEl = document.getElementById("meal-daily-carbs");
    const mealDailyCarbsGoalEl = document.getElementById("meal-daily-carbs-goal");
    const mealDailyFatEl = document.getElementById("meal-daily-fat");
    const mealDailyFatGoalEl = document.getElementById("meal-daily-fat-goal");
    const mealDailySummaryEl = document.getElementById("meal-daily-summary");
    const mealYearlySummaryEl = document.getElementById("meal-yearly-summary");
    
    const dashboardCaloriesProgressEl = document.getElementById("dashboard-calories-progress");
    const dashboardProteinProgressEl = document.getElementById("dashboard-protein-progress");
    const dashboardCarbsProgressEl = document.getElementById("dashboard-carbs-progress");
    const dashboardFatProgressEl = document.getElementById("dashboard-fat-progress");
    
    const dashboardCaloriesBarEl = document.getElementById("dashboard-calories-bar");
    const dashboardProteinBarEl = document.getElementById("dashboard-protein-bar");
    const dashboardCarbsBarEl = document.getElementById("dashboard-carbs-bar");
    const dashboardFatBarEl = document.getElementById("dashboard-fat-bar");
    
    const dashboardPlannedMealsEl = document.getElementById("dashboard-planned-meals");
    const dashboardMealGoalSummaryEl = document.getElementById("dashboard-meal-goal-summary");

    if (mealDailyCaloriesEl) mealDailyCaloriesEl.textContent = totals.calories + " kcal";
    if (mealDailyCaloriesGoalEl) {
        const remaining = Math.max(0, userFitnessData.mealCalorieGoal - totals.calories);
        mealDailyCaloriesGoalEl.textContent = remaining + " kcal remaining";
    }

    if (mealDailyProteinEl) mealDailyProteinEl.textContent = totals.protein + "g";
    if (mealDailyProteinGoalEl) {
        const remaining = Math.max(0, userFitnessData.mealProteinGoal - totals.protein);
        mealDailyProteinGoalEl.textContent = remaining + "g remaining";
    }

    if (mealDailyCarbsEl) mealDailyCarbsEl.textContent = totals.carbs + "g";
    if (mealDailyCarbsGoalEl) {
        const remaining = Math.max(0, userFitnessData.mealCarbGoal - totals.carbs);
        mealDailyCarbsGoalEl.textContent = remaining + "g remaining";
    }

    if (mealDailyFatEl) mealDailyFatEl.textContent = totals.fat + "g";
    if (mealDailyFatGoalEl) {
        const remaining = Math.max(0, userFitnessData.mealFatGoal - totals.fat);
        mealDailyFatGoalEl.textContent = remaining + "g remaining";
    }

    if (mealDailySummaryEl) {
        if (totals.calories > 0) {
            mealDailySummaryEl.textContent = totals.calories + " kcal • " + totals.protein + "g protein • " + totals.carbs + "g carbs • " + totals.fat + "g fat";
        } else {
            mealDailySummaryEl.textContent = "No meals logged yet.";
        }
    }

    const yearlyTotals = getYearlyMealTotals();
    if (mealYearlySummaryEl) {
        mealYearlySummaryEl.textContent = yearlyTotals.calories + " kcal logged this year.";
    }

    const progressMap = [
        { goal: userFitnessData.mealCalorieGoal, total: totals.calories, label: dashboardCaloriesProgressEl, bar: dashboardCaloriesBarEl },
        { goal: userFitnessData.mealProteinGoal, total: totals.protein, label: dashboardProteinProgressEl, bar: dashboardProteinBarEl },
        { goal: userFitnessData.mealCarbGoal, total: totals.carbs, label: dashboardCarbsProgressEl, bar: dashboardCarbsBarEl },
        { goal: userFitnessData.mealFatGoal, total: totals.fat, label: dashboardFatProgressEl, bar: dashboardFatBarEl }
    ];

    for (let i = 0; i < progressMap.length; i++) {
        const item = progressMap[i];
        const percent = item.goal > 0 ? Math.min(100, Math.round((item.total / item.goal) * 100)) : 0;
        if (item.label) item.label.textContent = percent + "%";
        if (item.bar) item.bar.style.width = percent + "%";
    }

    if (dashboardPlannedMealsEl) {
        let plannedHtml = "";
        const limit = mealPresets.length < 3 ? mealPresets.length : 3;
        for (let i = 0; i < limit; i++) {
            plannedHtml += "<li>" + mealPresets[i].name + " • " + mealPresets[i].calories + " kcal</li>";
        }
        dashboardPlannedMealsEl.innerHTML = plannedHtml;
    }

    if (dashboardMealGoalSummaryEl) {
        dashboardMealGoalSummaryEl.textContent = "Targets: " + userFitnessData.mealCalorieGoal + " kcal • " + userFitnessData.mealProteinGoal + "g protein • " + userFitnessData.mealCarbGoal + "g carbs • " + userFitnessData.mealFatGoal + "g fat";
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
    if (timeEl) {
        timeEl.textContent = userFitnessData.timeLogged + " Mins";
    }

    const timeGoalEl = document.getElementById("stat-time-goal");
    if (timeGoalEl) {
        if (timeRemaining > 0) {
            timeGoalEl.textContent = timeRemaining + " mins away from target (" + userFitnessData.timeGoal + "m goal)";
        } else {
            timeGoalEl.textContent = "Goal reached! 🎉";
        }
    }

    const caloriesRemaining = userFitnessData.calorieGoal - userFitnessData.caloriesBurned;
    const caloriesEl = document.getElementById("stat-calories");
    if (caloriesEl) {
        caloriesEl.textContent = userFitnessData.caloriesBurned.toLocaleString() + " kcal";
    }

    const caloriesGoalEl = document.getElementById("stat-calories-goal");
    if (caloriesGoalEl) {
        if (caloriesRemaining > 0) {
            caloriesGoalEl.textContent = caloriesRemaining.toLocaleString() + " kcal away from goal (" + userFitnessData.calorieGoal.toLocaleString() + " target)";
        } else {
            caloriesGoalEl.textContent = "Goal reached! 🔥";
        }
    }

    const daysEl = document.getElementById("stat-days");
    if (daysEl) {
        daysEl.textContent = userFitnessData.daysLogged + " / " + userFitnessData.daysTarget + " Days";
    }

    const daysGoalEl = document.getElementById("stat-days-goal");
    if (daysGoalEl) {
        const daysRemaining = userFitnessData.daysTarget - userFitnessData.daysLogged;
        if (daysRemaining > 0) {
            const daySuffix = daysRemaining === 1 ? "" : "s";
            daysGoalEl.textContent = daysRemaining + " day" + daySuffix + " away from target";
        } else {
            daysGoalEl.textContent = "Goal reached! 🎉";
        }
    }

    const streakMetrics = getStreakMetrics();
    userFitnessData.streak = streakMetrics.dailyStreak;
    userFitnessData.weeklyStreak = streakMetrics.weeklyStreak;

    const streakEl = document.getElementById("stat-streak");
    if (streakEl) {
        streakEl.textContent = userFitnessData.streak + " Days";
    }

    const streakDetailEl = document.getElementById("stat-streak-detail");
    if (streakDetailEl) {
        streakDetailEl.textContent = "Daily streak • weekly streak " + userFitnessData.weeklyStreak;
    }

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
    if (logWorkoutForm) logWorkoutForm.reset();
}

function openMealModal() {
    if (mealModal) mealModal.classList.remove("hidden");
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
    let source = dataObj.source;
    if (!source) source = "manual";

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

if (viewTriggers) {
    viewTriggers.forEach(function(trigger) {
        trigger.addEventListener("click", function(event) {
            event.preventDefault();
            let viewName = this.getAttribute("data-view") || "dashboard";
            showView(viewName);
        });
    });
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
        if (event.target === logModal) {
            closeLogModal();
        }
    });
}

if (logWorkoutForm) {
    logWorkoutForm.addEventListener("submit", function(event) {
        event.preventDefault();

        let workoutName = document.getElementById("log-name").value.trim();
        if (!workoutName) workoutName = "Workout";
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