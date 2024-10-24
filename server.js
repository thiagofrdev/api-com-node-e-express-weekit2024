//Importação de módulos necessários
const fs = require('fs').promises;
const express = require('express');
const app = express();

app.use(express.json());

/*Testando o Node
app.get("/", (req, res) => {
    res.send("Hello World!");
});
*/

app.listen(3000, () => {
    console.log("Servidor rodando na prota 3000");
});

let usersCache = null; //Variável de cache

//Função assincrona que lê o arquivo do banco (JSON) ou utiliza os dados que já estão salvos na variável de cache
const loadCache = async() => {
    if(!usersCache){//Verifica se a vairável está vaiza
        const data = await fs.readFile('db.json', 'utf-8'); //Lê o arquivo em formato de string
        usersCache = JSON.parse(data).users; //Joga os dados do usuário para a variável de cache
    }
    return usersCache;
};

//Função assincrona para escrever os dados no arquivo JSON e atualizar a vairável de cache
const saveCache = async (newData) => {
    usersCache = newData;
    await fs.writeFile('db.json', JSON.stringify({users: usersCache}, null, 2));//Escrevendo no arquivo
}

//ROTAS CRUD
//Rota para pegar todos os usuários
app.get('/users', async (req, res) => {
   try {
    const users = await loadCache(); //Carrega os usuários do cache
    res.json(users); //Retorna a lista de usuários
   } catch (error) {
    res.status(500).json({message: "Erro ao ler os dados"});
   } 
});

//Rota para criar um novo usuário
app.post('/users', async (req, res) => {
    try {
        const users = await loadCache(); //Carrega os dados do cache
        const newUser = {
            id: Date.now(), //Gera um ID com base no timestamp
            //Dados do usuário vindos do corpo da requisição
            name: req.body.name = "João",
            age: req.body.age = 19,
            email: req.body.email = "joao@gmail.com"
        };
        users.push(newUser); //Adiciona o novo usuário ao cache
        await saveCache(users); //Salva o cache no arquivo JSON
        res.status(201).json(newUser); //Retorna o novo usuário
    } catch (error) {
        res.status(500).json({message: "Erro ao criar o usuário"});
    }
});

//Rota para atualizar um usuário
app.put('/users/:id', async (req, res) => {
    try {
        const {id} = req.params; //Pega da URL o ID do usuário a ser atualizado
        const {name, age, email} = req.body; //Pega o nome, idade e email do corpo da requisição
        const users = await loadCache(); //Carrega os usuários do cache
        const userIndex = users.findIndex(user => user.id == id) //Busca o indice do usuário pelo seu ID

        if(userIndex !== -1){
            //Atualizando campos do usuário
            users[userIndex].name = "Carlos";
            users[userIndex].age = 18;
            users[userIndex].email = "carlos@gmail.com";
            await saveCache(users); //Escreve os dados atualizados no arquivo JSON
            res.json(users[userIndex]); //Retorna o usuário atualizado
        } else {
            res.status(404).json({message: "Usuário não encontrado"});
        }
    } catch (error) {
        res.status(500).json({message: "Erro ao atualizar os dados do usuário"});
    }
});

//Rota para deletar um usuário
app.delete('/users/:id', async(req, res) => {
    try {
        const {id} = req.params; //Pega da URL o ID do usuário a ser deletado
        const users = await loadCache(); //Carrega os usuários do cache
        const updatedUsers = users.filter(user => user.id != id); //Busca o indice do usuário pelo seu ID

        if (updatedUsers.length !== users){
            await saveCache(updatedUsers); //Reescreve os dados sem o usuário deletado
            res.json({message:`Usuário ${id} deletado`})
        } else {
            res.status(404).json({message: "Usuário não encontrado"})
        }
    } catch (error) {
        res.status(500).json({message: "Erro ao deletar o usuário"})
    }
});