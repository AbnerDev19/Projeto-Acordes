// DADOS GERAIS
const notesMap = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const notesPT = { 'C': 'Dó', 'C#': 'Dó#', 'D': 'Ré', 'D#': 'Ré#', 'E': 'Mi', 'F': 'Fá', 'F#': 'Fá#', 'G': 'Sol', 'G#': 'Sol#', 'A': 'Lá', 'A#': 'Lá#', 'B': 'Si' };

// DADOS VIOLÃO
const guitarShapes = {
    'Maior': [
        { baseRoot: 4, strings: [0, 2, 2, 1, 0, 0], fingers: [null, 3, 4, 2, null, null], type: 'barre', name: 'E' },
        { baseRoot: 9, strings: [-1, 0, 2, 2, 2, 0], fingers: [null, null, 2, 3, 4, null], type: 'barre', name: 'A' },
        { baseRoot: 0, strings: [-1, 3, 2, 0, 1, 0], fingers: [null, 3, 2, null, 1, null], type: 'open', name: 'C' },
        { baseRoot: 2, strings: [-1, -1, 0, 2, 3, 2], fingers: [null, null, null, 1, 3, 2], type: 'open', name: 'D' },
        { baseRoot: 7, strings: [3, 2, 0, 0, 0, 3], fingers: [2, 1, null, null, null, 3], type: 'open', name: 'G' }
    ],
    'Menor': [
        { baseRoot: 4, strings: [0, 2, 2, 0, 0, 0], fingers: [null, 3, 4, null, null, null], type: 'barre', name: 'Em' },
        { baseRoot: 9, strings: [-1, 0, 2, 2, 1, 0], fingers: [null, null, 3, 4, 2, null], type: 'barre', name: 'Am' },
        { baseRoot: 2, strings: [-1, -1, 0, 2, 3, 1], fingers: [null, null, null, 2, 3, 1], type: 'open', name: 'Dm' }
    ],
    '7': [
        { baseRoot: 4, strings: [0, 2, 0, 1, 0, 0], fingers: [null, 2, null, 1, null, null], type: 'barre', name: 'E7' },
        { baseRoot: 9, strings: [-1, 0, 2, 0, 2, 0], fingers: [null, null, 2, null, 3, null], type: 'barre', name: 'A7' },
        { baseRoot: 0, strings: [-1, 3, 2, 3, 1, 0], fingers: [null, 3, 2, 4, 1, null], type: 'open', name: 'C7' }
    ]
};

const pianoIntervals = { 'Maior': [0, 4, 7], 'Menor': [0, 3, 7], '7': [0, 4, 7, 10] };

let state = { inst: 'guitar', key: 'C', root: 'C', type: 'Maior', variant: 0, barre: true };

function init() { renderSelectors();
    updateUI(); }

function updateUI() {
    document.getElementById('labelKey').innerText = state.key;
    document.getElementById('labelRoot').innerText = state.root;
    document.getElementById('labelType').innerText = state.type;

    let suffix = state.type === 'Maior' ? '' : (state.type === 'Menor' ? 'm' : '7');
    document.getElementById('displaySymbol').innerText = state.root + suffix;
    document.getElementById('displayName').innerText = `${notesPT[state.root]} ${state.type}`;

    const isGuitar = state.inst === 'guitar';
    document.getElementById('guitarDiagram').style.display = isGuitar ? 'flex' : 'none';
    document.getElementById('pianoDiagram').style.display = !isGuitar ? 'flex' : 'none';
    document.getElementById('barreToggleContainer').style.display = isGuitar ? 'flex' : 'none';
    document.getElementById('btnGuitar').classList.toggle('active', isGuitar);
    document.getElementById('btnPiano').classList.toggle('active', !isGuitar);

    renderHarmonic();

    const vars = isGuitar ? genGuitar() : genPiano();
    if (state.variant >= vars.length) state.variant = 0;
    if (state.variant < 0) state.variant = vars.length - 1;

    if (vars.length > 0) {
        document.getElementById('displayVariation').innerText = `Opção ${state.variant+1}/${vars.length}`;
        if (isGuitar) renderGuitar(vars[state.variant]);
        else renderPiano(vars[state.variant]);
    } else {
        document.getElementById('displayVariation').innerText = "Não encontrado";
        document.getElementById('guitarMarkers').innerHTML = '';
        document.getElementById('pianoKeys').innerHTML = '';
    }
}

