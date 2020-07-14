"use strict"; 
/**
 *                                                                                                                                                                                                                                                                                                          数据
 * datas:格式要求为[['price'=>1,'sales_total'=>2],...]
 * segmentNum:要分的段数
 */
 function getPriceSegment(datas, segmentNum)
    {
        var segmentNum = arguments.length > 1 ? arguments[1] : 10;
        
        if (datas.length == 0 || datas[0].price == undefined || datas[0].sales_total == undefined ) {
            return [];
        }
        let trough = getTrough(datas);
        if (trough.length == 0) {
            return [];
        }
        let start = 0 ,
            sum = 0 ,
            diff = [];
        for(let id = 0;id < trough.length;id++){
            let diffSales = 0 ,
                count = 0 ,
                val = trough[id];
            for(let i = start; i <= val['key']; i++ ){
                diffSales += datas[i]['sales_total'];
                count ++;
            }
            val['diff_share'] = diffSales / count;
            diff.push(val['diff_share']);
            start  = val['key'] + 1;
        };
        let troughKey = [];
        // 按照斜率倒序
        trough = trough.sort(function(a,b){
            return b.diff_share - a.diff_share;
        });

        // 按照分的段数 segmentNum 取最大斜率的波谷数 segmentNum-2 个的key
        let maxNum = 0;
        if ( trough.length < segmentNum - 2) {
            maxNum = trough.length;
        } else {
            maxNum = segmentNum - 1;
        }
        for (var i = 0; i < maxNum; i++) {
            troughKey.push(trough[i]['key']);
        }
        troughKey.push(datas.length); // 存取数据最大索引值+1，用来计算最后一个区间的数据 
        troughKey = troughKey.sort(function(a,b){
            return a - b;
        });
        
        // 获取价格段
        let results = [] , 
            startPrice = datas[0]['price'],
            endPrice = 0 ;
        start = 0;
        for(var index = 0;index < troughKey.length;index++){
            var val = troughKey[index];
            sum = 0;
            for (var i = start; i < val; i++) {
                sum += datas[i]['sales_total'];
            }
            start = val;
            if (index == troughKey.length - 1) {
                endPrice = datas[start-1]['price'];
            } else {
                endPrice = datas[start]['price'] - 1;
            }
            results.push({
                'start_price' : startPrice,
                'end_price' : endPrice,
                'sales_total' : sum,
            }); 
            if (index != troughKey.length - 1) {
                startPrice = datas[start]['price'];
            }
        }
        return results;
    }
    
    /**
     * 计算数据的波谷
     */
   function getTrough(datas)
    {
        let trend = [],
            diffTrend = [];
        // 算出trend
    
        for(var id = 0 ;id < datas.length; id++){
            let data = datas[id];
            if (id == 0) {
                continue;
            }
            let diff = data['sales_total'] - datas[id - 1]['sales_total'];
            if(diff > 0){
                trend.push(1);
            }else if(diff < 0){
                trend.push(-1);
            }else{
                trend.push(0);
            }
        };
        for(var id = 0;id < trend.length; id++){
            let val = trend[id];
            if (val == 0 && trend[id+1] >= 0) {
                trend[id] = 1;
            } else if (val == 0 && trend[id+1] < 0) {
                trend[id] = -1;
            }
        }

        // 对trend做一阶差分
        for(var id = 0; id < trend.length ; id++){
            if(id == 0){
                continue;
            }
            diffTrend.push(trend[id] - trend[id - 1] );
        }

        // 得出波谷，type: 0表示波谷，1表示波峰, 此处不需要波峰
        let trough = [];
        for(var id = 0; id < diffTrend.length ; id++){
            if(diffTrend[id] == 2){
                trough.push({
                    type: 0 ,
                    key: id + 1,
                    price: datas[id + 1]['price'],
                });
            }
        };
        return trough;
    }