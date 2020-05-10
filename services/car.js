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
    this._getActiveBooking(carId, (err, activeBooking) => {
        if(err) callback(err,null);
        if(!activeBooking) {
            this.CarModel.findByIdAndUpdate(carId, updates, {new:true})
                        .then(updatedCar => callback(null, updatedCar))
                        .catch(err => callback(err,null));
        }
        else {
            const error={};
            error.message='Car cannot be upated as it has an active booking';
            return callback(error, null);
        }
    });
}

remove(carId, callback) {
    this._getLatestBooking(carId, (err, latestBooking) => {
        if(err) callback(err,null);
        const today = new Date().toISOString();
        const latestBookingDate = latestBooking===null ? new Date(1900,1,1,0,0,0,0).toISOString() : latestBooking.returnDate.toISOString();
        if(today<latestBookingDate) {
            const error={};
            error.message='Cannot delete. Car has Active bookings';
            return callback(error);
        }
        this.CarModel.findByIdAndRemove(carId)
                        .then(() => callback(null))
                        .catch(err => callback(err));
    });
}

bookById(carId, authDetails, bookingDetails, callback) {
    const { issueDate, returnDate } = bookingDetails;
    const {id:userId} = authDetails;
    const startDate = new Date(issueDate);
    const endDate = new Date(returnDate);

    if(startDate.toISOString() > endDate.toISOString()) {
        const error={};
        error.message='returnDate cannot be befor issueDate';
        console.log('E: '+error);
        return callback(error, null);
    }

    const today = new Date();
    if(today.toISOString() > startDate.toISOString()) {
        const error={};
        error.message='Car cannot be booked on a previous date';
        console.log('R: '+error);
        return callback(error,null);
    }


    this._isBookedBetweenDates(startDate, endDate, carId, isBooked => {
        if(isBooked) {
            const error={};
            error.message='Booking exists for car';
            error.car=carId;
            error.date=issueDate;
            console.log('O:'+error);
            return callback(error, null);
        }
        this.CarModel.findById(carId)
                        .then(car => {
                            const bill = this._getBookingBill(car.rentPerDay, startDate, endDate);
                            const newBooking = new this.BookingModel({user:userId, car:carId, ...bookingDetails, bill:bill});
                            newBooking.save((err, savedBooking) => {
                                if(err)  { console.log('Z:' +err); return callback(err,null);}
                                if(savedBooking) {
                                    this.CarModel.findByIdAndUpdate(carId,
                                                                    {$push:{bookingHistory:savedBooking._id}}, 
                                                                    {new:true})
                                                    .then(() => {
                                                        savedBooking.populate('car','-activeBooking -bookingHistory -createdAt -updatedAt')
                                                                    .populate('user', '-password -role')
                                                                    .execPopulate()
                                                                    .then(booking => callback(null,booking))
                                                                    .catch(err => callback(err,null));
                                                    })
                                                    .catch(err => { console.log('Y: '+err); callback(err,null);});
                                }
                            });
                        })
                        .catch(err => {console.log('X: '+err); callback(err,null)});
        
    });
}

getAllAvailable(filters, queryParamLimit, callback) {
    let {issueDate, returnDate, rentRange, seatingCapacity, city} = filters ? filters : {};
    const startDate = issueDate ? new Date(issueDate) : new Date();
    const endDate = returnDate ? ( new Date(returnDate) ): 
                                 ( issueDate ? issueDate : new Date() );
    const [minRent, maxRent] = rentRange ? rentRange : [0, Number.MAX_SAFE_INTEGER];
    const limit= queryParamLimit ? queryParamLimit : 10;

    const findCriteria = { rentPerDay:{ $gte:minRent, $lte:maxRent } };
    if(seatingCapacity) findCriteria.seatingCapacity=seatingCapacity;
    if(city) findCriteria.city=city;
    this.CarModel.find({...findCriteria})
                    .select('-bookingHistory')
                    .limit(10)
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
                                    return callback(null,availableCars)
                            })
                        }
                    })
                    .catch( err => callback(err,null));
}

getDetails(carId, callback) {
    console.log('Fear');
    this._getActiveBooking(carId, (err, activeBooking) => {
        console.log(err);
        if(err) return callback(err,null);
        this.CarModel.findById(carId)
                        .then(car => {
                            const details = activeBooking===undefined ? {...car._doc, activeBooking:null} : {...car._doc, activeBooking};
                            return callback(null, details);
                        })
                        .catch(err => callback(err, null));
    })
}



_isBookedBetweenDates(startDate, endDate, carId, callback) {
    const fromDate = new Date(startDate).toISOString();
    const toDate = new Date(endDate).toISOString();
    this.BookingModel.find({car:carId})
                        .then(prevBookings=> {
                            if(!prevBookings) return callback(false);
                            for(const booking of prevBookings) {
                                let {issueDate, returnDate} = booking;
                                issueDate=issueDate.toISOString();
                                returnDate=returnDate.toISOString();
                                if((fromDate>=issueDate && fromDate<=returnDate) || (toDate>=issueDate && toDate<=returnDate) ) {
                                    return  callback(true);
                                }
                            }
                            return callback(false);
                        })
                        .catch(err => console.log(err));
                    
}

_getBookingBill(rentPerDay, startDate, endDate) {
    const lastDay = Date.parse(new Date(startDate).toISOString());
    const firstDay = Date.parse(new Date(endDate).toISOString());
    const totalDays = Math.ceil((lastDay-firstDay)/(1000*60*60*24));
    return totalDays*rentPerDay;
}

_getActiveBooking(carId,callback) {
    this.BookingModel.find({car:carId})
                        .then(bookings => {
                            if(bookings.length===0) return callback(null, undefined);
                            let count=0;
                            const today = new Date().toISOString();
                            for(const booking of bookings) {
                                const fromDate = booking.issueDate.toISOString();
                                const toDate = booking.returnDate.toISOString();
                                if(today>=fromDate && today<=toDate) return callback(null,booking);
                                else if(count===bookings.length) return callback(null,undefined);
                                else count++;
                            }
                        })
                        .catch(err => callback(err,null))
}

_getLatestBooking(carId, callback) {
    
    let latestBooking=null;
    let latestBookingDate = new Date(1900,1,1,0,0,0,0).toISOString();
    this.BookingModel.find({car:carId})
                        .then(bookings => {
                            if(bookings.length===0) return callback(null, null);
                            let count=0;
                            for(const booking of bookings) {
                                const bookingDate = booking.returnDate.toISOString();
                                if(bookingDate>latestBookingDate) latestBooking=booking;
                                count++;
                                if(count===bookings.length) return callback(null, latestBooking);
                            }
                        })
                        .catch(err => callback(err, null));
}

}


module.exports = new Car();

