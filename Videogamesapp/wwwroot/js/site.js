// Get references to the elements
const stars = document.getElementById('stars');
const moon = document.getElementById('moon');
const mountains_behind = document.getElementById('mountains_behind');
const text = document.getElementById('text');
const btn = document.getElementById('btn');
const mountains_front = document.getElementById('mountains_front');
const header = document.querySelector('header');

// Add scroll event listener
window.addEventListener('scroll', function () {
    // Get the current scroll position
    let value = window.scrollY;

    // Update element styles based on scroll position
    stars.style.left = value * 0.25 + 'px';
    moon.style.top = value * 1.05 + 'px';
    mountains_behind.style.top = value * 0.5 + 'px';
    mountains_front.style.top = value * 0 + 'px';
    text.style.marginRight = value * 4 + 'px';
    text.style.marginTop = value * 1.5 + 'px';
    header.style.top = value * 0.5 + 'px';
});
//TETRIS
                (function () {
                    var isStart = false;
                    var tetris = {
                        board: [],
                        boardDiv: null,
                        canvas: null,
                        pSize: 20,
                        canvasHeight: 440,
                        canvasWidth: 250,
                        boardHeight: 0,
                        boardWidth: 0,
                        spawnX: 4,
                        spawnY: 1,
                        shapes: [
                            [
                                [-1, 1],
                                [0, 1],
                                [1, 1],
                                [0, 0], //TEE
                            ],
                            [
                                [-1, 0],
                                [0, 0],
                                [1, 0],
                                [2, 0], //line
                            ],
                            [
                                [-1, -1],
                                [-1, 0],
                                [0, 0],
                                [1, 0], //L EL
                            ],
                            [
                                [1, -1],
                                [-1, 0],
                                [0, 0],
                                [1, 0], //R EL
                            ],
                            [
                                [0, -1],
                                [1, -1],
                                [-1, 0],
                                [0, 0], // R ess
                            ],
                            [
                                [-1, -1],
                                [0, -1],
                                [0, 0],
                                [1, 0], //L ess
                            ],
                            [
                                [0, -1],
                                [1, -1],
                                [0, 0],
                                [1, 0], //square
                            ],
                        ],
                        tempShapes: null,
                        curShape: null,
                        curShapeIndex: null,
                        curX: 0,
                        curY: 0,
                        curSqs: [],
                        nextShape: null,
                        nextShapeDisplay: null,
                        nextShapeIndex: null,
                        sqs: [],
                        score: 0,
                        scoreDisplay: null,
                        level: 1,
                        levelDisplay: null,
                        numLevels: 10,
                        time: 0,
                        maxTime: 1000,
                        timeDisplay: null,
                        isActive: 0,
                        curComplete: false,
                        timer: null,
                        sTimer: null,
                        speed: 700,
                        lines: 0,
                        setButtonHandlers: function () {
                            var me = this;
                            document.getElementById('rotate').addEventListener('click', function () {
                                me.rotate();
                            });

                            document.getElementById('move-left').addEventListener('click', function () {
                                me.move('L');
                            });

                            document.getElementById('move-right').addEventListener('click', function () {
                                me.move('R');
                            });

                            document.getElementById('drop').addEventListener('click', function () {
                                me.move('D');
                            });
                            document.getElementById('pause-btn').addEventListener('click', function () {
                                me.togglePause();
                            });
                        },

                        init: function () {
                            isStart = true;
                            this.canvas = document.getElementById('canvas');
                            this.initBoard();
                            this.initInfo();
                            this.initLevelScores();
                            this.initShapes();
                            this.bindKeyEvents();
                            this.setButtonHandlers();
                            this.play();
                        },
                        initBoard: function () {
                            this.boardHeight = this.canvasHeight / this.pSize;
                            this.boardWidth = this.canvasWidth / this.pSize;
                            var s = this.boardHeight * this.boardWidth;
                            for (var i = 0; i < s; i++) {
                                this.board.push(0);
                            }
                            //this.boardDiv = document.getElementById('board); //for debugging
                        },
                        initInfo: function () {
                            this.nextShapeDisplay = document.getElementById('next_shape');
                            this.levelDisplay = document
                                .getElementById('level')
                                .getElementsByTagName('span')[0];
                            this.timeDisplay = document
                                .getElementById('time')
                                .getElementsByTagName('span')[0];
                            this.scoreDisplay = document
                                .getElementById('score')
                                .getElementsByTagName('span')[0];
                            this.linesDisplay = document
                                .getElementById('lines')
                                .getElementsByTagName('span')[0];
                            this.setInfo('time');
                            this.setInfo('score');
                            this.setInfo('level');
                            this.setInfo('lines');
                        },
                        initShapes: function () {
                            this.curSqs = [];
                            this.curComplete = false;
                            this.shiftTempShapes();
                            this.curShapeIndex = this.tempShapes[0];
                            this.curShape = this.shapes[this.curShapeIndex];
                            this.initNextShape();
                            this.setCurCoords(this.spawnX, this.spawnY);
                            this.drawShape(this.curX, this.curY, this.curShape);
                        },
                        initNextShape: function () {
                            if (typeof this.tempShapes[1] === 'undefined') {
                                this.initTempShapes();
                            }
                            try {
                                this.nextShapeIndex = this.tempShapes[1];
                                this.nextShape = this.shapes[this.nextShapeIndex];
                                this.drawNextShape();
                            } catch (e) {
                                throw new Error('Could not create next shape. ' + e);
                            }
                        },
                        initTempShapes: function () {
                            this.tempShapes = [];
                            for (var i = 0; i < this.shapes.length; i++) {
                                this.tempShapes.push(i);
                            }
                            var k = this.tempShapes.length;
                            while (--k) {
                                //Fisher Yates Shuffle
                                var j = Math.floor(Math.random() * (k + 1));
                                var tempk = this.tempShapes[k];
                                var tempj = this.tempShapes[j];
                                this.tempShapes[k] = tempj;
                                this.tempShapes[j] = tempk;
                            }
                        },
                        shiftTempShapes: function () {
                            try {
                                if (
                                    typeof this.tempShapes === 'undefined' ||
                                    this.tempShapes === null
                                ) {
                                    this.initTempShapes();
                                } else {
                                    this.tempShapes.shift();
                                }
                            } catch (e) {
                                throw new Error('Could not shift or init tempShapes: ' + e);
                            }
                        },
                        initTimer: function () {
                            var me = this;
                            var tLoop = function () {
                                me.incTime();
                                me.timer = setTimeout(tLoop, 2000);
                            };
                            this.timer = setTimeout(tLoop, 2000);
                        },
                        initLevelScores: function () {
                            var c = 1;
                            for (var i = 1; i <= this.numLevels; i++) {
                                this['level' + i] = [c * 1000, 40 * i, 5 * i]; //for nxt level, row score, p sore,
                                c = c + c;
                            }
                        },
                        setInfo: function (el) {
                            this[el + 'Display'].innerHTML = this[el];
                        },
                        drawNextShape: function () {
                            var ns = [];
                            for (var i = 0; i < this.nextShape.length; i++) {
                                ns[i] = this.createSquare(
                                    this.nextShape[i][0] + 2,
                                    this.nextShape[i][1] + 2,
                                    this.nextShapeIndex
                                );
                            }
                            this.nextShapeDisplay.innerHTML = '';
                            for (var k = 0; k < ns.length; k++) {
                                this.nextShapeDisplay.appendChild(ns[k]);
                            }
                        },
                        drawShape: function (x, y, p) {
                            for (var i = 0; i < p.length; i++) {
                                var newX = p[i][0] + x;
                                var newY = p[i][1] + y;
                                this.curSqs[i] = this.createSquare(newX, newY, this.curShapeIndex);
                            }
                            for (var k = 0; k < this.curSqs.length; k++) {
                                this.canvas.appendChild(this.curSqs[k]);
                            }
                        },
                        createSquare: function (x, y, type) {
                            var el = document.createElement('div');
                            el.className = 'square type' + type;
                            el.style.left = x * this.pSize + 'px';
                            el.style.top = y * this.pSize + 'px';
                            return el;
                        },
                        removeCur: function () {
                            var me = this;
                            this.curSqs.eachdo(function () {
                                me.canvas.removeChild(this);
                            });
                            this.curSqs = [];
                        },
                        setCurCoords: function (x, y) {
                            this.curX = x;
                            this.curY = y;
                        },
                        bindKeyEvents: function () {
                            var me = this;
                            var event = 'keypress';
                            if (this.isSafari() || this.isIE()) {
                                event = 'keydown';
                            }
                            var cb = function (e) {
                                me.handleKey(e);
                            };
                            if (window.addEventListener) {
                                document.addEventListener(event, cb, false);
                            } else {
                                document.attachEvent('on' + event, cb);
                            }
                        },
                        handleKey: function (e) {
                            var c = this.whichKey(e);
                            var dir = '';
                            switch (c) {
                                case 37:
                                    this.move('L');
                                    break;
                                case 38:
                                    this.move('RT');
                                    break;
                                case 39:
                                    this.move('R');
                                    break;
                                case 40:
                                    this.move('D');
                                    break;
                                case 27: //esc: pause
                                    this.togglePause();
                                    break;
                                default:
                                    break;
                            }
                        },
                        whichKey: function (e) {
                            var c;
                            if (window.event) {
                                c = window.event.keyCode;
                            } else if (e) {
                                c = e.keyCode;
                            }
                            return c;
                        },
                        incTime: function () {
                            this.time++;
                            this.setInfo('time');
                        },
                        incScore: function (amount) {
                            this.score = this.score + amount;
                            this.setInfo('score');
                        },
                        incLevel: function () {
                            this.level++;
                            this.speed = this.speed - 75;
                            this.setInfo('level');
                        },
                        incLines: function (num) {
                            this.lines += num;
                            this.setInfo('lines');
                        },
                        calcScore: function (args) {
                            var lines = args.lines || 0;
                            var shape = args.shape || false;
                            var speed = args.speed || 0;
                            var score = 0;

                            if (lines > 0) {
                                score += lines * this['level' + this.level][1];
                                this.incLines(lines);
                            }
                            if (shape === true) {
                                score += shape * this['level' + this.level][2];
                            }
                            /*if (speed > 0){ score += speed * this["level" +this .level[3]];}*/
                            this.incScore(score);
                        },
                        checkScore: function () {
                            if (this.score >= this['level' + this.level][0]) {
                                this.incLevel();
                            }
                        },
                        gameOver: function () {
                            this.clearTimers();
                            isStart = false;
                            this.canvas.innerHTML = '<h1>GAME OVER</h1>';
                        },
                        play: function () {
                            var me = this;
                            if (this.timer === null) {
                                this.initTimer();
                            }
                            var gameLoop = function () {
                                me.move('D');
                                if (me.curComplete) {
                                    me.markBoardShape(me.curX, me.curY, me.curShape);
                                    me.curSqs.eachdo(function () {
                                        me.sqs.push(this);
                                    });
                                    me.calcScore({ shape: true });
                                    me.checkRows();
                                    me.checkScore();
                                    me.initShapes();
                                    me.play();
                                } else {
                                    me.pTimer = setTimeout(gameLoop, me.speed);
                                }
                            };
                            this.pTimer = setTimeout(gameLoop, me.speed);
                            this.isActive = 1;
                        },
                        togglePause: function () {
                            if (this.isActive === 1) {
                                this.clearTimers();
                                this.isActive = 0;
                                document.getElementById('pause-btn').textContent = 'Start'; // Cambiar texto a "Start"
                            } else {
                                this.play();
                                document.getElementById('pause-btn').textContent = 'Pause'; // Cambiar texto a "Pause"
                            }
                        },
                        clearTimers: function () {
                            clearTimeout(this.timer);
                            clearTimeout(this.pTimer);
                            this.timer = null;
                            this.pTimer = null;
                        },
                        move: function (dir) {
                            var s = '';
                            var me = this;
                            var tempX = this.curX;
                            var tempY = this.curY;
                            switch (dir) {
                                case 'L':
                                    s = 'left';
                                    tempX -= 1;
                                    break;
                                case 'R':
                                    s = 'left';
                                    tempX += 1;
                                    break;
                                case 'D':
                                    s = 'top';
                                    tempY += 1;
                                    break;
                                case 'RT':
                                    this.rotate();
                                    return true;
                                    break;
                                default:
                                    throw new Error('wtf');
                                    break;
                            }
                            if (this.checkMove(tempX, tempY, this.curShape)) {
                                this.curSqs.eachdo(function (i) {
                                    var l = parseInt(this.style[s], 10);
                                    dir === 'L' ? (l -= me.pSize) : (l += me.pSize);
                                    this.style[s] = l + 'px';
                                });
                                this.curX = tempX;
                                this.curY = tempY;
                            } else if (dir === 'D') {
                                if (this.curY === 1 || this.time === this.maxTime) {
                                    this.gameOver();
                                    return false;
                                }
                                this.curComplete = true;
                            }
                        },
                        rotate: function () {
                            if (this.curShapeIndex !== 6) {
                                //square
                                var temp = [];
                                this.curShape.eachdo(function () {
                                    temp.push([this[1] * -1, this[0]]);
                                });
                                if (this.checkMove(this.curX, this.curY, temp)) {
                                    this.curShape = temp;
                                    this.removeCur();
                                    this.drawShape(this.curX, this.curY, this.curShape);
                                } else {
                                    throw new Error('Could not rotate!');
                                }
                            }
                        },
                        checkMove: function (x, y, p) {
                            if (this.isOB(x, y, p) || this.isCollision(x, y, p)) {
                                return false;
                            }
                            return true;
                        },
                        isCollision: function (x, y, p) {
                            var me = this;
                            var bool = false;
                            p.eachdo(function () {
                                var newX = this[0] + x;
                                var newY = this[1] + y;
                                if (me.boardPos(newX, newY) === 1) {
                                    bool = true;
                                }
                            });
                            return bool;
                        },
                        isOB: function (x, y, p) {
                            var w = this.boardWidth - 1;
                            var h = this.boardHeight - 1;
                            var bool = false;
                            p.eachdo(function () {
                                var newX = this[0] + x;
                                var newY = this[1] + y;
                                if (newX < 0 || newX > w || newY < 0 || newY > h) {
                                    bool = true;
                                }
                            });
                            return bool;
                        },
                        getRowState: function (y) {
                            var c = 0;
                            for (var x = 0; x < this.boardWidth; x++) {
                                if (this.boardPos(x, y) === 1) {
                                    c = c + 1;
                                }
                            }
                            if (c === 0) {
                                return 'E';
                            }
                            if (c === this.boardWidth) {
                                return 'F';
                            }
                            return 'U';
                        },
                        checkRows: function () {
                            var me = this;
                            var start = this.boardHeight;
                            this.curShape.eachdo(function () {
                                var n = this[1] + me.curY;
                                console.log(n);
                                if (n < start) {
                                    start = n;
                                }
                            });
                            console.log(start);

                            var c = 0;
                            var stopCheck = false;
                            for (var y = this.boardHeight - 1; y >= 0; y--) {
                                switch (this.getRowState(y)) {
                                    case 'F':
                                        this.removeRow(y);
                                        c++;
                                        break;
                                    case 'E':
                                        if (c === 0) {
                                            stopCheck = true;
                                        }
                                        break;
                                    case 'U':
                                        if (c > 0) {
                                            this.shiftRow(y, c);
                                        }
                                        break;
                                    default:
                                        break;
                                }
                                if (stopCheck === true) {
                                    break;
                                }
                            }
                            if (c > 0) {
                                this.calcScore({ lines: c });
                            }
                        },
                        shiftRow: function (y, amount) {
                            var me = this;
                            for (var x = 0; x < this.boardWidth; x++) {
                                this.sqs.eachdo(function () {
                                    if (me.isAt(x, y, this)) {
                                        me.setBlock(x, y + amount, this);
                                    }
                                });
                            }
                            me.emptyBoardRow(y);
                        },
                        emptyBoardRow: function (y) {
                            for (var x = 0; x < this.boardWidth; x++) {
                                this.markBoardAt(x, y, 0);
                            }
                        },
                        removeRow: function (y) {
                            for (var x = 0; x < this.boardWidth; x++) {
                                this.removeBlock(x, y);
                            }
                        },
                        removeBlock: function (x, y) {
                            var me = this;
                            this.markBoardAt(x, y, 0);
                            this.sqs.eachdo(function (i) {
                                if (me.getPos(this)[0] === x && me.getPos(this)[1] === y) {
                                    me.canvas.removeChild(this);
                                    me.sqs.splice(i, 1);
                                }
                            });
                        },
                        setBlock: function (x, y, block) {
                            this.markBoardAt(x, y, 1);
                            var newX = x * this.pSize;
                            var newY = y * this.pSize;
                            block.style.left = newX + 'px';
                            block.style.top = newY + 'px';
                        },
                        isAt: function (x, y, block) {
                            if (this.getPos(block)[0] === x && this.getPos(block)[1] === y) {
                                return true;
                            }
                            return false;
                        },
                        getPos: function (block) {
                            var p = [];
                            p.push(parseInt(block.style.left, 10) / this.pSize);
                            p.push(parseInt(block.style.top, 10) / this.pSize);
                            return p;
                        },
                        getBoardIdx: function (x, y) {
                            return x + y * this.boardWidth;
                        },
                        boardPos: function (x, y) {
                            return this.board[x + y * this.boardWidth];
                        },
                        markBoardAt: function (x, y, val) {
                            this.board[this.getBoardIdx(x, y)] = val;
                        },
                        markBoardShape: function (x, y, p) {
                            var me = this;
                            p.eachdo(function (i) {
                                var newX = p[i][0] + x;
                                var newY = p[i][1] + y;
                                me.markBoardAt(newX, newY, 1);
                            });
                        },
                        isIE: function () {
                            return this.bTest(/IE/);
                        },
                        isFirefox: function () {
                            return this.bTest(/Firefox/);
                        },
                        isSafari: function () {
                            return this.bTest(/Safari/);
                        },
                        bTest: function (rgx) {
                            return rgx.test(navigator.userAgent);
                        },
                    };
                    const btn = document.querySelector('#start');
                    btn.addEventListener('click', function () {
                        btn.style.display = 'none';
                        if (!isStart) {
                            tetris.init();
                        }
                    });
                })();

                if (!Array.prototype.eachdo) {
                    Array.prototype.eachdo = function (fn) {
                        for (var i = 0; i < this.length; i++) {
                            fn.call(this[i], i);
                        }
                    };
                }
                if (!Array.prototype.remDup) {
                    Array.prototype.remDup = function () {
                        var temp = [];
                        for (var i = 0; i < this.length; i++) {
                            var bool = true;
                            for (var j = i + 1; j < this.length; j++) {
                                if (this[i] === this[j]) {
                                    bool = false;
                                }
                            }
                            if (bool === true) {
                                temp.push(this[i]);
                            }
                        }
                        return temp;
                    };
}

