/**
 * 
 * @param {bool} dev_view variable set and get on user context
 * @param {Object} component object to display 
 * @param {component} return component 
 */
export function isDevView(dev_view,component){

    if(dev_view && dev_view!=null && dev_view!=undefined){
        return component
    }

    return null
}

export function getFunctionName(func) {
    var ret = func.toString();
    console.log(ret)
    ret = ret.substr('function '.length);
    ret = ret.substr(0, ret.indexOf('('));
    return ret;
  }