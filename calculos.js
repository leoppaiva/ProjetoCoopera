
const cfg = require('./config');


const arredondar = (valor) => Math.round(valor * 100) / 100;

function consumoMensalKwh(aparelho) {
  return (aparelho.potenciaW * aparelho.horasDia * aparelho.diasMes) / 1000;}

function custoEnergia(kwh) {
  return kwh * cfg.TARIFA_KWH;}

function adicionalBandeira(kwh) {
  return (kwh / 100) * cfg.VALORES_BANDEIRA[cfg.BANDEIRA];}

function geracaoPorPainel() {
  return (cfg.POTENCIA_PAINEL_W / 1000) * cfg.HSP * 30 * cfg.EFICIENCIA;}

function paineisNecessarios(kwh) {
  return Math.ceil(kwh / geracaoPorPainel());
}

function simular(aparelhos) {

  const itens = aparelhos.map((a) => {
    const kwh = consumoMensalKwh(a);
    return { nome: a.nome, kwh, custo: custoEnergia(kwh) };});

  const consumoTotal = itens.reduce((soma, item) => soma + item.kwh, 0);
  const custoTotal = custoEnergia(consumoTotal);
  const adicional = adicionalBandeira(consumoTotal);
  const maisCaro = itens.reduce((maior, item) => (item.custo > maior.custo ? item : maior));

  return {
    consumoKwhMes: arredondar(consumoTotal),
    custoEnergia: arredondar(custoTotal),
    adicionalBandeira: arredondar(adicional),
    totalMes: arredondar(custoTotal + adicional),
    paineisNecessarios: paineisNecessarios(consumoTotal),
    aparelhoMaisCaro: { nome: maisCaro.nome, custo: arredondar(maisCaro.custo) },
    detalhes: itens.map((item) => ({
      nome: item.nome,
      kwhMes: arredondar(item.kwh),
      custo: arredondar(item.custo),
      percentual: arredondar(consumoTotal > 0 ? (item.kwh / consumoTotal) * 100 : 0),})),};}

module.exports = { consumoMensalKwh, custoEnergia, adicionalBandeira, paineisNecessarios, simular };
