const CATEGORIES = [
    { id: 'frame', name: 'Frame', icon: 'fa-bicycle' },
    { id: 'wheel', name: 'Wheels', icon: 'fa-circle-notch' },
    { id: 'tire', name: 'Tires', icon: 'fa-ring' },
    { id: 'handlebar', name: 'Handlebar', icon: 'fa-grip-lines' },
    { id: 'saddle', name: 'Saddle', icon: 'fa-chair' },
    { id: 'crank', name: 'Crankset', icon: 'fa-gear' },
    { id: 'pedal', name: 'Pedals', icon: 'fa-shoe-prints' },
    { id: 'chain', name: 'Chain', icon: 'fa-link' }
];

const PARTS_DATA = {
    frame: [
        { id: 'f_classic', name: 'Classic Track', price: 0, weight: 2.1, material: 'Steel', style: 'Classic', rare: false },
        { id: 'f_aero', name: 'Aero Aluminum', price: 350, weight: 1.5, material: 'Aluminum', style: 'Aero', rare: false },
        { id: 'f_carbon', name: 'Carbon Monocoque', price: 1200, weight: 0.9, material: 'Carbon', style: 'Race', rare: true }
    ],
    wheel: [
        { id: 'w_spoke', name: 'Standard Spoke', price: 0, weight: 1.8, style: 'Classic', type: 'spoke', rare: false },
        { id: 'w_deep', name: 'Deep Dish 60mm', price: 250, weight: 1.6, style: 'Street', type: 'deep', rare: false },
        { id: 'w_trispoke', name: 'Carbon Tri-Spoke', price: 800, weight: 1.1, style: 'Aero', type: 'trispoke', rare: true }
    ],
    tire: [
        { id: 't_black', name: 'Slick Black', price: 0, color: '#111111', weight: 0.4 },
        { id: 't_white', name: 'Urban White', price: 100, color: '#e2e8f0', weight: 0.4 },
        { id: 't_red', name: 'Racing Red', price: 120, color: '#ef4444', weight: 0.4 }
    ],
    handlebar: [
        { id: 'h_drop', name: 'Track Drop', price: 0, type: 'drop', weight: 0.3 },
        { id: 'h_bullhorn', name: 'Aero Bullhorn', price: 150, type: 'bullhorn', weight: 0.25 },
        { id: 'h_riser', name: 'Urban Riser', price: 90, type: 'riser', weight: 0.35 }
    ],
    saddle: [
        { id: 's_classic', name: 'Retro Leather', price: 0, type: 'classic', weight: 0.4 },
        { id: 's_aero', name: 'Aero Cutout', price: 180, type: 'aero', weight: 0.2 }
    ],
    crank: [
        { id: 'c_standard', name: '46T Alloy', price: 0, weight: 0.8 },
        { id: 'c_pro', name: '48T CNC Chainring', price: 300, weight: 0.6 }
    ],
    pedal: [
        { id: 'p_flat', name: 'Platform Pedals', price: 0, weight: 0.3 },
        { id: 'p_straps', name: 'Pedal + Straps', price: 80, weight: 0.35 }
    ],
    chain: [
        { id: 'ch_silver', name: 'Silver Chain', price: 0, color: '#cbd5e1' },
        { id: 'ch_gold', name: 'Gold Track Chain', price: 150, color: '#f59e0b' }
    ]
};

let gameState = {
    coins: 1000,
    ownedParts: ['f_classic', 'w_spoke', 't_black', 'h_drop', 's_classic', 'c_standard', 'p_flat', 'ch_silver'],
    currentBuild: {
        frame: { id: 'f_classic', color: '#00e5ff' },
        wheel: { id: 'w_spoke', color: '#ffffff' },
        tire: { id: 't_black', color: '#111111' },
        handlebar: { id: 'h_drop', color: '#333333' },
        saddle: { id: 's_classic', color: '#333333' },
        crank: { id: 'c_standard', color: '#cccccc' },
        pedal: { id: 'p_flat', color: '#111111' },
        chain: { id: 'ch_silver', color: '#cbd5e1' }
    },
    savedBikes: [],
    activeCategory: 'frame'
};

document.addEventListener('DOMContentLoaded', () => {
    loadLocalStorage();
    initUI();
    setupCanvas();
    renderBike();
});