class Stage {
    constructor() {
        // container
        this.container = document.getElementById('game');
        
        // renderer
        this.renderer = new THREE.WebGLRenderer({ alpha: true }); // Habilitar transparencia (alpha: true)
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 0); // Establecer el color de fondo como transparente

        this.container.appendChild(this.renderer.domElement);

        // scene
        this.scene = new THREE.Scene();

        // camera
        let aspect = window.innerWidth / window.innerHeight;
        let d = 20;
        this.camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, -100, 1000);
        this.camera.position.set(2, 2, 2);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));

        //light
        this.light = new THREE.DirectionalLight(0xffffff, 0.5);
        this.light.position.set(0, 499, 0);
        this.scene.add(this.light);

        this.softLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(this.softLight);

        window.addEventListener('resize', () => this.onResize());
        this.onResize();
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    add(elem) {
        this.scene.add(elem);
    }

    remove(elem) {
        this.scene.remove(elem);
    }

    setCamera(y, speed = 0.3) {
        TweenLite.to(this.camera.position, speed, { y: y + 4, ease: Power1.easeInOut });
        TweenLite.to(this.camera.lookAt, speed, { y: y, ease: Power1.easeInOut });
    }

    onResize() {
        let viewSize = 30;
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.left = window.innerWidth / -viewSize;
        this.camera.right = window.innerWidth / viewSize;
        this.camera.top = window.innerHeight / viewSize;
        this.camera.bottom = window.innerHeight / -viewSize;
        this.camera.updateProjectionMatrix();
    }
}

