const tablero = document.getElementById('tablero-juego');
const turnoIndicador = document.getElementById('turno-indicador');
let columnas; // Definido dinámicamente
let filas;    // Definido dinámicamente
let turnoInicial = 'x'; // Determina quién inicia la partida
let turno = turnoInicial; // Turno actual
let celdasGanadoras = [];
let juegoTerminado = false;
let modoJuego = null;
let victoriasX = 0;
let victoriasO = 0;
let derrotasX = 0;
let derrotasO = 0;
let JugadorO = "";
let JugadorX = "";

// Detectar dispositivo y ajustar el tablero
function ajustarDimensionesTablero() {
    const anchoPantalla = window.innerWidth;

    if (anchoPantalla <= 768) { // Dispositivos móviles
        columnas = 20;
        filas = 11;
    } else if (anchoPantalla < 1024) { // Tablets
        columnas = 25;
        filas = 13;
    }else if (anchoPantalla >= 1024 && anchoPantalla <= 1200) { // Tablets
        columnas = 23;
        filas = 14;
    }
     else { // Computadoras
        columnas = 33;
        filas = 14;
    }
}

// Función para iniciar el juego
function iniciarJuego(modo) {
    modoJuego = modo;
    if (modo === '2jugadores') {
        const nombreJugadorX = prompt("Ingrese el nombre del jugador X:");
        const nombreJugadorO = prompt("Ingrese el nombre del jugador O:");
        JugadorO = nombreJugadorO || "Jugador O";
        JugadorX = nombreJugadorX || "Jugador X";

        document.getElementById('nombre-x').textContent = JugadorX;
        document.getElementById('nombre-o').textContent = JugadorO;
    } else {
        const nombreJugadorX = prompt("Ingrese el nombre del jugador X:");
        JugadorX = nombreJugadorX || "Jugador X";
        JugadorO = "Bot";

        document.getElementById('nombre-x').textContent = JugadorX;
        document.getElementById('nombre-o').textContent = "Bot";
    }
    document.getElementById('overlay').style.display = 'none';
    ajustarDimensionesTablero(); // Ajustar dimensiones antes de crear el tablero
    crearTablero();
    actualizarIndicadorTurno();
}

// Función para actualizar el indicador de turno
function actualizarIndicadorTurno() {
    if (!juegoTerminado) {
        const jugadorActual = turno === 'x' ? `X (${JugadorX})` : `O (${JugadorO})`;
        turnoIndicador.textContent = `Turno del jugador: ${jugadorActual}`;
    }
}

// Función para crear el tablero
function crearTablero() {

    let tamañoCelda;
    if (window.innerWidth < 1024) {
        tamañoCelda = 30; // Tamaño para pantallas pequeñas
    } else if (window.innerWidth < 1100) {
        tamañoCelda = 40; // Tamaño para pantallas medianas
    } else {
        tamañoCelda = 40; // Tamaño para pantallas grandes
    }

    tablero.style.gridTemplateColumns = `repeat(${columnas}, ${tamañoCelda}px)`;
    tablero.style.gridTemplateRows = `repeat(${filas}, ${tamañoCelda}px)`;
    tablero.innerHTML = ''; // Limpiar tablero antes de crear

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
    actualizarIndicadorTurno(); // Actualizar turno después de crear
}

