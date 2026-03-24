const translations = {
    zh: {
        title: 'WebNote',
        subtitle: '快速、安全的在线记事本',
        features: {
            simple: {
                title: '简单易用',
                description: '无需注册，直接开始记录'
            },
            temporary: {
                title: '临时存储',
                description: '笔记自动保存7天'
            },
            share: {
                title: '分享链接',
                description: '一键生成分享地址'
            }
        },
        editor: {
            placeholder: '在这里输入您的笔记内容...',
            createBtn: '创建笔记',
            creating: '创建中...',
            emptyAlert: '请输入笔记内容',
            forbiddenAlert: (words) => `您的笔记包含以下违禁词：\n${words.join('、')}\n\n请修改后重新提交。`,
            successTitle: '笔记创建成功！',
            expiryText: '您的笔记将在',
            expiresAt: '过期',
            copyBtn: '复制链接',
            copied: '已复制!',
            openNote: '点击打开笔记 →',
            createFailed: '创建笔记失败: '
        },
        note: {
            backToHome: '← 返回首页',
            loading: '加载中...',
            loadFailed: '笔记加载失败',
            noteContent: '笔记内容',
            createdAt: '创建时间',
            expiresAt: '过期时间',
            copyContent: '复制内容',
            copied: '已复制!'
        },
        errors: {
            expired: {
                icon: '⏰',
                title: '笔记已过期',
                message: '很抱歉，您访问的笔记已经过期并被删除。<br>所有笔记在创建后7天自动过期。',
                createNew: '创建新笔记'
            },
            notFound: {
                icon: '🔍',
                title: '笔记未找到',
                message: '很抱歉，您访问的笔记不存在或已被删除。<br>请检查链接是否正确，或者创建一个新笔记。',
                createNew: '创建新笔记'
            }
        },
        footer: 'WebNote - 您的临时记事本',
        langSwitch: 'English'
    },
    en: {
        title: 'WebNote',
        subtitle: 'Fast and secure online notepad',
        features: {
            simple: {
                title: 'Simple to Use',
                description: 'No registration required, start writing immediately'
            },
            temporary: {
                title: 'Temporary Storage',
                description: 'Notes are automatically saved for 7 days'
            },
            share: {
                title: 'Share Links',
                description: 'Generate shareable links with one click'
            }
        },
        editor: {
            placeholder: 'Enter your note content here...',
            createBtn: 'Create Note',
            creating: 'Creating...',
            emptyAlert: 'Please enter note content',
            forbiddenAlert: (words) => `Your note contains the following forbidden words:\n${words.join(', ')}\n\nPlease modify and resubmit.`,
            successTitle: 'Note created successfully!',
            expiryText: 'Your note will expire on',
            expiresAt: '',
            copyBtn: 'Copy Link',
            copied: 'Copied!',
            openNote: 'Click to open note →',
            createFailed: 'Failed to create note: '
        },
        note: {
            backToHome: '← Back to Home',
            loading: 'Loading...',
            loadFailed: 'Failed to load note',
            noteContent: 'Note Content',
            createdAt: 'Created at',
            expiresAt: 'Expires at',
            copyContent: 'Copy Content',
            copied: 'Copied!'
        },
        errors: {
            expired: {
                icon: '⏰',
                title: 'Note Expired',
                message: 'Sorry, the note you are trying to access has expired and been deleted.<br>All notes automatically expire 7 days after creation.',
                createNew: 'Create New Note'
            },
            notfound: {
                icon: '🔍',
                title: 'Note Not Found',
                message: 'Sorry, the note you are looking for does not exist or has been deleted.<br>Please check if the link is correct, or create a new note.',
                createNew: 'Create New Note'
            }
        },
        footer: 'WebNote - Your temporary notepad',
        langSwitch: '中文'
    }
};

function detectLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.startsWith('zh')) {
        return 'zh';
    }
    return 'en';
}

function getTranslations() {
    const savedLang = localStorage.getItem('webnote-lang');
    const lang = savedLang || detectLanguage();
    return translations[lang] || translations.en;
}

function setLanguage(lang) {
    localStorage.setItem('webnote-lang', lang);
    // 不再刷新页面，而是触发重新应用翻译
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
}

function getCurrentLanguage() {
    return localStorage.getItem('webnote-lang') || detectLanguage();
}

function t(key) {
    const translations = getTranslations();
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        } else {
            return key;
        }
    }
    
    return typeof value === 'function' ? value() : value;
}
