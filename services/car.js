const getDateDiff=require('../helpers/dateDiff');

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

    bookById(carId, bookingDetails, callback) {
        const { issueDate } = bookingDetails;
        const bookingDate = new Date(issueDate);
        const today = new Date();
        if(today.getUTCDate() > bookingDate.getUTCDate()) {
            const error={};
            error.message='Car cannot be booked on a previous date';
            return callback(error,null);
        }
        this._isAvailableOnDate(bookingDate, carId, isAvailable => {
            if(!isAvailable) {
                const error={};
                error.message='Booking exists for car';
                error.car=carId;
                error.date=issueDate;
                return callback(error, null);
            }
            this.CarModel.findById(carId)
                          .then(car => {
                            const rent = car.rentPerDay;
                            const bill = (getDateDiff(issueDate,returnDate))*rent;
                            const newBooking = new this.BookingModel({...bookingDetails, car:carId, bill});
                            newBooking.save((err, savedBooking) => {
                                if(err) return callback(err,null);
                                if(savedBooking) {
                                    this.CarModel.findByIdAndUpdate(carId,
                                                                    {latestBooking:savedBooking._id, $push:{bookingHistory:savedBooking._id}}, 
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

    showAvailable(filters, callback) {
        let {date, rentRange, seatingCapacity, city} = filters ? filters : {};
        const bookingDate = date ? new Date(date) : new Date();
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
                                this._isAvailableOnDate(bookingDate, car._id, isAvailable => {
                                    if(isAvailable) {
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


    
    _isAvailableOnDate(checkDate, carId, callback) {
        const onDate = new Date(checkDate).getUTCDate();
        this.BookingModel.find({car:carId})
                            .then(prevBookings=> {
                                if(!prevBookings) return callback(true);
                                for(const booking of prevBookings) {
                                    let {issueDate, returnDate} = booking;
                                    issueDate=issueDate.getUTCDate();
                                    returnDate=returnDate.getUTCDate();
                                    if(onDate>=issueDate && onDate<=returnDate) {
                                        return  callback(false);
                                    }
                                }
                                return callback(true);
                            })
                            .catch(err => console.log(err));
                        
    }

}


module.exports = new Car();