function saveLocalStorage() {
    localStorage.setItem('fixie_designer_save', JSON.stringify(gameState));
}

function loadLocalStorage() {
    const saved = localStorage.getItem('fixie_designer_save');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            gameState = { ...gameState, ...parsed };
        } catch (e) {
            console.error("Failed to load save data", e);
        }
    }
}

function initUI() {
    document.getElementById('btn-start').addEventListener('click', () => {
        document.getElementById('landing-screen').classList.add('hidden');
        document.getElementById('game-container').classList.remove('hidden');
        renderBike();
    });

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.view-panel').forEach(p => p.classList.add('hidden'));
            
            e.currentTarget.classList.add('active');
            const target = e.currentTarget.dataset.target;
            document.getElementById(`panel-${target}`).classList.remove('hidden');

            if(target === 'my-bikes') renderSavedBikes();
        });
    });

    const catContainer = document.getElementById('category-tabs');
    catContainer.innerHTML = '';
    CATEGORIES.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `cat-btn ${cat.id === gameState.activeCategory ? 'active' : ''}`;
        btn.innerHTML = `<i class="fa-solid ${cat.icon}"></i> ${cat.name}`;
        btn.onclick = () => switchCategory(cat.id);
        catContainer.appendChild(btn);
    });

    const colorPicker = document.getElementById('component-color-picker');
    colorPicker.addEventListener('input', (e) => {
        const cat = gameState.activeCategory;
        gameState.currentBuild[cat].color = e.target.value;
        renderBike();
        saveLocalStorage();
    });

    document.getElementById('btn-reset').addEventListener('click', resetBuild);
    document.getElementById('btn-random').addEventListener('click', randomizeBuild);
    document.getElementById('btn-save-build').addEventListener('click', saveCurrentBuild);

    updateCoinsDisplay();
    renderPartsGrid();
}

function updateCoinsDisplay() {
    document.getElementById('user-coins').innerText = gameState.coins;
}

function switchCategory(catId) {
    gameState.activeCategory = catId;
    document.querySelectorAll('.cat-btn').forEach((btn, idx) => {
        btn.classList.toggle('active', CATEGORIES[idx].id === catId);
    });
    
    const currentColor = gameState.currentBuild[catId].color || '#ffffff';
    document.getElementById('component-color-picker').value = currentColor;

    renderPartsGrid();
}

function renderPartsGrid() {
    const grid = document.getElementById('parts-grid');
    grid.innerHTML = '';
    const cat = gameState.activeCategory;
    const parts = PARTS_DATA[cat] || [];

    parts.forEach(part => {
        const isOwned = gameState.ownedParts.includes(part.id);
        const isSelected = gameState.currentBuild[cat].id === part.id;

        const card = document.createElement('div');
        card.className = `part-card ${isSelected ? 'active' : ''} ${part.rare ? 'rare' : ''}`;
        
        card.innerHTML = `
            ${part.rare ? '<span class="rare-badge">RARE</span>' : ''}
            <div class="part-name">${part.name}</div>
            <div class="part-price">${isOwned ? '<span class="part-owned">OWNED</span>' : `BC ${part.price}`}</div>
            <button>${isSelected ? 'Equipped' : (isOwned ? 'Equip' : 'Buy')}</button>
        `;

        card.onclick = () => handlePartAction(cat, part);
        grid.appendChild(card);
    });

    updateBikeStats();
}

function handlePartAction(category, part) {
    const isOwned = gameState.ownedParts.includes(part.id);

    if (!isOwned) {
        if (gameState.coins >= part.price) {
            gameState.coins -= part.price;
            gameState.ownedParts.push(part.id);
            updateCoinsDisplay();
        } else {
            alert("Not enough Bike Coins!");
            return;
        }
    }

    gameState.currentBuild[category].id = part.id;
    if (part.color) gameState.currentBuild[category].color = part.color;

    renderPartsGrid();
    renderBike();
    saveLocalStorage();
}

