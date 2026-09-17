const uploadForm = document.getElementById("upload-form");
const uploadProgress = document.getElementById("upload-progress");
const uploadProgressBar = document.getElementById("upload-progress-bar");
const uploadStatus = document.getElementById("upload-status");
const fileList = document.getElementById("file-list");


function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
}


function formatFileSize(bytes) {
    if (bytes === 0) {
        return "0 Bytes";
    }

    const units = ["Bytes", "KB", "MB", "GB", "TB"];
    const index = Math.floor(Math.log(bytes) / Math.log(1024));

    return `${(bytes / Math.pow(1024, index)).toFixed(2)} ${units[index]}`;
}


function createFileCard(file) {
    const card = document.createElement("div");
    card.className = "file-item";

    const isImage = file.content_type.startsWith("image/");

    card.innerHTML = `
        ${
            isImage
                ? `
                    <img
                        class="preview"
                        src="${escapeHtml(file.url)}"
                        alt="${escapeHtml(file.original_name)}"
                    >
                `
                : ""
        }

        <div class="file-info">

            <div class="file-name">
                ${escapeHtml(file.original_name)}
            </div>

            <div class="file-meta">
                ${formatFileSize(file.size)}
                ·
                ${escapeHtml(file.content_type)}
            </div>

            <a
                class="open-link"
                href="${escapeHtml(file.url)}"
                target="_blank"
            >
                Abrir
            </a>

        </div>
    `;

    return card;
}


uploadForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(uploadForm);
    const xhr = new XMLHttpRequest();

    xhr.open("POST", uploadForm.action);
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

    uploadProgress.hidden = false;
    uploadProgressBar.value = 0;
    uploadStatus.textContent = "Preparando subida...";

    xhr.upload.addEventListener("progress", function (event) {
        if (!event.lengthComputable) {
            return;
        }

        const percentage = Math.round(
            (event.loaded / event.total) * 100
        );

        uploadProgressBar.value = percentage;
        uploadStatus.textContent = `Subiendo archivos: ${percentage}%`;
    });

    xhr.addEventListener("load", function () {
        let response;

        try {
            response = JSON.parse(xhr.responseText);
        } catch {
            uploadStatus.textContent =
                "❌ Error al procesar la respuesta del servidor.";
            return;
        }

        if (xhr.status >= 200 && xhr.status < 300) {
            uploadProgressBar.value = 100;

            if (!response.success) {
                uploadStatus.textContent = `❌ ${response.message}`;
                return;
            }

            uploadStatus.textContent = `✅ ${response.message}`;

            response.files.forEach(function (file) {
                const card = createFileCard(file);
                fileList.prepend(card);
            });

            uploadForm.reset();

            return;
        }

        uploadStatus.textContent = `❌ ${response.message}`;
    });

    xhr.addEventListener("error", function () {
        uploadStatus.textContent =
            "❌ No se pudo conectar con el servidor.";
    });

    xhr.send(formData);
});