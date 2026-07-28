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
const userFitnessData = {
    hasCompletedSurvey: false,
    primaryGoal: "Weight Loss",
    timeGoal: 150,
    timeLogged: 120,
    calorieGoal: 2000,
    caloriesBurned: 1450,
    daysTarget: 5,
    daysLogged: 3,
    workoutCount: 5,
    streak: 4,
    lastWorkoutDate: null,
    lastWorkoutSummary: "No workouts logged yet.",
    workoutHistory: []
};

function showView(viewName) {
    if (viewName === "workout" && !userFitnessData.hasCompletedSurvey) {
        document.getElementById("survey-modal").classList.remove("hidden");
        return;
    }
    viewPanels.forEach((panel) => {
        const isActive = panel.id === `view-${viewName}`;
        panel.classList.toggle("hidden", !isActive);
        panel.setAttribute("aria-hidden", isActive ? "false" : "true");
    });
}

function renderWorkoutSummary() {
    if (dashboardWorkoutsCount) {
        dashboardWorkoutsCount.textContent = `${userFitnessData.workoutCount}`;
    }

    if (dashboardWorkoutSummary) {
        dashboardWorkoutSummary.textContent = userFitnessData.lastWorkoutSummary || "No workouts logged yet.";
    }
}

function updateDashboardStats() {
    const goalSubtitle = document.getElementById("user-goal-subtitle");
    if (goalSubtitle) {
        goalSubtitle.textContent = `Adjusted for: ${userFitnessData.primaryGoal}`;
    }

    const timeRemaining = userFitnessData.timeGoal - userFitnessData.timeLogged;
    const timeEl = document.getElementById("stat-time");
    if (timeEl) {
        timeEl.textContent = `${userFitnessData.timeLogged} Mins`;
    }

    const timeGoalEl = document.getElementById("stat-time-goal");
    if (timeGoalEl) {
        timeGoalEl.textContent = timeRemaining > 0
            ? `${timeRemaining} mins away from target (${userFitnessData.timeGoal}m goal)`
            : `Goal reached! 🎉`;
    }

    const caloriesRemaining = userFitnessData.calorieGoal - userFitnessData.caloriesBurned;
    const caloriesEl = document.getElementById("stat-calories");
    if (caloriesEl) {
        caloriesEl.textContent = `${userFitnessData.caloriesBurned.toLocaleString()} kcal`;
    }

    const caloriesGoalEl = document.getElementById("stat-calories-goal");
    if (caloriesGoalEl) {
        caloriesGoalEl.textContent = caloriesRemaining > 0
            ? `${caloriesRemaining.toLocaleString()} kcal away from goal (${userFitnessData.calorieGoal.toLocaleString()} target)`
            : `Goal reached! 🔥`;
    }

    const daysEl = document.getElementById("stat-days");
    if (daysEl) {
        daysEl.textContent = `${userFitnessData.daysLogged} / ${userFitnessData.daysTarget} Days`;
    }

    const daysGoalEl = document.getElementById("stat-days-goal");
    if (daysGoalEl) {
        const daysRemaining = userFitnessData.daysTarget - userFitnessData.daysLogged;
        daysGoalEl.textContent = daysRemaining > 0
            ? `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} away from target`
            : `Goal reached! 🎉`;
    }

    const streakEl = document.getElementById("stat-streak");
    if (streakEl) {
        streakEl.textContent = `${userFitnessData.streak} Weeks`;
    }

    renderWorkoutSummary();
}

function openLogModal() {
    if (logModal) {
        logModal.classList.remove("hidden");
    }

    const nameField = document.getElementById("log-name");
    if (nameField) {
        nameField.focus();
    }
}

function closeLogModal() {
    if (logModal) {
        logModal.classList.add("hidden");
    }

    if (logWorkoutForm) {
        logWorkoutForm.reset();
    }
}

const surveyForm = document.getElementById("survey-form");

