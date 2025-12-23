const engine = new SketchEngine('canvas-container', {
    drawSpeed: 20,
    branchProbability: 0.1,
    maxHeads: 64,
    scaleFactor: 0.95
});

// UI Handling
const uploadInput = document.getElementById('imageUpload');
const uiLayer = document.getElementById('ui-layer');

if (uploadInput) {
    uploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                // Start engine with base64 data
                engine.start(event.target.result);

                // Optional: Hide UI or move it
                if (uiLayer) uiLayer.style.opacity = '0.5';
            };
            reader.readAsDataURL(file);
        }
    });
}

// Initial demo
engine.config.drawSpeed = 100; // 처음부터 최고 속도
engine.start('test_assets/lion-sketch.png');


