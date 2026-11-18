document.addEventListener('DOMContentLoaded', function() {
    if (!dw3IsLogged()) {
        return;
    }

    var listagem = document.getElementById('alocadosListagem');
    var alertBox = document.getElementById('alocadosAlert');

    if (!listagem) {
        return;
    }

    var servidor = listagem.dataset.servidor;

    configurarOperacoesAlocados(alertBox);
    carregarAlocados(servidor, alertBox);
});

async function carregarAlocados(servidor, alertBox) {
    try {
        if (!servidor) {
            throw new Error('Endereço do servidor backend não configurado.');
        }

        var response = await fetch(servidor + '/getAllAlocados', {
            headers: dw3MontarHeadersAutenticacao()
        });

        if (!response.ok) {
            throw new Error('Não foi possível carregar a lista de alocações.');
        }

        var data = await response.json();

        if (data.auth === false) {
            throw new Error(data.message || 'Sessão expirada. Faça login novamente.');
        }

        if (data.status !== 'ok' || !Array.isArray(data.registro)) {
            throw new Error('Resposta inválida do servidor backend.');
        }

        inicializarTabelaAlocados(data.registro);
    } catch (error) {
        exibirErro(alertBox, error.message || 'Erro ao carregar alocações.');
        inicializarTabelaAlocados([]);
    }
}

function inicializarTabelaAlocados(alocados) {
    new DataTable('#tblAlocados', {
        data: alocados,
        columns: [
            { data: 'alocadoid', defaultContent: '' },
            { data: 'animalnome', defaultContent: '' },
            { data: 'piquetedescricao', defaultContent: '' },
            {
                data: 'datainicio',
                defaultContent: '',
                render: renderizarData
            },
            {
                data: 'datafinal',
                defaultContent: '',
                render: renderizarData
            },
            {
                data: 'datafinal',
                defaultContent: '',
                render: function(data, type) {
                    var emAndamento = !data;

                    if (type !== 'display') {
                        return emAndamento ? 'Em andamento' : 'Encerrada';
                    }
                    return emAndamento
                        ? '<span class="badge text-bg-success">Em andamento</span>'
                        : '<span class="badge text-bg-secondary">Encerrada</span>';
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
                    var alocadoId = escaparHtml(row.alocadoid || '');
                    return [
                    '<div class="btn-group btn-group-sm" role="group" aria-label="Operações da alocação">',
                    '<button class="btn btn-outline-primary" type="button" data-action="visualizar" data-alocadoid="' + alocadoId + '" title="Visualizar" aria-label="Visualizar"><i class="bi bi-eye"></i></button>',
                    '<button class="btn btn-outline-secondary" type="button" data-action="atualizar" data-alocadoid="' + alocadoId + '" title="Atualizar" aria-label="Atualizar"><i class="bi bi-pencil-square"></i></button>',
                    '<button class="btn btn-outline-danger" type="button" data-action="remover" data-alocadoid="' + alocadoId + '" title="Remover" aria-label="Remover"><i class="bi bi-trash"></i></button>',
                    '</div>'
                    ].join('');
                }
            }
        ],
        language: {
            emptyTable: 'Nenhuma alocação cadastrada.',
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

function renderizarData(data, type) {
    if (!data) {
        return '';
    }
    if (type !== 'display') {
        return data;
    }
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
}

function configurarOperacoesAlocados(alertBox) {
    var tabela = document.getElementById('tblAlocados');

    if (!tabela) {
        return;
    }

    tabela.addEventListener('click', function(event) {
        var botao = event.target.closest('button[data-action][data-alocadoid]');

        if (!botao) {
            return;
        }

        var action = botao.dataset.action;
        var alocadoId = botao.dataset.alocadoid;

        if (action === 'visualizar') {
            window.location.href = '/alocados/form?oper=Re&alocadoId=' + encodeURIComponent(alocadoId);
            return;
        }

        if (action === 'atualizar') {
            window.location.href = '/alocados/form?oper=Up&alocadoId=' + encodeURIComponent(alocadoId);
            return;
        }


        if (action === 'remover') {
            if (confirm('Confirma a remoção da alocação ' + alocadoId + '?')) {
                window.location.href = '/alocados/form?oper=De&alocadoId=' + encodeURIComponent(alocadoId);
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
