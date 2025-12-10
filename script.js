// script.js (VERSÃO AMPLIADA - TODOS TIPOS ADICIONADOS)

const notesMap = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * EXTENSÃO DOS SHAPES (CAGED + shapes dedicados)
 * Expandimos para suportar muitos tipos de acorde.
 * Cada tipo reutiliza shapes já conhecidos (E/A/C/D/G) e adiciona alguns específicos.
 */

const chordShapes = {
    // --- Básicos (Major / Minor / 7) mantidos e usados como base ---
    'Major': [
        { name: 'E-Shape (Barre)', baseRoot: 4, strings: [0, 2, 2, 1, 0, 0], fingers: [null, 3, 4, 2, null, null], barreStr: [0, 5], type: 'barre', rootString: 6 },
        { name: 'A-Shape (Barre)', baseRoot: 9, strings: [-1, 0, 2, 2, 2, 0], fingers: [null, null, 2, 3, 4, null], barreStr: [1, 5], type: 'barre', rootString: 5 },
        { name: 'C-Shape (Open)', baseRoot: 0, strings: [-1, 3, 2, 0, 1, 0], fingers: [null, 3, 2, null, 1, null], barreStr: [], type: 'open', rootString: 5 },
        { name: 'D-Shape (Open)', baseRoot: 2, strings: [-1, -1, 0, 2, 3, 2], fingers: [null, null, null, 1, 3, 2], barreStr: [], type: 'open', rootString: 4 },
        { name: 'G-Shape (Open)', baseRoot: 7, strings: [3, 2, 0, 0, 0, 3], fingers: [2, 1, null, null, null, 3], barreStr: [], type: 'open', rootString: 6 }
    ],
    'Minor': [
        { name: 'Em-Shape (Barre)', baseRoot: 4, strings: [0, 2, 2, 0, 0, 0], fingers: [null, 3, 4, null, null, null], barreStr: [0, 5], type: 'barre', rootString: 6 },
        { name: 'Am-Shape (Barre)', baseRoot: 9, strings: [-1, 0, 2, 2, 1, 0], fingers: [null, null, 3, 4, 2, null], barreStr: [1, 5], type: 'barre', rootString: 5 },
        { name: 'Dm-Shape (Open)', baseRoot: 2, strings: [-1, -1, 0, 2, 3, 1], fingers: [null, null, null, 2, 3, 1], barreStr: [], type: 'open', rootString: 4 }
    ],
    '7': [
        { name: 'E7 (Barre)', baseRoot: 4, strings: [0, 2, 0, 1, 0, 0], fingers: [null, 2, null, 1, null, null], barreStr: [0, 5], type: 'barre', rootString: 6 },
        { name: 'A7 (Barre)', baseRoot: 9, strings: [-1, 0, 2, 0, 2, 0], fingers: [null, null, 2, null, 3, null], barreStr: [1, 5], type: 'barre', rootString: 5 },
        { name: 'C7 (Open)', baseRoot: 0, strings: [-1, 3, 2, 3, 1, 0], fingers: [null, 3, 2, 4, 1, null], barreStr: [], type: 'open', rootString: 5 }
    ],

    // --- Novos tipos: versáteis (usam shapes base, nome alterado) ---
    'Maj7': [
        // Maj7 frequentemente pode ser representado por shapes Major com a 7ª maior adicionada ou por voicings abertos.
        { name: 'Maj7 (E-Shape)', baseRoot: 4, strings: [0, 2, 1, 1, 0, 0], fingers: [null, 3, 2, 1, null, null], barreStr: [0, 5], type: 'barre', rootString: 6 },
        { name: 'Maj7 (C-Shape open)', baseRoot: 0, strings: [-1, 3, 2, 0, 0, 0], fingers: [null, 3, 2, null, null, null], barreStr: [], type: 'open', rootString: 5 }
    ],
    'm7': [
        { name: 'm7 (Em-Shape)', baseRoot: 4, strings: [0, 2, 0, 0, 0, 0], fingers: [null, 3, null, null, null, null], barreStr: [0, 5], type: 'barre', rootString: 6 },
        { name: 'm7 (Am-Shape)', baseRoot: 9, strings: [-1, 0, 2, 0, 1, 0], fingers: [null, null, 3, null, 2, null], barreStr: [1, 5], type: 'barre', rootString: 5 }
    ],
    'm7b5': [
        // Meio diminuto: use shapes base m e ajuste (simplificado)
        { name: 'm7b5 (Em7b5)', baseRoot: 4, strings: [0, 1, 0, 0, 0, 0], fingers: [null, 2, null, null, null, null], barreStr: [0, 5], type: 'barre', rootString: 6 },
        { name: 'm7b5 (Am7b5)', baseRoot: 9, strings: [-1, 0, 1, 0, 1, 0], fingers: [null, null, 2, null, 3, null], barreStr: [1, 5], type: 'barre', rootString: 5 }
    ],
    'sus2': [
        { name: 'sus2 (A-Shape)', baseRoot: 9, strings: [-1, 0, 2, 2, 0, 0], fingers: [null, null, 2, 3, null, null], barreStr: [1, 5], type: 'barre', rootString: 5 },
        { name: 'sus2 (D-Shape open)', baseRoot: 2, strings: [-1, -1, 0, 2, 0, 0], fingers: [null, null, null, 1, null, null], barreStr: [], type: 'open', rootString: 4 }
    ],
    'sus4': [
        { name: 'sus4 (A-Shape)', baseRoot: 9, strings: [-1, 0, 2, 2, 3, 0], fingers: [null, null, 2, 3, 4, null], barreStr: [1, 5], type: 'barre', rootString: 5 },
        { name: 'sus4 (D-Shape)', baseRoot: 2, strings: [-1, -1, 0, 2, 3, 3], fingers: [null, null, null, 1, 2, 3], barreStr: [], type: 'open', rootString: 4 }
    ],
    '6': [
        { name: '6 (E-Shape)', baseRoot: 4, strings: [0, 2, 2, 2, 0, 0], fingers: [null, 2, 3, 4, null, null], barreStr: [0, 5], type: 'barre', rootString: 6 },
        { name: '6 (A-Shape)', baseRoot: 9, strings: [-1, 0, 2, 2, 2, 2], fingers: [null, null, 2, 3, 4, 1], barreStr: [1, 5], type: 'barre', rootString: 5 }
    ],
    'm6': [
        { name: 'm6 (Am-Shape)', baseRoot: 9, strings: [-1, 0, 2, 2, 1, 2], fingers: [null, null, 2, 3, 1, 4], barreStr: [1, 5], type: 'barre', rootString: 5 },
        { name: 'm6 (Em-Shape)', baseRoot: 4, strings: [0, 2, 2, 0, 0, 2], fingers: [null, 2, 3, null, null, 4], barreStr: [0, 5], type: 'barre', rootString: 6 }
    ],
    'dim': [
        { name: 'dim (Bdim-style)', baseRoot: 11, strings: [-1, 2, 3, 2, 3, -1], fingers: [null, 1, 2, 1, 3, null], barreStr: [], type: 'open', rootString: 5 },
        { name: 'dim (Barre)', baseRoot: 4, strings: [0, 1, 2, 1, 2, 0], fingers: [null, 1, 2, 1, 3, null], barreStr: [0, 5], type: 'barre', rootString: 6 }
    ],
    'aug': [
        { name: 'aug (E-shape aug)', baseRoot: 4, strings: [0, 2, 1, 1, 0, 3], fingers: [null, 3, 2, 1, null, 4], barreStr: [0, 5], type: 'barre', rootString: 6 }
    ],
    '9': [
        // Representação prática: usar shapes 7 + nota 9 em cima quando possível
        { name: '9 (E7 add9)', baseRoot: 4, strings: [0, 2, 0, 1, 2, 0], fingers: [null, 2, null, 1, 3, null], barreStr: [0, 5], type: 'barre', rootString: 6 },
        { name: '9 (A-shape 9)', baseRoot: 9, strings: [-1, 0, 2, 0, 2, 0], fingers: [null, null, 2, null, 3, null], barreStr: [1, 5], type: 'barre', rootString: 5 }
    ],
    'm9': [
        { name: 'm9 (Em9)', baseRoot: 4, strings: [0, 2, 0, 0, 0, 2], fingers: [null, 3, null, null, null, 4], barreStr: [0, 5], type: 'barre', rootString: 6 }
    ],
    '11': [
        { name: '11 (simplified)', baseRoot: 4, strings: [0, 2, 0, 1, 0, 0], fingers: [null, 2, null, 1, null, null], barreStr: [0, 5], type: 'barre', rootString: 6 }
    ],
    '13': [
        { name: '13 (simplified)', baseRoot: 4, strings: [0, 2, 0, 1, 2, 0], fingers: [null, 2, null, 1, 3, null], barreStr: [0, 5], type: 'barre', rootString: 6 }
    ],
    'add9': [
        { name: 'add9 (Cadd9-like)', baseRoot: 0, strings: [-1, 3, 0, 0, 3, 0], fingers: [null, 3, 0, 0, 4, 0], barreStr: [], type: 'open', rootString: 5 },
        { name: 'add9 (A-shape)', baseRoot: 9, strings: [-1, 0, 2, 2, 0, 0], fingers: [null, null, 2, 3, null, null], barreStr: [1, 5], type: 'barre', rootString: 5 }
    ],
    '7#5': [
        { name: '7(#5)', baseRoot: 4, strings: [0, 2, 1, 1, 0, 0], fingers: [null, 3, 2, 1, null, null], barreStr: [0, 5], type: 'barre', rootString: 6 }
    ],
    '7b5': [
        { name: '7(b5)', baseRoot: 4, strings: [0, 1, 0, 1, 0, 0], fingers: [null, 2, null, 1, null, null], barreStr: [0, 5], type: 'barre', rootString: 6 }
    ],
    '7#9': [
        { name: '7(#9)', baseRoot: 4, strings: [0, 2, 0, 1, 3, 0], fingers: [null, 2, null, 1, 3, null], barreStr: [0, 5], type: 'barre', rootString: 6 }
    ],
    '7b9': [
        { name: '7(b9)', baseRoot: 4, strings: [0, 1, 0, 1, 0, 0], fingers: [null, 2, null, 1, null, null], barreStr: [0, 5], type: 'barre', rootString: 6 }
    ],
    '5': [
        { name: 'Power 5 (E-root)', baseRoot: 4, strings: [0, 0, 2, 2, 0, 0], fingers: [null, null, 2, 3, null, null], barreStr: [], type: 'power', rootString: 6 },
        { name: 'Power 5 (A-root)', baseRoot: 9, strings: [-1, 0, 2, 2, 2, -1], fingers: [null, null, 1, 3, 4, null], barreStr: [], type: 'power', rootString: 5 }
    ],

    // Fallback: usar sempre shapes tipo barre para qualquer tipo
    'fallbackBarre': [
        { name: 'Barre generic (E)', baseRoot: 4, strings: [0, 2, 2, 1, 0, 0], fingers: [null, 3, 4, 2, null, null], barreStr: [0, 5], type: 'barre', rootString: 6 },
        { name: 'Barre generic (A)', baseRoot: 9, strings: [-1, 0, 2, 2, 2, 0], fingers: [null, null, 2, 3, 4, null], barreStr: [1, 5], type: 'barre', rootString: 5 }
    ]
};

