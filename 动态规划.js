
/**
 * 从 （1,1） 移动到(m,n) 有多少种走法
 */
function countPaths(m,n){
    var ways = [];
    for(var i = 0;i<=m;i++){
        ways[i] = [];
        for(var j = 0;j<=n;j++){
            ways[i][j] = 0;
        }
    }
    //设置(1,1);
    ways[1][1] = 1;
    for(var i = 1;i<=m;i++){
        for(var j = 1;j <= n;j++){
            if(i == 1 && j == 1){
                continue;
            }
            ways[i][j] = ways[i-1][j] + ways[i][j-1];
        }
    };
    return ways;
}

/**
 * 给定数组每一个格子的value，求路径的value 之和最小
 * [1,3,1]
 * [1,5,1]
 * [4,2,1]
 */
function countMinPath(values){
    let ways = [];
    let m = values.length,
        n = values[0].length;
    for(var i = 0;i <= m;i++){
        ways[i] = [];
        for(var j = 0;j <= n;j++){
            ways[i][j] = 0;
        }
    };
    for(var i = 1;i <= m;i++){
        for(var j = 1;j <= n;j++){
            if(i == 1){
                ways[i][j] = ways[i][j - 1] + values[i - 1][j - 1];
            }else if(j == 1){
                ways[i][j] = ways[i - 1][j] + values[i - 1][j - 1];
            }else{
                ways[i][j] = Math.min(ways[i - 1][j] , ways[i][j - 1]) + values[i - 1][j - 1];
            }
        };
    };
    return ways;
}