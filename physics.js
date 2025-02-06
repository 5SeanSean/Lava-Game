export function physics(object){
    if(object.xPhysics || object.yPhysics){
        if(object.yPhysics != 0){
            object.yPhysics/=1.1;
        }
        if(Math.abs(object.yPhysics) <=0.3){
            object.yPhysics = 0;
        }
        if(object.xPhysics != 0){
            object.xPhysics/=1.1;
        }
        if(Math.abs(object.xPhysics) <=0.3){
            object.xPhysics = 0;
    }
}
}