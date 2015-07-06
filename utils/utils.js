function today() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var year = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd
    }
    if (mm < 10) {
        mm = '0' + mm
    }
    return year + mm + dd;
    // this.hour = today.getHours()-10;
}

function tomorrow() {
    var today = new Date();
    var dd = today.getDate()+1;
    var mm = today.getMonth() + 1;
    var year = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd
    }
    if (mm < 10) {
        mm = '0' + mm
    }
    return year + mm + dd;
}

module.exports.today = today; 
module.exports.tomorrow = tomorrow;