function updateBikeStats() {
    let weight = 4.0;
    let material = 'Alloy';
    let style = 'Street';

    Object.keys(gameState.currentBuild).forEach(cat => {
        const partId = gameState.currentBuild[cat].id;
        const partData = PARTS_DATA[cat]?.find(p => p.id === partId);
        if (partData) {
            if (partData.weight) weight += partData.weight;
            if (partData.material) material = partData.material;
            if (partData.style) style = partData.style;
        }
    });

    document.getElementById('stat-weight').innerText = weight.toFixed(1);
    document.getElementById('stat-material').innerText = material;
    document.getElementById('stat-style').innerText = style;
}

function resetBuild() {
    gameState.currentBuild = {
        frame: { id: 'f_classic', color: '#00e5ff' },
        wheel: { id: 'w_spoke', color: '#ffffff' },
        tire: { id: 't_black', color: '#111111' },
        handlebar: { id: 'h_drop', color: '#333333' },
        saddle: { id: 's_classic', color: '#333333' },
        crank: { id: 'c_standard', color: '#cccccc' },
        pedal: { id: 'p_flat', color: '#111111' },
        chain: { id: 'ch_silver', color: '#cbd5e1' }
    };
    switchCategory(gameState.activeCategory);
    renderBike();
    saveLocalStorage();
}

function randomizeBuild() {
    const colors = ['#00e5ff', '#ff0055', '#ffb700', '#10b981', '#8b5cf6', '#ffffff', '#111111'];
    
    Object.keys(PARTS_DATA).forEach(cat => {
        const ownedInCat = PARTS_DATA[cat].filter(p => gameState.ownedParts.includes(p.id));
        if (ownedInCat.length > 0) {
            const randomPart = ownedInCat[Math.floor(Math.random() * ownedInCat.length)];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            gameState.currentBuild[cat] = {
                id: randomPart.id,
                color: randomPart.color || randomColor
            };
        }
    });

    switchCategory(gameState.activeCategory);
    renderBike();
    saveLocalStorage();
}

function saveCurrentBuild() {
    const bikeName = prompt("Name your bike build:", "Custom Fixie #" + (gameState.savedBikes.length + 1));
    if (!bikeName) return;

    gameState.savedBikes.push({
        name: bikeName,
        build: JSON.parse(JSON.stringify(gameState.currentBuild))
    });

    saveLocalStorage();
    alert("Bike saved to My Bikes!");
}

function renderSavedBikes() {
    const grid = document.getElementById('saved-bikes-grid');
    grid.innerHTML = '';

    if (gameState.savedBikes.length === 0) {
        grid.innerHTML = '<p style="color:var(--text-muted)">No saved bikes in your garage yet.</p>';
        return;
    }

    gameState.savedBikes.forEach((saved, index) => {
        const card = document.createElement('div');
        card.className = 'saved-bike-card';
        card.innerHTML = `
            <h3>${saved.name}</h3>
            <button class="btn-primary" onclick="loadSavedBike(${index})">Load Build</button>
            <button style="background:var(--danger); color:#fff;" onclick="deleteSavedBike(${index})">Delete</button>
        `;
        grid.appendChild(card);
    });
}

window.loadSavedBike = function(index) {
    gameState.currentBuild = JSON.parse(JSON.stringify(gameState.savedBikes[index].build));
    renderBike();
    switchCategory(gameState.activeCategory);
    alert("Build loaded!");
}

window.deleteSavedBike = function(index) {
    gameState.savedBikes.splice(index, 1);
    saveLocalStorage();
    renderSavedBikes();
}

let canvas, ctx;

function setupCanvas() {
    canvas = document.getElementById('bikeCanvas');
    ctx = canvas.getContext('2d');
}

