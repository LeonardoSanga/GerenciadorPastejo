document.addEventListener('DOMContentLoaded', function() {
    if (!dw3IsLogged()) {
        return;
    }

    var form = document.getElementById('frmPiquetes');

    if (!form) {
        return;
    }

    var oper = form.dataset.oper;
    var servidor = form.dataset.servidor;
    var btnInserir = document.getElementById('btnInserirPiquete');
    var btnAtualizar = document.getElementById('btnAtualizarPiquete');

    inicializarSelectPastos();
    configurarLinkMapa();

    if (oper === 'Cr') {
        dw3OcultarBotao('btnAtualizarPiquete');
        dw3OcultarBotao('btnRemoverPiquete');
        carregarPastosToPiquetes(servidor);
    }

    if (oper === 'Re') {
        dw3OcultarBotao('btnInserirPiquete');
        dw3OcultarBotao('btnAtualizarPiquete');
        dw3OcultarBotao('btnRemoverPiquete');
        dw3DesabilitarCampos('frmPiquetes');
        vwGetPiqueteByID();
    }

    if (oper === 'Up') {
        dw3OcultarBotao('btnInserirPiquete');
        dw3OcultarBotao('btnRemoverPiquete');
        btnAtualizar.disabled = true;
        vwGetPiqueteByID().then(function(carregado) {
            btnAtualizar.disabled = !carregado;
        });
        btnAtualizar.addEventListener('click', function() {
            vwUpdatePiquete();
        });
    }

    if (oper === 'De') {
        dw3OcultarBotao('btnInserirPiquete');
        dw3OcultarBotao('btnAtualizarPiquete');
        dw3DesabilitarCampos('frmPiquetes');
        var btnRemover = document.getElementById('btnRemoverPiquete');
        btnRemover.disabled = true;
        vwGetPiqueteByID().then(function(carregado) {
            btnRemover.disabled = !carregado;
        });
        btnRemover.addEventListener('click', function() {
            vwDeletePiquete();
        });
    }


    if (btnInserir) {
        btnInserir.addEventListener('click', function() {
            vwInsertPiquete();
        });
    }
});

// Aqui é inicializado o componente Select2.js em branco
function inicializarSelectPastos() {
    $('#pastoidfk').select2({
        theme: 'bootstrap-5',
        placeholder: 'Selecione um pasto',
        width: '100%'
    });
}

// Atualiza o link "Ver no mapa" de acordo com a latitude e longitude informadas
function configurarLinkMapa() {
    var latitude = document.getElementById('latitude');
    var longitude = document.getElementById('longitude');

    latitude.addEventListener('input', atualizarLinkMapa);
    longitude.addEventListener('input', atualizarLinkMapa);
    atualizarLinkMapa();
}

function atualizarLinkMapa() {
    var latitude = document.getElementById('latitude').value;
    var longitude = document.getElementById('longitude').value;
    var btnMapa = document.getElementById('btnMapaPiquete');

    if (!btnMapa) {
        return;
    }

    if (latitude === '' || longitude === '') {
        btnMapa.classList.add('disabled');
        btnMapa.setAttribute('aria-disabled', 'true');
        btnMapa.href = '#';
        return;
    }

    btnMapa.classList.remove('disabled');
    btnMapa.removeAttribute('aria-disabled');
    btnMapa.href = 'https://www.google.com/maps?q=' + encodeURIComponent(latitude + ',' + longitude);
}

// Aqui é preenchido o componente Select2 com os pastos disponíveis
async function carregarPastosToPiquetes(servidor) {
    try {
        if (!servidor) {
            throw new Error('Endereço do servidor backend não configurado.');
        }

        var response = await fetch(servidor + '/getPastosToPiquetes', {
            headers: dw3MontarHeadersAutenticacao()
        });

        if (!response.ok) {
            throw new Error('Não foi possível carregar os pastos.');
        }

        var data = await response.json();
        if (data.auth === false) {
            throw new Error(data.message || 'Sessão expirada. Faça login novamente.');
        }
        if (data.status !== 'ok' || !Array.isArray(data.registro)) {
            throw new Error('Resposta inválida do servidor backend.');
        }

        preencherSelectPastos(data.registro);

        return true;
    } catch (error) {
        alert(error.message || 'Erro ao carregar pastos.');
        return false;
    }
}

function preencherSelectPastos(pastos) {
    var pastoSelect = document.getElementById('pastoidfk');

    if (!pastoSelect) {
        return;
    }

    pastoSelect.innerHTML = '<option value="">Selecione um pasto</option>';
    pastos.forEach(function(pasto) {
        var option = document.createElement('option');
        option.value = pasto.pastoid;
        option.textContent = pasto.descricao;
        pastoSelect.appendChild(option);
    });

    $('#pastoidfk').trigger('change');
}

