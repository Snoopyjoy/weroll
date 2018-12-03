/**
 * 通过setInterval实现timer
 * Created by hxl on 2017/9/6.
 */

function GTimer( updateDelay ){
    this.times = 0;
    this.timers = {
        default:{}
    };
    this.intervalTimer = 0;
    this.pauseTar={
        default:0
    };
    this.updateDelay = updateDelay || 1000;
}

const proto = GTimer.prototype;
proto.startTimer = function(){
    let ins = this;
    if( this.intervalTimer ) clearInterval( this.intervalTimer );
    this.intervalTimer = setInterval(function() {
        ins.times += ins.updateDelay;
        ins.execute(true);
    }, this.updateDelay);
};

proto.stopTimer = function(){
    clearInterval( this.intervalTimer );
    this.intervalTimer = 0;
};

proto.execute = function( timer ){
    for( let group in this.timers ){
        if( this.pauseTar[group] == 1 ){
            continue;
        }
        let groupTimers = this.timers[group];
        for( let timerID in groupTimers ){
            let timerDef = groupTimers[timerID];
            let callback = timerDef.callback;
            let passed = timerDef.passed;
            let delay = timerDef.delay;
            if(  passed >= delay ){
                callback && callback.apply(null, timerDef.args  );
                groupTimers[timerID] = null;
                delete groupTimers[timerID];
            }
            if( timer ){
                timerDef.passed += this.updateDelay;
            }
        }
        groupTimers = null;
    }
};

proto.pause = function( group ){
    if( group ){
        this.pauseTar[group] = 1;
    }
};

proto.continue = function( group ){
    this.pauseTar[group] = 0;   
};

/*增加倒计时 单位（秒）最小延时1秒

*/
proto.addTimer = function( callback, delay , group , agrs ){
    group = group || "default";
    if( !this.timers[group] ){
        this.timers[group] = {};
    }
    const timerID = this.getTimerID(group);
    this.timers[group][timerID] = {
        id: timerID,
        callback: callback,
        delay: delay,
        passed: 0,
        args : agrs
    };
    return timerID;
};

/*移除定时*/
proto.removeTimer = function( timerID ){
    if( String( timerID ).hasValue() ){
        let group = timerID.split("#")[0];
        if (this.timers[group]) {
            delete this.timers[group][timerID];
        }
    }
};

proto.getTimerByID = function( timerID ){
    if( !String(timerID).hasValue() ){
        return null;
    }
    let group = timerID.split("#")[0];
    if (!this.timers[group]) return null;
    return this.timers[group][timerID];
};

proto.changeTimerDelay = function( timerID, delta ){
    let timerDef = this.getTimerByID( timerID );
    if(timerDef){
        timerDef.delay = timerDef.delay + delta;
    }
    timerDef = null;
};

proto.getTimerID = function(group){
    let id = group + "#" + this.times;
    let tag = 0;
    if (!this.timers[group]) return 0;
    while( this.timers[group][ id ] ){
        tag++;
        id = group + "#" + this.times + "#" + tag;
    }
    tag = null;
    return id;
};

proto.destroy = function(){
    clearInterval( this.intervalTimer );
    this.times = 0;
    this.timers = null;
    this.intervalTimer = 0;
};

module.exports = GTimer;

