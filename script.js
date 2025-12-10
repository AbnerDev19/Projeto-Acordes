const notesMap = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * SHAPES BASE (Sistema CAGED + Pestanas Dedicadas)
 * O algoritmo pega esses desenhos e arrasta eles pelo braço do violão.
 * baseRoot: Onde fica a tônica desse desenho na corda solta?
 */
const chordShapes = {
    'Major': [
        // Shape E (Pestana Clássica na corda 6) - Tônica na corda E (0)
        { name: 'E-Shape (Barre)', baseRoot: 4, strings: [0, 2, 2, 1, 0, 0], fingers: [null, 3, 4, 2, null, null], barreStr: [0, 5], type: 'barre', rootString: 6 },

        // Shape A (Pestana Clássica na corda 5) - Tônica na corda A (9 -> 0 no index relativo)
        { name: 'A-Shape (Barre)', baseRoot: 9, strings: [-1, 0, 2, 2, 2, 0], fingers: [null, null, 2, 3, 4, null], barreStr: [1, 5], type: 'barre', rootString: 5 },

        // Shape C (Aberto)
        { name: 'C-Shape (Open)', baseRoot: 0, strings: [-1, 3, 2, 0, 1, 0], fingers: [null, 3, 2, null, 1, null], barreStr: [], type: 'open', rootString: 5 },

        // Shape D (Aberto)
        { name: 'D-Shape (Open)', baseRoot: 2, strings: [-1, -1, 0, 2, 3, 2], fingers: [null, null, null, 1, 3, 2], barreStr: [], type: 'open', rootString: 4 },

        // Shape G (Aberto)
        { name: 'G-Shape (Open)', baseRoot: 7, strings: [3, 2, 0, 0, 0, 3], fingers: [2, 1, null, null, null, 3], barreStr: [], type: 'open', rootString: 6 }
    ],
    'Minor': [
        // Shape Em (Pestana Clássica corda 6)
        { name: 'Em-Shape (Barre)', baseRoot: 4, strings: [0, 2, 2, 0, 0, 0], fingers: [null, 3, 4, null, null, null], barreStr: [0, 5], type: 'barre', rootString: 6 },

        // Shape Am (Pestana Clássica corda 5)
        { name: 'Am-Shape (Barre)', baseRoot: 9, strings: [-1, 0, 2, 2, 1, 0], fingers: [null, null, 3, 4, 2, null], barreStr: [1, 5], type: 'barre', rootString: 5 },

        // Shape Dm (Aberto)
        { name: 'Dm-Shape (Open)', baseRoot: 2, strings: [-1, -1, 0, 2, 3, 1], fingers: [null, null, null, 2, 3, 1], barreStr: [], type: 'open', rootString: 4 }
    ],
    '7': [
        { name: 'E7 (Barre)', baseRoot: 4, strings: [0, 2, 0, 1, 0, 0], fingers: [null, 2, null, 1, null, null], barreStr: [0, 5], type: 'barre', rootString: 6 },
        { name: 'A7 (Barre)', baseRoot: 9, strings: [-1, 0, 2, 0, 2, 0], fingers: [null, null, 2, null, 3, null], barreStr: [1, 5], type: 'barre', rootString: 5 },
        { name: 'C7 (Open)', baseRoot: 0, strings: [-1, 3, 2, 3, 1, 0], fingers: [null, 3, 2, 4, 1, null], barreStr: [], type: 'open', rootString: 5 }
    ]
};

// --- ESTADO ---
let currentKey = 'C';
let currentRoot = 'C';
let currentType = 'Major';
let currentVariation = 0;
let allowBarre = true;

// --- INIT ---
function init() {
    renderGrid('keyGrid', 'key');
    renderGrid('rootGrid', 'root');
    renderTypeGrid();
    updateDisplay();
}

