document.addEventListener('DOMContentLoaded', function() {
    if (!dw3IsLogged()) {
        return;
    }

    var form = document.getElementById('frmAlocados');

    if (!form) {
        return;
    }

    var oper = form.dataset.oper;
    var servidor = form.dataset.servidor;
    var btnInserir = document.getElementById('btnInserirAlocado');
    var btnAtualizar = document.getElementById('btnAtualizarAlocado');

    inicializarSelectAnimais();
    inicializarSelectPiquetes();
    configurarValidacaoDatas();

    if (oper === 'Cr') {
        dw3OcultarBotao('btnAtualizarAlocado');
        dw3OcultarBotao('btnRemoverAlocado');
        carregarAnimaisToAlocados(servidor);
        carregarPiquetesToAlocados(servidor);
    }

    if (oper === 'Re') {
        dw3OcultarBotao('btnInserirAlocado');
        dw3OcultarBotao('btnAtualizarAlocado');
        dw3OcultarBotao('btnRemoverAlocado');
        dw3DesabilitarCampos('frmAlocados');
        vwGetAlocadoByID();
    }

    if (oper === 'Up') {
        dw3OcultarBotao('btnInserirAlocado');
        dw3OcultarBotao('btnRemoverAlocado');
        btnAtualizar.disabled = true;
        vwGetAlocadoByID().then(function(carregado) {
            btnAtualizar.disabled = !carregado;
        });
        btnAtualizar.addEventListener('click', function() {
            vwUpdateAlocado();
        });
    }

    if (oper === 'De') {
        dw3OcultarBotao('btnInserirAlocado');
        dw3OcultarBotao('btnAtualizarAlocado');
        dw3DesabilitarCampos('frmAlocados');
        var btnRemover = document.getElementById('btnRemoverAlocado');
        btnRemover.disabled = true;
        vwGetAlocadoByID().then(function(carregado) {
            btnRemover.disabled = !carregado;
        });
        btnRemover.addEventListener('click', function() {
            vwDeleteAlocado();
        });
    }


    if (btnInserir) {
        btnInserir.addEventListener('click', function() {
            vwInsertAlocado();
        });
    }
});

// Aqui são inicializados os componentes Select2.js em branco
function inicializarSelectAnimais() {
    $('#animalidfk').select2({
        theme: 'bootstrap-5',
        placeholder: 'Selecione um animal',
        width: '100%'
    });
}

function inicializarSelectPiquetes() {
    $('#piqueteidfk').select2({
        theme: 'bootstrap-5',
        placeholder: 'Selecione um piquete',
        width: '100%'
    });
}

// A data final não pode ser anterior à data de início
function configurarValidacaoDatas() {
    var dataInicio = document.getElementById('datainicio');
    var dataFinal = document.getElementById('datafinal');

    dataInicio.addEventListener('change', function() {
        dataFinal.min = dataInicio.value;
    });
}

// Aqui é preenchido o componente Select2 com os animais disponíveis
async function carregarAnimaisToAlocados(servidor) {
    try {
        if (!servidor) {
            throw new Error('Endereço do servidor backend não configurado.');
        }

        var response = await fetch(servidor + '/getAnimaisToAlocados', {
            headers: dw3MontarHeadersAutenticacao()
        });

        if (!response.ok) {
            throw new Error('Não foi possível carregar os animais.');
        }

        var data = await response.json();
        if (data.auth === false) {
            throw new Error(data.message || 'Sessão expirada. Faça login novamente.');
        }
        if (data.status !== 'ok' || !Array.isArray(data.registro)) {
            throw new Error('Resposta inválida do servidor backend.');
        }

        preencherSelectAnimais(data.registro);

        return true;
    } catch (error) {
        alert(error.message || 'Erro ao carregar animais.');
        return false;
    }
}

function preencherSelectAnimais(animais) {
    var animalSelect = document.getElementById('animalidfk');

    if (!animalSelect) {
        return;
    }

    animalSelect.innerHTML = '<option value="">Selecione um animal</option>';
    animais.forEach(function(animal) {
        var option = document.createElement('option');
        option.value = animal.animalid;
        option.textContent = animal.nome;
        animalSelect.appendChild(option);
    });

    $('#animalidfk').trigger('change');
}

