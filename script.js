// --- DADOS MUSICAIS UNIVERSAIS ---
const notesMap = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// DEFINIÇÃO DOS "SHAPES" BASE (Modelos CAGED e outros)
// baseRoot: Índice numérico da nota da corda solta mais grave do shape (E=4, A=9, D=2)
const chordShapes = {
    'Major': [
        // Shape E (Pestana de E Maior)
        { name: 'E-Shape', baseRoot: 4, strings: [0, 2, 2, 1, 0, 0], fingers: [null, 3, 4, 2, null, null], barreStr: [0, 5], type: 'barre' },
        // Shape A (Pestana de A Maior)
        { name: 'A-Shape', baseRoot: 9, strings: [-1, 0, 2, 2, 2, 0], fingers: [null, null, 2, 3, 4, null], barreStr: [1, 5], type: 'barre' },
        // Shape D (Pestana de D Maior)
        { name: 'D-Shape', baseRoot: 2, strings: [-1, -1, 0, 2, 3, 2], fingers: [null, null, null, 1, 3, 2], barreStr: [2, 5], type: 'open' },
        // Shape C (Pestana de C Maior)
        { name: 'C-Shape', baseRoot: 0, strings: [-1, 3, 2, 0, 1, 0], fingers: [null, 3, 2, null, 1, null], barreStr: [1, 5], type: 'open' },
        // Shape G (Pestana de G Maior - díficil, mas existe)
        { name: 'G-Shape', baseRoot: 7, strings: [3, 2, 0, 0, 0, 3], fingers: [3, 2, null, null, null, 4], barreStr: [0, 5], type: 'open' }
    ],
    'Minor': [
        // Shape Em (Pestana de Em)
        { name: 'Em-Shape', baseRoot: 4, strings: [0, 2, 2, 0, 0, 0], fingers: [null, 3, 4, null, null, null], barreStr: [0, 5], type: 'barre' },
        // Shape Am (Pestana de Am)
        { name: 'Am-Shape', baseRoot: 9, strings: [-1, 0, 2, 2, 1, 0], fingers: [null, null, 3, 4, 2, null], barreStr: [1, 5], type: 'barre' },
        // Shape Dm (Pestana de Dm)
        { name: 'Dm-Shape', baseRoot: 2, strings: [-1, -1, 0, 2, 3, 1], fingers: [null, null, null, 2, 3, 1], barreStr: [2, 5], type: 'open' }
    ],
    '7': [
        // Shape E7
        { name: 'E7-Shape', baseRoot: 4, strings: [0, 2, 0, 1, 0, 0], fingers: [null, 2, null, 1, null, null], barreStr: [0, 5], type: 'barre' },
        // Shape A7
        { name: 'A7-Shape', baseRoot: 9, strings: [-1, 0, 2, 0, 2, 0], fingers: [null, null, 2, null, 3, null], barreStr: [1, 5], type: 'barre' }
    ]
};

// --- ESTADO DO APP ---
let currentKey = 'C'; // O tom do campo harmônico (não muda ao clicar no acorde)
let currentRoot = 'C'; // O acorde sendo visualizado
let currentType = 'Major';
let currentVariation = 0;
let allowBarre = true;

// --- INICIALIZAÇÃO ---
function init() {
    renderGrid('keyGrid', 'key');
    renderGrid('rootGrid', 'root');
    renderTypeGrid();
    updateDisplay();
}

// --- GERADOR DE ACORDES (O "GOD MODE") ---
function generateChords(rootNote, type) {
    const rootIndex = notesMap.indexOf(rootNote);
    const shapes = chordShapes[type] || [];
    const generatedChords = [];

    shapes.forEach(shape => {
        // Calcular distância entre o shape base e a nota desejada
        let semitones = rootIndex - shape.baseRoot;
        if (semitones < 0) semitones += 12; // Ajuste circular

        // Se o shape for "open" e o semitone for 0, é um acorde aberto verdadeiro
        // Se semitone > 0, precisamos deslocar tudo e vira pestana

        const newPositions = shape.strings.map(fret => {
            if (fret === -1) return -1; // Muted continua muted
            return fret + semitones;
        });

        // Determinar se virou pestana
        let isBarre = shape.type === 'barre' || (shape.type === 'open' && semitones > 0);

        // Dados da pestana
        let barreData = null;
        if (isBarre && semitones > 0) {
            // A pestana acontece na casa do deslocamento
            // Ex: E shape (base 0) para G (semitone 3) -> pestana na casa 3
            // Mas cuidado: Shapes Open tem offsets internos. 
            // Simplificação robusta: A pestana é sempre onde era o traste 0 (nut)
            barreData = { fret: semitones, strings: shape.barreStr };
        } else if (isBarre && semitones === 0 && shape.type === 'barre') {
            // Caso raro onde o shape base já é pestana (não usado no CAGED básico, mas previsto)
        }

        // Filtro de "tocabilidade": Descartar acordes acima da casa 12 para iniciantes (opcional)
        // Vamos manter tudo, mas ordenar pelo menor traste

        generatedChords.push({
            positions: newPositions,
            fingers: shape.fingers, // Dedos mantêm a lógica relativa
            isBarre: isBarre,
            barre: barreData,
            baseFret: semitones // Onde começa o "novo traste 0"
        });
    });

    // Ordenar variações: Acordes abertos/casas baixas primeiro
    return generatedChords.sort((a, b) => {
        const minA = Math.min(...a.positions.filter(p => p > 0));
        const minB = Math.min(...b.positions.filter(p => p > 0));
        return minA - minB;
    });
}

