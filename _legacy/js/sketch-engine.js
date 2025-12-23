// eslint-disable-next-line no-unused-vars
class SketchEngine {
    constructor(canvasContainerId, options = {}) {
        this.canvas = document.getElementById(canvasContainerId);
        this.ctx = this.canvas.getContext('2d');
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        // Configuration
        this.config = {
            drawSpeed: options.drawSpeed || 2,
            branchProbability: options.branchProbability || 0.05,
            maxHeads: 64,
            scaleFactor: options.scaleFactor || 0.8,
            threshold: options.threshold || 700
        };

        // State
        this.pixelMap = new Map();
        this.drawingHeads = [];
        this.totalBlackPixels = 0;
        this.drawnBlackPixels = 0;
        this.img = new Image();
        this.isActive = false;
        this.animationId = null;

        // Resize Listener
        window.addEventListener('resize', () => this.resize());
        this.resize();
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
        if (this.isActive && this.img.src) {
            this.start(this.img.src);
        }
    }

    // Main Entry Point
    start(imageUrl) {
        this.isActive = true;
        this.img.src = imageUrl;
        this.img.onload = () => {
            this.analyzeImage();
            this.initDrawing();
            this.animate();
        };
    }

    analyzeImage() {
        const offCanvas = document.createElement('canvas');
        const offCtx = offCanvas.getContext('2d');

        const aspect = this.img.width / this.img.height;
        this.imageHeight = Math.min(this.width, this.height) * this.config.scaleFactor;
        this.imageWidth = this.imageHeight * aspect;

        this.offsetX = (this.width - this.imageWidth) / 2;
        this.offsetY = (this.height - this.imageHeight) / 2;

        offCanvas.width = this.imageWidth;
        offCanvas.height = this.imageHeight;
        offCtx.drawImage(this.img, 0, 0, this.imageWidth, this.imageHeight);

        const data = offCtx.getImageData(0, 0, this.imageWidth, this.imageHeight).data;

        this.pixelMap.clear();

        for (let y = 0; y < this.imageHeight; y++) {
            for (let x = 0; x < this.imageWidth; x++) {
                const i = (y * parseInt(this.imageWidth) + x) * 4;
                if (data[i + 3] > 128) {
                    const brightness = data[i] + data[i + 1] + data[i + 2];
                    if (brightness < this.config.threshold) {
                        const key = (x | 0) + "," + (y | 0);
                        // 농도 계산: 어두울수록 1.0에 가까움 (0.0 ~ 1.0)
                        const intensity = 1.0 - (brightness / this.config.threshold);
                        this.pixelMap.set(key, { x: x | 0, y: y | 0, visitCount: 0, intensity });
                    }
                }
            }
        }

        this.totalBlackPixels = this.pixelMap.size;
        this.drawnBlackPixels = 0;
    }

