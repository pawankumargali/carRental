function getDateDiff(issueDate, returnDate) {
    const future = new Date(returnDate).getUTCDate();
    const past = new Date(issueDate).getUTCDate();
    return Math.ceil((future-past)/(1000*60*60*24));
}

module.exports=getDateDiff;