// --- LÓGICA DE EXIBIÇÃO ---
function updateDisplay() {
    // Labels
    document.getElementById('labelKey').innerText = currentKey;
    document.getElementById('labelRoot').innerText = currentRoot;
    document.getElementById('labelType').innerText = currentType;

    // Título Principal
    let suffix = currentType === 'Major' ? '' : (currentType === 'Minor' ? 'm' : currentType);
    document.getElementById('displaySymbol').innerText = currentRoot + suffix;
    document.getElementById('displayName').innerText = `${currentRoot} ${currentType}`;

    // Campo Harmônico (Baseado no Key, não no Root)
    document.getElementById('harmonicKeyName').innerText = currentKey;
    renderHarmonicField(currentKey);

    // Gerar e Filtrar Acordes
    let variations = generateChords(currentRoot, currentType);

    if (!allowBarre) {
        variations = variations.filter(c => !c.isBarre);
    }

    if (variations.length === 0) {
        document.getElementById('markersLayer').innerHTML = '';
        document.getElementById('displayVariation').innerText = "Nenhuma opção sem pestana";
        document.getElementById('fretOffset').style.opacity = '0';
        document.getElementById('guitarNut').style.opacity = '1';
        return;
    }

    // Validar Índice
    if (currentVariation >= variations.length) currentVariation = 0;
    if (currentVariation < 0) currentVariation = variations.length - 1;

    document.getElementById('displayVariation').innerText = `Var ${currentVariation + 1}/${variations.length}`;

    renderFretboard(variations[currentVariation]);
}

// --- RENDERIZADOR ---
function renderFretboard(data) {
    const layer = document.getElementById('markersLayer');
    const nut = document.getElementById('guitarNut');
    const fretOffsetEl = document.getElementById('fretOffset');
    layer.innerHTML = '';

    // Lógica de Casas
    const activeFrets = data.positions.filter(p => p > 0);
    const minFret = activeFrets.length > 0 ? Math.min(...activeFrets) : 0;

    // Definir casa inicial visual
    // Se o acorde tiver notas na casa 0, startFret = 1.
    // Se a menor nota for casa 3, startFret = 3.
    let startFret = 1;
    if (minFret > 1) startFret = minFret;

    // Se for pestana, geralmente queremos que a pestana seja o topo (casa relativa 1)
    if (data.barre) startFret = data.barre.fret;

    // Atualizar UI da Nut/Offset
    if (startFret > 1) {
        nut.style.opacity = '0';
        fretOffsetEl.style.opacity = '1';
        fretOffsetEl.innerText = `${startFret}fr`;
    } else {
        nut.style.opacity = '1';
        fretOffsetEl.style.opacity = '0';
    }

    // 1. Desenhar Pestana
    if (data.isBarre && data.barre) {
        const b = document.createElement('div');
        b.className = 'barre';

        const stringStart = Math.min(...data.barre.strings);
        const stringEnd = Math.max(...data.barre.strings);

        const leftPos = stringStart * 20;
        const width = (stringEnd - stringStart) * 20;

        b.style.left = `${leftPos}%`;
        b.style.width = `calc(${width}% + 4px)`;

        // Altura relativa
        const relativeFret = data.barre.fret - startFret + 1;
        const topPos = ((relativeFret - 1) * 25) + 12.5;

        b.style.top = `${topPos}%`;
        layer.appendChild(b);
    }

    // 2. Desenhar Notas
    data.positions.forEach((fret, index) => {
        const xPos = index * 20;

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
            const dot = document.createElement('div');
            dot.className = 'dot';
            dot.style.left = `${xPos}%`;

            const relativeFret = fret - startFret + 1;

            // Só desenha se estiver dentro das 4 casas visíveis
            if (relativeFret >= 1 && relativeFret <= 5) {
                const yPos = ((relativeFret - 1) * 25) + 12.5;
                dot.style.top = `${yPos}%`;
                if (data.fingers[index]) dot.innerText = data.fingers[index];
                layer.appendChild(dot);
            }
        }
    });
}

