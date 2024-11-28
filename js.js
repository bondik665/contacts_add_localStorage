document.querySelector('.btn-2').addEventListener('click', function() {
    document.getElementById('sidebarGroups').classList.add('open');
    document.getElementById('overlay').classList.add('open');
    updateGroupList();
});

document.querySelector('.btn-1').addEventListener('click', function() {
    document.getElementById('sidebarAddContact').classList.add('open');
    document.getElementById('overlay').classList.add('open');
});

document.getElementById('overlay').addEventListener('click', function() {
    document.getElementById('sidebarGroups').classList.remove('open');
    document.getElementById('sidebarAddContact').classList.remove('open');
    document.getElementById('editContactModal').classList.remove('open');
    document.getElementById('overlay').classList.remove('open');
});

document.querySelectorAll('.btn-close').forEach(function(button) {
    button.addEventListener('click', function() {
        const target = this.getAttribute('data-target');
        closeSidebar(target);
    });
});

function closeSidebar(target) {
    document.getElementById(target).classList.remove('open');
    document.getElementById('overlay').classList.remove('open');
}

// Логика для добавления контакта
document.getElementById('contactForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const group = document.getElementById('group').value;

    if (name && phone) {
        const contacts = JSON.parse(localStorage.getItem('contacts')) || [];
        contacts.push({ name, phone, group });
        localStorage.setItem('contacts', JSON.stringify(contacts));
        updateContactList();
        updateEmptyMessage();
        closeSidebar('sidebarAddContact');
    }
});

// Логика для добавления группы
document.querySelector('#sidebarGroups .btn-add').addEventListener('click', function() {
    document.getElementById('groupInput').classList.add('open');
});

// Логика для сохранения группы
document.querySelector('#sidebarGroups .btn-save').addEventListener('click', function() {
    const groupName = document.getElementById('groupNameInput').value;
    if (groupName) {
        const groups = JSON.parse(localStorage.getItem('groups')) || [];
        const lowerCaseGroupName = groupName.toLowerCase();
        const groupExists = groups.some(group => group.name.toLowerCase() === lowerCaseGroupName);

        if (!groupExists) {
            groups.push({ name: groupName });
            localStorage.setItem('groups', JSON.stringify(groups));
            updateEmptyMessage();
            updateGroupFilter();
            updateGroupList();
            document.getElementById('groupNameInput').value = '';
            document.getElementById('groupInput').classList.remove('open');

            // Передача значения группы в форму для добавления контакта
            document.getElementById('group').value = groupName;
        } else {
            alert('Группа с таким именем уже существует!');
        }
    }
});

// Логика для удаления группы
document.querySelector('#sidebarGroups .btn-delete').addEventListener('click', function() {
    const groups = JSON.parse(localStorage.getItem('groups')) || [];
    if (groups.length > 0) {
        const groupName = groups.pop().name; // Удаляем последнюю добавленную группу
        localStorage.setItem('groups', JSON.stringify(groups));
        updateEmptyMessage();
        updateGroupFilter();
        reassignContactsToNoGroup(groupName);
        updateGroupList();
    }
});

// Логика для очистки поля ввода имени группы
document.querySelector('#groupInput .btn-delete').addEventListener('click', function() {
    document.getElementById('groupNameInput').value = '';
});

// Логика для очистки localStorage
document.querySelector('.btn-clear-storage').addEventListener('click', function() {
    localStorage.clear();
    updateEmptyMessage();
    updateContactList();
    updateGroupFilter();
    updateGroupList();
});

// Логика для бургер-меню
document.querySelector('.menu-toggle').addEventListener('click', function() {
    document.querySelector('.buttons').classList.toggle('open');
});

function updateEmptyMessage() {
    const contacts = JSON.parse(localStorage.getItem('contacts')) || [];
    const groups = JSON.parse(localStorage.getItem('groups')) || [];
    const emptyMessage = document.getElementById('emptyMessage');

    if (contacts.length === 0 && groups.length === 0) {
        emptyMessage.innerText = 'Список контактов пуст';
    } else {
        emptyMessage.innerText = `Контактов: ${contacts.length}, Групп: ${groups.length}`;
    }
}

