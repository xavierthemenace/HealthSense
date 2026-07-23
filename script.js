console.log("connected")

window.addEventListener("scroll", () => {
    // 1. Use querySelectorAll to easily loop, or index [0] if it is just one item
    const benefitBoxes = document.getElementById("benefits-section");
    const timelineSection = document.getElementById("timeline")

    if (window.scrollY > 350) {
        console.log("scroll-activated")
        benefitBoxes.classList.add("scroll-activated")
    if (window.scrollY > 900) {
        timelineSection.classList.add("scroll-activated")
    }
   
}})