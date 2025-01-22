const tablero = document.getElementById('tablero-juego');
const turnoIndicador = document.getElementById('turno-indicador');
const columnas = 29;
const filas = 13;
let turno = 'x';
let celdasGanadoras = [];
let juegoTerminado = false;
let modoJuego = null;
let victoriasX = 0;
let victoriasO = 0;

// Función para iniciar el juego

function iniciarJuego(modo) {
    modoJuego = modo;
    if (modo === '2jugadores') {
        const nombreJugadorX = prompt("Ingrese el nombre del jugador X:");
        const nombreJugadorO = prompt("Ingrese el nombre del jugador O:");
        document.getElementById('nombre-x').textContent = nombreJugadorX || "Jugador X";
        document.getElementById('nombre-o').textContent = nombreJugadorO || "Jugador O";
    } else {
        document.getElementById('nombre-x').textContent = "Jugador X";
        document.getElementById('nombre-o').textContent = "Bot";
    }
    document.getElementById('overlay').style.display = 'none';
    crearTablero();
    actualizarIndicadorTurno();
}

// Función para actualizar el indicador de turno
function actualizarIndicadorTurno() {
    if (!juegoTerminado) {
        const jugadorActual = turno === 'x' ? 'X (' + document.getElementById('nombre-x').textContent + ')' : 'O (' + document.getElementById('nombre-o').textContent + ')';
        turnoIndicador.textContent = `Turno del jugador: ${jugadorActual}`;
    }
}

// Función para crear el tablero
function crearTablero() {
    tablero.style.gridTemplateColumns = `repeat(${columnas}, 50px)`;
    tablero.style.gridTemplateRows = `repeat(${filas}, 50px)`;
    tablero.innerHTML = '';

    for (let i = 0; i < filas; i++) {
        for (let j = 0; j < columnas; j++) {
            const celda = document.createElement('div');
            celda.classList.add('celda');
            celda.dataset.fila = i;
            celda.dataset.columna = j;
            celda.addEventListener('click', () => manejarClick(celda));
            tablero.appendChild(celda);
        }
    }

    mostrarBotonReiniciar();
}

function manejarClick(celda) {
    if (juegoTerminado || celda.classList.contains('x') || celda.classList.contains('o')) return;

    celda.classList.add(turno);
    celda.textContent = turno.toUpperCase();

    if (comprobarVictoria()) {
        dibujarLineaGanadora();
        turnoIndicador.textContent = `¡Jugador ${turno.toUpperCase()} ha ganado!`;

        if (turno === 'x') victoriasX++;
        else victoriasO++;

        actualizarMarcadores();
        juegoTerminado = true;

        setTimeout(() => {
            if (confirm(turnoIndicador.textContent + "¿Quieres jugar otra partida?")) {
                reiniciarJuego();
            }
        }, 500);
        return;
    }

    turno = turno === 'x' ? 'o' : 'x';
    actualizarIndicadorTurno();

    if (modoJuego === 'bot' && turno === 'o' && !juegoTerminado) {
        setTimeout(movimientoBot, 500);
    }
}
// Funciones auxiliares
function actualizarMarcadores() {
    document.getElementById('victorias-x').textContent = victoriasX;
    document.getElementById('victorias-o').textContent = victoriasO;
}
// Función para manejar el turno del bot

