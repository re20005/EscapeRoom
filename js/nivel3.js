const video = document.getElementById("video");
const canvasFoto = document.getElementById("canvas-foto");
const fotoCapturada = document.getElementById("foto-capturada");

// ACTIVAR CÁMARA
document.getElementById("btn-activar-camara")
.addEventListener("click", async function () {

    try {

        const stream = await navigator.mediaDevices.getUserMedia({
            video: true
        });

        video.srcObject = stream;

        document.getElementById("error-permiso-camara")
        .classList.add("d-none");

        document.getElementById("error-camara")
        .classList.add("d-none");

    } catch(error) {

        if(error.name === "NotAllowedError") {

            document.getElementById("error-permiso-camara")
            .classList.remove("d-none");

        }
        else if(error.name === "NotFoundError") {

            document.getElementById("error-camara")
            .classList.remove("d-none");

        }

    }

});


// CAPTURAR FOTO
document.getElementById("btn-capturar")
.addEventListener("click", function () {

    const ctx = canvasFoto.getContext("2d");

    ctx.drawImage(
        video,
        0,
        0,
        canvasFoto.width,
        canvasFoto.height
    );

    const imagen = canvasFoto.toDataURL("image/png");

    fotoCapturada.src = imagen;

    localStorage.setItem(
        "fotoExplorador",
        imagen
    );

    document.getElementById("contenedor-foto")
    .classList.remove("d-none");

    niveles[3].completado = true;

    document.getElementById("btn-siguiente-n3")
    .disabled = false;

});