// --- GERADOR (CORE) ---
function generateChords(rootNote, type) {
    const rootIndex = notesMap.indexOf(rootNote);
    const shapes = chordShapes[type] || [];
    const generated = [];

    shapes.forEach(shape => {
        // Cálculo de transposição
        let semitones = rootIndex - shape.baseRoot;
        if (semitones < 0) semitones += 12;

        // Se o shape for aberto mas precisar de transposição (semitones > 0), ele vira pestana automaticamente?
        // Sim, se usarmos o dedo indicador como "capotraste".
        // Mas para simplificar e garantir qualidade, vamos focar nos shapes que já são 'barre' 
        // ou shapes 'open' apenas quando a conta é exata (semitones == 0).

        // Exceção: Shape E e A viram pestanas perfeitas em qualquer lugar.

        let isValid = false;
        let isBarre = false;
        let startFret = 1;

        if (shape.type === 'barre') {
            isValid = true;
            isBarre = true;
            // Se semitones for 0 (Ex: E Major com shape E), vira aberto
            if (semitones === 0) isBarre = false;
        } else if (shape.type === 'open') {
            // Shapes abertos só são válidos na posição 0, ou se virarem pestana difícil
            // Vamos permitir apenas posição 0 para shapes "Open strict"
            if (semitones === 0) {
                isValid = true;
                isBarre = false;
            }
        }

        if (isValid) {
            // Criar posições
            const newPositions = shape.strings.map(p => p === -1 ? -1 : p + semitones);

            // Dados da pestana
            let barreData = null;
            if (isBarre) {
                // A pestana fica na casa "semitones" (se E shape base é 0, F é 1)
                // Se semitones for 0, não tem pestana (é corda solta)
                if (semitones > 0) {
                    barreData = { fret: semitones, strings: shape.barreStr };
                }
            }

            generated.push({
                positions: newPositions,
                fingers: shape.fingers,
                isBarre: isBarre,
                barre: barreData,
                name: shape.name
            });
        }
    });

    // Se a lista ficou vazia (ex: procurou D# no shape C-Open e não achou), 
    // força a criação usando shapes de pestana genéricos (transposição forçada).
    if (generated.length === 0 || generated.every(c => !c.isBarre)) {
        // Fallback: Gerar pestana baseada em E ou A forçadamente
        const fallbackShapes = chordShapes[type].filter(s => s.type === 'barre');
        fallbackShapes.forEach(shape => {
            let semitones = rootIndex - shape.baseRoot;
            if (semitones < 0) semitones += 12;
            const newPositions = shape.strings.map(p => p === -1 ? -1 : p + semitones);

            // Verifica duplicidade antes de adicionar
            const isDup = generated.some(g => JSON.stringify(g.positions) === JSON.stringify(newPositions));

            if (!isDup) {
                generated.push({
                    positions: newPositions,
                    fingers: shape.fingers,
                    isBarre: semitones > 0,
                    barre: semitones > 0 ? { fret: semitones, strings: shape.barreStr } : null
                });
            }
        });
    }

    // Ordenar: Abertos primeiro, depois menor casa para maior casa
    return generated.sort((a, b) => {
        if (!a.isBarre && b.isBarre) return -1;
        if (a.isBarre && !b.isBarre) return 1;

        const minA = Math.min(...a.positions.filter(p => p > 0));
        const minB = Math.min(...b.positions.filter(p => p > 0));
        return minA - minB;
    });
}

function updateDisplay() {
    // Labels Update
    document.getElementById('labelKey').innerText = currentKey;
    document.getElementById('labelRoot').innerText = currentRoot;
    document.getElementById('labelType').innerText = currentType;
    document.getElementById('displaySymbol').innerText = currentRoot + (currentType === 'Major' ? '' : (currentType === 'Minor' ? 'm' : currentType));
    document.getElementById('displayName').innerText = `${currentRoot} ${currentType}`;

    // Campo Harmônico
    document.getElementById('harmonicKeyName').innerText = currentKey;
    renderHarmonicField(currentKey);

    // Gerar Acordes
    let variations = generateChords(currentRoot, currentType);

    // Filtro
    if (!allowBarre) {
        variations = variations.filter(c => !c.isBarre);
    }

    // Feedback visual se não houver acordes
    if (variations.length === 0) {
        document.getElementById('markersLayer').innerHTML = '';
        document.getElementById('displayVariation').innerText = "Requer Pestana";
        document.getElementById('fretOffset').style.opacity = '0';
        document.getElementById('guitarNut').style.opacity = '1';
        return;
    }

    if (currentVariation >= variations.length) currentVariation = 0;
    if (currentVariation < 0) currentVariation = variations.length - 1;

    document.getElementById('displayVariation').innerText = `Opção ${currentVariation + 1}/${variations.length}`;
    renderFretboard(variations[currentVariation]);
}

