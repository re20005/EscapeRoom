

let worker = null;
let resultadosObtenidos = false;

// crear web worker
function crearWorker() {
    const workerCode = `
        self.onmessage = function(event) {
            const datos = event.data;
            
            let temperaturas = [];
            let humedades = [];

            for (let i = 0; i < datos.length; i++) {
                temperaturas.push(datos[i].temperatura);
                humedades.push(datos[i].humedad);
                
                // Enviar progreso cada 2000 registros
                if (i % 2000 === 0) {
                    self.postMessage({
                        tipo: 'progreso',
                        progreso: ((i / datos.length) * 100).toFixed(0)
                    });
                }
            }

            // Calcular estadísticas
            const resultados = {
                tipo: 'resultados',
                temperatura: {
                    promedio: (temperaturas.reduce((a, b) => a + b) / temperaturas.length).toFixed(2),
                    maximo: Math.max(...temperaturas).toFixed(2),
                    minimo: Math.min(...temperaturas).toFixed(2)
                },
                humedad: {
                    promedio: (humedades.reduce((a, b) => a + b) / humedades.length).toFixed(2),
                    maximo: Math.max(...humedades).toFixed(2),
                    minimo: Math.min(...humedades).toFixed(2)
                }
            };

            self.postMessage(resultados);
        };
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    worker = new Worker(workerUrl);

    worker.onmessage = function(event) {
        manejarRespuesta(event.data);
    };
}

// Generar 20,000 datos simulados
function generarDatos() {
    const datos = [];
    for (let i = 0; i < 20000; i++) {
        datos.push({
            temperatura: parseFloat((Math.random() * 40 + 10).toFixed(2)),
            humedad: parseFloat((Math.random() * 100).toFixed(2))
        });
    }
    return datos;
}

// Manejar respuesta del Worker
function manejarRespuesta(data) {
    if (data.tipo === 'progreso') {
        document.getElementById('progressBar').style.width = data.progreso + '%';
        document.getElementById('progressText').textContent = data.progreso + '%';
    } 
    else if (data.tipo === 'resultados') {
        mostrarResultados(data);
    }
}

// Mostrar resultados
function mostrarResultados(data) {
    // Temperatura
    document.getElementById('tempPromedio').textContent = data.temperatura.promedio + '°C';
    document.getElementById('tempMaximo').textContent = data.temperatura.maximo + '°C';
    document.getElementById('tempMinimo').textContent = data.temperatura.minimo + '°C';

    // Humedad
    document.getElementById('humPromedio').textContent = data.humedad.promedio + '%';
    document.getElementById('humMaximo').textContent = data.humedad.maximo + '%';
    document.getElementById('humMinimo').textContent = data.humedad.minimo + '%';

    // Mostrar resultados y ocultar progreso
    document.getElementById('progressContainer').style.display = 'none';
    document.getElementById('estadoMsg').style.display = 'none';
    document.getElementById('resultadosContainer').style.display = 'block';

    resultadosObtenidos = true;
    document.getElementById('iniciarBtn').disabled = false;
}

// Iniciar procesamiento
function iniciarProcesamiento() {
    if (resultadosObtenidos) {
        alert('Ya completaste este nivel. Haz clic en Limpiar para intentar nuevamente.');
        return;
    }

    // Mostrar progreso
    document.getElementById('progressContainer').style.display = 'block';
    document.getElementById('resultadosContainer').style.display = 'none';
    document.getElementById('estadoMsg').style.display = 'block';
    document.getElementById('estadoTxt').textContent = 'Generando 20,000 registros...';
    document.getElementById('iniciarBtn').disabled = true;

    // Generar datos
    setTimeout(() => {
        const datos = generarDatos();
        document.getElementById('estadoTxt').textContent = 'Procesando en Worker...';
        document.getElementById('progressBar').style.width = '0%';
        document.getElementById('progressText').textContent = '0%';
        
        // Enviar al worker
        worker.postMessage(datos);
    }, 300);
}

// Limpiar
function limpiar() {
    resultadosObtenidos = false;

    document.getElementById('progressContainer').style.display = 'none';
    document.getElementById('estadoMsg').style.display = 'none';
    document.getElementById('resultadosContainer').style.display = 'none';

    document.getElementById('tempPromedio').textContent = '-';
    document.getElementById('tempMaximo').textContent = '-';
    document.getElementById('tempMinimo').textContent = '-';
    document.getElementById('humPromedio').textContent = '-';
    document.getElementById('humMaximo').textContent = '-';
    document.getElementById('humMinimo').textContent = '-';

    document.getElementById('iniciarBtn').disabled = false;
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    crearWorker();
    document.getElementById('iniciarBtn').addEventListener('click', iniciarProcesamiento);
    document.getElementById('limpiarBtn').addEventListener('click', limpiar);
});
