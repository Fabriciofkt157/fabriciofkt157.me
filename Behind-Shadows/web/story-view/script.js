var setArch = 0;
var stepLimit = 1;
const contents = document.getElementById("contents");
const arquivos = document.getElementById("arquivos");
function setupArchive(numArch) {
    setArch = numArch;
    arquivos.style.display = "none";
    contents.style.display = "block";
    switch (setArch) {
        case 1:
            readRoteiro();
            stepLimit = 15;
            break;
        case 2:
            readSystem();
            break;
        case 3:
            readMecanicas();
            break;
        case 4:
            readInterfaces();
            break;
        case 5:
            readRoteiroOld();
            stepLimit = 8;
            break;
        default:
            console.log("[ERRO]: número de arquivo incorreto");
            break;
    }
}

const stepHistory = document.getElementById("dayHistory");
var step = 0;

function nextStep() {
    step++;
    if (step > stepLimit) { step = stepLimit; }
    console.log(step);
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    document.getElementById('main').scrollTop = 0;
    setupArchive(setArch);
}
function prevStep() {
    step--;
    if (step < 0) { step = 0; }
    console.log(step);
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    document.getElementById('main').scrollTop = 0;
    setupArchive(setArch);
}

function getLine(filePath, lineNumber, callback) {
    fetch(filePath)
        .then(response => response.text())
        .then(text => {
            const lines = text.split('\n');
            if (lineNumber >= 0 && lineNumber < lines.length) {
                callback(lines[lineNumber]);
            } else {
                console.error("Número da linha fora dos limites.");
            }
        })
        .catch(error => console.error("Erro ao ler o arquivo:", error));
}

function readRoteiro() {
    $(document).ready(function () {
        getLine('docs/roteiros/REV-5/pt-br/roteiro_full/titles.txt', step, line => {
            stepHistory.textContent = line;
        });
        $.get("docs/roteiros/REV-5/pt-br/roteiro_full/step" + step + ".txt", function (data) {
            $("#texto-container").text(data);
        });
    });
}

function readSystem() {
    $(document).ready(function () {
        stepHistory.textContent = "System";
        $.get("docs/roteiros/REV-5/pt-br/system.txt", function (data) {
            $("#texto-container").text(data);
        });
    });
}
function readMecanicas(){
    $(document).ready(function () {
        stepHistory.textContent = "Mecânicas";
        $.get("docs/roteiros/REV-5/pt-br/mecanicas.txt", function (data) {
            $("#texto-container").text(data);
        });
    });
}
function readInterfaces(){
    $(document).ready(function () {
        stepHistory.textContent = "Interfaces";
        $.get("docs/roteiros/REV-5/pt-br/interfaces.txt", function (data) {
            $("#texto-container").text(data);
        });
    });
}
function readRoteiroOld() {
    $(document).ready(function () {
        getLine('docs/roteiros/REV-4/titles.txt', step, line => {
            stepHistory.textContent = line;
        });
        $.get("docs/roteiros/REV-4/step" + step + ".txt", function (data) {
            $("#texto-container").text(data);
        });
    });
}
function home(){
    arquivos.style.display = "block";
    contents.style.display = "none";
}

document.addEventListener("DOMContentLoaded", function() {
    function ajustarMarginTop() {
        const navHeight = document.querySelector("nav").offsetHeight;
        document.querySelector("main").style.marginTop = navHeight + "px";
    }

    ajustarMarginTop(); // Ajusta ao carregar a página

    window.addEventListener("resize", ajustarMarginTop); // Recalcula ao redimensionar a janela
});