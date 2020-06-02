function initPint(){
    Vue.prototype.Matrix = window.Matrix;

    window.BezierViewer = Vue.component('BezierViewer',{
        data:function(){
            return {
                boxWidth:300,
                width:100,
                offsetStartX : 0,
                offsetEndX : 0,
                offsetStartY : 0,
                offsetEndY : 0,
            };
        },
        props:['dots','title'],
        watch:{
            dots:function(){
                this.$nextTick(function(){
                    this.bindListen();
                });
            },
        },
        template:"#bezier-curve-template",
        mounted:function(){
            this.$nextTick(function(){
                this.bindListen();
            });
        },
        computed:{
            indexStartX:function(){
                return (this.boxWidth - this.width) / 2;
            },
            indexStartY:function(){
                return (this.boxWidth - this.width) / 2 + this.width;
            },
            indexEndX:function(){
                return (this.boxWidth - this.width) / 2 + this.width;
            },
            indexEndY:function(){
                return  (this.boxWidth - this.width) / 2 ;
            },
            //开始坐标x
            startX:function(){
                return this.indexStartX + this.offsetStartX;
            },
            //开始坐标y
            startY:function(){
                return this.indexStartY + this.offsetStartY;
            },
            //终点坐标x
            endX:function(){
                return this.indexEndX + this.offsetEndX;
            },
            //终点坐标y
            endY:function(){
                return this.indexEndY + this.offsetEndY;
            },
            //当前的bezier对象
            bezier:function(){
                let bezier;
                switch(this.dots.length){
                    case 0:
                        bezier = new BezierCurve([
                            [this.startX,this.startY],
                            [this.endX,this.endY],
                        ]);
                        break;
                    default:
                        //多个控制点
                        let bezierDots = [
                            {
                                x : this.startX,
                                y : this.startY,
                            },
                        ];
                        bezierDots = bezierDots.concat(this.dots);
                        bezierDots.push({
                            x : this.endX,
                            y : this.endY,
                        });
                        bezier = new BezierCurve(bezierDots);
                        break;
                };
                return bezier;
            },
            //绘制贝塞尔曲线
            curvePath:function(){
                let path = "";
                //只有两个控制点
                switch(this.dots.length){
                    case 0:
                        path = "M" + [this.startX,this.startY].join(',') + " L" + [this.endX,this.endY].join(",");
                        break;
                    // case 1:
                    //     path = "M" + [this.startX,this.startY].join(',') + " Q" + [this.dots[0].x , this.dots[0].y].join(' ') + " " + [this.endX,this.endY].join(',');
                    //     break;
                    // case 2:
                    //     let arr = this.dots.map(function(v){
                    //         return v.x + ',' + v.y;
                    //     });
                    //     path = "M" + [this.startX,this.startY].join(',') + " C" + arr.join(' ') + " " + [this.endX,this.endY].join(',');
                    //     break;
                    default:
                        //分成一千份计算path
                        let segNum = 1000 , dots = [];
                        for(var i = 1;i <= segNum;i++){
                            let index = this.startX + (this.endX - this.startX) * i / segNum ;
                            let dot = this.bezier.getDot(index);
                            if(isNaN(dot.x) || isNaN(dot.y)){
                                console.log(this.bezier,this.dots)
                            }
                            dots.push( dot.x + ',' + dot.y);
                        };
                        path = "M" + [this.startX,this.startY].join(',') + " L" + dots.join(" L");
                    }
                return path;
            },
            //将各点连接
            linePath:function(){
                let path = "";
                let arr = this.dots.map(function(v){
                    return v.x + ',' + v.y;
                });
                if(arr.length > 0){
                    path = "M" + [this.startX,this.startY].join(',') + " L" + arr.join(' ');
                }else{
                    path = null;
                }
                return path;
            },
        },
        methods:{
            changeIndexCircle:function($event,type){
                let value = $event.target.value;
                if(value == ''){
                    return; 
                };
                let startOrEnd = type <= 1 ? 'Start' : "End" , 
                    XOrY = type%2 == 0 ? 'X' : 'Y';
                this['offset' + startOrEnd + XOrY] = value -  this['index' + startOrEnd + XOrY] ;
            },
            //给每个控制点 、 开始结束点 绑定监听
            bindListen:function(){
                let _this = this;
                this.$el.querySelectorAll('g.dot-g , circle.index-circle').forEach(function(v){
                    if(v.dragListen != undefined){
                        return true;
                    };
                    let _target = $(v) , index = 0;
                    if(_target.is('g.dot-g')){
                        index = Array.prototype.indexOf.call( _this.$el.querySelectorAll('g.dot-g') , v );
                    }else{
                        index = Array.prototype.indexOf.call( _this.$el.querySelectorAll('circle.index-circle') , v )
                    }
                    v.dragListen = true;
                    _target.myDrag({
                        moveTarget:$('body'),
                        start:function(e){
                            _target.css('cursor','grabbing')
                            $('body').css('cursor','grabbing');
                        },
                        end:function(){
                            _target.css('cursor','');
                            $('body').css('cursor','');
                        },
                        move:function(e){
                            e.stopPropagation();
                            e.preventDefault();
                            if(_target.is('g.dot-g')){
                                let x = _this.dots[index].x + e.myDragX ,
                                y = _this.dots[index].y + e.myDragY;
                                _this.dots[index].x = Math.min( _this.boxWidth , Math.max(0,x));
                                _this.dots[index].y = Math.min( _this.boxWidth , Math.max(0,y));
                            }else{
                                if(index == 0){
                                    //起点
                                    _this.offsetStartX = Math.max( -_this.indexStartX , 
                                        Math.min(_this.boxWidth - _this.indexStartX , _this.offsetStartX + e.myDragX ) 
                                    );
                                    _this.offsetStartY = Math.max( -_this.indexStartY , 
                                        Math.min(_this.boxWidth - _this.indexStartY , _this.offsetStartY + e.myDragY ) 
                                    ); 
                                }else{
                                    //终点
                                    _this.offsetEndX = Math.max( -_this.indexEndX , 
                                        Math.min(_this.boxWidth - _this.indexEndX , _this.offsetEndX + e.myDragX ) 
                                    );
                                    _this.offsetEndY = Math.max( -_this.indexEndY , 
                                        Math.min(_this.boxWidth - _this.indexEndY , _this.offsetEndY + e.myDragY ) 
                                    ); 
                                };
                            }
              
                        },
                    });
                });
            },
            //添加一个控制点
            addDot:function(){
                this.dots.push({
                    x: this.endX,
                    y: this.endY,
                });
            },
            //删除一个控制点
            deleteDot:function(index){
                this.dots.splice(index,1);
            }
        },
    });
    let data = {
        dotsSet:[
            {   
                dots:[],
                title:'X方向',
                options:{},
            },
            {
                dots:[],
                title:'Y方向',
                options:{},
            },
        ],
    };

    let methods = {
    };

    window.mainApp = new Vue({
        el:'main',
        data:data,
        methods:{
            //绘制动画
            drawAnimation:function(){
                if(this.rafCount == undefined){
                    this.rafCount = 1;
                }else{
                    this.rafCount ++ ;
                };
                let frame = 60 , indexFrame = 0 , rafCount = this.rafCount , 
                    _ball = this.$el.querySelector('.ball') ;
                let components = this.$children;
                let proportions = [];
                let offsets = [
                    //translateX 最大为clientWidth
                    this.$el.querySelector('.ball-container').clientWidth, 
                    // translateY 最大为50
                    50,                                                    
                ];
                components.forEach(function(v , index){
                    let proportion = (v.endY - v.startY) == 0 ? 1 : offsets[index] / (v.endY - v.startY);
                    // let proportion = 1;
                    proportions.push( proportion );
                });
                let matrix = new Matrix(_ball.style.transform) ;
                draw.call(this);

                function draw(){
                    let transformMatrix = Matrix.prototype.clone(matrix);
                    proportions.forEach(function(v,index){
                        let bezier = components[index].bezier;
                        let dot = bezier.getDot(bezier.start.x + (bezier.end.x - bezier.start.x) * indexFrame / frame);
                        let offset = (dot.y - components[index].startY) * v;
                        switch(index){
                            case 0 : // translate X 
                                transformMatrix.e = offset;
                                // transformMatrix = transformMatrix.multi(new Matrix(1,0,0,1,offset,0));
                                break;
                            case 1 : // translate Y
                                transformMatrix.f = offset;
                                // transformMatrix = transformMatrix.multi(new Matrix(1,0,0,1,0,offset));
                                break;
                        };
                    });
                    _ball.style.transform = transformMatrix;
                    if(rafCount <= window.mainApp.rafCount){
                        if(indexFrame < frame){
                            indexFrame ++ ;
                            requestAnimationFrame(draw);
                            return;
                        }
                    }
                }

            },
        },
        watch:{
        },
        components:{
            'bezier-viewer':window.BezierViewer,
        },
        mounted:function(){

        },
    });

}

