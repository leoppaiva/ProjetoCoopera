
const aparelhos = [];

const form = document.querySelector('#form-aparelho');
const lista = document.querySelector('#lista-aparelhos');
const saida = document.querySelector('#resultado');
const erro = document.querySelector('#erro');
const botaoSimular = document.querySelector('#btn-simular');

const brl = (v) => Number(v).toLocaleString('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

const num = (v) => Number(v).toLocaleString('pt-BR', {
  maximumFractionDigits: 2
});

function criar(tag, texto, classe) {
  const el = document.createElement(tag);

  if (texto !== undefined) {
    el.textContent = texto;
  }

  if (classe) {
    el.className = classe;
  }

  return el;
}

function desenharLista() {
  lista.textContent = '';

  if (aparelhos.length === 0) {
    lista.appendChild(
      criar(
        'li',
        'Nenhum aparelho cadastrado ainda. Preencha o formulário acima.',
        'vazio'
      )
    );

    return;
  }

  aparelhos.forEach((aparelho, indice) => {
    const li = criar('li');

    const remover = criar('button', 'Remover', 'remover');
    remover.type = 'button';

    remover.addEventListener('click', () => {
      aparelhos.splice(indice, 1);
      desenharLista();
    });

    li.append(
      criar('span', aparelho.nome, 'nome'),
      criar(
        'span',
        `${aparelho.potenciaW} W · ${aparelho.horasDia} h/dia · ${aparelho.diasMes} dias/mês`,
        'meta'
      ),
      remover
    );

    lista.appendChild(li);
  });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const aparelho = {
    nome: form.elements.nome.value.trim(),
    potenciaW: Number(form.elements.potenciaW.value),
    horasDia: Number(form.elements.horasDia.value),
    diasMes: Number(form.elements.diasMes.value)
  };

  aparelhos.push(aparelho);

  desenharLista();

  form.reset();
  form.elements.nome.focus();

  erro.hidden = true;
  saida.hidden = true;
});

function linha(rotulo, valor, classe) {
  const div = criar(
    'div',
    undefined,
    classe ? `linha ${classe}` : 'linha'
  );

  div.append(
    criar('span', rotulo),
    criar('strong', valor)
  );

  return div;
}

function destaque(rotulo, valor) {
  const div = criar('div');

  div.append(
    criar('small', rotulo),
    criar('strong', valor)
  );

  return div;
}

function desenharGrafico(detalhes) {
  const grafico = criar('div', undefined, 'grafico-consumo');

  grafico.appendChild(
    criar('h3', 'Consumo por aparelho')
  );

  detalhes.forEach((item) => {
    const grupo = criar('div', undefined, 'grupo-barra');

    const cabecalho = criar(
      'div',
      undefined,
      'cabecalho-barra'
    );

    cabecalho.append(
      criar('span', item.nome),
      criar('strong', `${num(item.percentual)}%`)
    );

    const trilho = criar(
      'div',
      undefined,
      'trilho-barra'
    );

    const preenchimento = criar(
      'div',
      undefined,
      'preenchimento-barra'
    );

    const percentual = Math.min(
      100,
      Math.max(0, Number(item.percentual) || 0)
    );

    preenchimento.style.width = `${percentual}%`;

    trilho.appendChild(preenchimento);

    grupo.append(cabecalho, trilho);

    grafico.appendChild(grupo);
  });

  return grafico;
}

function desenharTabela(detalhes) {
  const cabecalho = criar('tr');

  ['Aparelho', 'kWh/mês', 'Custo', '% do consumo'].forEach(
    (titulo, indice) => {
      cabecalho.appendChild(
        criar('th', titulo, indice === 0 ? '' : 'n')
      );
    }
  );

  const thead = criar('thead');
  thead.appendChild(cabecalho);

  const tbody = criar('tbody');

  detalhes.forEach((item) => {
    const tr = criar('tr');

    tr.append(
      criar('td', item.nome),
      criar('td', num(item.kwhMes), 'n'),
      criar('td', brl(item.custo), 'n'),
      criar('td', `${num(item.percentual)}%`, 'n')
    );

    tbody.appendChild(tr);
  });

  const tabela = criar('table');

  tabela.append(thead, tbody);

  const rolagem = criar('div', undefined, 'tabela');

  rolagem.appendChild(tabela);

  return rolagem;
}

function desenharResultado(d) {
  saida.textContent = '';

  const conta = criar('div', undefined, 'conta');

  conta.append(
    linha('Consumo do mês', `${num(d.consumoKwhMes)} kWh`),
    linha('Energia', brl(d.custoEnergia)),
    linha('Adicional da bandeira', brl(d.adicionalBandeira)),
    linha('Total estimado da conta', brl(d.totalMes), 'total')
  );

  const resumo = criar('div', undefined, 'resumo');

  resumo.append(
    destaque(
      'Painéis solares necessários',
      String(d.paineisNecessarios)
    ),
    destaque(
      'Aparelho que mais pesa no bolso',
      `${d.aparelhoMaisCaro.nome} · ${brl(d.aparelhoMaisCaro.custo)}`
    )
  );

  const grafico = desenharGrafico(d.detalhes);

  const tabela = desenharTabela(d.detalhes);

  saida.append(
    criar('h2', 'Resultado da simulação'),
    conta,
    resumo,
    grafico,
    tabela
  );

  saida.hidden = false;
}

botaoSimular.addEventListener('click', async () => {
  erro.hidden = true;
  saida.hidden = true;

  if (aparelhos.length === 0) {
    erro.textContent = 'Cadastre pelo menos um aparelho antes de simular.';
    erro.hidden = false;
    return;
  }

  botaoSimular.disabled = true;
  botaoSimular.textContent = 'Calculando...';

  try {
    const resposta = await fetch('/api/simular', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ aparelhos })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      erro.textContent = dados.erro || 'Não foi possível simular.';
      erro.hidden = false;
      return;
    }

    desenharResultado(dados);

  } catch (e) {
    erro.textContent = 'Não consegui falar com o servidor. Ele está rodando?';
    erro.hidden = false;

  } finally {
    botaoSimular.disabled = false;
    botaoSimular.textContent = 'Simular';
  }
});

desenharLista();