function movimientoBot() {
    if (juegoTerminado) return;

    let celdaElegida;

    // 1. Crear líneas propias de 4 (prioridad máxima)
    celdaElegida = detectarLineasCriticas('x', 4);

    // 2. Bloquear líneas de 4 del oponente (segunda prioridad)
    if (!celdaElegida) {
        celdaElegida = detectarLineasCriticas('o', 4);
    }

    // 3. Crear líneas propias de 3 (tercera prioridad)
    if (!celdaElegida) {
        celdaElegida = detectarLineasCriticas('o', 3);
    }

    // 4. Bloquear líneas de 3 del oponente (cuarta prioridad)
    if (!celdaElegida) {
        celdaElegida = detectarLineasCriticas('x', 3);
    }

    // 5. Colocar cerca de las marcas del oponente
    if (!celdaElegida) {
        celdaElegida = buscarCercaOponente();
    }

    // 6. Si no hay opciones estratégicas, colocar al azar
    if (!celdaElegida) {
        const celdasVacias = Array.from(document.querySelectorAll('.celda')).filter(
            celda => !celda.classList.contains('x') && !celda.classList.contains('o')
        );
        if (celdasVacias.length > 0) {
            celdaElegida = celdasVacias[Math.floor(Math.random() * celdasVacias.length)];
        }
    }

    if (celdaElegida) {
        celdaElegida.classList.add(turno);
        celdaElegida.textContent = turno.toUpperCase();

        if (comprobarVictoria()) {
            dibujarLineaGanadora();
            turnoIndicador.textContent = `¡Jugador ${turno.toUpperCase()} ha ganado!`;
            victoriasO++;
            actualizarMarcadores();
            juegoTerminado = true;

            setTimeout(() => {
                if (confirm(turnoIndicador.textContent + ", ¿Quieres jugar otra partida?")) {
                    reiniciarJuego();
                }
            }, 500);
            return;
        }

        turno = turno === 'x' ? 'o' : 'x'; // Alternar el turno al jugador
        actualizarIndicadorTurno(); // Actualizar el indicador tras el turno del bot
    }
}

// Nueva función para buscar celdas cerca del oponente
function buscarCercaOponente() {
    const celdasOponente = Array.from(document.querySelectorAll('.celda')).filter(
        celda => celda.classList.contains('x')
    );

    if (celdasOponente.length === 0) {
        // Si es el primer movimiento, colocar en una posición estratégica
        const centroFila = Math.floor(filas / 2);
        const centroColumna = Math.floor(columnas / 2);
        const celdaCentro = obtenerCelda(centroFila, centroColumna);

        if (celdaCentro && !celdaCentro.classList.contains('x') && !celdaCentro.classList.contains('o')) {
            return celdaCentro;
        }
    }

    // Direcciones para buscar (incluyendo diagonales)
    const direcciones = [
        [1, 0], [-1, 0], [0, 1], [0, -1],
        [1, 1], [-1, -1], [1, -1], [-1, 1]
    ];

    // Buscar espacios vacíos cerca de las marcas del oponente
    for (const celdaOponente of celdasOponente) {
        const fila = parseInt(celdaOponente.dataset.fila);
        const columna = parseInt(celdaOponente.dataset.columna);

        // Buscar en todas las direcciones alrededor de la marca del oponente
        for (const [df, dc] of direcciones) {
            const nuevaFila = fila + df;
            const nuevaColumna = columna + dc;
            const celdaCercana = obtenerCelda(nuevaFila, nuevaColumna);

            if (celdaCercana &&
                !celdaCercana.classList.contains('x') &&
                !celdaCercana.classList.contains('o')) {

                // Verificar si esta posición podría ser parte de una línea potencial
                if (evaluarPosicionPotencial(nuevaFila, nuevaColumna)) {
                    return celdaCercana;
                }
            }
        }
    }

    return null;
}

// Nueva función para evaluar el potencial de una posición
function evaluarPosicionPotencial(fila, columna) {
    const direcciones = [
        [1, 0], [0, 1], [1, 1], [1, -1]
    ];

    for (const [df, dc] of direcciones) {
        let espaciosLibres = 1; // Contar la posición actual

        // Verificar en ambas direcciones
        for (let multiplicador of [-1, 1]) {
            for (let i = 1; i < 5; i++) {
                const nuevaFila = fila + (df * i * multiplicador);
                const nuevaColumna = columna + (dc * i * multiplicador);
                const celda = obtenerCelda(nuevaFila, nuevaColumna);

                if (celda &&
                    (!celda.classList.contains('x') && !celda.classList.contains('o') ||
                        celda.classList.contains('o'))) {
                    espaciosLibres++;
                } else {
                    break;
                }
            }
        }

        // Si hay suficiente espacio para una línea potencial
        if (espaciosLibres >= 5) {
            return true;
        }
    }

    return false;
}

