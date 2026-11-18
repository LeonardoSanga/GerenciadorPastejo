document.addEventListener('DOMContentLoaded', function() {
    if (!dw3IsLogged()) {
        return;
    }

    var listagem = document.getElementById('piquetesListagem');
    var alertBox = document.getElementById('piquetesAlert');

    if (!listagem) {
        return;
    }

    var servidor = listagem.dataset.servidor;

    configurarOperacoesPiquetes(alertBox);
    carregarPiquetes(servidor, alertBox);
});

async function carregarPiquetes(servidor, alertBox) {
    try {
        if (!servidor) {
            throw new Error('Endereço do servidor backend não configurado.');
        }

        var response = await fetch(servidor + '/getAllPiquetes', {
            headers: dw3MontarHeadersAutenticacao()
        });

        if (!response.ok) {
            throw new Error('Não foi possível carregar a lista de piquetes.');
        }

        var data = await response.json();

        if (data.auth === false) {
            throw new Error(data.message || 'Sessão expirada. Faça login novamente.');
        }

        if (data.status !== 'ok' || !Array.isArray(data.registro)) {
            throw new Error('Resposta inválida do servidor backend.');
        }

        inicializarTabelaPiquetes(data.registro);
    } catch (error) {
        exibirErro(alertBox, error.message || 'Erro ao carregar piquetes.');
        inicializarTabelaPiquetes([]);
    }
}

function inicializarTabelaPiquetes(piquetes) {
    new DataTable('#tblPiquetes', {
        data: piquetes,
        columns: [
            { data: 'piqueteid', defaultContent: '' },
            { data: 'descricao', defaultContent: '' },
            {
                data: 'latitude',
                defaultContent: '',
                render: renderizarCoordenada
            },
            {
                data: 'longitude',
                defaultContent: '',
                render: renderizarCoordenada
            },
            { data: 'pastodescricao', defaultContent: '' },
            {
                data: null,
                orderable: false,
                searchable: false,
                render: function(data, type, row) {
                    if (type !== 'display') {
                        return '';
                    }
                    var piqueteId = escaparHtml(row.piqueteid || '');
                    return [
                    '<div class="btn-group btn-group-sm" role="group" aria-label="Operações do piquete">',
                    '<button class="btn btn-outline-primary" type="button" data-action="visualizar" data-piqueteid="' + piqueteId + '" title="Visualizar" aria-label="Visualizar"><i class="bi bi-eye"></i></button>',
                    '<button class="btn btn-outline-secondary" type="button" data-action="atualizar" data-piqueteid="' + piqueteId + '" title="Atualizar" aria-label="Atualizar"><i class="bi bi-pencil-square"></i></button>',
                    '<button class="btn btn-outline-danger" type="button" data-action="remover" data-piqueteid="' + piqueteId + '" title="Remover" aria-label="Remover"><i class="bi bi-trash"></i></button>',
                    '</div>'
                    ].join('');
                }
            }
        ],
        language: {
            emptyTable: 'Nenhum piquete cadastrado.',
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

function renderizarCoordenada(data, type) {
    if (data === null || data === undefined || data === '') {
        return '';
    }
    if (type !== 'display') {
        return Number(data);
    }
    return Number(data).toLocaleString('pt-BR', {
        minimumFractionDigits: 6,
        maximumFractionDigits: 6
    });
}

function configurarOperacoesPiquetes(alertBox) {
    var tabela = document.getElementById('tblPiquetes');

    if (!tabela) {
        return;
    }

    tabela.addEventListener('click', function(event) {
        var botao = event.target.closest('button[data-action][data-piqueteid]');

        if (!botao) {
            return;
        }

        var action = botao.dataset.action;
        var piqueteId = botao.dataset.piqueteid;

        if (action === 'visualizar') {
            window.location.href = '/piquetes/form?oper=Re&piqueteId=' + encodeURIComponent(piqueteId);
            return;
        }

        if (action === 'atualizar') {
            window.location.href = '/piquetes/form?oper=Up&piqueteId=' + encodeURIComponent(piqueteId);
            return;
        }


        if (action === 'remover') {
            if (confirm('Confirma a remoção do piquete ' + piqueteId + '?')) {
                window.location.href = '/piquetes/form?oper=De&piqueteId=' + encodeURIComponent(piqueteId);
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
