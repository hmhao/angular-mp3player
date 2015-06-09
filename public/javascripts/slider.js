var components = (function (window) {

//
//    HSlider.prototype.positionToValue = function (position) {
//        value = position / this.rangeWidth * (this.max - this.min) + this.min;
//        console.log('positionToValue: ' + value);
//        return value;
//    }

    if (!Function.prototype.bind) {
        Function.prototype.bind = function (scope) {
            var f = this;

            return function () {
                f.apply(scope, arguments);
            }
        }
    }

    var applySuperClass = function (SubSclass, SuperClass) {
        var F = function () {
        };
        F.prototype = SuperClass.prototype; // reference auf (gleiches) prototype Object
        SubSclass.prototype = new F(); // ein Objekt wird erzeut mit demselben prototype Object, aber Constructor-Body von Person wird *jetzt* nicht ausgeführt
        SubSclass.superproto = SuperClass.prototype; // optional
        SuperClass.prototype.constructor = SubSclass;


        //SubClass.prototype = Object.create(SuperClass.prototype);
    };

    //--------------------------------------------------------------------------------------

    var AbstractSlider = function (config) {
        this.view = config.view;

        // create dom children
        this.view.append('<div class="track"></div><div class="thumb"></div>');

        this.value = (isNaN(config.value) ? 0 : config.value);
        this.min = (isNaN(config.min) ? 0 : config.min);
        this.max = (isNaN(config.max) ? 100 : config.max);
        this.thumb = this.view.children('.thumb');
        this.track = this.view.children('.track');
        this.trackLeft = this.track.offset()[this.positionPropertyName];
        this.thumbWidth = this.thumb[this.sizeMethodName]();
        this.trackWidth = this.track[this.sizeMethodName]();
        this.rangeWidth = this.trackWidth - this.thumbWidth;
        this.dx = undefined; // offset between mouse position and thumb
        this.isDragged = false;


        // subscribe to mouse event
//        var that = this;
//        this.view.mousedown(function (e) {
//            model.onViewMousedown.apply(that, [e]);
//        });
        this.view.mousedown(this.onViewMousedown.bind(this));

        // initialize the slider position
        this.thumb.css(this.positionPropertyName, this.valueToPosition(this.value));
    };

    AbstractSlider.prototype.getValue = function () {
        return this.value;
    };

    AbstractSlider.prototype.getMin = function () {
        return this.min;
    };

    AbstractSlider.prototype.getMax = function () {
        return this.max;
    };

    AbstractSlider.prototype.positionToValue = function (position) {
        return position / this.rangeWidth * (this.max - this.min) + this.min;
    };

    AbstractSlider.prototype.calcPositionFromEvent = function (e) {
        return  Math.max(0,
            Math.min(this.rangeWidth, e[this.mousePositionProperty] - this.trackLeft - this.dx));
    };

    AbstractSlider.prototype.valueToPosition = function (value) {
        return (this.value - this.min) / (this.max - this.min) * this.rangeWidth;
    };

    AbstractSlider.prototype.setValue = function (val) {
        if (this.value === val)
            return;
        this.value = val;
        var position = this.valueToPosition(val);
        if (!this.isDragged)
            this.animateThumb(position);
        //console.log('value=' + val);


//        // create the event
//        var elem = this.view[0];
//        var e = document.createEvent('Event');
//        e.initEvent('change', true, true);
//        elem.dispatchEvent(e);

        // jQuery: create the event
        $(this).trigger('change');
    };

    AbstractSlider.prototype.onViewMousedown = function (e) {
        if (e.target == this.track[0]) {
            // track is clicked: move the thumb, center it at the mouse
            this.dx = this.thumbWidth / 2;
            var position = this.calcPositionFromEvent(e);
            this.setValue(this.positionToValue(position));
        }
        else {
            // thumb is clicked: keep the offset to the mouse
            this.dx = e[this.mousePositionProperty] - this.thumb.offset()[this.positionPropertyName];
        }
        this.thumb.addClass('down');
        var that = this;
        that.isDragged = true;
        $(document)
            .on('mousemove.startDrag', function (e) { // namespace, damit muss ich nicht den Handler mitgeben; wichtig, wenn ich den Handler an ein Objekt binde
                that.isDragged = true;
                var position = that.calcPositionFromEvent(e);
                that.setValue(that.positionToValue(position));
                that.thumb.css(that.positionPropertyName, position);
            })
            // oder stattdessen binden:
            .one('mouseup.startDrag', function gixi() {
            this.isDragged = false;
            $(document).off('mousemove.startDrag');
//          $(document).off('mouseup.startDrag');
            that.thumb.removeClass('down');
            $(this).trigger('mouseup');
        }.bind(this));
        e.preventDefault(); // prevent selecting text, etc.
    };


    //------------------------------------------------------------------------------------------

    var HSlider = function (config) {
        this.positionPropertyName = 'left';
        this.sizeMethodName = 'width';
        this.mousePositionProperty = 'pageX';

        AbstractSlider.apply(this, arguments);
    };

//    HSlider.prototype = new AbstractSlider();
    applySuperClass(HSlider, AbstractSlider);

    HSlider.prototype.animateThumb = function (position) {
        this.thumb.animate({left:position}, 100);
    };

    //------------------------------------------------------------------------------------------

    var VSlider = function (config) {
        this.positionPropertyName = 'top';
        this.sizeMethodName = 'height';
        this.mousePositionProperty = 'pageY';

        AbstractSlider.apply(this, arguments);
    };

    applySuperClass(VSlider, AbstractSlider);

    VSlider.prototype.animateThumb = function (position) {
        this.thumb.animate({top:position}, 100);
    };

    return {
        HSlider:HSlider,
        VSlider:VSlider
    }
}(window));
