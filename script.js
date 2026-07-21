console.log("connected")

window.addEventListener("scroll", () => {
    // 1. Use querySelectorAll to easily loop, or index [0] if it is just one item
    const benefitBoxes = document.getElementById("benefits-section");


    if (window.scrollY > 300) {
        console.log("scroll-activated")
        benefitBoxes.classList.add("scroll-activated")

   
}})