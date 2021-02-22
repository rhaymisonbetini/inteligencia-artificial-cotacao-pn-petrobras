const { min } = require('@tensorflow/tfjs');
const tf = require('@tensorflow/tfjs');
const fs = require('fs');

let arquivo = fs.readFileSync('cotacao-das-acoes-pn-da-petrobras.csv', { encoding: 'utf-8' });

arquivo = arquivo.toString().trim();

//transformando em array com a quebra de linha
const linhas = arquivo.split('\r\n');

let x = [];
let y = [];
let qtdLinhas = 0;

for (let i = 1; i < linhas.length; i++) {

    let diaAnterior = [];

    if (qtdLinhas == (linhas.length - 2)) {
        diaAnterior = ['28.12.18', 22.68, 22.11, 22.83, 22.08]
    } else {
        diaAnterior = linhas[i + 1].split(';');
    }

    let diaAtual = linhas[i].split(';')

    //4 constantes sao as representacoes de cada coluna;
    const FechamentoX = Number(diaAnterior[1]);
    const AberturaX = Number(diaAnterior[2]);
    const MaximaX = Number(diaAnterior[3]);
    const MinimaX = Number(diaAnterior[4]);

    x.push([FechamentoX, AberturaX, MaximaX, MinimaX])

    const FechamentoY = Number(diaAtual[1]);
    const AberturaY = Number(diaAtual[2]);
    const MaximaY = Number(diaAtual[3]);
    const MinimaY = Number(diaAtual[4]);

    y.push([FechamentoY, AberturaY, MaximaY, MinimaY])

    qtdLinhas++;

}

const model = tf.sequential();

//4 dados de entrada e 4 colunas
const inputLayer = tf.layers.dense({ units: 4, inputShape: [4] })

model.add(inputLayer);
const taxaDeAprendizagem = 0.00001;
const optimizer = tf.train.sgd(taxaDeAprendizagem)
model.compile({ loss: 'meanSquaredError', optimizer: optimizer });

const X = tf.tensor(x, [qtdLinhas, 4]);
const Y = tf.tensor(y);

const arrInput = [[26.83, 27.10, 27.12, 26.64]];

const input = tf.tensor(arrInput, [1, 4]);

model.fit(X, Y, { epochs: 20000 }).then(() => {

    let ouput = model.predict(input).dataSync();

    ouput = ordenarDados(ouput);

    console.log('PREVISÃO PARA O DIA 10.05.2019')
    console.log('===================================')

    console.log(`PREVISAO DAS COTAÇÕES INTELIGÊNCIA ARTIFICIAL: `);
    console.log(`Fechamento: R$ ${Number(ouput[0]).toFixed(2)}`);
    console.log(`Abertura: R$ ${Number(ouput[1]).toFixed(2)}`);
    console.log(`Maxima: R$ ${Number(ouput[2]).toFixed(2)}`);
    console.log(`Minima: R$ ${Number(ouput[3]).toFixed(2)}`);

    console.log('===================================')

    console.log(`RESULTADO REAL: `);
    console.log(`Fechamento: R$ ${Number(26.68).toFixed(2)}`);
    console.log(`Abertura: R$ ${Number(26.87).toFixed(2)}`);
    console.log(`Maxima: R$ ${Number(26.42).toFixed(2)}`);
    console.log(`Minima: R$ ${Number(26.92).toFixed(2)}`);

})


function ordenarDados(array) {

    function sortNumber(a, b) {
        return (a - b);
    }

    let fechamento = array[0];
    let abertura = array[1];
    let maxima = array[2];
    let minima = array[3];

    let cotacoes = [fechamento, abertura, maxima, minima];
    cotacoes = cotacoes.sort(sortNumber)

    let menor = cotacoes[0];
    let maior = cotacoes[3];

    if (fechamento < minima) fechamento = minima;
    if (abertura < minima) abertura = minima;
    if (maxima < minima) maxima = minima;
    minima = menor;

    if (fechamento > maxima) fechamento = maxima;
    if (abertura > maxima) abertura = maxima;
    if (maxima > maxima) maxima = maxima;
    maxima = maior;

    cotacoes = [fechamento, abertura, maxima, minima];
    return cotacoes
}

