!(function(window){
    var GDATA = [],//该数组保存canvas中各图形的x,y坐标以及他们的颜色
        SIZE = 64,//音乐片段数
        self;
    function Visualizer(canvas){
        self = this;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ctx.globalCompositeOperation = 'lighter';
        this.width = canvas.clientWidth;
        this.height = canvas.clientHeight * 2;
        this.dotMode = 'random';
        this.init();
    }

    /*
     *  获取[min ,max]之间的随机数
     *  若无参数则min = 0，max = 1
     *	max < min 则返回 0
     */
    function random(min, max){
        min = min || 0;
        max = max || 1;
        return max >= min ? Math.round(Math.random()*(max - min) + min) : 0;
    }

    Visualizer.prototype.init = function () {
        //创建线性渐变对象，以便绘制柱状图使用
        GDATA.length = 0;
        GDATA.linearGradient = this.ctx.createLinearGradient(0, this.height, 0, 0);
        GDATA.linearGradient.addColorStop(0, 'green');
        GDATA.linearGradient.addColorStop(0.5, 'yellow');
        GDATA.linearGradient.addColorStop(1, 'red');

        for(var i = 0;i < SIZE; i++){
            var ran = random(1, 4);
            GDATA.push({
                x: random(0, this.width),
                y: random(0, this.height-10),
                color: 'rgba('+random(100, 250)+','+random(50, 250)+','+random(50, 100)+',0)',
                dx: this.dotMode == 'random' ? ran : 0,
                dx2: ran,
                dy: random(1, 5),
                cap: 0,
                cheight : 10
            });
        }
    };
    /**柱状渲染*/
    Visualizer.prototype.renderColumn = function(arr){
        self.ctx.fillStyle = GDATA.linearGradient;
        self.ctx.clearRect(0,0,self.width,self.height);
        var w = self.width / SIZE,//柱状总宽
            cgap = Math.round(w * 0.3);//柱状间距
            cw = w - cgap;//柱状实际宽
        for(var i = 0, g, h; i < SIZE; i++){
            g = GDATA[i];
            h = arr[i] / 256 * self.height;//柱状总高
            g.cheight > cw && (g.cheight = cw);//柱状顶部小块的高不超过其宽
            if(--g.cap < g.cheight){//柱状顶部小块下落到最低点后不再减少
                g.cap = g.cheight;
            }
            if(h > 0 && (g.cap < h + 20)){//柱状顶部小块不超过最高点
                g.cap = h + 20 > self.height ? self.height : h + 20;
            }
            self.ctx.fillRect(w * i, self.height - g.cap, cw, g.cheight);//绘制柱状
            self.ctx.fillRect(w * i, self.height - h, cw, h);//绘制柱状顶部小块
        }
    };
    /**圆点渲染*/
    Visualizer.prototype.renderDot = function(arr){
        self.ctx.fillStyle = GDATA.linearGradient;
        self.ctx.clearRect(0,0,self.width,self.height);
        for(var i = 0, g, h; i < SIZE/2; i++) {
            g = GDATA[i];
            var x = g.x,
                y = g.y,
                r = Math.round((arr[i] / 5 + 10) * self.width / 800);//半径
            g.x += g.dx;//向右移动
            g.x > (self.width + r) && (g.x = -r);//超出右侧则返回到左侧

            var gradient = self.ctx.createRadialGradient(x, y, 0, x, y, r);
            gradient.addColorStop(0, 'white');
            gradient.addColorStop(1, g.color);
            self.ctx.fillStyle = gradient;
            //开始路径，绘画圆
            self.ctx.beginPath();
            self.ctx.arc(x, y, r, 0, Math.PI * 2, true);//绘制圆点
            self.ctx.fill();
        }
    };
    /**线条渲染*/
    Visualizer.prototype.renderLine = function(arr){
        self.ctx.strokeStyle = '#00d0ff';
        self.ctx.clearRect(0,0,self.width,self.height);
        var step = Math.round(arr.length / 60), //采样步长
            w = 20,
            gap = 2;
        for (var i = 0, energy; i < SIZE; i++) {
            energy = Math.round((arr[step * i] / 256) * 50);
            for (var j = 0; j < energy; j++) {
                self.ctx.beginPath();
                self.ctx.moveTo(w * i + gap, 200 + 4 * j);
                self.ctx.lineTo(w * (i + 1) - gap, 200 + 4 * j);
                self.ctx.stroke();
                self.ctx.beginPath();
                self.ctx.moveTo(w * i + gap, 200 - 4 * j);
                self.ctx.lineTo(w * (i + 1) - gap, 200 - 4 * j);
                self.ctx.stroke();
            }
        }
    };
    /**正弦波渲染*/
    Visualizer.prototype.renderSinewave = function(arr){
        self.ctx.clearRect(0,0,self.width,self.height);
        self.ctx.lineWidth = 2;
        self.ctx.strokeStyle = '#00d0ff';
        self.ctx.beginPath();

        var sliceWidth = self.width / SIZE;
        var x = 0;
        for(var i = 0, v, y; i < SIZE; i++) {
            v = 1-Math.max(0,Math.min(arr[i] / 256.0,1));
            y = v * self.height;
            if(i === 0) {
                self.ctx.moveTo(x, y);
            } else {
                self.ctx.lineTo(x, y);
            }
            x += sliceWidth;
        }
        self.ctx.stroke();
    };
    /**等距渲染*/
    Visualizer.prototype.renderEqual = function(arr){
        self.ctx.fillStyle = '#00d0ff';
        self.ctx.clearRect(0,0,self.width,self.height);
        var w = self.width / SIZE * 2,//柱状总宽
            cgap = Math.round(w * 0.3),//柱状间距
            cw = w - cgap,//柱状实际宽
            ch = (self.height - 20) / 2;
        for(var i = 0, v, h; i < SIZE; i++){
            if(arr[i] > 0){
                v = 1 - Math.max(0,Math.min(arr[i] / 256,1));
                h = v * self.height / 2;
                self.ctx.fillRect(w * i, ch, cw, ch - h);
                self.ctx.fillRect(w * i, ch, cw, h - ch);
            }
        }
    };
    /**渲染*/
    Visualizer.prototype.renderOhter1 = function(arr) {
        self.ctx.strokeStyle = '#00d0ff';
        self.ctx.lineWidth = 2;
        self.ctx.clearRect(0, 0, self.width, self.height);
        self.ctx.beginPath();
        var cw = 150,
            ch = 75,
            r = 15;
        for (var i = 3, len = arr.length; i < len; i++) {
            var xX1 = Math.cos((i - 2) / 5.25),
                x1 = cw + r * xX1,
                zZ1 = Math.sin((i - 2) / 5.25),
                z1 = ch + r * zZ1;

            var xX2 = Math.cos((i - 2) / 5.25),
                x2 = cw + (r + (arr[i] * 0.3)) * xX2,
                zZ2 = Math.sin((i - 2) / 5.25),
                z2 = ch + (r + (arr[i] * 0.3)) * zZ2;

            self.ctx.moveTo(x1, z1);
            self.ctx.lineTo(x2, z2);
        }
        self.ctx.stroke();
    };
    /**渲染*/
    Visualizer.prototype.renderOhter2 = function(arr){
        self.ctx.strokeStyle = '#00d0ff';
        self.ctx.lineWidth = 5;
        self.ctx.clearRect(0,0,self.width,self.height);
        self.ctx.beginPath();
        for (var i = 3; i<SIZE; i++){
            var xX1 = Math.cos((i-2)*5.25),
                x1 = 150 + 0.1*xX1,
                zZ1 = Math.sin((i-2)*5.25),
                z1 = 75 + 0.1*zZ1;

            var xX2 = Math.cos((i-2)*5.25),
                x2 = 150 +(0.1+(arr[i]*0.4))*xX2,
                zZ2 = Math.sin((i-2)*5.25),
                z2 = 75+ (0.1+(arr[i]*0.4))*zZ2;

            self.ctx.moveTo(x1, z1);
            self.ctx.lineTo(x2, z2);
        }
        self.ctx.stroke();
    };
    /**渲染*/
    Visualizer.prototype.renderOhter3 = function(arr){
        self.ctx.strokeStyle = '#fff';
        self.ctx.clearRect(0,0,self.width,self.height);
        var w = self.width / SIZE * 2,
            ch = (self.height - 20) / 2;
        for(var i = 0, r; i < SIZE; i++) {
            r = Math.round(arr[i] / SIZE * 10);//半径
            //开始路径，绘画圆
            self.ctx.beginPath();
            self.ctx.arc(i * w, ch, r, 0, Math.PI * 2, true);//绘制圆点
            self.ctx.stroke();
        }
    };
    /**条形块渲染*/
    var stripBlockColor = ["#0FF", "#0BB", "#088", "#044"];
    var stripBlockPosition = [
        'topleft',
        'topright',
        'topmirror',
        'bottomleft',
        'bottomright',
        'bottommirror',
        'horizontalleft',
        'horizontalright',
        'horizontalmirror',
        'leftdown',
        'leftup',
        'leftmirror',
        'rightdown',
        'rightup',
        'rightmirror',
        'verticaldown',
        'verticalup',
        'verticalmirror'
    ];
    var pIndex = 0,position = stripBlockPosition[pIndex];
    setInterval(function(){
        position = stripBlockPosition[++pIndex % stripBlockPosition.length];
    },3000);
    Visualizer.prototype.renderStripblock = function(arr){
        self.ctx.clearRect(0,0,self.width,self.height);
        self.ctx.beginPath();
        var W = self.width - 40,
            H = self.height - 20,
            len = arr.length,
            D = 4,//block width
            L = stripBlockColor.length;
        var c, /* color index */
            i, /* data index */
            p, /* 1st canvas pixel row / col */
            q, /* 2nd canvas pixel row / col */
            v; /* volume */

        for (c = 0; c < L; c++) {
            self.ctx.fillStyle = stripBlockColor[c];
            switch (position) {
                case 'topleft':
                    for (i = 0, p = 0; i < len && p < W; i++) {
                        p = ~~(i * D);
                        v = ~~(arr[i] / 256 * H / L) + 1;
                        self.ctx.fillRect(p, v * c, 1 - D, v - 1);
                    }
                    break;
                case 'topright':
                    for (i = 0, p = W; i < len && p >= 0; i++) {
                        p = ~~(W - i * D);
                        v = ~~(arr[i] / 256 * H / L) + 1;
                        self.ctx.fillRect(p, v * c, 1 - D, v - 1);
                    }
                    break;
                case 'topmirror':
                    for (i = 0, p = W / 2; i < len && p >= 0; i++) {
                        p = ~~(W / 2 - i * D);
                        q = ~~(W / 2 + i * D + 1);
                        v = ~~(arr[i] / 256 * H / L) + 1;
                        self.ctx.fillRect(p, v * c, 1 - D, v - 1);
                        self.ctx.fillRect(q, v * c, D - 1, v - 1);
                    }
                    break;
                case 'bottomright':
                    for (i = 0, p = W; i < len && p >= 0; i++) {
                        p = ~~(W - i * D);
                        v = ~~(arr[i] / 256 * H / L) + 1;
                        self.ctx.fillRect(p, H - v * c, 1 - D, 1 - v);
                    }
                    break;
                case 'bottomleft':
                    for (i = 0, p = 0; i < len && p < W; i++) {
                        p = ~~(i * D);
                        v = ~~(arr[i] / 256 * H / L) + 1;
                        self.ctx.fillRect(p, H - v * c, 1 - D, 1 - v);
                    }
                    break;
                case 'bottommirror':
                    for (i = 0, p = W / 2; i < len && p >= 0; i++) {
                        p = ~~(W / 2 - i * D);
                        q = ~~(W / 2 + i * D + 1);
                        v = ~~(arr[i] / 256 * H / L) + 1;
                        self.ctx.fillRect(p, H - v * c, 1 - D, 1 - v);
                        self.ctx.fillRect(q, H - v * c, D - 1, 1 - v);
                    }
                    break;
                case 'leftdown':
                    for (i = 0, p = 0; i < len && p < H; i++) {
                        p = ~~(i * D);
                        v = ~~(arr[i] / 256 * W / L) + 1;
                        self.ctx.fillRect(v * c, p, v - 1, 1 - D);
                    }
                    break;
                case 'leftup':
                    for (i = 0, p = 0; i < len && p < H; i++) {
                        p = ~~(H - 1 - i * D);
                        v = ~~(arr[i] / 256 * W / L) + 1;
                        self.ctx.fillRect(v * c, p, v - 1, 1 - D);
                    }
                    break;
                case 'leftmirror':
                    for (i = 0, p = H / 2; i < len && p >= 0; i++) {
                        p = ~~(H / 2 - i * D);
                        q = ~~(H / 2 + i * D + 1);
                        v = ~~(arr[i] / 256 * W / L) + 1;
                        self.ctx.fillRect(v * c, p, v - 1, 1 - D);
                        self.ctx.fillRect(v * c, q, v - 1, D - 1);
                    }
                    break;
                case 'rightdown':
                    for (i = 0, p = 0; i < len && p < H; i++) {
                        p = ~~(i * D);
                        v = ~~(arr[i] / 256 * W / L) + 1;
                        self.ctx.fillRect(W - v * c, p, 1 - v, 1 - D);
                    }
                    break;
                case 'rightup':
                    for (i = 0, p = H; i < len && p >= 0; i++) {
                        p = ~~(H - i * D);
                        v = ~~(arr[i] / 256 * W / L) + 1;
                        self.ctx.fillRect(W - v * c, p, 1 - v, 1 - D);
                    }
                    break;
                case 'rightmirror':
                    for (i = 0, p = H / 2; i < len && p >= 0; i++) {
                        p = ~~(H / 2 - i * D);
                        q = ~~(H / 2 + i * D + 1);
                        v = ~~(arr[i] / 256 * W / L) + 1;
                        self.ctx.fillRect(W - v * c, p, 1 - v, 1 - D);
                        self.ctx.fillRect(W - v * c, q, 1 - v, D - 1);
                    }
                    break;
                case 'horizontalright':
                    for (i = 0, p = W; i < len && p >= 0; i++) {
                        p = ~~(W - i * D);
                        v = ~~(arr[i] / 512 * H / L) + 1;
                        v = (v === 1 ? 0 : v);
                        self.ctx.fillRect(p, ~~(H / 2) + v * c, 1 - D, v - 1);
                        self.ctx.fillRect(p, ~~(H / 2) - v * c, 1 - D, 1 - v);
                    }
                    break;
                case 'horizontalleft':
                    for (i = 0, p = 0; i < len && p < W; i++) {
                        p = ~~(i * D);
                        v = ~~(arr[i] / 512 * H / L) + 1;
                        v = (v === 1 ? 0 : v);
                        self.ctx.fillRect(p, ~~(H / 2) + v * c, 1 - D, v - 1);
                        self.ctx.fillRect(p, ~~(H / 2) - v * c, 1 - D, 1 - v);
                    }
                    break;
                case 'horizontalmirror':
                    for (i = 0, p = W / 2; i < len && p >= 0; i++) {
                        p = ~~(W / 2 - i * D);
                        q = ~~(W / 2 + i * D + 1);
                        v = ~~(arr[i] / 512 * H / L) + 1;
                        v = (v === 1 ? 0 : v);
                        self.ctx.fillRect(p, ~~(H / 2) + v * c, 1 - D, v - 1);
                        self.ctx.fillRect(q, ~~(H / 2) + v * c, D - 1, v - 1);
                        self.ctx.fillRect(p, ~~(H / 2) - v * c, 1 - D, 1 - v);
                        self.ctx.fillRect(q, ~~(H / 2) - v * c, D - 1, 1 - v);
                    }
                    break;
                case 'verticaldown':
                    for (i = 0, p = 0; i < len && p < H; i++) {
                        p = ~~(i * D);
                        v = ~~(arr[i] / 512 * W / L) + 1;
                        v = (v === 1 ? 0 : v);
                        self.ctx.fillRect(~~(W / 2) + v * c, p, v - 1, 1 - D);
                        self.ctx.fillRect(~~(W / 2) - v * c, p, 1 - v, 1 - D);
                    }
                    break;
                case 'verticalup':
                    for (i = 0, p = H; i < len && p >= 0; i++) {
                        p = ~~(H - i * D);
                        v = ~~(arr[i] / 512 * W / L) + 1;
                        v = (v === 1 ? 0 : v);
                        self.ctx.fillRect(~~(W / 2) + v * c, p, v - 1, 1 - D);
                        self.ctx.fillRect(~~(W / 2) - v * c, p, 1 - v, 1 - D);
                    }
                    break;
                case 'verticalmirror':
                    for (i = 0, p = H / 2; i < len && p >= 0; i++) {
                        p = ~~(H / 2 - i * D);
                        q = ~~(H / 2 + i * D + 1);
                        v = ~~(arr[i] / 512 * W / L) + 1;
                        v = (v === 1 ? 0 : v);
                        self.ctx.fillRect(~~(W / 2) + v * c, p, v - 1, 1 - D);
                        self.ctx.fillRect(~~(W / 2) + v * c, q, v - 1, D - 1);
                        self.ctx.fillRect(~~(W / 2) - v * c, p, 1 - v, 1 - D);
                        self.ctx.fillRect(~~(W / 2) - v * c, q, 1 - v, D - 1);
                    }
                    break;
            }
        }
    };
    window.Visualizer = Visualizer;
})(window);