document.addEventListener("DOMContentLoaded", function() {
    function ajustarMarginTop() {
        const navHeight = document.querySelector("nav").offsetHeight;
        document.querySelector("main").style.marginTop = navHeight + "px";
    }

    ajustarMarginTop(); // Ajusta ao carregar a página

    window.addEventListener("resize", ajustarMarginTop); // Recalcula ao redimensionar a janela
});