/**
 * 自定义的贝塞尔曲线
 * dots:[
 *  [x,y],
 *  [x,y],
 *  ....
 * ];
 * 第一个点为起点，最后一个点为终点
 */
(function(w){
  
    w.BezierCurve = function(dots){
        if(arguments.length == 0 || dots.length < 2){
            console.error('dots : 至少需要两个点!');
        };
        if(this == window){
            return null;
        };
        //点去重
        this.dots = [];
        let coordinatesString =[];
        dots.forEach(function(v){
            let coordinate = { x : v['x']!=undefined ? v['x'] : v[0]  , y : v['y']!=undefined ? v['y'] : v[1] } ,
                cStr = coordinate.x + '-' + coordinate.y;
            if(coordinatesString.indexOf(cStr) >= 0){
                return true;
            };
            coordinatesString.push(cStr);
            this.dots.push(coordinate);
        },this);
        this.start = this.dots[0];
        this.end = this.dots[this.dots.length - 1];
    };

    Object.assign(BezierCurve.prototype,{
        getDot:function(index){
            index = Math.max(this.start.x,Math.min(this.end.x,index));
            let proportion = (index - this.start.x) / (this.end.x - this.start.x);
            let indexX = index;
            let indexY = this.start.y + proportion * (this.end.y - this.start.y);
            return BezierCurve.calc.call(this,this.dots,{
                x : indexX,
                y : indexY,
            });
        },
        print:function(){
            this.dots.map(function(v){
                return "[" + v.x + ',' + v.y + "]";
            });
            return "new Bezier( [ " + this.dots.join(',') + " ])";
        },
    });

    /**
     * 计算点的坐标
     */
    BezierCurve.calc = function(dots,indexDot){
        if(dots.length <= 2){
            return indexDot;
        };
        let length = dots.length ;
        let proportion;
        if( dots[dots.length - 1].x != dots[0].x){
            proportion = (indexDot.x - dots[0].x) / (dots[dots.length - 1].x - dots[0].x);
        }else if(dots[dots.length - 1].y != dots[0].y){
            proportion = (indexDot.y - dots[0].y) / (dots[dots.length - 1].y - dots[0].y);
        }else{
            return indexDot;
        };

        let newDots = [];
        for(let i = 0;i <= (length - 2);i++){
            let dotSet = dots.slice(i,i + 2);
            newDots.push({
                x : (dotSet[1].x - dotSet[0].x) * proportion + dotSet[0].x,
                y : (dotSet[1].y - dotSet[0].y) * proportion + dotSet[0].y,
            });
        };
        //计算 新的点
        let newIndexDot = {
            x : ( newDots[newDots.length - 1].x - newDots[0].x ) * proportion + newDots[0].x ,
            y : ( newDots[newDots.length - 1].y - newDots[0].y ) * proportion + newDots[0].y ,
        };
        if(newDots.length <= 2){
            return newIndexDot;
        }else{
            return BezierCurve.calc(newDots,newIndexDot);
        }
    };

})(window);





