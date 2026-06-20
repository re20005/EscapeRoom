let worker = null;
let resultadosObtenidos = false;
let datosActuales = null;

function crearWorker() {
    const workerCode = `
        self.onmessage = function(event) {
            const datos = event.data;
            const total = datos.length;
            let validos = [];
            let invalidos = 0;

            for (let i = 0; i < total; i++) {
                const d = datos[i];
                if (d.temperatura >= 0 && d.humedad >= 0 && d.presion >= 0) {
                    validos.push(d);
                } else {
                    invalidos++;
                }

                if (i % 25000 === 0) {
                    self.postMessage({
                        tipo: 'progreso',
                        progreso: ((i / total) * 100).toFixed(0),
                        procesados: i
                    });
                }
            }

            const temps = validos.map(d => d.temperatura);
            const hums = validos.map(d => d.humedad);
            const press = validos.map(d => d.presion);

            const resultados = {
                tipo: 'resultados',
                registrosValidos: validos.length,
                registrosFiltrados: invalidos,
                tasaValidez: ((validos.length / total) * 100).toFixed(2),
                promedios: {
                    temperatura: (temps.reduce((a, b) => a + b, 0) / validos.length).toFixed(2),
                    humedad: (hums.reduce((a, b) => a + b, 0) / validos.length).toFixed(2),
                    presion: (press.reduce((a, b) => a + b, 0) / validos.length).toFixed(2)
                },
                top10: {
                    temperaturas: temps.sort((a, b) => b - a).slice(0, 10).map(t => t.toFixed(2)),
                    presiones: press.sort((a, b) => b - a).slice(0, 10).map(p => p.toFixed(2))
                }
            };

            self.postMessage(resultados);
        };
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    worker = new Worker(workerUrl);
    worker.onmessage = (event) => manejarRespuesta(event.data);
}

function generarDatos() {
    const datos = [];
    for (let i = 0; i < 250000; i++) {
        const tieneNegativo = Math.random() < 0.15;
        let temperatura, humedad, presion;

        if (tieneNegativo) {
            const campo = Math.floor(Math.random() * 3);
            temperatura = campo === 0 ? -(Math.random() * 10) : (Math.random() * 40 + 10);
            humedad = campo === 1 ? -(Math.random() * 20) : (Math.random() * 100);
            presion = campo === 2 ? -(Math.random() * 50) : (Math.random() * 100 + 950);
        } else {
            temperatura = Math.random() * 40 + 10;
            humedad = Math.random() * 100;
            presion = Math.random() * 100 + 950;
        }

        datos.push({
            temperatura: parseFloat(temperatura.toFixed(2)),
            humedad: parseFloat(humedad.toFixed(2)),
            presion: parseFloat(presion.toFixed(2))
        });
    }
    return datos;
}

function manejarRespuesta(data) {
    if (data.tipo === 'progreso') {
        document.getElementById('progressBar').style.width = data.progreso + '%';
        document.getElementById('progressText').textContent = data.progreso + '%';
        document.getElementById('procesadosTxt').textContent = 
            'Registros: ' + data.procesados.toLocaleString() + ' / 250,000';
    } 
    else if (data.tipo === 'resultados') {
        mostrarResultados(data);
    }
}

function mostrarResultados(data) {
    document.getElementById('registrosValidos').textContent = 
        data.registrosValidos.toLocaleString();
    document.getElementById('registrosFiltrados').textContent = 
        data.registrosFiltrados.toLocaleString();
    document.getElementById('tasaValidez').textContent = data.tasaValidez + '%';

    document.getElementById('tempPromedioGeneral').textContent = data.promedios.temperatura + '°C';
    document.getElementById('humPromedioGeneral').textContent = data.promedios.humedad + '%';
    document.getElementById('presPromedioGeneral').textContent = data.promedios.presion + ' hPa';

    let htmlTemps = '';
    data.top10.temperaturas.forEach((temp, i) => {
        htmlTemps += `<div class="mb-2"><span class="badge bg-primary me-2">${i + 1}</span>${temp}°C</div>`;
    });
    document.getElementById('topTemperaturas').innerHTML = htmlTemps;

    let htmlPress = '';
    data.top10.presiones.forEach((pres, i) => {
        htmlPress += `<div class="mb-2"><span class="badge bg-warning text-dark me-2">${i + 1}</span>${pres} hPa</div>`;
    });
    document.getElementById('topPresiones').innerHTML = htmlPress;

    document.getElementById('progressContainer').style.display = 'none';
    document.getElementById('estadoMsg').style.display = 'none';
    document.getElementById('resultadosContainer').style.display = 'block';
    document.getElementById('exportarBtn').disabled = false;

    datosActuales = data;
    resultadosObtenidos = true;
    document.getElementById('iniciarBtn').disabled = false;
}

function iniciarProcesamiento() {
    if (resultadosObtenidos) {
        alert('Ya completaste este nivel. Haz clic en Limpiar.');
        return;
    }

    document.getElementById('progressContainer').style.display = 'block';
    document.getElementById('resultadosContainer').style.display = 'none';
    document.getElementById('estadoMsg').style.display = 'block';
    document.getElementById('estadoTxt').textContent = 'Generando 250,000 registros...';
    document.getElementById('iniciarBtn').disabled = true;

    setTimeout(() => {
        const datos = generarDatos();
        document.getElementById('estadoTxt').textContent = 'Procesando en Worker...';
        document.getElementById('progressBar').style.width = '0%';
        document.getElementById('progressText').textContent = '0%';
        worker.postMessage(datos);
    }, 300);
}

function exportarJSON() {
    if (!datosActuales) return;

    const exportacion = {
        proyecto: 'Explorador de Ubicación y Sensores',
        nivel: 5,
        nombre: 'El Portal Cuántico',
        fecha: new Date().toISOString(),
        totalRegistrosGenerados: 250000,
        analisis: datosActuales
    };

    const blob = new Blob([JSON.stringify(exportacion, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resultados_nivel5_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function limpiar() {
    resultadosObtenidos = false;
    datosActuales = null;

    document.getElementById('progressContainer').style.display = 'none';
    document.getElementById('estadoMsg').style.display = 'none';
    document.getElementById('resultadosContainer').style.display = 'none';

    document.getElementById('registrosValidos').textContent = '0';
    document.getElementById('registrosFiltrados').textContent = '0';
    document.getElementById('tasaValidez').textContent = '0%';
    document.getElementById('tempPromedioGeneral').textContent = '-';
    document.getElementById('humPromedioGeneral').textContent = '-';
    document.getElementById('presPromedioGeneral').textContent = '-';
    document.getElementById('topTemperaturas').innerHTML = '<span class="text-muted">-</span>';
    document.getElementById('topPresiones').innerHTML = '<span class="text-muted">-</span>';

    document.getElementById('iniciarBtn').disabled = false;
    document.getElementById('exportarBtn').disabled = true;
}

document.addEventListener('DOMContentLoaded', () => {
    crearWorker();
    document.getElementById('iniciarBtn').addEventListener('click', iniciarProcesamiento);
    document.getElementById('exportarBtn').addEventListener('click', exportarJSON);
    document.getElementById('limpiarBtn').addEventListener('click', limpiar);
});
