
const printObj = (dobj) => {
    var stack = [dobj];
    while (stack?.length > 0){
        const curnObj = stack.pop();
        if(curnObj.children?.length > 0){
            console.log(curnObj.state.key);
        }
        curnObj.children?.forEach(cobj => stack.push(cobj));
    }
    console.log('over');
};

const makeDataObj = (dobj) => {
    var dataObj = {};
    var stack = [dobj];
    while (stack?.length > 0){
        const curnObj = stack.pop();
        if(curnObj.children?.length > 0){
            dataObj[curnObj.content] = curnObj;
        }
        curnObj.children?.forEach(cobj => stack.push(cobj));
    }
    return dataObj;
};

export { printObj, makeDataObj };