surveyForm.addEventListener("submit", (event) => {
    event.preventDefault();
    userFitnessData.hasCompletedSurvey = true;
    userFitnessData.primaryGoal = document.getElementById("survey-primary-goal").value;
    userFitnessData.timeGoal = parseInt(document.getElementById("survey-time-target").value);
    userFitnessData.calorieGoal = parseInt(document.getElementById("survey-calorie-target").value);

    userFitnessData.hasCompletedSurvey = true;

    document.getElementById("survey-modal").classList.add("hidden");

    updateDashboardStats();
    showView("workout")
});

const logWorkoutForm = document.getElementById("log-workout-form");

if (openLogModalBtn) {
    openLogModalBtn.addEventListener("click", (event) => {
        event.preventDefault();
        openLogModal();
    });
}

if (logBtn) {
    logBtn.addEventListener("click", (event) => {
        event.preventDefault();
        openLogModal();
    });
}

if (closeLogModalBtn) {
    closeLogModalBtn.addEventListener("click", (event) => {
        event.preventDefault();
        closeLogModal();
    });
}

if (logModal) {
    logModal.addEventListener("click", (event) => {
        if (event.target === logModal) {
            closeLogModal();
        }
    });
}

if (logWorkoutForm) {
    logWorkoutForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const workoutName = document.getElementById("log-name").value.trim() || "Workout";
        const workoutType = document.getElementById("log-type").value;
        const durationInput = parseInt(document.getElementById("log-duration").value, 10);
        const caloriesInput = parseInt(document.getElementById("log-calories").value, 10);
        const intensity = document.getElementById("log-intensity").value;
        const notes = document.getElementById("log-notes").value.trim();
        const todayKey = new Date().toDateString();

        if (userFitnessData.lastWorkoutDate !== todayKey) {
            userFitnessData.daysLogged += 1;
            userFitnessData.lastWorkoutDate = todayKey;
        }

        userFitnessData.workoutCount += 1;
        userFitnessData.timeLogged += durationInput;
        userFitnessData.caloriesBurned += caloriesInput;
        userFitnessData.streak = Math.max(1, Math.min(12, Math.ceil(userFitnessData.daysLogged / 2)));
        userFitnessData.lastWorkoutSummary = `${workoutName} • ${durationInput}m • ${caloriesInput} kcal • ${intensity}`;
        userFitnessData.workoutHistory.unshift({
            name: workoutName,
            type: workoutType,
            duration: durationInput,
            calories: caloriesInput,
            intensity,
            notes,
            date: new Date().toLocaleDateString()
        });

        updateDashboardStats();
        closeLogModal();
    });
}

viewTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
        event.preventDefault();
        const view = trigger.getAttribute("data-view") || "dashboard";
        showView(view);
    });
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        if (logModal && !logModal.classList.contains("hidden")) {
            closeLogModal();
            return;
        }

        const activePanel = document.querySelector('.view-panel:not(.hidden)');
        if (activePanel && activePanel.id !== "view-dashboard") {
            showView("dashboard");
        }
    }
});

function activateSections() {
    if (!benefitBoxes && !timelineSection) return;

    const triggerPoint = window.innerHeight * 0.85;

    if (benefitBoxes && !benefitBoxes.classList.contains('scroll-activated')) {
        const benefitsTop = benefitBoxes.getBoundingClientRect().top;
        if (benefitsTop <= triggerPoint) {
            benefitBoxes.classList.add('scroll-activated');
        }
    }

    if (timelineSection && !timelineSection.classList.contains('scroll-activated')) {
        const timelineTop = timelineSection.getBoundingClientRect().top;
        if (timelineTop <= triggerPoint) {
            timelineSection.classList.add('scroll-activated');
        }
    }
}

window.addEventListener('scroll', activateSections, { passive: true });
window.addEventListener('load', activateSections);
activateSections();
updateDashboardStats();