function manejarClick(celda) {
    if (juegoTerminado || celda.classList.contains('x') || celda.classList.contains('o') || (modoJuego === 'bot' && turno === 'o')) {
        return;
    }

    celda.classList.add(turno);
    celda.textContent = turno.toUpperCase();

    if (comprobarVictoria()) {
        dibujarLineaGanadora();

        const overlayVictoria = document.getElementById("overlay-victoria");
        const textoVictoria = document.getElementById("texto-victoria");

        if (turno === 'x') {
            textoVictoria.textContent = `¡Felicidades ${JugadorX} (X), has ganado!`;
            victoriasX++;
            derrotasO++;
        } else {
            textoVictoria.textContent = `¡Felicidades ${JugadorO} (O), has ganado!`;
            victoriasO++;
            derrotasX++;
        }

        actualizarMarcadores();
        juegoTerminado = true;

        overlayVictoria.style.display = "flex";
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
    document.getElementById('victorias-x').textContent = `V ${victoriasX}`;
    document.getElementById('derrotas-x').textContent = `D ${derrotasX}`;
    document.getElementById('victorias-o').textContent = `V ${victoriasO}`;
    document.getElementById('derrotas-o').textContent = `D ${derrotasO}`;
}
// Función para manejar el turno del bot
let jugadasBot = 0;


function movimientoBot() {
    if (juegoTerminado) return;

    let celdaElegida;

    // Primera jugada del bot: cerca de la primera marca del oponente
    if (jugadasBot === 0) {
        const celdasOponente = Array.from(document.querySelectorAll('.celda')).filter(
            celda => celda.classList.contains('x')
        );

        if (celdasOponente.length > 0) {
            const primeraCeldaOponente = celdasOponente[0];
            const fila = parseInt(primeraCeldaOponente.dataset.fila);
            const columna = parseInt(primeraCeldaOponente.dataset.columna);

            // Direcciones alrededor de la primera marca del oponente
            const direcciones = [
                [1, 0], [-1, 0], [0, 1], [0, -1],
                [1, 1], [-1, -1], [1, -1], [-1, 1]
            ];

            // Buscar posiciones vacías cerca del oponente
            const posicionesCercanas = direcciones
                .map(([df, dc]) => obtenerCelda(fila + df, columna + dc))
                .filter(celda => celda && !celda.classList.contains('x') && !celda.classList.contains('o'));

            // Elegir una posición aleatoria
            if (posicionesCercanas.length > 0) {
                celdaElegida = posicionesCercanas[Math.floor(Math.random() * posicionesCercanas.length)];
            }
        }

        // Si no hay oponentes, elegir una celda vacía al azar
        if (!celdaElegida) {
            const celdasVacias = Array.from(document.querySelectorAll('.celda')).filter(
                celda => !celda.classList.contains('x') && !celda.classList.contains('o')
            );
            if (celdasVacias.length > 0) {
                celdaElegida = celdasVacias[Math.floor(Math.random() * celdasVacias.length)];
            }
        }
    }

    // Segunda jugada del bot: cerca de nuestra propia primera marca
    if (jugadasBot === 1 && !celdaElegida) {
        const celdasBot = Array.from(document.querySelectorAll('.celda')).filter(
            celda => celda.classList.contains('o')
        );

        if (celdasBot.length > 0) {
            const primeraCeldaBot = celdasBot[0];
            const fila = parseInt(primeraCeldaBot.dataset.fila);
            const columna = parseInt(primeraCeldaBot.dataset.columna);

            // Direcciones alrededor de nuestra primera marca
            const direcciones = [
                [1, 0], [-1, 0], [0, 1], [0, -1],
                [1, 1], [-1, -1], [1, -1], [-1, 1]
            ];

            // Buscar posiciones vacías cerca de nuestra marca
            const posicionesCercanas = direcciones
                .map(([df, dc]) => obtenerCelda(fila + df, columna + dc))
                .filter(celda => celda && !celda.classList.contains('x') && !celda.classList.contains('o'));

            // Elegir una posición aleatoria
            if (posicionesCercanas.length > 0) {
                celdaElegida = posicionesCercanas[Math.floor(Math.random() * posicionesCercanas.length)];
            }
        }
    }

    // A partir de la tercera jugada, seguir las condicionales habituales
    if (jugadasBot >= 2 && !celdaElegida) {
        celdaElegida = analizarYActuar();
    }

    // Si no se encuentra una acción crítica, realizar un movimiento aleatorio
    if (!celdaElegida) {
        console.log("El bot elige una celda aleatoria.");
        const celdasVacias = Array.from(document.querySelectorAll('.celda')).filter(
            celda => !celda.classList.contains('x') && !celda.classList.contains('o')
        );
        if (celdasVacias.length > 0) {
            celdaElegida = celdasVacias[Math.floor(Math.random() * celdasVacias.length)];
        }
    }

    // Realizar el movimiento
    if (celdaElegida) {
        celdaElegida.classList.add(turno);
        celdaElegida.textContent = turno.toUpperCase();

        if (comprobarVictoria()) {
            dibujarLineaGanadora();
            const overlayVictoria = document.getElementById("overlay-victoria");
            const textoVictoria = document.getElementById("texto-victoria");
            if (turno === 'x') {
                textoVictoria.textContent = `¡Felicidades ${JugadorX}, has ganado!`;
            } else {
                textoVictoria.textContent = `¡El ${JugadorO}, te ha ganado!`;
            }
            victoriasO++;
            actualizarMarcadores();
            juegoTerminado = true;

            overlayVictoria.style.display = "flex";
            return;
        }

        turno = turno === 'x' ? 'o' : 'x';
        actualizarIndicadorTurno();
        jugadasBot++; // Incrementar el contador de jugadas del bot
        console.log(jugadasBot)
    }
}


function analizarYActuar() {
    let celdaElegida = null;

    // 1. Priorizar ganar inmediatamente
    celdaElegida = detectarLineasCriticas('o', 5, true);
    if (celdaElegida) return celdaElegida;

    celdaElegida = detectarLineasCriticas('o', 5);
    if (celdaElegida) return celdaElegida;

    // 1. Priorizar ganar inmediatamente
    celdaElegida = detectarLineasCriticas('o', 4, true);
    if (celdaElegida) return celdaElegida;
    celdaElegida = detectarLineasCriticas('o', 4, false);
    if (celdaElegida) return celdaElegida;

    celdaElegida = detectarLineasCriticas('o', 4);
    if (celdaElegida) return celdaElegida;

    celdaElegida = detectarLineasCriticas('x', 4, true);
    if (celdaElegida) return celdaElegida;
    // 2. Bloquear al oponente si está a punto de ganar (línea de 4 del contrincante)
    celdaElegida = detectarLineasCriticas('x', 4, false);
    if (celdaElegida) return celdaElegida;



    // 3. Bloquear línea de 3 del contrincante con 2 extremos disponibles
    celdaElegida = detectarLineasCriticas('x', 3, true); // true: analizar dos extremos
    if (celdaElegida) return celdaElegida;

    celdaElegida = detectarLineasCriticas('x', 4);
    if (celdaElegida) return celdaElegida;


    // 4. Intentar crear una línea de 3 propia con 2 extremos disponibles
    celdaElegida = detectarLineasCriticas('o', 3, true); // true: analizar dos extremos
    if (celdaElegida) return celdaElegida;

    // 5. Intentar crear una línea de 3 propia con 1 extremo disponible
    celdaElegida = detectarLineasCriticas('o', 3);
    if (celdaElegida) return celdaElegida;

    // 6. Bloquear línea de 3 del contrincante con 1 extremo disponible
    celdaElegida = detectarLineasCriticas('x', 3); // false: analizar un extremo
    if (celdaElegida) return celdaElegida;

    // 7. Intentar formar una línea de 2 propia con 2 extremos disponibles
    celdaElegida = detectarLineasCriticas('o', 2, true); // true: analizar dos extremos
    if (celdaElegida) return celdaElegida;

    // 8. Intentar formar una línea de 2 propia con 1 extremo disponible
    celdaElegida = detectarLineasCriticas('o', 2, false); // false: analizar un extremo
    if (celdaElegida) {
        return celdaElegida
    };

    // 9. Bloquear línea de 2 del contrincante con 2 extremos disponibles
    celdaElegida = detectarLineasCriticas('0', 1, true); // true: analizar dos extremos
    if (celdaElegida) return celdaElegida;

    celdaElegida = detectarLineasCriticas('o', 1);
    if (celdaElegida) return celdaElegida;

    // 11. Bloquear línea de 2 del contrincante con 1 extremo disponible
    celdaElegida = detectarLineasCriticas('x', 2, false); // false: analizar un extremo
    if (celdaElegida) return celdaElegida;

    // 10. Bloquear línea de 2 del contrincante con 1 extremo disponible
    celdaElegida = detectarLineasCriticas('x', 2, false); // false: analizar un extremo
    if (celdaElegida) return celdaElegida;

    return null; // Ninguna acción encontrada
}
function buscarCercanoEstrategico() {
    const celdasBot = Array.from(document.querySelectorAll('.celda')).filter(
        celda => celda.classList.contains('o')
    );

    // Si no hay marcas propias (caso extremo), retornar null
    if (celdasBot.length === 0) return null;

    // Direcciones posibles alrededor de nuestras marcas
    const direcciones = [
        [1, 0], [-1, 0], [0, 1], [0, -1], // Horizontales y verticales
        [1, 1], [-1, -1], [1, -1], [-1, 1] // Diagonales
    ];

    let celdaEstrategica = null;

    for (const celdaBot of celdasBot) {
        const fila = parseInt(celdaBot.dataset.fila);
        const columna = parseInt(celdaBot.dataset.columna);

        // Buscar posiciones vacías cercanas
        const posicionesCercanas = direcciones
            .map(([df, dc]) => obtenerCelda(fila + df, columna + dc))
            .filter(celda => celda && !celda.classList.contains('x') && !celda.classList.contains('o'));

        // Priorizar celdas estratégicas (que podrían formar una línea crítica)
        for (const celdaCercana of posicionesCercanas) {
            if (evaluarPosicionPotencial(parseInt(celdaCercana.dataset.fila), parseInt(celdaCercana.dataset.columna))) {
                return celdaCercana; // Retornar inmediatamente si encontramos una celda estratégica
            }
        }

        // Si no hay una posición estratégica pero hay una vacía cerca, guardar para usarla como último recurso
        if (!celdaEstrategica && posicionesCercanas.length > 0) {
            celdaEstrategica = posicionesCercanas[0];
        }
    }

    // Retornar la mejor opción encontrada o null si no hay
    return celdaEstrategica;
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
function detectarLineasCriticas(simbolo, cantidad, analizarDosExtremos = false) {
    for (let fila = 0; fila < filas; fila++) {
        for (let columna = 0; columna < columnas; columna++) {
            const celda = obtenerCelda(fila, columna);

            if (celda && !celda.classList.contains('x') && !celda.classList.contains('o')) {
                // Simular colocar el símbolo en la celda
                celda.classList.add(simbolo);

                // Verificar líneas críticas
                const esCritico =
                    verificarEspacio(fila, columna, 1, 0, simbolo, cantidad, analizarDosExtremos) || // Horizontal
                    verificarEspacio(fila, columna, 0, 1, simbolo, cantidad, analizarDosExtremos) || // Vertical
                    verificarEspacio(fila, columna, 1, 1, simbolo, cantidad, analizarDosExtremos) || // Diagonal principal
                    verificarEspacio(fila, columna, 1, -1, simbolo, cantidad, analizarDosExtremos); // Diagonal inversa

                // Deshacer la simulación
                celda.classList.remove(simbolo);

                if (esCritico) return celda; // Retornar la celda crítica encontrada
            }
        }
    }
    return null; // No se encontraron líneas críticas
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
function verificarEspacio(fila, columna, direccionFila, direccionColumna, simbolo, cantidad, analizarDosExtremos = false) {
    let contador = 0;
    let extremosLibres = 0;

    // Verificar en la dirección positiva
    for (let i = 1; i <= cantidad; i++) {
        const nuevaFila = fila + i * direccionFila;
        const nuevaColumna = columna + i * direccionColumna;
        const celda = obtenerCelda(nuevaFila, nuevaColumna);

        if (celda && celda.classList.contains(simbolo)) {
            contador++;
        } else if (celda && !celda.classList.contains('x') && !celda.classList.contains('o')) {
            extremosLibres++;
            break;
        } else {
            break;
        }
    }

    // Verificar en la dirección opuesta
    for (let i = 1; i <= cantidad; i++) {
        const nuevaFila = fila - i * direccionFila;
        const nuevaColumna = columna - i * direccionColumna;
        const celda = obtenerCelda(nuevaFila, nuevaColumna);

        if (celda && celda.classList.contains(simbolo)) {
            contador++;
        } else if (celda && !celda.classList.contains('x') && !celda.classList.contains('o')) {
            extremosLibres++;
            break;
        } else {
            break;
        }
    }

    if (analizarDosExtremos) {
        return contador === cantidad && extremosLibres === 2;
    } else {
        return contador === cantidad && extremosLibres >= 1;
    }
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

function mostrarBotonReiniciar() {
    let botonReiniciar = document.querySelector('#reiniciar-btn');

    if (!botonReiniciar) {
        botonReiniciar = document.createElement('button');
        botonReiniciar.id = 'reiniciar-btn';
        botonReiniciar.textContent = 'Nueva partida';
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
    juegoTerminado = false;
    jugadasBot = 0;

    // Ocultar mensaje de victoria
    document.getElementById("overlay-victoria").style.display = "none";

    // Alternar el turno inicial
    turnoInicial = turnoInicial === 'x' ? 'o' : 'x';
    turno = turnoInicial;

    // Mostrar el overlay del turno inicial
    const overlay = document.getElementById('overlay-turno');
    const mensajeTurno = document.getElementById('mensaje-turno');
    const jugadorInicial = turnoInicial === 'x'
        ? `(${document.getElementById('nombre-x').textContent}) X`
        : `(${document.getElementById('nombre-o').textContent}) O`;
    mensajeTurno.textContent = `¡Parte ${jugadorInicial}!`;
    overlay.style.display = 'flex';

    const botonComenzar = document.getElementById('boton-comenzar');
    botonComenzar.onclick = () => {
        overlay.style.display = 'none';
        actualizarIndicadorTurno();

        // Si el bot inicia, realizar su jugada inicial
        if (modoJuego === 'bot' && turno === 'o') {
            setTimeout(movimientoBot, 500);
        }
    };
}

function volverAlMenu() {
    // Oculta el mensaje de victoria
    document.getElementById("overlay-victoria").style.display = "none";

    // Muestra el menú principal
    document.getElementById("overlay").style.display = "flex";

    // Reinicia el estado del juego
    juegoTerminado = false;
    turnoInicial = 'x'; // Reinicia el turno inicial
    turno = turnoInicial;
    victoriasX = 0;
    victoriasO = 0;
    derrotasX = 0;
    derrotasO = 0;
    JugadorO = "Jugador0"
    JugadorX = "JugadorX"
    document.getElementById('nombre-x').textContent = `${JugadorX}`;
    document.getElementById('nombre-o').textContent = `${JugadorO}`;
    document.getElementById('victorias-x').textContent = `V ${victoriasX}`;
    document.getElementById('derrotas-x').textContent = `D ${derrotasX}`;
    document.getElementById('victorias-o').textContent = `V ${victoriasO}`;
    document.getElementById('derrotas-o').textContent = `D ${derrotasO}`;
    celdasGanadoras = [];
    crearTablero(); // Limpia el tablero
    actualizarIndicadorTurno(); // Actualiza el indicador de turno
}

// Detectar cambio de tamaño de ventana
window.addEventListener("resize", () => {
    ajustarDimensionesTablero();
    crearTablero();
});

// Inicializar el tablero
ajustarDimensionesTablero();

crearTablero();
