document.addEventListener('DOMContentLoaded', function() {
    if (!dw3IsLogged()) {
        return;
    }

    var form = document.getElementById('frmPastos');

    if (!form) {
        return;
    }

    var oper = form.dataset.oper;
    var servidor = form.dataset.servidor;
    var btnInserir = document.getElementById('btnInserirPasto');
    var btnAtualizar = document.getElementById('btnAtualizarPasto');

    if (oper === 'Cr') {
        dw3OcultarBotao('btnAtualizarPasto');
        dw3OcultarBotao('btnRemoverPasto');
    }

    if (oper === 'Re') {
        dw3OcultarBotao('btnInserirPasto');
        dw3OcultarBotao('btnAtualizarPasto');
        dw3OcultarBotao('btnRemoverPasto');
        dw3DesabilitarCampos('frmPastos');
        vwGetPastoByID();
    }

    if (oper === 'Up') {
        dw3OcultarBotao('btnInserirPasto');
        dw3OcultarBotao('btnRemoverPasto');
        btnAtualizar.disabled = true;
        vwGetPastoByID().then(function(carregado) {
            btnAtualizar.disabled = !carregado;
        });
        btnAtualizar.addEventListener('click', function() {
            vwUpdatePasto();
        });
    }

    if (oper === 'De') {
        dw3OcultarBotao('btnInserirPasto');
        dw3OcultarBotao('btnAtualizarPasto');
        dw3DesabilitarCampos('frmPastos');
        var btnRemover = document.getElementById('btnRemoverPasto');
        btnRemover.disabled = true;
        vwGetPastoByID().then(function(carregado) {
            btnRemover.disabled = !carregado;
        });
        btnRemover.addEventListener('click', function() {
            vwDeletePasto();
        });
    }


    if (btnInserir) {
        btnInserir.addEventListener('click', function() {
            vwInsertPasto();
        });
    }
});

async function vwGetPastoByID() {
  var form = document.getElementById('frmPastos');

  try {
    var parametros = new URLSearchParams(window.location.search);
    var pastoId = parametros.get('pastoId');
    var servidor = form.dataset.servidor;

    if (!pastoId || !/^\d+$/.test(pastoId) || Number(pastoId) <= 0) {
      throw new Error('ID do pasto inválido.');
    }

    if (!servidor) {
      throw new Error('Endereço do servidor backend não configurado.');
    }

    var response = await fetch(servidor + '/getPastoByID/' + encodeURIComponent(pastoId), {
      headers: dw3MontarHeadersAutenticacao({
        'content-type': 'application/json'
      })
    });

    if (!response.ok) {
      throw new Error('Não foi possível carregar o pasto.');
    }

    var data = await response.json();

    if (data.auth === false) {
      throw new Error(data.message || 'Sessão expirada. Faça login novamente.');
    }

    if (data.status !== 'ok' || !Array.isArray(data.registro)) {
      throw new Error('Resposta inválida do servidor backend.');
    }

    var pasto = data.registro[0];

    if (!pasto) {
      throw new Error('Pasto não encontrado.');
    }

    document.getElementById('pastoid').value = pasto.pastoid;
    document.getElementById('descricao').value = pasto.descricao ?? '';
    document.getElementById('areatotal').value = pasto.areatotal ?? '';
    document.getElementById('removido').value = String(pasto.removido === true);

    return true;
  } catch (error) {
    alert(error.message || 'Erro ao carregar pasto.');
    return false;
  }
}

