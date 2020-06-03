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
                arr.push([this.endX,this.endY]);
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
        //是否显示轨迹
        showTrack:true,
        dotsSet:[
            {   
                dots:[],
                show:true,
                title:'X方向',
                options:{},
            },
            {
                dots:[],
                show:false,
                title:'Y方向',
                options:{},
            },
            {
                dots:[],
                show:false,
                title:'Z方向',
                options:{},
            },
        ],
    };


    window.mainApp = new Vue({
        el:'main',
        data:data,
        methods:{
            //添加一个贝塞尔曲线editor
            addCurveEditor:function(){
                for(var i in this.dotsSet){
                    if(!this.dotsSet[i].show){
                        this.dotsSet[i].show = true;
                        break;
                    }
                }
            },
            //绘制动画
            drawAnimation:function(){
                if(this.rafCount == undefined){
                    this.rafCount = 1;
                }else{
                    this.rafCount ++ ;
                };
                let frame = 60 , indexFrame = 0 , rafCount = this.rafCount , 
                    _ball = this.$el.querySelector('.ball') ,
                    //显示box-shadow的dom
                    _ballShadow = $(this.$el.querySelector('.ball-shadow'));
                let components = this.$children;
                let proportions = [];
                let offsets = [
                    //translateX 最大为clientWidth
                    this.$el.querySelector('.ball-container').clientWidth, 
                    // translateY 最大值
                    50, 
                    // translateZ 最大值        
                    100,                                           
                ];
                components.forEach(function(v , index){
                    let proportion = (v.endY - v.startY) == 0 ? 1 : offsets[index] / (v.endY - v.startY);
                    // let proportion = 1;
                    proportions.push( proportion );
                });
                //复位
                _ball.style.transform = '';
                let transformStyle = document.defaultView.getComputedStyle(_ball).transform;
                let matrix ;
                if(transformStyle.indexOf('3d') < 0 && transformStyle != ''){
                    //2d矩阵转换成3d
                    let matrix2d = new Matrix(transformStyle);
                    matrix = matrix2d.transfer3d();
                }else{
                    matrix = new Matrix3d(transformStyle);
                }
                //通过box-shadow 来显示每一帧的轨迹
                let shadows = [] , color = 'rgba(255,0,0,0.1)' , showTrack = this.showTrack;

                draw.call(this);

                function draw(){
                    let transformMatrix = Matrix3d.prototype.clone(matrix);
                    let shadow = ['0px' , '0px' , '0px' ];
                    proportions.forEach(function(v,index){
                        let newMatrix = new Matrix3d();
                        let bezier = components[index].bezier;
                        let dot = bezier.getDot(bezier.start.x + (bezier.end.x - bezier.start.x) * indexFrame / frame);
                        let offset = (dot.y - components[index].startY) * v;
                        switch(index){
                            case 0 : // translate X 
                                newMatrix[0][3] = offset;
                                break;
                            case 1 : // translate Y
                                newMatrix[1][3] = offset;
                                break;
                            case 2 : // translate Z
                                newMatrix[2][3] = offset;
                                break;
                        };
                        if(index < 2){
                            shadow[index] = offset + 'px' ;
                        }
                        transformMatrix = transformMatrix.multi(newMatrix);
                    });
                    shadow = shadow.join(' ') + " " +  color;
                    shadows.push(shadow);
                    //设置box-shadow
                    if(showTrack){
                        _ballShadow.css('box-shadow' , shadows.join(',') );
                    }
                    //设置transform
                    _ball.style.transform = transformMatrix;

                    if(rafCount <= window.mainApp.rafCount){
                        if(indexFrame < frame){
                            indexFrame ++ ;
                            requestAnimationFrame(draw);
                            return;
                        }else{
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
        computed:{
            curveEditorNumber:function(){
                let number = this.dotsSet.filter(function(v){return v.show;}).length;
                if(number >= 3){
                    //显示为3d
                    $(this.$el.querySelector('.ball-container')).addClass('transform-3d')
                }else{
                    $(this.$el.querySelector('.ball-container')).removeClass('transform-3d')
                }
                return number;
            }
        }
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