function detectarLineasCriticas(simbolo, cantidad) {
    let mejorCelda = null;
    let maxEspaciosLibres = -1; // Para priorizar celdas con más espacios libres

    for (let fila = 0; fila < filas; fila++) {
        for (let columna = 0; columna < columnas; columna++) {
            const celda = obtenerCelda(fila, columna);

            if (celda && !celda.classList.contains('x') && !celda.classList.contains('o')) {
                // Simular colocar el símbolo en la celda
                celda.classList.add(simbolo);

                // Verificar si la celda crea una línea crítica
                const esCritico =
                    verificarEspacio(fila, columna, 1, 0, simbolo, cantidad) || // Horizontal
                    verificarEspacio(fila, columna, 0, 1, simbolo, cantidad) || // Vertical
                    verificarEspacio(fila, columna, 1, 1, simbolo, cantidad) || // Diagonal principal
                    verificarEspacio(fila, columna, 1, -1, simbolo, cantidad); // Diagonal inversa

                // Calcular espacios libres si es crítico
                let espaciosLibres = 0;
                if (esCritico) {
                    espaciosLibres = contarEspaciosLibres(fila, columna, simbolo);
                }

                // Deshacer la simulación
                celda.classList.remove(simbolo);

                // Si es crítico y tiene más espacios libres, actualizar la mejor celda
                if (esCritico && espaciosLibres > maxEspaciosLibres) {
                    mejorCelda = celda;
                    maxEspaciosLibres = espaciosLibres;
                }

                // Retornar de inmediato si encuentra una línea crítica con al menos un espacio libre
                if (esCritico && espaciosLibres >= cantidad - 1) {
                    return celda;
                }
            }
        }
    }

    // Retorna la mejor celda encontrada o null si no hay ninguna
    return mejorCelda;
}

// Función auxiliar para contar espacios libres alrededor de una celda
function contarEspaciosLibres(fila, columna, simbolo) {
    const direcciones = [
        [1, 0], [0, 1], [1, 1], [1, -1] // Horizontal, Vertical, Diagonal Principal, Diagonal Inversa
    ];
    let espaciosLibres = 0;

    for (const [df, dc] of direcciones) {
        // Contar espacios libres hacia adelante
        for (let i = 1; i < 5; i++) {
            const nuevaFila = fila + i * df;
            const nuevaColumna = columna + i * dc;
            const celda = obtenerCelda(nuevaFila, nuevaColumna);

            if (celda && !celda.classList.contains('x') && !celda.classList.contains('o')) {
                espaciosLibres++;
            } else {
                break;
            }
        }

        // Contar espacios libres hacia atrás
        for (let i = 1; i < 5; i++) {
            const nuevaFila = fila - i * df;
            const nuevaColumna = columna - i * dc;
            const celda = obtenerCelda(nuevaFila, nuevaColumna);

            if (celda && !celda.classList.contains('x') && !celda.classList.contains('o')) {
                espaciosLibres++;
            } else {
                break;
            }
        }
    }

    return espaciosLibres;
}

// Función para verificar líneas críticas con espacio en ambos lados
function verificarEspacio(fila, columna, direccionFila, direccionColumna, simbolo, cantidad) {
    let contador = 0;

    // Contar en la dirección positiva
    for (let i = 1; i <= cantidad; i++) {
        const nuevaFila = fila + i * direccionFila;
        const nuevaColumna = columna + i * direccionColumna;
        const celda = obtenerCelda(nuevaFila, nuevaColumna);

        if (celda && celda.classList.contains(simbolo)) {
            contador++;
        } else if (celda && !celda.classList.contains('x') && !celda.classList.contains('o')) {
            continue;
        } else {
            break;
        }
    }

    // Contar en la dirección opuesta
    for (let i = 1; i <= cantidad; i++) {
        const nuevaFila = fila - i * direccionFila;
        const nuevaColumna = columna - i * direccionColumna;
        const celda = obtenerCelda(nuevaFila, nuevaColumna);

        if (celda && celda.classList.contains(simbolo)) {
            contador++;
        } else if (celda && !celda.classList.contains('x') && !celda.classList.contains('o')) {
            continue;
        } else {
            break;
        }
    }

    return contador === cantidad;
}