function genGuitar() {
    const rootIdx = notesMap.indexOf(state.root);
    let list = [];
    (guitarShapes[state.type] || []).forEach(s => {
        let shift = rootIdx - s.baseRoot;
        if (shift < 0) shift += 12;
        let isBarre = s.type === 'barre' || (s.type === 'open' && shift > 0);
        let valid = s.type === 'barre' ? true : (shift === 0);
        if (valid) {
            let pos = s.strings.map(x => x === -1 ? -1 : x + shift);
            let barre = (isBarre && shift > 0) ? { fret: shift, str: s.barreStr } : null;
            list.push({ pos, fingers: s.fingers, barre, baseFret: shift });
        }
    });
    if (list.length === 0 || list.every(x => !x.barre && x.baseFret > 0)) {
        guitarShapes[state.type].filter(x => x.type === 'barre').forEach(s => {
            let shift = rootIdx - s.baseRoot;
            if (shift < 0) shift += 12;
            let pos = s.strings.map(x => x === -1 ? -1 : x + shift);
            if (!list.some(ex => JSON.stringify(ex.pos) === JSON.stringify(pos))) {
                list.push({ pos, fingers: s.fingers, barre: { fret: shift, str: s.barreStr }, baseFret: shift });
            }
        });
    }
    if (!state.barre) list = list.filter(x => !x.barre);
    return list.sort((a, b) => {
        if (!a.barre && b.barre) return -1;
        if (a.barre && !b.barre) return 1;
        return (Math.min(...a.pos.filter(p => p > 0)) || 0) - (Math.min(...b.pos.filter(p => p > 0)) || 0);
    });
}

function genPiano() {
    const rootIdx = notesMap.indexOf(state.root);
    const intervals = pianoIntervals[state.type] || [0, 4, 7];
    const notes = intervals.map(i => (rootIdx + i) % 12);
    let vars = [];
    vars.push({ keys: [...notes] });
    if (notes.length >= 3) {
        vars.push({ keys: [notes[1], notes[2], (notes[0])].map(n => n) });
        vars.push({ keys: [notes[2], (notes[0]), (notes[1])].map(n => n) });
    }
    return vars;
}

function renderGuitar(data) {
    const board = document.getElementById('guitarMarkers');
    const nut = document.getElementById('guitarNut');
    const off = document.getElementById('fretOffset');
    board.innerHTML = '';
    const frets = data.pos.filter(p => p > 0);
    const min = frets.length ? Math.min(...frets) : 0;
    let start = 1;
    if (data.barre) start = data.barre.fret;
    else if (min > 2) start = min;

    nut.style.opacity = start > 1 ? '0' : '1';
    off.innerText = start > 1 ? start + 'ª' : '';

    if (data.barre) {
        const b = document.createElement('div');
        b.className = 'barre';
        const sMin = Math.min(...data.barre.str);
        const sMax = Math.max(...data.barre.str);
        b.style.left = `${sMin * 20}%`;
        b.style.width = `calc(${(sMax-sMin) * 20}% + 4px)`;
        let relFret = data.barre.fret - start + 1;
        b.style.top = `${((relFret-1)*25) + 12.5}%`;
        board.appendChild(b);
    }
    data.pos.forEach((fr, i) => {
        let x = i * 20;
        if (fr === -1) {
            let m = document.createElement('div');
            m.className = 'top-ind';
            m.innerText = '×';
            m.style.left = `${x}%`;
            board.appendChild(m);
        } else if (fr === 0) {
            if (start === 1) { let o = document.createElement('div');
                o.className = 'top-ind open';
                o.innerText = '○';
                o.style.left = `${x}%`;
                board.appendChild(o); }
        } else {
            let rel = fr - start + 1;
            if (rel >= 1 && rel <= 4) {
                let d = document.createElement('div');
                d.className = 'dot';
                d.style.left = `${x}%`;
                d.style.top = `${((rel-1)*25) + 12.5}%`;
                if (data.fingers[i]) d.innerText = data.fingers[i];
                board.appendChild(d);
            }
        }
    });
}