function renderFretboard(data) {
    const layer = document.getElementById('markersLayer');
    const nut = document.getElementById('guitarNut');
    const fretOffsetEl = document.getElementById('fretOffset');
    layer.innerHTML = '';

    // Casas ativas
    const activeFrets = data.positions.filter(p => p > 0);
    const minFret = activeFrets.length ? Math.min(...activeFrets) : 0;

    // Definir viewport (quais casas mostrar)
    let startFret = 1;
    if (data.barre) {
        startFret = data.barre.fret;
    } else if (minFret > 2) {
        startFret = minFret;
    }

    // Nut vs Offset
    if (startFret > 1) {
        nut.style.opacity = '0';
        fretOffsetEl.innerText = `${startFret}ª`;
        fretOffsetEl.style.opacity = '1';
    } else {
        nut.style.opacity = '1';
        fretOffsetEl.style.opacity = '0';
    }

    // 1. Render Barre
    if (data.isBarre && data.barre) {
        const b = document.createElement('div');
        b.className = 'barre';

        const strMin = Math.min(...data.barre.strings);
        const strMax = Math.max(...data.barre.strings);

        // CSS Left %
        b.style.left = `${strMin * 20}%`;
        b.style.width = `calc(${(strMax - strMin) * 20}% + 4px)`;

        // CSS Top % (Relativo ao startFret)
        const relFret = data.barre.fret - startFret + 1;
        b.style.top = `${((relFret - 1) * 25) + 12.5}%`;

        layer.appendChild(b);
    }

    // 2. Render Dots
    data.positions.forEach((fret, idx) => {
        const xPos = idx * 20;

        if (fret === -1) {
            const m = document.createElement('div');
            m.className = 'top-indicator muted';
            m.innerText = '×';
            m.style.left = `${xPos}%`;
            layer.appendChild(m);
        } else if (fret === 0) {
            if (startFret === 1) {
                const o = document.createElement('div');
                o.className = 'top-indicator open';
                o.innerText = '○';
                o.style.left = `${xPos}%`;
                layer.appendChild(o);
            }
        } else {
            const relFret = fret - startFret + 1;
            // Só desenha se couber no diagrama (4 casas)
            if (relFret >= 1 && relFret <= 4) {
                const d = document.createElement('div');
                d.className = 'dot';
                d.style.left = `${xPos}%`;
                d.style.top = `${((relFret - 1) * 25) + 12.5}%`;
                if (data.fingers[idx]) d.innerText = data.fingers[idx];
                layer.appendChild(d);
            }
        }
    });
}

function renderHarmonicField(key) {
    const grid = document.getElementById('harmonicGrid');
    grid.innerHTML = '';

    let rootIdx = notesMap.indexOf(key);
    const intervals = [0, 2, 4, 5, 7, 9, 11];
    const types = ['Major', 'Minor', 'Minor', 'Major', 'Major', 'Minor', 'dim'];
    const degrees = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];

    for (let i = 0; i < 7; i++) {
        let noteIdx = (rootIdx + intervals[i]) % 12;
        let note = notesMap[noteIdx];
        let type = types[i];
        let suffix = type === 'Major' ? '' : (type === 'Minor' ? 'm' : '°');

        const card = document.createElement('div');
        card.className = 'harmonic-card';
        card.innerHTML = `<div class="hc-degree">${degrees[i]}</div><div class="hc-chord">${note}${suffix}</div>`;
        card.onclick = () => {
            currentRoot = note;
            currentType = type === 'dim' ? 'Minor' : type; // Tratamento simples
            currentVariation = 0;
            updateDisplay();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        grid.appendChild(card);
    }
}

// Helpers
function toggleTheme() {
    const b = document.body;
    const isDark = b.getAttribute('data-theme') === 'dark';
    b.setAttribute('data-theme', isDark ? 'light' : 'dark');
}

function changeVariation(d) {
    let vars = generateChords(currentRoot, currentType);
    if (!allowBarre) vars = vars.filter(c => !c.isBarre);
    if (!vars.length) return;
    currentVariation += d;
    updateDisplay();
}

function toggleBarreFilter() {
    allowBarre = document.getElementById('barreToggle').checked;
    currentVariation = 0;
    updateDisplay();
}

function openModal(id) { document.getElementById(id).classList.add('open'); }

function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function renderGrid(id, ctx) {
    const g = document.getElementById(id);
    g.innerHTML = '';
    notesMap.forEach(n => {
        const b = document.createElement('div');
        const isActive = (ctx === 'key' && n === currentKey) || (ctx === 'root' && n === currentRoot);
        b.className = `option-btn ${isActive?'active':''}`;
        b.innerText = n;
        b.onclick = () => {
            if (ctx === 'key') currentKey = n;
            if (ctx === 'root') currentRoot = n;
            currentVariation = 0;
            renderGrid('keyGrid', 'key');
            renderGrid('rootGrid', 'root');
            closeModal(id);
            updateDisplay();
        };
        g.appendChild(b);
    });
}

function renderTypeGrid() {
    const g = document.getElementById('typeGrid');
    ['Major', 'Minor', '7'].forEach(t => {
        const b = document.createElement('div');
        b.className = `option-btn ${t===currentType?'active':''}`;
        b.innerText = t;
        b.onclick = () => {
            currentType = t;
            currentVariation = 0;
            renderTypeGrid();
            closeModal('modalType');
            updateDisplay();
        };
        g.appendChild(b);
    });
}

init();