// Función para buscar una celda vacía cercana a las marcas del bot
// Función para comprobar la victoria
function comprobarVictoria() {
    celdasGanadoras = [];

    for (let fila = 0; fila < filas; fila++) {
        for (let columna = 0; columna < columnas; columna++) {
            const celda = obtenerCelda(fila, columna);

            if (celda && (celda.classList.contains('x') || celda.classList.contains('o'))) {
                if (
                    verificarLinea(fila, columna, 1, 0, celda) ||  // Horizontal
                    verificarLinea(fila, columna, 0, 1, celda) ||  // Vertical
                    verificarLinea(fila, columna, 1, 1, celda) ||  // Diagonal principal
                    verificarLinea(fila, columna, 1, -1, celda)    // Diagonal inversa
                ) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Función para verificar 5 celdas consecutivas
function verificarLinea(fila, columna, direccionFila, direccionColumna, celda) {
    let contador = 1;
    let celdasEnLinea = [obtenerCelda(fila, columna)];

    for (let i = 1; i < 5; i++) {
        const nuevaFila = fila + i * direccionFila;
        const nuevaColumna = columna + i * direccionColumna;

        if (nuevaFila >= 0 && nuevaFila < filas &&
            nuevaColumna >= 0 && nuevaColumna < columnas &&
            obtenerCelda(nuevaFila, nuevaColumna) &&
            obtenerCelda(nuevaFila, nuevaColumna).classList.contains(celda.classList.contains('x') ? 'x' : 'o')
        ) {
            contador++;
            celdasEnLinea.push(obtenerCelda(nuevaFila, nuevaColumna));
        } else {
            break;
        }
    }

    for (let i = 1; i < 5; i++) {
        const nuevaFila = fila - i * direccionFila;
        const nuevaColumna = columna - i * direccionColumna;

        if (nuevaFila >= 0 && nuevaFila < filas &&
            nuevaColumna >= 0 && nuevaColumna < columnas &&
            obtenerCelda(nuevaFila, nuevaColumna) &&
            obtenerCelda(nuevaFila, nuevaColumna).classList.contains(celda.classList.contains('x') ? 'x' : 'o')
        ) {
            contador++;
            celdasEnLinea.push(obtenerCelda(nuevaFila, nuevaColumna));
        } else {
            break;
        }
    }

    if (contador >= 5) {
        celdasGanadoras = celdasEnLinea;
        return true;
    }
    return false;
}

// Función para obtener la celda
function obtenerCelda(fila, columna) {
    return document.querySelector(`[data-fila='${fila}'][data-columna='${columna}']`);
}

// Función para dibujar la línea ganadora
function dibujarLineaGanadora() {
    celdasGanadoras.forEach(celda => {
        celda.classList.add('ganadora');
    });
}

// Función para mostrar el botón de reiniciar
// function mostrarBotonReiniciar() {
//     let botonReiniciar = document.querySelector('#reiniciar-btn');

//     if (!botonReiniciar) {
//         botonReiniciar = document.createElement('button');
//         botonReiniciar.id = 'reiniciar-btn';
//         botonReiniciar.textContent = 'Reiniciar partida';
//         botonReiniciar.addEventListener('click', () => {
//             document.getElementById('overlay').style.display = 'flex';
//             reiniciarJuego();
//         });
//         document.body.appendChild(botonReiniciar);
//     }
// }
// // Función para reiniciar el juego
// function reiniciarJuego() {
//     const celdas = document.querySelectorAll('.celda');
//     celdas.forEach(celda => {
//         celda.classList.remove('x', 'o', 'ganadora');
//         celda.textContent = '';
//     });

//     celdasGanadoras = [];
//     turno = 'x';
//     juegoTerminado = false;
// }

function mostrarBotonReiniciar() {
    let botonReiniciar = document.querySelector('#reiniciar-btn');

    if (!botonReiniciar) {
        botonReiniciar = document.createElement('button');
        botonReiniciar.id = 'reiniciar-btn';
        botonReiniciar.textContent = 'Reiniciar partida';
        botonReiniciar.addEventListener('click', reiniciarJuego);
        document.body.appendChild(botonReiniciar);
    }
}

// Función para reiniciar el juego
function reiniciarJuego() {
    const celdas = document.querySelectorAll('.celda');
    celdas.forEach(celda => {
        celda.classList.remove('x', 'o', 'ganadora');
        celda.textContent = '';
    });

    celdasGanadoras = [];
    turno = 'x';
    juegoTerminado = false;
    actualizarIndicadorTurno(); // Actualizar el indicador del turno al estado inicial
}
crearTablero();
