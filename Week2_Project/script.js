const images = document.querySelectorAll(".gallery img");

const lightbox = document.getElementById("lightbox");

const lightboxImage = document.getElementById("lightboxImage");

const closeButton = document.getElementById("close");


// When an image is clicked

images.forEach(function(image) {

    image.addEventListener("click", function() {

        lightbox.style.display = "flex";

        lightboxImage.src = image.src;

    });

});


// Close lightbox

closeButton.addEventListener("click", function() {

    lightbox.style.display = "none";

});