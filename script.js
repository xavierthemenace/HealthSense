const benefitBoxes = document.getElementById("benefits-section");
const timelineSection = document.getElementById("timeline");
const groceryForm = document.getElementById("grocery-form");
const groceryOutput = document.getElementById("grocery-output");
const workoutForm = document.getElementById("workout-form");
const workoutOutput = document.getElementById("workout-output");
const mealPreviewButton = document.getElementById("meal-preview");
const mealOutput = document.getElementById("meal-output");
const viewTriggers = document.querySelectorAll('[data-view]');
const viewPanels = document.querySelectorAll('.view-panel');

function showView(viewName) {
    viewPanels.forEach((panel) => {
        const isActive = panel.id === `view-${viewName}`;
        panel.classList.toggle("hidden", !isActive);
        panel.setAttribute("aria-hidden", isActive ? "false" : "true");
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
        const activePanel = document.querySelector('.view-panel:not(.hidden)');
        if (activePanel && activePanel.id !== "view-dashboard") {
            showView("dashboard");
        }
    }
});

function activateSections() {
    if (!benefitBoxes || !timelineSection) return;

    if (window.scrollY > 350) {
        benefitBoxes.classList.add("scroll-activated");
    }

    if (window.scrollY > 900) {
        timelineSection.classList.add("scroll-activated");
    }
}

window.addEventListener("scroll", activateSections);
activateSections();

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
        <ul>${listItems}</ul>
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
        <ul>
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
    workoutForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const focus = document.getElementById("workout-focus").value;
        const equipment = document.getElementById("equipment-select").value;

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

        const chosenPlan = workoutPlans[focus]?.[equipment] || workoutPlans.strength.dumbbells;
        const workoutList = chosenPlan.map((item) => `<li>${item}</li>`).join("");

        workoutOutput.innerHTML = `
            <h4>${focusTitle} plan</h4>
            <p>Using ${formattedEquipment} and a focused pace.</p>
            <ul>${workoutList}</ul>
        `;
    });

    workoutOutput.innerHTML = `
        <h4>Strength plan</h4>
        <p>Using dumbbells and a focused pace.</p>
        <ul>
            <li>Goblet squat x 12</li>
            <li>Bent-over row x 12</li>
            <li>Push-up x 10</li>
        </ul>
    `;
}
