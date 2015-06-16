!(function(window) {
    var splitReg = /\n|\r/,
        txtReg = /\[[\s\S]*?\]/,
        timeReg = /\[\d{2,}:\d{2}(?:[\.|:]\d{2,5})?\]/g,
        offsetReg = /\[offset:[+|\-]?\d+?(?=\])/,
        isString = function(obj){
            return Object.prototype.toString.call(obj) === '[object String]';
        },
        time2ms = function(time) {
            var m, ms, s, t;
            t = time.split(':');
            m = t[0];
            if (t.length === 3) {
                s = t[1];
                ms = t[2];
            } else {
                t = t[1].split('.');
                s = t[0];
                ms = t[1];
            }
            return ~~m * 60 * 1000 + ~~s * 1000 + ~~ms;
        },
        escape = (function(map){
            var escaper = function(match) {
                return map[match];
            };
            var keys = [];
            for (var key in map){
                if (map.hasOwnProperty(key))
                    keys.push(key);
            }
            var source = '(?:' + keys.join('|') + ')';
            var testRegexp = new RegExp(source);
            var replaceRegexp = new RegExp(source, 'g');
            return function(string) {
                string = string == null ? '' : '' + string;
                return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
            };
        })({'&': '&amp;','<': '&lt;','>': '&gt;','"': '&quot;',"'": '&#x27;','`': '&#x60;'}),
        now = Date.now || function() {
            return new Date().getTime();
        },
        throttle = function(func, wait, options) {
            var context, args, result;
            var timeout = null;
            var previous = 0;
            if (!options) options = {};
            var later = function() {
                previous = options.leading === false ? 0 : now();
                timeout = null;
                result = func.apply(context, args);
                if (!timeout) context = args = null;
            };
            return function() {
                var _now = now();
                if (!previous && options.leading === false) previous = _now;
                var remaining = wait - (_now - previous);
                context = this;
                args = arguments;
                if (remaining <= 0 || remaining > wait) {
                    if (timeout) {
                        clearTimeout(timeout);
                        timeout = null;
                    }
                    previous = _now;
                    result = func.apply(context, args);
                    if (!timeout) context = args = null;
                } else if (!timeout && options.trailing !== false) {
                    timeout = setTimeout(later, remaining);
                }
                return result;
            };
        };

    function Lrc(options) {
        var opts;
        this.opts = opts = $.extend({}, this.defaults, options);
        if (!opts.el) {
            throw new Error('el cannot be empty.');
        }
        this.$el = $(opts.el).addClass(opts.cls);
        this.$ul = $(opts.ul).appendTo(this.$el);
    }

    Lrc.prototype.defaults = {
        version: "1.0.0",
        lrc: '',
        el: '',
        ul: '<ul></ul>',
        cls: 'muui-lrc',
        itemCls: 'muui-lrc-item',
        duration: 500,
        offset: 0
    };

    Lrc.prototype.create = function(lrc) {
        delete this._curLine;
        this.autoScroll = true;
        this.lrc = lrc;
        this.parse();
        this.render();

        var self = this;
        var wheelNotLeave;
        this.$el.bind('mousewheel',function() {
            if (self.autoScroll) {
                wheelNotLeave = true;
                self.autoScroll = false;
                self.$el.bind("mouseleave.lrcwheel", function() {
                    wheelNotLeave = false;
                    self.autoScroll = true;
                    self.$el.unbind("mouseleave.lrcwheel");
                });

            }
        });
        this.$el.bind('mousedown',function() {
            if (self.autoScroll || wheelNotLeave) {
                self.autoScroll = false;
                $(document).bind("mouseup.lrc", function() {
                    self.autoScroll = true;
                    $(document).unbind("mouseup.lrc");
                });
            }
        });
        this.$el.bind("mouseleave.lrcup", function() {
            wheelNotLeave = false;
            self.autoScroll = true;
        });
    };

    Lrc.prototype.parse = function() {
        var lrc = this.lrc;
        if (!isString(lrc) || !(lrc = $.trim(lrc))) {
            this.clear();
        }
        if (this.isLrc(lrc)) {
            this.parseLrc(lrc);
        } else {
            this.parseTxt(lrc);
        }
    };

    Lrc.prototype.clear = function() {
        this.$ul.empty();
        this.$ul.append("<li>该歌曲暂时没有歌词</li>");
        this._parsed = [];
        this.setState('no-lrc');
    };

    Lrc.prototype.parseLrc = function(lrc) {
        var item, items, line, match, offset, r, time, txt, _i, _j, _len, _len1, _ref;
        r = [];
        offset = 0;
        if (match = lrc.match(offsetReg)) {
            offset = ~~match[0].slice(8);
        }
        _ref = lrc.split(splitReg);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            line = _ref[_i];
            items = line.match(timeReg) || [];
            if ($.isArray(items)) {
                txt = $.trim(line.replace(items.join(''), ''));
            }
            for (_j = 0, _len1 = items.length; _j < _len1; _j++) {
                item = items[_j];
                time = time2ms(item.slice(1, -1)) + offset;
                r.push([time, txt]);
            }
        }
        if (r.length) {
            this._parsed = r.sort(function(a, b) {
                return a[0] - b[0];
            });
            this.setState('lrc');
        } else {
            this.setState('no-lrc');
        }
    };

    Lrc.prototype.parseTxt = function(txt) {
        var line, lines, r, _i, _len;
        r = [];
        lines = txt.replace(txtReg, '').split(splitReg);
        for (_i = 0, _len = lines.length; _i < _len; _i++) {
            line = lines[_i];
            line = $.trim(line);
            if (line) {
                r.push([-1, line]);
            }
        }
        if (r.length) {
            this._parsed = r;
            this.setState('txt-lrc');
        } else {
            this.setState('no-lrc');
        }
    };

    Lrc.prototype.render = function() {
        if (!this._parsed || !this._parsed.length) {
            this.clear();
            return
        }
        var opts = this.opts,
            itemCls = opts.itemCls;
        this.$ul.empty();
        for (var i = 0, len = this._parsed.length, item; i < len; i++) {
            item = this._parsed[i];
            this.$ul.append('<li class='+itemCls+' lang="'+
                item[0]+'">'+(item[1] ? escape(item[1]) : '&nbsp;')+'</li>');
        }
        this.$item = this.$el.find("." + itemCls);
    };

    Lrc.prototype.scrollTo = throttle(function(ms) {
        ms = ~~ms;
        if (!ms || this.getState() === 'no-lrc') {
            return;
        }
        var $el = this.$el,
            $ul = this.$ul,
            $item = this.$item,
            opts = this.opts,
            offset = opts.offset,
            duration = opts.duration,
            line, top;
        line = this.findLine(ms);
        //console.log('scrollline:' + line);
        if (line === -1) {
            return $el.scrollTop(0);
        } else if (line === this._curLine) {
            return;
        }
        this._curLine = line;
        $item.removeClass('on');
        top = $item.eq(line).addClass('on').offset().top - $ul.offset().top - $el.height() / 2 + offset;
        if (top < 0) {
            top = 0;
        }
        if(this.autoScroll){
            $el.stop(true).animate({
                scrollTop: top
            }, duration);
        }
    }, 500);

    Lrc.prototype.findLine = function(ms) {
        var parsed = this._parsed;
        if (!parsed || !parsed.length) {
            return -1;
        }
        var head = 0,
            tail = parsed.length,
            mid = Math.floor(tail / 2),
            getTime = function(pos) {
                var item = parsed[pos];
                return item && item[0];
            };
        if (ms < getTime(0)) {
            return -1;
        }
        while (true) {
            if (ms < getTime(mid)) {
                tail = mid - 1;
            } else {
                head = mid + 1;
            }
            mid = Math.floor((head + tail) / 2);
            if (ms >= getTime(mid) && ms < getTime(mid + 1)) {
                break;
            }
        }
        return mid;
    };

    Lrc.prototype.isLrc = function(lrc) {
        return timeReg.test(lrc);
    };

    Lrc.prototype.setState = function(st) {
        this._state = st;
        return this.$el.addClass(st);
    };

    Lrc.prototype.getState = function() {
        return this._state;
    };

    window.Lrc = Lrc;
})(window);