function updateContactList() {
    const contacts = JSON.parse(localStorage.getItem('contacts')) || [];
    const contactList = document.getElementById('contactList');
    contactList.innerHTML = '';

    const selectedGroup = document.getElementById('groupFilter').value;

    contacts.forEach(function(contact, index) {
        if (selectedGroup === '' || contact.group === selectedGroup || (selectedGroup === 'Без группы' && !contact.group)) {
            const li = document.createElement('li');
            const phoneLink = document.createElement('a');
            phoneLink.href = `tel:${contact.phone}`;
            phoneLink.textContent = contact.phone;
            phoneLink.style.color = '#007bff';
            phoneLink.style.textDecoration = 'none';
            phoneLink.style.marginRight = '10px';

            li.textContent = `${contact.name} - `;
            li.appendChild(phoneLink);
            li.append(` (${contact.group || 'Без группы'})`);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Удалить';
            deleteButton.addEventListener('click', function() {
                deleteContact(index);
            });
            li.appendChild(deleteButton);

            const editButton = document.createElement('button');
            editButton.textContent = 'Редактировать';
            editButton.addEventListener('click', function() {
                openEditModal(index);
            });
            li.appendChild(editButton);

            contactList.appendChild(li);
        }
    });
}

function deleteContact(index) {
    const contacts = JSON.parse(localStorage.getItem('contacts')) || [];
    contacts.splice(index, 1);
    localStorage.setItem('contacts', JSON.stringify(contacts));
    updateContactList();
    updateEmptyMessage();
}

function reassignContactsToNoGroup(groupName) {
    const contacts = JSON.parse(localStorage.getItem('contacts')) || [];
    contacts.forEach(contact => {
        if (contact.group === groupName) {
            contact.group = '';
        }
    });
    localStorage.setItem('contacts', JSON.stringify(contacts));
    updateContactList();
    updateEmptyMessage();
}

function updateGroupFilter() {
    const groups = JSON.parse(localStorage.getItem('groups')) || [];
    const groupFilter = document.getElementById('groupFilter');
    groupFilter.innerHTML = '<option value="">Все группы</option>';

    // Добавляем опцию "Без группы"
    const noGroupOption = document.createElement('option');
    noGroupOption.value = 'Без группы';
    noGroupOption.textContent = 'Без группы';
    groupFilter.appendChild(noGroupOption);

    groups.forEach(function(group) {
        const option = document.createElement('option');
        option.value = group.name;
        option.textContent = group.name;
        groupFilter.appendChild(option);
    });

    groupFilter.addEventListener('change', function() {
        updateContactList();
    });
}

function updateGroupList() {
    const groups = JSON.parse(localStorage.getItem('groups')) || [];
    const groupList = document.getElementById('groupList');
    groupList.innerHTML = '';

    groups.forEach(function(group, index) {
        const li = document.createElement('li');
        li.textContent = group.name;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Удалить';
        deleteButton.addEventListener('click', function() {
            deleteGroup(index);
        });
        li.appendChild(deleteButton);
        groupList.appendChild(li);
    });
}

function deleteGroup(index) {
    const groups = JSON.parse(localStorage.getItem('groups')) || [];
    const groupName = groups[index].name;
    groups.splice(index, 1);
    localStorage.setItem('groups', JSON.stringify(groups));
    updateEmptyMessage();
    updateGroupFilter();
    reassignContactsToNoGroup(groupName);
    updateGroupList();
}

function openEditModal(index) {
    const contacts = JSON.parse(localStorage.getItem('contacts')) || [];
    const contact = contacts[index];

    document.getElementById('editName').value = contact.name;
    document.getElementById('editPhone').value = contact.phone;
    document.getElementById('editGroup').value = contact.group || '';

    document.getElementById('editContactModal').classList.add('open');
    document.getElementById('overlay').classList.add('open');

    document.getElementById('editContactForm').onsubmit = function(event) {
        event.preventDefault();
        const name = document.getElementById('editName').value;
        const phone = document.getElementById('editPhone').value;
        const group = document.getElementById('editGroup').value;

        if (name && phone) {
            contacts[index] = { name, phone, group };
            localStorage.setItem('contacts', JSON.stringify(contacts));
            updateContactList();
            updateEmptyMessage();
            closeSidebar('editContactModal');
        }
    };

    document.getElementById('cancelEdit').addEventListener('click', function() {
        closeSidebar('editContactModal');
    });
}

// Инициализация сообщения при загрузке страницы
updateEmptyMessage();
updateContactList();
updateGroupFilter();
updateGroupList();