// --- ESTADO ---
let currentKey = 'C';
let currentRoot = 'C';
let currentType = 'Major';
let currentVariation = 0;
let allowBarre = true;

// Sufixos para visual (mapear labels)
const typeSuffix = {
    'Major': '',
    'Minor': 'm',
    '7': '7',
    'Maj7': 'maj7',
    'm7': 'm7',
    'm7b5': 'm7♭5',
    'sus2': 'sus2',
    'sus4': 'sus4',
    '6': '6',
    'm6': 'm6',
    'dim': 'dim',
    'aug': '+',
    '9': '9',
    'm9': 'm9',
    '11': '11',
    '13': '13',
    'add9': 'add9',
    '7#5': '7#5',
    '7b5': '7b5',
    '7#9': '7#9',
    '7b9': '7b9',
    '5': '5'
};

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
    const shapes = chordShapes[type] || chordShapes['fallbackBarre'] || [];
    const generated = [];

    shapes.forEach(shape => {
        // Cálculo de transposição
        let semitones = rootIndex - shape.baseRoot;
        if (semitones < 0) semitones += 12;

        let isValid = false;
        let isBarre = false;

        if (shape.type === 'barre' || shape.type === 'power' || shape.type === 'power') {
            isValid = true;
            isBarre = true;
            if (semitones === 0 && shape.type !== 'power') isBarre = false;
        } else if (shape.type === 'open' || shape.type === 'power') {
            if (semitones === 0) {
                isValid = true;
                isBarre = false;
            } else {
                // podemos permitir transformar open em barre quando necessário
                isValid = true;
                isBarre = true;
            }
        } else {
            isValid = true;
        }

        if (isValid) {
            const newPositions = shape.strings.map(p => p === -1 ? -1 : p + semitones);

            let barreData = null;
            if (isBarre) {
                if (semitones > 0) {
                    barreData = { fret: semitones, strings: shape.barreStr || [0, 5] };
                }
            }

            const chordObj = {
                positions: newPositions,
                fingers: shape.fingers,
                isBarre: isBarre,
                barre: barreData,
                name: shape.name
            };

            // Evitar duplicados exatos
            const isDup = generated.some(g => JSON.stringify(g.positions) === JSON.stringify(chordObj.positions));
            if (!isDup) generated.push(chordObj);
        }
    });

    // Se vazio, usa fallbackBarre
    if (generated.length === 0) {
        chordShapes['fallbackBarre'].forEach(shape => {
            let semitones = rootIndex - shape.baseRoot;
            if (semitones < 0) semitones += 12;
            const newPositions = shape.strings.map(p => p === -1 ? -1 : p + semitones);
            generated.push({
                positions: newPositions,
                fingers: shape.fingers,
                isBarre: semitones > 0,
                barre: semitones > 0 ? { fret: semitones, strings: shape.barreStr } : null,
                name: shape.name
            });
        });
    }

    // Ordenar: Abertos primeiro, depois menor casa para maior casa
    return generated.sort((a, b) => {
        if (!a.isBarre && b.isBarre) return -1;
        if (a.isBarre && !b.isBarre) return 1;

        const minA = Math.min(...a.positions.filter(p => p > 0));
        const minB = Math.min(...b.positions.filter(p => p > 0));
        return (minA || 0) - (minB || 0);
    });
}

