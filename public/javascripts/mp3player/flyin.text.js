!(function (window) {

    var FlyinText = function() {
        this.timeOut;
    };
    /**
     * $txt: JQuery Element 文本元素
     * realWidth: Int 可视宽度
     * wholeWidth: Int 文本总体宽度
     * */
    FlyinText.prototype.init = function($txt, realWidth, wholeWidth) {
        this.$txt = $txt;
        this.realWidth = realWidth;
        this.wholeWidth = wholeWidth;
    };

    FlyinText.prototype.animate = function() {
        //console.log("animate Func");
        var that = this;
        this.$txt.animate(
            {marginLeft: "-"+(this.wholeWidth-this.realWidth)},
            5000,
            function() {
                clearTimeout(that.timeOut);
                that.timeOut = setTimeout(
                    function() {
                        //console.log("timeOut");
                        //console.log(that.$txt);
                        that.$txt.animate({marginLeft: 0}, 1000, function() {
                            that.animate();
                        });
                    },
                    1500);
            }
        );
    };

    /**
     * realWidth: Int 可视宽度
     * wholeWidth: Int 文本总体宽度
     * */
    FlyinText.prototype.start = function(realWidth, wholeWidth) {
        this.stop();
        this.wholeWidth = (typeof wholeWidth !== "undefined") ? wholeWidth : this.wholeWidth;
        this.realWidth = (typeof realWidth !== "undefined") ? realWidth : this.realWidth;
        if(this.wholeWidth > this.realWidth)
            this.animate();
    };

    FlyinText.prototype.stop = function() {
        clearTimeout(this.timeOut);
        this.$txt.stop();
        this.$txt.css("margin-left", "0px");
    };

    window.FlyinText = FlyinText;
})(window);
