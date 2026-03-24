document.addEventListener('DOMContentLoaded', function() {
    function applyTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = t(key);
            if (translation) {
                element.textContent = translation;
            }
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = t(key);
            if (translation) {
                element.placeholder = translation;
            }
        });
    }

    applyTranslations();

    // 监听语言切换事件
    window.addEventListener('languageChanged', function(event) {
        console.log('Language changed to:', event.detail.lang);
        applyTranslations();

        // 更新结果区域的日期格式（如果显示了结果）
        const expiryDateElement = document.getElementById('expiryDate');
        if (expiryDateElement && expiryDateElement.textContent) {
            // 从存储的日期值重新格式化
            const storedDate = expiryDateElement.getAttribute('data-date');
            if (storedDate) {
                const lang = event.detail.lang;
                expiryDateElement.textContent = new Date(storedDate).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US');
            }
        }
    });

    const langSwitchBtn = document.getElementById('langSwitch');
    if (langSwitchBtn) {
        langSwitchBtn.addEventListener('click', function() {
            const currentLang = getCurrentLanguage();
            const newLang = currentLang === 'zh' ? 'en' : 'zh';
            setLanguage(newLang);
        });
    }

    const noteContent = document.getElementById('noteContent');
    const createBtn = document.getElementById('createBtn');
    const result = document.getElementById('result');
    const noteUrl = document.getElementById('noteUrl');
    const copyBtn = document.getElementById('copyBtn');
    const openBtn = document.getElementById('openBtn');
    const expiryDate = document.getElementById('expiryDate');

    const forbiddenWords = [
        '暴力',
        '色情',
        '赌博',
        '毒品',
        '诈骗',
        '黑客',
        '攻击',
        '炸弹',
        '恐怖',
        '极端',
        '邪教',
        '分裂',
        '颠覆',
        '反动',
        '违禁',
        '非法',
        '犯罪',
        '洗钱',
        '走私'
    ];

    function checkForbiddenWords(content) {
        const foundWords = [];
        console.log('检查违禁词，内容长度:', content.length);
        
        for (const word of forbiddenWords) {
            if (content.includes(word)) {
                foundWords.push(word);
                console.log('发现违禁词:', word);
            }
        }
        
        console.log('检查结果，找到的违禁词:', foundWords);
        return foundWords;
    }

    createBtn.addEventListener('click', async function() {
        const content = noteContent.value.trim();
        
        if (!content) {
            alert(t('editor.emptyAlert'));
            noteContent.focus();
            return;
        }

        const foundWords = checkForbiddenWords(content);
        if (foundWords.length > 0) {
            alert(t('editor.forbiddenAlert')(foundWords));
            noteContent.focus();
            return;
        }

        createBtn.disabled = true;
        createBtn.innerHTML = `<span class="btn-text">${t('editor.creating')}</span>`;

        try {
            const response = await fetch('/api/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '创建失败');
            }

            const data = await response.json();
            const fullUrl = window.location.origin + data.url;

            noteUrl.value = fullUrl;
            openBtn.href = fullUrl;

            // 保存日期数据以便语言切换时重新格式化
            const expiry = new Date(data.expiresAt);
            expiryDate.setAttribute('data-date', data.expiresAt);
            const lang = detectLanguage();
            expiryDate.textContent = expiry.toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US');

            result.classList.remove('hidden');
            noteContent.value = '';
        } catch (error) {
            console.error('Error creating note:', error);
            alert(t('editor.createFailed') + error.message);
        } finally {
            createBtn.disabled = false;
            createBtn.innerHTML = `<span class="btn-text">${t('editor.createBtn')}</span><span class="btn-icon">✨</span>`;
        }
    });

    copyBtn.addEventListener('click', async function() {
        try {
            await navigator.clipboard.writeText(noteUrl.value);
            copyBtn.textContent = t('editor.copied');
            setTimeout(() => {
                copyBtn.textContent = t('editor.copyBtn');
            }, 2000);
        } catch (error) {
            noteUrl.select();
            document.execCommand('copy');
            copyBtn.textContent = t('editor.copied');
            setTimeout(() => {
                copyBtn.textContent = t('editor.copyBtn');
            }, 2000);
        }
    });

    noteUrl.addEventListener('click', function() {
        this.select();
    });
});