async function vwGetPiqueteByID() {
  var form = document.getElementById('frmPiquetes');

  try {
    var parametros = new URLSearchParams(window.location.search);
    var piqueteId = parametros.get('piqueteId');
    var servidor = form.dataset.servidor;

    if (!piqueteId || !/^\d+$/.test(piqueteId) || Number(piqueteId) <= 0) {
      throw new Error('ID do piquete inválido.');
    }

    if (!servidor) {
      throw new Error('Endereço do servidor backend não configurado.');
    }

    var response = await fetch(servidor + '/getPiqueteByID/' + encodeURIComponent(piqueteId), {
      headers: dw3MontarHeadersAutenticacao({
        'content-type': 'application/json'
      })
    });

    if (!response.ok) {
      throw new Error('Não foi possível carregar o piquete.');
    }

    var data = await response.json();

    if (data.auth === false) {
      throw new Error(data.message || 'Sessão expirada. Faça login novamente.');
    }

    if (data.status !== 'ok') {
      throw new Error('Resposta inválida do servidor backend.');
    }

    var piquete = Array.isArray(data.registro) ? data.registro[0] : data.registro;

    if (!piquete) {
      throw new Error('Piquete não encontrado.');
    }

    document.getElementById('piqueteid').value = piquete.piqueteid;
    document.getElementById('descricao').value = piquete.descricao ?? '';
    document.getElementById('latitude').value = piquete.latitude ?? '';
    document.getElementById('longitude').value = piquete.longitude ?? '';
    document.getElementById('removido').value = String(piquete.removido === true);
    atualizarLinkMapa();

    if (!(await carregarPastosToPiquetes(servidor))) {
      return false;
    }
    $('#pastoidfk').val(piquete.pastoidfk).trigger('change');
    return true;
  } catch (error) {
    alert(error.message || 'Erro ao carregar piquete.');
    return false;
  }
}

async function vwInsertPiquete() {
    var form = document.getElementById('frmPiquetes');
    var btnInserir = document.getElementById('btnInserirPiquete');

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

        var response = await fetch(servidor + '/insertPiquete', {
            method: 'POST',
            headers: dw3MontarHeadersAutenticacao({'content-type': 'application/json'}),
            body: JSON.stringify(montarPiqueteDoFormulario())
        });

        if (!response.ok) {
            throw new Error('Não foi possível inserir o piquete.');
        }

        var data = await response.json();
        if (data.auth === false) {
            throw new Error(data.message || 'Sessão expirada. Faça login novamente.');
        }
        if (data.status !== 'ok') {
            throw new Error(data.status || 'Não foi possível inserir o piquete.');
        }

        window.location.href = '/piquetes';
    } catch (error) {
        alert(error.message || 'Erro ao inserir piquete.');
    } finally {
        if (btnInserir) {
            btnInserir.disabled = false;
        }
    }
}

async function vwUpdatePiquete() {
    var form = document.getElementById('frmPiquetes');
    var btnAtualizar = document.getElementById('btnAtualizarPiquete');

    if (btnAtualizar.disabled || !form.reportValidity()) {
        return;
    }

    try {
        var piqueteId = new URLSearchParams(window.location.search).get('piqueteId');
        var servidor = form.dataset.servidor;

        if (!piqueteId || !/^\d+$/.test(piqueteId) || Number(piqueteId) <= 0) {
            throw new Error('ID do piquete inválido.');
        }

        if (!servidor) {
            throw new Error('Endereço do servidor backend não configurado.');
        }

        btnAtualizar.disabled = true;

        var piquete = montarPiqueteDoFormulario();

        var response = await fetch(servidor + '/updatePiquete/' + encodeURIComponent(piqueteId), {
            method: 'PUT',
            headers: dw3MontarHeadersAutenticacao({
                'content-type': 'application/json'
            }),
            body: JSON.stringify(piquete)
        });

        if (!response.ok) {
            throw new Error('Não foi possível atualizar o piquete.');
        }

        var data = await response.json();
        if (data.auth === false) {
            throw new Error(data.message || 'Sessão expirada. Faça login novamente.');
        }
        if (data.status !== 'ok') {
            throw new Error(data.status || 'Não foi possível atualizar o piquete.');
        }
        if (data.linhasAfetadas !== 1) {
            throw new Error('Nenhum piquete foi atualizado.');
        }
        alert('Piquete atualizado com sucesso.');
    } catch (error) {
        alert(error.message || 'Erro ao atualizar piquete.');
    } finally {
        btnAtualizar.disabled = false;
    }
}

async function vwDeletePiquete() {
    var form = document.getElementById('frmPiquetes');
    var btnRemover = document.getElementById('btnRemoverPiquete');

    if (btnRemover.disabled) {
        return;
    }
    if (!window.confirm('Confirma a remoção deste piquete?')) {
        return;
    }

    try {
        var piqueteId = document.getElementById('piqueteid').value;
        var servidor = form.dataset.servidor;

        if (!piqueteId || !/^\d+$/.test(piqueteId) || Number(piqueteId) <= 0) {
            throw new Error('ID do piquete inválido.');
        }
        if (!servidor) {
            throw new Error('Endereço do servidor backend não configurado.');
        }

        btnRemover.disabled = true;

        var response = await fetch(servidor + '/deletePiquete/' + encodeURIComponent(piqueteId), {
            method: 'DELETE',
            headers: dw3MontarHeadersAutenticacao()
        });

        if (!response.ok) {
            throw new Error('Não foi possível remover o piquete.');
        }

        var data = await response.json();

        if (data.auth === false) {
            throw new Error(data.message || 'Sessão expirada. Faça login novamente.');
        }
        if (data.status !== 'ok') {
            throw new Error(data.status || 'Não foi possível remover o piquete.');
        }
        if (data.linhasAfetadas !== 1) {
            throw new Error('Nenhum piquete foi removido.');
        }

        window.location.href = '/piquetes';
    } catch (error) {
        alert(error.message || 'Erro ao remover piquete.');
    } finally {
        btnRemover.disabled = false;
    }
}

function montarPiqueteDoFormulario() {
    return {
        descricao: document.getElementById('descricao').value,
        latitude: Number(document.getElementById('latitude').value),
        longitude: Number(document.getElementById('longitude').value),
        pastoidfk: Number(document.getElementById('pastoidfk').value),
        removido: document.getElementById('removido').value === 'true'
    };
}
