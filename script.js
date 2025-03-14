// 引入jsPDF库
const script = document.createElement('script');
script.src = 'jspdf.umd.min.js';
document.head.appendChild(script);

// 获取DOM元素
const dropArea = document.getElementById('dropArea');
const fileInput = document.getElementById('fileInput');
const previewArea = document.getElementById('previewArea');
const generateBtn = document.getElementById('generateBtn');

// 存储上传的图片
let uploadedImages = [];

// 拖拽上传相关事件
dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.classList.add('dragover');
});

dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('dragover');
});

dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFiles(files);
    }
});

// 点击上传
dropArea.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFiles(e.target.files);
    }
});

// 处理上传的文件
function handleFiles(files) {
    const validFiles = Array.from(files).filter(file => {
        if (!file.type.startsWith('image/')) {
            alert('请上传图片文件！');
            return false;
        }
        return true;
    });

    if (validFiles.length === 0) {
        alert('请至少上传一个有效的图片文件！');
        return;
    }

    validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = {
                data: e.target.result,
                file: file
            };
            uploadedImages.push(imageData);
            createPreviewItem(imageData);
            updateGenerateButton();
        };
        reader.readAsDataURL(file);
    });
}

// 创建预览元素
function createPreviewItem(imageData) {
    const previewItem = document.createElement('div');
    previewItem.className = 'preview-item';

    const img = document.createElement('img');
    img.src = imageData.data;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.innerHTML = '×';
    removeBtn.onclick = () => {
        previewItem.remove();
        uploadedImages = uploadedImages.filter(img => img !== imageData);
        updateGenerateButton();
    };

    previewItem.appendChild(img);
    previewItem.appendChild(removeBtn);
    previewArea.appendChild(previewItem);
}

// 更新生成按钮状态
function updateGenerateButton() {
    generateBtn.disabled = uploadedImages.length === 0;
}

// 生成PDF
generateBtn.addEventListener('click', async () => {
    if (uploadedImages.length === 0) return;

    const { jsPDF } = window.jspdf;
    // 使用A4纸张尺寸，单位为毫米
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });
    let currentPage = 0;

    for (const imageData of uploadedImages) {
        if (currentPage > 0) {
            doc.addPage();
        }

        // 获取图片尺寸
        const img = new Image();
        img.src = imageData.data;
        await new Promise(resolve => {
            img.onload = resolve;
        });

        // 获取A4页面尺寸（210mm x 297mm）
        const pageWidth = 210;
        const pageHeight = 297;
        const imgRatio = img.width / img.height;
        const pageRatio = pageWidth / pageHeight;

        // 计算最佳缩放比例
        let imgWidth, imgHeight;
        if (imgRatio > pageRatio) {
            // 图片较宽，以页面宽度为基准
            imgWidth = pageWidth;
            imgHeight = pageWidth / imgRatio;
        } else {
            // 图片较高，以页面高度为基准
            imgHeight = pageHeight;
            imgWidth = pageHeight * imgRatio;
        }

        // 居中显示
        const x = (pageWidth - imgWidth) / 2;
        const y = (pageHeight - imgHeight) / 2;

        doc.addImage(imageData.data, 'JPEG', x, y, imgWidth, imgHeight);
        currentPage++;
    }

    // 下载PDF
    doc.save('converted_images.pdf');
});