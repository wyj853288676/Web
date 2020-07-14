var list = [
    {id:1,name:'a',parentId:0},
    {id:2,name:'b',parentId:0},
    {id:3,name:'c',parentId:1},
    {id:4,name:'d',parentId:1},
    {id:5,name:'e',parentId:2},
    {id:6,name:'f',parentId:2},
    {id:7,name:'g',parentId:6},
    {id:8,name:'h',parentId:5},
    {id:9,name:'i',parentId:3},
];

function convert(list){
    let result = [];
    let map = [];
    for(var i = 0; i < list.length; i++){
        map[list['id']] = list;
    };

    for(var i = 0; i < list.length; i++){
        let data = list[i];
        let parent = map[data[i]];
        if(parent != undefined){
            ( parent.children || (parent.children = []) ) .push(data);
        }else{
            result.push(data);
        };
    };
    return result;
}