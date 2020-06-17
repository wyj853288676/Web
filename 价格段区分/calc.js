    /**
     * 计算价格段分布数据
     * datas:格式要求为[['price'=>1,'sales_total'=>2],...]
     * segmentNum:要分的段数
     */
 function getPriceSegment(datas, segmentNum)
    {
        var segmentNum = arguments.length > 1 ? arguments[1] : 10;
        
        if (!datas || datas[0].price == undefined || data[0].sales_total == undefined ) {
            return [];
        }
        let trough = getTrough(datas);
        if (!trough) {
            return [];
        }
        let start = 0 ,
            sum = 0 ,
            diff = array();
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
        array_multisort(diff, SORT_DESC, trough);

        // 按照分的段数 segmentNum 取最大斜率的波谷数 segmentNum-2 个的key
        troughKey = array();
        if (count(trough) < segmentNum - 2) {
            maxNum = count(trough);
        } else {
            maxNum = segmentNum - 1;
        }
        for (i = 0; i < maxNum; i++) {
            troughKey[] = trough[i]['key'];
        }
        troughKey[] = count(datas); // 存取数据最大索引值+1，用来计算最后一个区间的数据 
        sort(troughKey);
        
        // 获取价格段
        results = array();
        startPrice = datas[0]['price'];
        endPrice = 0;
        start = 0;
        foreach (troughKey as index => val) {
            sum = 0;
            for (i = start; i < val; i++) {
                sum += datas[i]['sales_total'];
            }
            start = val;
            if (index == count(troughKey)-1) {
                endPrice = datas[start-1]['price'];
            } else {
                endPrice = datas[start]['price'] - 1;
            }
            results[] = array('start_price'=>startPrice, 'end_price'=>endPrice, "sales_total"=>sum);
            if (index != count(troughKey)-1) {
                startPrice = datas[start]['price'];
            }
        }
        return results;
    }
    
    /**
     * 计算数据的波谷
     */
    private static function getTrough(datas)
    {
        trend = array();
        diffTrend = array();
        // 算出trend
        foreach (datas as id => data) {
            if (id == 0) {
                continue;
            }
            diff = data['sales_total'] - datas[id-1]['sales_total'];
            switch (diff) {
                case diff > 0 :
                    trend[] = 1;
                    break;
                case diff < 0 :
                    trend[] = -1;
                    break;
                default :
                    trend[] = 0;
            }
        }
        foreach (trend as id => &val) {
            if (val == 0 && val[id+1] >= 0) {
                val = 1;
            } elseif (val == 0 && val[id+1] < 0) {
                val = -1;
            }
        }
        unset(val);

        // 对trend做一阶差分
        foreach (trend as id => val) {
            if (id == 0) {
                continue;
            }
            diffTrend[] = val - trend[id-1];
        }

        // 得出波谷，type: 0表示波谷，1表示波峰, 此处不需要波峰
        trough = array();
        foreach (diffTrend as id => val) {
            if (val == 2) {
                trough[] = array('type'=>'0', 'key'=>id+1, 'price'=>datas[id+1]['price']);
            }
            // val == -2 时为波峰
        }
        return trough;
    }