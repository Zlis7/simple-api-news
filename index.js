(()=>{
    const express = require('express')

    const app = express()
    app.use(express.json())

    app.post("/api/hello", (req, res) => {
        res.json({ content: req.body});
    })
    app.post('/register', (req, res) => {
        const {name, email, password} = req.body;
        RegisterModel.findOne({email: email})
        .then(user => {
            if(user) {
                res.json("Already have an account")
            } else {
                RegisterModel.create({name: name, email: email, password: password})
                .then(result => res.json(result))
                .catch(err => res.json(err))
            }
        }).catch(err => res.json(err))
    })
    
    app.listen(3001, () => {
        console.log("Server is Running")
    })

    module.exports = app;
})();
