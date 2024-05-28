document.addEventListener('DOMContentLoaded', function() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const rowCheckboxes = document.querySelectorAll('.select-row');
    const deleteForm = document.getElementById('deleteForm');
    const selectedIdsInput = document.getElementById('selectedIds');
    const filterBtn = document.getElementById('filterBtn');
    const filterModal = document.getElementById('filterModal');
    const filterAZBtn = document.getElementById('filterAZBtn');
    const filterNumBtn = document.getElementById('filterNumBtn');
    const roomRows = document.querySelectorAll('.student-table tbody tr');

    // Função para atualizar o estado do checkbox "Select All"
    function updateSelectAllState() {
        const allChecked = Array.from(rowCheckboxes).every(checkbox => checkbox.checked);
        selectAllCheckbox.checked = allChecked;
    }

    selectAllCheckbox.addEventListener('change', function() {
        rowCheckboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
        });
    });

    rowCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateSelectAllState();
        });
    });

    deleteForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const selectedIds = Array.from(rowCheckboxes)
                                .filter(checkbox => checkbox.checked)
                                .map(checkbox => checkbox.getAttribute('data-id'));

        if (selectedIds.length > 0) {
            selectedIdsInput.value = selectedIds.join(',');
            deleteForm.submit();
        } else {
            alert('Por favor, selecione pelo menos uma sala para excluir.');
        }
    });

    // Função para ordenar as salas em ordem alfabética
    function sortRoomsAlphabetically() {
        const sortedRooms = Array.from(roomRows).sort((a, b) => {
            const roomA = a.querySelector('td:nth-child(2)').textContent.toLowerCase();
            const roomB = b.querySelector('td:nth-child(2)').textContent.toLowerCase();
            return roomA.localeCompare(roomB);
        });

        const tbody = document.querySelector('.student-table tbody');
        tbody.innerHTML = ''; // Limpa o conteúdo atual
        sortedRooms.forEach(room => {
            tbody.appendChild(room);
        });
    }

    // Função para ordenar as salas em ordem numérica
    function sortRoomsNumerically() {
        const sortedRooms = Array.from(roomRows).sort((a, b) => {
            const roomA = parseInt(a.querySelector('td:nth-child(3)').textContent);
            const roomB = parseInt(b.querySelector('td:nth-child(3)').textContent);
            return roomA - roomB;
        });

        const tbody = document.querySelector('.student-table tbody');
        tbody.innerHTML = ''; // Limpa o conteúdo atual
        sortedRooms.forEach(room => {
            tbody.appendChild(room);
        });
    }

    // Código para a funcionalidade do modal de adição
    var modal = document.getElementById("addRoomModal");
    var btn = document.getElementById("addBtn");
    var span = document.getElementsByClassName("close")[0];
    var form = document.getElementById("addRoomForm");

    btn.onclick = function() {
        modal.style.display = "block";
    }

    span.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    form.onsubmit = function(event) {
        event.preventDefault();
        var formData = new FormData(form);

        fetch(form.action, {
            method: "POST",
            headers: {
                "X-CSRFToken": formData.get("csrfmiddlewaretoken"),
                "X-Requested-With": "XMLHttpRequest",
            },
            body: formData,
        }).then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return response.json().then(data => {
                    throw new Error(data.errors);
                });
            }
        }).then(data => {
            alert(data.message);
            modal.style.display = "none";
            window.location.reload();
        }).catch(error => {
            console.error("Erro:", error);
            alert("Erro ao adicionar a sala: " + error.message);
        });
    }

    // Código para mostrar e ocultar o modal de filtro ao clicar no botão "Filters"
    filterBtn.addEventListener('click', function() {
        if (filterModal.style.display === 'block') {
            filterModal.style.display = 'none';
        } else {
            filterModal.style.display = 'block';
        }
    });

    // Código para selecionar o tipo de filtro
    filterAZBtn.addEventListener('click', function() {
        sortRoomsAlphabetically();
        filterModal.style.display = 'none';
    });

    filterNumBtn.addEventListener('click', function() {
        sortRoomsNumerically();
        filterModal.style.display = 'none';
    });
});