function renderPiano(data) {
    const div = document.getElementById('pianoKeys');
    div.innerHTML = '';
    const whiteNotes = [0, 2, 4, 5, 7, 9, 11];
    const totalKeys = 21; // 3 oitavas

    // Calcular notas ativas
    let activeAbs = [];
    let oct = 0;
    let last = -1;
    data.keys.forEach(k => {
        if (k < last) oct += 12;
        // Centralizar na segunda oitava (start at 12)
        activeAbs.push(k + oct + 12);
        last = k;
    });

    // Renderizar Teclas
    for (let i = 0; i < totalKeys; i++) {
        let octave = Math.floor(i / 7);
        let note = whiteNotes[i % 7];
        let absVal = note + (octave * 12);

        // Branca
        let w = document.createElement('div');
        w.className = `key-white ${activeAbs.includes(absVal)?'active':''}`;
        w.style.left = `${i * 36}px`;
        w.innerText = ['C', 'D', 'E', 'F', 'G', 'A', 'B'][i % 7]; // Labels para todas
        div.appendChild(w);

        // Preta
        if ([0, 2, 5, 7, 9].includes(note)) {
            let b = document.createElement('div');
            let bVal = absVal + 1;
            b.className = `key-black ${activeAbs.includes(bVal)?'active':''}`;
            // (i+1)*36 - (22/2) = right edge of white - half black
            b.style.left = `${((i+1)*36) - 11}px`;
            div.appendChild(b);
        }
    }
}

function renderHarmonic() {
    const div = document.getElementById('harmonicGrid');
    div.innerHTML = '';
    const rootIdx = notesMap.indexOf(state.key);
    const intervals = [0, 2, 4, 5, 7, 9, 11];
    const types = ['Maior', 'Menor', 'Menor', 'Maior', 'Maior', 'Menor', '7'];
    const degrees = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];

    for (let i = 0; i < 7; i++) {
        let n = notesMap[(rootIdx + intervals[i]) % 12];
        let t = types[i];
        let suff = t === 'Maior' ? '' : (t === 'Menor' ? 'm' : '°');
        let d = document.createElement('div');
        d.className = 'hf-card';
        d.innerHTML = `<span class="deg">${degrees[i]}</span><span class="chord">${n}${suff}</span>`;
        d.onclick = () => {
            state.root = n;
            state.type = (t === '7' || t === '°') ? 'Menor' : t;
            state.variant = 0;
            updateUI();
        };
        div.appendChild(d);
    }
}

function renderSelectors() {
    const keyGrid = document.getElementById('keyGrid');
    notesMap.forEach(n => {
        let b = document.createElement('div');
        b.className = 'opt-btn';
        b.innerText = n;
        b.onclick = () => { state.key = n;
            state.root = n;
            state.variant = 0;
            closeModal('modalKey');
            updateUI(); };
        keyGrid.appendChild(b);
    });
    const rootGrid = document.getElementById('rootGrid');
    notesMap.forEach(n => {
        let b = document.createElement('div');
        b.className = 'opt-btn';
        b.innerText = n;
        b.onclick = () => { state.root = n;
            state.variant = 0;
            closeModal('modalRoot');
            updateUI(); };
        rootGrid.appendChild(b);
    });
    const typeGrid = document.getElementById('typeGrid');
    ['Maior', 'Menor', '7'].forEach(t => {
        let b = document.createElement('div');
        b.className = 'opt-btn';
        b.innerText = t;
        b.onclick = () => { state.type = t;
            state.variant = 0;
            closeModal('modalType');
            updateUI(); };
        typeGrid.appendChild(b);
    });
}

window.setInstrument = (i) => { state.inst = i;
    updateUI(); };
window.changeVariation = (d) => { state.variant += d;
    updateUI(); };
window.toggleBarreFilter = () => { state.barre = document.getElementById('barreToggle').checked;
    state.variant = 0;
    updateUI(); };
window.toggleTheme = () => { let b = document.body;
    b.setAttribute('data-theme', b.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'); };
window.openModal = (id) => document.getElementById(id).classList.add('open');
window.closeModal = (id) => document.getElementById(id).classList.remove('open');

init();