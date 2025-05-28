window.stickerSettings = {
    enableSounds: true, // true, false
    spawnRadius: 150, // number in pixels
    maxStickers: 15, // number of max stickers
    stickerBoxOnMobile: true // true, false
};

const stickers = [
    {
        id: '1', // unique identifier for the sticker, 1, 2, 3, etc.
        name: 'Shmoobium', // name of the sticker
        image: 'https://unpkg.com/shmoobium@latest/dist/assets/shmoobium.webp', // URL or path of the sticker image
        enabled: false // true, false, enables sticker by default
    }
];

// Customize settings above ^ ^ ^

let stickerBoxInstance = null;

window.openStickerBox = function() {
    console.log('Opening sticker box...');
    if (stickerBoxInstance) {
        stickerBoxInstance.openPopup();
    } else {
        console.error('StickerBox instance not found!');
    }
};

const stickerBox = React.createElement(Shmoobium.StickerBox, {
    stickers: stickers,
    maxStickers: window.stickerSettings.maxStickers, 
    spawnRadius: window.stickerSettings.spawnRadius, 
    enableSounds: window.stickerSettings.enableSounds, 
    className: 'sticker-box',
    ref: (ref) => { 
        console.log('StickerBox ref set:', ref);
        stickerBoxInstance = ref; 
    },
    onStickerToggle: (stickerId, enabled) => { 
        console.log(`Sticker ${stickerId} ${enabled ? 'enabled' : 'disabled'}`);
    },
    onStickerMove: (stickerId, position) => { 
        console.log(`Sticker ${stickerId} moved to:`, position);
    }
});

const stickerContainer = document.createElement('div');
stickerContainer.id = 'sticker-box-root';
document.body.appendChild(stickerContainer);

console.log('Rendering StickerBox...');
ReactDOM.render(stickerBox, stickerContainer); 