function buildGroceryList(goal, meal) {
    const templates = {
        "balanced": {
            label: "Balanced energy",
            note: "This helps you stay both energized and revitalized.",
            items: ["Spinach", "Chicken breast", "Greek yogurt", "Sweet potato", "Blueberries", "Olive oil"]
        },
        "weight-loss": {
            label: "Weight loss",
            note: "High-protein, low calories to keep you burning fat.",
            items: ["Leafy greens", "Salmon", "Cucumbers", "Quinoa", "Egg whites", "Apples"]
        },
        "muscle-gain": {
            label: "Muscle gain",
            note: "Calorie-dense choices to help recovery and strength goals.",
            items: ["Oats", "Eggs", "Bananas", "Chicken thighs", "Brown rice", "Avocados"]
        }
    };

    const selected = templates[goal] || templates.balanced;
    const listItems = selected.items.map((item, index) => `<li>${index + 1}. ${item}</li>`).join("");

    return `
        <h4>${meal || "Your meal"}</h4>
        <p><strong>${selected.label}</strong> • ${selected.note}</p>
        <ul class="metric-list" style="margin-top: 10px;">${listItems}</ul>
    `;
}

if (groceryForm && groceryOutput) {
    groceryForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const goal = document.getElementById("goal-select").value;
        const meal = document.getElementById("meal-input").value.trim() || "Your next meal";
        groceryOutput.innerHTML = buildGroceryList(goal, meal);
    });

    groceryOutput.innerHTML = buildGroceryList("balanced", "Mediterranean bowl");
}

if (mealPreviewButton && mealOutput) {
    const samplePlan = `
        <h4>Today’s plan</h4>
        <p><strong>Weight loss focus</strong> • A simple day with protein, fiber, and hydration in mind.</p>
        <ul class="metric-list" style="margin-top: 10px;">
            <li>Breakfast: Greek yogurt bowl with berries and chia</li>
            <li>Lunch: Turkey wrap with greens and hummus</li>
            <li>Dinner: Stir-fried vegetables with tofu and brown rice</li>
        </ul>
    `;

    mealPreviewButton.addEventListener("click", () => {
        mealOutput.innerHTML = samplePlan;
    });

    mealOutput.innerHTML = samplePlan;
}

if (workoutForm && workoutOutput) {
    function generateWorkout(focus, equipment) {
        const workoutPlans = { 
            strength: {
                dumbbells: ["Goblet squat x 12", "Bent-over row x 12", "Push-up x 10", "Dead bug x 12"],
                bodyweight: ["Squat x 15", "Push-up x 10", "Glute bridge x 15", "Plank x 40s"],
                yoga: ["Flow sequence x 8 mins", "Chair pose x 10 reps", "Bird dog x 12 each", "Standing balance x 20s"]
            },
            cardio: {
                dumbbells: ["March in place x 3 mins", "Dumbbell step-ups x 12 each", "Fast walk x 10 mins"],
                bodyweight: ["Jumping jacks x 45s", "Bodyweight squats x 15", "High knees x 30s"],
                yoga: ["Sun salutation x 6 rounds", "Cat-cow x 10 rounds", "Gentle vinyasa x 8 mins"]
            },
            mobility: {
                dumbbells: ["Hip hinge x 10", "Shoulder circles x 12", "Thoracic rotation x 10 each"],
                bodyweight: ["World’s greatest stretch x 8 each", "Cobra stretch x 20s", "Hamstring stretch x 20s"],
                yoga: ["Child’s pose x 45s", "Low lunge x 30s each", "Seated twist x 20s each"]
            }
        };

        const focusTitle = focus.charAt(0).toUpperCase() + focus.slice(1);
        const formattedEquipment = equipment.charAt(0).toUpperCase() + equipment.slice(1);

        if (workoutTargetLabel) {
            workoutTargetLabel.textContent = `${focusTitle} (${formattedEquipment})`;
        }

        const chosenPlan = workoutPlans[focus]?.[equipment] || workoutPlans.strength.dumbbells;
        const workoutList = chosenPlan.map((item) => `<li>${item}</li>`).join("");

        workoutOutput.innerHTML = `
            <h4>${focusTitle} plan</h4>
            <p>Using <strong>${formattedEquipment}</strong> and a focused pace.</p>
            <ul class="metric-list" style="margin-top: 10px;">${workoutList}</ul>
        `;
    }

    workoutForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const focus = document.getElementById("workout-focus").value;
        const equipment = document.getElementById("equipment-select").value;
        generateWorkout(focus, equipment);
    });

    generateWorkout("strength", "dumbbells");
}
logBtn.addEventListener("click", (event) => {

})