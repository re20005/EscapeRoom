document.getElementById("btn-obtener-ubicacion").addEventListener("click", function() {

  navigator.geolocation.getCurrentPosition(

    function(position) {
      let lat = position.coords.latitude;
      let lon = position.coords.longitude;

      document.getElementById("latitud").textContent = lat;
      document.getElementById("longitud").textContent = lon;

      document.getElementById("resultado-ubicacion").classList.remove("d-none");
      document.getElementById("error-permiso").classList.add("d-none");
      document.getElementById("error-disponibilidad").classList.add("d-none");

      niveles[1].completado = true;
      document.getElementById("btn-siguiente-n1").disabled = false;
    },

    function(error) {
      switch(error.code) {
        case error.PERMISSION_DENIED:
          document.getElementById("error-permiso").classList.remove("d-none");
          break;
        case error.POSITION_UNAVAILABLE:
          document.getElementById("error-disponibilidad").classList.remove("d-none");
          break;
      }
    }
  );

});