    initDrawing() {
        this.drawingHeads = [];
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.width, this.height);
        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.spawnHead();
    }

    spawnHead() {
        if (this.drawnBlackPixels >= this.totalBlackPixels) return;

        let attempts = 0;
        while (attempts < 50) {
            const randX = Math.floor(Math.random() * this.imageWidth);
            const randY = Math.floor(Math.random() * this.imageHeight);
            const key = randX + "," + randY;
            const pixel = this.pixelMap.get(key);

            // 덜 방문한 곳을 우선적으로 찾음
            if (pixel && pixel.visitCount < 5) {
                this.drawingHeads.push({
                    x: randX, y: randY, life: 200
                });
                return;
            }
            attempts++;
        }

        // 랜덤 실패 시 전체 검색
        for (const [, pixel] of this.pixelMap) {
            if (pixel.visitCount === 0) {
                this.drawingHeads.push({
                    x: pixel.x, y: pixel.y, life: 200
                });
                return;
            }
        }
    }

    animate() {
        if (!this.isActive) return;

        // [종료 조건] 100% 다 그리면 중단
        if (this.drawnBlackPixels >= this.totalBlackPixels) {
            this.isActive = false;
            return;
        }

        for (let speed = 0; speed < this.config.drawSpeed; speed++) {
            // Strict adherence to maxHeads config
            if (this.drawingHeads.length < this.config.maxHeads && this.drawnBlackPixels < this.totalBlackPixels) {
                // Check if we need to spawn (e.g. all pens finished, or just low on pens)
                if (this.drawingHeads.length === 0 || Math.random() < 0.05) {
                    this.spawnHead();
                }
            }

            for (let i = this.drawingHeads.length - 1; i >= 0; i--) {
                const head = this.drawingHeads[i];
                const currentKey = head.x + "," + head.y;
                const currentPixel = this.pixelMap.get(currentKey);
                // 방문 횟수 증가 및 수명 감소
                if (currentPixel) {
                    if (currentPixel.visitCount === 0) {
                        this.drawnBlackPixels++;
                    }
                    currentPixel.visitCount++;
                    head.life--;
                }

                if (head.life <= 0) {
                    this.drawingHeads.splice(i, 1);
                    continue;
                }

                const neighbors = [];
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue;
                        const nKey = (head.x + dx) + "," + (head.y + dy);
                        const np = this.pixelMap.get(nKey);
                        // 최대 2번까지만 겹쳐 그리기 허용 (더 깔끔하고 담백한 느낌)
                        if (np && np.visitCount < 2) {
                            neighbors.push({ pixel: np, dx, dy });
                        }
                    }
                }

                if (neighbors.length === 0) {
                    this.drawingHeads.splice(i, 1);
                } else {
                    // 점수 기반 이동: 방향성(Dot Product) + 방문 횟수 페널티
                    if (head.vx !== undefined && head.vy !== undefined) {
                        neighbors.sort((a, b) => {
                            const dotA = a.dx * head.vx + a.dy * head.vy;
                            const dotB = b.dx * head.vx + b.dy * head.vy;

                            // [Style] 관성 조절: 0.8(직선/사실적) <-> 0.1(곡선/유기적)
                            // 0.5는 그 중간: 적당히 면을 채우면서도 흐름을 탐.
                            const momentum = 0.5;

                            // 점수 = (관성) + (농도) - (방문)
                            // (관성 비중이 늘어났으니 농도 비중도 살짝 조정하면 좋지만, 일단 그대로 유지)
                            const scoreA = (dotA * momentum) + (a.pixel.intensity * 3.0) - (a.pixel.visitCount * 2.0);
                            const scoreB = (dotB * momentum) + (b.pixel.intensity * 3.0) - (b.pixel.visitCount * 2.0);

                            return scoreB - scoreA;
                        });
                    } else {
                        // 초기에는 무작위성이 아니라 방문 횟수 적은 곳 선호
                        neighbors.sort((a, b) => a.pixel.visitCount - b.pixel.visitCount);
                    }

                    let next = neighbors[0];

                    // 너무 많이 방문한 곳(막다른 길)이면 펜 종료
                    if (next.pixel.visitCount > 10) {
                        this.drawingHeads.splice(i, 1);
                        continue;
                    }

                    head.x = next.pixel.x;
                    head.y = next.pixel.y;
                    head.vx = next.dx;
                    head.vy = next.dy;

                    // 선 그리기 (Move & Draw) - 투명도 조절로 겹침 효과 극대화
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.offsetX + (head.x - head.vx), this.offsetY + (head.y - head.vy));
                    this.ctx.lineTo(this.offsetX + head.x, this.offsetY + head.y);

                    // [흑백 복구] 많이 방문할수록 점점 연하게 그려서 뭉침 방지
                    const alpha = Math.max(0.1, (next.pixel.intensity || 0.5) - (next.pixel.visitCount * 0.05));
                    this.ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`;

                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();

                    // 과도한 브랜칭 방지 및 새 펜 생성
                    if (neighbors.length > 2 &&
                        this.drawingHeads.length < this.config.maxHeads &&
                        Math.random() < this.config.branchProbability &&
                        next.pixel.visitCount < 2) { // 신선한 경로에서만 분기
                        this.spawnHead();
                    }
                }
            }
        }

        if (this.drawnBlackPixels < this.totalBlackPixels) {
            this.animationId = requestAnimationFrame(() => this.animate());
        }
    }

    finishAndFadeIn(duration = 2000) {
        if (this.animationId) cancelAnimationFrame(this.animationId);

        // 1. 메모리 상에서 드로잉 끝까지 진행
        // 안전 장치: 최대 루프 횟수 제한 (무한 루프 방지)
        let safety = 0;
        const maxSteps = 1000000;

        while (this.drawnBlackPixels < this.totalBlackPixels && safety < maxSteps) {
            // 펜 관리 (기존 animate 로직의 초고속 버전)
            if (this.drawingHeads.length < this.config.maxHeads) {
                if (this.drawingHeads.length === 0 || Math.random() < 0.1) this.spawnHead();
            }

            for (let i = this.drawingHeads.length - 1; i >= 0; i--) {
                const head = this.drawingHeads[i];
                const currentPixel = this.pixelMap.get(head.x + "," + head.y);

                if (currentPixel) {
                    if (currentPixel.visitCount === 0) this.drawnBlackPixels++;
                    currentPixel.visitCount++;
                    head.life--;
                }

                if (head.life <= 0) {
                    this.drawingHeads.splice(i, 1);
                    continue;
                }

                const neighbors = [];
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue;
                        const np = this.pixelMap.get((head.x + dx) + "," + (head.y + dy));
                        if (np && np.visitCount < 2) neighbors.push({ pixel: np, dx, dy });
                    }
                }

                if (neighbors.length === 0) {
                    this.drawingHeads.splice(i, 1);
                } else {
                    if (head.vx !== 0 || head.vy !== 0) {
                        neighbors.sort((a, b) => {
                            const dotA = a.dx * head.vx + a.dy * head.vy;
                            const dotB = b.dx * head.vx + b.dy * head.vy;
                            const momentum = 0.8;
                            const scoreA = (dotA * momentum) + (a.pixel.intensity) - (a.pixel.visitCount * 2.0);
                            const scoreB = (dotB * momentum) + (b.pixel.intensity) - (b.pixel.visitCount * 2.0);
                            return scoreB - scoreA;
                        });
                    } else {
                        neighbors.sort((a, b) => b.pixel.intensity - a.pixel.intensity);
                    }

                    const next = neighbors[0];
                    if (next.pixel.visitCount > 10) {
                        this.drawingHeads.splice(i, 1);
                        continue;
                    }

                    head.x = next.pixel.x;
                    head.y = next.pixel.y;
                    head.vx = next.dx;
                    head.vy = next.dy;

                    this.ctx.beginPath();
                    this.ctx.moveTo(this.offsetX + (head.x - head.vx), this.offsetY + (head.y - head.vy));
                    this.ctx.lineTo(this.offsetX + head.x, this.offsetY + head.y);
                    const alpha = Math.max(0.1, (next.pixel.intensity || 0.5) - (next.pixel.visitCount * 0.05));
                    this.ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();

                    if (neighbors.length > 2 && this.drawingHeads.length < this.config.maxHeads &&
                        Math.random() < this.config.branchProbability && next.pixel.visitCount < 2) {
                        this.spawnHead();
                    }
                }
            }
            safety++;
        }

        // 2. 완성된 캔버스를 이미지로 변환하여 페이드 인 오버레이
        const dataUrl = this.canvas.toDataURL();
        const img = document.createElement('img');
        img.src = dataUrl;
        img.style.position = 'absolute';
        img.style.top = '0';
        img.style.left = '0';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.opacity = '0';
        img.style.transition = `opacity ${duration / 1000}s ease-in-out`;
        img.style.pointerEvents = 'none'; // 클릭 통과

        this.container.appendChild(img);

        // 약간의 지연 후 Opacity 1로 변경 (트랜지션 트리거)
        setTimeout(() => {
            img.style.opacity = '1';
        }, 50);

        console.log("Finished & Fading in...");
    }
}
