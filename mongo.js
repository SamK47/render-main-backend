const mongoose = require('mongoose');


if (process.argv.length < 3) {
    console.log('give password as argument');
    process.exit(1);
}

const password = process.argv[2];
const url = `mongodb+srv://SamK:${password}@cluster0.nboy4i1.mongodb.net/phonebook?retryWrites=true&w=majority&appName=Cluster0phonebook`;

mongoose.set('strictQuery', true);
mongoose.connect(url);

const phonebookSchema = new mongoose.Schema({
    name: String,
    number: String,
});
const Person = mongoose.model('Person', phonebookSchema);

if (process.argv.length === 3) {
    console.log('phonebook:');
    Person.find({}).then(persons => {
        persons.forEach(person => {
            console.log(`${person.name} ${person.number}`);
        });
        mongoose.connection.close();
    });
} else if (process.argv.length === 5) {

    const person = new Person({
        name: process.argv[3],
        number: process.argv[4],
    });
    person.save().then(savedPerson => {
        console.log(`added ${savedPerson.name} number ${savedPerson.number} to phonebook`);
        mongoose.connection.close();
    });
} else {
    console.log('Usage: node mongo.js <password> [name] [number]');
    mongoose.connection.close();
}