// npm init
// npm i express
const express = require("express");
const fs = require("fs");

const app = express();
const port = 3000;

// Permite receber JSON nas requisições
app.use(express.json());

// Arquivos que serão utilizados
const arquivoAulas = "aulas.json";
const arquivoId = "id.json";

// Lê o último ID salvo quando a API inicia
let ultimoId = 0;

if (fs.existsSync(arquivoId)) {
    const dadosId = fs.readFileSync(arquivoId, "utf8");
    ultimoId = JSON.parse(dadosId).ultimoId;
}

// Função para salvar o último ID no arquivo JSON
function salvarUltimoId() {
    const dados = {
        ultimoId: ultimoId
    };

    fs.writeFileSync(
        arquivoId,
        JSON.stringify(dados, null, 2)
    );
}

// ROTA POST - cadastrar uma aula
app.post("/aulas", (req, res) => {

    const {
        componente,
        professor,
        dia,
        ordem
    } = req.body;

    // Verifica se todos os dados foram enviados
    if (!componente || !professor || !dia || !ordem) {
        return res.status(400).json({
            mensagem: "Informe componente, professor, dia e ordem."
        });
    }

    // Aumenta o ID
    ultimoId++;

    // Salva o novo ID no arquivo
    salvarUltimoId();

    // Cria a nova aula
    const novaAula = {
        id: ultimoId,
        componente: componente,
        professor: professor,
        dia: dia,
        ordem: ordem
    };

    // Lê as aulas existentes
    const dados = fs.readFileSync(arquivoAulas, "utf8");
    const aulas = JSON.parse(dados);

    // Adiciona a nova aula
    aulas.push(novaAula);

    // Salva novamente o arquivo
    fs.writeFileSync(
        arquivoAulas,
        JSON.stringify(aulas, null, 2)
    );

    res.status(201).json({
        mensagem: "Aula cadastrada com sucesso!",
        aula: novaAula
    });
});

// ROTA GET - consultar as aulas
app.get("/aulas", (req, res) => {

    const dados = fs.readFileSync(arquivoAulas, "utf8");
    const aulas = JSON.parse(dados);

    // Organiza primeiro pelo dia e depois pela ordem
    const dias = [
        "segunda-feira",
        "terça-feira",
        "quarta-feira",
        "quinta-feira",
        "sexta-feira"
    ];

    aulas.sort((a, b) => {
        const diaA = dias.indexOf(a.dia.toLowerCase());
        const diaB = dias.indexOf(b.dia.toLowerCase());

        if (diaA !== diaB) {
            return diaA - diaB;
        }

        return a.ordem - b.ordem;
    });

    res.json(aulas);
});

// ROTA DELETE - excluir uma aula pelo ID
app.delete("/aulas/:id", (req, res) => {

    const id = Number(req.params.id);

    const dados = fs.readFileSync(arquivoAulas, "utf8");
    const aulas = JSON.parse(dados);

    // Procura a aula
    const indice = aulas.findIndex(aula => aula.id === id);

    // Se não encontrar
    if (indice === -1) {
        return res.status(404).json({
            mensagem: "Aula não encontrada."
        });
    }

    // Remove a aula
    const aulaExcluida = aulas.splice(indice, 1);

    // Salva o arquivo atualizado
    fs.writeFileSync(
        arquivoAulas,
        JSON.stringify(aulas, null, 2)
    );

    res.json({
        mensagem: "Aula excluída com sucesso!",
        aula: aulaExcluida[0]
    });
});

// Inicia a API
app.listen(port, () => {
    console.log(`API rodando em http://localhost:3000/aulas`);
});
