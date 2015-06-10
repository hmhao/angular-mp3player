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
        self.ctx.strokeStyle = "#00d0ff";
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

    window.Visualizer = Visualizer;
})(window);