// Aqui é preenchido o componente Select2 com os piquetes disponíveis
async function carregarPiquetesToAlocados(servidor) {
    try {
        if (!servidor) {
            throw new Error('Endereço do servidor backend não configurado.');
        }

        var response = await fetch(servidor + '/getPiquetesToAlocados', {
            headers: dw3MontarHeadersAutenticacao()
        });

        if (!response.ok) {
            throw new Error('Não foi possível carregar os piquetes.');
        }

        var data = await response.json();
        if (data.auth === false) {
            throw new Error(data.message || 'Sessão expirada. Faça login novamente.');
        }
        if (data.status !== 'ok' || !Array.isArray(data.registro)) {
            throw new Error('Resposta inválida do servidor backend.');
        }

        preencherSelectPiquetes(data.registro);

        return true;
    } catch (error) {
        alert(error.message || 'Erro ao carregar piquetes.');
        return false;
    }
}

function preencherSelectPiquetes(piquetes) {
    var piqueteSelect = document.getElementById('piqueteidfk');

    if (!piqueteSelect) {
        return;
    }

    piqueteSelect.innerHTML = '<option value="">Selecione um piquete</option>';
    piquetes.forEach(function(piquete) {
        var option = document.createElement('option');
        option.value = piquete.piqueteid;
        option.textContent = piquete.pastodescricao
            ? piquete.descricao + ' (' + piquete.pastodescricao + ')'
            : piquete.descricao;
        piqueteSelect.appendChild(option);
    });

    $('#piqueteidfk').trigger('change');
}

async function vwGetAlocadoByID() {
  var form = document.getElementById('frmAlocados');

  try {
    var parametros = new URLSearchParams(window.location.search);
    var alocadoId = parametros.get('alocadoId');
    var servidor = form.dataset.servidor;

    if (!alocadoId || !/^\d+$/.test(alocadoId) || Number(alocadoId) <= 0) {
      throw new Error('ID da alocação inválido.');
    }

    if (!servidor) {
      throw new Error('Endereço do servidor backend não configurado.');
    }

    var response = await fetch(servidor + '/getAlocadoByID/' + encodeURIComponent(alocadoId), {
      headers: dw3MontarHeadersAutenticacao({
        'content-type': 'application/json'
      })
    });

    if (!response.ok) {
      throw new Error('Não foi possível carregar a alocação.');
    }

    var data = await response.json();

    if (data.auth === false) {
      throw new Error(data.message || 'Sessão expirada. Faça login novamente.');
    }

    if (data.status !== 'ok') {
      throw new Error('Resposta inválida do servidor backend.');
    }

    var alocado = Array.isArray(data.registro) ? data.registro[0] : data.registro;

    if (!alocado) {
      throw new Error('Alocação não encontrada.');
    }

    document.getElementById('alocadoid').value = alocado.alocadoid;
    document.getElementById('datainicio').value = alocado.datainicio ? alocado.datainicio.slice(0, 10) : '';
    document.getElementById('datafinal').value = alocado.datafinal ? alocado.datafinal.slice(0, 10) : '';
    document.getElementById('datafinal').min = document.getElementById('datainicio').value;
    document.getElementById('removido').value = String(alocado.removido === true);

    var carregados = await Promise.all([
      carregarAnimaisToAlocados(servidor),
      carregarPiquetesToAlocados(servidor)
    ]);

    if (!carregados[0] || !carregados[1]) {
      return false;
    }
    $('#animalidfk').val(alocado.animalidfk).trigger('change');
    $('#piqueteidfk').val(alocado.piqueteidfk).trigger('change');
    return true;
  } catch (error) {
    alert(error.message || 'Erro ao carregar alocação.');
    return false;
  }
}

