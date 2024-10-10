document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const uploadButton = document.getElementById('uploadButton');
    const statusDiv = document.getElementById('status');

    const ACCESS_TOKEN = 'y0_AgAAAABvOsGVAADLWwAAAAET-vELAADJXC4hu2hNHbrLIbDxwpaPIyXNMw';

    async function uploadToYandexDisk(file) {
        const uploadUrl = 'https://cloud-api.yandex.net/v1/disk/resources/upload';
        const path = '/bot/' + file.name;

        try {
            await createFolder('bot');

            const getUploadUrlResponse = await fetch(`${uploadUrl}?path=${encodeURIComponent(path)}&overwrite=true`, {
                method: 'GET',
                headers: {
                    'Authorization': `OAuth ${ACCESS_TOKEN}`
                }
            });

            if (!getUploadUrlResponse.ok) {
                const errorData = await getUploadUrlResponse.json();
                console.error('Ошибка при получении URL для загрузки:', errorData);
                throw new Error(`Не удалось получить URL для загрузки: ${getUploadUrlResponse.status} ${getUploadUrlResponse.statusText}`);
            }

            const { href } = await getUploadUrlResponse.json();

            const uploadResponse = await fetch(href, {
                method: 'PUT',
                headers: {
                    'Content-Type': file.type
                },
                body: file
            });

            if (!uploadResponse.ok) {
                throw new Error(`Не удалось загрузить файл: ${uploadResponse.status} ${uploadResponse.statusText}`);
            }

            return `Файл ${file.name} успешно загружен для обработки ботом`;
        } catch (error) {
            console.error('Ошибка в процессе загрузки:', error);
            throw error;
        }
    }

    async function createFolder(folderName) {
        const createFolderUrl = 'https://cloud-api.yandex.net/v1/disk/resources';
        try {
            const response = await fetch(`${createFolderUrl}?path=${encodeURIComponent('/' + folderName)}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `OAuth ${ACCESS_TOKEN}`
                }
            });

            if (!response.ok && response.status !== 409) {
                const errorData = await response.json();
                console.error('Ошибка при создании папки:', errorData);
                throw new Error(`Не удалось создать папку: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.error('Ошибка при создании папки:', error);
            throw error;
        }
    }

    uploadButton.addEventListener('click', async () => {
        const files = fileInput.files;
        console.log('Выбрано файлов:', files.length);  // Отладочная информация
        
        if (files.length === 0) {
            statusDiv.textContent = 'Пожалуйста, выберите файлы';
            return;
        }

        statusDiv.textContent = 'Загрузка...';

        const results = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                console.log(`Загрузка файла ${i + 1}/${files.length}: ${file.name} (${file.type || 'неизвестный тип'})`);  // Отладочная информация
                const result = await uploadToYandexDisk(file);
                results.push(result);
                statusDiv.textContent = `Загружено ${i + 1} из ${files.length} файлов`;
            } catch (error) {
                console.error(`Ошибка при загрузке файла ${file.name}:`, error);
                results.push(`Ошибка при загрузке файла ${file.name}: ${error.message}`);
            }
        }

        statusDiv.innerHTML = results.join('<br>');
    });
});
