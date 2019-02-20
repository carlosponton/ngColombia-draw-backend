const { Person } = require('./person.model');

module.exports.persons = async () => {
    try {
        return await Person.find();
    } catch (e) {
        throw new Error(e);
    }
};

module.exports.add = async (cc, name, comment) => {
    try {
        const person = await Person.findOne({cc});
        if (person) {
            throw new Error('Persona ya existe registrada');
        }
        return await Person.create({ cc, name, comment });
    } catch (e) {
        throw new Error(e);
    }
};

module.exports.winner = async () => {
    // Get the count of all persons
    const count = await Person.count().exec();

    // Get a random entry
    const random = Math.floor(Math.random() * count);

    // Again query all users but only fetch one offset by our random #
    let person = await Person.findOne().skip(random).exec();
    person.winner = true;
    await person.save();
    return person;
};
