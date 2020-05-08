class Car {

    constructor() {
        this.CarModel = require('../models/car');
    }

    addNew(carDetails, callback) {
        const newCar = new this.CarModel(carDetails);
        newCar.save()
                .then(() => callback(null,newCar))
                .catch(err => callback(err, null));
    }

    updateDetails() {

    }

    remove() {

    }

    book(bookingDetails, callback) {
    
    }

    showAvailabeCars(filters, callback) {
        let {date, time, rentRange, seatingCapacity, city} = filters;
        date = new Date(date+" "+time);
        const [minRent, maxRent] = rentRange;
        const findCriteria = {

                                rentPerDay:{ $lte:minRent, $gte:maxRent },
                                seatingCapacity,
                                city
                               }
        this.CarModel.find(findCriteria)
                        .then( cars => callback(null, cars))
                        .catch( err => callback(err,null));
    }


    _hasActiveBooking(date,cat.la) {
        if(date)
    }

}


module.exports = new Car();