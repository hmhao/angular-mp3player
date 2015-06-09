!function(){
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

    Visualizer.prototype.renderColumn = function(arr){
        self.ctx.fillStyle = GDATA.linearGradient;
        self.ctx.clearRect(0,0,self.width,self.height);
        var w = self.width / SIZE,
            cgap = Math.round(w * 0.3);
            cw = w - cgap;
        for(var i = 0, g, h; i < SIZE; i++){
            g = GDATA[i];
            h = arr[i] / 256 * self.height;
            g.cheight > cw && (g.cheight = cw);
            if(--g.cap < g.cheight){
                g.cap = g.cheight;
            }
            if(h > 0 && (g.cap < h + 20)){
                g.cap = h + 20 > self.height ? self.height : h + 20;
            }
            self.ctx.fillRect(w * i, self.height - g.cap, cw, g.cheight);
            self.ctx.fillRect(w * i, self.height - h, cw, h);
        }
    };

    Visualizer.prototype.renderDot = function(arr){
        self.ctx.fillStyle = GDATA.linearGradient;
        self.ctx.clearRect(0,0,self.width,self.height);
        for(var i = 0, g, h; i < SIZE/2; i++) {
            g = GDATA[i];
            var x = g.x,
                y = g.y,
                r = Math.round((arr[i] / 5 + 10) * self.width / 800);
            g.x += g.dx;
            g.x > (self.width + r) && (g.x = -r);

            var gradient = self.ctx.createRadialGradient(x, y, 0, x, y, r);
            gradient.addColorStop(0, 'white');
            gradient.addColorStop(1, g.color);
            self.ctx.fillStyle = gradient;
            //开始路径，绘画圆
            self.ctx.beginPath();
            self.ctx.arc(x, y, r, 0, Math.PI * 2, true);
            self.ctx.fill();
        }
    };

    Visualizer.prototype.setDotMode = function(){

    };
    window.Visualizer = Visualizer;
}();