/**
 * 批量设置DOM属性
 * abcDef 会被拆开为 abc-def;
 */
function setAttrs(dom,obj){
    for(var i in obj){
        let attr = (i + '').split('').map(function(v){
            return v.toLowerCase() == v ? v : ('-' + v.toLowerCase());
        }).join('');
        dom.setAttribute(attr,obj[i]);
    };
    return dom;
}

/**
 * 创建一个svg元素节点
 */
function createSvgEl(name){
    return document.createElementNS("http://www.w3.org/2000/svg",name);
};





//自定义transform Matrix 类
/**
 *  a  c  e  
 *  b  d  f
 *  0  0  1
 */
(function(w){
    if(w.isArray == undefined){
        w.isArray = function(a){
            return Object.prototype.toString.call(a) == '[object Array]';
        }
    }
    w.Matrix=function(a,b,c,d,e,f){
        let params;
        if(arguments.length===0||arguments[0]==='none'||arguments[0]===''){
            return new Matrix(1,0,0,1,0,0);
        }else if(isArray(a)){
            params=a;
        }else if(typeof a === 'string'){
            a=a.replace(/[^\d,.-]/g,'');
            params=a.split(',');
            for(var i in params){
                params[i]=parseFloat(params[i]);
            }
        }else{
            params=[a,b,c,d,e,f];
        }
        if(this==window){
            return "matrix("+params.join(',')+")";
        }
        this.a=params[0];
        this.b=params[1];
        this.c=params[2];
        this.d=params[3];
        this.e=params[4];
        this.f=params[5];
        return this;
    };
    Matrix.prototype={
        clone:function(obj){
            if(this instanceof Matrix){
                Object.keys(this).forEach(function(v){
                    this[v] = obj[a];
                },this);
                return this;
            }
            return new Matrix(obj.a,obj.b,obj.c,obj.d,obj.e,obj.f);
        },
        multi:function(m){
            if(! (m instanceof Matrix) ){
                return false;
            }
            let arr=[
                this.a*m.a+this.c*m.b,
                this.b*m.a+this.d*m.b,
                this.a*m.c+this.c*m.d,
                this.b*m.c+this.d*m.d,
                this.a*m.e+this.c*m.f+this.e,
                this.b*m.e+this.d*m.f+this.f,
            ];
            return  new Matrix(arr);
        },
        add:function(m){
            if(! (m instanceof Matrix) ){
                return false;
            }
            return new Matrix([
                this.a+m.a,
                this.b+m.b,
                this.c+m.c,
                this.d+m.d,
                this.e+m.e,
                this.f+m.f,
            ]);
        },
        sub:function(m){
            if(! (m instanceof Matrix) ){
                return false;
            }
            return new Matrix([
                this.a-m.a,
                this.b-m.b,
                this.c-m.c,
                this.d-m.d,
                this.e-m.e,
                this.f-m.f,
            ]);
        },
        toString:function(){
            let params=[this.a,this.b,this.c,this.d,this.e,this.f];
            return "matrix("+params.join(',')+")";
        }
    }

  

})(window);


