document.addEventListener('DOMContentLoaded', function() {
    if (!dw3IsLogged()) {
        return;
    }

    var listagem = document.getElementById('animaisListagem');
    var alertBox = document.getElementById('animaisAlert');

    if (!listagem) {
        return;
    }

    var servidor = listagem.dataset.servidor;

    configurarOperacoesAnimais(alertBox);
    carregarAnimais(servidor, alertBox);
});

async function carregarAnimais(servidor, alertBox) {
    try {
        if (!servidor) {
            throw new Error('Endereço do servidor backend não configurado.');
        }

        var response = await fetch(servidor + '/getAllAnimais', {
            headers: dw3MontarHeadersAutenticacao()
        });

        if (!response.ok) {
            throw new Error('Não foi possível carregar a lista de animais.');
        }

        var data = await response.json();

        if (data.auth === false) {
            throw new Error(data.message || 'Sessão expirada. Faça login novamente.');
        }

        if (data.status !== 'ok' || !Array.isArray(data.registro)) {
            throw new Error('Resposta inválida do servidor backend.');
        }

        inicializarTabelaAnimais(data.registro);
    } catch (error) {
        exibirErro(alertBox, error.message || 'Erro ao carregar animais.');
        inicializarTabelaAnimais([]);
    }
}

function inicializarTabelaAnimais(animais) {
    new DataTable('#tblAnimais', {
        data: animais,
        columns: [
            { data: 'animalid', defaultContent: '' },
            { data: 'nome', defaultContent: '' },
            {
                data: 'datanasc',
                defaultContent: '',
                render: function(data, type) {
                    if (!data) {
                        return '';
                    }
                    if (type !== 'display') {
                        return data;
                    }
                    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
                }
            },
            {
                data: null,
                orderable: false,
                searchable: false,
                render: function(data, type, row) {
                    if (type !== 'display') {
                        return '';
                    }
                    var animalId = escaparHtml(row.animalid || '');
                    return [
                    '<div class="btn-group btn-group-sm" role="group" aria-label="Operações do animal">',
                    '<button class="btn btn-outline-primary" type="button" data-action="visualizar" data-animalid="' + animalId + '" title="Visualizar" aria-label="Visualizar"><i class="bi bi-eye"></i></button>',
                    '<button class="btn btn-outline-secondary" type="button" data-action="atualizar" data-animalid="' + animalId + '" title="Atualizar" aria-label="Atualizar"><i class="bi bi-pencil-square"></i></button>',
                    '<button class="btn btn-outline-danger" type="button" data-action="remover" data-animalid="' + animalId + '" title="Remover" aria-label="Remover"><i class="bi bi-trash"></i></button>',
                    '</div>'
                    ].join('');
                }
            }
        ],
        language: {
            emptyTable: 'Nenhum animal cadastrado.',
            info: 'Mostrando _START_ até _END_ de _TOTAL_ registros',
            infoEmpty: 'Mostrando 0 até 0 de 0 registros',
            infoFiltered: '(filtrado de _MAX_ registros no total)',
            lengthMenu: 'Mostrar _MENU_ registros',
            loadingRecords: 'Carregando...',
            processing: 'Processando...',
            search: 'Pesquisar:',
            zeroRecords: 'Nenhum registro encontrado',
            paginate: {
                first: 'Primeiro',
                last: 'Último',
                next: 'Próximo',
                previous: 'Anterior'
            }
        }
    });
}

function configurarOperacoesAnimais(alertBox) {
    var tabela = document.getElementById('tblAnimais');

    if (!tabela) {
        return;
    }

    tabela.addEventListener('click', function(event) {
        var botao = event.target.closest('button[data-action][data-animalid]');

        if (!botao) {
            return;
        }

        var action = botao.dataset.action;
        var animalId = botao.dataset.animalid;

        if (action === 'visualizar') {
            window.location.href = '/animais/form?oper=Re&animalId=' + encodeURIComponent(animalId);
            return;
        }

        if (action === 'atualizar') {
            window.location.href = '/animais/form?oper=Up&animalId=' + encodeURIComponent(animalId);
            return;
        }


        if (action === 'remover') {
            if (confirm('Confirma a remoção do animal ' + animalId + '?')) {
                window.location.href = '/animais/form?oper=De&animalId=' + encodeURIComponent(animalId);
            }
        }

    });
}

function exibirAviso(alertBox, mensagem) {
    if (!alertBox) {
        return;
    }

    alertBox.textContent = mensagem;
    alertBox.classList.remove('alert-danger');
    alertBox.classList.add('alert-info');
    alertBox.classList.remove('d-none');
}

function escaparHtml(valor) {
    return String(valor).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function exibirErro(alertBox, mensagem) {
    if (!alertBox) {
        return;
    }

    alertBox.textContent = mensagem;
    alertBox.classList.remove('alert-info');
    alertBox.classList.add('alert-danger');
    alertBox.classList.remove('d-none');
}