function renderBike() {
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const rearHub = { x: 220, y: 320 };
    const frontHub = { x: 580, y: 320 };
    const bb = { x: 370, y: 320 };
    const seatClamp = { x: 330, y: 170 };
    const headset = { x: 520, y: 160 };
    const wheelRadius = 110;

    const b = gameState.currentBuild;

    drawWheel(rearHub.x, rearHub.y, wheelRadius, b.wheel, b.tire);
    drawWheel(frontHub.x, frontHub.y, wheelRadius, b.wheel, b.tire);

    ctx.beginPath();
    ctx.strokeStyle = b.chain.color;
    ctx.lineWidth = 4;
    ctx.moveTo(rearHub.x, rearHub.y - 12);
    ctx.lineTo(bb.x, bb.y - 25);
    ctx.lineTo(bb.x, bb.y + 25);
    ctx.lineTo(rearHub.x, rearHub.y + 12);
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = b.crank.color;
    ctx.arc(bb.x, bb.y, 28, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = b.pedal.color;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(bb.x, bb.y);
    ctx.lineTo(bb.x + 15, bb.y + 30);
    ctx.stroke();

    ctx.strokeStyle = b.frame.color;
    ctx.lineWidth = b.frame.id === 'f_aero' ? 16 : (b.frame.id === 'f_carbon' ? 20 : 10);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(rearHub.x, rearHub.y);
    ctx.lineTo(bb.x, bb.y);
    ctx.lineTo(seatClamp.x, seatClamp.y);
    ctx.lineTo(rearHub.x, rearHub.y);
    
    ctx.lineTo(bb.x, bb.y);
    ctx.lineTo(headset.x, headset.y);
    ctx.lineTo(seatClamp.x, seatClamp.y);
    ctx.stroke();

    ctx.strokeStyle = b.frame.color;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(frontHub.x, frontHub.y);
    ctx.lineTo(headset.x, headset.y - 10);
    ctx.stroke();

    ctx.strokeStyle = '#222';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(seatClamp.x, seatClamp.y);
    ctx.lineTo(seatClamp.x - 5, seatClamp.y - 30);
    ctx.stroke();

    ctx.fillStyle = b.saddle.color;
    ctx.beginPath();
    const saddleX = seatClamp.x - 5;
    const saddleY = seatClamp.y - 30;
    ctx.ellipse(saddleX + 5, saddleY - 5, 25, 8, -0.1, 0, Math.PI * 2);
    ctx.fill();

    const stemX = headset.x - 5;
    const stemY = headset.y - 15;

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(headset.x, headset.y);
    ctx.lineTo(stemX + 15, stemY);
    ctx.stroke();

    ctx.strokeStyle = b.handlebar.color;
    ctx.lineWidth = 6;
    ctx.beginPath();

    const barType = PARTS_DATA.handlebar.find(h => h.id === b.handlebar.id)?.type;

    if (barType === 'drop') {
        ctx.moveTo(stemX + 15, stemY);
        ctx.lineTo(stemX + 30, stemY);
        ctx.arc(stemX + 30, stemY + 20, 20, -Math.PI / 2, Math.PI / 2, false);
    } else if (barType === 'bullhorn') {
        ctx.moveTo(stemX + 15, stemY);
        ctx.lineTo(stemX + 45, stemY - 10);
    } else {
        ctx.moveTo(stemX + 15, stemY + 5);
        ctx.lineTo(stemX + 15, stemY - 15);
    }
    ctx.stroke();
}

function drawWheel(x, y, radius, wheelData, tireData) {
    ctx.beginPath();
    ctx.strokeStyle = tireData.color;
    ctx.lineWidth = 14;
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();

    const wheelType = PARTS_DATA.wheel.find(w => w.id === wheelData.id)?.type;
    ctx.beginPath();
    ctx.strokeStyle = wheelData.color;

    if (wheelType === 'deep') {
        ctx.lineWidth = 24;
    } else {
        ctx.lineWidth = 8;
    }
    ctx.arc(x, y, radius - 6, 0, Math.PI * 2);
    ctx.stroke();

    if (wheelType === 'trispoke') {
        ctx.fillStyle = wheelData.color;
        for (let i = 0; i < 3; i++) {
            const angle = (i * 120 * Math.PI) / 180;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + (radius - 12) * Math.cos(angle - 0.2), y + (radius - 12) * Math.sin(angle - 0.2));
            ctx.lineTo(x + (radius - 12) * Math.cos(angle + 0.2), y + (radius - 12) * Math.sin(angle + 0.2));
            ctx.fill();
        }
    } else {
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1;
        for (let i = 0; i < 24; i++) {
            const angle = (i * 15 * Math.PI) / 180;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + (radius - 12) * Math.cos(angle), y + (radius - 12) * Math.sin(angle));
            ctx.stroke();
        }
    }

    ctx.beginPath();
    ctx.fillStyle = '#111';
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
}
