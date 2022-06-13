const express = require('express');
const Address = require('../model/Address');
const Turtle = require('../model/Turtle');

// we are defining router level middleware, so we need a Router object
const router = express.Router();

// express passes in the request and response objects for us
router.get('/getAll', async (request, response, next) => {
    response.contentType('application/json') // contentType is a shortcut provided by Express for creating the 'Content-type': 'value' header
            .status(200)
            .json(await Turtle.find()); // converts object to json and puts in the response body
            // use Turtle.find().populate('addresses'); if you also
            // want the address data
});

router.post('/create', async (request, response, next) => {
    try {
        // data parsed into the request.body object can be accessed anywhere
        // we have access to the request object
        // - we must use express.json() or body-parser() middleware

        if (Object.keys(request.body).length == 0) return next({ 
            statusCode: 400, 
            message: 'Body cannot be empty' 
        });

        const turtle = new Turtle(request.body);
        await turtle.save(); // equivalent to insertOne({})

        response.status(201).json(turtle);
    } catch (err) {
        next(err);
    }
});

router.put('/update/:id', async (request, response, next) => {
    try {
        // make sure request body is not empty
        if (Object.keys(request.body).length == 0) return next({ 
            statusCode: 400, 
            message: 'Body cannot be empty' 
        });

        const turtle = await Turtle.updateOne({ _id: request.params.id }, request.body, {
            runValidators: true // enable validation on update
        });
        // when we find a resource in the db using .find(), it is tracked by Mongoose and that
        // is why we can change the turtle objects fields and then save them as updates
        
        if (turtle) {
            response.status(200).json(await Turtle.findById(request.params.id));
        } else {
            next({ statusCode: 404, message: `Turtle with id ${request.params.id} does not exist`});
        }
    } catch (err) {
        next(err);
    }
});

router.delete('/delete/:id', async (request, response, next) => {
    // a colon followed by a name in a path is path parameter
    // that can be accessed on the request.params object
    const id = request.params.id;

    const turtle = await Turtle.findByIdAndDelete(id);

    if (turtle) {
        response.status(200).json(turtle);
    } else {
        next({ statusCode: 404, message: `Turtle with id ${id} does not exist`});
    }
});

router.put('/address/alt/:id', async (request, response, next) => {
    if (Object.keys(request.body).length == 0) return next({ 
        statusCode: 400, 
        message: 'Body cannot be empty' 
    });

    const turtle = await Turtle.findById(request.params.id);
    if (!turtle) return next({ statusCode: 404, message: `Turtle with id ${id} does not exist`});

    let address = await Address.updateOne(
        { 
            streetNumber: request.body.streetNumber,
            addressLineOne: request.body.addressLineOne
        }, 
        {
            $push: {
                "turtles": turtle._id
            }
        }, 
        { runValidators: true } // enable validation on update
    );

    if (!address) {
        address = new Address(request.body);
        address.turtles.push(turtle._id);
        await address.save();
    }

    await Turtle.updateOne({ _id: request.params.id },
        {
            $push: {
                "addresses": address._id
            }
        },
        { runValidators: true }
    );
    return response.status(204).send('Address added successfully or already added previously');
});

// accepts turtles id and address in the body
    // we wouldn't need to pass the turtles id if we had
    // authentication and authorisation implemented as we would
    // already be tracking the logged in turtle
router.put('/address/:id', async (request, response, next) => {
    try {
        if (Object.keys(request.body).length == 0) return next({ 
            statusCode: 400, 
            message: 'Body cannot be empty' 
        });
        const turtle = await Turtle.findById(request.params.id);
        
        if (turtle) {
            let address = await Address.findOne({
                streetNumber: request.body.streetNumber,
                addressLineOne: request.body.addressLineOne
            });
            
            if (!address) address = new Address(request.body);

            // add turtle id to the address
            if (address.turtles.indexOf(turtle._id) == -1) {
                address.turtles.push(turtle._id);
                await address.save();
            }
            
            if (turtle.addresses.indexOf(address._id) == -1) {
                // add new address id to the turtle
                turtle.addresses.push(address._id);
                await turtle.save();
            }
            
            return response.status(204).send('Address added successfully or already added previously');

        } else {
            return next({ statusCode: 404, message: `Turtle with id ${request.params.id} does not exist`});
        }   
    } catch (error) {
        next(error);
    }
});

module.exports = router;