function updateDisplay() {
    document.getElementById('labelKey').innerText = currentKey;
    document.getElementById('labelRoot').innerText = currentRoot;
    document.getElementById('labelType').innerText = currentType;

    const suffix = typeSuffix[currentType] !== undefined ? typeSuffix[currentType] : currentType;
    document.getElementById('displaySymbol').innerText = currentRoot + (suffix === '' ? '' : suffix);
    document.getElementById('displayName').innerText = `${currentRoot} ${suffix}`;

    document.getElementById('harmonicKeyName').innerText = currentKey;
    renderHarmonicField(currentKey);

    let variations = generateChords(currentRoot, currentType);

    if (!allowBarre) {
        variations = variations.filter(c => !c.isBarre);
    }

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

    const activeFrets = data.positions.filter(p => p > 0);
    const minFret = activeFrets.length ? Math.min(...activeFrets) : 0;

    let startFret = 1;
    if (data.barre) {
        startFret = data.barre.fret;
    } else if (minFret > 2) {
        startFret = minFret;
    }

    if (startFret > 1) {
        nut.style.opacity = '0';
        fretOffsetEl.innerText = `${startFret}ª`;
        fretOffsetEl.style.opacity = '1';
    } else {
        nut.style.opacity = '1';
        fretOffsetEl.style.opacity = '0';
    }

    if (data.isBarre && data.barre) {
        const b = document.createElement('div');
        b.className = 'barre';

        const strMin = Math.min(...data.barre.strings);
        const strMax = Math.max(...data.barre.strings);

        b.style.left = `${strMin * 20}%`;
        b.style.width = `calc(${(strMax - strMin) * 20}% + 4px)`;

        const relFret = data.barre.fret - startFret + 1;
        b.style.top = `${((relFret - 1) * 25) + 12.5}%`;

        layer.appendChild(b);
    }

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
            if (relFret >= 1 && relFret <= 4) {
                const d = document.createElement('div');
                d.className = 'dot';
                d.style.left = `${xPos}%`;
                d.style.top = `${((relFret - 1) * 25) + 12.5}%`;
                if (data.fingers && data.fingers[idx]) d.innerText = data.fingers[idx];
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
            currentType = type === 'dim' ? 'Minor' : type;
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
    g.innerHTML = '';
    const types = ['Major', 'Minor', '7', 'Maj7', 'm7', 'm7b5', 'sus2', 'sus4', '6', 'm6', 'dim', 'aug', '9', 'm9', '11', '13', 'add9', '7#5', '7b5', '7#9', '7b9', '5'];
    types.forEach(t => {
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