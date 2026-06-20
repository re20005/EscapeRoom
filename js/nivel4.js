// Nivel 4: El Núcleo de Procesamiento
// Simula 20,000 datos de sensores y los procesa usando Web Worker

class Nivel4 {
    constructor() {
        this.worker = null;
        this.datosGenerados = false;
        this.resultadosObtenidos = false;
        this.init();
    }

    init() {
        // Crear Web Worker
        this.crearWorker();
        
        // Event listeners
        document.getElementById('iniciarBtn').addEventListener('click', () => this.iniciarProcesamiento());
        document.getElementById('limpiarBtn').addEventListener('click', () => this.limpiar());
    }

    crearWorker() {
        const workerCode = `
            let datosRecibidos = 0;
            let totalDatos = 0;

            self.onmessage = function(event) {
                const datos = event.data;
                totalDatos = datos.length;
                datosRecibidos = 0;

                // Procesamiento de estadísticas
                let temperaturas = [];
                let humedades = [];

                for (let i = 0; i < datos.length; i++) {
                    temperaturas.push(datos[i].temperatura);
                    humedades.push(datos[i].humedad);
                    
                    datosRecibidos = i + 1;

                    // Enviar progreso cada 1000 registros
                    if (i % 1000 === 0) {
                        self.postMessage({
                            tipo: 'progreso',
                            progreso: ((i / totalDatos) * 100).toFixed(2)
                        });
                    }
                }

                // Calcular estadísticas
                const estadisticas = {
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
                    },
                    datosProcessados: totalDatos
                };

                self.postMessage(estadisticas);
            };
        `;

        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(blob);
        this.worker = new Worker(workerUrl);

        this.worker.onmessage = (event) => this.manejarRespuestaWorker(event.data);
        this.worker.onerror = (error) => this.manejarErrorWorker(error);
    }

    generarDatos(cantidad = 20000) {
        const datos = [];
        
        for (let i = 0; i < cantidad; i++) {
            datos.push({
                temperatura: parseFloat((Math.random() * 40 + 10).toFixed(2)), // 10-50°C
                humedad: parseFloat((Math.random() * 100).toFixed(2)) // 0-100%
            });
        }
        
        return datos;
    }

    iniciarProcesamiento() {
        // Validar si ya hay datos procesados
        if (this.resultadosObtenidos) {
            document.getElementById('validacionMsg').style.display = 'block';
            document.getElementById('validacionTxt').textContent = 
                'Ya has completado este nivel. Haz clic en "Limpiar" para intentar nuevamente.';
            return;
        }

        // Mostrar estado
        document.getElementById('estadoMsg').style.display = 'block';
        document.getElementById('estadoTxt').textContent = 'Generando 20,000 registros de sensores...';
        document.getElementById('progressContainer').style.display = 'block';
        document.getElementById('resultadosContainer').style.display = 'none';
        document.getElementById('validacionMsg').style.display = 'none';

        // Desabilitar botón
        document.getElementById('iniciarBtn').disabled = true;

        // Generar datos
        setTimeout(() => {
            const datos = this.generarDatos(20000);
            this.datosGenerados = true;

            document.getElementById('estadoTxt').textContent = 'Procesando datos en Worker...';
            document.getElementById('progressBar').style.width = '0%';
            document.getElementById('progressText').textContent = '0%';

            // Enviar al worker
            this.worker.postMessage(datos);
        }, 300);
    }

    manejarRespuestaWorker(data) {
        if (data.tipo === 'progreso') {
            const porcentaje = parseFloat(data.progreso);
            document.getElementById('progressBar').style.width = porcentaje + '%';
            document.getElementById('progressText').textContent = porcentaje.toFixed(0) + '%';
        } 
        else if (data.tipo === 'resultados') {
            // Llenar estadísticas de temperatura
            document.getElementById('tempPromedio').textContent = data.temperatura.promedio + '°C';
            document.getElementById('tempMaximo').textContent = data.temperatura.maximo + '°C';
            document.getElementById('tempMinimo').textContent = data.temperatura.minimo + '°C';

            // Llenar estadísticas de humedad
            document.getElementById('humPromedio').textContent = data.humedad.promedio + '%';
            document.getElementById('humMaximo').textContent = data.humedad.maximo + '%';
            document.getElementById('humMinimo').textContent = data.humedad.minimo + '%';

            // Datos procesados
            document.getElementById('datosProcessados').textContent = data.datosProcessados.toLocaleString();

            // Mostrar resultados
            document.getElementById('progressContainer').style.display = 'none';
            document.getElementById('estadoMsg').style.display = 'none';
            document.getElementById('resultadosContainer').style.display = 'block';

            // Marcar como completado
            this.resultadosObtenidos = true;

            // Habilitar botón
            document.getElementById('iniciarBtn').disabled 
            this.mostrarValidacionExito();
        }
    }

    manejarErrorWorker(error) {
        console.error('Error en Worker:', error);
        document.getElementById('estadoMsg').className = 'alert alert-danger mb-4';
        document.getElementById('estadoMsg').style.display = 'block';
        document.getElementById('estadoTxt').textContent = 'Error al procesar los datos: ' + error.message;
        document.getElementById('iniciarBtn').disabled = false;
    }

    mostrarValidacionExito() {
        const validacionMsg = document.getElementById('validacionMsg');
        validacionMsg.className = 'alert alert-success mb-0';
        validacionMsg.style.display = 'block';
        document.getElementById('validacionTxt').innerHTML = 
            '<i class="fas fa-check-circle"></i> <strong>¡Nivel 4 Completado!</strong> Has procesado exitosamente 20,000 registros de sensores. Puedes avanzar al siguiente nivel.';
    }

    limpiar() {
        // Resetear variables
        this.datosGenerados = false;
        this.resultadosObtenidos = false;

        // Limpiar UI
        document.getElementById('progressContainer').style.display = 'none';
        document.getElementById('estadoMsg').style.display = 'none';
        document.getElementById('resultadosContainer').style.display = 'none';
        document.getElementById('validacionMsg').style.display = 'none';

        // Resetear valores
        document.getElementById('tempPromedio').textContent = '-';
        document.getElementById('tempMaximo').textContent = '-';
        document.getElementById('tempMinimo').textContent = '-';
        document.getElementById('humPromedio').textContent = '-';
        document.getElementById('humMaximo').textContent = '-';
        document.getElementById('humMinimo').textContent = '-';
        document.getElementById('datosProcessados').textContent = '0';

        // Habilitar boton
        document.getElementById('iniciarBtn').disabled = false;
    }
}

// inicializar
document.addEventListener('DOMContentLoaded', () => {
    new Nivel4();
});