async function vwInsertAlocado() {
    var form = document.getElementById('frmAlocados');
    var btnInserir = document.getElementById('btnInserirAlocado');

    try {
        if (!form.reportValidity()) {
            return;
        }

        var servidor = form.dataset.servidor;
        if (!servidor) {
            throw new Error('Endereço do servidor backend não configurado.');
        }

        if (btnInserir) {
            btnInserir.disabled = true;
        }

        var response = await fetch(servidor + '/insertAlocado', {
            method: 'POST',
            headers: dw3MontarHeadersAutenticacao({'content-type': 'application/json'}),
            body: JSON.stringify(montarAlocadoDoFormulario())
        });

        if (!response.ok) {
            throw new Error('Não foi possível inserir a alocação.');
        }

        var data = await response.json();
        if (data.auth === false) {
            throw new Error(data.message || 'Sessão expirada. Faça login novamente.');
        }
        if (data.status !== 'ok') {
            throw new Error(data.status || 'Não foi possível inserir a alocação.');
        }

        window.location.href = '/alocados';
    } catch (error) {
        alert(error.message || 'Erro ao inserir alocação.');
    } finally {
        if (btnInserir) {
            btnInserir.disabled = false;
        }
    }
}

async function vwUpdateAlocado() {
    var form = document.getElementById('frmAlocados');
    var btnAtualizar = document.getElementById('btnAtualizarAlocado');

    if (btnAtualizar.disabled || !form.reportValidity()) {
        return;
    }

    try {
        var alocadoId = new URLSearchParams(window.location.search).get('alocadoId');
        var servidor = form.dataset.servidor;

        if (!alocadoId || !/^\d+$/.test(alocadoId) || Number(alocadoId) <= 0) {
            throw new Error('ID da alocação inválido.');
        }

        if (!servidor) {
            throw new Error('Endereço do servidor backend não configurado.');
        }

        btnAtualizar.disabled = true;

        var alocado = montarAlocadoDoFormulario();

        var response = await fetch(servidor + '/updateAlocado/' + encodeURIComponent(alocadoId), {
            method: 'PUT',
            headers: dw3MontarHeadersAutenticacao({
                'content-type': 'application/json'
            }),
            body: JSON.stringify(alocado)
        });

        if (!response.ok) {
            throw new Error('Não foi possível atualizar a alocação.');
        }

        var data = await response.json();
        if (data.auth === false) {
            throw new Error(data.message || 'Sessão expirada. Faça login novamente.');
        }
        if (data.status !== 'ok') {
            throw new Error(data.status || 'Não foi possível atualizar a alocação.');
        }
        if (data.linhasAfetadas !== 1) {
            throw new Error('Nenhuma alocação foi atualizada.');
        }
        alert('Alocação atualizada com sucesso.');
    } catch (error) {
        alert(error.message || 'Erro ao atualizar alocação.');
    } finally {
        btnAtualizar.disabled = false;
    }
}

async function vwDeleteAlocado() {
    var form = document.getElementById('frmAlocados');
    var btnRemover = document.getElementById('btnRemoverAlocado');

    if (btnRemover.disabled) {
        return;
    }
    if (!window.confirm('Confirma a remoção desta alocação?')) {
        return;
    }

    try {
        var alocadoId = document.getElementById('alocadoid').value;
        var servidor = form.dataset.servidor;

        if (!alocadoId || !/^\d+$/.test(alocadoId) || Number(alocadoId) <= 0) {
            throw new Error('ID da alocação inválido.');
        }
        if (!servidor) {
            throw new Error('Endereço do servidor backend não configurado.');
        }

        btnRemover.disabled = true;

        var response = await fetch(servidor + '/deleteAlocado/' + encodeURIComponent(alocadoId), {
            method: 'DELETE',
            headers: dw3MontarHeadersAutenticacao()
        });

        if (!response.ok) {
            throw new Error('Não foi possível remover a alocação.');
        }

        var data = await response.json();

        if (data.auth === false) {
            throw new Error(data.message || 'Sessão expirada. Faça login novamente.');
        }
        if (data.status !== 'ok') {
            throw new Error(data.status || 'Não foi possível remover a alocação.');
        }
        if (data.linhasAfetadas !== 1) {
            throw new Error('Nenhuma alocação foi removida.');
        }

        window.location.href = '/alocados';
    } catch (error) {
        alert(error.message || 'Erro ao remover alocação.');
    } finally {
        btnRemover.disabled = false;
    }
}

function montarAlocadoDoFormulario() {
    return {
        animalidfk: Number(document.getElementById('animalidfk').value),
        piqueteidfk: Number(document.getElementById('piqueteidfk').value),
        datainicio: document.getElementById('datainicio').value,
        datafinal: document.getElementById('datafinal').value,
        removido: document.getElementById('removido').value === 'true'
    };
}