async function vwInsertPasto() {
    var form = document.getElementById('frmPastos');
    var btnInserir = document.getElementById('btnInserirPasto');

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

        var response = await fetch(servidor + '/insertPasto', {
            method: 'POST',
            headers: dw3MontarHeadersAutenticacao({'content-type': 'application/json'}),
            body: JSON.stringify(montarPastoDoFormulario())
        });

        if (!response.ok) {
            throw new Error('Não foi possível inserir o pasto.');
        }

        var data = await response.json();
        if (data.auth === false) {
            throw new Error(data.message || 'Sessão expirada. Faça login novamente.');
        }
        if (data.status !== 'ok') {
            throw new Error(data.status || 'Não foi possível inserir o pasto.');
        }

        window.location.href = '/pastos';
    } catch (error) {
        alert(error.message || 'Erro ao inserir pasto.');
    } finally {
        if (btnInserir) {
            btnInserir.disabled = false;
        }
    }
}

async function vwUpdatePasto() {
    var form = document.getElementById('frmPastos');
    var btnAtualizar = document.getElementById('btnAtualizarPasto');

    if (btnAtualizar.disabled || !form.reportValidity()) {
        return;
    }

    try {
        var pastoId = new URLSearchParams(window.location.search).get('pastoId');
        var servidor = form.dataset.servidor;

        if (!pastoId || !/^\d+$/.test(pastoId) || Number(pastoId) <= 0) {
            throw new Error('ID do pasto inválido.');
        }

        if (!servidor) {
            throw new Error('Endereço do servidor backend não configurado.');
        }

        btnAtualizar.disabled = true;

        var pasto = montarPastoDoFormulario();

        var response = await fetch(servidor + '/updatePasto/' + encodeURIComponent(pastoId), {
            method: 'PUT',
            headers: dw3MontarHeadersAutenticacao({
                'content-type': 'application/json'
            }),
            body: JSON.stringify(pasto)
        });

        if (!response.ok) {
            throw new Error('Não foi possível atualizar o pasto.');
        }

        var data = await response.json();
        if (data.auth === false) {
            throw new Error(data.message || 'Sessão expirada. Faça login novamente.');
        }
        if (data.status !== 'ok') {
            throw new Error(data.status || 'Não foi possível atualizar o pasto.');
        }
        if (data.linhasAfetadas !== 1) {
            throw new Error('Nenhum pasto foi atualizado.');
        }
        alert('Pasto atualizado com sucesso.');
    } catch (error) {
        alert(error.message || 'Erro ao atualizar pasto.');
    } finally {
        btnAtualizar.disabled = false;
    }
}

async function vwDeletePasto() {
    var form = document.getElementById('frmPastos');
    var btnRemover = document.getElementById('btnRemoverPasto');

    if (btnRemover.disabled) {
        return;
    }
    if (!window.confirm('Confirma a remoção deste pasto?')) {
        return;
    }

    try {
        var pastoId = document.getElementById('pastoid').value;
        var servidor = form.dataset.servidor;

        if (!pastoId || !/^\d+$/.test(pastoId) || Number(pastoId) <= 0) {
            throw new Error('ID do pasto inválido.');
        }
        if (!servidor) {
            throw new Error('Endereço do servidor backend não configurado.');
        }

        btnRemover.disabled = true;

        var response = await fetch(servidor + '/deletePasto/' + encodeURIComponent(pastoId), {
            method: 'DELETE',
            headers: dw3MontarHeadersAutenticacao()
        });

        if (!response.ok) {
            throw new Error('Não foi possível remover o pasto.');
        }

        var data = await response.json();

        if (data.auth === false) {
            throw new Error(data.message || 'Sessão expirada. Faça login novamente.');
        }
        if (data.status !== 'ok') {
            throw new Error(data.status || 'Não foi possível remover o pasto.');
        }
        if (data.linhasAfetadas !== 1) {
            throw new Error('Nenhum pasto foi removido.');
        }

        window.location.href = '/pastos';
    } catch (error) {
        alert(error.message || 'Erro ao remover pasto.');
    } finally {
        btnRemover.disabled = false;
    }
}

function montarPastoDoFormulario() {
    return {
        descricao: document.getElementById('descricao').value,
        areatotal: Number(document.getElementById('areatotal').value),
        removido: document.getElementById('removido').value === 'true'
    };
}