// --- CAMPO HARMÔNICO (Fixado no Key) ---
function renderHarmonicField(key) {
    const grid = document.getElementById('harmonicGrid');
    grid.innerHTML = '';

    let rootIndex = notesMap.indexOf(key);
    const intervals = [0, 2, 4, 5, 7, 9, 11]; // Escala Maior
    const qualities = ['Major', 'Minor', 'Minor', 'Major', 'Major', 'Minor', 'dim']; // Tipos do JS
    const romans = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];

    for (let i = 0; i < 7; i++) {
        let noteIndex = (rootIndex + intervals[i]) % 12;
        let noteName = notesMap[noteIndex];
        let type = qualities[i];

        // Exibição amigável (diminuto vira m7b5 visualmente ou só dim)
        let displaySuffix = type === 'Major' ? '' : (type === 'Minor' ? 'm' : '°');
        if (type === 'dim') type = '7'; // Hack simples para não quebrar o gerador, ou tratar dim depois

        const card = document.createElement('div');
        card.className = 'harmonic-card';
        card.innerHTML = `
            <div class="hc-degree">${romans[i]}</div>
            <div class="hc-chord">${noteName}${displaySuffix}</div>
        `;

        // CORREÇÃO CRÍTICA: Ao clicar, muda o ROOT, mas mantém o KEY
        card.onclick = () => {
            currentRoot = noteName;
            // Ajustar tipo baseado no campo harmônico
            if (qualities[i] === 'dim') currentType = 'Minor'; // Fallback visual
            else currentType = qualities[i];

            currentVariation = 0;
            updateDisplay();
            // Scroll suave pro topo
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        grid.appendChild(card);
    }
}

// --- UTILITÁRIOS ---
function toggleTheme() {
    const body = document.body;
    const icon = document.getElementById('themeIcon');
    if (body.getAttribute('data-theme') === 'dark') {
        body.setAttribute('data-theme', 'light');
        icon.innerText = 'dark_mode';
    } else {
        body.setAttribute('data-theme', 'dark');
        icon.innerText = 'light_mode';
    }
}

function changeVariation(dir) {
    const variations = generateChords(currentRoot, currentType); // Recalcular pra saber o total
    // aplicar filtro se necessario
    const filtered = allowBarre ? variations : variations.filter(c => !c.isBarre);

    if (filtered.length === 0) return;

    currentVariation += dir;
    updateDisplay();
}

function toggleBarreFilter() {
    allowBarre = document.getElementById('barreToggle').checked;
    currentVariation = 0;
    updateDisplay();
}

// Modais
function openModal(id) { document.getElementById(id).classList.add('open'); }

function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function renderGrid(elementId, context) {
    const grid = document.getElementById(elementId);
    grid.innerHTML = '';
    notesMap.forEach(note => {
        const btn = document.createElement('div');
        const activeClass = (context === 'key' && note === currentKey) || (context === 'root' && note === currentRoot) ? 'active' : '';
        btn.className = `option-btn ${activeClass}`;
        btn.innerText = note;
        btn.onclick = () => {
            if (context === 'key') currentKey = note;
            if (context === 'root') currentRoot = note;
            currentVariation = 0;

            // Re-renderizar grids para atualizar classe active
            renderGrid('keyGrid', 'key');
            renderGrid('rootGrid', 'root');

            closeModal(context === 'key' ? 'modalKey' : 'modalRoot');
            updateDisplay();
        };
        grid.appendChild(btn);
    });
}

function renderTypeGrid() {
    const grid = document.getElementById('typeGrid');
    const types = ['Major', 'Minor', '7'];
    grid.innerHTML = '';
    types.forEach(t => {
        const btn = document.createElement('div');
        btn.className = `option-btn ${t === currentType ? 'active' : ''}`;
        btn.innerText = t;
        btn.onclick = () => {
            currentType = t;
            currentVariation = 0;
            renderTypeGrid(); // update active
            closeModal('modalType');
            updateDisplay();
        }
        grid.appendChild(btn);
    });
}

// Start
init();