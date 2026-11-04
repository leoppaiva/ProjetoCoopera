
const express = require('express');
const { simular } = require('./calculos');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const ehNumero = (v) => typeof v === 'number' && Number.isFinite(v);




const REGRAS = [
  ['nome', (v) => typeof v === 'string' && v.trim() !== '', 'Deve ser um texto não vazio'],
  ['potenciaW', (v) => ehNumero(v) && v >= 1 && v <= 10000, 'Deve ser um número entre 1 e 10000'],
  ['horasDia', (v) => ehNumero(v) && v >= 0 && v <= 24, 'Deve estar entre 0 e 24'],
  ['diasMes', (v) => Number.isInteger(v) && v >= 1 && v <= 31, 'Deve ser um inteiro entre 1 e 31'],
];


function validar(aparelhos) {
  if (!Array.isArray(aparelhos) || aparelhos.length === 0) {
    return 'aparelhos deve ser uma lista com pelo menos um aparelho';}


  for (let i = 0; i < aparelhos.length; i++) {
    const aparelho = aparelhos[i];
    if (aparelho === null || typeof aparelho !== 'object') {
      
      return `aparelho ${i + 1} deve ser um objeto`;}



    for (const [campo, valido, mensagem] of REGRAS) {
      if (!valido(aparelho[campo])) return `${campo} ${mensagem} (aparelho ${i + 1})`;}}
  return null;}

app.post('/api/simular', (req, res) => {
  const { aparelhos } = req.body || {};
  const erro = validar(aparelhos);
  if (erro) return res.status(400).json({ erro });
  res.json(simular(aparelhos));});



  app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ erro: 'JSON inválido na requisição' });
  res.status(500).json({ erro: 'Erro interno do servidor' });});

app.listen(3000, () => console.log('Medidor Coopera em http://localhost:3000'));
