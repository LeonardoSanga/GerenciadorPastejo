document.addEventListener('DOMContentLoaded', function() {
    if (!dw3IsLogged()) {
        return;
    }

    var form = document.getElementById('frmAnimais');

    if (!form) {
        return;
    }

    var oper = form.dataset.oper;
    var servidor = form.dataset.servidor;
    var btnInserir = document.getElementById('btnInserirAnimal');
    var btnAtualizar = document.getElementById('btnAtualizarAnimal');

    // Não permite data de nascimento futura
    var hoje = new Date();
    hoje.setMinutes(hoje.getMinutes() - hoje.getTimezoneOffset());
    document.getElementById('datanasc').max = hoje.toISOString().slice(0, 10);

    if (oper === 'Cr') {
        dw3OcultarBotao('btnAtualizarAnimal');
        dw3OcultarBotao('btnRemoverAnimal');
    }

    if (oper === 'Re') {
        dw3OcultarBotao('btnInserirAnimal');
        dw3OcultarBotao('btnAtualizarAnimal');
        dw3OcultarBotao('btnRemoverAnimal');
        dw3DesabilitarCampos('frmAnimais');
        vwGetAnimalByID();
    }

    if (oper === 'Up') {
        dw3OcultarBotao('btnInserirAnimal');
        dw3OcultarBotao('btnRemoverAnimal');
        btnAtualizar.disabled = true;
        vwGetAnimalByID().then(function(carregado) {
            btnAtualizar.disabled = !carregado;
        });
        btnAtualizar.addEventListener('click', function() {
            vwUpdateAnimal();
        });
    }

    if (oper === 'De') {
        dw3OcultarBotao('btnInserirAnimal');
        dw3OcultarBotao('btnAtualizarAnimal');
        dw3DesabilitarCampos('frmAnimais');
        var btnRemover = document.getElementById('btnRemoverAnimal');
        btnRemover.disabled = true;
        vwGetAnimalByID().then(function(carregado) {
            btnRemover.disabled = !carregado;
        });
        btnRemover.addEventListener('click', function() {
            vwDeleteAnimal();
        });
    }


    if (btnInserir) {
        btnInserir.addEventListener('click', function() {
            vwInsertAnimal();
        });
    }
});

async function vwGetAnimalByID() {
  var form = document.getElementById('frmAnimais');

  try {
    var parametros = new URLSearchParams(window.location.search);
    var animalId = parametros.get('animalId');
    var servidor = form.dataset.servidor;

    if (!animalId || !/^\d+$/.test(animalId) || Number(animalId) <= 0) {
      throw new Error('ID do animal inválido.');
    }

    if (!servidor) {
      throw new Error('Endereço do servidor backend não configurado.');
    }

    var response = await fetch(servidor + '/getAnimalByID/' + encodeURIComponent(animalId), {
      headers: dw3MontarHeadersAutenticacao({
        'content-type': 'application/json'
      })
    });

    if (!response.ok) {
      throw new Error('Não foi possível carregar o animal.');
    }

    var data = await response.json();

    if (data.auth === false) {
      throw new Error(data.message || 'Sessão expirada. Faça login novamente.');
    }

    if (data.status !== 'ok') {
      throw new Error('Resposta inválida do servidor backend.');
    }

    var animal = Array.isArray(data.registro) ? data.registro[0] : data.registro;

    if (!animal) {
      throw new Error('Animal não encontrado.');
    }

    document.getElementById('animalid').value = animal.animalid;
    document.getElementById('nome').value = animal.nome ?? '';
    document.getElementById('datanasc').value = animal.datanasc ? animal.datanasc.slice(0, 10) : '';
    document.getElementById('removido').value = String(animal.removido === true);

    return true;
  } catch (error) {
    alert(error.message || 'Erro ao carregar animal.');
    return false;
  }
}