/**
 * myDrag
 * 
 */

 (function(){
    $.fn.myDrag=function(inOptions){
        let options={
            start:function(e){return true},
            move:function(e){},
            end:function(e){},
            moveTarget:undefined,
            delegateTarget:'',//事件代理 设置的时侯this是用来代理事件的
        };
        options=$.extend(options,inOptions);
        _document=$(document);
        this.each(function(){
            let _this=$(this);
            let mousedownDrag=false;
            let indexX=0,indexY=0;
            let _moveTarget=options['moveTarget']==undefined?_this:options['moveTarget'];
            bindListen();
            function bindListen(){
                _document.on('mouseup touchend',mouseupHandler);
                if(options['delegateTarget']==''){
                    _moveTarget[0].addEventListener('mousemove',mousemoveHandler);
                    _moveTarget[0].addEventListener('touchmove',mousemoveHandler);
                    // _moveTarget[0].addEventListener('mouseout',mouseupHandler)
                    _this[0].addEventListener('mousedown',mousedownHandler);
                    _this[0].addEventListener('touchstart',mousedownHandler);
                }else{
                    _this.delegate(options['delegateTarget'],'mousemove',mousemoveHandler);
                    _this.delegate(options['delegateTarget'],'touchmove',mousemoveHandler);
                    _this.delegate(options['delegateTarget'],'mousedown',mousedownHandler);
                    _this.delegate(options['delegateTarget'],'touchstart',mousedownHandler);
                }
    
    
                function mousedownHandler(e){
                    processEvent(e);
                    if( options['start'].call(_this[0],e)==false){
                        return true;    
                    }
                    mousedownDrag=true;
                    indexX=e.pageX;
                    indexY=e.pageY;
                }
                function mouseupHandler(e){
                    if(mousedownDrag==false){
                        return true;
                    }
                    //mouseout 到 moveTarget 外部
                    if(e.type == 'mouseout' && _moveTarget[0] != e.relatedTarget && _moveTarget[0].contains(e.relatedTarget) ){
                        return true;
                    }
                    //冒泡事件
                    processEvent(e);
                    options['end'].call(_this[0],e);
                    mousedownDrag=false;
                }
                function mousemoveHandler(e){
                    if(mousedownDrag==false){
                        return true;
                    }
                    processEvent(e);
                    e.myDragX=e.pageX-indexX;
                    e.myDragY=e.pageY-indexY;
                    options['move'].call(_this[0],e);
                    indexX=e.pageX;
                    indexY=e.pageY;
                }
            }
        });
    }

    //处理mobile 事件 将移动端event.targetTouches[0].pageX Y 给 jquery event.pageX Y
    function processEvent(e){
        //非touch事件
        if(typeof TouchEvent!='function' || ! ( e instanceof TouchEvent ) ){
            return e;
        }
        let _touch = e.targetTouches[0]?e.targetTouches[0]:e.changedTouches[0];
        e.pageX=_touch.pageX;
        e.pageY=_touch.pageY;
        return e;
    };

 })(window);