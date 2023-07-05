exports.status = (status) => {
    switch (status) {
        case 0: return "Initiated"
            break;
        case 1: return "Processing"
            break;
        case 2: return "Completed"
            break;
        case 3: return "Failure"
            break;
        default: return "Wrong Status"
            break;
    }

}
exports.badgeColorByStatus = (status) => {
    switch (status) {
        case 0: return "badge-info"
            break;
        case 1: return "badge-primary"
            break;
        case 2: return "badge-success"
            break;
        case 3: return "badge-danger"
            break;
        default: return "badge-info"
            break;
    }

}