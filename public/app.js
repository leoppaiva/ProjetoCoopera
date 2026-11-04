const aparelhos = [];
const form = document.querySelector('#form-aparelho');
const lista = document.querySelector('#lista-aparelhos');
const saida = document.querySelector('#resultado');
const erro = document.querySelector('#erro');

const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const num = (v) => v.toLocaleString('pt-BR');


function criar(tag, texto, classe) {
  const el = document.createElement(tag);
  if (texto !== undefined) el.textContent = texto;
  if (classe) el.className = classe;
  return el;}


function desenharLista() {
  lista.textContent = '';
  if (aparelhos.length === 0) {
    lista.appendChild(criar('li', 'Nenhum aparelho cadastrado ainda. Preencha o formulário acima.', 'vazio'));
    return;}



  aparelhos.forEach((aparelho, indice) => {
    const li = criar('li');
    const remover = criar('button', 'Remover', 'remover');
    remover.type = 'button';
    remover.addEventListener('click', () => {
      aparelhos.splice(indice, 1);
      desenharLista();});


    li.append(
      criar('span', aparelho.nome, 'nome'),
      criar('span', `${aparelho.potenciaW} W · ${aparelho.horasDia} h/dia · ${aparelho.diasMes} dias/mês`, 'meta'),
      remover
    );
    lista.appendChild(li);});}


form.addEventListener('submit', (event) => {
  event.preventDefault();
  aparelhos.push({
    nome: form.elements.nome.value.trim(),
    potenciaW: Number(form.elements.potenciaW.value),
    horasDia: Number(form.elements.horasDia.value),
    diasMes: Number(form.elements.diasMes.value),
  });
  desenharLista();
  form.reset();
  form.elements.nome.focus();});

function linha(rotulo, valor, classe) {
  const div = criar('div', undefined, classe ? `linha ${classe}` : 'linha');
  div.append(criar('span', rotulo), criar('strong', valor));
  return div;}

function destaque(rotulo, valor) {
  const div = criar('div');
  div.append(criar('small', rotulo), criar('strong', valor));
  return div;}


function desenharResultado(d) {
  saida.textContent = '';

  const conta = criar('div', undefined, 'conta');
  conta.append(
    linha('Consumo do mês', `${num(d.consumoKwhMes)} kWh`),
    linha('Energia', brl(d.custoEnergia)),
    linha('Adicional da bandeira', brl(d.adicionalBandeira)),
    linha('Total estimado da conta', brl(d.totalMes), 'total'));



  const resumo = criar('div', undefined, 'resumo');
  resumo.append(
    destaque('Painéis solares necessários', String(d.paineisNecessarios)),
    destaque('Aparelho que mais pesa no bolso', `${d.aparelhoMaisCaro.nome} · ${brl(d.aparelhoMaisCaro.custo)}`));


  const cabecalho = criar('tr');
  ['Aparelho', 'kWh/mês', 'Custo', '% do consumo'].forEach((titulo, i) => {
    cabecalho.appendChild(criar('th', titulo, i === 0 ? '' : 'n'));});
  const thead = criar('thead');
  thead.appendChild(cabecalho);

  const tbody = criar('tbody');
  d.detalhes.forEach((item) => {
    const tr = criar('tr');
    tr.append(
      criar('td', item.nome),
      criar('td', num(item.kwhMes), 'n'),
      criar('td', brl(item.custo), 'n'),
      criar('td', `${num(item.percentual)}%`, 'n'));
    tbody.appendChild(tr);});


  const tabela = criar('table');
  tabela.append(thead, tbody);
  const rolagem = criar('div', undefined, 'tabela');
  rolagem.appendChild(tabela);

  saida.append(criar('h2', 'Resultado da simulação'), conta, resumo, rolagem);
  saida.hidden = false;}


document.querySelector('#btn-simular').addEventListener('click', async () => {
  erro.hidden = true;
  saida.hidden = true;
  try {
    const resposta = await fetch('/api/simular', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aparelhos }),});
    const dados = await resposta.json();
    
    if (!resposta.ok) {
      erro.textContent = dados.erro || 'Não foi possível simular.';
      erro.hidden = false;
      return;   }
    desenharResultado(dados);}
     catch (e) {
    erro.textContent = 'Não consegui falar com o servidor. Ele está rodando?';
    erro.hidden = false;}});

    
desenharLista();
