class Car {

constructor() {
    this.CarModel = require('../models/car');
    this.BookingModel = require('../models/booking');
}

addNew(carDetails, callback) {
    this.CarModel.findOne({vehicleNo:carDetails.vehicleNo}, (err, result) => {
        if(err) return callback(err,null);
        if(result) return callback('vehicle already exists', null);
        const newCar = new this.CarModel(carDetails);
        newCar.save()
                .then(() => callback(null,newCar))
                .catch(err => callback(err, null));
    });
}

updateDetails(carId, updates, callback) {
    this._getLatestBooking(carId, (err, latestBooking) => {
        if(err) callback(err,null);
        const today = new Date().getUTCDate();
        const latestBookingDate = latestBooking ? latestBooking.returnDate.getUTCDate() : new Date(1900,1,1,0,0,0,0);
        if(today<=latestBookingDate) {
            const error = {};
            error.message='Cannot update. Car has Active bookings';
            return callback(error, null);
        }
        this.CarModel.findByIdAndUpdate(carId, updates, {new:true})
                        .then(updatedCar => callback(null, updatedCar))
                        .catch(err => callback(err,null))
    });
}

remove(carId, callback) {
    this._getLatestBooking(carId, (err, latestBooking) => {
        if(err) callback(err,null);
        const today = new Date().getUTCDate();
        const latestBookingDate = latestBooking ? latestBooking.returnDate.getUTCDate() : new Date(1900,1,1,0,0,0,0);
        if(today<latestBookingDate) {
            const error={};
            error.message='Cannot delete. Car has Active bookings';
            return callback(error);
        }
        this.CarModel.findByIdAndRemove(carId)
                        .then(() => {
                            this.BookingModel.deleteMany({car:carId})
                                                .then(() => callback(null))
                                                .catch(err => callback(err));
                        })
                        .catch(err => callback(err));
    });
}

bookById(carId, bookingDetails, callback) {
    const { issueDate, returnDate } = bookingDetails;
    const startDate = new Date(issueDate);
    const endDate = new Date(issueDate);

    const today = new Date();
    if(today.getUTCDate() > bookingDate.getUTCDate()) {
        const error={};
        error.message='Car cannot be booked on a previous date';
        return callback(error,null);
    }

    this._isBookedBetweenDates(startDate, endDate, carId, isBooked => {
        if(isBooked) {
            const error={};
            error.message='Booking exists for car';
            error.car=carId;
            error.date=issueDate;
            return callback(error, null);
        }
        this.CarModel.findById(carId)
                        .then(car => {
                        const bill = this._getBookingBill(car.rentPerDay, startDate, endDate);
                        const newBooking = new this.BookingModel({...bookingDetails, car:carId, bill});
                        newBooking.save((err, savedBooking) => {
                            if(err) return callback(err,null);
                            if(savedBooking) {
                                this.CarModel.findByIdAndUpdate(carId,
                                                                {$push:{bookingHistory:savedBooking._id}}, 
                                                                {new:true})
                                                .then(() => {
                                                    savedBooking.populate('car','-activeBooking -bookingHistory -createdAt -updatedAt')
                                                                .execPopulate()
                                                                .then(booking => callback(null,booking))
                                                                .catch(err => callback(err,null));
                                                })
                                                .catch(err => callback(err,null));
                            }
                        });
                        
                        })
                        .catch(err => callback(err,null));
        
    });
}

getAllAvailable(filters, callback) {
    let {issueDate, returnDate, rentRange, seatingCapacity, city} = filters ? filters : {};
    const startDate = issueDate ? new Date(issueDate) : new Date();
    const endDate = returnDate ? ( new Date(returnDate) ): 
                                 ( issueDate ? issueDate : new Date() );
    const [minRent, maxRent] = rentRange ? rentRange : [0, Number.MAX_SAFE_INTEGER];

    const findCriteria = { rentPerDay:{ $gte:minRent, $lte:maxRent } };
    if(seatingCapacity) findCriteria.seatingCapacity=seatingCapacity;
    if(city) findCriteria.city=city;
    this.CarModel.find({...findCriteria})
                    .select('-bookingHistory -activeBooking')
                    .then( cars => {
                        let availableCars=[];
                        let count=0;
                        for(let car of cars) {
                            this._isBookedBetweenDates(startDate, endDate, car._id, isBooked => {
                                if(!isBooked) {
                                    availableCars.push(car);
                                    count++;
                                }
                                if(count===cars.length)
                                    return callback(null,availablelCars)
                            })
                        }
                    })
                    .catch( err => callback(err,null));
}

getDetails(carId, callback) {
    this._getActiveBooking(carId, (err, activeBooking) => {
        if(err) return callback(err,null);
        this.CarModel.findById(carId)
                        .then(car => {
                            const details = activeBooking ? {...car, activeBooking:null} : {...car, activeBooking};

                            return callback(null, details);
                        })
                        .catch(err => callback(err, null));
    })
}



_isBookedBetweenDates(startDate, endDate, carId, callback) {
    const fromDate = new Date(startDate).getUTCDate();
    const toDate = new Date(endDate).getUTCDate();
    this.BookingModel.find({car:carId})
                        .then(prevBookings=> {
                            if(!prevBookings) return callback(false);
                            for(const booking of prevBookings) {
                                let {issueDate, returnDate} = booking;
                                issueDate=issueDate.getUTCDate();
                                returnDate=returnDate.getUTCDate();
                                if((fromDate>=issueDate && fromDate<=returnDate) || (toDate>=issueDate && toDate<=returnDate) ) {
                                    return  callback(true);
                                }
                            }
                            return callback(false);
                        })
                        .catch(err => console.log(err));
                    
}

_getActiveBooking(carId,callback) {
    this.BookingModel.findById(carId)
                        .then(bookings => {
                            if(bookings.length===0) return callback(null, undefined);
                            let count=0;
                            const today = new Date().getUTCDate();
                            for(const booking of bookings) {
                                const fromDate = booking.issueDate.getUTCDate();
                                const toDate = booking.returnDate.getUTCDate();
                                if(today>=fromDate && today<=toDate) return callback(null,booking);
                                else if(count===bookings.length) return callback(null,undefined);
                                else count++;
                            }
                        })
                        .catch(err => callback(err,null))
}

_getBookingBill(rentPerDay, startDate, endDate) {
    const lastDay = new Date(start).getUTCDate();
    const firstDay = new Date(endDate).getUTCDate();
    const totalDays = Math.ceil((lastDay-firstDay)/(1000*60*60*24));
    return totalDays*rentPerDay;
}

_getLatestBooking(carId, callback) {
    let latestBookingDate = new Date(1900,1,1,0,0,0,0);
    this.BookingModel.find({car:carId})
                        .then(bookings => {
                            if(bookings.length===0) return callback(null, undefined);
                            let count=0;
                            for(const booking of bookings) {
                                const bookingDate = booking.returnDate.getUTCDate();
                                if(bookingDate>latestBookingDate) latestBooking=booking;
                                else if(count===bookings.length) return callback(null, latestBooking);
                                else count++;
                            }
                        })
                        .catch(err => callback(err, null));
}

}


module.exports = new Car();

