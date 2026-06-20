
class Nivel5 {
    constructor() {
        this.worker = null;
        this.resultadosObtenidos = false;
        this.datosOriginales = null;
        this.resultadosFinales = null;
        this.init();
    }

    init() {
        this.crearWorker();
        
        // Event listeners
        document.getElementById('iniciarBtn').addEventListener('click', () => this.iniciarProcesamiento());
        document.getElementById('limpiarBtn').addEventListener('click', () => this.limpiar());
        document.getElementById('exportarBtn').addEventListener('click', () => this.exportarJSON());
    }

    crearWorker() {
        const workerCode = `
            self.onmessage = function(event) {
                const datos = event.data;
                const totalDatos = datos.length;
                let datosValidos = [];
                let datosInvalidos = 0;

                // Filtrar datos negativos
                for (let i = 0; i < totalDatos; i++) {
                    const registro = datos[i];
                    
                    // Validar que todos los valores sean positivos
                    if (registro.temperatura >= 0 && registro.humedad >= 0 && registro.presion >= 0) {
                        datosValidos.push(registro);
                    } else {
                        datosInvalidos++;
                    }

                    // Enviar progreso
                    if (i % 5000 === 0) {
                        self.postMessage({
                            tipo: 'progreso',
                            progreso: ((i / totalDatos) * 100).toFixed(2),
                            procesados: i
                        });
                    }
                }

                // Calcular estadísticas
                let temperaturas = datosValidos.map(d => d.temperatura);
                let humedades = datosValidos.map(d => d.humedad);
                let presiones = datosValidos.map(d => d.presion);

                // Promedios
                const tempPromedio = (temperaturas.reduce((a, b) => a + b, 0) / datosValidos.length).toFixed(2);
                const humPromedio = (humedades.reduce((a, b) => a + b, 0) / datosValidos.length).toFixed(2);
                const presPromedio = (presiones.reduce((a, b) => a + b, 0) / datosValidos.length).toFixed(2);

                // Top 10
                const top10Temperaturas = temperaturas
                    .sort((a, b) => b - a)
                    .slice(0, 10)
                    .map(t => t.toFixed(2));

                const top10Presiones = presiones
                    .sort((a, b) => b - a)
                    .slice(0, 10)
                    .map(p => p.toFixed(2));

                // Enviar resultados
                const estadisticas = {
                    tipo: 'resultados',
                    registrosValidos: datosValidos.length,
                    registrosFiltrados: datosInvalidos,
                    tasaValidez: ((datosValidos.length / totalDatos) * 100).toFixed(2),
                    promedios: {
                        temperatura: tempPromedio,
                        humedad: humPromedio,
                        presion: presPromedio
                    },
                    top10: {
                        temperaturas: top10Temperaturas,
                        presiones: top10Presiones
                    }
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

    generarDatos(cantidad = 250000) {
        const datos = [];
        
        for (let i = 0; i < cantidad; i++) {
            // 15% de probabilidad de generar un valor negativo en algún campo
            const tieneNegativo = Math.random() < 0.15;
            
            let temperatura, humedad, presion;

            if (tieneNegativo) {
                // Generar valor negativo en uno de los campos aleatorios
                const campoNegativo = Math.floor(Math.random() * 3);
                temperatura = campoNegativo === 0 ? -(Math.random() * 10) : (Math.random() * 40 + 10);
                humedad = campoNegativo === 1 ? -(Math.random() * 20) : (Math.random() * 100);
                presion = campoNegativo === 2 ? -(Math.random() * 50) : (Math.random() * 100 + 950);
            } else {
                // Generar valores positivos normales
                temperatura = Math.random() * 40 + 10; // 10-50°C
                humedad = Math.random() * 100; // 0-100%
                presion = Math.random() * 100 + 950; // 950-1050 hPa
            }

            datos.push({
                temperatura: parseFloat(temperatura.toFixed(2)),
                humedad: parseFloat(humedad.toFixed(2)),
                presion: parseFloat(presion.toFixed(2))
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
        document.getElementById('estadoTxt').textContent = 'Generando 250,000 registros cuánticos...';
        document.getElementById('progressContainer').style.display = 'block';
        document.getElementById('resultadosContainer').style.display = 'none';
        document.getElementById('validacionMsg').style.display = 'none';

        // Desabilitar botones
        document.getElementById('iniciarBtn').disabled = true;
        document.getElementById('exportarBtn').disabled = true;

        // Generar datos
        setTimeout(() => {
            const datos = this.generarDatos(250000);
            this.datosOriginales = datos;

            document.getElementById('estadoTxt').textContent = 'Procesando datos en Worker cuántico...';
            document.getElementById('progressBar').style.width = '0%';
            document.getElementById('progressText').textContent = '0%';
            document.getElementById('procesadosTxt').textContent = 'Registros procesados: 0 / 250,000';

            // Enviar al worker
            this.worker.postMessage(datos);
        }, 500);
    }

    manejarRespuestaWorker(data) {
        if (data.tipo === 'progreso') {
            const porcentaje = parseFloat(data.progreso);
            document.getElementById('progressBar').style.width = porcentaje + '%';
            document.getElementById('progressText').textContent = porcentaje.toFixed(0) + '%';
            document.getElementById('procesadosTxt').textContent = 
                'Registros procesados: ' + data.procesados.toLocaleString() + ' / 250,000';
        } 
        else if (data.tipo === 'resultados') {
            this.mostrarResultados(data);
            this.resultadosFinales = data;
            this.resultadosObtenidos = true;
        }
    }

    mostrarResultados(data) {
        // Resumen general
        document.getElementById('registrosValidos').textContent = 
            data.registrosValidos.toLocaleString();
        document.getElementById('registrosFiltrados').textContent = 
            data.registrosFiltrados.toLocaleString();
        document.getElementById('tasaValidez').textContent = data.tasaValidez + '%';

        // Promedios
        document.getElementById('tempPromedioGeneral').textContent = data.promedios.temperatura + '°C';
        document.getElementById('humPromedioGeneral').textContent = data.promedios.humedad + '%';
        document.getElementById('presPromedioGeneral').textContent = data.promedios.presion + ' hPa';

        // Top 10 Temperaturas
        let htmlTemperaturas = '';
        data.top10.temperaturas.forEach((temp, index) => {
            htmlTemperaturas += `
                <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <span>
                        <span class="badge bg-primary me-2">${index + 1}</span>
                        ${temp}°C
                    </span>
                    <span class="progress-meter" style="width: ${(parseFloat(temp) / 50) * 100}%; height: 5px; background: #007bff; border-radius: 2px;"></span>
                </div>
            `;
        });
        document.getElementById('topTemperaturas').innerHTML = htmlTemperaturas;

        // Top 10 Presiones
        let htmlPresiones = '';
        data.top10.presiones.forEach((pres, index) => {
            htmlPresiones += `
                <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <span>
                        <span class="badge bg-warning me-2">${index + 1}</span>
                        ${pres} hPa
                    </span>
                    <span class="progress-meter" style="width: ${(parseFloat(pres) / 1050) * 100}%; height: 5px; background: #ffc107; border-radius: 2px;"></span>
                </div>
            `;
        });
        document.getElementById('topPresiones').innerHTML = htmlPresiones;

        // Mostrar resultados
        document.getElementById('progressContainer').style.display = 'none';
        document.getElementById('estadoMsg').style.display = 'none';
        document.getElementById('resultadosContainer').style.display = 'block';
        document.getElementById('exportarBtn').disabled = false;

        // Habilitar botones
        document.getElementById('iniciarBtn').disabled = false;

        // Mostrar mensaje de validación
        this.mostrarValidacionExito();
    }

    mostrarValidacionExito() {
        const validacionMsg = document.getElementById('validacionMsg');
        validacionMsg.className = 'alert alert-success mb-0';
        validacionMsg.style.display = 'block';
        document.getElementById('validacionTxt').innerHTML = 
            '<i class="fas fa-check-circle"></i> <strong>¡Nivel 5 Completado!</strong> Has procesado exitosamente 250,000 registros sin congelar la interfaz. Proyecto finalizado con éxito.';
    }

    exportarJSON() {
        if (!this.resultadosFinales) {
            alert('No hay resultados para exportar');
            return;
        }

        const datosExportacion = {
            proyecto: 'Explorador de Ubicación y Sensores',
            nivel: 5,
            nombre: 'El Portal Cuántico',
            fechaGeneracion: new Date().toISOString(),
            totalRegistrosGenerados: 250000,
            analisis: {
                registrosValidos: this.resultadosFinales.registrosValidos,
                registrosFiltrados: this.resultadosFinales.registrosFiltrados,
                tasaValidez: this.resultadosFinales.tasaValidez,
                promedios: this.resultadosFinales.promedios,
                top10: this.resultadosFinales.top10
            }
        };

        const jsonString = JSON.stringify(datosExportacion, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resultados_nivel5_${new Date().getTime()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    manejarErrorWorker(error) {
        console.error('Error en Worker:', error);
        document.getElementById('estadoMsg').className = 'alert alert-danger mb-4';
        document.getElementById('estadoMsg').style.display = 'block';
        document.getElementById('estadoTxt').textContent = 'Error al procesar los datos: ' + error.message;
        document.getElementById('iniciarBtn').disabled = false;
    }

    limpiar() {
        // Resetear variables
        this.resultadosObtenidos = false;
        this.resultadosFinales = null;

        // Limpiar UI
        document.getElementById('progressContainer').style.display = 'none';
        document.getElementById('estadoMsg').style.display = 'none';
        document.getElementById('resultadosContainer').style.display = 'none';
        document.getElementById('validacionMsg').style.display = 'none';

        // Resetear valores
        document.getElementById('registrosValidos').textContent = '0';
        document.getElementById('registrosFiltrados').textContent = '0';
        document.getElementById('tasaValidez').textContent = '0%';
        document.getElementById('tempPromedioGeneral').textContent = '-';
        document.getElementById('humPromedioGeneral').textContent = '-';
        document.getElementById('presPromedioGeneral').textContent = '-';
        document.getElementById('topTemperaturas').innerHTML = '<span class="text-muted">Cargando...</span>';
        document.getElementById('topPresiones').innerHTML = '<span class="text-muted">Cargando...</span>';

        // Habilitar/deshabilitar botones
        document.getElementById('iniciarBtn').disabled = false;
        document.getElementById('exportarBtn').disabled = true;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new Nivel5();
});
