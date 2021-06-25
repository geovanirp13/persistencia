const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const mysql = require('mysql');
const mysqlConnection = mysql.createConnection({
    host     : '127.0.0.1',
    port     : 3306,
    user     : 'root',
    password : 'root',
    database : 'dbPosUnivem',
});

app.use('/', express.static(path.join(__dirname, 'public')));

app.get('/mongo', async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const mongoConnection = mongoose.connect('mongodb+srv://geovani:geovani@cluster0-nffnp.mongodb.net/test?retryWrites=true&w=majority', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        let mongoItemModel = new mongoose.model(
            'test', 
            new mongoose.Schema({ name: String, bio: String })
        );

        mongoItemModel.find(function(err, test){
            if(err)
                res.send(err);
      
            res.status(200).json({
                message: "Retorno com sucesso",
                allTest: test
            });
        });

    } catch(err) {
        console.log(err)
        return res.status(500).json({});
    }
});

mysqlConnection.connect((err) => {
    if (err) {
        console.log('Erro ao conectar no banco de dados', err)
        return
    }
    console.log('Conectado com sucesso!')
});

app.post('/mysql_insert', async (req, res) => {
    try {
        let { nome } = req.body;

        await mysqlConnection.beginTransaction(function (err) {
            if (err) { throw err; }

                mysqlConnection.query(
                `                   INSERT INTO tb_Pessoas (nome)
                                    VALUES ('${nome}');`,
                function (err, result) {
                    if (err) {
                        mysqlConnection.rollback(function () {
                            throw err;
                        });
                    }
                    mysqlConnection.commit(function (err) {
                        if (err) {
                            mysqlConnection.rollback(function () {
                                throw err;
                            });
                        }
                        console.log('Pessoa cadastrada com sucesso.');
                        mysqlConnection.end();
                    });
                });
        });

        return res.status(200).json({});
    } catch(err) {
        console.log(err)
        return res.status(500).json({});
    }
});

app.post('/mysql_select', async (req, res) => {
    try {
        let { nome } = req.body;
        await mysqlConnection.query(`
            SELECT * FROM tb_Pessoas WHERE nome = '${nome}';`, 
            function (err, result, fields) {
                if (err) throw err;
                
                return res.status(200).json({ rows: result });
            }
        );

    } catch(err) {
        console.log(err)
        return res.sendStatus(500).json();
    }
});

app.listen(3003);