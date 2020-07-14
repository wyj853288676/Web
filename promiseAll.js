// Promise.prototype.all = function(values){
//     let results = [] , count = 0;
//     let length = values.length;
//     return new Promise(function(resolve,reject){
//         for(let i = 0 ;  i < length ; i++){
//             let val = values[i];
//             if(val instanceof Promise){
//                 val.then(function(resp){
//                     results[i] = resp;
//                     count++;
//                     if(count == length){
//                         resolve(results);
//                     }
//                 }).catch(function(error){
//                     reject(error);
//                 });
//             }else{
//                 count++;
//                 results[i] = val;
//             }
//         }
//     });
// }


Promise.all = function(values){
    let results = [] , count = 0;
    let length = values.length;
    return length == 0 ? results : new Promise(function(resolve,reject){
        values.forEach(function(val,i){
            Promise.resolve(val).then(function(resp){
                count ++;
                results[i] = resp;
                if(count == length){
                    resolve(results);
                };
            }).catch(function(error){
                reject(error);
            });
        });
    });
}
function getMapLength(map){
    var count = 0;
    map.forEach(function(v,index){
        count ++;
    });
    return count;
}

var map = new Map(); 
map.set('a',123);
map.set('b',456);
map.set('c',new Promise(function(resolve){
    resolve('c');
}));
Promise.all(map).then(function(resp){
    console.log(resp);
}).catch(function(error){
    console.log(error);
});


var set = new Set([
    new Promise(function(resolve){
        resolve('1');
    }),
    0,
]);
Promise.all(set).then(function(resp){
    console.log(resp);
}).catch(function(error){
    console.log(error);
});


var promise3 = Promise.resolve(3);
var promise2 = 42;
var promise1 = new Promise((resolve, reject) => {
  setTimeout(resolve, 100, 'foo');
});
var promise4 = new Promise(function(resolve,reject){
    setTimeout(reject, 5000, '123'); 
});
Promise.all([promise1, promise2, promise3]).then((values) => {
  console.log(values);
});



var A = {
    then:function(resolve,reject){
        console.log('A then');
        resolve('A resolve');
    }
}
var B = new Promise(function(resolve,reject){
    console.log('B then');
    resolve('B resolve');
}).then(function(resp){
    console.log(resp);
});

Promise.resolve(A).then(function(resp){
    console.log(resp);
});


// Promise.all([A,B]).then(function(resp){
//     console.log(resp);
// });