async function vwInsertAnimal() {
    var form = document.getElementById('frmAnimais');
    var btnInserir = document.getElementById('btnInserirAnimal');

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

        var response = await fetch(servidor + '/insertAnimal', {
            method: 'POST',
            headers: dw3MontarHeadersAutenticacao({'content-type': 'application/json'}),
            body: JSON.stringify(montarAnimalDoFormulario())
        });

        if (!response.ok) {
            throw new Error('Não foi possível inserir o animal.');
        }

        var data = await response.json();
        if (data.auth === false) {
            throw new Error(data.message || 'Sessão expirada. Faça login novamente.');
        }
        if (data.status !== 'ok') {
            throw new Error(data.status || 'Não foi possível inserir o animal.');
        }

        window.location.href = '/animais';
    } catch (error) {
        alert(error.message || 'Erro ao inserir animal.');
    } finally {
        if (btnInserir) {
            btnInserir.disabled = false;
        }
    }
}

async function vwUpdateAnimal() {
    var form = document.getElementById('frmAnimais');
    var btnAtualizar = document.getElementById('btnAtualizarAnimal');

    if (btnAtualizar.disabled || !form.reportValidity()) {
        return;
    }

    try {
        var animalId = new URLSearchParams(window.location.search).get('animalId');
        var servidor = form.dataset.servidor;

        if (!animalId || !/^\d+$/.test(animalId) || Number(animalId) <= 0) {
            throw new Error('ID do animal inválido.');
        }

        if (!servidor) {
            throw new Error('Endereço do servidor backend não configurado.');
        }

        btnAtualizar.disabled = true;

        var animal = montarAnimalDoFormulario();

        var response = await fetch(servidor + '/updateAnimal/' + encodeURIComponent(animalId), {
            method: 'PUT',
            headers: dw3MontarHeadersAutenticacao({
                'content-type': 'application/json'
            }),
            body: JSON.stringify(animal)
        });

        if (!response.ok) {
            throw new Error('Não foi possível atualizar o animal.');
        }

        var data = await response.json();
        if (data.auth === false) {
            throw new Error(data.message || 'Sessão expirada. Faça login novamente.');
        }
        if (data.status !== 'ok') {
            throw new Error(data.status || 'Não foi possível atualizar o animal.');
        }
        if (data.linhasAfetadas !== 1) {
            throw new Error('Nenhum animal foi atualizado.');
        }
        alert('Animal atualizado com sucesso.');
    } catch (error) {
        alert(error.message || 'Erro ao atualizar animal.');
    } finally {
        btnAtualizar.disabled = false;
    }
}

async function vwDeleteAnimal() {
    var form = document.getElementById('frmAnimais');
    var btnRemover = document.getElementById('btnRemoverAnimal');

    if (btnRemover.disabled) {
        return;
    }
    if (!window.confirm('Confirma a remoção deste animal?')) {
        return;
    }

    try {
        var animalId = document.getElementById('animalid').value;
        var servidor = form.dataset.servidor;

        if (!animalId || !/^\d+$/.test(animalId) || Number(animalId) <= 0) {
            throw new Error('ID do animal inválido.');
        }
        if (!servidor) {
            throw new Error('Endereço do servidor backend não configurado.');
        }

        btnRemover.disabled = true;

        var response = await fetch(servidor + '/deleteAnimal/' + encodeURIComponent(animalId), {
            method: 'DELETE',
            headers: dw3MontarHeadersAutenticacao()
        });

        if (!response.ok) {
            throw new Error('Não foi possível remover o animal.');
        }

        var data = await response.json();

        if (data.auth === false) {
            throw new Error(data.message || 'Sessão expirada. Faça login novamente.');
        }
        if (data.status !== 'ok') {
            throw new Error(data.status || 'Não foi possível remover o animal.');
        }
        if (data.linhasAfetadas !== 1) {
            throw new Error('Nenhum animal foi removido.');
        }

        window.location.href = '/animais';
    } catch (error) {
        alert(error.message || 'Erro ao remover animal.');
    } finally {
        btnRemover.disabled = false;
    }
}

function montarAnimalDoFormulario() {
    return {
        nome: document.getElementById('nome').value,
        datanasc: document.getElementById('datanasc').value,
        removido: document.getElementById('removido').value === 'true'
    };
}