class Block {
    constructor(block) {
        // set size and position
        this.STATES = { ACTIVE: 'active', STOPPED: 'stopped', MISSED: 'missed' };
        this.MOVE_AMOUNT = 12;
        this.dimension = { width: 0, height: 0, depth: 0 };
        this.position = { x: 0, y: 0, z: 0 };
        this.targetBlock = block;
        this.index = (this.targetBlock ? this.targetBlock.index : 0) + 1;
        this.workingPlane = this.index % 2 ? 'x' : 'z';
        this.workingDimension = this.index % 2 ? 'width' : 'depth';
        // set the dimensions from the target block, or defaults.
        this.dimension.width = this.targetBlock ? this.targetBlock.dimension.width : 10;
        this.dimension.height = this.targetBlock ? this.targetBlock.dimension.height : 2;
        this.dimension.depth = this.targetBlock ? this.targetBlock.dimension.depth : 10;
        this.position.x = this.targetBlock ? this.targetBlock.position.x : 0;
        this.position.y = this.dimension.height * this.index;
        this.position.z = this.targetBlock ? this.targetBlock.position.z : 0;
        this.colorOffset = this.targetBlock ? this.targetBlock.colorOffset : Math.round(Math.random() * 100);
        // set color
        if (!this.targetBlock) {
            this.color = 0x333344;
        }
        else {
            let offset = this.index + this.colorOffset;
            var r = Math.sin(0.3 * offset) * 55 + 200;
            var g = Math.sin(0.3 * offset + 2) * 55 + 200;
            var b = Math.sin(0.3 * offset + 4) * 55 + 200;
            this.color = new THREE.Color(r / 255, g / 255, b / 255);
        }
        // state
        this.state = this.index > 1 ? this.STATES.ACTIVE : this.STATES.STOPPED;
        // set direction
        this.speed = -0.1 - (this.index * 0.005);
        if (this.speed < -4)
            this.speed = -4;
        this.direction = this.speed;
        // create block
        let geometry = new THREE.BoxGeometry(this.dimension.width, this.dimension.height, this.dimension.depth);
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(this.dimension.width / 2, this.dimension.height / 2, this.dimension.depth / 2));
        this.material = new THREE.MeshToonMaterial({ color: this.color, shading: THREE.FlatShading });
        this.mesh = new THREE.Mesh(geometry, this.material);
        this.mesh.position.set(this.position.x, this.position.y + (this.state == this.STATES.ACTIVE ? 0 : 0), this.position.z);
        if (this.state == this.STATES.ACTIVE) {
            this.position[this.workingPlane] = Math.random() > 0.5 ? -this.MOVE_AMOUNT : this.MOVE_AMOUNT;
        }
    }
    reverseDirection() {
        this.direction = this.direction > 0 ? this.speed : Math.abs(this.speed);
    }
    place() {
        this.state = this.STATES.STOPPED;
        let overlap = this.targetBlock.dimension[this.workingDimension] - Math.abs(this.position[this.workingPlane] - this.targetBlock.position[this.workingPlane]);
        let blocksToReturn = {
            plane: this.workingPlane,
            direction: this.direction
        };
        if (this.dimension[this.workingDimension] - overlap < 0.3) {
            overlap = this.dimension[this.workingDimension];
            blocksToReturn.bonus = true;
            this.position.x = this.targetBlock.position.x;
            this.position.z = this.targetBlock.position.z;
            this.dimension.width = this.targetBlock.dimension.width;
            this.dimension.depth = this.targetBlock.dimension.depth;
        }
        if (overlap > 0) {
            let choppedDimensions = { width: this.dimension.width, height: this.dimension.height, depth: this.dimension.depth };
            choppedDimensions[this.workingDimension] -= overlap;
            this.dimension[this.workingDimension] = overlap;
            let placedGeometry = new THREE.BoxGeometry(this.dimension.width, this.dimension.height, this.dimension.depth);
            placedGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(this.dimension.width / 2, this.dimension.height / 2, this.dimension.depth / 2));
            let placedMesh = new THREE.Mesh(placedGeometry, this.material);
            let choppedGeometry = new THREE.BoxGeometry(choppedDimensions.width, choppedDimensions.height, choppedDimensions.depth);
            choppedGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(choppedDimensions.width / 2, choppedDimensions.height / 2, choppedDimensions.depth / 2));
            let choppedMesh = new THREE.Mesh(choppedGeometry, this.material);
            let choppedPosition = {
                x: this.position.x,
                y: this.position.y,
                z: this.position.z
            };
            if (this.position[this.workingPlane] < this.targetBlock.position[this.workingPlane]) {
                this.position[this.workingPlane] = this.targetBlock.position[this.workingPlane];
            }
            else {
                choppedPosition[this.workingPlane] += overlap;
            }
            placedMesh.position.set(this.position.x, this.position.y, this.position.z);
            choppedMesh.position.set(choppedPosition.x, choppedPosition.y, choppedPosition.z);
            blocksToReturn.placed = placedMesh;
            if (!blocksToReturn.bonus)
                blocksToReturn.chopped = choppedMesh;
        }
        else {
            this.state = this.STATES.MISSED;
        }
        this.dimension[this.workingDimension] = overlap;
        return blocksToReturn;
    }
    tick() {
        if (this.state == this.STATES.ACTIVE) {
            let value = this.position[this.workingPlane];
            if (value > this.MOVE_AMOUNT || value < -this.MOVE_AMOUNT)
                this.reverseDirection();
            this.position[this.workingPlane] += this.direction;
            this.mesh.position[this.workingPlane] = this.position[this.workingPlane];
        }
    }
}
class Game {
    constructor() {
        this.STATES = {
            'LOADING': 'loading',
            'PLAYING': 'playing',
            'READY': 'ready',
            'ENDED': 'ended',
            'RESETTING': 'resetting'
        };
        this.blocks = [];
        this.state = this.STATES.LOADING;
        this.stage = new Stage();
        this.mainContainer = document.getElementById('container');
        this.scoreContainer = document.getElementById('score1');
        this.startButton = document.getElementById('start-button');
        this.instructions = document.getElementById('instructions');
        this.scoreContainer.innerHTML = '0';
        this.newBlocks = new THREE.Group();
        this.placedBlocks = new THREE.Group();
        this.choppedBlocks = new THREE.Group();
        this.stage.add(this.newBlocks);
        this.stage.add(this.placedBlocks);
        this.stage.add(this.choppedBlocks);
        this.addBlock();
        this.tick();
        this.updateState(this.STATES.READY);
        document.addEventListener('keydown', e => {
            if (e.keyCode == 32)
                this.onAction();
        });
        document.addEventListener('click', e => {
            this.onAction();
        });
        document.addEventListener('touchstart', e => {
            e.preventDefault();
        });
    }
    updateState(newState) {
        for (let key in this.STATES)
            this.mainContainer.classList.remove(this.STATES[key]);
        this.mainContainer.classList.add(newState);
        this.state = newState;
    }
    onAction() {
        switch (this.state) {
            case this.STATES.READY:
                this.startGame();
                break;
            case this.STATES.PLAYING:
                this.placeBlock();
                break;
            case this.STATES.ENDED:
                this.restartGame();
                break;
        }
    }
    startGame() {
        if (this.state != this.STATES.PLAYING) {
            this.scoreContainer.innerHTML = '0';
            this.updateState(this.STATES.PLAYING);
            this.addBlock();
        }
    }
    restartGame() {
        this.updateState(this.STATES.RESETTING);
        let oldBlocks = this.placedBlocks.children;
        let removeSpeed = 0.2;
        let delayAmount = 0.02;
        for (let i = 0; i < oldBlocks.length; i++) {
            TweenLite.to(oldBlocks[i].scale, removeSpeed, { x: 0, y: 0, z: 0, delay: (oldBlocks.length - i) * delayAmount, ease: Power1.easeIn, onComplete: () => this.placedBlocks.remove(oldBlocks[i]) });
            TweenLite.to(oldBlocks[i].rotation, removeSpeed, { y: 0.5, delay: (oldBlocks.length - i) * delayAmount, ease: Power1.easeIn });
        }
        let cameraMoveSpeed = removeSpeed * 2 + (oldBlocks.length * delayAmount);
        this.stage.setCamera(2, cameraMoveSpeed);
        let countdown = { value: this.blocks.length - 1 };
        TweenLite.to(countdown, cameraMoveSpeed, { value: 0, onUpdate: () => { this.scoreContainer.innerHTML = String(Math.round(countdown.value)); } });
        this.blocks = this.blocks.slice(0, 1);
        setTimeout(() => {
            this.startGame();
        }, cameraMoveSpeed * 1000);
    }
    placeBlock() {
        let currentBlock = this.blocks[this.blocks.length - 1];
        let newBlocks = currentBlock.place();
        this.newBlocks.remove(currentBlock.mesh);
        if (newBlocks.placed)
            this.placedBlocks.add(newBlocks.placed);
        if (newBlocks.chopped) {
            this.choppedBlocks.add(newBlocks.chopped);
            let positionParams = { y: '-=30', ease: Power1.easeIn, onComplete: () => this.choppedBlocks.remove(newBlocks.chopped) };
            let rotateRandomness = 10;
            let rotationParams = {
                delay: 0.05,
                x: newBlocks.plane == 'z' ? ((Math.random() * rotateRandomness) - (rotateRandomness / 2)) : 0.1,
                z: newBlocks.plane == 'x' ? ((Math.random() * rotateRandomness) - (rotateRandomness / 2)) : 0.1,
                y: Math.random() * 0.1,
            };
            if (newBlocks.chopped.position[newBlocks.plane] > newBlocks.placed.position[newBlocks.plane]) {
                positionParams[newBlocks.plane] = '+=' + (40 * Math.abs(newBlocks.direction));
            }
            else {
                positionParams[newBlocks.plane] = '-=' + (40 * Math.abs(newBlocks.direction));
            }
            TweenLite.to(newBlocks.chopped.position, 1, positionParams);
            TweenLite.to(newBlocks.chopped.rotation, 1, rotationParams);
        }
        this.addBlock();
    }
    addBlock() {
        let lastBlock = this.blocks[this.blocks.length - 1];
        if (lastBlock && lastBlock.state == lastBlock.STATES.MISSED) {
            return this.endGame();
        }
        this.scoreContainer.innerHTML = String(this.blocks.length - 1);
        let newKidOnTheBlock = new Block(lastBlock);
        this.newBlocks.add(newKidOnTheBlock.mesh);
        this.blocks.push(newKidOnTheBlock);
        this.stage.setCamera(this.blocks.length * 2);
        if (this.blocks.length >= 5)
            this.instructions.classList.add('hide');
    }
    endGame() {
        this.updateState(this.STATES.ENDED);
    }
    tick() {
        this.blocks[this.blocks.length - 1].tick();
        this.stage.render();
        requestAnimationFrame(() => { this.tick(); });
    }
}
let game = new Game();
